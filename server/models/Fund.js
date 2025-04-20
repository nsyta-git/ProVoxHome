// /models/Fund.js
const FundSchema = new mongoose.Schema({
    goal: Number,
    totalReceived: { type: Number, default: 0 },
    donations: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: Number,
      date: { type: Date, default: Date.now }
    }]
  });
  
  module.exports = mongoose.model('Fund', FundSchema);
  