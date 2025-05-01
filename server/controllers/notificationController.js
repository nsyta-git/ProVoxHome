// server/controllers/notificationController.js

const Notification = require('../models/Notification');

/**
 * Fetches all unseen 'admin' type notifications for Admins and SuperAdmins.
 */
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ type: 'admin' })
      .sort({ createdAt: -1 }) // newest first
      .populate('user', 'name email');

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};


// // server/controllers/notificationController.js

// const Notification = require('../models/Notification');
// const User = require('../models/User');

// /**
//  * Fetches all pending profile creation/update requests and system notifications.
//  * Accessible by Admins and SuperAdmins.
//  */
// exports.getNotifications = async (req, res) => {
//   try {
//     // Fetch pending profile creation requests
//     const creationRequests = await Notification.find({ type: 'profile_creation', status: 'pending' })
//       .populate('user', 'name email');

//     // Fetch pending profile update requests
//     const updateRequests = await Notification.find({ type: 'profile_update', status: 'pending' })
//       .populate('user', 'name email');

//     // Fetch other system notifications
//     const systemNotifications = await Notification.find({ type: 'system' })
//       .populate('user', 'name email');

//     res.status(200).json({
//       creationRequests,
//       updateRequests,
//       systemNotifications,
//     });
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     res.status(500).json({ message: 'Server error while fetching notifications' });
//   }
// };
