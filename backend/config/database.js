const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options (updated for newer Mongoose versions)
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('📦 MongoDB Connected Successfully!');
    console.log('🌐 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('🔗 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during MongoDB disconnection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Check your username and password in the connection string');
    } else if (error.message.includes('network timeout')) {
      console.error('🌐 Check your internet connection and MongoDB Atlas network access');
    } else if (error.message.includes('bad auth')) {
      console.error('🔐 Invalid database credentials');
    }
    
    console.error('💡 Troubleshooting:');
    console.error('   1. Verify your MongoDB Atlas connection string');
    console.error('   2. Check your database credentials');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Confirm your cluster is running');
    
    process.exit(1);
  }
};

module.exports = connectDB;