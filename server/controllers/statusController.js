// server/controllers/statusController.js

const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ProfileCreationRequest = require('../models/ProfileCreationRequest');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');

// 🔹 [1] Check if profile exists with proper message
exports.checkProfileStatus = async (req, res) => {
  const { userId, role } = req.user;

  try {
    let profileExists = false;

    if (role === 'user' || role === 'creator') {
      const user = await User.findById(userId);
      profileExists = !!user?.profile?.fullName;
    } else if (role === 'admin') {
      const admin = await Admin.findById(userId);
      profileExists = !!admin?.fullName;
    } else if (role === 'superadmin') {
      const sa = await SuperAdmin.findById(userId);
      profileExists = !!sa?.fullName;
    }

    if (profileExists) {
      return res.status(200).json({
        status: "created",
        message: "Your profile has been successfully created and is accessible."
      });
    } else {
      return res.status(200).json({
        status: "not_created",
        message: "You have not yet created a profile. Please create your profile to access full features."
      });
    }
  } catch (err) {
    console.error('Error checking profile status:', err);
    return res.status(500).json({ message: 'Server error while checking profile status.' });
  }
};

// 🔹 [2] Check profile creation request status
exports.checkProfileCreationStatus = async (req, res) => {
  const { userId } = req.user;

  try {
    const request = await ProfileCreationRequest.findOne({ userId });

    if (!request) {
      // Now check if profile already created
      const user = await User.findById(userId);
      if (user?.profile?.fullName) {
        return res.status(200).json({
          status: "completed",
          message: "No profile creation request found. Your profile is already created and active."
        });
      } else {
        return res.status(404).json({
          status: "not_found",
          message: "No profile creation request found. Please create your profile to access features."
        });
      }
    }

    return res.status(200).json({
      status: "pending",
      message: "Your profile creation request is currently under review by the authority.",
      request: request
    });

  } catch (err) {
    console.error('Error checking profile creation request:', err);
    return res.status(500).json({ message: 'Server error while checking profile creation request.' });
  }
};

// 🔹 [3] Check profile update request status
exports.checkProfileUpdateStatus = async (req, res) => {
  const { userId } = req.user;

  try {
    const request = await ProfileUpdateRequest.findOne({ userId });

    if (!request) {
      return res.status(200).json({
        status: "no_request",
        message: "You do not have any active profile update requests at this time."
      });
    }

    return res.status(200).json({
      status: "pending",
      message: "Your profile update request is currently being reviewed by the authority.",
      request: request
    });

  } catch (err) {
    console.error('Error checking profile update request:', err);
    return res.status(500).json({ message: 'Server error while checking profile update request.' });
  }
};
