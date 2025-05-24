const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters'],
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1 BDT'],
    max: [10000, 'Price cannot exceed 10,000 BDT']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'],
      message: 'Category must be one of: breakfast, lunch, dinner, snacks, beverages, desserts'
    }
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [5, 'Preparation time must be at least 5 minutes'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ vendorId: 1, category: 1 });
menuItemSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);