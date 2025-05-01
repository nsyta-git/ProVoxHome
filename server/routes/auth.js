//server/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/deleted ---authMiddleware'); // ✅ Import token verification

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-password-otp', authController.verifyResetPasswordOtp); // ✅ new correct
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOtp);

// ✅ NEW: Protected route to get logged-in user's info
router.get('/me', verifyToken, authController.getMe); 

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.post('/verify-email', authController.verifyEmail);
// router.post('/verify-email-otp', authController.verifyOtp); // <-- ✅ New line
// router.post('/verify-reset-otp', authController.verifyResetOtp); // ✅ New route
// router.post('/resend-otp', authController.resendOtp);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

// module.exports = router;
