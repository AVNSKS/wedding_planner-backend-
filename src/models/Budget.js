const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  wedding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wedding',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add budget category'],
    enum: ['venue', 'catering', 'photography', 'decoration', 'makeup', 'entertainment', 'transportation', 'invitations', 'favors', 'other']
  },
  estimatedCost: {
    type: Number,
    required: [true, 'Please add estimated cost'],
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  notes: {
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

// Virtual for variance percentage
budgetSchema.virtual('variancePercentage').get(function() {
  if (this.estimatedCost === 0) return 0;
  return ((this.actualCost - this.estimatedCost) / this.estimatedCost) * 100;
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
