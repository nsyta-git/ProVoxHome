// /middleware/auth.js
const jwt = require('jsonwebtoken');

const isSuperOrAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { isSuperOrAdmin };




// // /middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const isSuperOrAdmin = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;

//     if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     next();
//   } catch (err) {
//     console.error('Auth error:', err);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = { isSuperOrAdmin };
