const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendEmail(email, 'Verify Your Email', `Your OTP: ${otpCode}`);
    res.status(201).json({ message: 'Signup successful, verify your email' });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

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

exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const otpCode = generateOTP();

    await Otp.create({
      email,
      code: otpCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendEmail(email, 'New OTP', `Your OTP: ${otpCode}`);
    res.json({ message: 'OTP sent again' });
  } catch (err) {
    res.status(500).json({ message: 'Resend failed', error: err.message });
  }
};

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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendEmail(email, 'Reset Password OTP', `Your OTP: ${otpCode}`);
    res.json({ message: 'OTP sent for password reset' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset OTP', error: err.message });
  }
};

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



