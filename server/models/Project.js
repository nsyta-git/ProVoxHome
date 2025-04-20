// /models/Project.js
const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    tags: [String],
    media: [String],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phase' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    achievements: [String],
    createdAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Project', ProjectSchema);

  