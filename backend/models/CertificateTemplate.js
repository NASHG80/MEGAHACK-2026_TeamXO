const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
  id:             { type: String, required: true },
  type:           { type: String, enum: ['text', 'placeholder'], required: true },
  content:        { type: String, required: true },
  displayText:    { type: String },          // for placeholders only
  x:              { type: Number, default: 0 },
  y:              { type: Number, default: 0 },
  fontSize:       { type: Number, default: 16 },
  fontFamily:     { type: String, default: 'sans-serif' },
  fontWeight:     { type: String, default: 'normal' },
  fontStyle:      { type: String, default: 'normal' },
  textDecoration: { type: String, default: 'none' },
  color:          { type: String, default: '#111111' },
  textAlign:      { type: String, default: 'center' },
  width:          { type: Number, default: 500 },
  locked:         { type: Boolean, default: false },
}, { _id: false });

const certificateTemplateSchema = new mongoose.Schema(
  {
    hackathonId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    name:              { type: String, required: true, default: 'Custom Certificate' },
    templateType:      { type: String, enum: ['upload', 'preset'], default: 'preset' },
    // presetId when templateType === 'preset' (maps to CERTIFICATE_BACKGROUNDS id on FE)
    presetId:          { type: String, default: null },
    // Cloudinary / local URL when templateType === 'upload'
    backgroundImageUrl: { type: String, default: null },
    // Name placement (set when organiser clicks on the template preview)
    nameX:             { type: Number, default: 0.5 },  // 0-1 fraction of image width
    nameY:             { type: Number, default: 0.5 },  // 0-1 fraction of image height
    fontSize:          { type: Number, default: 52 },
    nameColor:         { type: String, default: '#1E3A8A' },
    elements:          { type: [elementSchema], default: [] },
    createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);
