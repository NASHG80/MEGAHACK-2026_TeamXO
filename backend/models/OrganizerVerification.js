const mongoose = require('mongoose');

const organizerVerificationSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    clubName: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    // Stores the original filename of the uploaded proof document
    proofDocument: {
      type: String,
      default: null,
    },
    // Stores the file path/URL on the server
    proofDocumentPath: {
      type: String,
      default: null,
    },
    // Verification status: pending → approved | rejected
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Admin who reviewed the request
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Admin rejection reason
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrganizerVerification', organizerVerificationSchema);
