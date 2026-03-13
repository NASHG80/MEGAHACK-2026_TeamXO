const mongoose = require('mongoose');

const eventTeamSchema = new mongoose.Schema({
  hackathonId: { type: String, required: true },
  teamId: { type: String, required: true },
  name: { type: String, required: true },
  college: { type: String, required: true },
  members: { type: Number, required: true },
  entered: { type: Boolean, default: false },
  entryTime: { type: String, default: null }, // e.g. "9:42 AM"
  memberNames: [{ type: String }],
  memberStatus: {
    type: Map,
    of: String, // 'present' or 'absent'
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('EventTeam', eventTeamSchema);
