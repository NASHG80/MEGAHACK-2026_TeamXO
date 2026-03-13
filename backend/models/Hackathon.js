const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  date:        { type: String, default: '' },
  time:        { type: String, default: '' },
});

const stageSchema = new mongoose.Schema({
  round: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  date: { type: String },
});

const prizeSchema = new mongoose.Schema({
  rank: { type: String, required: true },
  label: { type: String, required: true },
  amount: { type: String, required: true },
  emoji: { type: String },
});

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    organizerName: { type: String, required: true },
    logoImage: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Offline' },
    teamSizeMin: { type: Number, default: 2 },
    teamSizeMax: { type: Number, default: 4 },
    registrationDeadline: { type: Date },
    startDate: { type: Date },
    endDate:   { type: Date },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    prizePool: { type: String, default: '' },
    tags: [{ type: String }],
    
    description: { type: String, required: true },
    
    stages: [stageSchema],
    timeline: [timelineEventSchema],
    
    problemStatement: {
      title: { type: String },
      fileName: { type: String },
      fileSize: { type: String },
      downloadUrl: { type: String }
    },

    prizes: [prizeSchema],
    rules: [{ type: String }],

    organizerContact: { type: String, required: true },
    whatsappLink: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resultsPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);








module.exports = mongoose.model('Hackathon', hackathonSchema);
