// /models/Vote.js
const VoteSchema = new mongoose.Schema({
    options: [String],
    votes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      selectedOptionIndex: Number
    }],
    allocationFormula: String
  });
  
  module.exports = mongoose.model('Vote', VoteSchema);