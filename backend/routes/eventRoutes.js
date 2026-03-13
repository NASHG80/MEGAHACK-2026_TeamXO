const express = require('express');
const router = express.Router();
const { 
  getEventData, 
  addWorkspace, 
  assignTeams, 
  removeTeam, 
  toggleTeamMember, 
  resolveSOS,
  seedEventData
} = require('../controllers/eventController');
const { protect, requireRole } = require('../middleware/auth');

// Base route is /api/organizer/events

// GET: Fetch event data
router.get('/:id', protect, requireRole('organizer', 'admin'), getEventData);

// POST: Seed mock data
router.post('/:id/seed', protect, requireRole('organizer', 'admin'), seedEventData);

// POST: Add workspace
router.post('/:id/workspaces', protect, requireRole('organizer', 'admin'), addWorkspace);

// PUT: Assign team(s) to workspaces
router.put('/:id/workspaces/assign', protect, requireRole('organizer', 'admin'), assignTeams);

// DELETE: Remove a team from a workspace
router.delete('/:id/workspaces/:wsId/teams/:teamId', protect, requireRole('organizer', 'admin'), removeTeam);

// PUT: Toggle team member checked-in status
router.put('/:id/teams/:teamId/member', protect, requireRole('organizer', 'admin'), toggleTeamMember);

// PUT: Resolve an SOS request
router.put('/:id/sos/:sosId/resolve', protect, requireRole('organizer', 'admin'), resolveSOS);

module.exports = router;
