const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');      // ✅ added
require('dotenv').config();

const app = express();
connectDB();

// Allow CORS
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true,
}));

app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
