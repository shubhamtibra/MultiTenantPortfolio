const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const loadDb = require('./models');
const db = loadDb();
const { verifyToken } = require('./middleware/auth');
const publicRoutes = require('./routes/public');
const authenticatedRoutes = require('./routes/authenticated');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;
// Add context middleware


// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and subdomains
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow any subdomain pattern for development
    if (origin.match(/^https?:\/\/[^.]+\.localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.ctx = { db };
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes (no authentication required)
app.use('/api', publicRoutes);

// Upload routes (mixed - some public, some authenticated)
app.use('/api', uploadRoutes);

// Authenticated routes (require valid JWT token)
app.use('/api', verifyToken, authenticatedRoutes);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant Portfolio Backend API' });
});

// Health check and file uploads are now handled in separate route modules


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
