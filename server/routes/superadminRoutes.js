// server/routes/superadminRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/superadmin/notifications
router.get(
  '/notifications',
  authenticateUser,
  authorizeRoles('superadmin'),
  notificationController.getAdminNotifications
);

module.exports = router;


// // server/routes/superadminRoutes.js

// const express = require('express');
// const router = express.Router();
// const notificationController = require('../controllers/notificationController');
// const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// // Route: GET /api/superadmin/notifications
// // Access: SuperAdmin
// router.get('/notifications', authenticateUser, authorizeRoles('superadmin'), notificationController.getNotifications);

// module.exports = router;
