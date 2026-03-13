const mongoose = require('mongoose');

const eventSOSSchema = new mongoose.Schema({
  studentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hackathonId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  studentName:     { type: String, required: true },
  workspace:       { type: String, default: '' },        // student's workspace/lab location
  issueType:       {
    type: String,
    enum: ['Workspace Issue', 'Technical Issue', 'Food Coupon Issue', 'Other'],
    required: true,
  },
  message:         { type: String, default: '' },

  // Dual-verification flags
  cocomResolved:   { type: Boolean, default: false },    // CoCom marked it resolved
  studentResolved: { type: Boolean, default: false },    // Student confirmed resolution
}, { timestamps: true });

module.exports = mongoose.model('EventSOS', eventSOSSchema);
