const express = require('express');
const {
  addEvent,
  getMyEvents,
  getEventsByWeddingId,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/wedding/:weddingId', getEventsByWeddingId);

// Protected routes
router.post('/', authMiddleware, addEvent);
router.get('/', authMiddleware, getMyEvents);
router.get('/:id', authMiddleware, getEventById);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
