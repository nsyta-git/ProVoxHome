// /server/models/ProfileUpdateRequest.js
const mongoose = require('mongoose');

const ProfileUpdateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  fields: { type: Object, required: true },
  
  // NEW FIELDS
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'modification_requested'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileUpdateRequest', ProfileUpdateRequestSchema);














// const profileUpdateRequestSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true },
//   role: { type: String, enum: ['user', 'creator', 'admin', 'superadmin'], required: true },
//   otp: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
//   attempts: { type: Number, default: 0 },
//   lockedUntil: { type: Date },
// }, { timestamps: true });

// module.exports = mongoose.model('ProfileUpdateRequest', profileUpdateRequestSchema);
