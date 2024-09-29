const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  level: { type: Number, required: true, min: 1, max: 12 },
  siblings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  district: { type: String, required: true },
  // New status field
  status: {
    type: String,
    required: true,
    enum: ['enrolled', 'graduated', 'suspended', 'withdrawn'],
    default: 'enrolled'
  },
  // New field for transport needs
  needsTransport: {
    type: Boolean,
    default: true
  }
});

// Method to add a sibling and ensure bidirectional relationship
StudentSchema.methods.addSibling = async function (siblingId) {
  if (!this.siblings.includes(siblingId)) {
    this.siblings.push(siblingId);
    await this.save();

    const sibling = await this.model('Student').findById(siblingId);
    if (sibling && !sibling.siblings.includes(this._id)) {
      sibling.siblings.push(this._id);
      await sibling.save();
    }
  }
};

// Method to remove a sibling and ensure bidirectional relationship
StudentSchema.methods.removeSibling = async function (siblingId) {
  this.siblings = this.siblings.filter(id => id.toString() !== siblingId.toString());
  await this.save();

  const sibling = await this.model('Student').findById(siblingId);
  if (sibling) {
    sibling.siblings = sibling.siblings.filter(id => id.toString() !== this._id.toString());
    await sibling.save();
  }
};

module.exports = mongoose.model('Student', StudentSchema);