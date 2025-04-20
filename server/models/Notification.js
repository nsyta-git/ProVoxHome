// /models/Notification.js
const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    type: { type: String, enum: ['project', 'system', 'admin'], default: 'project' },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Notification', NotificationSchema);
  