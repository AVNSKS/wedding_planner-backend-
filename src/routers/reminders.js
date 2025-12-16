const express = require('express');
const { 
  getReminders, 
  createReminder, 
  updateReminder, 
  deleteReminder,
  getRsvpReminders, 
  sendDayBeforeReminders,
  getMyReminders 
} = require('../controllers/reminderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// CRUD routes for reminders
router.get('/', authMiddleware, getReminders);
router.post('/', authMiddleware, createReminder);
router.put('/:id', authMiddleware, updateReminder);
router.delete('/:id', authMiddleware, deleteReminder);

// Additional routes
router.get('/rsvp', authMiddleware, getRsvpReminders);
router.post('/day-before', authMiddleware, sendDayBeforeReminders);

module.exports = router;
