// server/routes/admin.js
// 🔵 Full Admin Routes: Invite Admin ➔ Signup ➔ Send OTP ➔ Verify OTP ➔ Create Admin

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminInvite = require('../models/AdminInvite');
const PendingAdmin = require('../models/PendingAdmin');
const Admin = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');
const { isSuperOrAdmin } = require('../middleware/auth');

// --- Invite a New Admin (Protected Route) ---
router.post('/invite', isSuperOrAdmin, async (req, res) => {
  const { email } = req.body;
  const creatorId = req.user.id;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const existingInvite = await AdminInvite.findOne({ email });
    if (existingInvite) {
      return res.status(400).json({ message: 'Admin invite already exists.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newInvite = new AdminInvite({
      email,
      code: inviteCode,
      expiresAt,
      createdBy: creatorId
    });

    await newInvite.save();

    const subject = 'ProVoxHome Admin Invitation';
    const htmlContent = `
      <h2>You're Invited to Become an Admin</h2>
      <p>Use the following invitation code during signup: <b>${inviteCode}</b></p>
      <p>This code expires in 24 hours.</p>
    `;

    await sendEmail(email, subject, htmlContent);

    res.status(200).json({ message: 'Admin invite sent successfully.' });
  } catch (error) {
    console.error('Invite Admin Error:', error);
    res.status(500).json({ message: 'Server error during invite.' });
  }
});

