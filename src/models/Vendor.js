const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Please add business name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add vendor category'],
    enum: ['venue', 'caterer', 'photographer', 'decorator', 'makeup', 'dj', 'transportation', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  priceRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    }
  },
  portfolio: [{
    type: String // Image URLs
  }],
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  reviews: [{
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  availableDates: [{
    type: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search and filtering
vendorSchema.index({ category: 1, city: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
