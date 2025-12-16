const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the reminder'],
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Please add a date and time for the reminder']
  },
  type: {
    type: String,
    enum: ['task', 'payment', 'event', 'custom'],
    default: 'custom'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);