const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming your auth middleware path
const {
  createReminder,
  getMyReminders,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');

router.route('/')
  .post(protect, createReminder)
  .get(protect, getMyReminders);

router.route('/:id')
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

module.exports = router;