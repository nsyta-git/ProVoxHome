// /models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  permissions: [{
    type: String,
    enum: ['verify_users', 'verify_creators', 'manage_projects', 'system_logs', 'invite_admins']
  }],
  isSuperAdmin: { type: Boolean, default: false }, // For high-level control
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);
