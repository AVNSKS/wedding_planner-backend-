const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const guestSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add guest name'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['family', 'friends', 'colleagues', 'other'],
    default: 'other'
  },
  plusOneAllowed: {
    type: Boolean,
    default: false
  },
  rsvpToken: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'maybe'],
    default: 'pending'
  },
  attendeesCount: {
    type: Number,
    default: 1,
    min: 0
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'non-vegetarian', 'gluten-free', 'halal', 'kosher', 'allergies']
  }],
  allergies: {
    type: String,
    trim: true
  },
  customResponses: {
    type: String,
    trim: true
  },
  respondedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster RSVP token lookup (removed duplicate - unique: true already creates an index)
// guestSchema.index({ rsvpToken: 1 });

module.exports = mongoose.model('Guest', guestSchema);
