const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/liveEventController");

// ── Student endpoints ────────────────────────────────────────────
router.get ("/me",                       protect, requireRole("student"), ctrl.getMyLiveEvent);
router.get ("/shortlisted",              protect, requireRole("student"), ctrl.checkShortlisted);
router.post("/help",                     protect, ctrl.submitHelpRequest);
router.get ("/help",                     protect, ctrl.getMyHelpRequests);
router.put ("/help/:id/student-resolve", protect, ctrl.studentResolveHelpRequest);

// ── Student self-scan (participant scans venue QR themselves) ────
router.post("/self-scan", protect, requireRole("student"), ctrl.selfScan);

// ── Organizer endpoints ──────────────────────────────────────────
router.post("/scan", protect, requireRole("organizer"), ctrl.scanQR);

// ── Seed (no auth — for testing only) ────────────────────────────
router.post("/seed", ctrl.seedDemoEvent);

module.exports = router;
