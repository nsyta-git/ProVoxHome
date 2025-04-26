// /models/Admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);




// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const adminSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// }, { timestamps: true });

// // Encrypt password before saving
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare password
// adminSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('Admin', adminSchema);



// const mongoose = require('mongoose');

// const AdminSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
//   permissions: [{
//     type: String,
//     enum: ['verify_users', 'verify_creators', 'manage_projects', 'system_logs', 'invite_admins']
//   }],
//   isSuperAdmin: { type: Boolean, default: false }, // Controlled at creation
//   addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   addedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Admin', AdminSchema);
















// // /models/Admin.js
// const mongoose = require('mongoose');

// const AdminSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
//   permissions: [{
//     type: String,
//     enum: ['verify_users', 'verify_creators', 'manage_projects', 'system_logs', 'invite_admins']
//   }],
//   isSuperAdmin: { type: Boolean, default: false }, // For high-level control
//   addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   addedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Admin', AdminSchema);
