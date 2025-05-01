

// server/routes/index.js

const express = require('express');
const router = express.Router();

// 🌐 Welcome Route (Test)
router.get('/', (req, res) => {
  res.send('🌐 Welcome to ProVoxHome API');
});

// 🔐 Auth Routes
router.use('/api/auth', require('./auth'));

// 🛡️ Admin Routes
router.use('/api/admin', require('./admin'));

// 🛡️ SuperAdmin Routes
router.use('/api/superadmin', require('./superadmin'));

// 🧾 Admin Profile Verification Routes
router.use('/api/admin-profile-verification', require('./adminProfileVerification'));

// 👤 Profile Management Routes (Phase 3)
router.use('/api/profile', require('./profile'));

// 📊 Status Checking Routes (Phase 3-VI)
router.use('/api/status', require('./status')); // ✅ FIXED: use router.use, not app.use

// 🔹 Acess all kind of Requests 
router.use('/api/requests', require('./requests')); 

// 🛠️ Review Profile Requests (Phase 3-V[7B])
router.use('/api/requests', require('./requestReview')); // ✅ Fixed: use same base /api/requests


module.exports = router;



// const express = require('express');
// const router = express.Router();

// // Test Route
// router.get('/', (req, res) => {
//   res.send('🌐 Welcome to ProVoxHome API');
// });




// // Existing route integrations
// router.use('/api/auth', require('./auth'));
// router.use('/api/admin', require('./admin'));
// router.use('/api/superadmin', require('./superadmin'));
// router.use('/api/admin-profile-verification', require('./adminProfileVerification'));

// // 🔹 Add Profile routes (Phase 3)
// router.use('/api/profile', require('./profile'));
// const statusRoutes = require('./status');
// app.use('/api/status', statusRoutes);

// module.exports = router;

