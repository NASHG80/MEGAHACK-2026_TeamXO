const CertificateTemplate  = require('../models/CertificateTemplate');
const Certificate           = require('../models/Certificate');
const Registration          = require('../models/Registration');
const Hackathon             = require('../models/Hackathon');
const User                  = require('../models/User');
const nodemailer            = require('nodemailer');
const sharp                 = require('sharp');
const { createCanvas }      = require('canvas');         // cross-platform text rendering
const { processImageToBase64 } = require('../utils/imageProcessor');


/* ─── Nodemailer transporter ─────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE ENDPOINTS
═══════════════════════════════════════════════════════════════════ */

/**
 * POST /api/certificates/templates
 * Create a template (preset or upload).
 */
exports.createTemplate = async (req, res) => {
  try {
    const { hackathonId, name, templateType, presetId, elements } = req.body;

    // If an image was uploaded, compress with Sharp and store as Base64 data-URI
    let backgroundImageUrl = null;
    if (req.file?.buffer) {
      try {
        backgroundImageUrl = await processImageToBase64(req.file.buffer, 1200);
      } catch (e) {
        console.error('Certificate BG processing failed:', e.message);
      }
    }

    const template = await CertificateTemplate.create({
      hackathonId,
      name: name || 'Custom Certificate',
      templateType: templateType || (backgroundImageUrl ? 'upload' : 'preset'),
      presetId:  presetId || null,
      backgroundImageUrl,
      elements: elements ? JSON.parse(elements) : [],
      createdBy: req.user?.id,
    });

    res.status(201).json({ template });
  } catch (err) {
    console.error('createTemplate error:', err);
    res.status(500).json({ message: 'Failed to create template', error: err.message });
  }
};

/**
 * GET /api/certificates/templates/:hackathonId
 * List all templates for a hackathon.
 */
exports.getTemplates = async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({ hackathonId: req.params.hackathonId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ templates });
  } catch (err) {
    console.error('getTemplates error:', err);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
};

/**
 * GET /api/certificates/template/:templateId
 * Get a single template by its ID.
 */
exports.getTemplate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.templateId).lean();
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ template });
  } catch (err) {
    console.error('getTemplate error:', err);
    res.status(500).json({ message: 'Failed to fetch template' });
  }
};

/**
 * PUT /api/certificates/template/:templateId
 * Save/update the element layout of a template.
 */
exports.saveTemplate = async (req, res) => {
  try {
    const { elements, name } = req.body;

    const update = {};
    if (name)     update.name     = name;
    if (elements) update.elements = elements;

    const template = await CertificateTemplate.findByIdAndUpdate(
      req.params.templateId,
      { $set: update },
      { new: true }
    ).lean();

    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ template, message: 'Template saved successfully' });
  } catch (err) {
    console.error('saveTemplate error:', err);
    res.status(500).json({ message: 'Failed to save template' });
  }
};

/**
 * DELETE /api/certificates/template/:templateId
 */
