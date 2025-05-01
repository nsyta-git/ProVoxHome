// server/routes/adminProfileVerification.js

const express = require('express');
const router = express.Router();
const PendingProfileVerification = require('../models/PendingProfileVerification');
const UserProfile = require('../models/UserProfile');
const { isAdminOrSuperAdmin } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const notifyUser = require('../utils/notifyUser');

// --- GET all pending profile verifications ---
router.get('/pending-requests', isAdminOrSuperAdmin, async (req, res) => {
  try {
    const pendingRequests = await PendingProfileVerification.find({ status: 'pending' })
      .populate('userProfile')
      .populate('user', 'email role');

    res.status(200).json({ pendingRequests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- Admin Action: Approve a profile ---
router.post('/approve/:requestId', isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await PendingProfileVerification.findById(requestId).populate('userProfile user');
    if (!request) return res.status(404).json({ message: 'Verification request not found.' });

    const userProfile = request.userProfile;
    userProfile.isVerified = true;
    userProfile.verificationStatus = 'approved';
    userProfile.adminComment = undefined;

    await userProfile.save();

    request.status = 'approved';
    request.reviewedBy = req.admin.id;
    await request.save();

    await notifyUser({
      userId: request.user._id,
      title: 'Profile Approved',
      message: 'Your profile has been approved by the admin.'
    });

    await sendEmail(
      request.user.email,
      'ProVoxHome Profile Approved',
      `<p>Your profile has been <strong>approved</strong> by the admin.</p>`
    );

    res.status(200).json({ message: 'Profile approved successfully.' });
  } catch (error) {
    console.error('Error approving profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- Admin Action: Reject a profile ---
router.post('/reject/:requestId', isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminComment } = req.body;

    const request = await PendingProfileVerification.findById(requestId).populate('userProfile user');
    if (!request) return res.status(404).json({ message: 'Verification request not found.' });

    const userProfile = request.userProfile;
    userProfile.isVerified = false;
    userProfile.verificationStatus = 'rejected';
    userProfile.adminComment = adminComment || 'Rejected without comment.';

    await userProfile.save();

    request.status = 'rejected';
    request.adminComment = adminComment;
    request.reviewedBy = req.admin.id;
    await request.save();

    await notifyUser({
      userId: request.user._id,
      title: 'Profile Rejected',
      message: `Your profile was rejected. ${adminComment || ''}`
    });

    await sendEmail(
      request.user.email,
      'ProVoxHome Profile Rejected',
      `<p>Your profile was <strong>rejected</strong>.</p><p>${adminComment || ''}</p>`
    );

    res.status(200).json({ message: 'Profile rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- Admin Action: Request Changes on a profile ---
router.post('/request-changes/:requestId', isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminComment } = req.body;

    if (!adminComment) {
      return res.status(400).json({ message: 'Comment required for requesting changes.' });
    }

    const request = await PendingProfileVerification.findById(requestId).populate('userProfile user');
    if (!request) return res.status(404).json({ message: 'Verification request not found.' });

    const userProfile = request.userProfile;
    userProfile.isVerified = false;
    userProfile.verificationStatus = 'changes_requested';
    userProfile.adminComment = adminComment;

    await userProfile.save();

    request.status = 'changes_requested';
    request.adminComment = adminComment;
    request.reviewedBy = req.admin.id;
    await request.save();

    await notifyUser({
      userId: request.user._id,
      title: 'Changes Requested',
      message: `Admin requested changes to your profile. ${adminComment}`
    });

    await sendEmail(
      request.user.email,
      'ProVoxHome – Profile Changes Requested',
      `<p>Your profile needs changes before approval.</p><p>${adminComment}</p>`
    );

    res.status(200).json({ message: 'Changes requested from user successfully.' });
  } catch (error) {
    console.error('Error requesting changes:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const PendingProfileVerification = require('../models/PendingProfileVerification');
// const UserProfile = require('../models/UserProfile');
// const { isSuperOrAdmin } = require('../middleware/auth');

// // --- GET all pending profile verifications ---
// router.get('/pending-requests', isSuperOrAdmin, async (req, res) => {
//   try {
//     const pendingRequests = await PendingProfileVerification.find({ status: 'pending' })
//       .populate('userProfile')
//       .populate('user', 'email role');

//     res.status(200).json({ pendingRequests });
//   } catch (error) {
//     console.error('Error fetching pending requests:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// // --- Admin Action: Approve a profile ---
// router.post('/approve/:requestId', isSuperOrAdmin, async (req, res) => {
//   try {
//     const { requestId } = req.params;

//     const request = await PendingProfileVerification.findById(requestId).populate('userProfile');
//     if (!request) return res.status(404).json({ message: 'Verification request not found.' });

//     const userProfile = request.userProfile;
//     userProfile.isVerified = true;
//     userProfile.verificationStatus = 'approved';
//     userProfile.adminComment = undefined;

//     await userProfile.save();

//     request.status = 'approved';
//     request.reviewedBy = req.admin.id;
//     await request.save();

//     res.status(200).json({ message: 'Profile approved successfully.' });
//   } catch (error) {
//     console.error('Error approving profile:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// // --- Admin Action: Reject a profile ---
// router.post('/reject/:requestId', isSuperOrAdmin, async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { adminComment } = req.body;

//     const request = await PendingProfileVerification.findById(requestId).populate('userProfile');
//     if (!request) return res.status(404).json({ message: 'Verification request not found.' });

//     const userProfile = request.userProfile;
//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'rejected';
//     userProfile.adminComment = adminComment || 'Rejected without comment.';

//     await userProfile.save();

//     request.status = 'rejected';
//     request.adminComment = adminComment;
//     request.reviewedBy = req.admin.id;
//     await request.save();

//     res.status(200).json({ message: 'Profile rejected successfully.' });
//   } catch (error) {
//     console.error('Error rejecting profile:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// // --- Admin Action: Request Changes on a profile ---
// router.post('/request-changes/:requestId', isSuperOrAdmin, async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { adminComment } = req.body;

//     if (!adminComment) {
//       return res.status(400).json({ message: 'Comment required for requesting changes.' });
//     }

//     const request = await PendingProfileVerification.findById(requestId).populate('userProfile');
//     if (!request) return res.status(404).json({ message: 'Verification request not found.' });

//     const userProfile = request.userProfile;
//     userProfile.isVerified = false;
//     userProfile.verificationStatus = 'changes_requested';
//     userProfile.adminComment = adminComment;

//     await userProfile.save();

//     request.status = 'changes_requested';
//     request.adminComment = adminComment;
//     request.reviewedBy = req.admin.id;
//     await request.save();

//     res.status(200).json({ message: 'Changes requested from user successfully.' });
//   } catch (error) {
//     console.error('Error requesting changes:', error);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// module.exports = router;
