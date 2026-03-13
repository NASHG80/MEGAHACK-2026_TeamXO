/**
 * Generates a cryptographically random 6-digit OTP.
 * Uses crypto.randomInt for better randomness than Math.random().
 */
const crypto = require("crypto");

const generateOtp = () => {
  // Generates integer in [0, 1000000) → pad to 6 digits
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
};

module.exports = generateOtp;
