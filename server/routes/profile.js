// server/routes/profile.js

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const profileController = require('../controllers/userProfileController');

// [1] Get Role
router.get('/role', isAuthenticated, async (req, res) => {
  try {
    const { role } = req.user;
    if (!role) {
      return res.status(400).json({ message: 'Role not found in token' });
    }
    res.status(200).json({ role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// [2] Check if profile exists
router.get('/exist', isAuthenticated, profileController.checkProfileExists);

// [3] Request profile creation or update
router.post('/request-update', isAuthenticated, profileController.requestProfileUpdate);

// [4] Verify OTP and process update
router.post('/request-update/verifyOTP', isAuthenticated, profileController.verifyOtpAndProcessUpdate);

// [5] Get own profile (Authenticated)
router.get('/', isAuthenticated, profileController.getOwnProfile);
router.get('/me', isAuthenticated, profileController.getOwnProfile);

// [6] Public route to fetch any user’s profile by ID (limited view)
router.get('/public/:userId', profileController.getPublicProfileById);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const {isAuthenticated} = require('../middleware/auth');
// const profileController = require('../controllers/userProfileController');


// // [1] Get RoleS
// // 🔹 Route: GET /api/profile/role
// // 🔐 Authenticated users only
// router.get('/role', isAuthenticated, async (req, res) => {
//   try {
//     const { role } = req.user;
//     if (!role) {
//       return res.status(400).json({ message: 'Role not found in token' });
//     }
//     res.status(200).json({ role });
//   } catch (error) {
//     console.error('Error fetching role:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // [2] Check if profile exists
// router.get('/exist', isAuthenticated, profileController.checkProfileExists);

// // [3] Profile Updation Request (same for creation)
// router.post('/request-update', isAuthenticated, profileController.requestProfileUpdate);

// // [4] Otp Verification for Profile Updation/Creation
// router.post('/request-update/verifyOTP', isAuthenticated, profileController.verifyOtpAndProcessUpdate);

// //


// module.exports = router;

// // [4] Optional fields Update 
// router.post('/verify-optional-update', isAuthenticated, profileController.verifyOtpAndUpdateOptionalFields);

// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/auth');

// // GET /api/profile/role — returns user's role from token
// router.get('/role', authMiddleware, async (req, res) => {
//   try {
//     const { role } = req.user; // role decoded by middleware
//     if (!role) {
//       return res.status(400).json({ message: 'Role not found in token.' });
//     }
//     res.json({ role });
//   } catch (error) {
//     console.error('Error getting role:', error);
//     res.status(500).json({ message: 'Server error retrieving role.' });
//   }
// });

// module.exports = router;



























// //-----  Universal "/api/profile/me" handler ---

// const express = require('express');
// const router = express.Router();
// const { isAuthenticated } = require('../middleware/auth');

// const UserProfile = require('../models/UserProfile');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');

// // GET /api/profile/me
// router.get('/me', isAuthenticated, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const role = req.user.role;

//     let profileData = null;

//     if (role === 'user' || role === 'creator') {
//       profileData = await UserProfile.findOne({ user: userId }).lean();
//     } else if (role === 'admin') {
//       profileData = await Admin.findById(userId).lean();
//     } else if (role === 'superadmin') {
//       profileData = await SuperAdmin.findById(userId).lean();
//     } else {
//       return res.status(400).json({ message: 'Unknown role.' });
//     }

//     if (!profileData) {
//       return res.status(404).json({ message: 'Profile not found.' });
//     }

//     res.status(200).json({ profile: profileData });
//   } catch (error) {
//     console.error('Error in GET /api/profile/me:', error);
//     res.status(500).json({ message: 'Server error retrieving profile.' });
//   }
// });

// module.exports = router;
