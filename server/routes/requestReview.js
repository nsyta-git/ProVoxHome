// server/routes/requestReview.js

/*
  Handles review actions on profile requests (creation/update)
  RESTful routes:
    PATCH /api/requests/:type/:requestId/accept
    PATCH /api/requests/:type/:requestId/reject
    PATCH /api/requests/:type/:requestId/modify

  :type → creation | update
*/

const express = require('express');
const router = express.Router();
const { acceptRequest, rejectRequest, modifyRequest } = require('../controllers/requestReviewController');
const { isAuthenticated, requireRole } = require('../middleware/auth'); // ✅ FIXED: use correct middleware

// ✅ Middleware: must be authenticated and be admin or superadmin
router.use(isAuthenticated);
router.use(requireRole(['admin', 'superadmin']));

// PATCH /api/requests/:type/:requestId/accept
router.patch('/:type/:requestId/accept', acceptRequest);

// PATCH /api/requests/:type/:requestId/reject
router.patch('/:type/:requestId/reject', rejectRequest);

// PATCH /api/requests/:type/:requestId/modify
router.patch('/:type/:requestId/modify', modifyRequest);

router.use(isAuthenticated);
router.use(requireRole(['admin', 'superadmin']));

module.exports = router;


// // server/routes/requestReview.js

// /*
//   Handles review actions on profile requests (creation/update)
//   RESTful routes:
//     PATCH /api/requests/:type/:requestId/accept
//     PATCH /api/requests/:type/:requestId/reject
//     PATCH /api/requests/:type/:requestId/modify

//   :type → creation | update
// */

// const express = require('express');
// const router = express.Router();
// const { acceptRequest, rejectRequest, modifyRequest } = require('../controllers/requestReviewController');
// const { isAuthenticated } = require('../middleware/auth'); // ✅ FIXED: use correct middleware

// router.use(isAuthenticated);

// // PATCH /api/requests/:type/:requestId/accept
// router.patch('/:type/:requestId/accept', acceptRequest);

// // PATCH /api/requests/:type/:requestId/reject
// router.patch('/:type/:requestId/reject', rejectRequest);

// // PATCH /api/requests/:type/:requestId/modify
// router.patch('/:type/:requestId/modify', modifyRequest);

// module.exports = router;
