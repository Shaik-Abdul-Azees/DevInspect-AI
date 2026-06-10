// index.js - Entry point for Express server
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// General Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // increased to 300 for generic traffic
});

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, // 20 requests per IP for auth
  message: { message: 'Too many login attempts from this IP, please try again later.' }
});

app.use(limiter);
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Initialize DB connection
const connectDB = require('./config/db');
connectDB();

// Register auth routes (Moved up with authLimiter)

// Register review routes
app.use('/api/reviews', require('./routes/review'));

// Register favorite routes
app.use('/api/favorites', require('./routes/favorite'));

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
