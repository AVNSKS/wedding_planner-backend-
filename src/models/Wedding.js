const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
  couple: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brideName: {
    type: String,
    required: [true, 'Please add bride name'],
    trim: true
  },
  groomName: {
    type: String,
    required: [true, 'Please add groom name'],
    trim: true
  },
  weddingDate: {
    type: Date,
    required: [true, 'Please add wedding date']
  },
  venue: {
    type: String,
    trim: true
  },
  venueAddress: {  // NEW
    type: String,
    trim: true
  },
  venueLatitude: {  // NEW
    type: Number
  },
  venueLongitude: {  // NEW
    type: Number
  },
  googleMapsLink: {  // NEW
    type: String
  },
  city: {
    type: String,
    trim: true
  },
  totalBudget: {
    type: Number,
    default: 0
  },
  theme: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  hashtag: {  // NEW - Wedding hashtag
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for countdown days
weddingSchema.virtual('daysUntilWedding').get(function() {
  // Ensure weddingDate exists before attempting to create a Date object
  if (!this.weddingDate) {
    return null; // Or 0, depending on desired behavior for missing dates
  }
  const today = new Date();
  const wedding = new Date(this.weddingDate);
  // Check if the created wedding date is valid
  if (isNaN(wedding.getTime())) {
    return null; // Or 0, if the date is invalid
  }
  const diffTime = wedding - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Auto-generate Google Maps link before saving
// weddingSchema.pre('save', async function(next) {
//   if (this.venueLatitude && this.venueLongitude) {
//     this.googleMapsLink = `https://www.google.com/maps?q=${this.venueLatitude},${this.venueLongitude}`;
//   }
//   return next();
// });

module.exports = mongoose.model('Wedding', weddingSchema);
