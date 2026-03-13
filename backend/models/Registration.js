const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name:    { type: String, default: '' },
  email:   { type: String, default: '' },
  college: { type: String, default: '' },
});

const registrationSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    teamName: { type: String, required: true },
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    college: { type: String, required: true },
    teamMembers: [teamMemberSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'confirmed',
    },
    // ── Resume & AI Scoring ─────────────────────────────────────
    resumeUrl: { type: String, default: null },
    extractedText: { type: String, default: null },
    aiScore: { type: Number, default: null },
    shortlisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
