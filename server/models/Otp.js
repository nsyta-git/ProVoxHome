// /models/Otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['verifyEmail', 'resetPassword'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL: auto-delete after 10 mins
  }
});

module.exports = mongoose.model('Otp', OtpSchema);
