// models/TransportFees.js

const mongoose = require('mongoose');

const transportFeesSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  fees: {
    primary: {
      type: Number,
      required: true,
      min: 0,
    },
    middle: {
      type: Number,
      required: true,
      min: 0,
    },
    high: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure uniqueness of year and district combination
transportFeesSchema.index({ year: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('TransportFees', transportFeesSchema);