const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = null) => {
  try {
    const payload = { id };
    const options = {
      expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    
    // Decode to get expiration info
    const decoded = jwt.decode(token);
    
    return {
      token,
      expiresAt: new Date(decoded.exp * 1000),
      issuedAt: new Date(decoded.iat * 1000)
    };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };