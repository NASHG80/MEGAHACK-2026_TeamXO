const LiveEvent    = require('../models/LiveEvent');
const Hackathon    = require('../models/Hackathon');
const HelpRequest  = require('../models/HelpRequest');
const User         = require('../models/User');
const TreasureHunt = require('../models/TreasureHunt');
const EventTeam    = require('../models/EventTeam');
const Registration = require('../models/Registration');
const crypto       = require('crypto');

/* ───────────────────────────────────────────
   GET /api/live-event/me
   Returns the student's live event data
   ─────────────────────────────────────────── */
exports.getMyLiveEvent = async (req, res) => {
  try {
    const EventWorkspace = require('../models/EventWorkspace');

    const event = await LiveEvent.findOne({ student: req.user.id })
      .populate('hackathon', 'title organizerName venue date time status slug timeline')
      .populate('student', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'No live event found for this student' });
    }

    // ── Look up the organizer-assigned workspace from EventWorkspace ──────
    // EventWorkspace.hackathonId = slug string (not ObjectId), so we skip
    // hackathon filtering and query directly by the globally-unique teamId.
    let workspaceNumber   = event.workspaceNumber;
    let workspaceLocation = event.workspaceLocation;

    try {
      const hackathonId  = event.hackathon._id;
      const studentEmail = event.student.email;

      // 1. Find the student's registration → derive their REG-{id} teamId
      const reg = await Registration.findOne({
        hackathon: hackathonId,
        $or: [
          { leaderEmail:         studentEmail },
          { 'teamMembers.email': studentEmail },
        ],
      }).select('_id').lean();

      if (reg) {
        const teamId = `REG-${reg._id}`;

        // 2. Find the workspace this team is assigned to — query by teamId directly
        //    (EventWorkspace.hackathonId is a slug string; avoid that mismatch entirely)
        const ws = await EventWorkspace.findOne({
          'assignedTeams.teamId': teamId,
        }).lean();

        if (ws) {
          const assignment = ws.assignedTeams.find(t => t.teamId === teamId);
          const slotLabel  = assignment?.slots?.length
            ? assignment.slots.map(s => `WS-${String(s + 1).padStart(2, '0')}`).join(', ')
            : '';
          workspaceNumber   = slotLabel ? `${ws.number} · ${slotLabel}` : ws.number;
          workspaceLocation = ws.floor + (ws.note ? ` · ${ws.note}` : '');

          // 3. Always persist back to LiveEvent so non-API paths (e.g. fallback FALLBACK_EVENT) also update
          await LiveEvent.updateOne(
            { _id: event._id },
            { $set: { workspaceNumber, workspaceLocation } }
          );
        }
      }
    } catch (wsErr) {
      console.warn('[getMyLiveEvent] Could not resolve workspace:', wsErr.message);
      // Non-fatal — student still gets whatever is in LiveEvent
    }

    res.json({
      studentId:         event.student._id,
      studentName:       event.student.name,
      teamName:          event.teamName,
      hackathonId:       event.hackathon._id,
      hackathonName:     event.hackathon.title,
      venue:             event.hackathon.venue,
      date:              event.hackathon.date,
      time:              event.hackathon.time,
      workspaceNumber,
      workspaceLocation,
      entryStatus:       event.entryStatus,
      lunchStatus:       event.lunchStatus,
      dinnerStatus:      event.dinnerStatus,
      entryQR:           event.entryQR,
      mealsQR:           event.mealsQR,
      hackathonStatus:   event.hackathon.status,
      feedbackSubmitted: event.feedbackSubmitted,
      timeline:          event.hackathon.timeline || [],
    });
  } catch (err) {
    console.error('getMyLiveEvent error:', err);
    res.status(500).json({ message: 'Server error' });
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
    console.error('checkShortlisted error:', err);
    res.status(500).json({ message: 'Server error' });
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
      return res.status(400).json({ message: 'qrToken and type are required' });
    }

    let event;
    if (type === 'entry') {
      event = await LiveEvent.findOne({ entryQR: qrToken });
    } else if (type === 'meals') {
      event = await LiveEvent.findOne({ mealsQR: qrToken });
    } else {
      return res.status(400).json({ message: "type must be 'entry' or 'meals'" });
    }

    if (!event) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    if (type === 'entry') {
      event.entryStatus = 'Entered';
    } else {
      event.lunchStatus  = 'Claimed';
      event.dinnerStatus = 'Claimed';
    }

    await event.save();

    const student = await User.findById(event.student).select('name email');

    res.json({
      message:     `${type === 'entry' ? 'Entry' : 'Meal'} scan successful`,
      studentName:  student?.name  || 'Unknown',
      studentEmail: student?.email || '',
      entryStatus:  event.entryStatus,
      lunchStatus:  event.lunchStatus,
      dinnerStatus: event.dinnerStatus,
    });
  } catch (err) {
    console.error('scanQR error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/self-scan
   Student scans a QR code placed at the venue.
   Body: { hackathonId, action: 'entry'|'lunch'|'dinner' }
   ─────────────────────────────────────────── */
exports.selfScan = async (req, res) => {
  try {
    const { hackathonId, action } = req.body;

    const VALID_ACTIONS = ['entry', 'lunch', 'dinner'];
    if (!hackathonId || !action || !VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        success: false,
        code:    'INVALID_QR',
        message: 'This QR code is not valid for this event.',
      });
    }

    // Resolve hackathon by ObjectId OR by slug/string id
    const mongoose = require('mongoose');
    let resolvedHackathonId = hackathonId;
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      const hack = await Hackathon.findOne({ slug: hackathonId }).select('_id').lean();
      if (hack) resolvedHackathonId = hack._id;
    }

    const event = await LiveEvent.findOne({
      student:   req.user.id,
      hackathon: resolvedHackathonId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        code:    'NOT_REGISTERED',
        message: 'You are not registered for this event.',
      });
    }

    // Duplicate scan prevention
    if (action === 'entry' && event.entryStatus === 'Entered') {
      return res.status(409).json({ success: false, code: 'DUPLICATE', action, message: 'Entry has already been recorded for you.', entryStatus: event.entryStatus, lunchStatus: event.lunchStatus, dinnerStatus: event.dinnerStatus, workspaceNumber: event.workspaceNumber, workspaceLocation: event.workspaceLocation });
    }
    if (action === 'lunch' && event.lunchStatus === 'Claimed') {
      return res.status(409).json({ success: false, code: 'DUPLICATE', action, message: 'You have already claimed lunch.', entryStatus: event.entryStatus, lunchStatus: event.lunchStatus, dinnerStatus: event.dinnerStatus });
    }
    if (action === 'dinner' && event.dinnerStatus === 'Claimed') {
      return res.status(409).json({ success: false, code: 'DUPLICATE', action, message: 'You have already claimed dinner.', entryStatus: event.entryStatus, lunchStatus: event.lunchStatus, dinnerStatus: event.dinnerStatus });
    }

    const successMessages = {
      entry:  'Entry successfully recorded! Welcome to the hackathon.',
      lunch:  'Lunch claimed successfully! Enjoy your meal.',
      dinner: 'Dinner claimed successfully! Enjoy your meal.',
    };

    if (action === 'entry')  event.entryStatus  = 'Entered';
    if (action === 'lunch')  event.lunchStatus  = 'Claimed';
    if (action === 'dinner') event.dinnerStatus = 'Claimed';

    await event.save();

    // ── When student scans the ENTRY gate QR, mark the EventTeam as entered
    //    so EventManagement's TeamEntryPanel (polls every 15s) shows them as entered.
    if (action === 'entry') {
      (async () => {
        try {
          const studentUser = await User.findById(req.user.id).select('name email').lean();
          const studentEmail = studentUser?.email || '';
          const studentName  = studentUser?.name  || '';

          // Find registration to get stable team id (REG-{registration._id})
          const reg = await Registration.findOne({
            hackathon: resolvedHackathonId,
            $or: [
              { leaderEmail: studentEmail },
              { 'teamMembers.email': studentEmail },
            ],
          }).select('_id teamName leaderName teamMembers college').lean();

          if (reg) {
            const teamId = `REG-${reg._id}`;
            const now    = new Date();
            const h      = now.getHours();
            const m      = String(now.getMinutes()).padStart(2, '0');
            const entryTime = `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
            const memberNames = [reg.leaderName, ...(reg.teamMembers || []).map(mb => mb.name || mb.email || '')].filter(Boolean);

            const existingTeam = await EventTeam.findOne({
              hackathonId: resolvedHackathonId.toString(),
              teamId,
            });

            if (existingTeam) {
              if (!existingTeam.entered) {
                existingTeam.entered   = true;
                existingTeam.entryTime = entryTime;
              }
              // Mark scanning student present
              if (studentName) {
                if (!(existingTeam.memberStatus instanceof Map)) {
                  existingTeam.memberStatus = new Map(Object.entries(existingTeam.memberStatus || {}));
                }
                existingTeam.memberStatus.set(studentName, 'present');
              }
              await existingTeam.save();
            } else {
              // Lazily create the EventTeam record (real registrations may not have been seeded)
              const memberStatus = {};
              if (studentName) memberStatus[studentName] = 'present';
              await EventTeam.create({
                hackathonId: resolvedHackathonId.toString(),
                teamId,
                name:         reg.teamName || 'Unknown Team',
                college:      reg.college  || '',
                members:      memberNames.length,
                entered:      true,
                entryTime,
                memberNames,
                memberStatus,
              }).catch(() => {}); // ignore duplicate-key races
            }
          }
        } catch (teamErr) {
          console.warn('[selfScan] Could not update EventTeam:', teamErr.message);
        }
      })(); // fire-and-forget — don't block the student's response
    }

    res.json({
      success:           true,
      action,
      message:           successMessages[action],
      entryStatus:       event.entryStatus,
      lunchStatus:       event.lunchStatus,
      dinnerStatus:      event.dinnerStatus,
      workspaceNumber:   event.workspaceNumber   || null,
      workspaceLocation: event.workspaceLocation || null,
    });
  } catch (err) {
    console.error('selfScan error:', err);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Server error. Please try again.' });
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

    // Determine hackathon
    let hackathonId = null;
    const liveEvent = await LiveEvent.findOne({ student: req.user.id });
    if (liveEvent) {
      hackathonId = liveEvent.hackathon;
    } else {
      const latestHackathon = await Hackathon.findOne().sort({ createdAt: -1 }).select('_id');
      hackathonId = latestHackathon?._id || null;
    }

    if (!hackathonId) {
      return res.status(400).json({ message: 'No hackathon found to attach this request to.' });
    }

    const request = await HelpRequest.create({
      student:   req.user.id,
      hackathon: hackathonId,
      issueType,
      message:   message || '',
      status:    'Pending',
    });

    return res.status(201).json({
      id:              request._id,
      issue:           request.issueType,
      message:         request.message,
      cocomResolved:   false,
      studentResolved: false,
      time:            request.createdAt,
    });
  } catch (err) {
    console.error('submitHelpRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   GET /api/live-event/help
   Student gets their own help requests
   ─────────────────────────────────────────── */
exports.getMyHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(requests.map(r => ({
      id:              r._id,
      issue:           r.issueType,
      message:         r.message,
      cocomResolved:   r.status === 'Resolved',
      studentResolved: r.status === 'Resolved',
      time:            r.createdAt,
    })));
  } catch (err) {
    console.error('getMyHelpRequests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   PUT /api/live-event/help/:id/student-resolve
   Student confirms resolution → mark Resolved
   ─────────────────────────────────────────── */
exports.studentResolveHelpRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findOne({ _id: req.params.id, student: req.user.id });
    if (!request) return res.status(404).json({ message: 'Help request not found' });

    request.status = 'Resolved';
    await request.save();

    return res.json({ success: true, deleted: false, cocomResolved: true, studentResolved: true });
  } catch (err) {
    console.error('studentResolveHelpRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   POST /api/event/assign-workspace
   Auto-assign a workspace number to a student.

   Algorithm:
     Rows A–Z, each row holds SEATS_PER_ROW seats.
     Find the count of already-assigned workspaces for this hackathon,
     derive the next seat, form "A-01" style label.
   Body:   { studentId, hackathonId }
   Returns { workspaceNumber, workspaceLocation }
   ─────────────────────────────────────────── */
const SEATS_PER_ROW = 50;

exports.assignWorkspace = async (req, res) => {
  try {
    const { studentId, hackathonId } = req.body;

    if (!studentId || !hackathonId) {
      return res.status(400).json({ message: 'studentId and hackathonId are required' });
    }

    // 1. Check if already assigned
    let event = await LiveEvent.findOne({ student: studentId, hackathon: hackathonId });
    if (event && event.workspaceNumber) {
      return res.json({
        workspaceNumber:   event.workspaceNumber,
        workspaceLocation: event.workspaceLocation,
      });
    }

    // 2. Count total already-assigned participants for this hackathon
    const assignedCount = await LiveEvent.countDocuments({
      hackathon:       hackathonId,
      workspaceNumber: { $exists: true, $ne: null, $ne: '' },
    });

    // 3. Compute next workspace label
    const rowIndex  = Math.floor(assignedCount / SEATS_PER_ROW);       // 0 = A, 1 = B, …
    const seatIndex = (assignedCount % SEATS_PER_ROW) + 1;             // 1-based seat
    const rowLetter = String.fromCharCode(65 + rowIndex);               // 'A', 'B', …
    const workspaceNumber   = `${rowLetter}-${String(seatIndex).padStart(2, '0')}`;
    const workspaceLocation = `Main Hall – Row ${rowLetter}, Seat ${seatIndex}`;

    // 4. Persist — upsert so a record is created if it doesn't exist yet
    event = await LiveEvent.findOneAndUpdate(
      { student: studentId, hackathon: hackathonId },
      { $set: { workspaceNumber, workspaceLocation } },
      { new: true, upsert: false }   // only update existing records (shortlisted participants)
    );

    if (!event) {
      // Student not yet shortlisted — still return the computed number (frontend can display it)
      return res.json({ workspaceNumber, workspaceLocation });
    }

    return res.json({ workspaceNumber, workspaceLocation });
  } catch (err) {
    console.error('assignWorkspace error:', err);
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
    let hackathon = await Hackathon.findOne({ title: 'AI Innovation Hackathon 2026' });
    if (!hackathon) {
      hackathon = await Hackathon.create({
        title:         'AI Innovation Hackathon 2026',
        organizerName: 'IIT Bombay',
        venue:         'Innovation Hall, IIT Bombay',
        date:          'March 15, 2026',
        time:          '9:00 AM – 9:00 PM',
      });
    }

    const student = await User.findOne({ role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'No student user found. Register a student first.' });
    }

    let event = await LiveEvent.findOne({ student: student._id, hackathon: hackathon._id });
    if (!event) {
      event = await LiveEvent.create({
        student:           student._id,
        hackathon:         hackathon._id,
        isShortlisted:     true,
        workspaceNumber:   'A-01',
        workspaceLocation: 'Innovation Hall – Row A, Seat 1',
        teamName:          'Code Crusaders',
        entryQR:           crypto.randomUUID(),
        mealsQR:           crypto.randomUUID(),
      });
    }

    res.status(201).json({
      message:      'Demo data seeded successfully',
      hackathonId:  hackathon._id,
      studentId:    student._id,
      studentEmail: student.email,
      entryQR:      event.entryQR,
      mealsQR:      event.mealsQR,
      liveEventId:  event._id,
    });
  } catch (err) {
    console.error('seedDemoEvent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/gamification/start
   Student starts a Chill Out Zone treasure hunt task.
   Body: { questionText, questionIndex, timeLimitMinutes }
   ─────────────────────────────────────────── */
exports.startTreasureHunt = async (req, res) => {
  try {
    const { questionText, questionIndex, timeLimitMinutes = 10 } = req.body;

    if (!questionText || questionIndex === undefined) {
      return res.status(400).json({ message: 'questionText and questionIndex are required' });
    }

    // Determine hackathon
    let hackathonId = null;
    const liveEvent = await LiveEvent.findOne({ student: req.user.id });
    if (liveEvent) {
      hackathonId = liveEvent.hackathon;
    } else {
      const latest = await Hackathon.findOne().sort({ createdAt: -1 }).select('_id');
      hackathonId = latest?._id || null;
    }

    if (!hackathonId) {
      return res.status(400).json({ message: 'No hackathon found.' });
    }

    // Cancel any existing in_progress task for this student
    await TreasureHunt.updateMany(
      { student: req.user.id, hackathon: hackathonId, status: 'in_progress' },
      { $set: { status: 'expired' } }
    );

    const task = await TreasureHunt.create({
      student:          req.user.id,
      hackathon:        hackathonId,
      questionText,
      questionIndex,
      timeLimitMinutes,
      startTime:        new Date(),
      status:           'in_progress',
    });

    // Populate student name for CoComm view
    const populatedTask = await TreasureHunt.findById(task._id).populate('student', 'name email');

    return res.status(201).json({
      success:  true,
      task: {
        _id:              populatedTask._id,
        questionText:     populatedTask.questionText,
        questionIndex:    populatedTask.questionIndex,
        timeLimitMinutes: populatedTask.timeLimitMinutes,
        startTime:        populatedTask.startTime,
        status:           populatedTask.status,
        goodiesReward:    populatedTask.goodiesReward,
        studentName:      populatedTask.student?.name || 'Student',
        studentEmail:     populatedTask.student?.email || '',
      },
    });
  } catch (err) {
    console.error('startTreasureHunt error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   GET /api/live-event/gamification/status
   Returns the student's current or latest treasure hunt task
   ─────────────────────────────────────────── */
exports.getMyTreasureHunt = async (req, res) => {
  try {
    // Fetch most recent task (in_progress or completed)
    const task = await TreasureHunt.findOne({ student: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    if (!task) {
      return res.json({ success: true, task: null });
    }

    // Auto-expire if time has run out and still in_progress
    if (task.status === 'in_progress') {
      const elapsedMs  = Date.now() - new Date(task.startTime).getTime();
      const limitMs    = task.timeLimitMinutes * 60 * 1000;
      if (elapsedMs > limitMs) {
        task.status = 'expired';
        await task.save();
      }
    }

    return res.json({
      success: true,
      task: {
        _id:              task._id,
        questionText:     task.questionText,
        questionIndex:    task.questionIndex,
        timeLimitMinutes: task.timeLimitMinutes,
        startTime:        task.startTime,
        status:           task.status,
        goodiesReward:    task.goodiesReward,
      },
    });
  } catch (err) {
    console.error('getMyTreasureHunt error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────────────────────────────────
   POST /api/live-event/feedback
   Student submits post-hackathon feedback
   ─────────────────────────────────────────── */
exports.submitFeedback = async (req, res) => {
  try {
    const { hackathonId, rating } = req.body;
    if (!hackathonId || !rating) return res.status(400).json({ message: 'Missing fields' });
    
    const points = parseInt(rating, 10);
    if (isNaN(points) || points < 1 || points > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const event = await LiveEvent.findOne({ student: req.user.id, hackathon: hackathonId });
    if (!event) return res.status(404).json({ message: 'Live event record not found' });
    
    // Prevent duplicate feedback points
    if (event.feedbackSubmitted) {
       return res.status(400).json({ message: 'Feedback already submitted' });
    }

    event.feedbackSubmitted = true;
    event.feedbackRating = points;
    await event.save();

    const hackathon = await Hackathon.findById(hackathonId).select('createdBy');
    if (hackathon && hackathon.createdBy) {
      const { addLoyaltyPoints } = require('../utils/loyaltyProcessor');
      await addLoyaltyPoints(hackathon.createdBy, points, `Student Feedback Rating (${points} Stars)`);
    }

    return res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('submitFeedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
