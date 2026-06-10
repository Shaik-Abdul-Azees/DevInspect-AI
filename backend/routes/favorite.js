// backend/routes/favorite.js
const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

// All favorite routes require authenticated session
router.post('/:id', protect, toggleFavorite);
router.get('/', protect, getFavorites);

module.exports = router;
