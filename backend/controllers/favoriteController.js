// backend/controllers/favoriteController.js
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const mongoose = require('mongoose');

/**
 * @desc   Toggle favorite status for a specific review
 * @route  POST /api/favorites/:id
 * @access Private
 */
exports.toggleFavorite = async (req, res) => {
  const reviewId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ message: 'Invalid review ID format.' });
  }

  try {
    // 1. Verify review existence
    const reviewExists = await Review.findById(reviewId);
    if (!reviewExists) {
      return res.status(404).json({ message: 'Review record not found.' });
    }

    // 2. Query existing favorite document
    const existingFav = await Favorite.findOne({
      user: req.user._id,
      review: reviewId
    });

    if (existingFav) {
      // Unfavorite
      await Favorite.deleteOne({ _id: existingFav._id });
      return res.json({ favorited: false, message: 'Review removed from favorites.' });
    } else {
      // Favorite
      const newFav = new Favorite({
        user: req.user._id,
        review: reviewId
      });
      await newFav.save();
      return res.status(201).json({ favorited: true, message: 'Review added to favorites.' });
    }

  } catch (err) {
    console.error('❌ Toggle Favorite Error:', err);
    return res.status(500).json({ message: 'Failed to update favorite status.' });
  }
};

/**
 * @desc   Retrieve all favorited reviews for the authenticated user
 * @route  GET /api/favorites
 * @access Private
 */
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('review')
      .sort({ createdAt: -1 });

    // Filter out entries where review is missing (deleted)
    const validReviews = favorites
      .filter(fav => fav.review !== null)
      .map(fav => fav.review);

    return res.json(validReviews);
  } catch (err) {
    console.error('❌ Get Favorites Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve favorite reviews.' });
  }
};
