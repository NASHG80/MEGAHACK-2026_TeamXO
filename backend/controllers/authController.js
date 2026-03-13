const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

// OTP valid for 5 minutes
const OTP_TTL_MS = 5 * 60 * 1000;
// Max 3 OTP requests per 10 minutes (rate-limit guard at controller level)
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends

/* ─────────────────────────────────────────────────────────────────
   Helper: standardised error response
───────────────────────────────────────────────────────────────── */
const fail = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

const ok = (res, status, data) =>
  res.status(status).json({ success: true, ...data });

/* ─────────────────────────────────────────────────────────────────
   1. POST /api/auth/send-otp
   Validates email, generates OTP, emails it, stores it in DB.
───────────────────────────────────────────────────────────────── */
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find or create a pending user record
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.isVerified && user.password) {
      return fail(res, 409, "Email already registered. Please log in.");
    }

    // Resend cooldown check
    if (user && user.otpSentAt) {
      const elapsed = Date.now() - new Date(user.otpSentAt).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return fail(res, 429, `Please wait ${waitSec}s before requesting another OTP.`);
      }
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    const otpHash = await bcrypt.hash(otp, 10); // store hash, not plain OTP

    if (user) {
      user.otp = otpHash;
      user.otpExpiry = otpExpiry;
      user.otpSentAt = new Date();
      user.isVerified = false;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        otp: otpHash,
        otpExpiry,
        otpSentAt: new Date(),
      });
    }

    // Send email
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;padding:32px">
        <h2 style="color:#6366f1;margin-bottom:8px">HackFlow – Verify Your Email</h2>
        <p style="color:#374151">Use the OTP below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">If you did not request this, you can safely ignore this email.</p>
      </div>`;

    await sendEmail(email, "Your HackFlow OTP Code", html);

    return ok(res, 200, { message: "OTP sent to your email. Valid for 5 minutes." });
  } catch (err) {
    console.error("sendOtp error:", err);
    return fail(res, 500, "Failed to send OTP. Please try again.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   2. POST /api/auth/verify-otp
   Checks OTP match + expiry, marks user as verified.
───────────────────────────────────────────────────────────────── */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp) {
      return fail(res, 400, "No OTP found for this email. Please request a new one.");
    }

    if (new Date() > new Date(user.otpExpiry)) {
      // Clear expired OTP
      user.otp = null;
      user.otpExpiry = null;
      await user.save({ validateBeforeSave: false });
      return fail(res, 400, "OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return fail(res, 400, "Incorrect OTP. Please try again.");
    }

    // Mark verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpSentAt = null;
    await user.save({ validateBeforeSave: false });

    return ok(res, 200, { message: "Email verified successfully. You can now complete your registration." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return fail(res, 500, "Server error during OTP verification.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   3. POST /api/auth/register
   Completes signup after OTP verification.
───────────────────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Password strength: min 8 chars, at least one letter + one digit
    const pwStrong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    if (!pwStrong) {
      return fail(res, 400, "Password must be at least 8 characters and contain letters and numbers.");
    }

    if (!["student", "organizer", "cocom"].includes(role)) {
      return fail(res, 400, "Role must be 'student', 'organizer', or 'cocom'.");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return fail(res, 404, "Email not found. Please complete OTP verification first.");
    }
    if (!user.isVerified) {
      return fail(res, 403, "Email not verified. Please verify your OTP first.");
    }
    if (user.password) {
      return fail(res, 409, "Account already registered. Please log in.");
    }

    user.name = name?.trim() || "";
    user.password = password; // hashed by pre-save hook
    user.role = role;
    await user.save();

    const token = signToken({ id: user._id, role: user.role, name: user.name, email: user.email });

    return ok(res, 201, {
      message: "Account created successfully.",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("register error:", err);
    return fail(res, 500, "Server error during registration.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   4. POST /api/auth/login
───────────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, 400, "Email and password are required.");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return fail(res, 401, "Invalid email or password.");
    }
    if (!user.isVerified) {
      return fail(res, 403, "Please verify your email before logging in.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return fail(res, 401, "Invalid email or password.");
    }

    const token = signToken({ id: user._id, role: user.role, name: user.name, email: user.email });

    return ok(res, 200, {
      message: "Login successful.",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("login error:", err);
    return fail(res, 500, "Server error during login.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   5. POST /api/auth/admin-login  (env-based, no DB lookup)
───────────────────────────────────────────────────────────────── */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, 400, "Email and password are required.");
    }

    if (
      email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase() ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return fail(res, 401, "Invalid admin credentials.");
    }

    const token = signToken({ id: "admin", role: "admin" });

    return ok(res, 200, {
      message: "Admin login successful.",
      token,
      role: "admin",
      name: "Admin",
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return fail(res, 500, "Server error during admin login.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   6. GET /api/auth/me  (protected)
───────────────────────────────────────────────────────────────── */
exports.getMe = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return ok(res, 200, { id: "admin", name: "Admin", role: "admin" });
    }
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry -otpSentAt");
    if (!user) return fail(res, 404, "User not found.");
    return ok(res, 200, { user });
  } catch (err) {
    return fail(res, 500, "Server error.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   7. POST /api/auth/send-college-otp  (protected)
   Validates college email domain, sends OTP to college email.
───────────────────────────────────────────────────────────────── */
const ALLOWED_COLLEGE_DOMAIN = "@svkmmumbai.onmicrosoft.com";

exports.sendCollegeOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const collegeEmail = email.toLowerCase().trim();

    // Domain check
    if (!collegeEmail.endsWith(ALLOWED_COLLEGE_DOMAIN)) {
      return fail(
        res,
        400,
        `Please use your college email ending with ${ALLOWED_COLLEGE_DOMAIN}`
      );
    }

    // Load the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) return fail(res, 404, "User not found.");

    // Already verified?
    if (user.collegeVerified) {
      return fail(res, 409, "College email already verified.");
    }

    // Resend cooldown check (1 min)
    if (user.collegeOtpSentAt) {
      const elapsed = Date.now() - new Date(user.collegeOtpSentAt).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return fail(res, 429, `Please wait ${waitSec}s before requesting another OTP.`);
      }
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + OTP_TTL_MS);

    user.collegeOtp = otpHash;
    user.collegeOtpExpiry = expiry;
    user.collegeOtpSentAt = new Date();
    // Temporarily store the college email being verified
    user.collegeEmail = collegeEmail;
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;padding:32px">
        <h2 style="color:#6366f1;margin-bottom:8px">HackFlow – Student Email Verification</h2>
        <p style="color:#374151">Use the OTP below to verify your college email address. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">If you did not request this, you can safely ignore this email.</p>
      </div>`;

    await sendEmail(collegeEmail, "Student Email Verification", html);

    return ok(res, 200, { message: "OTP sent to your college email. Valid for 5 minutes." });
  } catch (err) {
    console.error("sendCollegeOtp error:", err);
    return fail(res, 500, "Failed to send OTP. Please try again.");
  }
};

