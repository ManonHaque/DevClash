// backend/utils/seedDatabase.js - Enhanced database seeding
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
require('dotenv').config();

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting enhanced database seeding...');
    
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create test vendors
    const vendors = [];

    const vendor1 = new User({
      name: 'Ahmed Hassan',
      email: 'ahmed.cafe@example.com',
      password: 'password123',
      role: 'vendor',
      phone: '01712345678',
      vendorInfo: {
        shopName: 'Campus Cafe',
        description: 'Best coffee and snacks on campus. Serving freshly brewed coffee and delicious snacks.',
        isOpen: true,
        schedule: {
          openTime: '08:00',
          closeTime: '22:00'
        }
      }
    });
    await vendor1.save();
    vendors.push(vendor1);

    const vendor2 = new User({
      name: 'Fatima Rahman',
      email: 'fatima.kitchen@example.com',
      password: 'password123',
      role: 'vendor',
      phone: '01712345679',
      vendorInfo: {
        shopName: 'Deshi Kitchen',
        description: 'Authentic Bengali cuisine made with love and traditional recipes.',
        isOpen: true,
        schedule: {
          openTime: '11:00',
          closeTime: '23:00'
        }
      }
    });
    await vendor2.save();
    vendors.push(vendor2);

    const vendor3 = new User({
      name: 'Karim Uddin',
      email: 'karim.fastfood@example.com',
      password: 'password123',
      role: 'vendor',
      phone: '01712345680',
      vendorInfo: {
        shopName: 'Quick Bites',
        description: 'Fast food and quick snacks for busy students.',
        isOpen: false, // This vendor is currently closed
        schedule: {
          openTime: '09:00',
          closeTime: '21:00'
        }
      }
    });
    await vendor3.save();
    vendors.push(vendor3);

    console.log('👨‍🍳 Created test vendors');

    // Create test students
    const students = [];

    const student1 = new User({
      name: 'Mohammad Rahman',
      email: 'mohammad.rahman@cuet.ac.bd',
      password: 'password123',
      role: 'student',
      phone: '01712345681',
      studentId: '1904001'
    });
    await student1.save();
    students.push(student1);

    const student2 = new User({
      name: 'Ayesha Khatun',
      email: 'ayesha.khatun@cuet.ac.bd',
      password: 'password123',
      role: 'student',
      phone: '01712345682',
      studentId: '1904002'
    });
    await student2.save();
    students.push(student2);

    console.log('👨‍🎓 Created test students');

    // Create sample menu items
    const menuItems = [
      // Campus Cafe items
      {
        vendorId: vendor1._id,
        name: 'Espresso Coffee',
        description: 'Strong and aromatic espresso shot made from premium coffee beans',
        price: 60,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 5
      },
      {
        vendorId: vendor1._id,
        name: 'Cappuccino',
        description: 'Classic cappuccino with steamed milk and foam art',
        price: 80,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 7
      },
      {
        vendorId: vendor1._id,
        name: 'Chicken Sandwich',
        description: 'Grilled chicken breast with fresh vegetables in toasted bread',
        price: 120,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 10
      },
      {
        vendorId: vendor1._id,
        name: 'Chocolate Muffin',
        description: 'Freshly baked chocolate chip muffin',
        price: 45,
        category: 'desserts',
        isAvailable: true,
        preparationTime: 5
      },
      {
        vendorId: vendor1._id,
        name: 'Club Sandwich',
        description: 'Triple layer sandwich with chicken, bacon, lettuce and tomato',
        price: 180,
        category: 'lunch',
        isAvailable: false, // Currently unavailable
        preparationTime: 12
      },

      // Deshi Kitchen items
      {
        vendorId: vendor2._id,
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken and traditional spices',
        price: 200,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 20
      },
      {
        vendorId: vendor2._id,
        name: 'Beef Curry',
        description: 'Slow cooked beef curry with authentic Bengali spices',
        price: 250,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 25
      },
      {
        vendorId: vendor2._id,
        name: 'Fish Fry',
        description: 'Crispy fried fish with special masala coating',
        price: 150,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 15
      },
      {
        vendorId: vendor2._id,
        name: 'Dal & Rice',
        description: 'Traditional lentil curry served with steamed basmati rice',
        price: 80,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 10
      },
      {
        vendorId: vendor2._id,
        name: 'Paratha',
        description: 'Flaky layered flatbread served hot',
        price: 25,
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 8
      },
      {
        vendorId: vendor2._id,
        name: 'Lassi',
        description: 'Traditional yogurt drink - sweet or salty',
        price: 40,
        category: 'beverages',
        isAvailable: true,
        preparationTime: 5
      },

      // Quick Bites items (vendor is closed but items exist)
      {
        vendorId: vendor3._id,
        name: 'Burger Combo',
        description: 'Beef burger with fries and soft drink',
        price: 220,
        category: 'lunch',
        isAvailable: true,
        preparationTime: 12
      },
      {
        vendorId: vendor3._id,
        name: 'Pizza Slice',
        description: 'Cheese pizza slice with pepperoni',
        price: 90,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 8
      },
      {
        vendorId: vendor3._id,
        name: 'French Fries',
        description: 'Crispy golden french fries with ketchup',
        price: 60,
        category: 'snacks',
        isAvailable: true,
        preparationTime: 6
      }
    ];

    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log('🍽️  Created sample menu items');

    // Create sample orders (using individual save to trigger pre-save hooks)
    const order1 = new Order({
      studentId: student1._id,
      vendorId: vendor1._id,
      items: [
        {
          menuItemId: createdMenuItems[0]._id, // Espresso
          name: createdMenuItems[0].name,
          price: createdMenuItems[0].price,
          quantity: 2
        },
        {
          menuItemId: createdMenuItems[2]._id, // Chicken Sandwich
          name: createdMenuItems[2].name,
          price: createdMenuItems[2].price,
          quantity: 1
        }
      ],
      subtotal: 240, // (60*2) + (120*1)
      tax: 12,
      deliveryFee: 0,
      totalAmount: 252,
      status: 'preparing',
      paymentStatus: 'paid',
      notes: 'Extra hot coffee please'
    });
    await order1.save();

    const order2 = new Order({
      studentId: student2._id,
      vendorId: vendor2._id,
      items: [
        {
          menuItemId: createdMenuItems[5]._id, // Chicken Biryani
          name: createdMenuItems[5].name,
          price: createdMenuItems[5].price,
          quantity: 1
        },
        {
          menuItemId: createdMenuItems[10]._id, // Lassi
          name: createdMenuItems[10].name,
          price: createdMenuItems[10].price,
          quantity: 1
        }
      ],
      subtotal: 240, // 200 + 40
      tax: 12,
      deliveryFee: 0,
      totalAmount: 252,
      status: 'ready',
      paymentStatus: 'paid'
    });
    await order2.save();
    console.log('📦 Created sample orders');

    console.log('✅ Enhanced database seeding completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('\n🏪 VENDORS:');
    console.log('1. Campus Cafe: ahmed.cafe@example.com / password123 (OPEN)');
    console.log('2. Deshi Kitchen: fatima.kitchen@example.com / password123 (OPEN)');
    console.log('3. Quick Bites: karim.fastfood@example.com / password123 (CLOSED)');
    console.log('\n👨‍🎓 STUDENTS:');
    console.log('1. Mohammad Rahman: mohammad.rahman@cuet.ac.bd / password123');
    console.log('2. Ayesha Khatun: ayesha.khatun@cuet.ac.bd / password123');
    console.log('\n🍽️  MENU ITEMS: 14 items across 3 vendors');
    console.log('📦 ORDERS: 2 sample orders with different statuses');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit();
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;