// server/controllers/eventController.js
const Event = require('../models/Event');

// @desc    Get all events for the logged-in user
// @route   GET /api/events
// @access  Private
exports.getUserEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id }).sort({ startTime: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    const { title, startTime, endTime, status } = req.body;

    try {
        const newEvent = new Event({
            title,
            startTime,
            endTime,
            status: status || 'BUSY', // Default to BUSY if not provided
            user: req.user.id
        });

        const event = await newEvent.save();
        res.status(201).json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
    const { title, startTime, endTime, status } = req.body;

    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to update this event' });
        }

        event.title = title || event.title;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;
        event.status = status || event.status;

        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this event' });
        }

        await event.deleteOne(); // Use deleteOne() for Mongoose 6+
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};