const mongoose = require('mongoose');

const CocomMemberSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  assigned_lab: { type: String, default: '' },
  role:         { type: String, default: 'Support' },
  status:       { type: String, enum: ['active', 'busy', 'offline'], default: 'active' },
  join_code:    { type: String, default: '' },
  hackathon_id: { type: String, default: 'global' },
}, { timestamps: true });

module.exports = mongoose.model('CocomMember', CocomMemberSchema);
