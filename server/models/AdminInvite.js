// /models/AdminInvite.js to tract who craeted admins

const mongoose = require('mongoose');

const adminInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' } // Who created the invite
});

module.exports = mongoose.model('AdminInvite', adminInviteSchema);


// const mongoose = require('mongoose');

// const adminInviteSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   code: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
//   expiresAt: { type: Date, required: true }
// });

// module.exports = mongoose.model('AdminInvite', adminInviteSchema);


// const mongoose = require('mongoose');

// const adminInviteSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   code: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
//   expiresAt: { type: Date, required: true },
// }, { timestamps: true });

// module.exports = mongoose.model('AdminInvite', adminInviteSchema);


// const mongoose = require('mongoose');
// const crypto = require('crypto');

// const AdminInviteSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   inviteCode: { type: String, required: true, default: () => crypto.randomBytes(6).toString('hex') }, // auto generate
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' }, // or Admin
//   createdAt: { type: Date, default: Date.now },
//   status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
// });

// module.exports = mongoose.model('AdminInvite', AdminInviteSchema);



// const mongoose = require('mongoose');

// const AdminInviteSchema = new mongoose.Schema({
//   token: { type: String, required: true, unique: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // New Field
//   used: { type: Boolean, default: false },
//   expiresAt: { type: Date, required: true }
// });

// module.exports = mongoose.model('AdminInvite', AdminInviteSchema);





// const AdminInviteSchema = new mongoose.Schema({
//     token: { type: String, required: true, unique: true },
//     used: { type: Boolean, default: false },
//     expiresAt: { type: Date, required: true }
//   });
  
//   module.exports = mongoose.model('AdminInvite', AdminInviteSchema);
  