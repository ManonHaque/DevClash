const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseFormatter');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', null, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 'Access denied. Invalid token format.', null, 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'Access denied. User not found.', null, 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Access denied. Account is deactivated.', null, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Access denied. Invalid token.', null, 401);
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access denied. Token expired.', null, 401);
    } else {
      return errorResponse(res, 'Access denied. Authentication failed.', null, 401);
    }
  }
};

// Check if user is a vendor
const isVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    return errorResponse(res, 'Access denied. Vendor privileges required.', null, 403);
  }
};

// Check if user is a student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return errorResponse(res, 'Access denied. Student privileges required.', null, 403);
  }
};

module.exports = { auth, isVendor, isStudent };