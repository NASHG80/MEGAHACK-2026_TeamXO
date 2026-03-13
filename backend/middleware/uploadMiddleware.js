const multer = require('multer');
const path = require('path');

/* ── Determine storage backend ─────────────────────────────────────────────
   If CLOUDINARY_CLOUD_NAME is set to a real value, use Cloudinary.
   Otherwise fall back to local disk storage so the form still works.
───────────────────────────────────────────────────────────────────────── */
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let storage;

if (isCloudinaryConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isPdf =
        file.mimetype === 'application/pdf' ||
        file.fieldname === 'problemStatementFile';

      if (isPdf) {
        return {
          folder: 'hackathon-platform/pdfs',
          resource_type: 'raw',
          format: 'pdf',
        };
      }

      return {
        folder: 'hackathon-platform/images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
      };
    },
  });

  console.log('✅ Upload middleware: Using Cloudinary storage');
} else {
  // Fallback: save files to ./uploads/ on disk
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

  console.log(
    '⚠️  Upload middleware: Cloudinary not configured — using local disk storage at ./uploads/'
  );
}

/**
 * File filter: accept images OR pdfs, reject everything else.
 */
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';
  if (isImage || isPdf) return cb(null, true);
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

const FIELDS = [
  { name: 'bannerImage', maxCount: 1 },
  { name: 'logoImage', maxCount: 1 },
  { name: 'problemStatementFile', maxCount: 1 },
];

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
});

/** Drop this into any route that needs hackathon file uploads */
const combinedUpload = upload.fields(FIELDS);

module.exports = { combinedUpload };
