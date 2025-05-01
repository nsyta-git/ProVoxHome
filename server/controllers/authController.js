
// server/controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup
exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await User.create({ email, passwordHash, role });
    const otpCode = generateOTP();

    await Otp.create({
      email,
      code: otpCode,
      purpose: 'verifyEmail',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      'Verify Your Email for ProVoxHub',
      `Your OTP code for email verification is: ${otpCode}`
    );

    res.status(201).json({ message: 'Signup successful, verify your email' });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, code: otp, purpose: 'verifyEmail', used: false });
    if (!record || record.expiresAt < Date.now())
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    await User.updateOne({ email }, { isEmailVerified: true });
    record.used = true;
    await record.save();
    res.json({ message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// Forgot Password (send OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpCode = generateOTP();
    await Otp.create({
      email,
      code: otpCode,
      purpose: 'resetPassword',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      'Reset Your ProVoxHub Password',
      `Your OTP for password reset is: ${otpCode}`
    );

    res.json({ message: 'OTP sent for password reset' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
  }
};

// Verify OTP for password reset
exports.verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

    if (!record || record.expiresAt < Date.now())
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { passwordHash });

    record.used = true;
    await record.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const otpCode = generateOTP();

    await Otp.create({
      email,
      code: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      'New OTP for ProVoxHub',
      `Your new OTP code is: ${otpCode}`
    );

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Resend failed', error: err.message });
  }
};

// Get Logged In User Info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};



// const User = require('../models/User');
// const Otp = require('../models/Otp');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/sendEmail');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Signup
// exports.signup = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already exists' });

//     const passwordHash = await bcrypt.hash(password, 12);
//     const newUser = await User.create({ email, passwordHash, role });
//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'verifyEmail',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Verify Your Email for ProVoxHub',
//       `Your OTP code for email verification is: ${otpCode}

// Please use the following API endpoint to verify your email:

// POST /api/auth/verify-email

// Example request body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}"
// }

// This OTP will expire in 10 minutes.`
//     );

//     console.log(`[OTP sent] Email: ${email}, Code: ${otpCode}`);
//     res.status(201).json({ message: 'Signup successful, verify your email' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup error', error: err.message });
//   }
// };

// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.passwordHash)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '7d'
//     });

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// };

// // Email Verification
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'verifyEmail', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     await User.updateOne({ email }, { isEmailVerified: true });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Email verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'Verification failed', error: err.message });
//   }
// };

// // Verify Reset OTP (used by ForgotPassword.jsx)
// exports.verifyResetOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     res.json({ message: 'OTP verified. Proceed to reset password.' });
//   } catch (err) {
//     res.status(500).json({ message: 'OTP verification failed', error: err.message });
//   }
// };

// // Resend OTP
// exports.resendOtp = async (req, res) => {
//   try {
//     const { email, purpose } = req.body;

//     if (!email || !purpose) {
//       return res.status(400).json({ message: 'Email and purpose are required' });
//     }

//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose,
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'New OTP from ProVoxHub',
//       `Your new OTP code is: ${otpCode}

// Please use the corresponding API endpoint to verify:

// For Email Verification:
// POST /api/auth/verify-email

// For Password Reset:
// POST /api/auth/reset-password

// This OTP will expire in 10 minutes.`
//     );

//     res.json({ message: 'OTP sent again' });
//   } catch (err) {
//     res.status(500).json({ message: 'Resend failed', error: err.message });
//   }
// };

// // Forgot Password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const otpCode = generateOTP();
//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'resetPassword',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Reset Your ProVoxHub Password',
//       `Your OTP for password reset is: ${otpCode}

// To reset your password, make a POST request to:

// /api/auth/reset-password

// Example body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}",
//   "newPassword": "yourNewPasswordHere"
// }

// This OTP will expire in 10 minutes.`
//     );

//     res.json({ message: 'OTP sent for password reset' });
//     console.log(`🔐 Forgot Pass OTP for ${email}: ${otpCode}`);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
//   }
// };

// // Reset Password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     const passwordHash = await bcrypt.hash(newPassword, 12);
//     await User.updateOne({ email }, { passwordHash });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Password reset successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Reset failed', error: err.message });
//   }
// };

// // ✅ General OTP Verifier
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp, purpose } = req.body;

//     if (!email || !otp || !purpose) {
//       return res.status(400).json({ message: 'Email, OTP, and purpose are required' });
//     }

//     const record = await Otp.findOne({ email, code: otp, purpose, used: false });

//     if (!record || record.expiresAt < Date.now()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     res.json({ message: 'OTP verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'OTP verification failed', error: err.message });
//   }
// };




