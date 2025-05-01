// server/utils/notifyAdmins.js

const User = require('../models/User');
const sendEmail = require('./sendEmail');

const notifyAdmins = async (subject, htmlContent) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }, 'email');
  const recipients = admins.map(a => a.email);

  for (const email of recipients) {
    await sendEmail(email, subject, htmlContent);
  }
};

module.exports = notifyAdmins;
