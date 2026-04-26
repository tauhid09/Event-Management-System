const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminExists = await User.findOne({ email: 'admin@eventsync.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@eventsync.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@eventsync.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
