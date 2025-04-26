// server/models/PendingAdmin.js
//(For pending signup OTPs)

const mongoose = require('mongoose');

const pendingAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('PendingAdmin', pendingAdminSchema);



// const mongoose = require('mongoose');

// const pendingAdminSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // Already hashed
//   otp: { type: String, required: true },
//   otpExpiresAt: { type: Date, required: true }
// });

// module.exports = mongoose.model('PendingAdmin', pendingAdminSchema);
