// models/Payment.js

const mongoose = require('mongoose');

// Define possible status and type values
const STATUS_ENUM = ['pending', 'paid'];
const TYPE_ENUM = ['education', 'transport'];

const StatusChangeSchema = new mongoose.Schema({
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: STATUS_ENUM, required: true },
  discount: { type: Number, default: 0 },
  amountBeforeDiscount: { type: Number, required: true },
  amountAfterDiscount: { type: Number, required: true }
});

const PaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: TYPE_ENUM, required: true }, // 'education' or 'transport'
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  status: { type: String, enum: STATUS_ENUM, default: 'pending' },
  discount: { type: Number, default: 0 },
  statusChanges: [StatusChangeSchema]
});

// Add indexes for performance and uniqueness
PaymentSchema.index(
  { student: 1, type: 1, year: 1, month: 1 },
  { unique: true }
);
PaymentSchema.index({ student: 1, year: 1, type: 1 });
PaymentSchema.index({ year: 1, type: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);