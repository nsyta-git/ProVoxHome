//server/utils/notifyAuthorities.js

const sendEmail = require('./sendEmail');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

module.exports = async function notifyAuthorities(role, userId, type, fields) {
  const authorities = (role === 'admin') 
    ? await SuperAdmin.find({}) 
    : await Admin.find({});

  const subject = `New Profile ${type === 'creation' ? 'Creation' : 'Update'} Request Received`;
  const fieldList = Object.entries(fields).map(([k, v]) => `<li><strong>${k}</strong>: ${v}</li>`).join('');
  
  const html = `
    <p>Hello Authority,</p>
    <p>A user with role <strong>${role}</strong> has submitted a profile ${type} request.</p>
    <p>Requested fields:</p>
    <ul>${fieldList}</ul>
    <p>Please review and take necessary action in the ProVoxHome dashboard.</p>
    <br/>
    <p>Regards,<br/>ProVoxHome System</p>
  `;

  await Promise.all(
    authorities.map(({ email }) => sendEmail(email, subject, html))
  );
};
