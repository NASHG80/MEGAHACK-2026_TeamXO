const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { createTeam, joinTeam, getTeam, getMyTeam } = require('../controllers/teamController');

router.post('/create',                    protect, createTeam);
router.post('/join',                      protect, joinTeam);
router.get('/by-hackathon/:hackathonId',  protect, getMyTeam);
router.get('/:teamId',                    protect, getTeam);

module.exports = router;
