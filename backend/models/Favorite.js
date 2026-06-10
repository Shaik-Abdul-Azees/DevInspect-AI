// backend/models/Favorite.js
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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

// Ensure a user can only favorite a specific review once
favoriteSchema.index({ user: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
