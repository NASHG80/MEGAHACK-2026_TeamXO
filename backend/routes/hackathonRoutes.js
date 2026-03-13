const express = require('express');
const router  = express.Router();
const {
  createHackathon, getAllHackathons, getHackathonBySlug,
  updateHackathon, deleteHackathon, updateHackathonTimeline,
} = require('../controllers/hackathonController');
const { combinedUpload } = require('../middleware/uploadMiddleware');
const { protect }        = require('../middleware/auth');

router.post('/',           protect, combinedUpload, createHackathon);
router.get('/',            getAllHackathons);
router.get('/latest',      async (req, res) => {
  try {
    const Hackathon = require('../models/Hackathon');
    // Include resultsPublished so LiveEvent.jsx can check access gate
    const h = await Hackathon.findOne().sort({ createdAt: -1 })
      .select('_id title organizerName slug resultsPublished');
    if (!h) return res.status(404).json({ message: 'No hackathons found' });
    return res.json(h);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:slug',       getHackathonBySlug);
router.put('/:slug',               combinedUpload, updateHackathon);
router.patch('/:slug/timeline',    updateHackathonTimeline);
router.delete('/:slug',            deleteHackathon);

module.exports = router;

