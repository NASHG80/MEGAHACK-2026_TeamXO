const express = require('express');
const router  = express.Router();
const {
  createHackathon, getAllHackathons, getHackathonBySlug, updateHackathon, deleteHackathon,
} = require('../controllers/hackathonController');
const { combinedUpload } = require('../middleware/uploadMiddleware');

router.post('/',           combinedUpload, createHackathon);
router.get('/',            getAllHackathons);
router.get('/:slug',       getHackathonBySlug);
router.put('/:slug',       combinedUpload, updateHackathon);
router.delete('/:slug',    deleteHackathon);

module.exports = router;
