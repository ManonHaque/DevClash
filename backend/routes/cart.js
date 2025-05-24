// backend/routes/cart.js - Shopping Cart Management
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { auth, isStudent } = require('../middleware/auth');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private (Student only)
router.get('/', auth, isStudent, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.items.menuItemId', 'name description price category image isAvailable')
      .populate('cart.items.vendorId', 'name vendorInfo.shopName vendorInfo.isOpen');

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Filter out unavailable items or closed vendors
    const validItems = user.cart.items.filter(item => 
      item.menuItemId && 
      item.menuItemId.isAvailable && 
      item.vendorId && 
      item.vendorId.vendorInfo.isOpen
    );

    // Update cart if items were filtered out
    if (validItems.length !== user.cart.items.length) {
      user.cart.items = validItems;
      user.calculateCartTotals();
      await user.save();
    }

    // Group items by vendor
    const itemsByVendor = validItems.reduce((acc, item) => {
      const vendorId = item.vendorId._id.toString();
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: {
            id: item.vendorId._id,
            name: item.vendorId.name,
            shopName: item.vendorId.vendorInfo.shopName,
            isOpen: item.vendorId.vendorInfo.isOpen
          },
          items: []
        };
      }
      acc[vendorId].items.push({
        id: item._id,
        menuItemId: item.menuItemId._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        subtotal: item.price * item.quantity,
        menuItem: {
          name: item.menuItemId.name,
          description: item.menuItemId.description,
          category: item.menuItemId.category,
          image: item.menuItemId.image,
          currentPrice: item.menuItemId.price // Check for price changes
        }
      });
      return acc;
    }, {});

    return successResponse(res, 'Cart retrieved successfully', {
      cart: {
        items: validItems,
        itemsByVendor,
        totalItems: user.cart.totalItems,
        totalAmount: user.cart.totalAmount,
        lastUpdated: user.cart.lastUpdated
      }
    });

  } catch (error) {
    console.error('Cart fetch error:', error);
    return errorResponse(res, 'Failed to fetch cart', null, 500);
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private (Student only)
router.post('/add', auth, isStudent, async (req, res) => {
  try {
    const { menuItemId, quantity = 1, specialInstructions = '' } = req.body;

    // Validation
    if (!menuItemId) {
      return errorResponse(res, 'Menu item ID is required');
    }

    if (quantity < 1 || quantity > 50) {
      return errorResponse(res, 'Quantity must be between 1 and 50');
    }

    // Find menu item and verify it's available
    const menuItem = await MenuItem.findById(menuItemId)
      .populate('vendorId', 'name vendorInfo.shopName vendorInfo.isOpen');

    if (!menuItem) {
      return errorResponse(res, 'Menu item not found', null, 404);
    }

    if (!menuItem.isAvailable) {
      return errorResponse(res, 'Menu item is not available');
    }

    if (!menuItem.vendorId.vendorInfo.isOpen) {
      return errorResponse(res, 'Vendor is currently closed');
    }

    // Get user and check cart
    const user = await User.findById(req.user.id);
    
    // Check if cart has items from different vendors
    const vendorId = menuItem.vendorId._id.toString();
    const existingVendors = [...new Set(user.cart.items.map(item => item.vendorId.toString()))];
    
    if (existingVendors.length > 0 && !existingVendors.includes(vendorId)) {
      return errorResponse(res, 'Cannot add items from different vendors. Please checkout current cart first.');
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQuantity = user.cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > 50) {
        return errorResponse(res, 'Cannot add more than 50 of the same item');
      }
      
      user.cart.items[existingItemIndex].quantity = newQuantity;
      user.cart.items[existingItemIndex].specialInstructions = specialInstructions;
    } else {
      // Add new item to cart
      user.cart.items.push({
        menuItemId: menuItem._id,
        vendorId: menuItem.vendorId._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        specialInstructions,
        addedAt: new Date()
      });
    }

    // Recalculate totals
    user.calculateCartTotals();
    await user.save();

    return successResponse(res, 'Item added to cart successfully', {
      cart: {
        totalItems: user.cart.totalItems,
        totalAmount: user.cart.totalAmount,
        itemsCount: user.cart.items.length
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse(res, 'Failed to add item to cart', null, 500);
  }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private (Student only)
router.put('/update/:itemId', auth, isStudent, async (req, res) => {
  try {
    const { quantity, specialInstructions } = req.body;

    if (quantity && (quantity < 1 || quantity > 50)) {
      return errorResponse(res, 'Quantity must be between 1 and 50');
    }

    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 'Cart item not found', null, 404);
    }

    // Update item
    if (quantity !== undefined) {
      user.cart.items[itemIndex].quantity = quantity;
    }
    
    if (specialInstructions !== undefined) {
      user.cart.items[itemIndex].specialInstructions = specialInstructions;
    }

    // Recalculate totals
    user.calculateCartTotals();
    await user.save();

    return successResponse(res, 'Cart item updated successfully', {
      cart: {
        totalItems: user.cart.totalItems,
        totalAmount: user.cart.totalAmount
      }
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return errorResponse(res, 'Failed to update cart item', null, 500);
  }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private (Student only)
router.delete('/remove/:itemId', auth, isStudent, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const itemIndex = user.cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 'Cart item not found', null, 404);
    }

    // Remove item
    user.cart.items.splice(itemIndex, 1);

    // Recalculate totals
    user.calculateCartTotals();
    await user.save();

    return successResponse(res, 'Item removed from cart successfully', {
      cart: {
        totalItems: user.cart.totalItems,
        totalAmount: user.cart.totalAmount,
        itemsCount: user.cart.items.length
      }
    });

  } catch (error) {
    console.error('Cart item removal error:', error);
    return errorResponse(res, 'Failed to remove item from cart', null, 500);
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private (Student only)
router.delete('/clear', auth, isStudent, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.cart.items = [];
    user.cart.totalItems = 0;
    user.cart.totalAmount = 0;
    user.cart.lastUpdated = new Date();

    await user.save();

    return successResponse(res, 'Cart cleared successfully');

  } catch (error) {
    console.error('Cart clear error:', error);
    return errorResponse(res, 'Failed to clear cart', null, 500);
  }
});

// @route   POST /api/cart/checkout
// @desc    Convert cart to order
// @access  Private (Student only)
router.post('/checkout', auth, isStudent, async (req, res) => {
  try {
    const { notes = '' } = req.body;

    const user = await User.findById(req.user.id)
      .populate('cart.items.menuItemId', 'name price isAvailable preparationTime')
      .populate('cart.items.vendorId', 'name vendorInfo.shopName vendorInfo.isOpen');

    if (!user.cart.items || user.cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty');
    }

    // Validate all items are still available
    const unavailableItems = user.cart.items.filter(item => 
      !item.menuItemId || 
      !item.menuItemId.isAvailable || 
      !item.vendorId.vendorInfo.isOpen
    );

    if (unavailableItems.length > 0) {
      return errorResponse(res, 'Some items in your cart are no longer available. Please review your cart.');
    }

    // Get vendor ID (all items should be from same vendor due to cart validation)
    const vendorId = user.cart.items[0].vendorId._id;

    // Create order using existing order creation logic
    const Order = require('../models/Order');
    
    // Prepare order items with current prices
    const orderItems = user.cart.items.map(item => ({
      menuItemId: item.menuItemId._id,
      name: item.menuItemId.name,
      price: item.menuItemId.price, // Use current price
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const deliveryFee = 0; // Free pickup
    const totalAmount = subtotal + tax + deliveryFee;

    // Estimate preparation time
    const estimatedTime = Math.max(
      15, 
      user.cart.items.reduce((total, item) => {
        return total + (item.menuItemId.preparationTime * item.quantity / 10);
      }, 0)
    );

    // Create order
    const order = new Order({
      studentId: user._id,
      vendorId: vendorId,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      notes,
      estimatedTime: Math.round(estimatedTime)
    });

    await order.save();

    // Clear cart after successful order creation
    user.cart.items = [];
    user.cart.totalItems = 0;
    user.cart.totalAmount = 0;
    user.cart.lastUpdated = new Date();
    await user.save();

    // Populate order for response
    await order.populate([
      { path: 'studentId', select: 'name email studentId' },
      { path: 'vendorId', select: 'name vendorInfo.shopName' }
    ]);

    return successResponse(res, 'Order placed successfully', { 
      order,
      message: 'Your order has been placed and the vendor has been notified!'
    }, 201);

  } catch (error) {
    console.error('Checkout error:', error);
    return errorResponse(res, 'Failed to place order', null, 500);
  }
});

module.exports = router;