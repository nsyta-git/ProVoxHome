// server/controllers/requestReviewController.js

const ProfileCreationRequest = require('../models/ProfileCreationRequest');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const notifyUser = require('../utils/notifyUser');

// Unified handler
const handleReview = async (req, res, status) => {
  const { type, requestId } = req.params;
  const { reviewComment } = req.body;
  const reviewerId = req.user.userId;

  try {
    let requestModel = type === 'creation' ? ProfileCreationRequest : ProfileUpdateRequest;
    const request = await requestModel.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already reviewed' });
    }

    request.status = status;
    request.reviewedBy = reviewerId;
    if (reviewComment) request.reviewComment = reviewComment;

    // Handle ACCEPTED updates to profile
    if (status === 'accepted') {
      const { userId, role, fields } = request;

      // 🛠️ Fix: Ensure required profile fields and handle field name mapping
      if (role === 'user' || role === 'creator') {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Handle field name mapping and required fields
        const profileUpdate = {
          ...fields,
          // Map 'phone' → 'phoneNumber' if needed
          phoneNumber: fields.phoneNumber || fields.phone,
          // Ensure socialLinks structure
          socialLinks: fields.socialLinks || {}
        };

        // Remove old phone field if present
        if (fields.phone) delete profileUpdate.phone;

        // Merge updates while preserving existing data
        user.profile = {
          ...user.profile.toObject(), // Convert Mongoose doc to plain object
          ...profileUpdate
        };

        // ✅ Validate required fields before saving
        if (!user.profile.fullName || !user.profile.dob || 
            !user.profile.country || !user.profile.phoneNumber) {
          return res.status(400).json({ 
            message: 'Missing required profile fields: fullName, dob, country, phoneNumber' 
          });
        }

        // ✅ Set verification flags
        user.isProfileComplete = true;
        user.isAdminVerified = true;
        await user.save();
      } else if (role === 'admin') {
        const admin = await Admin.findById(userId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        Object.assign(admin, fields);
        
        // ✅ Set SuperAdmin approval flag
        admin.isSAApproved = true;
        await admin.save();
      } else if (role === 'superadmin') {
        const superAdmin = await SuperAdmin.findById(userId);
        if (!superAdmin) return res.status(404).json({ message: 'SuperAdmin not found' });
        Object.assign(superAdmin, fields);
        await superAdmin.save();
      }

      // Delete accepted request after processing
      await request.deleteOne();
    } else {
      await request.save(); // save rejection or modification request
    }

    // Generate professional notification/email
    const user = await User.findById(request.userId);
    let subject, message;
    switch (status) {
      case 'accepted':
        subject = `✅ Your profile ${type} request has been accepted`;
        message = `Your ${type} request has been approved. You may now continue using the platform seamlessly.`;
        break;
      case 'rejected':
        subject = `❌ Your profile ${type} request has been rejected`;
        message = `Unfortunately, your ${type} request was rejected. Reason: ${reviewComment || 'Not specified'}. Please reapply with correct information.`;
        break;
      case 'modification_requested':
        subject = `✏️ Modification needed for your profile ${type} request`;
        message = `Your ${type} request requires modifications. ${reviewComment || 'Please revise and resubmit your profile.'}`;
        break;
    }

    await notifyUser(user._id, subject, message);
    return res.status(200).json({ message: `Request marked as '${status}' and user notified.` });
  } catch (error) {
    console.error(`Error handling ${type} request:`, error);
    // 🛠️ Improved error handling for mongoose validation
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Profile validation failed',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    return res.status(500).json({ message: 'Server error while reviewing request' });
  }
};

exports.acceptRequest = (req, res) => handleReview(req, res, 'accepted');
exports.rejectRequest = (req, res) => handleReview(req, res, 'rejected');
exports.modifyRequest = (req, res) => handleReview(req, res, 'modification_requested');


// // server/controllers/requestReviewController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const notifyUser = require('../utils/notifyUser');

