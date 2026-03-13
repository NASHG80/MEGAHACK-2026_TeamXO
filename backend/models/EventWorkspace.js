const mongoose = require('mongoose');

const eventWorkspaceSchema = new mongoose.Schema({
  hackathonId: { type: String, required: true }, // HF-001 by default currently
  workspaceId: { type: String, required: true }, // e.g. WS-001
  floor: { type: String, required: true },
  type: { type: String, enum: ['Lab', 'Room', 'CR', 'Hall', 'Other'], default: 'Lab' },
  number: { type: String, required: true },
  workstations: { type: Number, required: true, min: 1 },
  note: { type: String, default: '' },
  assignedTeams: [{
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    college: { type: String, required: true },
    slots: [{ type: Number }] // array of workstation indices (0-based)
  }]
}, { timestamps: true });

module.exports = mongoose.model('EventWorkspace', eventWorkspaceSchema);
