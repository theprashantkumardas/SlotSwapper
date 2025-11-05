// server/models/SwapRequest.js
const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
    requester: { // User who initiated the swap
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterSlot: { // Slot offered by the requester
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    responder: { // User who owns the desired slot
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responderSlot: { // Slot desired by the requester (owned by responder)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);