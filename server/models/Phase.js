// /models/Phase.js
const PhaseSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    type: {
      type: String,
      enum: ['funding', 'polling', 'voting'],
      required: true
    },
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    eligibility: {
      minAge: Number,
      location: String,
      verifiedOnly: Boolean
    },
    poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
    vote: { type: mongoose.Schema.Types.ObjectId, ref: 'Vote' },
    fund: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund' },
    isLocked: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
  });
  
  module.exports = mongoose.model('Phase', PhaseSchema);