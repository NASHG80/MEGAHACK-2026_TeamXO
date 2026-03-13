const Hackathon   = require('../models/Hackathon');
const Participant  = require('../models/Participant');

/* ── GET organizer's own hackathons list ───────────────── */
const getMyHackathons = async (req, res) => {
  try {
    // Return all hackathons created by this organizer user
    const list = await Hackathon.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    // If none with createdBy (legacy data), fall back to all hackathons
    // matching the organizer's name
    if (list.length === 0) {
      const byName = await Hackathon.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, data: byName });
    }
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET single hackathon + participants + teams ────────── */
const getHackathonManageData = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find by slug or by Mongo _id
    let hackathon = await Hackathon.findOne({ slug });
    if (!hackathon && slug.match(/^[a-f\d]{24}$/i)) {
      hackathon = await Hackathon.findById(slug);
    }
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Participants for this hackathon
    let participants = [];
    try {
      const Reg = require('../models/Registration');
      const regs = await Reg.find({ hackathonId: hackathon._id }).lean();
      participants = regs.map(r => ({
        _id:    r._id,
        name:   r.name,
        email:  r.email,
        college: r.college,
        status: r.status || 'Pending',
        submissionStatus: r.submissionStatus || 'Not Submitted',
      }));
    } catch (_) {}

    res.json({
      success: true,
      hackathon: {
        ...hackathon.toObject(),
        // Normalise fields expected by the UI
        hackathonId: hackathon.hackathonId || hackathon.slug,
        deadline:    hackathon.registrationDeadline
          ? new Date(hackathon.registrationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'TBD',
        prize:       hackathon.prizePool || '0',
        regCount:    participants.length,
        subCount:    participants.filter(p => p.submissionStatus !== 'Not Submitted').length,
        regLink:     `https://hackflow.app/h/${hackathon.slug}`,
        phases:      [], // legacy – replaced by timeline
      },
      participants,
      teams:       [],
      activities:  [],
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

module.exports = { getMyHackathons, getHackathonManageData, updateHackathonSettings };
