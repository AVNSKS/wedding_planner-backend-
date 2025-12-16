const Task = require('../models/Task');
const Wedding = require('../models/Wedding');
const { getUserWedding } = require('../utils/weddingHelpers');

// @desc    Add task
// @route   POST /api/tasks
// @access  Private (Couple)
exports.addTask = async (req, res) => {
  try {
    const { title, description, dueDate, category, weddingId } = req.body;

    const wedding = await getUserWedding(req.user.id, weddingId);
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'Please create a wedding first' });
    }

    const task = await Task.create({
      wedding: wedding._id,
      title,
      description,
      dueDate,
      category
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks for my wedding
// @route   GET /api/tasks?weddingId=xxx
// @access  Private (Couple)
exports.getMyTasks = async (req, res) => {
  try {
    const { weddingId } = req.query;
    const wedding = await getUserWedding(req.user.id, weddingId);
    if (!wedding) {
      return res.status(404).json({ success: false, message: 'No wedding found' });
    }

    const tasks = await Task.find({ wedding: wedding._id }).sort({ dueDate: 1, createdAt: 1 });

    const summary = {
      total: tasks.length,
      completed: tasks.filter(t => t.isCompleted).length,
      pending: tasks.filter(t => !t.isCompleted).length
    };

    res.status(200).json({ success: true, summary, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task (including mark complete)
// @route   PUT /api/tasks/:id
// @access  Private (Couple)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate('wedding');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If changing completion status, update completedAt
    if (req.body.isCompleted !== undefined) {
      req.body.completedAt = req.body.isCompleted ? new Date() : null;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Couple)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('wedding');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.wedding.couple.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
