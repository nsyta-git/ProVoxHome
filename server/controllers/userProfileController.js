
// server/controllers/userProfileController.js

const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ProfileCreationRequest = require('../models/ProfileCreationRequest');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const generateOtp = require('../utils/generateOtp');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const notifyAuthorities = require('../utils/notifyAuthorities');

exports.checkProfileExists = async (req, res) => {
  const { role, userId } = req.user;

  try {
    console.log(`[checkProfileExists] Checking for role: ${role}, userId: ${userId}`);
    let exists = false;

    if (role === 'user' || role === 'creator') {
      const user = await User.findById(userId);
      exists = user?.profile?.fullName ? true : false;

    } else if (role === 'admin') {
      const admin = await Admin.findById(userId);
      exists = admin?.fullName ? true : false;

    } else if (role === 'superadmin') {
      const sa = await SuperAdmin.findById(userId);
      exists = sa?.fullName ? true : false;
    }

    console.log(`[checkProfileExists] Profile exists: ${exists}`);
    res.json({ exists });
  } catch (err) {
    console.error('Error checking profile existence:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


    // Get logged-in user's full profile
exports.getOwnProfile = async (req, res) => {
  const { userId, role } = req.user;

  try {
    let profileData = null;

    if (role === 'user' || role === 'creator') {
      const user = await User.findById(userId);
      if (!user?.profile?.fullName) {
        return res.status(404).json({ message: 'Profile not created yet. Please create your profile.' });
      }
      profileData = user.profile;

    } else if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (!admin?.fullName) {
        return res.status(404).json({ message: 'Admin profile not created yet.' });
      }
      profileData = {
        fullName: admin.fullName,
        contact: admin.contact,
        department: admin.department,
        // Add other fields as needed
      };

    } else if (role === 'superadmin') {
      const superadmin = await SuperAdmin.findById(userId);
      if (!superadmin) {
        return res.status(404).json({ message: 'Superadmin not found.' });
      }
      profileData = {
        email: superadmin.email,
        fullName: superadmin.fullName,
        role: 'superadmin',
      };
    }

    res.status(200).json({ profile: profileData });
  } catch (err) {
    console.error('Error fetching own profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Public view of user profile by ID
exports.getPublicProfileById = async (req, res) => {
  const { userId } = req.params;

  try {
    let user = await User.findById(userId);
    if (user?.profile?.fullName) {
      const { fullName, gender, state, bio, profession, profilePicture, orgName, website } = user.profile;
      return res.status(200).json({
        role: 'user',
        profile: { fullName, gender, state, bio, profession, profilePicture, orgName, website }
      });
    }

    let creator = await User.findOne({ _id: userId, role: 'creator' });
    if (creator?.profile?.fullName) {
      const { fullName, gender, state, bio, profession, profilePicture, orgName, website } = creator.profile;
      return res.status(200).json({
        role: 'creator',
        profile: { fullName, gender, state, bio, profession, profilePicture, orgName, website }
      });
    }

    let admin = await Admin.findById(userId);
    if (admin?.fullName) {
      return res.status(200).json({
        role: 'admin',
        profile: {
          fullName: admin.fullName,
          contact: admin.contact,
          department: admin.department,
        }
      });
    }

    // If no valid profile found
    return res.status(404).json({ message: 'Profile not found or not yet created.' });

  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestProfileUpdate = async (req, res) => {
  const { userId, role } = req.user;
  const data = req.body;

  try {
    console.log(`[requestProfileUpdate] Received update request from ${role} (${userId})`);
    const mandatoryFields = {
      user: ['fullName', 'phone', 'location', 'age'],
      creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
      admin: ['fullName', 'dob', 'country', 'phoneNumber'],
      superadmin: []
    };

    const requiredFields = mandatoryFields[role] || [];
    const missing = requiredFields.filter(field => !data[field]);

    if (missing.length) {
      console.warn(`[requestProfileUpdate] Missing mandatory fields: ${missing.join(', ')}`);
      return res.status(400).json({
        message: `Missing mandatory fields: ${missing.join(', ')}`
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await ProfileUpdateRequest.findOneAndDelete({ userId });
    console.log(`[requestProfileUpdate] Previous update request (if any) cleared for ${userId}`);

    await ProfileUpdateRequest.create({
      userId,
      role,
      fields: data,
      otp,
      expiresAt
    });
    console.log(`[requestProfileUpdate] New update request stored with OTP`);

    let userDoc;
    if (role === 'user' || role === 'creator') {
      userDoc = await User.findById(userId);
    } else if (role === 'admin') {
      userDoc = await Admin.findById(userId);
    } else if (role === 'superadmin') {
      userDoc = await SuperAdmin.findById(userId);
    }

    if (!userDoc || !userDoc.email) {
      console.error(`[requestProfileUpdate] Email not found for ${role} with ID: ${userId}`);
      return res.status(404).json({ message: 'Email not found for this user' });
    }

    const email = userDoc.email;

    await Otp.create({
      email,
      code: otp,
      purpose: 'profileUpdation',
      expiresAt
    });
    console.log(`[requestProfileUpdate] OTP stored in DB for ${email}`);

    const subject = 'ProVoxHome Profile Verification OTP';
    const html = `
      <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
      <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
      <p>Please use the following OTP to proceed with your request:</p>
      <h2 style="color: #2e6c80;">${otp}</h2>
      <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      <p>Thank you for being part of the ProVoxHome community.</p>
      <br/>
      <p>Warm regards,<br/>ProVoxHome Team</p>
    `;

    await sendEmail(email, subject, html);
    console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

    res.json({ message: 'OTP sent to your registered email' });

  } catch (err) {
    console.error('Error in requestProfileUpdate:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtpAndProcessUpdate = async (req, res) => {
  const { userId, role } = req.user;
  console.log(`[verifyOtpAndProcessUpdate] Verifying OTP for userId: ${userId}, role: ${role}`);

  // ✅ Fetch email from DB
  let doc;
  if (role === 'user' || role === 'creator') {
    doc = await User.findById(userId);
  } else if (role === 'admin') {
    doc = await Admin.findById(userId);
  } else {
    doc = await SuperAdmin.findById(userId);
  }

  const email = doc?.email;
  if (!email) {
    console.log(`[verifyOtpAndProcessUpdate] Email not found for userId: ${userId}`);
    return res.status(404).json({ message: 'Email not found' });
  }

  const { otp, ...updateFields } = req.body;

  const optionalMap = {
    user: ['bio', 'gender'],
    creator: ['bio', 'website', 'focusArea'],
    admin: ['designation', 'bio'],
    superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio']
  };

  const mandatoryMap = {
    user: ['fullName', 'phone', 'location', 'age'],
    creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
    admin: ['fullName', 'dob', 'country', 'phoneNumber'],
    superadmin: []
  };

  const optionalFields = optionalMap[role] || [];
  const mandatoryFields = mandatoryMap[role] || [];

  const optionalToUpdate = {};
  const mandatoryToRequest = {};

  for (let key in updateFields) {
    if (optionalFields.includes(key)) optionalToUpdate[key] = updateFields[key];
    else if (mandatoryFields.includes(key)) mandatoryToRequest[key] = updateFields[key];
    else {
      console.warn(`[verifyOtpAndProcessUpdate] Invalid field: ${key}`);
      return res.status(400).json({ message: `Invalid field: ${key}` });
    }
  }

  try {
    const otpRecord = await Otp.findOne({
      email,
      code: otp,
      purpose: 'profileUpdation',
      expiresAt: { $gt: new Date() },
      used: false
    });

    if (!otpRecord) {
      console.warn(`[verifyOtpAndProcessUpdate] Invalid or expired OTP for ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.used = true;
    await otpRecord.save();
    console.log(`[verifyOtpAndProcessUpdate] OTP marked as used for ${email}`);

    const updatedOptionalKeys = Object.keys(optionalToUpdate);

    if (updatedOptionalKeys.length > 0) {
      if (role === 'user' || role === 'creator') {
        const update = {};
        for (let key of updatedOptionalKeys) {
          update[`profile.${key}`] = optionalToUpdate[key];
        }
        await User.updateOne({ _id: userId }, { $set: update });
      } else if (role === 'admin') {
        await Admin.updateOne({ _id: userId }, { $set: optionalToUpdate });
      } else if (role === 'superadmin') {
        await SuperAdmin.updateOne({ _id: userId }, { $set: optionalToUpdate });
      }
      console.log(`[verifyOtpAndProcessUpdate] Optional fields updated: ${updatedOptionalKeys.join(', ')}`);
    }

    if (Object.keys(mandatoryToRequest).length === 0) {
      return res.json({
        message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}`
      });
    }

    const isProfileCreated = (role === 'user' || role === 'creator')
      ? !!doc.profile?.fullName
      : !!doc.fullName;

    const RequestModel = isProfileCreated
      ? ProfileUpdateRequest
      : ProfileCreationRequest;

    const requestType = isProfileCreated ? 'update' : 'creation';

    await RequestModel.findOneAndDelete({ userId });
    console.log(`[verifyOtpAndProcessUpdate] Cleared previous ${requestType} request if any`);

    await RequestModel.create({
      userId,
      role,
      fields: mandatoryToRequest
    });

    console.log(`[verifyOtpAndProcessUpdate] Created new ${requestType} request`);

    await notifyAuthorities(role, userId, requestType, mandatoryToRequest);
    console.log(`[verifyOtpAndProcessUpdate] Authorities notified`);

    const subject = 'Your ProVoxHome profile request is under review';
    const html = `
      <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
      <p>Your request for ${requestType} of your profile has been submitted for authority review.</p>
      ${updatedOptionalKeys.length > 0 ? `
      <p>The following optional fields were updated successfully:</p>
      <ul>${updatedOptionalKeys.map(k => `<li>${k}</li>`).join('')}</ul>` : ''}
      <p>The remaining fields require verification. Authorities will review your request shortly.</p>
      <p>Thank you for contributing to the ProVoxHome platform.</p>
      <br/>
      <p>Warm regards,<br/>ProVoxHome Team</p>
    `;

    await sendEmail(email, subject, html);
    console.log(`[verifyOtpAndProcessUpdate] Email sent to ${email} about ${requestType} request`);

    res.json({
      message: `Updated optional fields: ${updatedOptionalKeys.join(', ') || 'None'}. Mandatory updates pending verification.`
    });

  } catch (err) {
    console.error('Error in verifyOtpAndProcessUpdate:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const notifyAuthorities = require('../utils/notifyAuthorities');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     console.log(`[checkProfileExists] Checking for role: ${role}, userId: ${userId}`);
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     console.log(`[checkProfileExists] Profile exists: ${exists}`);
//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const data = req.body;

//   try {
//     console.log(`[requestProfileUpdate] Received update request from ${role} (${userId})`);
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: []
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       console.warn(`[requestProfileUpdate] Missing mandatory fields: ${missing.join(', ')}`);
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await ProfileUpdateRequest.findOneAndDelete({ userId });
//     console.log(`[requestProfileUpdate] Previous update request (if any) cleared for ${userId}`);

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       fields: data,
//       otp,
//       expiresAt
//     });
//     console.log(`[requestProfileUpdate] New update request stored with OTP`);

//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       console.error(`[requestProfileUpdate] Email not found for ${role} with ID: ${userId}`);
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//     await Otp.create({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt
//     });
//     console.log(`[requestProfileUpdate] OTP stored in DB for ${email}`);

//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);
//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.verifyOtpAndProcessUpdate = async (req, res) => {
//   const { userId, role, email} = req.user;
//   const { otp, ...updateFields } = req.body;

//   console.log(`[verifyOtpAndProcessUpdate] Verifying OTP for userId: ${userId}, role: ${role}`);

//   const optionalMap = {
//     user: ['bio', 'gender'],
//     creator: ['bio', 'website', 'focusArea'],
//     admin: ['designation', 'bio'],
//     superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio']
//   };

//   const mandatoryMap = {
//     user: ['fullName', 'phone', 'location', 'age'],
//     creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//     admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//     superadmin: []
//   };

//   const optionalFields = optionalMap[role] || [];
//   const mandatoryFields = mandatoryMap[role] || [];

//   const optionalToUpdate = {};
//   const mandatoryToRequest = {};

//   for (let key in updateFields) {
//     if (optionalFields.includes(key)) optionalToUpdate[key] = updateFields[key];
//     else if (mandatoryFields.includes(key)) mandatoryToRequest[key] = updateFields[key];
//     else {
//       console.warn(`[verifyOtpAndProcessUpdate] Invalid field: ${key}`);
//       return res.status(400).json({ message: `Invalid field: ${key}` });
//     }
//   }

//   try {
//     const otpRecord = await Otp.findOne({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt: { $gt: new Date() },
//       used: false
//     });

//     if (!otpRecord) {
//       console.warn(`[verifyOtpAndProcessUpdate] Invalid or expired OTP for ${email}`);
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     otpRecord.used = true;
//     await otpRecord.save();
//     console.log(`[verifyOtpAndProcessUpdate] OTP marked as used for ${email}`);

//     const updatedOptionalKeys = Object.keys(optionalToUpdate);

//     if (updatedOptionalKeys.length > 0) {
//       if (role === 'user' || role === 'creator') {
//         const update = {};
//         for (let key of updatedOptionalKeys) {
//           update[`profile.${key}`] = optionalToUpdate[key];
//         }
//         await User.updateOne({ _id: userId }, { $set: update });
//       } else if (role === 'admin') {
//         await Admin.updateOne({ _id: userId }, { $set: optionalToUpdate });
//       } else if (role === 'superadmin') {
//         await SuperAdmin.updateOne({ _id: userId }, { $set: optionalToUpdate });
//       }
//       console.log(`[verifyOtpAndProcessUpdate] Optional fields updated: ${updatedOptionalKeys.join(', ')}`);
//     }

//     if (Object.keys(mandatoryToRequest).length === 0) {
//       return res.json({
//         message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}`
//       });
//     }

//     let doc;
//     if (role === 'user' || role === 'creator') {
//       doc = await User.findById(userId);
//     } else if (role === 'admin') {
//       doc = await Admin.findById(userId);
//     } else {
//       doc = await SuperAdmin.findById(userId);
//     }

//     const isProfileCreated = (role === 'user' || role === 'creator')
//       ? !!doc.profile?.fullName
//       : !!doc.fullName;

//     const RequestModel = isProfileCreated
//       ? ProfileUpdateRequest
//       : ProfileCreationRequest;

//     const requestType = isProfileCreated ? 'update' : 'creation';

//     await RequestModel.findOneAndDelete({ userId });
//     console.log(`[verifyOtpAndProcessUpdate] Cleared previous ${requestType} request if any`);

//     await RequestModel.create({
//       userId,
//       role,
//       fields: mandatoryToRequest
//     });

//     console.log(`[verifyOtpAndProcessUpdate] Created new ${requestType} request`);

//     await notifyAuthorities(role, userId, requestType, mandatoryToRequest);
//     console.log(`[verifyOtpAndProcessUpdate] Authorities notified`);

//     const subject = 'Your ProVoxHome profile request is under review';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>Your request for ${requestType} of your profile has been submitted for authority review.</p>
//       ${updatedOptionalKeys.length > 0 ? `
//       <p>The following optional fields were updated successfully:</p>
//       <ul>${updatedOptionalKeys.map(k => `<li>${k}</li>`).join('')}</ul>` : ''}
//       <p>The remaining fields require verification. Authorities will review your request shortly.</p>
//       <p>Thank you for contributing to the ProVoxHome platform.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);
//     console.log(`[verifyOtpAndProcessUpdate] Email sent to ${email} about ${requestType} request`);

//     res.json({
//       message: `Updated optional fields: ${updatedOptionalKeys.join(', ') || 'None'}. Mandatory updates pending verification.`
//     });

//   } catch (err) {
//     console.error('Error in verifyOtpAndProcessUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const notifyAuthorities = require('../utils/notifyAuthorities');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       fields: data, // ✅ FIX: Add this line
//       otp,
//       expiresAt
//     });

//     // ✅ Fetch email from DB based on role and userId
//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//     // 🆕 Store OTP in Otp collection
//     await Otp.create({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt
//     });

//     // ✉️ Send OTP email (professional tone)
//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.verifyOtpAndProcessUpdate = async (req, res) => {
//   const { userId, role, email } = req.user;
//   const { otp, ...updateFields } = req.body;

//   const optionalMap = {
//     user: ['bio', 'gender'],
//     creator: ['bio', 'website', 'focusArea'],
//     admin: ['designation', 'bio'],
//     superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio']
//   };

//   const mandatoryMap = {
//     user: ['fullName', 'phone', 'location', 'age'],
//     creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//     admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//     superadmin: []
//   };

//   const optionalFields = optionalMap[role] || [];
//   const mandatoryFields = mandatoryMap[role] || [];

//   const optionalToUpdate = {};
//   const mandatoryToRequest = {};

//   for (let key in updateFields) {
//     if (optionalFields.includes(key)) optionalToUpdate[key] = updateFields[key];
//     else if (mandatoryFields.includes(key)) mandatoryToRequest[key] = updateFields[key];
//     else return res.status(400).json({ message: `Invalid field: ${key}` });
//   }

//   try {
//     const otpRecord = await Otp.findOne({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt: { $gt: new Date() },
//       used: false
//     });

//     if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

//     otpRecord.used = true;
//     await otpRecord.deleteOne();

//     const updatedOptionalKeys = Object.keys(optionalToUpdate);

//     if (updatedOptionalKeys.length > 0) {
//       if (role === 'user' || role === 'creator') {
//         const update = {};
//         for (let key of updatedOptionalKeys) {
//           update[`profile.${key}`] = optionalToUpdate[key];
//         }
//         await User.updateOne({ _id: userId }, { $set: update });
//       } else if (role === 'admin') {
//         await Admin.updateOne({ _id: userId }, { $set: optionalToUpdate });
//       } else if (role === 'superadmin') {
//         await SuperAdmin.updateOne({ _id: userId }, { $set: optionalToUpdate });
//       }
//     }

//     if (Object.keys(mandatoryToRequest).length === 0) {
//       return res.json({
//         message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}`
//       });
//     }

//     let doc;
//     if (role === 'user' || role === 'creator') {
//       doc = await User.findById(userId);
//     } else if (role === 'admin') {
//       doc = await Admin.findById(userId);
//     } else {
//       doc = await SuperAdmin.findById(userId);
//     }

//     const isProfileCreated = (role === 'user' || role === 'creator')
//       ? !!doc.profile?.fullName
//       : !!doc.fullName;

//     const RequestModel = isProfileCreated
//       ? ProfileUpdateRequest
//       : ProfileCreationRequest;

//     const requestType = isProfileCreated ? 'update' : 'creation';

//     await RequestModel.findOneAndDelete({ userId });

//     await RequestModel.create({
//       userId,
//       role,
//       fields: mandatoryToRequest
//     });

//     await notifyAuthorities(role, userId, requestType, mandatoryToRequest);

//     const subject = 'Your ProVoxHome profile request is under review';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>Your request for ${requestType} of your profile has been submitted for authority review.</p>
//       ${updatedOptionalKeys.length > 0 ? `
//       <p>The following optional fields were updated successfully:</p>
//       <ul>${updatedOptionalKeys.map(k => `<li>${k}</li>`).join('')}</ul>` : ''}
//       <p>The remaining fields require verification. Authorities will review your request shortly.</p>
//       <p>Thank you for contributing to the ProVoxHome platform.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     res.json({
//       message: `Updated optional fields: ${updatedOptionalKeys.join(', ') || 'None'}. Mandatory updates pending verification.`
//     });

//   } catch (err) {
//     console.error('Error in verifyOtpAndProcessUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const ProfileCreationRequest = require('../models/ProfileCreationRequest'); // ✅ REQUIRED IMPORT
// const generateOtp = require('../utils/generateOtp');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const notifyAuthorities = require('../utils/notifyAuthorities');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: []
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       fields: data,
//       otp,
//       expiresAt
//     });

//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//     await Otp.create({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt
//     });

//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');
// const Otp = require('../models/Otp');
// const sendEmail = require('../utils/sendEmail');
// const notifyAuthorities = require('../utils/notifyAuthorities');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       fields: data, // ✅ FIX: Add this line
//       otp,
//       expiresAt
//     });

//     // ✅ Fetch email from DB based on role and userId
//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//     // 🆕 Store OTP in Otp collection
//     await Otp.create({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt
//     });

//     // ✉️ Send OTP email (professional tone)
//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// ///
// exports.verifyOtpAndProcessUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const { otp, ...updateFields } = req.body;

//   const optionalMap = {
//     user: ['bio', 'gender'],
//     creator: ['bio', 'website', 'focusArea'],
//     admin: ['designation', 'bio'],
//     superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio']
//   };

//   const mandatoryMap = {
//     user: ['fullName', 'phone', 'location', 'age'],
//     creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//     admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//     superadmin: [] // no mandatory fields
//   };

//   const optionalFields = optionalMap[role] || [];
//   const mandatoryFields = mandatoryMap[role] || [];

//   const optionalToUpdate = {};
//   const mandatoryToRequest = {};

//   for (let key in updateFields) {
//     if (optionalFields.includes(key)) optionalToUpdate[key] = updateFields[key];
//     else if (mandatoryFields.includes(key)) mandatoryToRequest[key] = updateFields[key];
//     else return res.status(400).json({ message: `Invalid field: ${key}` });
//   }

//   try {
//     // 🛠️ FIX: Fetch email from DB based on role and userId
//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//     const otpRecord = await Otp.findOne({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt: { $gt: new Date() },
//       used: false
//     });

//     if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

//     // ✅ Update Optional Fields
//     let doc;
//     if (role === 'user' || role === 'creator') {
//       doc = await User.findById(userId);
//       if (!doc.profile) doc.profile = {};
//       Object.assign(doc.profile, optionalToUpdate);
//     } else {
//       doc = await (role === 'admin' ? Admin : SuperAdmin).findById(userId);
//       Object.assign(doc, optionalToUpdate);
//     }
//     await doc.save();

//     const updatedOptionalKeys = Object.keys(optionalToUpdate);

//     // ✅ Mark OTP as used and remove
//     otpRecord.used = true;
//     await otpRecord.deleteOne();

//     // ✅ If no mandatory updates, return success
//     if (Object.keys(mandatoryToRequest).length === 0) {
//       return res.json({
//         message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}`
//       });
//     }

//     // ✅ Mandatory fields request: Determine if it's a creation or update
//     const isProfileCreated = (role === 'user' || role === 'creator')
//       ? !!doc.profile?.fullName
//       : !!doc.fullName;

//     const RequestModel = isProfileCreated
//       ? ProfileUpdateRequest
//       : ProfileCreationRequest;

//     const requestType = isProfileCreated ? 'update' : 'creation';

//     await RequestModel.findOneAndDelete({ userId });

//     await RequestModel.create({
//       userId,
//       role,
//       fields: mandatoryToRequest
//     });

//     // ✅ Notify authorities
//     await notifyAuthorities(role, userId, requestType, mandatoryToRequest);

//     // ✅ Notify user
//     const subject = 'Your ProVoxHome profile request is under review';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>Your request for ${requestType} of your profile has been submitted for authority review.</p>
//       <p>The following optional fields were updated successfully:</p>
//       <ul>${updatedOptionalKeys.map(k => `<li>${k}</li>`).join('')}</ul>
//       <p>The remaining fields require verification. Authorities will review your request shortly.</p>
//       <p>Thank you for contributing to the ProVoxHome platform.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     res.json({
//       message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}. Mandatory updates pending verification.`
//     });

//   } catch (err) {
//     console.error('Error in verifyOtpAndProcessUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// ///
// exports.verifyOtpAndProcessUpdate = async (req, res) => {
//   const { userId, role, email } = req.user;
//   const { otp, ...updateFields } = req.body;

//   const optionalMap = {
//     user: ['bio', 'gender'],
//     creator: ['bio', 'website', 'focusArea'],
//     admin: ['designation', 'bio'],
//     superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio']
//   };

//   const mandatoryMap = {
//     user: ['fullName', 'phone', 'location', 'age'],
//     creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//     admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//     superadmin: [] // no mandatory fields
//   };

//   const optionalFields = optionalMap[role] || [];
//   const mandatoryFields = mandatoryMap[role] || [];

//   const optionalToUpdate = {};
//   const mandatoryToRequest = {};

//   for (let key in updateFields) {
//     if (optionalFields.includes(key)) optionalToUpdate[key] = updateFields[key];
//     else if (mandatoryFields.includes(key)) mandatoryToRequest[key] = updateFields[key];
//     else return res.status(400).json({ message: `Invalid field: ${key}` });
//   }

//   try {
//     const otpRecord = await Otp.findOne({
//       email,
//       code: otp,
//       purpose: 'profileUpdation',
//       expiresAt: { $gt: new Date() },
//       used: false
//     });

//     if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

//     // ✅ Update Optional Fields
//     let doc;
//     if (role === 'user' || role === 'creator') {
//       doc = await User.findById(userId);
//       if (!doc.profile) doc.profile = {};
//       Object.assign(doc.profile, optionalToUpdate);
//     } else {
//       doc = await (role === 'admin' ? Admin : SuperAdmin).findById(userId);
//       Object.assign(doc, optionalToUpdate);
//     }
//     await doc.save();

//     const updatedOptionalKeys = Object.keys(optionalToUpdate);

//     // ✅ Mark OTP as used and remove
//     otpRecord.used = true;
//     await otpRecord.deleteOne();

//     // ✅ If no mandatory updates, return success
//     if (Object.keys(mandatoryToRequest).length === 0) {
//       return res.json({
//         message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}`
//       });
//     }

//     // ✅ Mandatory fields request: Determine if it's a creation or update
//     const isProfileCreated = (role === 'user' || role === 'creator')
//       ? !!doc.profile?.fullName
//       : !!doc.fullName;

//     const RequestModel = isProfileCreated
//       ? ProfileUpdateRequest
//       : ProfileCreationRequest;

//     const requestType = isProfileCreated ? 'update' : 'creation';

//     await RequestModel.findOneAndDelete({ userId });

//     await RequestModel.create({
//       userId,
//       role,
//       fields: mandatoryToRequest
//     });

//     // ✅ Notify authorities
//     await notifyAuthorities(role, userId, requestType, mandatoryToRequest);

//     // ✅ Notify user
//     const subject = 'Your ProVoxHome profile request is under review';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>Your request for ${requestType} of your profile has been submitted for authority review.</p>
//       <p>The following optional fields were updated successfully:</p>
//       <ul>${updatedOptionalKeys.map(k => `<li>${k}</li>`).join('')}</ul>
//       <p>The remaining fields require verification. Authorities will review your request shortly.</p>
//       <p>Thank you for contributing to the ProVoxHome platform.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     res.json({
//       message: `Updated optional fields: ${updatedOptionalKeys.join(', ')}. Mandatory updates pending verification.`
//     });

//   } catch (err) {
//     console.error('Error in verifyOtpAndProcessUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// ///
// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       otp,
//       expiresAt
//     });


//     // ✅ Fetch email from DB based on role and userId
//     let userDoc;
//     if (role === 'user' || role === 'creator') {
//       userDoc = await User.findById(userId);
//     } else if (role === 'admin') {
//       userDoc = await Admin.findById(userId);
//     } else if (role === 'superadmin') {
//       userDoc = await SuperAdmin.findById(userId);
//     }

//     if (!userDoc || !userDoc.email) {
//       return res.status(404).json({ message: 'Email not found for this user' });
//     }

//     const email = userDoc.email;

//   // 🆕 Store OTP in Otp collection
//     await Otp.create({
//     email,
//     code: otp,
//     purpose: 'profileUpdation',
//     expiresAt
//     });

//     // ✉️ Send OTP email (professional tone)
//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// ///

//OTP Verification and Updation
















// //Optional Fields Update
// exports.verifyOtpAndUpdateOptionalFields = async (req, res) => {
//   const { userId, role } = req.user;
//   const { otp, ...updateFields } = req.body;

//   const optionalFieldsMap = {
//     user: ['bio', 'gender'],
//     creator: ['bio', 'website', 'focusArea'],
//     admin: ['designation', 'bio'],
//     superadmin: ['fullName', 'dob', 'country', 'phoneNumber', 'bio'] // all optional
//   };

//   const optionalFields = optionalFieldsMap[role] || [];

//   const invalid = Object.keys(updateFields).filter(field => !optionalFields.includes(field));
//   if (invalid.length) {
//     return res.status(400).json({
//       message: `Invalid optional fields in request: ${invalid.join(', ')}`
//     });
//   }

//   try {
//     const record = await ProfileUpdateRequest.findOne({
//       userId,
//       otp,
//       expiresAt: { $gt: new Date() }
//     });

//     if (!record) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     let updateTarget;
//     if (role === 'user' || role === 'creator') {
//       updateTarget = await User.findById(userId);
//       if (!updateTarget.profile) updateTarget.profile = {};
//       Object.assign(updateTarget.profile, updateFields);
//     } else if (role === 'admin') {
//       updateTarget = await Admin.findById(userId);
//       Object.assign(updateTarget, updateFields);
//     } else if (role === 'superadmin') {
//       updateTarget = await SuperAdmin.findById(userId);
//       Object.assign(updateTarget, updateFields);
//     }

//     await updateTarget.save();
//     await ProfileUpdateRequest.deleteOne({ userId });

//     res.json({ message: 'Optional fields updated successfully' });
//   } catch (err) {
//     console.error('Error in verifyOtpAndUpdateOptionalFields:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');
// const sendEmail = require('../utils/sendEmail');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role, email } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       otp,
//       expiresAt
//     });

//     // ✉️ Send OTP email (professional tone)
//     const subject = 'ProVoxHome Profile Verification OTP';
//     const html = `
//       <p>Dear ${role.charAt(0).toUpperCase() + role.slice(1)},</p>
//       <p>You have requested to update or create your profile on <strong>ProVoxHome</strong>.</p>
//       <p>Please use the following OTP to proceed with your request:</p>
//       <h2 style="color: #2e6c80;">${otp}</h2>
//       <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
//       <p>Thank you for being part of the ProVoxHome community.</p>
//       <br/>
//       <p>Warm regards,<br/>ProVoxHome Team</p>
//     `;

//     await sendEmail(email, subject, html);

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your registered email' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.checkProfileExists = async (req, res) => {
//   const { role, userId } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(userId);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(userId);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(userId);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { userId, role, email } = req.user;
//   const data = req.body;

//   try {
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       otp,
//       expiresAt
//     });

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.checkProfileExists = async (req, res) => {
//   const { role, id } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(id);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(id);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(id);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { id: userId, role, email } = req.user;
//   const data = req.body;

//   try {
//     if (!userId) {
//       console.error('❌ Missing userId in token payload:', req.user);
//       return res.status(400).json({ message: 'Invalid user session' });
//     }

//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId,
//       role,
//       otp,
//       expiresAt
//     });

//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };














// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.checkProfileExists = async (req, res) => {
//   const { role, id } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(id);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(id);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(id);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.requestProfileUpdate = async (req, res) => {
//   const { id: userId, role, email } = req.user; // ✅ use `id` instead of `_id`
//   const data = req.body;

//   try {
//     // Validate mandatory fields based on role
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     // Generate OTP
//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     // Save OTP request (delete previous if exists)
//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId, // ✅ Now correctly assigned
//       role,
//       otp,
//       expiresAt
//     });

//     // Simulate sending OTP (replace with real email/SMS later)
//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// console.log('Decoded user from token:', req.user);










// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');

// exports.checkProfileExists = async (req, res) => {
//   const { role, id } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(id);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(id);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(id);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.requestProfileUpdate = async (req, res) => {
//   const { role, email } = req.user;
//   const userId = req.user._id; // ✅ FIX: Access `_id` explicitly
//   const data = req.body;

//   try {
//     // Validate mandatory fields based on role
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     // Generate OTP
//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     // Save OTP request (delete previous if exists)
//     await ProfileUpdateRequest.findOneAndDelete({ userId });

//     await ProfileUpdateRequest.create({
//       userId, // ✅ Now correctly assigned
//       role,
//       otp,
//       expiresAt
//     });

//     // Simulate sending OTP (replace with real email/SMS later)
//     console.log(`📨 OTP for profile update (userId: ${userId}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');

// exports.checkProfileExists = async (req, res) => {
//   const { role, id } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(id);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(id);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(id);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.requestProfileUpdate = async (req, res) => {
//   const { id, role, email } = req.user;
//   const data = req.body;

//   try {
//     // Validate mandatory fields based on role
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     // Generate OTP
//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     // Save OTP request (delete previous if exists)
//     await ProfileUpdateRequest.findOneAndDelete({ userId: id });

//     await ProfileUpdateRequest.create({
//       userId: id, // ✅ FIXED: Ensure `id` is used directly from destructured `req.user`
//       role,
//       otp,
//       expiresAt
//     });

//     // Simulate sending OTP (replace with real email/SMS later)
//     console.log(`📨 OTP for profile update (userId: ${id}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };





// // server/controllers/userProfileController.js
// const User = require('../models/User');
// const Admin = require('../models/Admin');
// const SuperAdmin = require('../models/SuperAdmin');

// exports.checkProfileExists = async (req, res) => {
//   const { role, id } = req.user;

//   try {
//     let exists = false;

//     if (role === 'user' || role === 'creator') {
//       const user = await User.findById(id);
//       exists = user?.profile?.fullName ? true : false;

//     } else if (role === 'admin') {
//       const admin = await Admin.findById(id);
//       exists = admin?.fullName ? true : false;

//     } else if (role === 'superadmin') {
//       const sa = await SuperAdmin.findById(id);
//       exists = sa?.fullName ? true : false;
//     }

//     res.json({ exists });
//   } catch (err) {
//     console.error('Error checking profile existence:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const generateOtp = require('../utils/generateOtp');

// exports.requestProfileUpdate = async (req, res) => {
//   const { id, role, email } = req.user;
//   const data = req.body;

//   try {
//     // Validate mandatory fields based on role
//     const mandatoryFields = {
//       user: ['fullName', 'phone', 'location', 'age'],
//       creator: ['fullName', 'phone', 'location', 'age', 'orgName'],
//       admin: ['fullName', 'dob', 'country', 'phoneNumber'],
//       superadmin: [] // all optional
//     };

//     const requiredFields = mandatoryFields[role] || [];
//     const missing = requiredFields.filter(field => !data[field]);

//     if (missing.length) {
//       return res.status(400).json({
//         message: `Missing mandatory fields: ${missing.join(', ')}`
//       });
//     }

//     // Generate OTP
//     const otp = generateOtp();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     // Save OTP request (delete previous if exists)
//     await ProfileUpdateRequest.findOneAndDelete({ userId: id });

//     await ProfileUpdateRequest.create({
//       userId: req.user.id,
//       role,
//       otp,
//       expiresAt
//     });

//     // Simulate sending OTP (replace with real email/SMS later)
//     console.log(`📨 OTP for profile update (userId: ${id}) is: ${otp}`);

//     res.json({ message: 'OTP sent to your email/phone (simulated)' });

//   } catch (err) {
//     console.error('Error in requestProfileUpdate:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // server/controllers/userProfileController.js

// const User = require('../models/User');
// const UserProfile = require('../models/UserProfile');
// const Otp = require('../models/Otp');
// const LockedProfile = require('../models/LockedProfile');
// const PendingProfileVerification = require('../models/PendingProfileVerification');

// const generateOtp = require('../utils/generateOtp');
// const sendEmail = require('../utils/sendEmail');
// const notifyAdmins = require('../utils/notifyAdmins');
// const sendSecurityAlert = require('../utils/sendSecurityAlert');

// const isMandatoryField = (key) => ['fullName', 'dob', 'country', 'phoneNumber'].includes(key);

// // First-time profile creation (requires all mandatory fields filled)
// exports.createProfile = async (req, res) => {
//   try {
//     const { fullName, dob, country, phoneNumber, bio, profilePictureUrl, socialLinks } = req.body;
//     const userId = req.user._id;

//     const existingProfile = await UserProfile.findOne({ user: userId });
//     if (existingProfile) return res.status(400).json({ message: 'Profile already exists' });

//     const newProfile = new UserProfile({
//       user: userId,
//       fullName, dob, country, phoneNumber,
//       bio, profilePictureUrl, socialLinks
//     });

//     await newProfile.save();

//     await generateOtp(req.user.email, 'verifyEmail');

//     res.status(200).json({ message: 'Profile saved. Please verify via OTP sent to your email.' });
//   } catch (err) {
//     console.error('Create Profile Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Verify OTP for profile (initial creation)
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { code } = req.body;
//     const userEmail = req.user.email;

//     const lock = await LockedProfile.findOne({ email: userEmail });
//     if (lock) return res.status(403).json({ message: 'You are temporarily blocked from profile actions for 12 hours.' });

//     const otpRecord = await Otp.findOne({ email: userEmail, code, purpose: 'verifyEmail', used: false });

//     if (!otpRecord || otpRecord.expiresAt < new Date()) {
//       await sendSecurityAlert(userEmail);
//       await new LockedProfile({ email: userEmail }).save();
//       return res.status(403).json({ message: 'Invalid or expired OTP. Account locked for 12 hours.' });
//     }

//     otpRecord.used = true;
//     await otpRecord.save();

//     const profile = await UserProfile.findOne({ user: req.user._id });
//     profile.verificationStatus = 'pending';
//     await profile.save();

//     await notifyAdmins(req.user.role, profile);

//     res.status(200).json({ message: 'OTP verified. Await admin verification.' });
//   } catch (err) {
//     console.error('OTP Verification Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Update Profile Fields (distinguish optional vs mandatory)
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const updates = req.body;

//     const profile = await UserProfile.findOne({ user: userId });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     let isMandatoryUpdate = false;

//     for (let key of Object.keys(updates)) {
//       if (isMandatoryField(key)) isMandatoryUpdate = true;
//     }

//     if (isMandatoryUpdate) {
//       const pending = await PendingProfileVerification.findOne({ user: userId });
//       if (pending) return res.status(400).json({ message: 'You already have a pending mandatory update.' });

//       await new PendingProfileVerification({
//         user: userId,
//         updates,
//         role: req.user.role
//       }).save();

//       profile.verificationStatus = 'pending';
//       await profile.save();

//       await notifyAdmins(req.user.role, profile);
//       return res.status(200).json({ message: 'Mandatory fields sent for admin verification.' });
//     }

//     // Apply optional updates immediately
//     for (let key of Object.keys(updates)) {
//       if (!isMandatoryField(key)) {
//         profile[key] = updates[key];
//       }
//     }

//     await profile.save();
//     res.status(200).json({ message: 'Optional fields updated successfully.', profile });
//   } catch (err) {
//     console.error('Profile Update Error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
