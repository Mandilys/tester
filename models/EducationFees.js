// models/EducationFees.js

const mongoose = require('mongoose');

const educationFeesSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  fees: {
    primary: {
      type: Number,
      required: true,
      min: 0
    },
    middle: {
      type: Number,
      required: true,
      min: 0
    },
    high: {
      type: Number,
      required: true,
      min: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EducationFees', educationFeesSchema);