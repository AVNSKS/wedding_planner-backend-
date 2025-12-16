const express = require('express');
const {
  createWedding,
  getAllMyWeddings,
  getMyWedding,
  getWeddingById,
  updateWedding,
  deleteWedding
} = require('../controllers/weddingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Specific routes MUST come before parametric routes
router.post('/', createWedding);
router.get('/all', getAllMyWeddings); // New endpoint for all weddings
router.get('/my-wedding', getMyWedding); // Backward compatibility

// Parametric routes should come last
router.get('/:id', getWeddingById);
router.put('/:id', updateWedding);
router.delete('/:id', deleteWedding);

module.exports = router;
