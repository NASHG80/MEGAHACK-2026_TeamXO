const express = require('express');
const router = express.Router();
const {
  registerTeam,
  registerWithResume,
  getRegistrations,
  getAllRegistrations,
  getMyRegistrations,
  checkRegistration,
  getMyShortlistStatus,
  shortlistRegistration,
  deleteRegistration,
  rescoreRegistration,
  sendShortlistEmails,
  publishResults,
  saveGithubLink,
} = require('../controllers/registrationController');
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');

// ── RAW REQUEST LOGGER (fires before anything else) ─────────────
router.use((req, res, next) => {
  console.log(`[ROUTER] ${req.method} /api/registrations${req.path} — ${new Date().toISOString()}`);
  next();
});

// POST — simple team registration (no file)
router.post('/', registerTeam);

// POST — register with resume upload → OCR → Groq AI scoring
router.post('/register-with-resume', upload.single('resume'), registerWithResume);

// POST — organizer shortlists a registration
router.post('/shortlist/:id', shortlistRegistration);

// GET — organizer's own registrations only (scoped to their hackathons)
router.get('/my-registrations', protect, getMyRegistrations);

// GET — student's own shortlist + publish status across all hackathons they registered for
router.get('/my-shortlist-status', protect, getMyShortlistStatus);

// GET — all registrations across all hackathons (admin use only)
router.get('/all', getAllRegistrations);

// GET — check if a specific email already registered for a hackathon
router.get('/check/:hackathonId/:email', checkRegistration);

// GET — all registrations for a hackathon, sorted by aiScore
router.get('/:hackathonId', getRegistrations);

// POST — re-run OCR + Groq on an existing registration's resume
router.post('/rescore/:id', rescoreRegistration);

// POST — organizer sends confirmation emails to all shortlisted teams for a hackathon
router.post('/send-emails/:hackathonId', sendShortlistEmails);

// POST — organizer publishes results, unlocking LiveEvent for shortlisted students
router.post('/publish/:hackathonId', publishResults);

// PUT — student submits their GitHub repo link (auth required)
router.put('/github-link', protect, saveGithubLink);

// DELETE a registration by ID
router.delete('/:id', deleteRegistration);

module.exports = router;
