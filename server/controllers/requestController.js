// // server/controllers/requestController.js 

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status
//     if (status) baseFilter.status = status;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
//       }
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//         if (isNaN(fromDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
//         }
//         baseFilter.createdAt.$gte = fromDate;
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//         if (isNaN(toDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
//         }
//         baseFilter.createdAt.$lte = toDate;
//       }
//     }

//     // ❌ If invalid type is passed (fix: only reject if it's defined and invalid)
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creation = await ProfileCreationRequest.find(baseFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const update = await ProfileUpdateRequest.find(baseFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ✅ Filter by user role (after population)
//     if (role) {
//       requests = requests.filter((r) => r.userId?.role === role);
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.userId?.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.userId?.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
// ___________ Copy____________

// server/controllers/requestController.js 

const ProfileCreationRequest = require('../models/ProfileCreationRequest');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const User = require('../models/User');

// ✅ Helper: Check if a request is verifiable by authority
const isVerifiableBy = (authorityRole, requestRole) => {
  if (authorityRole === 'superadmin') return true;
  if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
  return false;
};

// ✅ [7A] Get all profile-related requests (creation + update)
exports.getAllRequests = async (req, res) => {
  try {
    const creationRequests = await ProfileCreationRequest.find()
      .populate('userId', 'email role')
      .populate('reviewedBy', 'email role');

    const updateRequests = await ProfileUpdateRequest.find()
      .populate('userId', 'email role')
      .populate('reviewedBy', 'email role');

    res.json({ creationRequests, updateRequests });
  } catch (err) {
    console.error('Error fetching all requests:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// server/controllers/requestController.js 

// ... keep other imports and helper functions exactly the same ...

// ✅ [7A] Get profile requests with optional filters
exports.getProfileRequests = async (req, res) => {
  try {
    const { type, status, date, from, to, role, auth } = req.query;
    const userRole = req.user.role;

    const baseFilter = {};

    // ✅ Status and Role (added case insensitivity)
    if (status) baseFilter.status = status.toLowerCase();
    if (role) baseFilter.role = role.toLowerCase();

    // ✅ Date filter (single date) - unchanged
    if (date && !from && !to) {
      const [day, month, year] = date.split('-');
      const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
      const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
      }
      baseFilter.createdAt = { $gte: start, $lte: end };
    }

    // ✅ Date range filter (from and/or to) - unchanged
    if (from || to) {
      baseFilter.createdAt = {};
      if (from) {
        const [fDay, fMonth, fYear] = from.split('-');
        const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
        }
        baseFilter.createdAt.$gte = fromDate;
      }
      if (to) {
        const [tDay, tMonth, tYear] = to.split('-');
        const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
        }
        baseFilter.createdAt.$lte = toDate;
      }
    }

    // ❌ Type validation - unchanged
    if (type && type !== 'creation' && type !== 'update') {
      return res.status(400).json({
        error: 'Query param "type" must be either "creation" or "update".',
      });
    }

    let requests = [];
    console.log('Base filter:', baseFilter); // Debug log

    // ✅ Creation requests - added debug logs
    if (!type || type === 'creation') {
      const creationFilter = { ...baseFilter };
      console.log('Querying creation requests with filter:', creationFilter);
      const creation = await ProfileCreationRequest.find(creationFilter)
        .populate('userId', 'email role')
        .populate('reviewedBy', 'email role');
      console.log(`Found ${creation.length} creation requests`);
      requests = [...requests, ...creation];
    }

    // ✅ Update requests - added debug logs
    if (!type || type === 'update') {
      const updateFilter = { ...baseFilter };
      console.log('Querying update requests with filter:', updateFilter);
      const update = await ProfileUpdateRequest.find(updateFilter)
        .populate('userId', 'email role')
        .populate('reviewedBy', 'email role');
      console.log(`Found ${update.length} update requests`);
      requests = [...requests, ...update];
    }

    // ✅ Authority filter - unchanged
    const filteredRequests = auth
      ? requests.filter((r) => {
          if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
          if (auth === 'A') return isVerifiableBy('admin', r.role);
          return false;
        })
      : requests;

    console.log('Final filtered requests:', filteredRequests.length); // Debug log
    res.json({ requests: filteredRequests });
  } catch (err) {
    console.error('Error fetching profile requests:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ... keep other controller functions exactly the same ...


// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status and Role
//     if (status) baseFilter.status = status;
//     if (role) baseFilter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
//       }
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//         if (isNaN(fromDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
//         }
//         baseFilter.createdAt.$gte = fromDate;
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//         if (isNaN(toDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
//         }
//         baseFilter.createdAt.$lte = toDate;
//       }
//     }

//     // ❌ If invalid type is passed (fix: only reject if it's defined and invalid)
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creationFilter = { ...baseFilter };
//       const creation = await ProfileCreationRequest.find(creationFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const updateFilter = { ...baseFilter };
//       const update = await ProfileUpdateRequest.find(updateFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// --------------------copy end ---------------



// // server/controllers/requestController.js 

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status and Role
//     if (status) baseFilter.status = status;
//     if (role) baseFilter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
//       }
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//         if (isNaN(fromDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
//         }
//         baseFilter.createdAt.$gte = fromDate;
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//         if (isNaN(toDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
//         }
//         baseFilter.createdAt.$lte = toDate;
//       }
//     }

//     // ❌ If invalid type is passed (fix: only reject if it's defined and invalid)
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creationFilter = { ...baseFilter };
//       const creation = await ProfileCreationRequest.find(creationFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const updateFilter = { ...baseFilter };
//       const update = await ProfileUpdateRequest.find(updateFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };




// // server/controllers/requestController.js 

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status and Role
//     if (status) baseFilter.status = status;
//     if (role) baseFilter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
//       }
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//         if (isNaN(fromDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
//         }
//         baseFilter.createdAt.$gte = fromDate;
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//         if (isNaN(toDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
//         }
//         baseFilter.createdAt.$lte = toDate;
//       }
//     }

//     // ❌ If invalid type is passed
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creationFilter = { ...baseFilter };
//       const creation = await ProfileCreationRequest.find(creationFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const updateFilter = { ...baseFilter };
//       const update = await ProfileUpdateRequest.find(updateFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status and Role
//     if (status) baseFilter.status = status;
//     if (role) baseFilter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: 'Invalid date format in "date" parameter.' });
//       }
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         const fromDate = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//         if (isNaN(fromDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "from" parameter.' });
//         }
//         baseFilter.createdAt.$gte = fromDate;
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         const toDate = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//         if (isNaN(toDate.getTime())) {
//           return res.status(400).json({ error: 'Invalid date format in "to" parameter.' });
//         }
//         baseFilter.createdAt.$lte = toDate;
//       }
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creationFilter = { ...baseFilter };
//       const creation = await ProfileCreationRequest.find(creationFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const updateFilter = { ...baseFilter };
//       const update = await ProfileUpdateRequest.find(updateFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ❌ If invalid type is passed
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // server/controllers/requestController.js 

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const baseFilter = {};

//     // ✅ Status and Role
//     if (status) baseFilter.status = status;
//     if (role) baseFilter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       baseFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       baseFilter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         baseFilter.createdAt.$gte = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         baseFilter.createdAt.$lte = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//       }
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creationFilter = { ...baseFilter };
//       const creation = await ProfileCreationRequest.find(creationFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const updateFilter = { ...baseFilter };
//       const update = await ProfileUpdateRequest.find(updateFilter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ❌ If invalid type is passed
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };



// // server/controllers/requestController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, from, to, role, auth } = req.query;
//     const userRole = req.user.role;

//     const filter = {};

//     // ✅ Status and Role
//     if (status) filter.status = status;
//     if (role) filter.role = role;

//     // ✅ Date filter (single date)
//     if (date && !from && !to) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     // ✅ Date range filter (from and/or to)
//     if (from || to) {
//       filter.createdAt = {};
//       if (from) {
//         const [fDay, fMonth, fYear] = from.split('-');
//         filter.createdAt.$gte = new Date(`${fYear}-${fMonth}-${fDay}T00:00:00Z`);
//       }
//       if (to) {
//         const [tDay, tMonth, tYear] = to.split('-');
//         filter.createdAt.$lte = new Date(`${tYear}-${tMonth}-${tDay}T23:59:59Z`);
//       }
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creation = await ProfileCreationRequest.find(filter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const update = await ProfileUpdateRequest.find(filter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ❌ If invalid type is passed
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     // ✅ Filter requests based on authority (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };



// // server/controllers/requestController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Helper: Check if a request is verifiable by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ [7A] Get all profile-related requests (creation + update)
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ [7A] Get profile requests with optional filters
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const { type, status, date, role, auth } = req.query;
//     const userRole = req.user.role;

//     const filter = {};

//     // Optional filters
//     if (status) filter.status = status;
//     if (role) filter.role = role;

//     if (date) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     let requests = [];

//     // ✅ If no type is specified, fetch both creation and update
//     if (!type || type === 'creation') {
//       const creation = await ProfileCreationRequest.find(filter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...creation];
//     }

//     if (!type || type === 'update') {
//       const update = await ProfileUpdateRequest.find(filter)
//         .populate('userId', 'email role')
//         .populate('reviewedBy', 'email role');
//       requests = [...requests, ...update];
//     }

//     // ❌ If invalid type is passed
//     if (type && type !== 'creation' && type !== 'update') {
//       return res.status(400).json({
//         error: 'Query param "type" must be either "creation" or "update".',
//       });
//     }

//     // ✅ Filter requests based on who can review them (optional)
//     const filteredRequests = auth
//       ? requests.filter((r) => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// // server/controllers/requestController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Authority check based on who can verify what
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ Get both creation and update profile requests
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ Get filtered profile requests (creation/update) by query
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const {
//       type,
//       status,
//       date,
//       role,
//       auth
//     } = req.query;

//     const userRole = req.user.role;

//     let model;
//     if (type === 'creation') model = ProfileCreationRequest;
//     else if (type === 'update') model = ProfileUpdateRequest;
//     else return res.status(400).json({ error: 'Query param "type" must be either "creation" or "update".' });

//     const filter = {};
//     if (status) filter.status = status;
//     if (role) filter.role = role;

//     if (date) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     const requests = await model.find(filter)
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     const filteredRequests = auth
//       ? requests.filter(r => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };



// // server/controllers/requestController.js

// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User');

// // ✅ Authority check based on who can verify what
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// // ✅ Get both creation and update profile requests
// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role'); // ✅ fixed: include reviewer info

//     const updateRequests = await ProfileUpdateRequest.find()
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role'); // ✅ fixed: include reviewer info

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ✅ Get filtered profile requests (creation/update) by query
// exports.getProfileRequests = async (req, res) => {
//   try {
//     const {
//       type,        // creation | update
//       status,      // pending | accepted | rejected | modification_requested
//       date,        // format: DD-MM-YYYY
//       role,        // user | creator | admin
//       auth         // SA | A
//     } = req.query;

//     const userRole = req.user.role;

//     let model;
//     if (type === 'creation') model = ProfileCreationRequest;
//     else if (type === 'update') model = ProfileUpdateRequest;
//     else return res.status(400).json({ error: 'Query param "type" must be either "creation" or "update".' });

//     const filter = {};
//     if (status) filter.status = status;
//     if (role) filter.role = role;

//     // ✅ Filter by date
//     if (date) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     const requests = await model.find(filter)
//       .populate('userId', 'email role')
//       .populate('reviewedBy', 'email role');

//     // ✅ Filter by authority
//     const filteredRequests = auth
//       ? requests.filter(r => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };




// // server/controllers/requestController.js
// // currently This file will handle logic to fetch all profile-related requests, optionally filter them by query parameters such as type, status, date, role, auth, etc.
// const ProfileCreationRequest = require('../models/ProfileCreationRequest');
// const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
// const User = require('../models/User'); // to populate user info

// // Utility to match role verification by authority
// const isVerifiableBy = (authorityRole, requestRole) => {
//   if (authorityRole === 'superadmin') return true;
//   if (authorityRole === 'admin') return ['user', 'creator'].includes(requestRole);
//   return false;
// };

// exports.getAllRequests = async (req, res) => {
//   try {
//     const creationRequests = await ProfileCreationRequest.find().populate('userId', 'email role');
//     const updateRequests = await ProfileUpdateRequest.find().populate('userId', 'email role');

//     res.json({ creationRequests, updateRequests });
//   } catch (err) {
//     console.error('Error fetching all requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.getProfileRequests = async (req, res) => {
//   try {
//     const {
//       type,        // creation | update
//       status,      // pending | accepted | rejected | modification_requested
//       date,        // format: DD-MM-YYYY
//       role,        // user | creator | admin
//       auth         // SA | A
//     } = req.query;

//     const userRole = req.user.role;

//     let model;
//     if (type === 'creation') model = ProfileCreationRequest;
//     else if (type === 'update') model = ProfileUpdateRequest;
//     else return res.status(400).json({ error: 'Query param "type" must be either "creation" or "update".' });

//     const filter = {};

//     if (status) filter.status = status;
//     if (role) filter.role = role;

//     if (date) {
//       const [day, month, year] = date.split('-');
//       const start = new Date(`${year}-${month}-${day}T00:00:00Z`);
//       const end = new Date(`${year}-${month}-${day}T23:59:59Z`);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     const requests = await model.find(filter).populate('userId', 'email role').populate('reviewedBy', 'email role');

//     // Filter by authority type if provided
//     const filteredRequests = auth
//       ? requests.filter(r => {
//           if (auth === 'SA') return isVerifiableBy('superadmin', r.role);
//           if (auth === 'A') return isVerifiableBy('admin', r.role);
//           return false;
//         })
//       : requests;

//     res.json({ requests: filteredRequests });
//   } catch (err) {
//     console.error('Error fetching profile requests:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
