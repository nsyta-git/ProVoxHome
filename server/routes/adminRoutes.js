// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/admin/notifications
router.get(
  '/notifications',
  authenticateUser,
  authorizeRoles('admin'),
  notificationController.getAdminNotifications
);

module.exports = router;
// // server/routes/adminRoutes.js

// const express = require('express');
// const router = express.Router();
// const notificationController = require('../controllers/notificationController');
// const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// // Route: GET /api/admin/notifications
// // Access: Admin
// router.get('/notifications', authenticateUser, authorizeRoles('admin'), notificationController.getNotifications);

// module.exports = router;
