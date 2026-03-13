const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/cocomController');
const { protect } = require('../middleware/auth');

// ── Organizer-facing (no auth required for now) ──────────────
router.post  ('/generate-code',    ctrl.generateJoinCode);
router.get   ('/latest-code',      ctrl.getLatestJoinCode);
router.get   ('/members',          ctrl.getMembers);
router.put   ('/members/:id',      ctrl.updateMember);
router.delete('/members/:id',      ctrl.removeMember);
router.post  ('/assign-task',      ctrl.assignTask);
router.get   ('/tasks',            ctrl.getTasks);
router.put   ('/tasks/:id/status', ctrl.updateTaskStatus);

// ── CoCom member-facing (auth required) ─────────────────────
router.get   ('/me',                    protect, ctrl.getMe);
router.get   ('/dashboard/:memberId',   protect, ctrl.getDashboard);
router.get   ('/my-tasks/:memberId',    protect, ctrl.getMyTasks);
router.put   ('/tasks/:id/complete',    protect, ctrl.completeTask);
router.delete('/tasks/:id',             protect, ctrl.deleteTask);
router.post  ('/join',                  protect, ctrl.joinHackathon);
router.put   ('/help-requests/:id/resolve', protect, ctrl.resolveHelpRequest);

module.exports = router;