// const User = require('../models/User');
// const Otp = require('../models/Otp');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/sendEmail');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// exports.signup = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already exists' });

//     const passwordHash = await bcrypt.hash(password, 12);
//     const newUser = await User.create({ email, passwordHash, role });
//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'verifyEmail',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Verify Your Email for ProVoxHub',
//       `Your OTP code for email verification is: ${otpCode}

// Please use the following API endpoint to verify your email:

// POST /api/auth/verify-email

// Example request body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}"
// }

// This OTP will expire in 10 minutes.`
//     );

//     console.log(`[OTP sent] Email: ${email}, Code: ${otpCode}`);
//     res.status(201).json({ message: 'Signup successful, verify your email' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup error', error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.passwordHash)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '7d'
//     });

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'verifyEmail', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     await User.updateOne({ email }, { isEmailVerified: true });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Email verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'Verification failed', error: err.message });
//   }
// };

// // ✅ NEW: verify-reset-otp endpoint (used by ForgotPassword.jsx)
// exports.verifyResetOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     res.json({ message: 'OTP verified. Proceed to reset password.' });
//   } catch (err) {
//     res.status(500).json({ message: 'OTP verification failed', error: err.message });
//   }
// };

// exports.resendOtp = async (req, res) => {
//   try {
//     const { email, purpose } = req.body;

//     if (!email || !purpose) {
//       return res.status(400).json({ message: 'Email and purpose are required' });
//     }

//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose,
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'New OTP from ProVoxHub',
//       `Your new OTP code is: ${otpCode}

// Please use the corresponding API endpoint to verify:

// For Email Verification:
// POST /api/auth/verify-email

// For Password Reset:
// POST /api/auth/reset-password

// This OTP will expire in 10 minutes.`
//     );

//     res.json({ message: 'OTP sent again' });
//   } catch (err) {
//     res.status(500).json({ message: 'Resend failed', error: err.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const otpCode = generateOTP();
//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'resetPassword',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Reset Your ProVoxHub Password',
//       `Your OTP for password reset is: ${otpCode}

// To reset your password, make a POST request to:

// /api/auth/reset-password

// Example body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}",
//   "newPassword": "yourNewPasswordHere"
// }

// This OTP will expire in 10 minutes.`
//     );

//     res.json({ message: 'OTP sent for password reset' });
//     console.log(`🔐 Forgot Pass OTP for ${email}: ${otpCode}`);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });

//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     const passwordHash = await bcrypt.hash(newPassword, 12);
//     await User.updateOne({ email }, { passwordHash });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Password reset successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Reset failed', error: err.message });
//   }

//   // Verify OTP for email or password before final step
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp, purpose } = req.body;

//     if (!email || !otp || !purpose) {
//       return res.status(400).json({ message: 'Email, OTP, and purpose are required' });
//     }

//     const record = await Otp.findOne({ email, code: otp, purpose, used: false });

//     if (!record || record.expiresAt < Date.now()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     // Optionally mark OTP as used here if you want one-time only usage at this stage
//     // record.used = true;
//     // await record.save();

//     res.json({ message: 'OTP verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'OTP verification failed', error: err.message });
//   }
// };

// };




// const User = require('../models/User');
// const Otp = require('../models/Otp');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/sendEmail');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// exports.signup = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already exists' });

//     const passwordHash = await bcrypt.hash(password, 12);
//     const newUser = await User.create({ email, passwordHash, role });
//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'verifyEmail',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Verify Your Email for ProVoxHub',
//       `Your OTP code for email verification is: ${otpCode}

// Please use the following API endpoint to verify your email:

// POST /api/auth/verify-email

// Example request body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}"
// }

// This OTP will expire in 10 minutes.
// `
//     );

//     console.log(`[OTP sent] Email: ${email}, Code: ${otpCode}`);

//     res.status(201).json({ message: 'Signup successful, verify your email' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup error', error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.passwordHash)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '7d'
//     });

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'verifyEmail', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     await User.updateOne({ email }, { isEmailVerified: true });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Email verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'Verification failed', error: err.message });
//   }
// };

// // exports.resendOtp = async (req, res) => {
// //   try {
// //     const { email, purpose } = req.body;
// //     const otpCode = generateOTP();

// //     await Otp.create({
// //       email,
// //       code: otpCode,
// //       purpose,
// //       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
// //     });

// //     await sendEmail(
// //       email,
// //       'New OTP from ProVoxHub',
// //       `Your new OTP code is: ${otpCode}

// // Please use the corresponding API endpoint to verify:

// // For Email Verification:
// // POST /api/auth/verify-email

// // For Password Reset:
// // POST /api/auth/reset-password

