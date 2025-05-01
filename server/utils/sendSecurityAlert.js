// server/utils/sendSecurityAlert.js

const sendEmail = require('./sendEmail');

const sendSecurityAlert = async (email, ipAddress) => {
  const htmlContent = `
    <h3>⚠️ Security Alert</h3>
    <p>We detected multiple failed OTP verification attempts for your ProVoxHome account.</p>
    <p>IP Address: ${ipAddress}</p>
    <p>As a precaution, profile access is locked for 12 hours.</p>
    <p>If this wasn’t you, please contact support immediately.</p>
  `;

  await sendEmail(email, 'ProVoxHome - Security Alert', htmlContent);
};

module.exports = sendSecurityAlert;
