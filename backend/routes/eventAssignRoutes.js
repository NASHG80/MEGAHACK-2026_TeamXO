const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/liveEventController');
const { protect } = require('../middleware/auth');

// POST /api/event/assign-workspace
// Auto-assigns a workspace number to the student for a given hackathon.
router.post('/assign-workspace', protect, ctrl.assignWorkspace);

module.exports = router;
