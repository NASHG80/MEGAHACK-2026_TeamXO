const { Team, generateTeamCode } = require('../models/Team');
const User         = require('../models/User');
const Registration = require('../models/Registration');

/* ── Helper: sync all Team.members → Registration.teamMembers ────
   collegeMap: { [userId]: college } for members whose college is known
──────────────────────────────────────────────────────────────── */
async function syncMembersToRegistration(team, collegeMap = {}) {
  try {
    const reg = await Registration.findOne({
      hackathon:   team.hackathonId,
      leaderEmail: team.leaderEmail,
    });
    if (!reg) return;

    const populated = await Team.findById(team._id).populate('members', 'name email');
    if (!populated) return;

    const leaderEmail = (team.leaderEmail || '').toLowerCase();
    const newMembers = (populated.members || [])
      .filter(m => (m.email || '').toLowerCase() !== leaderEmail)
      .map(m => ({
        name:    m.name  || '',
        email:   m.email || '',
        college: collegeMap[m._id.toString()] || '',
      }));

    reg.teamMembers = newMembers;
    await reg.save();
  } catch (err) {
    console.error('[syncMembersToRegistration]', err.message);
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/teams/create
   Creates a new team; the logged-in user becomes the leader.
───────────────────────────────────────────────────────────── */
const createTeam = async (req, res) => {
  try {
    const { teamName, hackathonId } = req.body;
    const userId = req.user.id;

    if (!teamName || !hackathonId) {
      return res.status(400).json({ success: false, message: 'teamName and hackathonId are required.' });
    }

    // Prevent a user from creating/joining two teams in the same hackathon
    const alreadyInTeam = await Team.findOne({ hackathonId, members: userId });
    if (alreadyInTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of a team for this hackathon.',
        teamCode: alreadyInTeam.teamCode,
      });
    }

    const teamCode = await generateTeamCode();

    // Fetch leader's email to store directly on the team
    const leaderUser = await User.findById(userId).select('name email');

    const team = await Team.create({
      teamName,
      teamCode,
      leader:      userId,
      leaderEmail: leaderUser?.email || '',
      members:     [userId],
      hackathonId,
    });

    const populated = await Team.findById(team._id).populate('members', 'name email');

    res.status(201).json({
      success:  true,
      _id:      team._id,
      teamName: team.teamName,
      teamCode: team.teamCode,
      members:  populated.members,
    });

    // Sync members in background (registration may not exist yet — that's OK)
    syncMembersToRegistration(team).catch(() => {});
  } catch (error) {
    console.error('[createTeam]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/teams/join
   Lets a user join an existing team using its teamCode.
   Also syncs the new member into the Registration document.
───────────────────────────────────────────────────────────── */
const joinTeam = async (req, res) => {
  try {
    const { teamCode, college } = req.body;  // college optional — member's institution
    const userId = req.user.id;

    if (!teamCode) {
      return res.status(400).json({ success: false, message: 'teamCode is required.' });
    }

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found. Check the code and try again.' });
    }

    // Already a member?
    if (team.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'You are already a member of this team.' });
    }

    // Already in another team for same hackathon?
    const alreadyInAnother = await Team.findOne({
      hackathonId: team.hackathonId,
      members: userId,
      _id: { $ne: team._id },
    });
    if (alreadyInAnother) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of another team for this hackathon.',
      });
    }

    team.members.push(userId);
    await team.save();

    const populated = await Team.findById(team._id).populate('members', 'name email');

    res.status(200).json({
      success:  true,
      teamName: team.teamName,
      teamCode: team.teamCode,
      members:  populated.members,
    });

    // Build collegeMap for the joining member and sync into Registration
    const collegeMap = { [userId]: college || '' };
    syncMembersToRegistration(team, collegeMap).catch(() => {});
  } catch (error) {
    console.error('[joinTeam]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/teams/:teamId
   Returns full team details with populated members.
───────────────────────────────────────────────────────────── */
const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('leader',  'name email')
      .populate('members', 'name email');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    console.error('[getTeam]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/teams/by-hackathon/:hackathonId
   Returns the team the current user belongs to for a hackathon.
───────────────────────────────────────────────────────────── */
const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hackathonId } = req.params;

    const team = await Team.findOne({ hackathonId, members: userId })
      .populate('leader',  'name email')
      .populate('members', 'name email');

    if (!team) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTeam, joinTeam, getTeam, getMyTeam };
