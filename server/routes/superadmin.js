//server/routes/superadmin.js
//🔵 Purpose: Create and login SuperAdmin securely.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const router = express.Router();

const SUPERADMIN_SECRET = process.env.SUPERADMIN_SECRET;

// SuperAdmin Signup (One-Time Setup)
router.post('/signup', async (req, res) => {
    try {
      const { email, password, secretCode } = req.body;
      if (secretCode !== process.env.SUPERADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid secret code' });
      }
      const existingSuperAdmin = await SuperAdmin.findOne({ email });
      if (existingSuperAdmin) {
        return res.status(400).json({ message: 'Super admin already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const superAdmin = new SuperAdmin({ email, password: hashedPassword });
      await superAdmin.save();
      res.status(201).json({ message: 'Super admin account created successfully' });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  });
  
  module.exports = router;




// SuperAdmin Login
// SUPERADMIN LOGIN (THE NEW PART)

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const superAdmin = await SuperAdmin.findOne({ email });
      if (!superAdmin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, superAdmin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { userId: superAdmin._id, role: 'superadmin', email: superAdmin.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  module.exports = router;

  // router.post('/signup', async (req, res) => {
//   try {
//     const { email, password, secret } = req.body;

//     if (secret !== SUPERADMIN_SECRET) {
//       return res.status(403).json({ message: 'Invalid secret code.' });
//     }

//     const existingSuperAdmin = await SuperAdmin.findOne({ email });
//     if (existingSuperAdmin) {
//       return res.status(400).json({ message: 'SuperAdmin already exists.' });
//     }

//     const passwordHash = await bcrypt.hash(password, 12);
//     const newSuperAdmin = new SuperAdmin({ email, passwordHash });
//     await newSuperAdmin.save();

//     res.status(201).json({ message: 'SuperAdmin account created successfully.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error.' });
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const superAdmin = await SuperAdmin.findOne({ email });
//     if (!superAdmin) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     const isMatch = await bcrypt.compare(password, superAdmin.passwordHash);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     const token = jwt.sign(
//       { id: superAdmin._id, role: 'superadmin' },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error.' });
//   }
// });



