
// /models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // ✅ Profile Verification & Completion
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isAdminVerified: {
    type: Boolean,
    default: false
  },

  // ✅ Profile Fields
  profile: {
    fullName: { type: String, trim: true, required: true },
    dob: { type: Date, required: true },
    country: { type: String, trim: true, required: true },
    phoneNumber: { type: String, trim: true, required: true },

    bio: { type: String },
    profilePictureUrl: { type: String },
    idDocument: { type: String }, // optional ID document (proof)
    orgName: { type: String }, // for creators
    socialLinks: {
      website: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
    }
  },

  // ✅ Project & Platform Activity
  subscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
  ],
  createdProjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
  ],
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // includes createdAt and updatedAt
});

module.exports = mongoose.model('User', UserSchema);


// /models/User.js

// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   role: {
//     type: String,
//     enum: ['user', 'creator', 'admin'],
//     default: 'user'
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true, // ensure consistency
//     trim: true
//   },
//   passwordHash: {
//     type: String,
//     required: true
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   isProfileComplete: {
//     type: Boolean,
//     default: false
//   },
//   isAdminVerified: {
//     type: Boolean,
//     default: false
//   },
//   profile: {
//     fullName: { type: String, trim: true },
//     phone: { type: String, trim: true },
//     location: { type: String, trim: true },
//     age: { type: Number, min: 13 },
//     idDocument: { type: String }, // file link or ID
//     bio: { type: String },
//     orgName: { type: String },
//     socialLinks: [{ type: String }]
//   },
//   subscriptions: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
//   ],
//   createdProjects: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
//   ],
//   notifications: [
//     { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true // adds createdAt + updatedAt automatically
// });

// module.exports = mongoose.model('User', UserSchema);