// // Unified handler
// const handleReview = async (req, res, status) => {
//   const { type, requestId } = req.params;
//   const { reviewComment } = req.body;
//   const reviewerId = req.user.userId;

//   try {
//     let requestModel = type === 'creation' ? ProfileCreationRequest : ProfileUpdateRequest;
//     const request = await requestModel.findById(requestId);
//     if (!request) return res.status(404).json({ message: 'Request not found' });

//     if (request.status !== 'pending') {
//       return res.status(400).json({ message: 'Request already reviewed' });
//     }

//     request.status = status;
//     request.reviewedBy = reviewerId;
//     if (reviewComment) request.reviewComment = reviewComment;

//     // Handle ACCEPTED updates to profile
//     if (status === 'accepted') {
//       const { userId, role, fields } = request;

//       // 🛠️ Fix: Ensure required profile fields and handle field name mapping
//       if (role === 'user' || role === 'creator') {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         // Handle field name mapping and required fields
//         const profileUpdate = {
//           ...fields,
//           // Map 'phone' → 'phoneNumber' if needed
//           phoneNumber: fields.phoneNumber || fields.phone,
//           // Ensure socialLinks structure
//           socialLinks: fields.socialLinks || {}
//         };

//         // Remove old phone field if present
//         if (fields.phone) delete profileUpdate.phone;

//         // Merge updates while preserving existing data
//         user.profile = {
//           ...user.profile.toObject(), // Convert Mongoose doc to plain object
//           ...profileUpdate
//         };

//         // ✅ Validate required fields before saving
//         if (!user.profile.fullName || !user.profile.dob || 
//             !user.profile.country || !user.profile.phoneNumber) {
//           return res.status(400).json({ 
//             message: 'Missing required profile fields: fullName, dob, country, phoneNumber' 
//           });
//         }

//         await user.save();
//       } else if (role === 'admin') {
//         // ... existing admin handling unchanged ...
//       } else if (role === 'superadmin') {
//         // ... existing superadmin handling unchanged ...
//       }

//       // Delete accepted request after processing
//       await request.deleteOne();
//     } else {
//       await request.save(); // save rejection or modification request
//     }

//     // Generate professional notification/email
//     const user = await User.findById(request.userId);
//     let subject, message;
//     switch (status) {
//       case 'accepted':
//         subject = `✅ Your profile ${type} request has been accepted`;
//         message = `Your ${type} request has been approved. You may now continue using the platform seamlessly.`;
//         break;
//       case 'rejected':
//         subject = `❌ Your profile ${type} request has been rejected`;
//         message = `Unfortunately, your ${type} request was rejected. Reason: ${reviewComment || 'Not specified'}. Please reapply with correct information.`;
//         break;
//       case 'modification_requested':
//         subject = `✏️ Modification needed for your profile ${type} request`;
//         message = `Your ${type} request requires modifications. ${reviewComment || 'Please revise and resubmit your profile.'}`;
//         break;
//     }

//     await notifyUser(user._id, subject, message);
//     return res.status(200).json({ message: `Request marked as '${status}' and user notified.` });
//   } catch (error) {
//     console.error(`Error handling ${type} request:`, error);
//     // 🛠️ Improved error handling for mongoose validation
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         message: 'Profile validation failed',
//         errors: Object.keys(error.errors).reduce((acc, key) => {
//           acc[key] = error.errors[key].message;
//           return acc;
//         }, {})
//       });
//     }
//     return res.status(500).json({ message: 'Server error while reviewing request' });
//   }
// };

// exports.acceptRequest = (req, res) => handleReview(req, res, 'accepted');
// exports.rejectRequest = (req, res) => handleReview(req, res, 'rejected');
// exports.modifyRequest = (req, res) => handleReview(req, res, 'modification_requested');

// cgpt//
// // server/controllers/requestReviewController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const notifyUser = require('../utils/notifyUser');

