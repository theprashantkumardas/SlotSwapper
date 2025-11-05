// server/routes/swapRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getSwappableSlots,
    createSwapRequest,
    respondToSwapRequest,
    getIncomingSwapRequests,
    getOutgoingSwapRequests
} = require('../controllers/swapController');
const router = express.Router();

router.get('/swappable-slots', protect, getSwappableSlots);
router.post('/request', protect, createSwapRequest);
router.post('/response/:requestId', protect, respondToSwapRequest);
router.get('/incoming', protect, getIncomingSwapRequests);
router.get('/outgoing', protect, getOutgoingSwapRequests);

module.exports = router;