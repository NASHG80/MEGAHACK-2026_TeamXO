const LiveEvent  = require('../models/LiveEvent');
const Hackathon  = require('../models/Hackathon');
const EventSOS   = require('../models/EventSOS');
const User       = require('../models/User');
const crypto     = require('crypto');

/* ───────────────────────────────────────────
   GET /api/live-event/me
   Returns the student's live event data
   ─────────────────────────────────────────── */
exports.getMyLiveEvent = async (req, res) => {
  try {
    const event = await LiveEvent.findOne({ student: req.user.id })
      .populate("hackathon", "title organizerName venue date time")
      .populate("student", "name email");

    if (!event) {
      return res.status(404).json({ message: "No live event found for this student" });
    }

    res.json({
      studentId: event.student._id,
      studentName: event.student.name,
      teamName: event.teamName,
      hackathonId: event.hackathon._id,
      hackathonName: event.hackathon.title,
      venue: event.hackathon.venue,
      date: event.hackathon.date,
      time: event.hackathon.time,
      workspaceNumber: event.workspaceNumber,
      workspaceLocation: event.workspaceLocation,
      entryStatus: event.entryStatus,
      lunchStatus: event.lunchStatus,
      dinnerStatus: event.dinnerStatus,
      entryQR: event.entryQR,
      mealsQR: event.mealsQR,
    });
  } catch (err) {
    console.error("getMyLiveEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────────────────────────────────
   GET /api/live-event/shortlisted
   Returns { isShortlisted } for navbar logic
   ─────────────────────────────────────────── */
exports.checkShortlisted = async (req, res) => {
  try {
    const event = await LiveEvent.findOne({
      student: req.user.id,
      isShortlisted: true,
    });
    res.json({ isShortlisted: !!event });
  } catch (err) {
    console.error("checkShortlisted error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/scan
   Organizer scans a QR token to update status
   Body: { qrToken, type: 'entry' | 'meals' }
   ─────────────────────────────────────────── */
exports.scanQR = async (req, res) => {
  try {
    const { qrToken, type } = req.body;

    if (!qrToken || !type) {
      return res.status(400).json({ message: "qrToken and type are required" });
    }

    // Find event by QR token
    let event;
    if (type === "entry") {
      event = await LiveEvent.findOne({ entryQR: qrToken });
    } else if (type === "meals") {
      event = await LiveEvent.findOne({ mealsQR: qrToken });
    } else {
      return res.status(400).json({ message: "type must be 'entry' or 'meals'" });
    }

    if (!event) {
      return res.status(404).json({ message: "Invalid QR code" });
    }

    // Update status
    if (type === "entry") {
      event.entryStatus = "Entered";
    } else {
      event.lunchStatus = "Claimed";
      event.dinnerStatus = "Claimed";
    }

    await event.save();

    // Return the student info for organizer feedback
    const student = await User.findById(event.student).select("name email");

    res.json({
      message: `${type === "entry" ? "Entry" : "Meal"} scan successful`,
      studentName: student?.name || "Unknown",
      studentEmail: student?.email || "",
      entryStatus: event.entryStatus,
      lunchStatus: event.lunchStatus,
      dinnerStatus: event.dinnerStatus,
    });
  } catch (err) {
    console.error("scanQR error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/self-scan
   Student scans a QR code placed at the venue.
   The participant is identified via session.
   Body: { hackathonId, action: 'entry'|'lunch'|'dinner' }

   Responses:
     200 — success  { success, action, message, entryStatus, lunchStatus, dinnerStatus }
     409 — duplicate { success:false, code:'DUPLICATE', message }
     400 — bad QR    { success:false, code:'INVALID_QR', message }
     404 — no record { success:false, code:'NOT_REGISTERED', message }
   ─────────────────────────────────────────── */
exports.selfScan = async (req, res) => {
  try {
    const { hackathonId, action } = req.body;

    // Validate action
    const VALID_ACTIONS = ["entry", "lunch", "dinner"];
    if (!hackathonId || !action || !VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_QR",
        message: "This QR code is not valid for this event.",
      });
    }

    // Find this student's participation record for that hackathon
    const event = await LiveEvent.findOne({
      student: req.user.id,
      hackathon: hackathonId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        code: "NOT_REGISTERED",
        message: "You are not registered for this event.",
      });
    }

    // ── Duplicate scan prevention ──────────────────────────────────
    if (action === "entry" && event.entryStatus === "Entered") {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE",
        action,
        message: "Entry has already been recorded for you.",
        entryStatus: event.entryStatus,
        lunchStatus: event.lunchStatus,
        dinnerStatus: event.dinnerStatus,
      });
    }
    if (action === "lunch" && event.lunchStatus === "Claimed") {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE",
        action,
        message: "You have already claimed lunch.",
        entryStatus: event.entryStatus,
        lunchStatus: event.lunchStatus,
        dinnerStatus: event.dinnerStatus,
      });
    }
    if (action === "dinner" && event.dinnerStatus === "Claimed") {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE",
        action,
        message: "You have already claimed dinner.",
        entryStatus: event.entryStatus,
        lunchStatus: event.lunchStatus,
        dinnerStatus: event.dinnerStatus,
      });
    }

    // ── Apply update ───────────────────────────────────────────────
    const successMessages = {
      entry:  "Entry successfully recorded! Welcome to the hackathon.",
      lunch:  "Lunch claimed successfully! Enjoy your meal.",
      dinner: "Dinner claimed successfully! Enjoy your meal.",
    };

    if (action === "entry")  event.entryStatus  = "Entered";
    if (action === "lunch")  event.lunchStatus  = "Claimed";
    if (action === "dinner") event.dinnerStatus = "Claimed";

    await event.save();

    res.json({
      success: true,
      action,
      message: successMessages[action],
      entryStatus:  event.entryStatus,
      lunchStatus:  event.lunchStatus,
      dinnerStatus: event.dinnerStatus,
    });
  } catch (err) {
    console.error("selfScan error:", err);
    res.status(500).json({ success: false, code: "SERVER_ERROR", message: "Server error. Please try again." });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/help
   Student submits a help request
   Body: { issueType, message }
   ─────────────────────────────────────────── */
exports.submitHelpRequest = async (req, res) => {
  try {
    const { issueType, message } = req.body;
    if (!issueType) return res.status(400).json({ message: 'issueType is required' });

    // Get student name
    const user = await User.findById(req.user.id).select('name');

    // Try to get hackathon from live event, fall back to latest hackathon
    let hackathonId = null;
    let workspace   = '';
    const event = await LiveEvent.findOne({ student: req.user.id });
    if (event) {
      hackathonId = event.hackathon;
      workspace   = event.workspaceLocation || event.workspaceNumber || '';
    } else {
      // Fallback: use the most recent hackathon in the DB
      const latestHackathon = await Hackathon.findOne().sort({ createdAt: -1 }).select('_id');
      hackathonId = latestHackathon?._id || null;
    }

    if (!hackathonId) {
      return res.status(400).json({ message: 'No hackathon found to attach this request to.' });
    }

    const sos = await EventSOS.create({
      studentId:   req.user.id,
      hackathonId,
      studentName: user?.name || 'Student',
      workspace,
      issueType,
      message: message || '',
    });

    return res.status(201).json({
      id:              sos._id,
      issue:           sos.issueType,
      message:         sos.message,
      cocomResolved:   sos.cocomResolved,
      studentResolved: sos.studentResolved,
      time:            sos.createdAt,
    });
  } catch (err) {
    console.error('submitHelpRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   GET /api/live-event/help
   Student gets their own SOS requests
   ─────────────────────────────────────────── */
exports.getMyHelpRequests = async (req, res) => {
  try {
    const requests = await EventSOS.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(requests.map(r => ({
      id:              r._id,
      issue:           r.issueType,
      message:         r.message,
      cocomResolved:   r.cocomResolved,
      studentResolved: r.studentResolved,
      time:            r.createdAt,
    })));
  } catch (err) {
    console.error('getMyHelpRequests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   PUT /api/live-event/help/:id/student-resolve
   Student confirms resolution → if CoCom also resolved, delete doc
   ─────────────────────────────────────────── */
exports.studentResolveHelpRequest = async (req, res) => {
  try {
    const sos = await EventSOS.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!sos) return res.status(404).json({ message: 'SOS request not found' });

    sos.studentResolved = true;

    if (sos.cocomResolved) {
      // Both sides confirmed — delete
      await EventSOS.findByIdAndDelete(sos._id);
      return res.json({ success: true, deleted: true, message: 'Issue fully resolved and removed.' });
    }

    await sos.save();
    return res.json({ success: true, deleted: false, cocomResolved: sos.cocomResolved, studentResolved: true });
  } catch (err) {
    console.error('studentResolveHelpRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/seed
   Creates demo hackathon + live event for the
   first student user (for testing)
   ─────────────────────────────────────────── */
exports.seedDemoEvent = async (req, res) => {
  try {
    // Find or create demo hackathon
    let hackathon = await Hackathon.findOne({ title: "AI Innovation Hackathon 2026" });
    if (!hackathon) {
      hackathon = await Hackathon.create({
        title: "AI Innovation Hackathon 2026",
        organizerName: "IIT Bombay",
        venue: "Innovation Hall, IIT Bombay",
        date: "March 15, 2026",
        time: "9:00 AM – 9:00 PM",
      });
    }

    // Find the first student user
    const student = await User.findOne({ role: "student" });
    if (!student) {
      return res.status(404).json({ message: "No student user found. Register a student first." });
    }

    // Create or update live event
    let event = await LiveEvent.findOne({ student: student._id, hackathon: hackathon._id });
    if (!event) {
      event = await LiveEvent.create({
        student: student._id,
        hackathon: hackathon._id,
        isShortlisted: true,
        workspaceNumber: "A-12",
        workspaceLocation: "Innovation Hall – Row 3, Seat 7",
        teamName: "Code Crusaders",
        entryQR: crypto.randomUUID(),
        mealsQR: crypto.randomUUID(),
      });
    }

    res.status(201).json({
      message: "Demo data seeded successfully",
      hackathonId: hackathon._id,
      studentId: student._id,
      studentEmail: student.email,
      entryQR: event.entryQR,
      mealsQR: event.mealsQR,
      liveEventId: event._id,
    });
  } catch (err) {
    console.error("seedDemoEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
