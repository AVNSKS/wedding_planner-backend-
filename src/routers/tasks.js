const express = require('express');
const {
  addTask,
  getMyTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addTask);
router.get('/', getMyTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
