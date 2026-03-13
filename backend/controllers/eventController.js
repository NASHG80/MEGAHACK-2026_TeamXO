const EventWorkspace = require('../models/EventWorkspace');
const EventTeam = require('../models/EventTeam');
const EventSOS = require('../models/EventSOS');

/* ────────────────────────────────────────────────────────────────────────────
   GET /api/organizer/events/:id
   Fetch the full state of the hackathon (workspaces, teams, active sos)
──────────────────────────────────────────────────────────────────────────── */
const getEventData = async (req, res) => {
  try {
    const hackId = req.params.id;
    const workspaces = await EventWorkspace.find({ hackathonId: hackId });
    const teams = await EventTeam.find({ hackathonId: hackId });
    const sosRequests = await EventSOS.find({ hackathonId: hackId, status: 'active' });

    res.json({ workspaces, teams, sosRequests });
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

    // Process assignments (inefficient loop config but fine for <100 teams)
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
    
    // Toggle the status
    team.memberStatus.set(memberName, status);

    // If anyone is present, mark team check-in time if not already
    let teamEntered = false;
    let entryTime = team.entryTime;
    
    for (const [mem, st] of team.memberStatus.entries()) {
      if (st === 'present') {
        teamEntered = true;
        break;
      }
    }

    if (teamEntered && !team.entered) {
      team.entered = true;
      const d = new Date();
      // Format 9:42 AM
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
   PUT /api/organizer/events/:id/sos/:sosId/resolve
   Resolve an SOS request
──────────────────────────────────────────────────────────────────────────── */
const resolveSOS = async (req, res) => {
  try {
    const { id, sosId } = req.params;
    await EventSOS.updateOne(
      { hackathonId: id, sosId },
      { status: 'resolved' }
    );
    res.json({ message: 'Resolved' });
  } catch (err) {
    console.error('[resolveSOS]', err);
    res.status(500).json({ message: 'Error resolving SOS' });
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
    await EventSOS.deleteMany({ hackathonId: hackId });

    // Seed Workspaces
    const MOCK_WORKSPACES = [
      { hackathonId: hackId, workspaceId: 'WS-001', floor: 'Ground Floor', type: 'Lab',  number: 'Lab 1',    workstations: 6,  note: 'Has projector',  assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-002', floor: 'Ground Floor', type: 'Lab',  number: 'Lab 2',    workstations: 5,  note: '',              assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-003', floor: 'First Floor',  type: 'Room', number: 'Room 101', workstations: 4,  note: 'AC not working', assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-004', floor: 'First Floor',  type: 'CR',   number: 'CR-A',     workstations: 8,  note: '',              assignedTeams: [] },
      { hackathonId: hackId, workspaceId: 'WS-005', floor: 'Basement',     type: 'Hall', number: 'Hall B',   workstations: 10, note: 'Stage setup',   assignedTeams: [] },
    ];
    await EventWorkspace.insertMany(MOCK_WORKSPACES);

    // Seed Teams
    const MOCK_TEAMS = [
      { hackathonId: hackId, teamId: 'T001', name: 'ByteForce',    college: 'BITS Pilani',    members: 2, entered: true,  entryTime: '9:42 AM', memberNames: ['Arjun Mehta', 'Priya Sharma'], memberStatus: { 'Arjun Mehta': 'present', 'Priya Sharma': 'present' } },
      { hackathonId: hackId, teamId: 'T002', name: 'NullPointers', college: 'IIT Bombay',     members: 2, entered: true,  entryTime: '9:51 AM', memberNames: ['Rohan Das', 'Sneha Kulkarni'], memberStatus: { 'Rohan Das': 'present', 'Sneha Kulkarni': 'present' } },
      { hackathonId: hackId, teamId: 'T003', name: '404Found',     college: 'NIT Trichy',     members: 2, entered: false, entryTime: null,      memberNames: ['Karan Singh', 'Anjali Nair'], memberStatus: {} },
      { hackathonId: hackId, teamId: 'T004', name: 'StackSmash',   college: 'IIIT Hyderabad', members: 2, entered: false, entryTime: null,      memberNames: ['Dev Patel', 'Meera Iyer'], memberStatus: {} },
      { hackathonId: hackId, teamId: 'T005', name: 'DevDynamos',   college: 'VIT Vellore',    members: 2, entered: false, entryTime: null,      memberNames: ['Rahul Gupta', 'Sneha Reddy'], memberStatus: {} },
    ];
    await EventTeam.insertMany(MOCK_TEAMS);

    // Seed SOS
    const MOCK_SOS = [
      { hackathonId: hackId, sosId: 'S001', name: 'Dev Patel',  workspace: 'Lab 1',    message: 'Projector not working',  time: '2 min ago', status: 'active' },
      { hackathonId: hackId, sosId: 'S002', name: 'Meera Iyer', workspace: 'Room 204', message: 'Need extension board',   time: '5 min ago', status: 'active' },
    ];
    await EventSOS.insertMany(MOCK_SOS);

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
  resolveSOS,
  seedEventData
};
