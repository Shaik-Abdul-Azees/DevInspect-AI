// backend/models/Review.js
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bug', 'security', 'performance', 'style', 'other'],
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fix: {
    type: String,
    required: true,
  },
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allow anonymous reviews if user is not signed in
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  summary: {
    type: String,
    default: '',
  },
  issues: [issueSchema],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  error: {
    type: String,
    default: null,
  },
  codeHash: {
    type: String,
    index: true,
  },
}, { timestamps: true });

// Create compound index for fast recent queries
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
