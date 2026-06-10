// backend/models/ReviewHistory.js
const mongoose = require('mongoose');

const reviewHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
}, { timestamps: true });

// Compound index to optimize getting user history sorted by newest
reviewHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ReviewHistory', reviewHistorySchema);
