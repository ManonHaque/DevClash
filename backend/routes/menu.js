// backend/routes/menu.js - Complete menu management routes
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { auth, isVendor } = require('../middleware/auth');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');

// @route   GET /api/menu
// @desc    Get all menu items (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, vendor, search, minPrice, maxPrice, available = 'true' } = req.query;
    
    // Build query
    const query = { isAvailable: available === 'true' };
    
    if (category) {
      query.category = category;
    }
    
    if (vendor) {
      query.vendorId = vendor;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const menuItems = await MenuItem.find(query)
      .populate('vendorId', 'name vendorInfo.shopName vendorInfo.isOpen')
      .sort({ category: 1, name: 1 });

    // Filter out items from closed vendors
    const availableItems = menuItems.filter(item => 
      item.vendorId && item.vendorId.vendorInfo?.isOpen
    );

    return successResponse(res, 'Menu items retrieved successfully', { 
      menuItems: availableItems,
      total: availableItems.length 
    });

  } catch (error) {
    console.error('Menu fetch error:', error);
    return errorResponse(res, 'Failed to fetch menu items', null, 500);
  }
});

// @route   GET /api/menu/categories
// @desc    Get all available categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await MenuItem.countDocuments({ 
          category, 
          isAvailable: true 
        });
        return { category, count };
      })
    );

    return successResponse(res, 'Categories retrieved successfully', { 
      categories: categoryStats 
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return errorResponse(res, 'Failed to fetch categories', null, 500);
  }
});

// VENDOR-ONLY ROUTES (Protected)

// @route   GET /api/menu/my-items
// @desc    Get vendor's own menu items
// @access  Private (Vendor only)
router.get('/my-items', auth, isVendor, async (req, res) => {
  try {
    const { category, available } = req.query;
    
    const query = { vendorId: req.user.id };
    
    if (category) {
      query.category = category;
    }
    
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, createdAt: -1 });

    // Group by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return successResponse(res, 'Vendor menu items retrieved successfully', { 
      menuItems,
      menuByCategory,
      total: menuItems.length 
    });

  } catch (error) {
    console.error('Vendor menu fetch error:', error);
    return errorResponse(res, 'Failed to fetch vendor menu items', null, 500);
  }
});

// @route   POST /api/menu
// @desc    Create new menu item
// @access  Private (Vendor only)
router.post('/', auth, isVendor, async (req, res) => {
  try {
    const { name, description, price, category, image, preparationTime } = req.body;

    // Validation
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Item name is required and must be at least 2 characters');
    }
    
    if (!description || description.trim().length < 10) {
      errors.push('Description is required and must be at least 10 characters');
    }
    
    if (!price || price < 1) {
      errors.push('Price is required and must be at least 1 BDT');
    }
    
    if (price > 10000) {
      errors.push('Price cannot exceed 10,000 BDT');
    }
    
    if (!category || !['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'].includes(category)) {
      errors.push('Valid category is required');
    }
    
    if (preparationTime && (preparationTime < 5 || preparationTime > 120)) {
      errors.push('Preparation time must be between 5 and 120 minutes');
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    // Check if item with same name already exists for this vendor
    const existingItem = await MenuItem.findOne({
      vendorId: req.user.id,
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });

    if (existingItem) {
      return errorResponse(res, 'Menu item with this name already exists');
    }

    // Create menu item
    const menuItem = new MenuItem({
      vendorId: req.user.id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image || '',
      preparationTime: preparationTime || 15
    });

    await menuItem.save();

    // Populate vendor info for response
    await menuItem.populate('vendorId', 'name vendorInfo.shopName');

    return successResponse(res, 'Menu item created successfully', { 
      menuItem 
    }, 201);

  } catch (error) {
    console.error('Menu item creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return validationErrorResponse(res, validationErrors);
    }

    return errorResponse(res, 'Failed to create menu item', null, 500);
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Vendor only)
router.put('/:id', auth, isVendor, async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable, preparationTime } = req.body;

    // Find menu item and verify ownership
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.id
    });

    if (!menuItem) {
      return errorResponse(res, 'Menu item not found or access denied', null, 404);
    }

    // Validation
    const errors = [];
    
    if (name && name.trim().length < 2) {
      errors.push('Item name must be at least 2 characters');
    }
    
    if (description && description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    
    if (price && (price < 1 || price > 10000)) {
      errors.push('Price must be between 1 and 10,000 BDT');
    }
    
    if (category && !['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'].includes(category)) {
      errors.push('Invalid category');
    }
    
    if (preparationTime && (preparationTime < 5 || preparationTime > 120)) {
      errors.push('Preparation time must be between 5 and 120 minutes');
    }

    if (errors.length > 0) {
      return validationErrorResponse(res, errors);
    }

    // Check for duplicate name (excluding current item)
    if (name) {
      const existingItem = await MenuItem.findOne({
        vendorId: req.user.id,
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });

      if (existingItem) {
        return errorResponse(res, 'Menu item with this name already exists');
      }
    }

    // Update fields
    if (name) menuItem.name = name.trim();
    if (description) menuItem.description = description.trim();
    if (price) menuItem.price = Number(price);
    if (category) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (preparationTime) menuItem.preparationTime = preparationTime;

    await menuItem.save();

    return successResponse(res, 'Menu item updated successfully', { menuItem });

  } catch (error) {
    console.error('Menu item update error:', error);
    return errorResponse(res, 'Failed to update menu item', null, 500);
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Vendor only)
router.delete('/:id', auth, isVendor, async (req, res) => {
  try {
    // Find menu item and verify ownership
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.id
    });

    if (!menuItem) {
      return errorResponse(res, 'Menu item not found or access denied', null, 404);
    }

    // Check if item is in any pending orders
    const Order = require('../models/Order');
    const pendingOrders = await Order.countDocuments({
      'items.menuItemId': req.params.id,
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    if (pendingOrders > 0) {
      return errorResponse(res, 'Cannot delete menu item with pending orders. Set as unavailable instead.');
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    return successResponse(res, 'Menu item deleted successfully');

  } catch (error) {
    console.error('Menu item deletion error:', error);
    return errorResponse(res, 'Failed to delete menu item', null, 500);
  }
});

// @route   PATCH /api/menu/:id/toggle-availability
// @desc    Toggle menu item availability
// @access  Private (Vendor only)
router.patch('/:id/toggle-availability', auth, isVendor, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.id
    });

    if (!menuItem) {
      return errorResponse(res, 'Menu item not found or access denied', null, 404);
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    return successResponse(res, `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`, { 
      menuItem: {
        id: menuItem._id,
        name: menuItem.name,
        isAvailable: menuItem.isAvailable
      }
    });

  } catch (error) {
    console.error('Menu item toggle error:', error);
    return errorResponse(res, 'Failed to toggle menu item availability', null, 500);
  }
});

module.exports = router;