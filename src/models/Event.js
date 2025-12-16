const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  eventName: {
    type: String,
    required: [true, 'Please add event name'],
    enum: ['sangeet', 'mehendi', 'haldi', 'engagement', 'wedding', 'reception', 'other'],
    default: 'wedding'
  },
  customEventName: {
    type: String,
    trim: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Please add event date']
  },
  eventTime: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  venueAddress: {
    type: String,
    trim: true
  },
  venueLatitude: {
    type: Number
  },
  venueLongitude: {
    type: Number
  },
  googleMapsLink: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  dresscode: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove pre-save hook for now

module.exports = mongoose.model('Event', eventSchema);
