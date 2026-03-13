const CocomJoinCode = require('../models/CocomJoinCode');
const CocomMember   = require('../models/CocomMember');
const CocomTask     = require('../models/CocomTask');

/* ── Generate Join Code ─────────────────────────────────── */
exports.generateJoinCode = async (req, res) => {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { hackathon_id = 'global' } = req.body;
    const doc = await CocomJoinCode.create({ join_code: code, hackathon_id, created_by: 'organizer' });
    res.json({ success: true, join_code: doc.join_code, created_at: doc.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate join code' });
  }
};

/* ── Get Latest Join Code ───────────────────────────────── */
exports.getLatestJoinCode = async (req, res) => {
  try {
    const doc = await CocomJoinCode.findOne().sort({ createdAt: -1 });
    res.json({ success: true, join_code: doc?.join_code || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch join code' });
  }
};

/* ── Get CoCom Members ──────────────────────────────────── */
exports.getMembers = async (req, res) => {
  try {
    const members = await CocomMember.find().sort({ createdAt: -1 });
    res.json({ success: true, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

/* ── Update Member ──────────────────────────────────────── */
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CocomMember.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, member: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update member' });
  }
};

/* ── Remove Member ──────────────────────────────────────── */
exports.removeMember = async (req, res) => {
  try {
    await CocomMember.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

/* ── Assign Task ────────────────────────────────────────── */
exports.assignTask = async (req, res) => {
  try {
    const { title, description, assigned_to, location, priority, deadline } = req.body;
    const task = await CocomTask.create({
      title, description,
      assigned_to: assigned_to || null,
      location, priority,
      deadline: deadline || null,
      created_by: 'organizer',
    });
    const populated = await CocomTask.findById(task._id).populate('assigned_to');
    res.json({ success: true, task: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign task' });
  }
};

/* ── Get Tasks ──────────────────────────────────────────── */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await CocomTask.find().populate('assigned_to').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

/* ── Update Task Status ─────────────────────────────────── */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await CocomTask.findByIdAndUpdate(id, { status }, { new: true }).populate('assigned_to');
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

/* ── Get My Tasks (CoCom member view) ────────────────────── */
exports.getMyTasks = async (req, res) => {
  try {
    const { memberId } = req.params;
    const tasks = await CocomTask.find({ assigned_to: memberId })
      .populate('assigned_to')
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch your tasks' });
  }
};

/* ── Complete Task (CoCom member action) ─────────────────── */
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await CocomTask.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true }
    ).populate('assigned_to');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete task' });
  }
};


/* -- Join Hackathon (CoCom member action) ------------------ */
exports.joinHackathon = async (req, res) => {
  try {
    const { join_code } = req.body;
    if (!join_code) {
      return res.status(400).json({ success: false, message: 'Join code is required.' });
    }

    // Validate the code exists
    const codeDoc = await CocomJoinCode.findOne({ join_code: join_code.trim().toUpperCase() });
    if (!codeDoc) {
      return res.status(400).json({ success: false, message: 'Invalid join code. Please check and try again.' });
    }

    // Get logged-in user details from DB
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent double-joining the same hackathon
    const existing = await CocomMember.findOne({ email: user.email, hackathon_id: codeDoc.hackathon_id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already joined this hackathon committee.',
        hackathon_id: existing.hackathon_id,
        member_id:    existing._id,
      });
    }

    // Create CocomMember record
    const member = await CocomMember.create({
      name:         user.name || user.email,
      email:        user.email,
      hackathon_id: codeDoc.hackathon_id,
      join_code:    join_code.trim().toUpperCase(),
      status:       'active',
    });

    return res.status(201).json({
      success:      true,
      message:      'Successfully joined the hackathon committee!',
      hackathon_id: member.hackathon_id,
      member_id:    member._id,
    });
  } catch (err) {
    console.error('joinHackathon error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

/* -- Get current CoCom member profile (join check) ---------- */
exports.getMe = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(404).json({ success: false, joined: false });

    const member = await CocomMember.findOne({ email: user.email });
    if (!member) return res.json({ success: true, joined: false });

    return res.json({
      success:      true,
      joined:       true,
      member_id:    member._id,
      hackathon_id: member.hackathon_id,
      name:         member.name,
      email:        member.email,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* -- CoCom Dashboard: tasks + help requests + hackathon info -- */
exports.getDashboard = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Fetch member + their tasks
    const member = await CocomMember.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const tasks = await CocomTask.find({ assigned_to: memberId }).sort({ createdAt: -1 });

    // Fetch hackathon info: try by stored hackathon_id first, fallback to latest hackathon
    const Hackathon = require('../models/Hackathon');
    const mongoose  = require('mongoose');
    let hackathonInfo = { name: 'Your Hackathon', organizer: 'Organizer Core' };
    let h = null;

    if (member.hackathon_id && mongoose.Types.ObjectId.isValid(member.hackathon_id)) {
      h = await Hackathon.findById(member.hackathon_id).select('title organizerName');
    }
    // Fallback: fetch the latest hackathon (handles 'global' or missing id)
    if (!h) {
      h = await Hackathon.findOne().sort({ createdAt: -1 }).select('title organizerName');
    }
    if (h) hackathonInfo = { name: h.title, organizer: h.organizerName || 'Organizer Core' };

    // Fetch all unresolved SOS requests (not yet deleted = at least one side hasn't resolved)
    const EventSOS = require('../models/EventSOS');
    const helpRequests = await EventSOS.find({
      $or: [{ cocomResolved: false }, { studentResolved: false }],
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      hackathon: hackathonInfo,
      tasks,
      helpRequests,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
};

/* -- CoCom resolves Help Request (cocomResolved = true, auto-delete if both sides done) -- */
exports.resolveHelpRequest = async (req, res) => {
  try {
    const EventSOS = require('../models/EventSOS');
    const sos = await EventSOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ success: false, message: 'SOS request not found' });

    sos.cocomResolved = true;

    if (sos.studentResolved) {
      // Both sides confirmed — delete
      await EventSOS.findByIdAndDelete(sos._id);
      return res.json({ success: true, deleted: true, message: 'Issue fully resolved and removed.' });
    }

    await sos.save();
    return res.json({
      success: true,
      deleted: false,
      cocomResolved: true,
      studentResolved: sos.studentResolved,
      message: 'Marked resolved. Awaiting student confirmation.',
    });
  } catch (err) {
    console.error('resolveHelpRequest error:', err);
    res.status(500).json({ success: false, message: 'Failed to resolve request' });
  }
};

/* -- Delete Task (confirmed by CoCom member) -------------- */
exports.deleteTask = async (req, res) => {
  try {
    const task = await CocomTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    return res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};