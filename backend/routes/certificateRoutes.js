const express = require('express');
const router  = express.Router();

const { protect, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware'); // memoryStorage — no disk writes
const ctrl = require('../controllers/certificateController');

/* ── Student: my certificates ────────────────────────────────────── */
router.get('/my', protect, requireRole('student'), ctrl.getMyCertificates);

/* ── Template Routes ─────────────────────────────────────────────── */

// Create a new template (preset or uploaded background)
router.post(
  '/templates',
  protect, requireRole('organizer', 'admin'),
  upload.single('backgroundImage'),
  ctrl.createTemplate
);

// List all templates for a hackathon
router.get('/templates/:hackathonId', protect, ctrl.getTemplates);

// Get one template
router.get('/template/:templateId', protect, ctrl.getTemplate);

// Save element layout to a template
router.put(
  '/template/:templateId',
  protect, requireRole('organizer', 'admin'),
  ctrl.saveTemplate
);

// Delete a template
router.delete(
  '/template/:templateId',
  protect, requireRole('organizer', 'admin'),
  ctrl.deleteTemplate
);

/* ── Recipient Routes ─────────────────────────────────────────────── */
router.get('/recipients/:hackathonId', protect, requireRole('organizer', 'admin'), ctrl.getRecipients);

/* ── Generation Routes ───────────────────────────────────────────── */
router.post(
  '/generate/:hackathonId',
  protect, requireRole('organizer', 'admin'),
  ctrl.generateCertificates
);

router.get('/status/:hackathonId', ctrl.getGenerationStatus);

/* ── Public verification ──────────────────────────────────────────── */
router.get('/verify/:certificateNumber', ctrl.verifyCertificate);

/* ── Save name placement position ────────────────────────────────── */
router.put(
  '/template/:templateId/name-position',
  protect, requireRole('organizer', 'admin'),
  ctrl.saveNamePosition
);

router.post(
  '/generate-personalized/:hackathonId',
  protect,
  ctrl.generatePersonalized
);

module.exports = router;
