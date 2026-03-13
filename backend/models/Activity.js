const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  hackathonId: { type: String, required: true },
  actor: { type: String, required: true },
  action: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['join', 'submit', 'verify', 'reg', 'update'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
