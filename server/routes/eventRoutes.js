// server/routes/eventRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const router = express.Router();

router.route('/')
    .get(protect, getUserEvents)
    .post(protect, createEvent);

router.route('/:id')
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;