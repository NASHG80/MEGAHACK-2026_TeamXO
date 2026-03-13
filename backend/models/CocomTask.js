const mongoose = require('mongoose');

const CocomTaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'CocomMember', default: null },
  location:    { type: String, default: '' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  deadline:    { type: Date, default: null },
  status:      { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  created_by:  { type: String, default: 'organizer' },
}, { timestamps: true });

module.exports = mongoose.model('CocomTask', CocomTaskSchema);
