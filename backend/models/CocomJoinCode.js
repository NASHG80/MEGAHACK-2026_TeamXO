const mongoose = require('mongoose');

const CocomJoinCodeSchema = new mongoose.Schema({
  join_code:    { type: String, required: true, unique: true },
  hackathon_id: { type: String, default: 'global' },
  created_by:   { type: String, default: 'organizer' },
}, { timestamps: true });

module.exports = mongoose.model('CocomJoinCode', CocomJoinCodeSchema);