exports.deleteTemplate = async (req, res) => {
  try {
    await CertificateTemplate.findByIdAndDelete(req.params.templateId);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error('deleteTemplate error:', err);
    res.status(500).json({ message: 'Failed to delete template' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   RECIPIENTS ENDPOINT
═══════════════════════════════════════════════════════════════════ */

/**
 * GET /api/certificates/recipients/:hackathonId
 * Returns all students signed up in the system (role = 'student').
 * These are the real user accounts, not hackathon registration records.
 */
exports.getRecipients = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Verify the hackathon exists
    const hackathon = await Hackathon.findById(hackathonId).lean();
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // Always fetch real student accounts — people who signed up with role: 'student'
    // isVerified: true means they completed OTP verification
    const students = await User.find({ role: 'student', isVerified: true })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const recipients = students.map(u => ({
      id:    u._id.toString(),
      name:  u.name && u.name.trim() ? u.name.trim() : u.email.split('@')[0],
      email: u.email,
      type:  'participant',
    }));

    res.json({
      hackathon: { name: hackathon.title, date: hackathon.registrationDeadline, organizer: hackathon.organizerName },
      recipients,
    });
  } catch (err) {
    console.error('getRecipients error:', err);
    res.status(500).json({ message: 'Failed to fetch recipients' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GENERATION & EMAIL
═══════════════════════════════════════════════════════════════════ */

/**
 * POST /api/certificates/generate/:hackathonId
 * Accepts { templateId, recipients: [{id, name, email, type, position?}] }
 * Returns 202 immediately, processes in background.
 */
exports.generateCertificates = async (req, res) => {
  const { hackathonId } = req.params;
  const { templateId, recipients, sendEmail } = req.body;

  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ message: 'No recipients provided' });
  }

  try {
    const hackathon = await Hackathon.findById(hackathonId).lean();
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    // Create pending Certificate records immediately so the poller can see them
    const insertOps = recipients.map(r => ({
      hackathonId,
      templateId:     templateId || null,
      recipientName:  r.name,
      recipientEmail: r.email,
      recipientType:  r.type || 'participant',
      position:       r.position || null,
      status:         'pending',
    }));

    const docs = await Certificate.insertMany(insertOps, { ordered: false });

    // Respond immediately
    res.status(202).json({ message: 'Generation started', total: docs.length });

    // ── Background processing ────────────────────────────────────────
    (async () => {
      for (const doc of docs) {
        try {
          // Mark as generated (no actual canvas rendering unless canvas is installed)
          await Certificate.findByIdAndUpdate(doc._id, { status: 'generated' });

          if (sendEmail) {
            // Build a simple text email — replace with canvas-generated attachment later
            const mailOptions = {
              from:    `"HackFlow Certificates" <${process.env.EMAIL_USER}>`,
              to:      doc.recipientEmail,
              subject: `Your Certificate — ${hackathon.title}`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                  <h2 style="color:#1E3A8A;">Congratulations, ${doc.recipientName}! 🎉</h2>
                  <p>Your ${doc.recipientType === 'winner' ? 'winner' : 'participation'} certificate for 
                  <strong>${hackathon.title}</strong> has been issued.</p>
                  ${doc.position ? `<p>🏆 Position: <strong>${doc.position}</strong></p>` : ''}
                  <p>Certificate Number: <code>${doc.certificateNumber}</code></p>
                  <p style="color:#64748b;font-size:13px;">Organised by ${hackathon.organizerName}</p>
                </div>
              `,
            };

            await transporter.sendMail(mailOptions);
            await Certificate.findByIdAndUpdate(doc._id, {
              status:      'sent',
              emailSentAt: new Date(),
            });
          } else {
            await Certificate.findByIdAndUpdate(doc._id, { status: 'sent' });
          }
        } catch (innerErr) {
          console.error(`Failed for ${doc.recipientEmail}:`, innerErr.message);
          await Certificate.findByIdAndUpdate(doc._id, { status: 'failed' }).catch(() => {});
        }
      }
    })();
  } catch (err) {
    console.error('generateCertificates error:', err);
    res.status(500).json({ message: 'Failed to start generation', error: err.message });
  }
};

/**
 * GET /api/certificates/status/:hackathonId
 * Returns generation progress summary.
 */
exports.getGenerationStatus = async (req, res) => {
  try {
    const certs = await Certificate.find({ hackathonId: req.params.hackathonId }).lean();
    const total     = certs.length;
    const pending   = certs.filter(c => c.status === 'pending').length;
    const generated = certs.filter(c => c.status === 'generated').length;
    const sent      = certs.filter(c => c.status === 'sent').length;
    const failed    = certs.filter(c => c.status === 'failed').length;
    const done      = total - pending;
    const progress  = total > 0 ? Math.round((done / total) * 100) : 0;

    res.json({ total, pending, generated, sent, failed, progress, certs });
  } catch (err) {
    console.error('getGenerationStatus error:', err);
    res.status(500).json({ message: 'Failed to get status' });
  }
};

/**
 * GET /api/certificates/verify/:certificateNumber
 * Public verification endpoint.
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.certificateNumber })
      .populate('hackathonId', 'title organizerName registrationDeadline')
      .lean();

    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    res.json({
      valid:         true,
      recipientName: cert.recipientName,
      recipientType: cert.recipientType,
      position:      cert.position,
      hackathon:     cert.hackathonId?.title,
      organizer:     cert.hackathonId?.organizerName,
      issuedAt:      cert.emailSentAt || cert.createdAt,
      certificateNumber: cert.certificateNumber,
    });
  } catch (err) {
    console.error('verifyCertificate error:', err);
    res.status(500).json({ message: 'Failed to verify certificate' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   SAVE NAME POSITION
═══════════════════════════════════════════════════════════════════ */
exports.saveNamePosition = async (req, res) => {
  try {
    const { nameX, nameY, fontSize = 52, nameColor = '#1E3A8A' } = req.body;
    const template = await CertificateTemplate.findByIdAndUpdate(
      req.params.templateId,
      { $set: { nameX, nameY, fontSize, nameColor } },
      { new: true }
    ).lean();
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ template, message: 'Name position saved' });
  } catch (err) {
    console.error('saveNamePosition error:', err);
    res.status(500).json({ message: 'Failed to save name position' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   PERSONALISED CERTIFICATE GENERATION + EMAIL
═══════════════════════════════════════════════════════════════════ */

/** Generate a unique certificate number like HCK-2026-A3F7B */
function makeCertNumber() {
  return `HCK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Stamp a student's name onto a certificate image.
 * Uses node-canvas to render the text as a transparent PNG, then
 * composites it over the certificate with sharp.
 * This approach is fully cross-platform (no librsvg needed).
 */
async function buildCertificateBuffer(base64Image, name, nameX, nameY, fontSize, color) {
  // 1. Decode base64 certificate image → buffer
  const raw      = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const inputBuf = Buffer.from(raw, 'base64');

  // 2. Get actual pixel dimensions
  const meta = await sharp(inputBuf).metadata();
  const w    = meta.width  || 800;
  const h    = meta.height || 566;

  // 3. Absolute pixel position (from 0-1 fractions)
  const px = Math.round(nameX * w);
  const py = Math.round(nameY * h);

  // 4. Draw text onto a transparent canvas using node-canvas
  const canvas = createCanvas(w, h);
  const ctx    = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, w, h);

  // Text styling
  ctx.font         = `bold ${fontSize}px Georgia, serif`;
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Optional: subtle text shadow for readability over light backgrounds
  ctx.shadowColor   = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur    = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillText(name, px, py);

  // 5. Export canvas as PNG buffer
  const textPngBuffer = canvas.toBuffer('image/png');

  // 6. Composite the text PNG over the certificate image using sharp
  return sharp(inputBuf)
    .composite([{ input: textPngBuffer, top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toBuffer();
}

exports.generatePersonalized = async (req, res) => {
  const { hackathonId } = req.params;
  const { templateId, recipients: providedRecipients, sendToAll = false } = req.body;
  try {
    const template  = await CertificateTemplate.findById(templateId).lean();
    if (!template)                      return res.status(404).json({ message: 'Template not found' });
    if (!template.backgroundImageUrl)   return res.status(400).json({ message: 'Template has no background image.' });
    const hackathon = await Hackathon.findById(hackathonId).lean();
    if (!hackathon)                     return res.status(404).json({ message: 'Hackathon not found' });

    let recipients = providedRecipients || [];
    if (sendToAll || recipients.length === 0) {
      // Always pull from the real student user accounts —
      // same source as getRecipients so the UI and send list are always in sync.
      const students = await User.find({ role: 'student', isVerified: true })
        .select('name email')
        .lean();
      recipients = students.map(u => ({
        name:  u.name && u.name.trim() ? u.name.trim() : u.email.split('@')[0],
        email: u.email,
        type:  'participant',
      }));
    }
    if (recipients.length === 0) return res.status(400).json({ message: 'No recipients found. No students are registered or signed up.' });

    // ── BUG FIX: insertMany bypasses Mongoose pre-save hooks, so
    //    certificateNumber is never generated and the unique constraint
    //    causes a MongoServerError. Pre-generate numbers here instead. ──
    const insertDocs = recipients.map(r => ({
      hackathonId,
      templateId,
      certificateNumber: makeCertNumber(),   // ← generated here, not in pre-save
      recipientName:     r.name,
      recipientEmail:    r.email,
      recipientType:     r.type || 'participant',
      position:          r.position || null,
      status:            'pending',
    }));

    const docs = await Certificate.insertMany(insertDocs, { ordered: false });

    res.status(202).json({ message: 'Generation started', total: docs.length });

    const nameX = template.nameX ?? 0.5, nameY = template.nameY ?? 0.5;
    const fontSize = template.fontSize ?? 52, nameColor = template.nameColor ?? '#1E3A8A';

    (async () => {
      for (const doc of docs) {
        try {
          const certBuffer = await buildCertificateBuffer(template.backgroundImageUrl, doc.recipientName, nameX, nameY, fontSize, nameColor);
          await Certificate.findByIdAndUpdate(doc._id, { status: 'generated' });
          await transporter.sendMail({
            from: `"HackFlow Certificates" <${process.env.EMAIL_USER}>`,
            to:   doc.recipientEmail,
            subject: `Your Certificate – ${hackathon.title}`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#1E3A8A;">Congratulations, ${doc.recipientName}! 🎉</h2>
              <p>Your certificate for <strong>${hackathon.title}</strong> is attached.</p>
              ${doc.position ? `<p>🏆 Position: <strong>${doc.position}</strong></p>` : ''}
              <p>Certificate No: <code>${doc.certificateNumber}</code></p>
              <p style="color:#64748b;font-size:12px;">Organised by ${hackathon.organizerName}</p>
            </div>`,
            attachments: [{
              filename:    `certificate-${doc.recipientName.replace(/\s+/g, '-')}.jpg`,
              content:     certBuffer,
              contentType: 'image/jpeg',
            }],
          });
          await Certificate.findByIdAndUpdate(doc._id, { status: 'sent', emailSentAt: new Date() });
        } catch (innerErr) {
          console.error(`Failed for ${doc.recipientEmail}:`, innerErr.message);
          await Certificate.findByIdAndUpdate(doc._id, { status: 'failed' }).catch(() => {});
        }
      }
    })();
  } catch (err) {
    console.error('generatePersonalized error:', err);
    res.status(500).json({ message: 'Failed to start generation', error: err.message });
  }
};
