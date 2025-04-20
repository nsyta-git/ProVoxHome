// /models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isAdminVerified: { type: Boolean, default: false },
  profile: {
    fullName: String,
    phone: String,
    location: String,
    age: Number,
    idDocument: String,
    bio: String,
    orgName: String,
    socialLinks: [String]
  },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  createdProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
