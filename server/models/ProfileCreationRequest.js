// sever/models/ProfileCreationRequest.js
const mongoose = require('mongoose');

const ProfileCreationRequestSchema = new mongoose.Schema({
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

module.exports = mongoose.model('ProfileCreationRequest', ProfileCreationRequestSchema);

