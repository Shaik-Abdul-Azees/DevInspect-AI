// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Joi = require('joi');

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc   Register new user
// @route  POST /api/auth/signup
// @access Public
exports.signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = value;
  try {
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const user = new User({ email, password });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token, user: { email: user.email, id: user._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = value;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user: { email: user.email, id: user._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get user profile
// @route  GET /api/auth/profile
// @access Private
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

