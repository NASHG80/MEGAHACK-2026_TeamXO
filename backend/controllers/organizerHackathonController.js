const Hackathon   = require('../models/Hackathon');
const Participant  = require('../models/Participant');

/* ── GET organizer's own hackathons list ───────────────── */
const getMyHackathons = async (req, res) => {
  try {
    // Strictly return only hackathons created by this organizer — no fallback
    const list = await Hackathon.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET single hackathon + participants + teams ────────── */
const getHackathonManageData = async (req, res) => {
  try {
    const { slug } = req.params;
    const Registration = require('../models/Registration');

    // Find by slug or by Mongo _id
    let hackathon = await Hackathon.findOne({ slug });
    if (!hackathon && slug.match(/^[a-f\d]{24}$/i)) {
      hackathon = await Hackathon.findById(slug);
    }
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Fetch all registrations for this hackathon
    const regs = await Registration.find({ hackathon: hackathon._id })
      .sort({ createdAt: -1 })
      .lean();

    // ── Also fetch all Team documents for this hackathon and populate members ──
    // Team is the authoritative source for who has joined — Registration.teamMembers
    // may be stale/empty due to async timing of the sync.
    const { Team } = require('../models/Team');
    const teamDocs = await Team.find({ hackathonId: hackathon._id })
      .populate('members', 'name email')
      .lean();

    // Build lookup: leaderEmail → populated team doc
    const teamByLeader = {};
    for (const t of teamDocs) {
      if (t.leaderEmail) teamByLeader[t.leaderEmail.toLowerCase()] = t;
    }

    // ── Helper: get full member list for a registration ──
    function buildMembers(reg) {
      const teamDoc = teamByLeader[(reg.leaderEmail || '').toLowerCase()];
      if (teamDoc && teamDoc.members && teamDoc.members.length > 0) {
        const leaderEmail = (reg.leaderEmail || '').toLowerCase();
        // All members except the leader (already stored as leaderName/leaderEmail)
        return teamDoc.members
          .filter(m => (m.email || '').toLowerCase() !== leaderEmail)
          .map(m => ({
            name:    m.name  || '',
            email:   m.email || '',
            college: '',
          }));
      }
      // Fallback to whatever is stored in Registration.teamMembers
      return reg.teamMembers || [];
    }

    // ── Participants list ──
    const participants = regs.map(r => ({
      _id:         r._id,
      teamName:    r.teamName    || '—',
      leaderName:  r.leaderName  || '—',
      leaderEmail: r.leaderEmail || '—',
      college:     r.college     || '—',
      status:      r.status      || 'confirmed',
      aiScore:     r.aiScore     ?? null,
      resumeUrl:   r.resumeUrl   || null,
      shortlisted: r.shortlisted || false,
      domain:      r.domain      || '',
      psId:        r.psId        || '',
      teamMembers: buildMembers(r),
      submittedAt: r.createdAt,
    }));

    // ── Teams list ──
    const teams = regs.map(r => {
      const members = buildMembers(r);
      return {
        _id:         r._id,
        teamId:      r._id.toString(),
        name:        r.teamName    || '—',
        college:     r.college     || '—',
        leaderName:  r.leaderName  || '—',
        leaderEmail: r.leaderEmail || '—',
        teamMembers: members,
        memberNames: [
          r.leaderName,
          ...members.map(m => m.name),
        ].filter(Boolean),
        resumeUrl:   r.resumeUrl   || null,
        submitted:   !!r.resumeUrl,
        score:       r.aiScore ?? null,
        shortlisted: r.shortlisted || false,
        githubLink:  r.githubLink  || '',
      };
    });


    res.json({
      success: true,
      hackathon: {
        ...hackathon.toObject(),
        hackathonId: hackathon.hackathonId || hackathon.slug,
        deadline: hackathon.registrationDeadline
          ? new Date(hackathon.registrationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'TBD',
        prize:    hackathon.prizePool || '0',
        regCount: regs.length,
        subCount: regs.filter(r => r.resumeUrl).length,
        regLink:  `https://hackflow.app/h/${hackathon.slug}`,
        phases:   [],
      },
      participants,
      teams,
      activities: [],
    });
  } catch (err) {
    console.error('getHackathonManageData:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── UPDATE settings for a hackathon ───────────────────── */
const updateHackathonSettings = async (req, res) => {
  try {
    const { slug } = req.params;
    const hackathon = await Hackathon.findOneAndUpdate(
      { slug },
      req.body,
      { new: true }
    );
    if (!hackathon) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, hackathon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET shortlisted recipients for certificate generation ── */
const getShortlistedRecipients = async (req, res) => {
  try {
    const { slug } = req.params;
    const Registration = require('../models/Registration');
    const { Team }     = require('../models/Team');

    // Resolve hackathon by slug or _id
    let hackathon = await Hackathon.findOne({ slug }).lean();
    if (!hackathon && slug.match(/^[a-f\d]{24}$/i)) {
      hackathon = await Hackathon.findById(slug).lean();
    }
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

    // Only shortlisted registrations
    const regs = await Registration.find({ hackathon: hackathon._id, shortlisted: true }).lean();

    // Team docs for member lookup
    const teamDocs = await Team.find({ hackathonId: hackathon._id })
      .populate('members', 'name email')
      .lean();
    const teamByLeader = {};
    for (const t of teamDocs) {
      if (t.leaderEmail) teamByLeader[t.leaderEmail.toLowerCase()] = t;
    }

    const recipients = [];
    for (const r of regs) {
      // Leader
      recipients.push({
        id:       r._id.toString() + '_leader',
        name:     (r.leaderName || '').trim() || r.leaderEmail.split('@')[0],
        email:    r.leaderEmail,
        teamName: r.teamName || '',
        type:     'participant',
      });

      // Members from Team doc (authoritative) or Registration.teamMembers
      const teamDoc = teamByLeader[(r.leaderEmail || '').toLowerCase()];
      let members = [];
      if (teamDoc?.members?.length > 0) {
        const le = (r.leaderEmail || '').toLowerCase();
        members = teamDoc.members
          .filter(m => (m.email || '').toLowerCase() !== le)
          .map(m => ({ name: m.name || '', email: m.email || '' }));
      } else {
        members = (r.teamMembers || []).map(m => ({ name: m.name || '', email: m.email || '' }));
      }

      for (const m of members) {
        if (!m.email) continue;
        recipients.push({
          id:       r._id.toString() + '_' + m.email,
          name:     m.name || m.email.split('@')[0],
          email:    m.email,
          teamName: r.teamName || '',
          type:     'participant',
        });
      }
    }

    res.json({
      success: true,
      hackathon: {
        _id:      hackathon._id,
        name:     hackathon.title,
        slug:     hackathon.slug,
        date:     hackathon.registrationDeadline,
        organizer: hackathon.organizerName,
      },
      recipients,
      total: recipients.length,
    });
  } catch (err) {
    console.error('getShortlistedRecipients:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyHackathons, getHackathonManageData, updateHackathonSettings, getShortlistedRecipients };
