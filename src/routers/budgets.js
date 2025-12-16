const express = require('express');
const {
  addBudget,
  getMyBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetAlerts
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', addBudget);
router.get('/', getMyBudgets);
router.get('/alerts', getBudgetAlerts);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
