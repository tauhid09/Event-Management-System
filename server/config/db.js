const mongoose = require('mongoose');
const dns = require('dns').promises;

let mongoServer; // Reference to in-memory server (if used)

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If the connection string uses the +srv format, attempt an SRV lookup first
    if (uri && uri.startsWith('mongodb+srv://')) {
      try {
        const stripped = uri.replace('mongodb+srv://', '');
        // Strip credentials (user:pass@) if present
        const afterCreds = stripped.includes('@') ? stripped.split('@')[1] : stripped;
        const hostPart = afterCreds.split('/')[0];
        const srvName = `_mongodb._tcp.${hostPart.split(',')[0]}`;
        await dns.resolveSrv(srvName);
      } catch (dnsErr) {
        console.warn('⚠️  SRV DNS lookup failed for MongoDB Atlas:', dnsErr.message);
        console.warn('Falling back to in-memory MongoDB for local development...');
        uri = null; // Force fallback
      }
    }

    // If no URI or Atlas unreachable, use in-memory MongoDB
    if (!uri) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        console.log('📦 Using in-memory MongoDB for local development');
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
        console.error('Please install it: npm install mongodb-memory-server');
        console.error('Or provide a valid MONGO_URI in your .env file.');
        setTimeout(connectDB, 5000);
        return;
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin if using memory server or development
    if (!process.env.MONGO_URI || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      const User = require('../models/User');
      const adminExists = await User.findOne({ email: 'admin@eventsync.com' });
      if (!adminExists) {
        await User.create({
          name: 'Super Admin',
          email: 'admin@eventsync.com',
          password: 'password123',
          role: 'admin',
          isVerified: true
        });
        console.log('👤 Admin user auto-seeded (Local Memory)');
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error && error.syscall === 'querySrv') {
      console.error('DNS SRV query failed. If you are using a mongodb+srv URI, try switching to the standard (mongodb://) connection string from Atlas.');
    }
    // Retry logic
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

// Cleanup on process exit
process.on('SIGINT', async () => {
  if (mongoServer) {
    await mongoServer.stop();
    console.log('📦 In-memory MongoDB stopped');
  }
  process.exit(0);
});

module.exports = connectDB;
