const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// @route   POST /api/payment/init
// @desc    Initialize payment
// @access  Private
router.post('/init', async (req, res) => {
  try {
    return successResponse(res, 'Payment route working', { paymentUrl: '' });
  } catch (error) {
    console.error('Payment init error:', error);
    return errorResponse(res, 'Failed to initialize payment', null, 500);
  }
});

module.exports = router;