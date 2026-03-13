const express = require('express');
const router  = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getMyHackathons,
  getHackathonManageData,
  updateHackathonSettings,
  getShortlistedRecipients,
} = require('../controllers/organizerHackathonController');

// GET all hackathons for this organizer
router.get('/', protect, requireRole('organizer', 'admin'), getMyHackathons);

// GET shortlisted recipients (leader + all members) for certificate generation
router.get('/:slug/shortlisted-recipients', protect, requireRole('organizer', 'admin'), getShortlistedRecipients);

// GET single hackathon with participants + teams (for Manage Hackathon page)
router.get('/:slug', protect, requireRole('organizer', 'admin'), getHackathonManageData);

// PUT update hackathon settings
router.put('/:slug/settings', protect, requireRole('organizer', 'admin'), updateHackathonSettings);

module.exports = router;
