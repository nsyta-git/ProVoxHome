// server/middleware/auth.js

const jwt = require('jsonwebtoken');

// 🔒 Base verify & decode token
const getDecodedToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.userId) {
    console.error('❌ Missing userId in token payload:', decoded);
    throw new Error('Invalid user session');
  }
  return decoded;
};

// ✅ UNIVERSAL (any authenticated role)
const isAuthenticated = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error (isAuthenticated):', err);
    res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
  }
};

// ✅ GENERIC ROLE-BASED MIDDLEWARE (NEW)
const requireRole = (roles = []) => {
  return (req, res, next) => {
    try {
      const decoded = getDecodedToken(req);
      req.user = decoded;
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient role' });
      }
      next();
    } catch (err) {
      console.error('Auth error (requireRole):', err);
      res.status(401).json({ message: 'Unauthorized: Invalid token or role' });
    }
  };
};

// 🔒 ROLE-SPECIFIC GUARDS
const isUser = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'user')
      return res.status(403).json({ message: 'Access denied: User only' });
    next();
  } catch (err) {
    console.error('Auth error (isUser):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const isCreator = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'creator')
      return res.status(403).json({ message: 'Access denied: Creator only' });
    next();
  } catch (err) {
    console.error('Auth error (isCreator):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: Admin only' });
    next();
  } catch (err) {
    console.error('Auth error (isAdmin):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'superadmin')
      return res.status(403).json({ message: 'Access denied: SuperAdmin only' });
    next();
  } catch (err) {
    console.error('Auth error (isSuperAdmin):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// 🔒 COMBINED ROLES (still useful)
const isUserOrCreator = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'user' && decoded.role !== 'creator')
      return res.status(403).json({ message: 'Access denied: User or Creator only' });
    next();
  } catch (err) {
    console.error('Auth error (isUserOrCreator):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    const decoded = getDecodedToken(req);
    req.user = decoded;
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin')
      return res.status(403).json({ message: 'Access denied: Admin or SuperAdmin only' });
    next();
  } catch (err) {
    console.error('Auth error (isAdminOrSuperAdmin):', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  isAuthenticated,
  isUser,
  isCreator,
  isAdmin,
  isSuperAdmin,
  isUserOrCreator,
  isAdminOrSuperAdmin,
  requireRole, // ✅ newly added generic role middleware
};


// // server/middleware/auth.js

// const jwt = require('jsonwebtoken');

// // 🔒 Base verify & decode token
// const getDecodedToken = (req) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) throw new Error('No token');
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   if (!decoded.userId) {
//     console.error('❌ Missing userId in token payload:', decoded);
//     throw new Error('Invalid user session');
//   }
//   return decoded;
// };

// // ✅ UNIVERSAL (any authenticated role)
// const isAuthenticated = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Auth error (isAuthenticated):', err);
//     res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
//   }
// };

// // ✅ Role-based access control middleware
// exports.requireRole = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Access denied: insufficient role' });
//     }
//     next();
//   };
// };

// // ✅ ROLE-BASED MIDDLEWARE
// const isUser = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'user')
//       return res.status(403).json({ message: 'Access denied: User only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isUser):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: Creator only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'admin')
//       return res.status(403).json({ message: 'Access denied: Admin only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: SuperAdmin only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// // ✅ COMBINED ROLES
// const isUserOrCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'user' && decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: User or Creator only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isUserOrCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdminOrSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     if (decoded.role !== 'admin' && decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: Admin or SuperAdmin only' });
//     next();
//   } catch (err) {
//     console.error('Auth error (isAdminOrSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// module.exports = {
//   isAuthenticated,
//   requireRole,
//   isUser,
//   isCreator,
//   isAdmin,
//   isSuperAdmin,
//   isUserOrCreator,
//   isAdminOrSuperAdmin
// };



// // server/middleware/auth.js
// const jwt = require('jsonwebtoken');

// const getDecodedToken = (req) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) throw new Error('No token');
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

// // ✅ Add normalized user.id inside each middleware
// const isAuthenticated = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id, // normalize
//       role: decoded.role,
//       email: decoded.email
//     };
//     next();
//   } catch (err) {
//     console.error('Auth error (isAuthenticated):', err);
//     res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
//   }
// };

// const isUser = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'user')
//       return res.status(403).json({ message: 'Access denied: User only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isUser):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: Creator only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'admin')
//       return res.status(403).json({ message: 'Access denied: Admin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: SuperAdmin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isUserOrCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'user' && decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: User or Creator only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isUserOrCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdminOrSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = {
//       id: decoded._id || decoded.id,
//       role: decoded.role,
//       email: decoded.email
//     };
//     if (decoded.role !== 'admin' && decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: Admin or SuperAdmin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isAdminOrSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// module.exports = {
//   isAuthenticated,
//   isUser,
//   isCreator,
//   isAdmin,
//   isSuperAdmin,
//   isUserOrCreator,
//   isAdminOrSuperAdmin
// };


//  // server/middleware/auth.js

//  const jwt = require('jsonwebtoken');

// // 🔒 Base verify & decode token
// const getDecodedToken = (req) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) throw new Error('No token');
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

// // ✅ UNIVERSAL (any authenticated role)
// const isAuthenticated = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error('Auth error (isAuthenticated):', err);
//     res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
//   }
// };

// // ✅ ROLE-BASED MIDDLEWARE

// const isUser = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'user')
//       return res.status(403).json({ message: 'Access denied: User only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isUser):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: Creator only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'admin')
//       return res.status(403).json({ message: 'Access denied: Admin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: SuperAdmin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// // ✅ COMBINED ROLES

// const isUserOrCreator = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'user' && decoded.role !== 'creator')
//       return res.status(403).json({ message: 'Access denied: User or Creator only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isUserOrCreator):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// const isAdminOrSuperAdmin = async (req, res, next) => {
//   try {
//     const decoded = getDecodedToken(req);
//     req.user = decoded;

//     if (decoded.role !== 'admin' && decoded.role !== 'superadmin')
//       return res.status(403).json({ message: 'Access denied: Admin or SuperAdmin only' });

//     next();
//   } catch (err) {
//     console.error('Auth error (isAdminOrSuperAdmin):', err);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// module.exports = {
//   isAuthenticated,
//   isUser,
//   isCreator,
//   isAdmin,
//   isSuperAdmin,
//   isUserOrCreator,
//   isAdminOrSuperAdmin
// };










// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const isSuperOrAdmin = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = {
//       id: decoded.id,
//       role: decoded.role
//     };

//     if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     next();
//   } catch (err) {
//     console.error('Auth error:', err);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // module.exports = { isSuperOrAdmin };


// const isUser = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;

//     if (decoded.role !== 'user') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     next();
//   } catch (err) {
//     console.error('Auth error:', err);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = {
//    isSuperOrAdmin,
//   isUser };




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
