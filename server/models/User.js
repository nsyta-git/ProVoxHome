// /models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // ensure consistency
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isAdminVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    age: { type: Number, min: 13 },
    idDocument: { type: String }, // file link or ID
    bio: { type: String },
    orgName: { type: String },
    socialLinks: [{ type: String }]
  },
  subscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
  ],
  createdProjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
  ],
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt + updatedAt automatically
});

module.exports = mongoose.model('User', UserSchema);

