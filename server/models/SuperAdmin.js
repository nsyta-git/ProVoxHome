//server/models/SuperAdmin.js
// 🔵 Purpose: Only one superadmin. Full control.

// /models/SuperAdmin.js
const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // ✅ No two superadmins should have the same email
    lowercase: true, // ✅ Normalize email
    trim: true, // ✅ Remove accidental spaces
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // ✅ Automatic createdAt, updatedAt fields

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

module.exports = SuperAdmin;


// const mongoose = require('mongoose');

// const SuperAdminSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   passwordHash: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);

