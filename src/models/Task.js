const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add task title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['6-months-before', '3-months-before', '1-month-before', '1-week-before', 'wedding-day', 'custom'],
    default: 'custom'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
