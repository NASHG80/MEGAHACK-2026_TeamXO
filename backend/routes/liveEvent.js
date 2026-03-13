const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/liveEventController");

// ── Student endpoints ────────────────────────────────────────────
router.get("/me",          protect, requireRole("student"), ctrl.getMyLiveEvent);
router.get("/shortlisted", protect, requireRole("student"), ctrl.checkShortlisted);
router.post("/help",       protect, requireRole("student"), ctrl.submitHelpRequest);
router.get("/help",        protect, requireRole("student"), ctrl.getMyHelpRequests);

// ── Organizer endpoints ──────────────────────────────────────────
router.post("/scan",                protect, requireRole("organizer"), ctrl.scanQR);
router.patch("/help/:id/resolve",   protect, requireRole("organizer"), ctrl.resolveHelpRequest);

// ── Seed (no auth — for testing only) ────────────────────────────
router.post("/seed", ctrl.seedDemoEvent);

module.exports = router;
