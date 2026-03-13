const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const {
  sendOtp,
  verifyOtp,
  register,
  login,
  adminLogin,
  getMe,
  sendCollegeOtp,
  verifyCollegeOtp,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

/* ─── Validation helper ─────────────────────────────────────── */
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }
    next();
  },
];

/* ─── Rate limiters ─────────────────────────────────────────── */
// Max 5 OTP requests per IP per 15 min
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many OTP requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Max 10 login attempts per IP per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── Routes ────────────────────────────────────────────────── */

// 1. Send OTP
router.post(
  "/send-otp",
  otpLimiter,
  validate([
    body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  ]),
  sendOtp
);

// 2. Verify OTP
router.post(
  "/verify-otp",
  validate([
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be a 6-digit number."),
  ]),
  verifyOtp
);

// 3. Complete Registration (after OTP verified)
router.post(
  "/register",
  validate([
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage("Password must contain at least one letter and one number."),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("role").isIn(["student", "organizer"]).withMessage("Role must be 'student' or 'organizer'."),
  ]),
  register
);

// 4. Login
router.post(
  "/login",
  loginLimiter,
  validate([
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ]),
  login
);

// 5. Admin Login
router.post("/admin-login", loginLimiter, adminLogin);

// 6. Get current user (protected)
router.get("/me", protect, getMe);

// 7. Send College Email OTP (protected — student must be logged in)
router.post(
  "/send-college-otp",
  protect,
  otpLimiter,
  validate([
    body("email").isEmail().withMessage("Please provide a valid college email address.").normalizeEmail(),
  ]),
  sendCollegeOtp
);

// 8. Verify College Email OTP (protected)
router.post(
  "/verify-college-otp",
  protect,
  validate([
    body("otp")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be a 6-digit number."),
  ]),
  verifyCollegeOtp
);

module.exports = router;
