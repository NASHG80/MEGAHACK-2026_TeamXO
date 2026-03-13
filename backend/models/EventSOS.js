const mongoose = require('mongoose');

const eventSOSSchema = new mongoose.Schema({
  hackathonId: { type: String, required: true },
  sosId: { type: String, required: true }, // custom short ID
  name: { type: String, required: true }, // requester name
  workspace: { type: String, required: true }, // e.g. "Lab 1"
  message: { type: String, required: true }, // "Projector not working"
  time: { type: String, required: true }, // "2 min ago" (could be computed, but simple for now)
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('EventSOS', eventSOSSchema);
