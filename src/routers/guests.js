const express = require('express');
const {
  addGuest,
  getMyGuests,
  updateGuest,
  deleteGuest,
  getGuestByToken,
  submitRSVP,
  sendInvitations
} = require('../controllers/guestController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protected routes (Couple only)
router.post('/', authMiddleware, addGuest);
router.get('/', authMiddleware, getMyGuests);
router.put('/:id', authMiddleware, updateGuest);
router.delete('/:id', authMiddleware, deleteGuest);
router.post('/send-invitations', authMiddleware, sendInvitations);

// Public routes (No auth needed)
router.get('/rsvp/:token', getGuestByToken);
router.post('/rsvp/:token', submitRSVP);

module.exports = router;
