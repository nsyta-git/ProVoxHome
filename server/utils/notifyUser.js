
// server/utils/notifyUser.js

const sendEmail = require('./sendEmail');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Sends a professional in-app + email notification to the user.
 * @param {string} userId
 * @param {string} subject - Email subject and in-app title
 * @param {string} message - Body content for both email and app
 */
const notifyUser = async (userId, subject, message) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 1. In-App Notification
    const newNotification = new Notification({
      user: user._id,
      title: subject,
      description: message,
      message,
      type: 'system'
    });
    await newNotification.save();

    // 2. Email Notification
    if (user.email) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <br/>
          <p style="font-size: 14px; color: #666;">— ProVoxHome Team</p>
        </div>
      `;
      await sendEmail(user.email, subject, htmlContent);
    }
  } catch (error) {
    console.error('Error in notifyUser utility:', error);
  }
};

module.exports = notifyUser;


// //sever/utils/notifyUser.js

// const sendEmail = require('./sendEmail');
// const Notification = require('../models/Notification');
// const User = require('../models/User');

// /**
//  * Sends a professional in-app + email notification to the user.
//  * @param {string} userId
//  * @param {string} subject - Email subject and in-app title
//  * @param {string} message - Body content for both email and app
//  */
// const notifyUser = async (userId, subject, message) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) return;

//     // 1. In-App Notification
//     const newNotification = new Notification({
//       user: user._id,
//       title: subject,
//       description: message,
//       message,
//       type: 'system'
//     });
//     await newNotification.save();

//     // 2. Email Notification
//     if (user.email) {
//       const htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 16px;">
//           <h2>${subject}</h2>
//           <p>${message}</p>
//           <br/>
//           <p style="font-size: 14px; color: #666;">— ProVoxHome Team</p>
//         </div>
//       `;
//       await sendEmail(user.email, subject, htmlContent);
//     }
//   } catch (error) {
//     console.error('Error in notifyUser utility:', error);
//   }
// };

// module.exports = notifyUser;


// const sendEmail = require('./sendEmail');
// const Notification = require('../models/Notification');
// const User = require('../models/User');

// const notifyUser = async (userId, subject, message) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) return;

//     // 1. In-App Notification
//     const newNotification = new Notification({
//       user: user._id,
//       message,
//     });
//     await newNotification.save();

//     // 2. Email Notification
//     if (user.email) {
//       await sendEmail({
//         to: user.email,
//         subject,
//         text: message,
//       });
//     }
//   } catch (error) {
//     console.error('Error in notifyUser utility:', error);
//   }
// };

// module.exports = notifyUser;
