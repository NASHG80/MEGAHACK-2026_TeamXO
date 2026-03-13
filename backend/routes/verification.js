const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { protect, requireRole } = require('../middleware/auth');
const {
  submitVerification,
  getMyVerification,
  getAllVerifications,
  reviewVerification,
  getAdminStats,
  getUsers,
} = require('../controllers/verificationController');

const router = express.Router();

/* ── Multer: store uploaded proof docs in /uploads/proofs ── */
const uploadDir = path.join(__dirname, '..', 'uploads', 'proofs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only PDF/JPG/PNG files are allowed'), ok);
  },
});

/* ── Organizer routes ── */
// Wrap multer in a manual error handler so file-type/size errors return 400 not 500
router.post('/organizer/verification', protect, requireRole('organizer'), (req, res, next) => {
  upload.single('proofDocument')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Proof document must be under 5 MB'
        : err.message || 'File upload error';
      return res.status(400).json({ message: msg });
    }
    next();
  });
}, submitVerification);

router.get('/organizer/verification/me',   protect, requireRole('organizer'), getMyVerification);


/* ── Admin routes ── */
router.get('/admin/verifications',         protect, requireRole('admin'), getAllVerifications);
router.patch('/admin/verifications/:id/review', protect, requireRole('admin'), reviewVerification);
router.get('/admin/stats',                 protect, requireRole('admin'), getAdminStats);
router.get('/admin/users',                 protect, requireRole('admin'), getUsers);

/* ── Serve uploaded proof files (admin only) ── */
router.use('/uploads/proofs', protect, requireRole('admin'), express.static(uploadDir));

module.exports = router;
