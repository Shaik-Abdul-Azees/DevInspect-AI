// backend/controllers/reviewController.js
const mongoose = require('mongoose');
const Joi = require('joi');
const Review = require('../models/Review');
const ReviewHistory = require('../models/ReviewHistory');
const Favorite = require('../models/Favorite');
const aiService = require('../services/aiService');

// Request body validation schemas
const reviewSubmitSchema = Joi.object({
  code: Joi.string().min(1).max(50000).required().messages({
    'string.empty': 'Code content cannot be empty.',
    'string.max': 'Code block exceeds maximum allowed limit of 50KB.',
    'any.required': 'Code content is required.'
  }),
  language: Joi.string().min(1).max(50).trim().required().messages({
    'string.empty': 'Language cannot be empty.',
    'any.required': 'Programming language is required.'
  })
});

/**
 * @desc   Submit code for AI analysis
 * @route  POST /api/reviews
 * @access Public (with optional authentication)
 */
exports.createReview = async (req, res) => {
  // Validate request body
  const { error, value } = reviewSubmitSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { code, language } = value;
  const userId = req.user ? req.user._id : null;

  try {
    // 1. Run the AI code analysis
    const analysis = await aiService.analyzeCode(code, language);

    // 2. Save the review results to MongoDB
    const review = new Review({
      user: userId,
      code,
      language,
      score: analysis.score,
      summary: analysis.summary,
      issues: analysis.issues,
      status: 'completed'
    });

    const savedReview = await review.save();

    // 3. If authenticated user, log in their ReviewHistory
    if (userId) {
      const historyItem = new ReviewHistory({
        user: userId,
        review: savedReview._id
      });
      await historyItem.save();
    }

    return res.status(201).json(savedReview);

  } catch (err) {
    console.error('❌ Code Review Controller Error:', err);

    // Attempt to save a failed review log in DB
    try {
      const failedReview = new Review({
        user: userId,
        code,
        language,
        score: 0,
        summary: 'Code analysis failed.',
        issues: [],
        status: 'failed',
        error: err.message || 'Unknown analysis error'
      });
      await failedReview.save();
    } catch (dbErr) {
      console.error('❌ Failed to log error in DB:', dbErr.message);
    }

    return res.status(500).json({ 
      message: 'Code analysis failed. Please try again later.',
      error: err.message
    });
  }
};

/**
 * @desc   Get authenticated user's review history
 * @route  GET /api/reviews
 * @access Private (authenticated only)
 */
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch history using lean() for better memory performance
    const history = await ReviewHistory.find({ user: req.user._id })
      .populate('review')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ReviewHistory.countDocuments({ user: req.user._id });

    // Filter out items where the referenced review might have been deleted
    const filteredHistory = history
      .filter(item => item.review !== null)
      .map(item => item.review);

    return res.json({
      reviews: filteredHistory,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error('❌ Get History Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve review history.' });
  }
};

/**
 * @desc   Delete a review owned by the authenticated user
 * @route  DELETE /api/reviews/:id
 * @access Private
 */
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format.' });
  }

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const ownsReview =
      (review.user && review.user.toString() === req.user._id.toString()) ||
      (await ReviewHistory.exists({ user: req.user._id, review: id }));

    if (!ownsReview) {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    await ReviewHistory.deleteMany({ review: id });
    await Favorite.deleteMany({ review: id });
    await Review.findByIdAndDelete(id);

    return res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('❌ Delete Review Error:', err);
    return res.status(500).json({ message: 'Failed to delete review.' });
  }
};

/**
 * @desc   Get specific review details by ID
 * @route  GET /api/reviews/:id
 * @access Public
 */
exports.getReviewById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format.' });
  }

  try {
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    return res.json(review);
  } catch (err) {
    console.error('❌ Get Review Details Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve review details.' });
  }
};

/**
 * @desc   Chat about a specific code review with AI
 * @route  POST /api/reviews/:id/chat
 * @access Public
 */
exports.chatWithReview = async (req, res) => {
  const { id } = req.params;
  const { message, chatHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Query message is required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format.' });
  }

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review record not found.' });
    }

    const chatResponse = await aiService.chatAboutReview(
      review.code,
      review.language,
      review.summary,
      review.issues,
      chatHistory || [],
      message
    );

    return res.json(chatResponse);

  } catch (err) {
    console.error('❌ Chat with Review Error:', err);
    return res.status(500).json({ message: 'Failed to process AI chat query.' });
  }
};

/**
 * @desc   Proxy fetch code from public GitHub URL
 * @route  POST /api/reviews/import-github
 * @access Public
 */
exports.importGithubFile = async (req, res) => {
  const { githubUrl } = req.body;
  const axios = require('axios');

  if (!githubUrl || !githubUrl.trim()) {
    return res.status(400).json({ message: 'GitHub URL parameter is required.' });
  }

  try {
    // Expected: https://github.com/:user/:repo/blob/:branch/:filepath
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
    if (!match) {
      return res.status(400).json({ 
        message: 'Invalid GitHub file path URL. Format should be: https://github.com/:user/:repo/blob/:branch/:path' 
      });
    }

    const [_, user, repo, branch, filepath] = match;
    const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filepath}`;

    const response = await axios.get(rawUrl);
    return res.json({ code: response.data });

  } catch (err) {
    console.error('❌ GitHub Import Proxy Error:', err.message);
    return res.status(500).json({ 
      message: 'Failed to fetch public file. Verify your repository settings or URL spelling.' 
    });
  }
};

/**
 * @desc   Stream AI chat response about a review via Server-Sent Events
 * @route  GET /api/reviews/:id/chat/stream?message=...
 * @access Public
 */
exports.streamChatWithReview = async (req, res) => {
  const { id } = req.params;
  const { message, chatHistory: chatHistoryRaw } = req.query;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Query message is required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format.' });
  }

  try {
    const review = await Review.findById(id).lean();
    if (!review) {
      return res.status(404).json({ message: 'Review record not found.' });
    }

    // Parse chat history from query string (sent as JSON string)
    let chatHistory = [];
    if (chatHistoryRaw) {
      try {
        chatHistory = JSON.parse(chatHistoryRaw);
      } catch (e) {
        chatHistory = [];
      }
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Handle client disconnect
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
    });

    await aiService.streamChatAboutReview(
      {
        code: review.code,
        language: review.language,
        summary: review.summary,
        issues: review.issues,
        chatHistory,
        userMessage: message,
      },
      (chunk) => {
        if (!clientDisconnected) {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      }
    );

    // Signal stream end
    if (!clientDisconnected) {
      res.write('data: [DONE]\n\n');
      res.end();
    }

  } catch (err) {
    console.error('❌ Stream Chat Error:', err);
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to process AI chat stream.' });
    }
    res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
    res.end();
  }
};
