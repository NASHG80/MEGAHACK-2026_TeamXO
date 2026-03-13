const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const { protect } = require('../middleware/auth');
const { createPost, getPosts, reactToPost } = require('../controllers/postController');

// Ensure upload folder exists
const postsDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, postsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /png|jpg|jpeg|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

router.get('/',              getPosts);
router.post('/create',       protect, upload.single('image'), createPost);
router.post('/react',        protect, reactToPost);

module.exports = router;
