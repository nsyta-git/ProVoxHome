// server/middleware/rateLimiter.js

const LockedProfile = require('../models/LockedProfile');

const checkProfileLock = async (req, res, next) => {
  const email = req.user.email;

  const lock = await LockedProfile.findOne({ email });
  if (lock && lock.lockedUntil > new Date()) {
    const remaining = Math.ceil((lock.lockedUntil - Date.now()) / (60 * 60 * 1000));
    return res.status(403).json({
      message: `Profile update/creation is temporarily locked due to security policy. Try again in ~${remaining} hour(s).`
    });
  }

  next();
};

module.exports = checkProfileLock;

// const LockedProfile = require('../models/LockedProfile');

// module.exports = async (req, res, next) => {
//   const email = req.user?.email;
//   if (!email) return res.status(401).json({ message: 'Unauthorized.' });

//   const lock = await LockedProfile.findOne({ email });
//   if (lock && lock.lockUntil > new Date()) {
//     return res.status(403).json({
//       message: `Profile updates are locked due to invalid attempts. Try again after ${lock.lockUntil.toLocaleString()}.`
//     });
//   }

//   next();
// };
