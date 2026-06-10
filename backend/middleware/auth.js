// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header as Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header ("Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding password hash)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User associated with this token no longer exists' });
      }

      next();
    } catch (err) {
      console.error('Authentication Error:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      console.warn('Optional Authentication Warning:', err.message);
      // Fail silently for optional auth, just continue as anonymous user
    }
  }
  next();
};

module.exports = { protect, optionalProtect };
