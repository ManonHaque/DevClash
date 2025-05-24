const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { auth } = require('../middleware/auth');

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCUETEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@cuet\.ac\.bd$/.test(email);
};

const validatePhone = (phone) => {
  return /^(\+8801|01)[3-9]\d{8}$/.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// @route   POST /api/auth/register
// @desc    Register user (student or vendor)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId, vendorInfo } = req.body;

    // Basic validation
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!email || !validateEmail(email)) {
      errors.push('Please provide a valid email address');
    }
    
    if (!password || !validatePassword(password)) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!role || !['student', 'vendor'].includes(role)) {
      errors.push('Role must be either student or vendor');
    }
    
    if (!phone || !validatePhone(phone)) {
      errors.push('Please provide a valid Bangladeshi phone number');
    }

    // Role-specific validation
    if (role === 'student') {
      if (!validateCUETEmail(email)) {
        errors.push('Students must use CUET email format (@cuet.ac.bd)');
      }
      
      if (!studentId || studentId.trim().length < 4) {
        errors.push('Student ID is required and must be at least 4 characters');
      }
    }

    if (role === 'vendor') {
      if (!vendorInfo || !vendorInfo.shopName || vendorInfo.shopName.trim().length < 2) {
        errors.push('Shop name is required for vendor accounts');
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    // Check for existing users
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingUser) {
      return errorResponse(res, 'User already exists with this email address');
    }

    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId: studentId.trim() });
      if (existingStudent) {
        return errorResponse(res, 'Student ID already exists');
      }
    }

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone.trim()
    };

    if (role === 'student') {
      userData.studentId = studentId.trim();
    }

    if (role === 'vendor') {
      userData.vendorInfo = {
        shopName: vendorInfo.shopName.trim(),
        description: vendorInfo.description?.trim() || '',
        isOpen: vendorInfo.isOpen !== undefined ? vendorInfo.isOpen : true,
        schedule: {
          openTime: vendorInfo.schedule?.openTime || '09:00',
          closeTime: vendorInfo.schedule?.closeTime || '22:00'
        }
      };
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate token
    const tokenData = generateToken(user._id);

    // Prepare response data
    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        vendorInfo: user.vendorInfo,
        createdAt: user.createdAt
      },
      token: tokenData.token,
      expiresAt: tokenData.expiresAt
    };

    return successResponse(
      res, 
      `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`, 
      responseData, 
      201
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return validationErrorResponse(res, validationErrors);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(res, `${field} already exists`);
    }

    return errorResponse(res, 'Registration failed. Please try again.', null, 500);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return errorResponse(res, 'Please provide a valid email address');
    }

    if (!password) {
      return errorResponse(res, 'Please provide a password');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Please contact support.', null, 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Generate token
    const tokenData = generateToken(user._id);

    // Prepare response data
    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        vendorInfo: user.vendorInfo
      },
      token: tokenData.token,
      expiresAt: tokenData.expiresAt
    };

    return successResponse(res, 'Login successful', responseData);

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', null, 500);
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      studentId: user.studentId,
      vendorInfo: user.vendorInfo,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return successResponse(res, 'Profile retrieved successfully', { user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return errorResponse(res, 'Failed to retrieve profile', null, 500);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, (req, res) => {
  return successResponse(res, 'Logged out successfully');
});

module.exports = router;