/* ─────────────────────────────────────────────────────────────────
   8. POST /api/auth/verify-college-otp  (protected)
   Confirms OTP and marks the student as college-verified.
───────────────────────────────────────────────────────────────── */
exports.verifyCollegeOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return fail(res, 404, "User not found.");

    if (!user.collegeOtp || !user.collegeOtpExpiry) {
      return fail(res, 400, "No OTP found. Please request a new one.");
    }

    if (new Date() > new Date(user.collegeOtpExpiry)) {
      user.collegeOtp = null;
      user.collegeOtpExpiry = null;
      await user.save({ validateBeforeSave: false });
      return fail(res, 400, "OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, user.collegeOtp);
    if (!isMatch) {
      return fail(res, 400, "Incorrect OTP. Please try again.");
    }

    // Mark verified, clear college OTP fields
    user.collegeVerified = true;
    user.collegeOtp = null;
    user.collegeOtpExpiry = null;
    user.collegeOtpSentAt = null;
    await user.save({ validateBeforeSave: false });

    return ok(res, 200, {
      message: "College email verified successfully!",
      collegeVerified: true,
      collegeEmail: user.collegeEmail,
    });
  } catch (err) {
    console.error("verifyCollegeOtp error:", err);
    return fail(res, 500, "Server error during OTP verification.");
  }
};
