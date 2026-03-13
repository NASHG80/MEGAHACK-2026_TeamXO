const EventWorkspace = require('../models/EventWorkspace');
const EventTeam = require('../models/EventTeam');

/* ────────────────────────────────────────────────────────────────────────────
   GET /api/organizer/events/:id
   Fetch workspaces + teams (EventTeam seed data + real shortlisted teams)
──────────────────────────────────────────────────────────────────────────── */
const getEventData = async (req, res) => {
  try {
    const hackId = req.params.id;

    // 1. Workspaces — stored by hackathonId (which is the slug or any string used at creation time)
    const workspaces = await EventWorkspace.find({ hackathonId: hackId });

    // 2. Seed teams (EventTeam collection — from manual seed)
    const seedTeams = await EventTeam.find({ hackathonId: hackId });

    // 3. Real shortlisted teams from Registration model (the actual hackathon flow)
    let realTeams = [];
    try {
      const Hackathon    = require('../models/Hackathon');
      const Registration = require('../models/Registration');
      const mongoose     = require('mongoose');

      // Resolve hackathon — try by slug first, then by ObjectId
      let hackathon = null;
      if (mongoose.Types.ObjectId.isValid(hackId)) {
        hackathon = await Hackathon.findById(hackId).select('_id slug title');
      }
      if (!hackathon) {
        hackathon = await Hackathon.findOne({ slug: hackId }).select('_id slug title');
      }

      if (hackathon) {
        const regs = await Registration.find({
          hackathon: hackathon._id,
          shortlisted: true,
        }).select('teamName leaderName college teamMembers');

        realTeams = regs.map((r) => ({
          hackathonId: hackId,
          teamId:      `REG-${r._id}`,   // stable unique id from the registration
          name:        r.teamName || 'Unknown Team',
          college:     r.college || 'N/A',
          members:     (r.teamMembers?.length || 0) + 1, // +1 for leader
          entered:     false,
          entryTime:   null,
          memberNames: [r.leaderName, ...(r.teamMembers || []).map(m => m.name)].filter(Boolean),
          memberStatus: {},
        }));

        // ── Overlay actual entry status from EventTeam records ──────────────
        // selfScan writes EventTeam records by teamId (REG-{id}), independent
        // of hackathonId format. Query by teamId list to get real entry data.
        if (realTeams.length > 0) {
          const realTeamIds   = realTeams.map(t => t.teamId);
          const entryRecords  = await EventTeam.find({ teamId: { $in: realTeamIds } }).lean();
          const entryByTeamId = {};
          for (const rec of entryRecords) {
            entryByTeamId[rec.teamId] = rec;
          }
          realTeams = realTeams.map(t => {
            const rec = entryByTeamId[t.teamId];
            if (!rec) return t;
            // Convert Mongoose Map / plain object for memberStatus
            const ms = rec.memberStatus instanceof Map
              ? Object.fromEntries(rec.memberStatus)
              : (rec.memberStatus || {});
            return {
              ...t,
              entered:      rec.entered     || false,
              entryTime:    rec.entryTime   || null,
              memberStatus: ms,
            };
          });
        }
      }
    } catch (regErr) {
      // Registration model may not exist or query may fail — silently skip
      console.warn('[getEventData] Could not load registrations:', regErr.message);
    }

    // 4. Merge: prefer seed teams if they exist, otherwise use real teams
    //    De-duplicate by teamId
    const allTeams = [...seedTeams];
    const existingIds = new Set(seedTeams.map(t => t.teamId));
    for (const rt of realTeams) {
      if (!existingIds.has(rt.teamId)) {
        allTeams.push(rt);
      }
    }

    res.json({ workspaces, teams: allTeams });
  } catch (err) {
    console.error('[getEventData]', err);
    res.status(500).json({ message: 'Server error retrieving event data' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   POST /api/organizer/events/:id/workspaces
   Add a new workspace to the floor plan
──────────────────────────────────────────────────────────────────────────── */
const addWorkspace = async (req, res) => {
  try {
    const hackId = req.params.id;
    const { floor, type, number, capacity, note } = req.body;

    const count = await EventWorkspace.countDocuments({ hackathonId: hackId });
    const workspaceId = `WS-${String(count + 1).padStart(3, '0')}`;

    const newWs = await EventWorkspace.create({
      hackathonId: hackId,
      workspaceId,
      floor,
      type: type || 'Lab',
      number,
      workstations: capacity,
      note,
      assignedTeams: []
    });

    res.status(201).json({ workspace: newWs });
  } catch (err) {
    console.error('[addWorkspace]', err);
    res.status(500).json({ message: 'Error adding workspace' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   PUT /api/organizer/events/:id/workspaces/assign
   Assign team(s) to workspaces. Handles single assignment or batch auto-assign.
   req.body.assignments = [{ wsId, teamId, teamName, college, slots }]
──────────────────────────────────────────────────────────────────────────── */
const assignTeams = async (req, res) => {
  try {
    const hackId = req.params.id;
    const { assignments } = req.body;

    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ message: 'Invalid assignments format' });
    }

    for (const a of assignments) {
      await EventWorkspace.updateOne(
        { hackathonId: hackId, workspaceId: a.wsId },
        { 
          $push: { 
            assignedTeams: {
              teamId: a.teamId,
              teamName: a.teamName,
              college: a.college,
              slots: a.slots
            }
          }
        }
      );
    }

    const updated = await EventWorkspace.find({ hackathonId: hackId });
    res.json({ workspaces: updated });
  } catch (err) {
    console.error('[assignTeams]', err);
    res.status(500).json({ message: 'Error assigning teams' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   DELETE /api/organizer/events/:id/workspaces/:wsId/teams/:teamId
   Remove a team from a workspace
──────────────────────────────────────────────────────────────────────────── */
const removeTeam = async (req, res) => {
  try {
    const { id, wsId, teamId } = req.params;
    
    await EventWorkspace.updateOne(
      { hackathonId: id, workspaceId: wsId },
      { $pull: { assignedTeams: { teamId: teamId } } }
    );

    const updated = await EventWorkspace.find({ hackathonId: id });
    res.json({ workspaces: updated });
  } catch (err) {
    console.error('[removeTeam]', err);
    res.status(500).json({ message: 'Error removing team' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   PUT /api/organizer/events/:id/teams/:teamId/member
   Toggle presence status of a team member
──────────────────────────────────────────────────────────────────────────── */
const toggleTeamMember = async (req, res) => {
  try {
    const { id, teamId } = req.params;
    const { memberName, status } = req.body;

    const team = await EventTeam.findOne({ hackathonId: id, teamId });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Ensure memberStatus is a Map
    if (!(team.memberStatus instanceof Map)) {
       team.memberStatus = new Map(Object.entries(team.memberStatus || {}));
    }
    
    team.memberStatus.set(memberName, status);

    // If anyone is present, mark team check-in time if not already
    let teamEntered = false;
    let entryTime = team.entryTime;
    
    for (const [, st] of team.memberStatus.entries()) {
      if (st === 'present') {
        teamEntered = true;
        break;
      }
    }

    if (teamEntered && !team.entered) {
      team.entered = true;
      const d = new Date();
      entryTime = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
      team.entryTime = entryTime;
    } else if (!teamEntered) {
      team.entered = false;
      team.entryTime = null;
    }

    await team.save();

    res.json({ team });
  } catch (err) {
    console.error('[toggleTeamMember]', err);
    res.status(500).json({ message: 'Error toggling member' });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   POST /api/organizer/events/:id/seed
   SEED DATA: Initialize the database with mock values for demonstration
──────────────────────────────────────────────────────────────────────────── */
const seedEventData = async (req, res) => {
  try {
    const hackId = req.params.id || 'HF-001';

    // Clear existing
    await EventWorkspace.deleteMany({ hackathonId: hackId });
    await EventTeam.deleteMany({ hackathonId: hackId });

    // Seed Workspaces
    const MOCK_WORKSPACES = [
      { hackathonId: hackId, workspaceId: 'WS-001', floor: 'Ground Floor', type: 'Lab',  number: 'Lab 1',    workstations: 6,  note: 'Has projector',  assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-002', floor: 'Ground Floor', type: 'Lab',  number: 'Lab 2',    workstations: 5,  note: '',               assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-003', floor: 'First Floor',  type: 'Room', number: 'Room 101', workstations: 4,  note: 'AC not working', assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-004', floor: 'First Floor',  type: 'CR',   number: 'CR-A',     workstations: 8,  note: '',               assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-005', floor: 'Basement',     type: 'Hall', number: 'Hall B',   workstations: 10, note: 'Stage setup',    assignedTeams: [] },
    ];
    await EventWorkspace.insertMany(MOCK_WORKSPACES);

    // Seed Teams
    const MOCK_TEAMS = [
      { hackathonId: hackId, teamId: 'T001', name: 'ByteForce',    college: 'BITS Pilani',    members: 2, entered: true,  entryTime: '9:42 AM', memberNames: ['Arjun Mehta', 'Priya Sharma'],     memberStatus: { 'Arjun Mehta': 'present', 'Priya Sharma': 'present' } },
      { hackathonId: hackId, teamId: 'T002', name: 'NullPointers', college: 'IIT Bombay',     members: 2, entered: true,  entryTime: '9:51 AM', memberNames: ['Rohan Das', 'Sneha Kulkarni'],      memberStatus: { 'Rohan Das': 'present', 'Sneha Kulkarni': 'present' } },
      { hackathonId: hackId, teamId: 'T003', name: '404Found',     college: 'NIT Trichy',     members: 2, entered: false, entryTime: null,      memberNames: ['Karan Singh', 'Anjali Nair'],       memberStatus: {} },
      { hackathonId: hackId, teamId: 'T004', name: 'StackSmash',   college: 'IIIT Hyderabad', members: 2, entered: false, entryTime: null,      memberNames: ['Dev Patel', 'Meera Iyer'],          memberStatus: {} },
      { hackathonId: hackId, teamId: 'T005', name: 'DevDynamos',   college: 'VIT Vellore',    members: 2, entered: false, entryTime: null,      memberNames: ['Rahul Gupta', 'Sneha Reddy'],       memberStatus: {} },
    ];
    await EventTeam.insertMany(MOCK_TEAMS);

    res.json({ message: 'Event seeded successfully!' });
  } catch (err) {
    console.error('[seedEventData]', err);
    res.status(500).json({ message: 'Error seeding event data' });
  }
};

module.exports = {
  getEventData,
  addWorkspace,
  assignTeams,
  removeTeam,
  toggleTeamMember,
  seedEventData
};
