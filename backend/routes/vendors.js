// backend/routes/vendors.js - Complete vendor routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { auth, isVendor } = require('../middleware/auth');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');

// @route   GET /api/vendors
// @desc    Get all active vendors with their basic info
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, isOpen } = req.query;
    
    // Build query
    const query = { 
      role: 'vendor', 
      isActive: true 
    };
    
    // Filter by shop name if search provided
    if (search) {
      query['vendorInfo.shopName'] = { 
        $regex: search, 
        $options: 'i' 
      };
    }
    
    // Filter by open status if provided
    if (isOpen !== undefined) {
      query['vendorInfo.isOpen'] = isOpen === 'true';
    }

    const vendors = await User.find(query)
      .select('name vendorInfo createdAt')
      .sort({ 'vendorInfo.shopName': 1 });

    // Add menu item count for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const menuItemCount = await MenuItem.countDocuments({ 
          vendorId: vendor._id, 
          isAvailable: true 
        });
        
        return {
          id: vendor._id,
          name: vendor.name,
          shopName: vendor.vendorInfo.shopName,
          description: vendor.vendorInfo.description,
          isOpen: vendor.vendorInfo.isOpen,
          schedule: vendor.vendorInfo.schedule,
          avatar: vendor.vendorInfo.avatar,
          menuItemCount,
          joinedDate: vendor.createdAt
        };
      })
    );

    return successResponse(res, 'Vendors retrieved successfully', { 
      vendors: vendorsWithStats,
      total: vendorsWithStats.length 
    });

  } catch (error) {
    console.error('Vendors fetch error:', error);
    return errorResponse(res, 'Failed to fetch vendors', null, 500);
  }
});

// @route   GET /api/vendors/:id
// @desc    Get specific vendor details with menu
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id, 
      role: 'vendor', 
      isActive: true 
    }).select('name vendorInfo createdAt');

    if (!vendor) {
      return errorResponse(res, 'Vendor not found', null, 404);
    }

    // Get vendor's menu items
    const menuItems = await MenuItem.find({ 
      vendorId: vendor._id,
      isAvailable: true 
    }).sort({ category: 1, name: 1 });

    // Group menu items by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        preparationTime: item.preparationTime
      });
      return acc;
    }, {});

    const vendorData = {
      id: vendor._id,
      name: vendor.name,
      shopName: vendor.vendorInfo.shopName,
      description: vendor.vendorInfo.description,
      isOpen: vendor.vendorInfo.isOpen,
      schedule: vendor.vendorInfo.schedule,
      avatar: vendor.vendorInfo.avatar,
      menuByCategory,
      totalMenuItems: menuItems.length,
      joinedDate: vendor.createdAt
    };

    return successResponse(res, 'Vendor details retrieved successfully', { vendor: vendorData });

  } catch (error) {
    console.error('Vendor details fetch error:', error);
    return errorResponse(res, 'Failed to fetch vendor details', null, 500);
  }
});

// @route   GET /api/vendors/:id/menu
// @desc    Get vendor's menu items
// @access  Public
router.get('/:id/menu', async (req, res) => {
  try {
    const { category, available } = req.query;
    
    // Build query
    const query = { vendorId: req.params.id };
    
    if (category) {
      query.category = category;
    }
    
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 });

    // Group by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return successResponse(res, 'Menu items retrieved successfully', { 
      menuItems,
      menuByCategory,
      total: menuItems.length 
    });

  } catch (error) {
    console.error('Menu fetch error:', error);
    return errorResponse(res, 'Failed to fetch menu items', null, 500);
  }
});

// VENDOR-ONLY ROUTES (Protected)

// @route   GET /api/vendors/dashboard/stats
// @desc    Get vendor dashboard statistics
// @access  Private (Vendor only)
router.get('/dashboard/stats', auth, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get basic counts
    const [
      totalMenuItems,
      activeMenuItems,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      MenuItem.countDocuments({ vendorId }),
      MenuItem.countDocuments({ vendorId, isAvailable: true }),
      Order.countDocuments({ vendorId }),
      Order.countDocuments({ vendorId, createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ vendorId, createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ vendorId, createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ vendorId, status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ vendorId, status: 'completed' })
    ]);

    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { vendorId: req.user._id, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          todayRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfDay] },
                '$totalAmount',
                0
              ]
            }
          },
          weekRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfWeek] },
                '$totalAmount',
                0
              ]
            }
          },
          monthRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfMonth] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0
    };

    const stats = {
      menu: {
        total: totalMenuItems,
        active: activeMenuItems,
        inactive: totalMenuItems - activeMenuItems
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: revenue.totalRevenue,
        today: revenue.todayRevenue,
        week: revenue.weekRevenue,
        month: revenue.monthRevenue
      }
    };

    return successResponse(res, 'Dashboard statistics retrieved successfully', { stats });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics', null, 500);
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile/shop info
// @access  Private (Vendor only)
router.put('/profile', auth, isVendor, async (req, res) => {
  try {
    const { shopName, description, isOpen, schedule } = req.body;
    
    const vendor = await User.findById(req.user.id);
    if (!vendor) {
      return errorResponse(res, 'Vendor not found', null, 404);
    }

    // Validation
    const errors = [];
    
    if (shopName && shopName.trim().length < 2) {
      errors.push('Shop name must be at least 2 characters long');
    }
    
    if (description && description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    if (schedule) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (schedule.openTime && !timeRegex.test(schedule.openTime)) {
        errors.push('Open time must be in HH:MM format');
      }
      if (schedule.closeTime && !timeRegex.test(schedule.closeTime)) {
        errors.push('Close time must be in HH:MM format');
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    // Update vendor info
    if (shopName) vendor.vendorInfo.shopName = shopName.trim();
    if (description !== undefined) vendor.vendorInfo.description = description.trim();
    if (isOpen !== undefined) vendor.vendorInfo.isOpen = isOpen;
    
    if (schedule) {
      if (schedule.openTime) vendor.vendorInfo.schedule.openTime = schedule.openTime;
      if (schedule.closeTime) vendor.vendorInfo.schedule.closeTime = schedule.closeTime;
    }

    await vendor.save();

    return successResponse(res, 'Vendor profile updated successfully', {
      vendor: {
        id: vendor._id,
        shopName: vendor.vendorInfo.shopName,
        description: vendor.vendorInfo.description,
        isOpen: vendor.vendorInfo.isOpen,
        schedule: vendor.vendorInfo.schedule
      }
    });

  } catch (error) {
    console.error('Vendor profile update error:', error);
    return errorResponse(res, 'Failed to update vendor profile', null, 500);
  }
});

module.exports = router;