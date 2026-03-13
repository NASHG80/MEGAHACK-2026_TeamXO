const express = require('express');
const router = express.Router();
const {
  registerTeam,
  registerWithResume,
  getRegistrations,
  getAllRegistrations,
  checkRegistration,
  shortlistRegistration,
} = require('../controllers/registrationController');
const upload = require('../config/multer');

// POST — simple team registration (no file)
router.post('/', registerTeam);

// POST — register with resume upload → OCR → Groq AI scoring
router.post('/register-with-resume', upload.single('resume'), registerWithResume);

// POST — organizer shortlists a registration
router.post('/shortlist/:id', shortlistRegistration);

// GET — all registrations across all hackathons (for organizer PPT review)
router.get('/all', getAllRegistrations);

// GET — check if a specific email already registered for a hackathon
router.get('/check/:hackathonId/:email', checkRegistration);

// GET — all registrations for a hackathon, sorted by aiScore
router.get('/:hackathonId', getRegistrations);

module.exports = router;
