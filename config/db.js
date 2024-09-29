const mongoose = require('mongoose');

// Use the MONGODB_URI from the environment variables
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolDB';

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

// Listen for connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Listen for disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Listen for app termination and close the connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;