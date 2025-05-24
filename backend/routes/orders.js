// backend/routes/orders.js - Complete order management routes
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { auth, isStudent, isVendor } = require('../middleware/auth');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');

// STUDENT ROUTES

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Student only)
router.post('/', auth, isStudent, async (req, res) => {
  try {
    const { vendorId, items, notes } = req.body;

    // Validation
    const errors = [];
    
    if (!vendorId) {
      errors.push('Vendor ID is required');
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('Order items are required');
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    // Verify vendor exists and is active
    const vendor = await User.findOne({
      _id: vendorId,
      role: 'vendor',
      isActive: true
    });

    if (!vendor) {
      return errorResponse(res, 'Vendor not found or inactive', null, 404);
    }

    if (!vendor.vendorInfo.isOpen) {
      return errorResponse(res, 'Vendor is currently closed');
    }

    // Validate and process order items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        return errorResponse(res, 'Invalid item data: menuItemId and quantity are required');
      }

      // Find menu item
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        vendorId: vendorId,
        isAvailable: true
      });

      if (!menuItem) {
        return errorResponse(res, `Menu item ${item.menuItemId} not found or unavailable`);
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const deliveryFee = 0; // Free for pickup
    const totalAmount = subtotal + tax + deliveryFee;

    // Create order
    const order = new Order({
      studentId: req.user.id,
      vendorId: vendorId,
      items: processedItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      notes: notes || '',
      estimatedTime: Math.max(15, processedItems.reduce((total, item) => total + item.quantity * 3, 10))
    });

    await order.save();

    // Populate for response
    await order.populate([
      { path: 'studentId', select: 'name email studentId' },
      { path: 'vendorId', select: 'name vendorInfo.shopName' }
    ]);

    return successResponse(res, 'Order created successfully', { order }, 201);

  } catch (error) {
    console.error('Order creation error:', error);
    return errorResponse(res, 'Failed to create order', null, 500);
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get student's orders
// @access  Private (Student only)
router.get('/my-orders', auth, isStudent, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { studentId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('vendorId', 'name vendorInfo.shopName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    return successResponse(res, 'Orders retrieved successfully', { 
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Student orders fetch error:', error);
    return errorResponse(res, 'Failed to fetch orders', null, 500);
  }
});

// @route   GET /api/orders/:id
// @desc    Get specific order details
// @access  Private (Student who owns it)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('vendorId', 'name vendorInfo.shopName vendorInfo.schedule')
      .populate('items.menuItemId', 'name description category');

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    // Check if user owns this order or is the vendor
    if (req.user.role === 'student' && order.studentId._id.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    if (req.user.role === 'vendor' && order.vendorId._id.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    return successResponse(res, 'Order details retrieved successfully', { order });

  } catch (error) {
    console.error('Order details fetch error:', error);
    return errorResponse(res, 'Failed to fetch order details', null, 500);
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (Student who owns it)
router.patch('/:id/cancel', auth, isStudent, async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return errorResponse(res, 'Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason || 'Cancelled by student';
    await order.save();

    return successResponse(res, 'Order cancelled successfully', { 
      order: {
        id: order._id,
        status: order.status,
        cancelReason: order.cancelReason
      }
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    return errorResponse(res, 'Failed to cancel order', null, 500);
  }
});

// VENDOR ROUTES

// @route   GET /api/orders/vendor/incoming
// @desc    Get vendor's incoming orders
// @access  Private (Vendor only)
router.get('/vendor/incoming', auth, isVendor, async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const query = { vendorId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const orders = await Order.find(query)
      .populate('studentId', 'name email studentId phone')
      .sort({ createdAt: -1 });

    // Group orders by status for better organization
    const ordersByStatus = orders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = [];
      }
      acc[order.status].push(order);
      return acc;
    }, {});

    return successResponse(res, 'Vendor orders retrieved successfully', { 
      orders,
      ordersByStatus,
      total: orders.length 
    });

  } catch (error) {
    console.error('Vendor orders fetch error:', error);
    return errorResponse(res, 'Failed to fetch vendor orders', null, 500);
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Vendor only)
router.patch('/:id/status', auth, isVendor, async (req, res) => {
  try {
    const { status, estimatedTime } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required');
    }

    const validStatuses = ['confirmed', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status. Valid statuses: ' + validStatuses.join(', '));
    }

    const order = await Order.findOne({
      _id: req.params.id,
      vendorId: req.user.id
    }).populate('studentId', 'name email');

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    if (order.status === 'cancelled') {
      return errorResponse(res, 'Cannot update cancelled order');
    }

    // Status progression validation
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex <= currentIndex && status !== 'ready') {
      return errorResponse(res, 'Invalid status progression');
    }

    // Update order
    const previousStatus = order.status;
    order.status = status;
    
    if (estimatedTime) {
      order.estimatedTime = estimatedTime;
    }

    if (status === 'completed') {
      order.actualCompletionTime = new Date();
    }

    await order.save();

    // You can add notification logic here
    console.log(`Order ${order._id} status changed from ${previousStatus} to ${status}`);

    return successResponse(res, 'Order status updated successfully', { 
      order: {
        id: order._id,
        status: order.status,
        deliveryCode: order.deliveryCode,
        estimatedTime: order.estimatedTime,
        student: order.studentId
      }
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return errorResponse(res, 'Failed to update order status', null, 500);
  }
});

// @route   GET /api/orders/vendor/stats
// @desc    Get vendor order statistics
// @access  Private (Vendor only)
router.get('/vendor/stats', auth, isVendor, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const matchQuery = {
      vendorId: req.user._id,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $eq: ['$paymentStatus', 'paid'] },
                '$totalAmount',
                0
              ]
            }
          },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'pending'] },
                1,
                0
              ]
            }
          },
          confirmedOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'confirmed'] },
                1,
                0
              ]
            }
          },
          preparingOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'preparing'] },
                1,
                0
              ]
            }
          },
          readyOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'ready'] },
                1,
                0
              ]
            }
          },
          completedOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'completed'] },
                1,
                0
              ]
            }
          },
          cancelledOrders: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'cancelled'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      preparingOrders: 0,
      readyOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    // Get top selling items for the period
    const topItems = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    return successResponse(res, 'Vendor statistics retrieved successfully', { 
      stats: result,
      topItems,
      period 
    });

  } catch (error) {
    console.error('Vendor stats error:', error);
    return errorResponse(res, 'Failed to fetch vendor statistics', null, 500);
  }
});

// @route   GET /api/orders/search
// @desc    Search orders by delivery code
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return errorResponse(res, 'Delivery code is required');
    }

    const order = await Order.findOne({ 
      deliveryCode: code.toUpperCase() 
    })
    .populate('studentId', 'name email studentId')
    .populate('vendorId', 'name vendorInfo.shopName');

    if (!order) {
      return errorResponse(res, 'Order not found with this delivery code', null, 404);
    }

    // Check access permissions
    if (req.user.role === 'student' && order.studentId._id.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    if (req.user.role === 'vendor' && order.vendorId._id.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    return successResponse(res, 'Order found successfully', { order });

  } catch (error) {
    console.error('Order search error:', error);
    return errorResponse(res, 'Failed to search order', null, 500);
  }
});

module.exports = router;