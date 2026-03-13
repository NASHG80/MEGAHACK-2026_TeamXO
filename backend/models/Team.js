const mongoose = require('mongoose');

/* ── Helper: generate unique 6-char team code ──────────────── */
async function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  while (exists) {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    exists = await Team.exists({ teamCode: code });
  }
  return code;
}

/* ── Schema ─────────────────────────────────────────────────── */
const teamSchema = new mongoose.Schema({
  teamName:    { type: String, required: true, trim: true },
  teamCode:    { type: String, unique: true, required: true, uppercase: true, trim: true },
  leader:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaderEmail: { type: String, trim: true, lowercase: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  createdAt:   { type: Date, default: Date.now },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = { Team, generateTeamCode };
