// server/controllers/swapController.js
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const mongoose = require('mongoose');

// @desc    Get all swappable slots from other users
// @route   GET /api/swaps/swappable-slots
// @access  Private
exports.getSwappableSlots = async (req, res) => {
    try {
        const swappableSlots = await Event.find({
            user: { $ne: req.user.id }, // Not the logged-in user's slots
            status: 'SWAPPABLE'
        }).populate('user', 'name email'); // Populate user details for display

        res.json(swappableSlots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new swap request
// @route   POST /api/swaps/request
// @access  Private
exports.createSwapRequest = async (req, res) => {
    const { mySlotId, theirSlotId } = req.body; // mySlotId is the requester's slot, theirSlotId is the desired slot

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const mySlot = await Event.findById(mySlotId).session(session);
        const theirSlot = await Event.findById(theirSlotId).session(session);

        if (!mySlot || !theirSlot) {
            throw new Error('One or both slots not found.');
        }

        // Verify ownership for mySlot
        if (mySlot.user.toString() !== req.user.id) {
            throw new Error('You do not own the slot you are offering.');
        }
        // Verify theirSlot belongs to a different user
        if (theirSlot.user.toString() === req.user.id) {
            throw new Error('You cannot swap with your own slot.');
        }

        // Check if both slots are actually SWAPPABLE
        if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
            throw new Error('One or both slots are not currently swappable.');
        }

        // Check for existing pending swap requests involving these slots
        const existingSwap = await SwapRequest.findOne({
            $or: [
                { requesterSlot: mySlotId, responderSlot: theirSlotId, status: 'PENDING' },
                { requesterSlot: theirSlotId, responderSlot: mySlotId, status: 'PENDING' },
                { requesterSlot: mySlotId, status: 'PENDING' }, // mySlot already offered
                { responderSlot: mySlotId, status: 'PENDING' }, // mySlot already requested
                { requesterSlot: theirSlotId, status: 'PENDING' }, // theirSlot already offered
                { responderSlot: theirSlotId, status: 'PENDING' }, // theirSlot already requested
            ]
        }).session(session);

        if (existingSwap) {
            throw new Error('A pending swap request involving these slots already exists.');
        }

        // Create the swap request
        const newSwapRequest = new SwapRequest({
            requester: req.user.id,
            requesterSlot: mySlotId,
            responder: theirSlot.user,
            responderSlot: theirSlotId,
            status: 'PENDING'
        });

        await newSwapRequest.save({ session });

        // Update slot statuses to SWAP_PENDING
        mySlot.status = 'SWAP_PENDING';
        theirSlot.status = 'SWAP_PENDING';
        await mySlot.save({ session });
        await theirSlot.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ msg: 'Swap request created successfully', swapRequest: newSwapRequest });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Failed to create swap request' });
    }
};

