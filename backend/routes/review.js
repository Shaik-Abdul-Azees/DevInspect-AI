// backend/routes/review.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createReview, getHistory, getReviewById, deleteReview, chatWithReview, streamChatWithReview, importGithubFile } = require('../controllers/reviewController');
const { protect, optionalProtect } = require('../middleware/auth');

// Heavy API endpoint rate limiter (30 requests per hour per IP)
const reviewRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per hour
  message: {
    message: 'Too many code analysis requests from this IP. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route  POST /api/reviews/import-github
// @desc   Fetch source code from public GitHub URL
router.post('/import-github', importGithubFile);

// @route  POST /api/reviews
// @desc   Submit a code snippet for review (authenticated or anonymous)
router.post('/', reviewRateLimiter, optionalProtect, createReview);

// @route  GET /api/reviews
// @desc   Retrieve authenticated user's review history
router.get('/', protect, getHistory);

// @route  DELETE /api/reviews/:id
// @desc   Delete a review from user history
router.delete('/:id', protect, deleteReview);

// @route  GET /api/reviews/:id
// @desc   Retrieve details of a single review
router.get('/:id', getReviewById);

// @route  POST /api/reviews/:id/chat
// @desc   Interact with AI context about review findings
router.post('/:id/chat', chatWithReview);

// @route  GET /api/reviews/:id/chat/stream
// @desc   Stream AI chat response via SSE
router.get('/:id/chat/stream', streamChatWithReview);

module.exports = router;
