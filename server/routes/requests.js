
// server/routes/requests.js

/* This will define the /api/requests routes in a RESTful way:
GET /api/requests → All requests
GET /api/requests/profile → All profile-related requests
With query parameters like:
type=creation|update
status=pending|accepted|rejected|modification_requested
date=DD-MM-YYYY
role=user|creator|admin
auth=SA|A
*/

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getAllRequests, getProfileRequests } = require('../controllers/requestController');
const {isAuthenticated} = require('../middleware/auth');

// ✅ Apply rate limiting middleware
const requestsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// ✅ All /api/requests routes require JWT verification
router.use(isAuthenticated);

// ✅ GET all creation and update requests (for dashboard view)
router.get('/', requestsLimiter, getAllRequests); // ✅ fixed: handler present

// ✅ GET all profile requests with filtering via query parameters
router.get('/profile', requestsLimiter, getProfileRequests); // ✅ fixed: handler present

module.exports = router;





// // server/routes/requests.js

// /* This will define the /api/requests routes in a RESTful way:
// GET /api/requests → All requests
// GET /api/requests/profile → All profile-related requests
// With query parameters like:
// type=creation|update
// status=pending|accepted|rejected|modification_requested
// date=DD-MM-YYYY
// role=user|creator|admin
// auth=SA|A                             */

// const express = require('express');
// const router = express.Router();
// const rateLimit = require('express-rate-limit');
// const { getAllRequests, getProfileRequests } = require('../controllers/requestController');
// const verifyToken = require('../middleware/auth');

// // Apply rate limiting
// const requestsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 50, // max 50 requests per IP per window
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // All routes under /api/requests require auth
// router.use(verifyToken);

// // @route   GET /api/requests
// // @desc    Get all profile-related requests (creation + update)
// // @access  Admin/SuperAdmin
// router.get('/', requestsLimiter, getAllRequests);

// // @route   GET /api/requests/profile
// // @desc    Get filtered profile requests by type/status/role/date
// // @query   type=creation|update, status=..., role=..., date=..., auth=SA|A
// // @access  Admin/SuperAdmin
// router.get('/profile', requestsLimiter, getProfileRequests);

// module.exports = router;
