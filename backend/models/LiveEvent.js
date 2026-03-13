const mongoose = require("mongoose");
const crypto = require("crypto");

const liveEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    isShortlisted: {
      type: Boolean,
      default: true,
    },

    // Workspace
    workspaceNumber: {
      type: String,
      default: "A-1",
    },
    workspaceLocation: {
      type: String,
      default: "Main Hall – Row 1",
    },
    teamName: {
      type: String,
      default: "My Team",
    },

    // Statuses
    entryStatus: {
      type: String,
      enum: ["Not Entered", "Entered"],
      default: "Not Entered",
    },
    lunchStatus: {
      type: String,
      enum: ["Not Claimed", "Claimed"],
      default: "Not Claimed",
    },
    dinnerStatus: {
      type: String,
      enum: ["Not Claimed", "Claimed"],
      default: "Not Claimed",
    },

    // QR tokens (unique per participant)
    entryQR: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },
    mealsQR: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },
  },
  { timestamps: true }
);

// Compound index — one record per student per hackathon
liveEventSchema.index({ student: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.model("LiveEvent", liveEventSchema);
