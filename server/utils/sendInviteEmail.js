// server/utils/sendInviteEmail.js
// SENDS INVITE EMAIL to admins with code and link

const nodemailer = require('nodemailer');

const sendInviteEmail = async (toEmail, inviteLink, inviteCode) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    await transporter.sendMail({
      from: `"ProVoxHome Admin Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Admin Invitation to ProVoxHome',
      html: `
        <h2>You've been invited to become an Admin!</h2>
        <p>Use the following code during signup: <strong>${inviteCode}</strong></p>
        <p>Click the link to start signing up: <a href="${inviteLink}">${inviteLink}</a></p>
        <p>Let's build the future together 🚀</p>
      `,
    });

    console.log('Invitation email sent to', toEmail);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = sendInviteEmail;