// // Example body:
// // {
// //   "email": "${email}",
// //   "otp": "${otpCode}",
// //   "newPassword": "yourNewPasswordHere" // only required for reset-password
// // }

// // This OTP will expire in 10 minutes.
// // `
// //     );

// //     res.json({ message: 'OTP sent again' });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Resend failed', error: err.message });
// //   }
// // };

// exports.resendOtp = async (req, res) => {
//   try {
//     const { email, purpose } = req.body;

//     if (!email || !purpose) {
//       return res.status(400).json({ message: 'Email and purpose are required' });
//     }

//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose,
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'New OTP from ProVoxHub',
//       `Your new OTP code is: ${otpCode}

// Please use the corresponding API endpoint to verify:

// For Email Verification:
// POST /api/auth/verify-email

// For Password Reset:
// POST /api/auth/reset-password

// This OTP will expire in 10 minutes.
// `
//     );

//     res.json({ message: 'OTP sent again' });
//   } catch (err) {
//     res.status(500).json({ message: 'Resend failed', error: err.message });
//   }
// };


// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const otpCode = generateOTP();
//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'resetPassword',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Reset Your ProVoxHub Password',
//       `Your OTP for password reset is: ${otpCode}

// To reset your password, make a POST request to:

// /api/auth/reset-password

// Example body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}",
//   "newPassword": "yourNewPasswordHere"
// }

// This OTP will expire in 10 minutes.
// `
//     );

//     res.json({ message: 'OTP sent for password reset' });
//     console.log(`🔐 Forgot Pass OTP for ${email}: ${otpCode}`);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     const passwordHash = await bcrypt.hash(newPassword, 12);
//     await User.updateOne({ email }, { passwordHash });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Password reset successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Reset failed', error: err.message });
//   }
// };




// //server/controllers/authController.js

// const User = require('../models/User');
// const Otp = require('../models/Otp');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/sendEmail');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// exports.signup = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already exists' });

//     const passwordHash = await bcrypt.hash(password, 12);
//     const newUser = await User.create({ email, passwordHash, role });
//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'verifyEmail',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Verify Your Email for ProVoxHub',
//       `Your OTP code for email verification is: ${otpCode}

// Please use the following API endpoint to verify your email:

// POST /api/auth/verify-email

// Example request body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}"
// }

// This OTP will expire in 10 minutes.
// `
//     );

//     res.status(201).json({ message: 'Signup successful, verify your email' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup error', error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.passwordHash)))
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '7d'
//     });

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Login error', error: err.message });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'verifyEmail', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     await User.updateOne({ email }, { isEmailVerified: true });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Email verified' });
//   } catch (err) {
//     res.status(500).json({ message: 'Verification failed', error: err.message });
//   }
// };

// exports.resendOtp = async (req, res) => {
//   try {
//     const { email, purpose } = req.body;
//     const otpCode = generateOTP();

//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose,
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'New OTP from ProVoxHub',
//       `Your new OTP code is: ${otpCode}

// Please use the corresponding API endpoint to verify:

// For Email Verification:
// POST /api/auth/verify-email

// For Password Reset:
// POST /api/auth/reset-password

// Example body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}",
//   "newPassword": "yourNewPasswordHere" // only required for reset-password
// }

// This OTP will expire in 10 minutes.
// `
//     );

//     res.json({ message: 'OTP sent again' });
//   } catch (err) {
//     res.status(500).json({ message: 'Resend failed', error: err.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const otpCode = generateOTP();
//     await Otp.create({
//       email,
//       code: otpCode,
//       purpose: 'resetPassword',
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000)
//     });

//     await sendEmail(
//       email,
//       'Reset Your ProVoxHub Password',
//       `Your OTP for password reset is: ${otpCode}

// To reset your password, make a POST request to:

// /api/auth/reset-password

// Example body:
// {
//   "email": "${email}",
//   "otp": "${otpCode}",
//   "newPassword": "yourNewPasswordHere"
// }

// This OTP will expire in 10 minutes.
// `
//     );

//     res.json({ message: 'OTP sent for password reset' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const record = await Otp.findOne({ email, code: otp, purpose: 'resetPassword', used: false });
//     if (!record || record.expiresAt < Date.now())
//       return res.status(400).json({ message: 'Invalid or expired OTP' });

//     const passwordHash = await bcrypt.hash(newPassword, 12);
//     await User.updateOne({ email }, { passwordHash });
//     record.used = true;
//     await record.save();
//     res.json({ message: 'Password reset successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Reset failed', error: err.message });
//   }
// };

// console.log(`[OTP sent] Email: ${email}, Code: ${otpCode}`);



