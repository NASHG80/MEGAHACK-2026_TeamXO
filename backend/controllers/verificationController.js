const OrganizerVerification = require('../models/OrganizerVerification');
const User = require('../models/User');

/* ────────────────────────────────────────────────────────────────────────────
   POST /api/organizer/verification
   Submit or update a verification request (organizer only)
──────────────────────────────────────────────────────────────────────────── */
const submitVerification = async (req, res) => {
  try {
    const { clubName, college, linkedin, website } = req.body;

    if (!clubName || !clubName.trim()) {
      return res.status(400).json({ message: 'Club / organisation name is required' });
    }
    if (!college || !college.trim()) {
      return res.status(400).json({ message: 'College name is required' });
    }

    const organizerId = req.user.id;

    // Check for an existing record
    let existing = await OrganizerVerification.findOne({ organizerId });

    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: 'Your verification is already under review. Please wait for admin approval.' });
    }
    if (existing && existing.status === 'approved') {
      return res.status(400).json({ message: 'Your organizer account is already verified.' });
    }

    // File details (optional — organizer can also resubmit without re-uploading)
    const proofDocument     = req.file ? req.file.originalname : (existing?.proofDocument     || null);
    const proofDocumentPath = req.file ? req.file.path         : (existing?.proofDocumentPath || null);

    if (!existing) {
      // ── First submission: create a new record ──
      existing = new OrganizerVerification({
        organizerId,
        clubName:         clubName.trim(),
        college:          college.trim(),
        linkedin:         linkedin?.trim()  || '',
        website:          website?.trim()   || '',
        proofDocument,
        proofDocumentPath,
        status:           'pending',
        reviewedBy:       null,
        reviewedAt:       null,
        rejectionReason:  null,
      });
    } else {
      // ── Resubmission after rejection: update fields ──
      existing.clubName          = clubName.trim();
      existing.college           = college.trim();
      existing.linkedin          = linkedin?.trim()  || '';
      existing.website           = website?.trim()   || '';
      existing.status            = 'pending';
      existing.reviewedBy        = null;
      existing.reviewedAt        = null;
      existing.rejectionReason   = null;
      if (req.file) {
        existing.proofDocument     = proofDocument;
        existing.proofDocumentPath = proofDocumentPath;
      }
    }

    const saved = await existing.save();
    res.status(201).json({ message: 'Verification request submitted successfully', verification: saved });
  } catch (err) {
    console.error('[submitVerification] ERROR:', err.name, err.message);
    if (err.code === 11000) {
      // Duplicate key — race condition safety
      return res.status(400).json({ message: 'A verification request already exists for your account.' });
    }
    res.status(500).json({ message: 'Server error while submitting verification. Please try again.' });
  }
};


/* ────────────────────────────────────────────────────────────────────────────
   GET /api/organizer/verification/me
   Get the logged-in organizer's own verification status
──────────────────────────────────────────────────────────────────────────── */
const getMyVerification = async (req, res) => {
  try {
    const [verification, user] = await Promise.all([
      OrganizerVerification.findOne({ organizerId: req.user.id }),
      User.findById(req.user.id).select('orgVerified'),
    ]);

    // If the verification document claims 'approved' but the User's orgVerified flag
    // is false (e.g. admin revoked it manually), override the status so the frontend
    // reflects the true state.
    if (verification && verification.status === 'approved' && user && !user.orgVerified) {
      const corrected = verification.toObject();
      corrected.status = 'pending';
      return res.json({ verification: corrected });
    }

    res.json({ verification: verification || null });
  } catch (err) {
    console.error('[getMyVerification]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   GET /api/admin/verifications
   Get all verification requests (admin only), supports ?status= filter
──────────────────────────────────────────────────────────────────────────── */
const getAllVerifications = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const verifications = await OrganizerVerification.find(filter)
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ verifications });
  } catch (err) {
    console.error('[getAllVerifications]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/verifications/:id/review
   Approve or reject a verification (admin only)
   Body: { action: 'approve' | 'reject', rejectionReason? }
──────────────────────────────────────────────────────────────────────────── */
const reviewVerification = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'action must be "approve" or "reject"' });
    }

    const verification = await OrganizerVerification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Verification request not found' });
    }
    if (verification.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    verification.status      = action === 'approve' ? 'approved' : 'rejected';
    verification.reviewedBy  = 'admin';
    verification.reviewedAt  = new Date();
    if (action === 'reject' && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }
    await verification.save();

    // If approved — set orgVerified on User (not isVerified which is for email OTP)
    if (action === 'approve') {
      await User.findByIdAndUpdate(verification.organizerId, { orgVerified: true });
      const { addLoyaltyPoints } = require('../utils/loyaltyProcessor');
      await addLoyaltyPoints(verification.organizerId, 50, 'Organizer Profile Approved');
    }
    // If rejected — ensure orgVerified is false
    if (action === 'reject') {
      await User.findByIdAndUpdate(verification.organizerId, { orgVerified: false });
    }

    res.json({ message: `Verification ${action}d`, verification });
  } catch (err) {
    console.error('[reviewVerification]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   GET /api/admin/stats
   Platform summary counts (admin only)
──────────────────────────────────────────────────────────────────────────── */
const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalOrganizers, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organizer' }),
      OrganizerVerification.countDocuments({ status: 'pending' }),
    ]);
    res.json({ totalStudents, totalOrganizers, pendingVerifications });
  } catch (err) {
    console.error('[getAdminStats]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   GET /api/admin/users?role=student|organizer
   List all users of a given role (admin only)
──────────────────────────────────────────────────────────────────────────── */
const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    
    // If requesting organizers, join with OrganizerVerification to get club/college
    if (role === 'organizer') {
      const users = await User.aggregate([
        { $match: { role: 'organizer' } },
        {
          $lookup: {
            from: 'organizerverifications', // MongoDB collection name for OrganizerVerification
            localField: '_id',
            foreignField: 'organizerId',
            as: 'verification'
          }
        },
        // Unwind to easily access fields (preserves existing flat structure)
        { $unwind: { path: '$verification', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        // Exclude passwords
        { $project: { password: 0, otp: 0, otpExpiry: 0, otpSentAt: 0 } }
      ]);
      return res.json({ users });
    }

    // Default for students or mixed
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry -otpSentAt')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('[getUsers]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitVerification,
  getMyVerification,
  getAllVerifications,
  reviewVerification,
  getAdminStats,
  getUsers,
};
