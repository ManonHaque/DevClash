const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        // CUET email format validation for students
        if (this.role === 'student') {
          return /^[a-zA-Z0-9._%+-]+@cuet\.ac\.bd$/.test(email);
        }
        // General email validation for vendors
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Students must use CUET email format (@cuet.ac.bd), vendors can use any valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'vendor'],
      message: 'Role must be either student or vendor'
    },
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        return /^(\+8801|01)[3-9]\d{8}$/.test(phone);
      },
      message: 'Please enter a valid Bangladeshi phone number (01XXXXXXXXX)'
    }
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: true,
    sparse: true,
    validate: {
      validator: function(studentId) {
        return this.role !== 'student' || (studentId && studentId.length >= 4);
      },
      message: 'Student ID must be at least 4 characters long'
    }
  },
  
  // 🛒 Shopping Cart for Students
  cart: {
    items: [{
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 50
      },
      specialInstructions: {
        type: String,
        maxlength: 200,
        default: ''
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    totalItems: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  vendorInfo: {
    shopName: {
      type: String,
      required: function() { return this.role === 'vendor'; },
      trim: true,
      maxlength: [100, 'Shop name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    schedule: {
      openTime: {
        type: String,
        default: '09:00',
        validate: {
          validator: function(time) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
          },
          message: 'Please provide time in HH:MM format'
        }
      },
      closeTime: {
        type: String,
        default: '22:00',
        validate: {
          validator: function(time) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
          },
          message: 'Please provide time in HH:MM format'
        }
      }
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ role: 1, isActive: 1 });

// 🛒 Cart calculation middleware
userSchema.methods.calculateCartTotals = function() {
  this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
  this.cart.totalAmount = this.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.cart.lastUpdated = new Date();
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output by default
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);