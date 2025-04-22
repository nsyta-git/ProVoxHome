// /models/Achievement.js
const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  icon: String, // Optional for badge icon
  dateAwarded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
