const mongoose = require('mongoose');

const weddingWebsiteSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true,
    unique: true
  },
  publicUrl: {
    type: String,
    unique: true,
    required: true
  },
  template: {
    type: String,
    enum: ['classic', 'modern', 'minimalist', 'floral'],
    default: 'classic'
  },
  coupleStory: {
    type: String,
    trim: true
  },
  photoGallery: [{
    type: String // Image URLs
  }],
  eventSchedule: [{
    eventName: String,
    eventDate: Date,
    eventTime: String,
    venue: String,
    description: String
  }],
  visitCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WeddingWebsite', weddingWebsiteSchema);