// --- Admin Signup: Request OTP ---
router.post('/signup', async (req, res) => {
  const { email, password, inviteToken } = req.body;

  try {
    if (!email || !password || !inviteToken) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const invite = await AdminInvite.findOne({ email, code: inviteToken });
    if (!invite) {
      return res.status(400).json({ message: 'Invalid invitation.' });
    }

    if (invite.expiresAt < new Date()) {
      await AdminInvite.deleteOne({ _id: invite._id });
      return res.status(400).json({ message: 'Invitation expired.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PendingAdmin.deleteOne({ email });

    const pendingAdmin = new PendingAdmin({
      email,
      password,
      otp,
      otpExpiresAt
    });

    await pendingAdmin.save();

    const subject = 'ProVoxHome Admin OTP Verification';
    const htmlContent = `
      <h2>Verify Your Admin Signup</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    await sendEmail(email, subject, htmlContent);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// --- Admin Verify OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const pendingAdmin = await PendingAdmin.findOne({ email, otp });
    if (!pendingAdmin) {
      return res.status(400).json({ message: 'Invalid OTP or email.' });
    }

    if (pendingAdmin.otpExpiresAt < new Date()) {
      await PendingAdmin.deleteOne({ _id: pendingAdmin._id });
      return res.status(400).json({ message: 'OTP expired. Please signup again.' });
    }

    const finalAdmin = new Admin({
      email: pendingAdmin.email,
      password: pendingAdmin.password
    });

    await finalAdmin.save();
    await PendingAdmin.deleteOne({ _id: pendingAdmin._id });
    await AdminInvite.deleteOne({ email: pendingAdmin.email });

    res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
});

// --- Admin Login ---


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // Token valid for 7 days
    );

    res.status(200).json({ token, message: 'Login successful.' });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});


module.exports = router;


// // server/routes/admin.js
// //🔵 Purpose: SuperAdmin OR Admins can invite new admins. Max 5 per normal admin.
// // Admin Invite, Signup,Login

// // (Signup ➔ Send OTP ➔ Verify OTP ➔ Create Admin)

// // /routes/admin.js

// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const PendingAdmin = require('../models/PendingAdmin');
// const Admin = require('../models/Admin');
// const sendEmail = require('../utils/sendEmail');

// // --- Admin Signup: Request OTP ---
// router.post('/signup', async (req, res) => {
//   const { email, password, inviteToken } = req.body;

//   try {
//     if (!email || !password || !inviteToken) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const invite = await AdminInvite.findOne({ email, code: inviteToken });
//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid invitation.' });
//     }

//     if (invite.expiresAt < new Date()) {
//       await AdminInvite.deleteOne({ _id: invite._id });
//       return res.status(400).json({ message: 'Invitation expired.' });
//     }

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists.' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await PendingAdmin.deleteOne({ email }); // Clean any previous attempts

//     const pendingAdmin = new PendingAdmin({
//       email,
//       password, // Already hashed during pre('save') in Admin model
//       otp,
//       otpExpiresAt
//     });

//     await pendingAdmin.save();

//     const subject = 'ProVoxHome Admin OTP Verification';
//     const htmlContent = `
//       <h2>Verify Your Admin Signup</h2>
//       <p>Your OTP is: <b>${otp}</b></p>
//       <p>This OTP will expire in 10 minutes.</p>
//     `;

//     await sendEmail(email, subject, htmlContent);

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Signup Error:', error);
//     res.status(500).json({ message: 'Server error during signup.' });
//   }
// });

// // --- Admin Verify OTP ---
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     if (!email || !otp) {
//       return res.status(400).json({ message: 'Email and OTP are required.' });
//     }

//     const pendingAdmin = await PendingAdmin.findOne({ email, otp });
//     if (!pendingAdmin) {
//       return res.status(400).json({ message: 'Invalid OTP or email.' });
//     }

//     if (pendingAdmin.otpExpiresAt < new Date()) {
//       await PendingAdmin.deleteOne({ _id: pendingAdmin._id });
//       return res.status(400).json({ message: 'OTP expired. Please signup again.' });
//     }

//     const finalAdmin = new Admin({
//       email: pendingAdmin.email,
//       password: pendingAdmin.password
//     });

//     await finalAdmin.save();
//     await PendingAdmin.deleteOne({ _id: pendingAdmin._id });
//     await AdminInvite.deleteOne({ email: pendingAdmin.email });

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('OTP Verification Error:', error);
//     res.status(500).json({ message: 'Server error during OTP verification.' });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const PendingAdmin = require('../models/PendingAdmin');
// const Admin = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const sendEmail = require('../utils/sendEmail');

// // --- Signup: Request OTP ---
// router.post('/signup', async (req, res) => {
//   const { email, password, inviteToken } = req.body;

//   try {
//     if (!email || !password || !inviteToken) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const invite = await AdminInvite.findOne({ email, code: inviteToken });
//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid invitation.' });
//     }

//     if (invite.expiresAt < new Date()) {
//       await AdminInvite.deleteOne({ _id: invite._id });
//       return res.status(400).json({ message: 'Invitation expired. Request a new invite.' });
//     }

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists.' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     await PendingAdmin.deleteOne({ email }); // Clean previous attempts

//     const pending = new PendingAdmin({ email, password: hashedPassword, otp, otpExpiresAt });
//     await pending.save();

//     const subject = 'ProVoxHome Admin OTP Verification';
//     const html = `
//       <h2>Verify Your Admin Signup</h2>
//       <p>Your OTP is: <b>${otp}</b></p>
//       <p>It will expire in 10 minutes.</p>
//     `;

//     await sendEmail(email, subject, html);

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Signup Error:', error);
//     res.status(500).json({ message: 'Server error during signup.' });
//   }
// });

// // --- Verify OTP and Complete Signup ---
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     if (!email || !otp) {
//       return res.status(400).json({ message: 'Email and OTP are required.' });
//     }

//     const pending = await PendingAdmin.findOne({ email, otp });
//     if (!pending) {
//       return res.status(400).json({ message: 'Invalid OTP or email.' });
//     }

//     if (pending.otpExpiresAt < new Date()) {
//       await PendingAdmin.deleteOne({ _id: pending._id });
//       return res.status(400).json({ message: 'OTP expired. Please signup again.' });
//     }

//     const admin = new Admin({
//       email: pending.email,
//       password: pending.password
//     });
//     await admin.save();

//     await PendingAdmin.deleteOne({ _id: pending._id });
//     await AdminInvite.deleteOne({ email }); // Clean invite after success

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('OTP Verification Error:', error);
//     res.status(500).json({ message: 'Server error during OTP verification.' });
//   }
// });

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const PendingAdmin = require('../models/PendingAdmin');
// const Admin = require('../models/Admin');
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const sendEmail = require('../utils/sendEmail');

// // --- Request Signup (send OTP) ---
// router.post('/signup', async (req, res) => {
//   const { email, password, inviteToken } = req.body;

//   try {
//     if (!email || !password || !inviteToken) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const invite = await AdminInvite.findOne({ email, code: inviteToken });
//     if (!invite || invite.expiresAt < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired invitation.' });
//     }

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists.' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
//     const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     await PendingAdmin.deleteOne({ email }); // Remove previous attempts

//     const pending = new PendingAdmin({ email, password: hashedPassword, otp, otpExpiresAt });
//     await pending.save();

//     // Send OTP email
//     const subject = 'ProVoxHome Admin OTP Verification';
//     const html = `
//       <h2>Email Verification - ProVoxHome Admin Signup</h2>
//       <p>Your OTP is: <b>${otp}</b></p>
//       <p>This OTP will expire in 10 minutes.</p>
//     `;
//     await sendEmail(email, subject, html);

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Signup Request Error:', error);
//     res.status(500).json({ message: 'Server error during signup request.' });
//   }
// });

// // --- Verify OTP and Complete Signup ---
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     if (!email || !otp) {
//       return res.status(400).json({ message: 'Email and OTP are required.' });
//     }

//     const pending = await PendingAdmin.findOne({ email, otp });
//     if (!pending) {
//       return res.status(400).json({ message: 'Invalid OTP.' });
//     }

//     if (pending.otpExpiresAt < new Date()) {
//       await PendingAdmin.deleteOne({ _id: pending._id });
//       return res.status(400).json({ message: 'OTP expired. Please signup again.' });
//     }

//     const newAdmin = new Admin({ email: pending.email, password: pending.password });
//     await newAdmin.save();

//     await PendingAdmin.deleteOne({ _id: pending._id });
//     await AdminInvite.deleteOne({ email }); // Remove invite after success

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('OTP Verification Error:', error);
//     res.status(500).json({ message: 'Server error during OTP verification.' });
//   }
// });

// module.exports = router;










// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const Admin = require('../models/Admin');
// const { isSuperOrAdmin } = require('../middleware/auth');
// const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// // --- Invite Admin ---
// router.post('/invite', isSuperOrAdmin, async (req, res) => {
//   const { email } = req.body;
//   const inviterId = req.user.id;

//   try {
//     const existingInvite = await AdminInvite.findOne({ email });
//     if (existingInvite) {
//       await AdminInvite.deleteOne({ _id: existingInvite._id });
//     }

//     const code = crypto.randomBytes(16).toString('hex');
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     const invite = new AdminInvite({ email, code, createdBy: inviterId, expiresAt });
//     await invite.save();

//     const inviteLink = `${process.env.CLIENT_URL}/admin/signup?code=${code}&email=${email}`;
//     const subject = 'ProVoxHome Admin Invitation';
//     const html = `
//       <h2>Admin Invitation - ProVoxHome</h2>
//       <p>You have been invited to join <b>ProVoxHome</b> as an Admin.</p>
//       <p>Please complete your signup within <b>24 hours</b>.</p>
//       <p><a href="${inviteLink}" style="background-color: #4CAF50; padding: 10px; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
//       <p>Or use this invitation code: <b>${code}</b></p>
//       <small>This link expires at ${expiresAt.toLocaleString()}.</small>
//     `;

//     await sendEmail(email, subject, html);

//     res.status(200).json({ message: 'Admin invitation sent successfully.' });
//   } catch (error) {
//     console.error('Invite Error:', error);
//     res.status(500).json({ message: 'Server error during invite.' });
//   }
// });

// // --- Admin Signup using Invite ---
// router.post('/signup', async (req, res) => {
//   const { email, password, inviteToken } = req.body;

//   try {
//     if (!email || !password || !inviteToken) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     const invite = await AdminInvite.findOne({ email, code: inviteToken });

//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid invitation token or email.' });
//     }

//     if (invite.expiresAt < new Date()) {
//       return res.status(400).json({ message: 'Invitation expired. Request a new one.' });
//     }

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists with this email.' });
//     }

//     const newAdmin = new Admin({ email, password });
//     await newAdmin.save();

//     await AdminInvite.deleteOne({ _id: invite._id });

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('Signup Error:', error);
//     res.status(500).json({ message: 'Server error during signup.' });
//   }
// });

// // --- Admin Login ---
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const admin = await Admin.findOne({ email });

//     if (!admin || !(await admin.matchPassword(password))) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: 'admin' },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({ message: 'Login successful.', token });
//   } catch (error) {
//     console.error('Login Error:', error);
//     res.status(500).json({ message: 'Server error during login.' });
//   }
// });

// module.exports = router;




// // server/routes/admin.js

// const express = require('express');
// const router = express.Router();
// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// const AdminInvite = require('../models/AdminInvite');
// const Admin = require('../models/Admin');
// const { isSuperOrAdmin } = require('../middleware/auth');
// const sendEmail = require('../utils/sendEmail');

// dotenv.config();

// // --- Invite Admin ---
// router.post('/invite', isSuperOrAdmin, async (req, res) => {
//   const { email } = req.body;
//   const inviterId = req.user.id;

//   try {
//     const normalizedEmail = email.toLowerCase();

//     // Remove existing invites if any
//     const existingInvite = await AdminInvite.findOne({ email: normalizedEmail });
//     if (existingInvite) {
//       await AdminInvite.deleteOne({ _id: existingInvite._id });
//     }

//     const code = crypto.randomBytes(16).toString('hex');
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expires in 24 hours

//     const newInvite = new AdminInvite({
//       email: normalizedEmail,
//       code,
//       createdBy: inviterId,
//       expiresAt,
//     });
//     await newInvite.save();

//     const inviteLink = `${process.env.CLIENT_URL}/admin/signup?code=${code}&email=${normalizedEmail}`;
//     const subject = 'ProVoxHome Admin Invitation';
//     const htmlContent = `
//       <h2>You're Invited to Join ProVoxHome as an Admin!</h2>
//       <p>Please complete your signup within <strong>24 hours</strong>.</p>
//       <p>
//         <a href="${inviteLink}" style="background-color: #4CAF50; padding: 10px 15px; color: white; text-decoration: none; border-radius: 5px;">
//           Accept Invitation
//         </a>
//       </p>
//       <p>Or use this invitation code manually during signup: <strong>${code}</strong></p>
//       <br>
//       <small>This invitation will expire on <strong>${expiresAt.toLocaleString()}</strong>.</small>
//     `;

//     await sendEmail(normalizedEmail, subject, htmlContent);

//     res.status(200).json({ message: 'Invitation sent successfully to the admin.' });
//   } catch (error) {
//     console.error('Admin Invitation Error:', error);
//     res.status(500).json({ message: 'An error occurred while sending the invitation.' });
//   }
// });

// // --- Admin Signup ---
// router.post('/signup', async (req, res) => {
//   const { email, password, code } = req.body;

//   try {
//     const normalizedEmail = email.toLowerCase();
//     const invite = await AdminInvite.findOne({ email: normalizedEmail, code });

//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid or expired invitation link.' });
//     }

//     if (invite.expiresAt < new Date()) {
//       await AdminInvite.deleteOne({ _id: invite._id });
//       return res.status(400).json({ message: 'Invitation link has expired. Please request a new one.' });
//     }

//     const existingAdmin = await Admin.findOne({ email: normalizedEmail });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'An admin already exists with this email.' });
//     }

//     const newAdmin = new Admin({
//       email: normalizedEmail,
//       password,
//     });
//     await newAdmin.save();

//     await AdminInvite.deleteOne({ _id: invite._id });

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('Admin Signup Error:', error);
//     res.status(500).json({ message: 'An error occurred during signup.' });
//   }
// });

// // --- Admin Login ---
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const normalizedEmail = email.toLowerCase();
//     const admin = await Admin.findOne({ email: normalizedEmail });

//     if (!admin || !(await admin.matchPassword(password))) {
//       return res.status(401).json({ message: 'Invalid email or password.' });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: 'admin' },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({ message: 'Login successful.', token });
//   } catch (error) {
//     console.error('Admin Login Error:', error);
//     res.status(500).json({ message: 'An error occurred during login.' });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const Admin = require('../models/Admin');
// const { isSuperOrAdmin } = require('../middleware/auth');
// const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// // --- Invite Admin ---
// router.post('/invite', isSuperOrAdmin, async (req, res) => {
//   const { email } = req.body;
//   const inviterId = req.user.id;

//   try {
//     const existingInvite = await AdminInvite.findOne({ email });
//     if (existingInvite) {
//       await AdminInvite.deleteOne({ _id: existingInvite._id }); // Clean old invites
//     }

//     const code = crypto.randomBytes(16).toString('hex');
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

//     const invite = new AdminInvite({ email, code, createdBy: inviterId, expiresAt });
//     await invite.save();

//     const inviteLink = `${process.env.CLIENT_URL}/admin/signup?code=${code}&email=${email}`;
//     const subject = 'ProVoxHome Admin Invitation';
//     const html = `
//       <h2>Admin Invitation - ProVoxHome</h2>
//       <p>You have been invited to join <b>ProVoxHome</b> as an Admin.</p>
//       <p>Please complete your signup within <b>24 hours</b>.</p>
//       <p><a href="${inviteLink}" style="background-color: #4CAF50; padding: 10px; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
//       <p>Or use this invitation code: <b>${code}</b></p>
//       <small>This link expires at ${expiresAt.toLocaleString()}.</small>
//     `;

//     await sendEmail(email, subject, html);

//     res.status(200).json({ message: 'Admin invitation sent successfully.' });
//   } catch (error) {
//     console.error('Invite Error:', error);
//     res.status(500).json({ message: 'Server error during invite.' });
//   }
// });

// // --- Admin Signup using Invite ---
// router.post('/signup', async (req, res) => {
//   const { email, password, code } = req.body;

//   try {
//     const invite = await AdminInvite.findOne({ email, code });

//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid invitation link or code.' });
//     }

//     if (invite.expiresAt < new Date()) {
//       return res.status(400).json({ message: 'Invitation expired. Request a new one.' });
//     }

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists with this email.' });
//     }

//     const admin = new Admin({ email, password });
//     await admin.save();

//     await AdminInvite.deleteOne({ _id: invite._id }); // Clean up invite

//     res.status(201).json({ message: 'Admin account created successfully. You can now login.' });
//   } catch (error) {
//     console.error('Signup Error:', error);
//     res.status(500).json({ message: 'Server error during signup.' });
//   }
// });

// // --- Admin Login (Normal Login) ---
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const admin = await Admin.findOne({ email });

//     if (!admin || !(await admin.matchPassword(password))) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: 'admin' },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({ message: 'Login successful.', token });
//   } catch (error) {
//     console.error('Login Error:', error);
//     res.status(500).json({ message: 'Server error during login.' });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const AdminInvite = require('../models/AdminInvite');
// const { isSuperOrAdmin } = require('../middleware/auth');
// const sendInviteEmail = require('../utils/sendInviteEmail'); // we'll create this next

// // POST /api/admin/invite
// router.post('/invite', isSuperOrAdmin, async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required.' });
//     }

//     // check if already invited
//     const existingInvite = await AdminInvite.findOne({ email });
//     if (existingInvite) {
//       return res.status(400).json({ message: 'Admin already invited.' });
//     }

//     // create invite
//     const newInvite = new AdminInvite({
//       email,
//       createdBy: req.user.id
//     });

//     await newInvite.save();

//     // Generate Invite Link
//     const inviteLink = `http://localhost:5173/admin-signup?code=${newInvite.inviteCode}`;

//     // Send Email
//     await sendInviteEmail(email, inviteLink, newInvite.inviteCode);

//     res.status(201).json({ message: 'Admin invited successfully.', inviteLink });

//   } catch (err) {
//     console.error('Admin Invite Error:', err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// module.exports = router;






















// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const AdminInvite = require('../models/AdminInvite');

// const { isSuperOrAdmin } = require('../middleware/auth');

// // Invite Admin (only by SuperAdmin or Admin)
// router.post('/invite', isSuperOrAdmin, async (req, res) => {
//   try {
//     const { email } = req.body;
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this email already exists' });
//     }

//     const invite = new AdminInvite({
//       token: crypto.randomBytes(20).toString('hex'),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//       createdBy: req.user.id
//     });

//     await invite.save();
//     return res.status(201).json({ inviteToken: invite.token });
//   } catch (err) {
//     console.error('Error inviting admin:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Admin Signup using Invite
// router.post('/signup', async (req, res) => {
//   try {
//     const { email, password, inviteToken } = req.body;

//     const invite = await AdminInvite.findOne({ token: inviteToken, used: false, expiresAt: { $gt: new Date() } });
//     if (!invite) {
//       return res.status(400).json({ message: 'Invalid or expired invite token' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     const user = new User({
//       email,
//       passwordHash,
//       role: 'admin',
//       isEmailVerified: true, // Assume verified because of invite
//       isAdminVerified: true
//     });

//     await user.save();

//     const admin = new Admin({
//       user: user._id,
//       permissions: ['verify_users', 'verify_creators', 'manage_projects'], // Default perms
//       addedBy: invite.createdBy
//     });

//     await admin.save();

//     invite.used = true;
//     await invite.save();

//     res.status(201).json({ message: 'Admin account created successfully' });
//   } catch (err) {
//     console.error('Admin signup error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Admin Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user || user.role !== 'admin') {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({ token });
//   } catch (err) {
//     console.error('Admin login error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;



