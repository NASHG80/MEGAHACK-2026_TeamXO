const mongoose = require('mongoose');

const treasureHuntSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 10,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'expired'],
      default: 'in_progress',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CocomMember',
      default: null,
    },
    goodiesReward: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// One active task per student per hackathon at a time
treasureHuntSchema.index({ student: 1, hackathon: 1, status: 1 });

module.exports = mongoose.model('TreasureHunt', treasureHuntSchema);
