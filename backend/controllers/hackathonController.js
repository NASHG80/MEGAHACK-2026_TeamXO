const Hackathon    = require('../models/Hackathon');
const slugify      = require('slugify');

/* ── Helpers ──────────────────────────────────────────── */
const parse = (v) => {
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
  return v;
};

const safeDate = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
};

const filePath = (file) => {
  if (!file) return '';
  // On Cloudinary, file.path is the full URL; on local disk it's an OS path.
  // Normalise to a forward-slash relative URL usable in the browser.
  const p = (file.path || '').replace(/\\/g, '/');
  if (p.startsWith('http')) return p; // Cloudinary URL — keep as-is
  const idx = p.lastIndexOf('uploads/');
  return idx !== -1 ? p.slice(idx) : p;
};

/* ── CREATE ───────────────────────────────────────────── */
const createHackathon = async (req, res) => {
  try {
    const body = req.body;

    let slug = slugify(body.title, { lower: true, strict: true });
    if (await Hackathon.findOne({ slug })) slug = `${slug}-${Date.now()}`;

    const bannerImage            = filePath(req.files?.bannerImage?.[0])         || body.bannerImage || '';
    const logoImage              = filePath(req.files?.logoImage?.[0])            || body.logoImage   || '';
    const problemStatementFileUrl = filePath(req.files?.problemStatementFile?.[0]) || '';

    let problemStatement = undefined;
    if (body.problemStatementName) {
      problemStatement = {
        title:       body.problemStatementName,
        fileName:    req.files?.problemStatementFile?.[0]?.originalname || 'document.pdf',
        fileSize:    req.files?.problemStatementFile?.[0]
                       ? (req.files.problemStatementFile[0].size / 1024 / 1024).toFixed(2) + ' MB'
                       : '0.0 MB',
        downloadUrl: problemStatementFileUrl,
      };
    }

    const data = {
      title:                body.title,
      slug,
      organizerName:        body.organizerName,
      logoImage,
      bannerImage,
      description:          body.description,
      mode:                 body.mode,
      teamSizeMin:          Number(body.teamSizeMin) || 2,
      teamSizeMax:          Number(body.teamSizeMax) || 4,
      registrationDeadline: safeDate(body.registrationDeadline),
      prizePool:            body.prizePool || '',
      tags:                 parse(body.tags)   || [],
      stages:               parse(body.stages) || [],
      problemStatement,
      prizes:               parse(body.prizes) || [],
      rules:                parse(body.rules)  || [],
      organizerContact:     body.organizerContact,
      whatsappLink:         body.whatsappLink || '',
    };

    const hackathon = await Hackathon.create(data);
    res.status(201).json({ success: true, message: 'Hackathon created', data: hackathon });
  } catch (err) {
    console.error('createHackathon:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET ALL ──────────────────────────────────────────── */
const getAllHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: hackathons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET BY SLUG ──────────────────────────────────────── */
const getHackathonBySlug = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });
    res.json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── UPDATE ───────────────────────────────────────────── */
const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOneAndUpdate(
      { slug: req.params.slug }, req.body, { new: true, runValidators: true }
    );
    if (!hackathon) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE ───────────────────────────────────────────── */
const deleteHackathon = async (req, res) => {
  try {
    await Hackathon.findOneAndDelete({ slug: req.params.slug });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createHackathon,
  getAllHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon,
};
