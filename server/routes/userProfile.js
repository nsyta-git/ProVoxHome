
// server/routes/userProfile.js

const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PendingProfileVerification = require('../models/PendingProfileVerification');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const { isUser } = require('../middleware/auth');
const User = require('../models/User');

// --- ✅ GET Current User Profile ---
router.get('/me', isUser, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in GET /me:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// --- Request Profile Update (Send OTP) ---
router.post('/request-update', isUser, async (req, res) => {
  const { fullName, dob, country, phoneNumber } = req.body;

  try {
    if (!fullName || !dob || !country || !phoneNumber) {
      return res.status(400).json({ message: 'Mandatory fields are missing.' });
    }
    

    console.log('Decoded user from token:', req.user);

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    // Check if user is currently locked out due to invalid OTP
    if (user.profileLockUntil && user.profileLockUntil > new Date()) {
      return res.status(403).json({
        message: `Profile update temporarily locked. Try again after ${user.profileLockUntil.toLocaleString()}.`
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.deleteMany({ email: req.user.email });

    await Otp.create({
      email: req.user.email,
      code: otpCode,
      purpose: 'profile-update',
      expiresAt
    });

    await sendEmail(
      req.user.email,
      'ProVoxHome - OTP for Profile Update',
      `<h3>Your OTP is: <b>${otpCode}</b></h3><p>It will expire in 10 minutes.</p>`
    );

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error in request-update:', error);
    res.status(500).json({ message: 'Server error sending OTP.' });
  }
});

// --- Verify OTP and Save Profile ---
router.post('/verify-update', isUser, async (req, res) => {
  const {
    fullName,
    dob,
    country,
    phoneNumber,
    bio,
    profilePictureUrl,
    socialLinks,
    otp
  } = req.body;

  try {
    const otpEntry = await Otp.findOne({
      email: req.user.email,
      code: otp,
      purpose: 'profile-update'
    });

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      // Lock the user for 12 hours on failed attempt
      const lockUntil = new Date(Date.now() + 12 * 60 * 60 * 1000);
      user.profileLockUntil = lockUntil;
      await user.save();

      await sendEmail(
        req.user.email,
        'ProVoxHome - Security Alert',
        `<p>Someone attempted to verify your profile with an invalid or expired OTP.</p>
         <p>Your profile updates have been locked for 12 hours as a precaution.</p>`
      );

      return res.status(400).json({
        message: 'Invalid or expired OTP. You are temporarily locked from profile updates.'
      });
    }

    let userProfile = await UserProfile.findOne({ user: req.user.userId });

    if (!userProfile) {
      userProfile = new UserProfile({ user: req.user.userId });
    }

    // Update mandatory and optional fields
    userProfile.fullName = fullName;
    userProfile.dob = dob;
    userProfile.country = country;
    userProfile.phoneNumber = phoneNumber;
    if (bio !== undefined) userProfile.bio = bio;
    if (profilePictureUrl !== undefined) userProfile.profilePictureUrl = profilePictureUrl;
    if (socialLinks !== undefined) userProfile.socialLinks = socialLinks;

    userProfile.isVerified = false;
    userProfile.verificationStatus = 'pending';
    userProfile.adminComment = undefined;

    await userProfile.save();

    await PendingProfileVerification.deleteMany({ user: req.user.userId });

    await PendingProfileVerification.create({
      user: req.user.userId,
      userProfile: userProfile._id
    });

    await Otp.deleteMany({ email: req.user.email });

    await sendEmail(
      req.user.email,
      'ProVoxHome - Profile Verification Pending',
      `<p>Your profile update has been submitted and is awaiting admin approval.</p>`
    );

    res.status(200).json({ message: 'Profile update request sent successfully for verification.' });
  } catch (error) {
    console.error('Error in verify-update:', error);
    res.status(500).json({ message: 'Server error verifying profile update.' });
  }
});

module.exports = router;


// server/routes/userProfile.js

// const express = require('express');
// const router = express.Router();
// const UserProfile = require('../models/UserProfile');
// const PendingProfileVerification = require('../models/PendingProfileVerification');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const { isUser } = require('../middleware/auth');
// const User = require('../models/User');

// // --- ✅ GET Current User Profile ---
// router.get('/me', isUser, async (req, res) => {
//   try {
//     const profile = await UserProfile.findOne({ user: req.user.id });
//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }

//     res.status(200).json(profile);
//   } catch (error) {
//     console.error('Error in GET /me:', error);
//     res.status(500).json({ message: 'Server error fetching profile.' });
//   }
// });

// // --- Request Profile Update (Send OTP) ---
// router.post('/request-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber } = req.body;

//   try {
//     if (!fullName || !dob || !country || !phoneNumber) {
//       return res.status(400).json({ message: 'Mandatory fields are missing.' });
//     }

//     const user = await User.findById(req.user.id);

//     // Check if user is currently locked out due to invalid OTP
//     if (user.profileLockUntil && user.profileLockUntil > new Date()) {
//       return res.status(403).json({
//         message: `Profile update temporarily locked. Try again after ${user.profileLockUntil.toLocaleString()}.`
//       });
//     }

//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     await Otp.deleteMany({ email: req.user.email });

//     await Otp.create({
//       email: req.user.email,
//       code: otpCode,
//       purpose: 'profile-update',
//       expiresAt
//     });

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome - OTP for Profile Update',
//       `<h3>Your OTP is: <b>${otpCode}</b></h3><p>It will expire in 10 minutes.</p>`
//     );

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Error in request-update:', error);
//     res.status(500).json({ message: 'Server error sending OTP.' });
//   }
// });

// // --- Verify OTP and Save Profile ---
// router.post('/verify-update', isUser, async (req, res) => {
//   const {
//     fullName,
//     dob,
//     country,
//     phoneNumber,
//     bio,
//     profilePictureUrl,
//     socialLinks,
//     otp
//   } = req.body;

//   try {
//     const otpEntry = await Otp.findOne({
//       email: req.user.email,
//       code: otp,
//       purpose: 'profile-update'
//     });

//     const user = await User.findById(req.user.id);

//     if (!otpEntry || otpEntry.expiresAt < new Date()) {
//       // Lock the user for 12 hours on failed attempt
//       const lockUntil = new Date(Date.now() + 12 * 60 * 60 * 1000);
//       user.profileLockUntil = lockUntil;
//       await user.save();

//       await sendEmail(
//         req.user.email,
//         'ProVoxHome - Security Alert',
//         `<p>Someone attempted to verify your profile with an invalid or expired OTP.</p>
//          <p>Your profile updates have been locked for 12 hours as a precaution.</p>`
//       );

//       return res.status(400).json({
//         message: 'Invalid or expired OTP. You are temporarily locked from profile updates.'
//       });
//     }

//     let userProfile = await UserProfile.findOne({ user: req.user.id });

//     if (!userProfile) {
//       userProfile = new UserProfile({ user: req.user.id });
//     }

//     // Update mandatory and optional fields
//     userProfile.fullName = fullName;
//     userProfile.dob = dob;
//     userProfile.country = country;
//     userProfile.phoneNumber = phoneNumber;
//     if (bio !== undefined) userProfile.bio = bio;
//     if (profilePictureUrl !== undefined) userProfile.profilePictureUrl = profilePictureUrl;
//     if (socialLinks !== undefined) userProfile.socialLinks = socialLinks;

//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'pending';
//     userProfile.adminComment = undefined;

//     await userProfile.save();

//     await PendingProfileVerification.deleteMany({ user: req.user.id });

//     await PendingProfileVerification.create({
//       user: req.user.id,
//       userProfile: userProfile._id
//     });

//     await Otp.deleteMany({ email: req.user.email });

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome - Profile Verification Pending',
//       `<p>Your profile update has been submitted and is awaiting admin approval.</p>`
//     );

//     res.status(200).json({ message: 'Profile update request sent successfully for verification.' });
//   } catch (error) {
//     console.error('Error in verify-update:', error);
//     res.status(500).json({ message: 'Server error verifying profile update.' });
//   }
// });

// module.exports = router;




// // server/routes/userProfile.js

// const express = require('express');
// const router = express.Router();
// const UserProfile = require('../models/UserProfile');
// const PendingProfileVerification = require('../models/PendingProfileVerification');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const { isUser } = require('../middleware/auth');
// const User = require('../models/User');

// // --- Request Profile Update (Send OTP) ---
// router.post('/request-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber } = req.body;

//   try {
//     if (!fullName || !dob || !country || !phoneNumber) {
//       return res.status(400).json({ message: 'Mandatory fields are missing.' });
//     }

//     const user = await User.findById(req.user.id);

//     // Check if user is currently locked out due to invalid OTP
//     if (user.profileLockUntil && user.profileLockUntil > new Date()) {
//       return res.status(403).json({
//         message: `Profile update temporarily locked. Try again after ${user.profileLockUntil.toLocaleString()}.`
//       });
//     }

//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     await Otp.deleteMany({ email: req.user.email });

//     await Otp.create({
//       email: req.user.email,
//       code: otpCode,
//       purpose: 'profile-update',
//       expiresAt
//     });

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome - OTP for Profile Update',
//       `<h3>Your OTP is: <b>${otpCode}</b></h3><p>It will expire in 10 minutes.</p>`
//     );

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Error in request-update:', error);
//     res.status(500).json({ message: 'Server error sending OTP.' });
//   }
// });

// // --- Verify OTP and Save Profile ---
// router.post('/verify-update', isUser, async (req, res) => {
//   const {
//     fullName,
//     dob,
//     country,
//     phoneNumber,
//     bio,
//     profilePictureUrl,
//     socialLinks,
//     otp
//   } = req.body;

//   try {
//     const otpEntry = await Otp.findOne({
//       email: req.user.email,
//       code: otp,
//       purpose: 'profile-update'
//     });

//     const user = await User.findById(req.user.id);

//     if (!otpEntry || otpEntry.expiresAt < new Date()) {
//       // Lock the user for 12 hours on failed attempt
//       const lockUntil = new Date(Date.now() + 12 * 60 * 60 * 1000);
//       user.profileLockUntil = lockUntil;
//       await user.save();

//       await sendEmail(
//         req.user.email,
//         'ProVoxHome - Security Alert',
//         `<p>Someone attempted to verify your profile with an invalid or expired OTP.</p>
//          <p>Your profile updates have been locked for 12 hours as a precaution.</p>`
//       );

//       return res.status(400).json({
//         message: 'Invalid or expired OTP. You are temporarily locked from profile updates.'
//       });
//     }

//     let userProfile = await UserProfile.findOne({ user: req.user.id });

//     if (!userProfile) {
//       userProfile = new UserProfile({ user: req.user.id });
//     }

//     // Update mandatory and optional fields
//     userProfile.fullName = fullName;
//     userProfile.dob = dob;
//     userProfile.country = country;
//     userProfile.phoneNumber = phoneNumber;
//     if (bio !== undefined) userProfile.bio = bio;
//     if (profilePictureUrl !== undefined) userProfile.profilePictureUrl = profilePictureUrl;
//     if (socialLinks !== undefined) userProfile.socialLinks = socialLinks;

//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'pending';
//     userProfile.adminComment = undefined;

//     await userProfile.save();

//     await PendingProfileVerification.deleteMany({ user: req.user.id });

//     await PendingProfileVerification.create({
//       user: req.user.id,
//       userProfile: userProfile._id
//     });

//     await Otp.deleteMany({ email: req.user.email });

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome - Profile Verification Pending',
//       `<p>Your profile update has been submitted and is awaiting admin approval.</p>`
//     );

//     res.status(200).json({ message: 'Profile update request sent successfully for verification.' });
//   } catch (error) {
//     console.error('Error in verify-update:', error);
//     res.status(500).json({ message: 'Server error verifying profile update.' });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const UserProfile = require('../models/UserProfile');
// const PendingProfileVerification = require('../models/PendingProfileVerification');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const { isUser } = require('../middleware/auth');

// // --- Request Profile Update (Send OTP) ---
// router.post('/request-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber, bio, profilePictureUrl, socialLinks } = req.body;

//   try {
//     if (!fullName || !dob || !country || !phoneNumber) {
//       return res.status(400).json({ message: 'Mandatory fields are missing.' });
//     }

//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await Otp.deleteMany({ email: req.user.email });

//     await Otp.create({
//       email: req.user.email,
//       code: otpCode,
//       purpose: 'profile-update',
//       expiresAt
//     });

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome - OTP for Profile Update',
//       `<h3>Your OTP is: <b>${otpCode}</b></h3><p>It will expire in 10 minutes.</p>`
//     );

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Error in request-update:', error);
//     res.status(500).json({ message: 'Server error sending OTP.' });
//   }
// });

// // --- Verify OTP and Save Profile ---
// router.post('/verify-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber, bio, profilePictureUrl, socialLinks, otp } = req.body;

//   try {
//     const otpEntry = await Otp.findOne({ email: req.user.email, code: otp, purpose: 'profile-update' });
//     if (!otpEntry || otpEntry.expiresAt < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP.' });
//     }

//     let userProfile = await UserProfile.findOne({ user: req.user.id });

//     if (!userProfile) {
//       userProfile = new UserProfile({ user: req.user.id });
//     }

//     // Update fields
//     userProfile.fullName = fullName;
//     userProfile.dob = dob;
//     userProfile.country = country;
//     userProfile.phoneNumber = phoneNumber;
//     if (bio) userProfile.bio = bio;
//     if (profilePictureUrl) userProfile.profilePictureUrl = profilePictureUrl;
//     if (socialLinks) userProfile.socialLinks = socialLinks;

//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'pending';
//     userProfile.adminComment = undefined;

//     await userProfile.save();

//     await PendingProfileVerification.deleteMany({ user: req.user.id });

//     await PendingProfileVerification.create({
//       user: req.user.id,
//       userProfile: userProfile._id
//     });

//     await Otp.deleteMany({ email: req.user.email });

//     res.status(200).json({ message: 'Profile updated and verification request sent successfully.' });
//   } catch (error) {
//     console.error('Error in verify-update:', error);
//     res.status(500).json({ message: 'Server error verifying profile update.' });
//   }
// });

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const UserProfile = require('../models/UserProfile');
// const PendingProfileVerification = require('../models/PendingProfileVerification');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const { isUser } = require('../middleware/auth');

// // --- Create or Update Profile (Request OTP First) ---
// router.post('/request-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber, bio, profilePictureUrl, socialLinks } = req.body;
  
//   try {
//     if (!fullName || !dob || !country || !phoneNumber) {
//       return res.status(400).json({ message: 'Mandatory fields missing.' });
//     }

//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await Otp.deleteMany({ email: req.user.email });

//     const otpEntry = new Otp({
//       email: req.user.email,
//       code: otpCode,
//       expiresAt
//     });
//     await otpEntry.save();

//     await sendEmail(
//       req.user.email,
//       'ProVoxHome Profile Update OTP',
//       `<h3>Your OTP is: <b>${otpCode}</b></h3><p>Expires in 10 minutes.</p>`
//     );

//     res.status(200).json({ message: 'OTP sent to your email.' });
//   } catch (error) {
//     console.error('Profile Request Error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// // --- Verify OTP and Update Profile ---
// router.post('/verify-update', isUser, async (req, res) => {
//   const { fullName, dob, country, phoneNumber, bio, profilePictureUrl, socialLinks, otp } = req.body;

//   try {
//     const otpEntry = await Otp.findOne({ email: req.user.email, code: otp });
//     if (!otpEntry || otpEntry.expiresAt < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP.' });
//     }

//     let userProfile = await UserProfile.findOne({ user: req.user.id });

//     if (!userProfile) {
//       userProfile = new UserProfile({ user: req.user.id });
//     }

//     // Update fields
//     userProfile.fullName = fullName;
//     userProfile.dob = dob;
//     userProfile.country = country;
//     userProfile.phoneNumber = phoneNumber;
//     if (bio) userProfile.bio = bio;
//     if (profilePictureUrl) userProfile.profilePictureUrl = profilePictureUrl;
//     if (socialLinks) userProfile.socialLinks = socialLinks;

//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'pending';
//     userProfile.adminComment = undefined;

//     await userProfile.save();

//     await PendingProfileVerification.deleteMany({ userProfile: userProfile._id });

//     const pendingRequest = new PendingProfileVerification({
//       userProfile: userProfile._id
//     });
//     await pendingRequest.save();

//     await Otp.deleteMany({ email: req.user.email });

//     res.status(200).json({ message: 'Profile updated and verification request sent.' });
//   } catch (error) {
//     console.error('Profile Verification Error:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// module.exports = router;
