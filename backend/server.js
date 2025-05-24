const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = require('./config/database');
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Smart Campus Ordering API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));      // 🛒 NEW: Cart routes
app.use('/api/payment', require('./routes/payment'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'API route not found',
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/vendors',
      'GET /api/menu',
      'GET /api/cart',               // 🛒 NEW
      'POST /api/cart/add',          // 🛒 NEW
      'POST /api/cart/checkout',     // 🛒 NEW
      'GET /api/orders/my-orders'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🍕 =====================================');
  console.log('🚀 Smart Campus Ordering System');
  console.log('🌐 Server running on port:', PORT);
  console.log('📦 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 API Base URL: http://localhost:' + PORT + '/api');
  console.log('💾 Database: MongoDB Atlas');
  console.log('🛒 New Features: Shopping Cart, Orders, Menu Management!');
  console.log('🍕 =====================================');
});