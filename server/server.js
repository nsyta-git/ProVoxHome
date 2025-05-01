// // server/server.js

// const express = require('express');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // Route imports
// const adminRoutes = require('./routes/admin');
// const authRoutes = require('./routes/auth');
// const userProfileRoutes = require('./routes/userProfile');
// const adminProfileVerificationRoutes = require('./routes/adminProfileVerification');


// dotenv.config();

// const app = express();

// // --- MIDDLEWARE ---
// app.use(cors());
// app.use(express.json()); // 🛑 Important: Without this, req.body is undefined!

// // --- ROUTES ---
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/user-profile', userProfileRoutes);
// app.use('/api/admin-profile-verification', adminProfileVerificationRoutes);


// // --- DATABASE CONNECTION ---
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('🟢 MongoDB Connected'))
//   .catch((err) => console.error('🔴 MongoDB Connection Error:', err));

// // --- SERVER LISTEN ---
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });



 // server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');


dotenv.config();
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Optional: Manually set headers for extra safety
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5175');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

// Routes



const routes = require('./routes');
app.use('/api', routes);

app.use(require('./routes/index'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const superadminRoutes = require('./routes/superadmin');
app.use('/api/superadmin', superadminRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const userProfileRoutes = require('./routes/userProfile');
app.use('/api/user-profile', userProfileRoutes);

const adminProfileVerificationRoutes = require('./routes/adminProfileVerification');
app.use('/api/admin-profile-verification', adminProfileVerificationRoutes);



// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('🟢 MongoDB Connected'))
  .catch(err => console.error('🔴 MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// server/server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// //CORS Fix
// const cors = require('cors');
// const corsOptions = require('./config/corsOptions');
// app.use(cors(corsOptions));

// dotenv.config();
// const app = express();

// // Middleware
// app.use(express.json());



// // ✅ Optional: Manually set headers for extra safety
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5175');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
//   next();
// });

// // Routes
// const routes = require('./routes');
// app.use('/api', routes);

// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log('🟢 MongoDB Connected'))
//   .catch(err => console.error('🔴 MongoDB Connection Error:', err));

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();
// const app = express();

// // Middleware
// app.use(express.json());
// //app.use(cors()); (previously)
// app.use(cors({
//   origin: 'http://localhost:5175', // your frontend origin
//   credentials: true
// }));

// // Routes
// const routes = require('./routes');
// app.use('/api', routes);

// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);


// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log('🟢 MongoDB Connected'))
//   .catch(err => console.error('🔴 MongoDB Connection Error:', err));

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
