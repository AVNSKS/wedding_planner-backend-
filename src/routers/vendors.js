const express = require('express');
const {
  createVendorProfile,
  getAllVendors,
  getVendorById,
  getMyVendorProfile,
  updateVendorProfile,
  deleteVendorProfile,
  addReview
} = require('../controllers/vendorController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllVendors);

// Protected routes - specific routes must come before parameterized routes
router.post('/', authMiddleware, createVendorProfile);
router.get('/my/profile', authMiddleware, getMyVendorProfile);

// Parameterized route must be last
router.get('/:id', getVendorById);
router.put('/:id', authMiddleware, updateVendorProfile);
router.delete('/:id', authMiddleware, deleteVendorProfile);
router.post('/:id/review', authMiddleware, addReview);

module.exports = router;
