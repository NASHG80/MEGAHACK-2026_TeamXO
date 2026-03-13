const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      default: "student",
    },

    // ── OTP / Email Verification ───────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,  // true after email OTP verified
    },

    // ── Organizer Profile Approval (set by admin) ─────────────────
    orgVerified: {
      type: Boolean,
      default: false,  // true only when admin approves verification request
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpSentAt: {
      type: Date,
      default: null,
    },

    // ── College Email Verification ────────────────────────────────
    collegeVerified: {
      type: Boolean,
      default: false,
    },
    collegeEmail: {
      type: String,
      default: null,
    },
    collegeOtp: {
      type: String,
      default: null,
    },
    collegeOtpExpiry: {
      type: Date,
      default: null,
    },
    collegeOtpSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare plaintext password with stored hash ──────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
