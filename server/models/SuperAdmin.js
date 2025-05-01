//server/models/SuperAdmin.js
// 🔵 Purpose: Only one superadmin. Full control.

// /models/SuperAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SuperAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // ✅ Profile Fields (optional for SuperAdmin)
  fullName: { type: String },
  dob: { type: Date },
  country: { type: String },
  phoneNumber: { type: String },

  bio: { type: String },
  profilePictureUrl: { type: String },
  socialLinks: {
    website: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    github: { type: String },
  }
}, {
  timestamps: true
});

// 🔐 Hash password before saving
SuperAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare passwords
SuperAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);


// /models/SuperAdmin.js

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const SuperAdminSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },

//   // ✅ Profile fields (no approval required for SuperAdmin)
//   fullName: { type: String, required: true },
//   dob: { type: Date, required: true },
//   country: { type: String, required: true },
//   phoneNumber: { type: String, required: true },

//   bio: { type: String },
//   profilePictureUrl: { type: String },
//   socialLinks: {
//     website: { type: String },
//     twitter: { type: String },
//     linkedin: { type: String },
//     github: { type: String },
//   },
// }, {
//   timestamps: true
// });

// // 🔐 Hash password before saving
// SuperAdminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // 🔐 Compare passwords
// SuperAdminSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

// module.exports = SuperAdmin;


// // /models/SuperAdmin.js
// const mongoose = require('mongoose');

// const SuperAdminSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true, // ✅ No two superadmins should have the same email
//     lowercase: true, // ✅ Normalize email
//     trim: true, // ✅ Remove accidental spaces
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// }, { timestamps: true }); // ✅ Automatic createdAt, updatedAt fields

// const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

// module.exports = SuperAdmin;


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

