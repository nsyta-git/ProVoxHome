// server/models/LockedProfile.js

const mongoose = require('mongoose');

const lockedProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  lockedUntil: { type: Date, required: true },
  reason: { type: String, default: 'Suspicious activity during OTP verification.' }
}, { timestamps: true });

module.exports = mongoose.model('LockedProfile', lockedProfileSchema);
