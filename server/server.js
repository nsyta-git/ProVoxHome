const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const routes = require('./routes');
app.use('/api', routes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


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
