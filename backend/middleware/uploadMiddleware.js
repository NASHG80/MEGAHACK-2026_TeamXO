const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/**
 * Two separate multer instances:
 *
 *  1. imageMemory  – images only, kept in RAM (Buffer).
 *     Controllers read req.files.X[0].buffer → Sharp compress → Base64 → MongoDB.
 *
 *  2. pdfDisk  – PDFs only, written to ./uploads/ on disk.
 *     Controllers read req.files.problemStatementFile[0].path → store path in MongoDB.
 *
 *  combinedUpload handles all three hackathon fields using the right strategy per field.
 */

/* ── MEMORY storage for images ─────────────────────────── */
const imageMemory = multer({ storage: multer.memoryStorage() });

/* ── DISK storage for PDFs ──────────────────────────────── */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const pdfDisk = multer({ storage: pdfStorage });

/* ── Combined upload for hackathon form ─────────────────── */
// We wrap multer.fields manually: images go to memory, PDF goes to disk.
// Easiest cross-compatible approach: use a single memory instance for all fields,
// then in the controller write the PDF buffer to disk if needed.
// This keeps the middleware simple.
const combinedStorage = multer.memoryStorage();

const combinedFileFilter = (_req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isPdf   = file.mimetype === 'application/pdf';
  if (isImage || isPdf) return cb(null, true);
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

const combinedMulter = multer({
  storage: combinedStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const combinedUpload = combinedMulter.fields([
  { name: 'bannerImage',          maxCount: 1 },
  { name: 'logoImage',            maxCount: 1 },
  { name: 'problemStatementFile', maxCount: 1 }, // PDF — controller writes buffer to disk
]);

/* ── Single-image upload for certificate templates ──────── */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { combinedUpload, upload, uploadDir };
