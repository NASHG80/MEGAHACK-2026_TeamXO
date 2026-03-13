const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    hackathonId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    templateId:       { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },

    // Recipient info (denormalized for quick email sending)
    recipientName:    { type: String, required: true },
    recipientEmail:   { type: String, required: true },
    recipientType:    { type: String, enum: ['participant', 'winner'], default: 'participant' },
    position:         { type: String, default: null }, // '1st Place' etc for winners

    // Generated file
    fileUrl:          { type: String, default: null }, // Cloudinary or local path

    // Unique certificate number e.g. HCK-2026-A3F7
    certificateNumber: { type: String, unique: true },

    // Email delivery
    status:           { type: String, enum: ['pending', 'generated', 'sent', 'failed'], default: 'pending' },
    emailSentAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate certificate number before save if not present
certificateSchema.pre('save', function (next) {
  if (!this.certificateNumber) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.certificateNumber = `HCK-${new Date().getFullYear()}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
