const path     = require('path');
const fs       = require('fs');
const Hackathon = require('../models/Hackathon');
const User      = require('../models/User');
const slugify   = require('slugify');
const { processImageToBase64 } = require('../utils/imageProcessor');
const { uploadDir } = require('../middleware/uploadMiddleware');

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

/**
 * Write a PDF buffer to disk and return the relative URL path.
 * PDFs are NOT stored as Base64 — they stay on the filesystem.
 */
const savePdfToDisk = (fileObj) => {
  if (!fileObj?.buffer) return '';
  const filename = `${Date.now()}-${fileObj.originalname}`;
  const dest     = path.join(uploadDir, filename);
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(dest, fileObj.buffer);
  return `uploads/${filename}`; // relative path served by express static
};

/* ── CREATE ───────────────────────────────────────────── */
const createHackathon = async (req, res) => {
  try {
    // Verify that the requesting user is an approved organizer
    const user = await User.findById(req.user.id).select('orgVerified');
    if (!user || !user.orgVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your organizer account must be verified by an admin before creating hackathons.',
      });
    }

    // ── Block if organizer already has an active hackathon ──────
    const activeHackathon = await Hackathon.findOne({
      createdBy: req.user.id,
      status: { $in: ['upcoming', 'live'] },
    }).select('title');

    if (activeHackathon) {
      return res.status(400).json({
        success: false,
        message: `You already have an active hackathon: "${activeHackathon.title}". Please mark it as completed before creating a new one.`,
      });
    }


    const body = req.body;

    let slug = slugify(body.title, { lower: true, strict: true });
    if (await Hackathon.findOne({ slug })) slug = `${slug}-${Date.now()}`;

    // ── Images → Sharp compress → Base64 string ──────────
    let bannerImage = body.bannerImage || '';
    let logoImage   = body.logoImage   || '';

    if (req.files?.bannerImage?.[0]?.buffer) {
      try {
        bannerImage = await processImageToBase64(req.files.bannerImage[0].buffer, 1200);
      } catch (e) {
        console.error('Banner processing failed:', e.message);
      }
    }

    if (req.files?.logoImage?.[0]?.buffer) {
      try {
        logoImage = await processImageToBase64(req.files.logoImage[0].buffer, 400);
      } catch (e) {
        console.error('Logo processing failed:', e.message);
      }
    }

    // ── PDF → save to disk → store relative path ─────────
    let problemStatement;
    if (body.problemStatementName) {
      const pdfFile        = req.files?.problemStatementFile?.[0];
      const downloadUrl    = pdfFile ? savePdfToDisk(pdfFile) : '';
      const fileName       = pdfFile?.originalname || 'document.pdf';
      const fileSize       = pdfFile
        ? `${(pdfFile.buffer.length / 1024 / 1024).toFixed(2)} MB`
        : '0.0 MB';

      problemStatement = {
        title: body.problemStatementName,
        fileName,
        fileSize,
        downloadUrl,   // e.g. "uploads/1710344521-problem.pdf"
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
      startDate:            safeDate(body.startDate),
      endDate:              safeDate(body.endDate),
      status:               body.status || 'upcoming',
      prizePool:            body.prizePool || '',
      tags:                 parse(body.tags)     || [],
      stages:               parse(body.stages)   || [],
      timeline:             parse(body.timeline) || [],
      problemStatement,
      prizes:               parse(body.prizes) || [],
      rules:                parse(body.rules)  || [],
      organizerContact:     body.organizerContact,
      whatsappLink:         body.whatsappLink || '',
      createdBy:            req.user.id,   // link to the organizer who created it
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
    const updates = { ...req.body };

    if (req.files?.bannerImage?.[0]?.buffer) {
      try {
        updates.bannerImage = await processImageToBase64(req.files.bannerImage[0].buffer, 1200);
      } catch (e) {
        console.error('Banner update failed:', e.message);
      }
    }

    if (req.files?.logoImage?.[0]?.buffer) {
      try {
        updates.logoImage = await processImageToBase64(req.files.logoImage[0].buffer, 400);
      } catch (e) {
        console.error('Logo update failed:', e.message);
      }
    }

    const oldHackathon = await Hackathon.findOne({ slug: req.params.slug });
    if (!oldHackathon) return res.status(404).json({ success: false, message: 'Not found' });

    const hackathon = await Hackathon.findOneAndUpdate(
      { slug: req.params.slug }, updates, { new: true, runValidators: true }
    );
    
    // ── Loyalty points on completion ──
    if (updates.status === 'completed' && oldHackathon.status !== 'completed') {
      const { addLoyaltyPoints } = require('../utils/loyaltyProcessor');
      await addLoyaltyPoints(hackathon.createdBy, 100, 'Hackathon Completed Successfully');
      await User.findByIdAndUpdate(hackathon.createdBy, { $inc: { totalHackathonsHosted: 1 } });
    }

    res.json({ success: true, data: hackathon });
  } catch (err) {
    console.error('updateHackathon:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ── UPDATE TIMELINE (safe patch — no validator issues) ── */
const updateHackathonTimeline = async (req, res) => {
  try {
    const { slug } = req.params;
    const { timeline } = req.body;
    if (!Array.isArray(timeline)) {
      return res.status(400).json({ success: false, message: 'timeline must be an array' });
    }
    const hackathon = await Hackathon.findOneAndUpdate(
      { slug },
      { $set: { timeline } },
      { new: true }
    );
    if (!hackathon) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, timeline: hackathon.timeline });
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
  updateHackathonTimeline,
  deleteHackathon,
};
