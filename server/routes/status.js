const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const statusController = require('../controllers/statusController');

// Root route for profile status summary
router.get('/profile', isAuthenticated, statusController.checkProfileStatus);

// Profile creation request status
router.get('/profile/create', isAuthenticated, statusController.checkProfileCreationStatus);

// Profile update request status
router.get('/profile/update', isAuthenticated, statusController.checkProfileUpdateStatus);

module.exports = router;
