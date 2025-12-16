const express = require('express');
const {
  createBooking,
  getMyBookings,
  getVendorBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  updatePayment,
  deleteBooking,
  syncBookingsToBudget
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', createBooking);
router.post('/sync-budget', syncBookingsToBudget);
router.get('/my-bookings', getMyBookings);
router.get('/vendor-bookings', getVendorBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/payment', updatePayment);
router.delete('/:id', deleteBooking);

module.exports = router;
