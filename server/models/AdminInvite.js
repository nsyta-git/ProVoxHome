// /models/AdminInvite.js
const AdminInviteSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  });
  
  module.exports = mongoose.model('AdminInvite', AdminInviteSchema);
  