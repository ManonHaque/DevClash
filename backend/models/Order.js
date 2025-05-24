const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [50, 'Quantity cannot exceed 50']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [1, 'Total amount must be greater than 0']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, preparing, ready, completed, cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, paid, failed, refunded'
    },
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  estimatedTime: {
    type: Number, // minutes
    default: 30,
    min: 5,
    max: 120
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  deliveryCode: {
    type: String,
    unique: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ studentId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ deliveryCode: 1 });

// Generate unique delivery code before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.deliveryCode) {
    this.deliveryCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);