// // Unified handler
// const handleReview = async (req, res, status) => {
//   const { type, requestId } = req.params;
//   const { reviewComment } = req.body;
//   const reviewerId = req.user.userId;

//   try {
//     let requestModel = type === 'creation' ? ProfileCreationRequest : ProfileUpdateRequest;
//     const request = await requestModel.findById(requestId);
//     if (!request) return res.status(404).json({ message: 'Request not found' });

//     if (request.status !== 'pending') {
//       return res.status(400).json({ message: 'Request already reviewed' });
//     }

//     request.status = status;
//     request.reviewedBy = reviewerId;
//     if (reviewComment) request.reviewComment = reviewComment;

//     // Handle ACCEPTED updates to profile
//     if (status === 'accepted') {
//       const { userId, role, fields } = request;

//       if (role === 'user' || role === 'creator') {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         user.profile = {
//           ...user.profile,
//           ...fields
//         };
//         await user.save();
//       } else if (role === 'admin') {
//         const admin = await Admin.findById(userId);
//         if (!admin) return res.status(404).json({ message: 'Admin not found' });
//         Object.assign(admin, fields);
//         await admin.save();
//       } else if (role === 'superadmin') {
//         const superAdmin = await SuperAdmin.findById(userId);
//         if (!superAdmin) return res.status(404).json({ message: 'SuperAdmin not found' });
//         Object.assign(superAdmin, fields);
//         await superAdmin.save();
//       }

//       // Delete accepted request after processing
//       await request.deleteOne();
//     } else {
//       await request.save(); // save rejection or modification request
//     }

//     // Generate professional notification/email
//     const user = await User.findById(request.userId);
//     let subject, message;
//     switch (status) {
//       case 'accepted':
//         subject = `✅ Your profile ${type} request has been accepted`;
//         message = `Your ${type} request has been approved. You may now continue using the platform seamlessly.`;
//         break;
//       case 'rejected':
//         subject = `❌ Your profile ${type} request has been rejected`;
//         message = `Unfortunately, your ${type} request was rejected. Reason: ${reviewComment || 'Not specified'}. Please reapply with correct information.`;
//         break;
//       case 'modification_requested':
//         subject = `✏️ Modification needed for your profile ${type} request`;
//         message = `Your ${type} request requires modifications. ${reviewComment || 'Please revise and resubmit your profile.'}`;
//         break;
//     }

//     await notifyUser(user._id, subject, message);
//     return res.status(200).json({ message: `Request marked as '${status}' and user notified.` });
//   } catch (error) {
//     console.error(`Error handling ${type} request:`, error);
//     return res.status(500).json({ message: 'Server error while reviewing request' });
//   }
// };

// exports.acceptRequest = (req, res) => handleReview(req, res, 'accepted');
// exports.rejectRequest = (req, res) => handleReview(req, res, 'rejected');
// exports.modifyRequest = (req, res) => handleReview(req, res, 'modification_requested');


// // // server/controllers/requestReviewController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');
// const notifyUser = require('../utils/notifyUser');

// // Unified handler
// const handleReview = async (req, res, status) => {
//   const { type, requestId } = req.params;
//   const { reviewComment } = req.body;
//   const reviewerId = req.user.userId;

//   try {
//     let requestModel = type === 'creation' ? ProfileCreationRequest : ProfileUpdateRequest;
//     const request = await requestModel.findById(requestId);
//     if (!request) return res.status(404).json({ message: 'Request not found' });

//     request.status = status;
//     request.reviewedBy = reviewerId;
//     if (reviewComment) request.reviewComment = reviewComment;
//     await request.save();

