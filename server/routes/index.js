
// server/routes/index.js
const express = require('express');
const router = express.Router();

// Test Route
router.get('/', (req, res) => {
  res.send('🌐 Welcome to ProVoxHome API');
});

module.exports = router;
