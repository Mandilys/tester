// seedAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust the path as necessary

// MongoDB connection string
const dbURI = 'mongodb://localhost:27017/schoolDB'; // Replace with your actual database name

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Function to seed admin user
async function seedAdmin() {
  try {
    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists. Exiting...');
      process.exit(0);
    }

    // Create a new admin user
    const admin = new User({
      username: 'admin', // Change as needed
      password: 'adminpassword', // Change as needed
      role: 'admin'
    });

    // Save the admin user to the database
    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}