//     // Generate professional notification/email
//     const user = await User.findById(request.userId);
//     let subject, message;
//     switch (status) {
//       case 'accepted':
//         subject = `✅ Your profile ${type} request has been accepted`;
//         message = `Your ${type} request has been approved. You may now continue using the platform seamlessly.`;
//         break;
//       case 'rejected':
//         subject = `❌ Your profile ${type} request has been rejected`;
//         message = `Unfortunately, your ${type} request was rejected. Reason: ${reviewComment || 'Not specified'}. Please reapply with correct information.`;
//         break;
//       case 'modification_requested':
//         subject = `✏️ Modification needed for your profile ${type} request`;
//         message = `Your ${type} request requires modifications. ${reviewComment || 'Please revise and resubmit your profile.'}`;
//         break;
//     }

//     await notifyUser(user._id, subject, message);
//     return res.status(200).json({ message: `Request marked as '${status}' and user notified.` });
//   } catch (error) {
//     console.error(`Error handling ${type} request:`, error);
//     return res.status(500).json({ message: 'Server error while reviewing request' });
//   }
// };

// exports.acceptRequest = (req, res) => handleReview(req, res, 'accepted');
// exports.rejectRequest = (req, res) => handleReview(req, res, 'rejected');
// exports.modifyRequest = (req, res) => handleReview(req, res, 'modification_requested');


// // server/controllers/requestReviewController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User'); // ✅ FIXED: Use User model instead of non-existent Profile

// // 🛠️ Utility to get correct model based on type param
// const getModelByType = (type) => {
//   if (type === 'creation') return ProfileCreationRequest;
//   if (type === 'update') return ProfileUpdateRequest;
//   return null;
// };

// // ✅ Accept request
// exports.acceptRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'accepted';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = 'Approved';
//     await request.save();

//     // Update profile verification status
//     const user = await User.findById(request.userId);
//     if (user) user.isAdminVerified = true; // ✅ Use correct field from User model
//     await user?.save();

//     res.json({ message: 'Request accepted successfully', request });
//   } catch (err) {
//     console.error('Error accepting request:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ❌ Reject request
// exports.rejectRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const { comment } = req.body;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'rejected';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = comment || 'Rejected';
//     await request.save();

//     res.json({ message: 'Request rejected successfully', request });
//   } catch (err) {
//     console.error('Error rejecting request:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✏️ Request modification
// exports.modifyRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const { comment } = req.body;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'modification_requested';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = comment || 'Modification needed';
//     await request.save();

//     res.json({ message: 'Modification requested', request });
//   } catch (err) {
//     console.error('Error requesting modification:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // server/controllers/requestReviewController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const Profile = require('../models/Profile');

// // 🛠️ Utility to get correct model based on type param
// const getModelByType = (type) => {
//   if (type === 'creation') return ProfileCreationRequest;
//   if (type === 'update') return ProfileUpdateRequest;
//   return null;
// };

// // ✅ Accept request
// exports.acceptRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'accepted';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = 'Approved';
//     await request.save();

//     // Update profile verification status
//     const profile = await Profile.findOne({ userId: request.userId });
//     if (profile) profile.isVerified = true;
//     await profile?.save();

//     res.json({ message: 'Request accepted successfully', request });
//   } catch (err) {
//     console.error('Error accepting request:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ❌ Reject request
// exports.rejectRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const { comment } = req.body;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'rejected';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = comment || 'Rejected';
//     await request.save();

//     res.json({ message: 'Request rejected successfully', request });
//   } catch (err) {
//     console.error('Error rejecting request:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✏️ Request modification
// exports.modifyRequest = async (req, res) => {
//   try {
//     const { type, requestId } = req.params;
//     const { comment } = req.body;
//     const reviewer = req.user;

//     const Model = getModelByType(type);
//     if (!Model) return res.status(400).json({ error: 'Invalid request type' });

//     const request = await Model.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = 'modification_requested';
//     request.reviewedBy = reviewer.userId;
//     request.reviewComment = comment || 'Modification needed';
//     await request.save();

//     res.json({ message: 'Modification requested', request });
//   } catch (err) {
//     console.error('Error requesting modification:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