// @desc    Respond to an incoming swap request (accept/reject)
// @route   POST /api/swaps/response/:requestId
// @access  Private
exports.respondToSwapRequest = async (req, res) => {
    const { requestId } = req.params;
    const { accept } = req.body; // boolean: true for accept, false for reject

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const swapRequest = await SwapRequest.findById(requestId).session(session);

        if (!swapRequest) {
            throw new Error('Swap request not found.');
        }

        // Ensure the logged-in user is the responder for this request
        if (swapRequest.responder.toString() !== req.user.id) {
            throw new Error('Not authorized to respond to this request.');
        }

        // Ensure request is still pending
        if (swapRequest.status !== 'PENDING') {
            throw new Error('This swap request is no longer pending.');
        }

        const requesterSlot = await Event.findById(swapRequest.requesterSlot).session(session);
        const responderSlot = await Event.findById(swapRequest.responderSlot).session(session);

        if (!requesterSlot || !responderSlot) {
            throw new Error('Associated slots not found. They might have been deleted.');
        }

        if (accept) {
            // ACCEPTED logic
            swapRequest.status = 'ACCEPTED';

            // Swap ownership (userId)
            const tempOwner = requesterSlot.user;
            requesterSlot.user = responderSlot.user;
            responderSlot.user = tempOwner;

            // Set both slots' status back to BUSY
            requesterSlot.status = 'BUSY';
            responderSlot.status = 'BUSY';

            await requesterSlot.save({ session });
            await responderSlot.save({ session });
            await swapRequest.save({ session });

            // Find any other pending swap requests involving these two slots and mark them rejected
            await SwapRequest.updateMany(
                {
                    _id: { $ne: requestId }, // Exclude the current request
                    status: 'PENDING',
                    $or: [
                        { requesterSlot: requesterSlot._id },
                        { responderSlot: requesterSlot._id },
                        { requesterSlot: responderSlot._id },
                        { responderSlot: responderSlot._id },
                    ]
                },
                { $set: { status: 'REJECTED' } },
                { session }
            );

            // Set any other slots involved in previously pending requests (now rejected) back to swappable
            // This is complex, better to handle this in a separate cleanup or make the frontend refetch.
            // For now, we'll assume the frontend will re-query for active 'SWAPPABLE' slots.
            // If a slot was SWAP_PENDING but the request was rejected, it should go back to SWAPPABLE.
            // We can add logic here to fetch the affected slots and update their status.
            await Event.updateMany(
                {
                    _id: { $in: [requesterSlot._id, responderSlot._id] },
                    status: 'SWAP_PENDING' // Only if they are still pending due to another request
                },
                { $set: { status: 'BUSY' } }, // If accepted, they become BUSY
                { session }
            );


        } else {
            // REJECTED logic
            swapRequest.status = 'REJECTED';
            await swapRequest.save({ session });

            // Set original slots back to SWAPPABLE (only if they were SWAP_PENDING due to this request)
            // This requires careful consideration if multiple swap requests could involve the same slot.
            // For simplicity, we'll set them back to SWAPPABLE if their current status is SWAP_PENDING
            // and no other PENDING requests involve them. This is a potential edge case that needs robust handling.
            // For now, a simpler approach:
            if (requesterSlot.status === 'SWAP_PENDING') {
                 // Check if there are other PENDING requests involving this slot
                const otherPendingRequests = await SwapRequest.countDocuments({
                    _id: { $ne: requestId },
                    status: 'PENDING',
                    $or: [{ requesterSlot: requesterSlot._id }, { responderSlot: requesterSlot._id }]
                }).session(session);

                if (otherPendingRequests === 0) {
                     requesterSlot.status = 'SWAPPABLE';
                     await requesterSlot.save({ session });
                }
            }

            if (responderSlot.status === 'SWAP_PENDING') {
                const otherPendingRequests = await SwapRequest.countDocuments({
                    _id: { $ne: requestId },
                    status: 'PENDING',
                    $or: [{ requesterSlot: responderSlot._id }, { responderSlot: responderSlot._id }]
                }).session(session);

                if (otherPendingRequests === 0) {
                    responderSlot.status = 'SWAPPABLE';
                    await responderSlot.save({ session });
                }
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: `Swap request ${accept ? 'accepted' : 'rejected'} successfully`, swapRequest });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Failed to respond to swap request' });
    }
};

// @desc    Get all incoming swap requests for the logged-in user
// @route   GET /api/swaps/incoming
// @access  Private
exports.getIncomingSwapRequests = async (req, res) => {
    try {
        const incomingRequests = await SwapRequest.find({ responder: req.user.id })
            .populate('requester', 'name email')
            .populate('requesterSlot', 'title startTime endTime')
            .populate('responderSlot', 'title startTime endTime')
            .sort({ createdAt: -1 });
        res.json(incomingRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all outgoing swap requests from the logged-in user
// @route   GET /api/swaps/outgoing
// @access  Private
exports.getOutgoingSwapRequests = async (req, res) => {
    try {
        const outgoingRequests = await SwapRequest.find({ requester: req.user.id })
            .populate('responder', 'name email')
            .populate('requesterSlot', 'title startTime endTime')
            .populate('responderSlot', 'title startTime endTime')
            .sort({ createdAt: -1 });
        res.json(outgoingRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};