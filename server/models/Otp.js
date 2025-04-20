// /models/Otp.js
const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['verifyEmail', 'resetPassword'],
      required: true
    },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  });
  
  module.exports = mongoose.model('Otp', OtpSchema);