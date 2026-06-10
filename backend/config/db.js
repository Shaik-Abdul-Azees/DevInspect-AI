// config/db.js - MongoDB connection helper
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('⚠️ MongoDB connection error:', err.message);
    console.warn('⚠️ Warning: MongoDB is offline or misconfigured. Auth endpoints will fail, but Express is running.');
  }
};

module.exports = connectDB;
