// /models/Poll.js
const PollSchema = new mongoose.Schema({
    question: String,
    options: [String],
    responses: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      selectedOptionIndex: Number
    }]
  });

  module.exports = mongoose.model('Poll', PollSchema);