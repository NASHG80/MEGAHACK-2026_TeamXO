const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const path = require('path');
const { extractResumeText, getAIScore } = require('../services/ai_service/resume_extractor');
const sendEmail = require('../utils/sendEmail');

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/
   Simple team registration (no file upload)
───────────────────────────────────────────────────────────── */
const registerTeam = async (req, res) => {
  try {
    const { hackathonId, teamName, leaderName, leaderEmail, college, teamMembers, domain, psId } = req.body;
    if (!hackathonId || !teamName || !leaderName || !leaderEmail || !college) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    const existing = await Registration.findOne({ hackathon: hackathonId, leaderEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered.' });
    }
    const registration = await Registration.create({
      hackathon: hackathonId, teamName, leaderName, leaderEmail, college,
      teamMembers: teamMembers || [],
      domain: domain || '', psId: psId || '',
    });

    const count = await Registration.countDocuments({ hackathon: hackathonId });
    if (count === 100) {
      const hack = await Hackathon.findById(hackathonId).select('createdBy');
      if (hack && hack.createdBy) {
        const { addLoyaltyPoints } = require('../utils/loyaltyProcessor');
        addLoyaltyPoints(hack.createdBy, 50, 'Reached 100 Participants/Teams');
      }
    }

    res.status(201).json({ success: true, message: 'Registration successful!', data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/register-with-resume
   1. Saves registration to DB IMMEDIATELY (fast response)
   2. Runs OCR + Groq AI scoring in BACKGROUND
   3. Updates the DB record with aiScore when done
───────────────────────────────────────────────────────────── */
const registerWithResume = async (req, res) => {
  console.log('\n[registerWithResume] ── Incoming request ──');
  console.log('  body:', JSON.stringify(req.body));
  console.log('  file:', req.file ? req.file.filename : 'none');

  try {
    const { hackathonId, teamName, leaderName, leaderEmail, college, teamMembers, domain, psId } = req.body;

    if (!hackathonId || !teamName || !leaderName || !leaderEmail || !college) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Filter blank team member rows
    let parsedMembers = [];
    try { parsedMembers = teamMembers ? JSON.parse(teamMembers) : []; } catch {}
    parsedMembers = parsedMembers.filter(m => m.name?.trim() || m.email?.trim());

    // Duplicate check
    const existing = await Registration.findOne({ hackathon: hackathonId, leaderEmail });
    if (existing) {
      console.log('[registerWithResume] Duplicate for:', leaderEmail);
      return res.status(400).json({ success: false, message: 'This email has already registered for this hackathon.' });
    }

    const resumeFile = req.file;
    const resumeUrl  = resumeFile ? `/uploads/resumes/${resumeFile.filename}` : null;

    // ── STEP 1: Save to DB immediately ──────────────────────────
    const registration = await Registration.create({
      hackathon:     hackathonId,
      teamName, leaderName, leaderEmail, college,
      teamMembers:   parsedMembers,
      resumeUrl,
      extractedText: null,
      aiScore:       null,
      domain:        domain || '',
      psId:          psId   || '',
    });
    console.log('[registerWithResume] ✅ Saved instantly! ID:', registration._id);

    const count = await Registration.countDocuments({ hackathon: hackathonId });
    if (count === 100) {
      const hack = await Hackathon.findById(hackathonId).select('createdBy');
      if (hack && hack.createdBy) {
        const { addLoyaltyPoints } = require('../utils/loyaltyProcessor');
        addLoyaltyPoints(hack.createdBy, 50, 'Reached 100 Participants/Teams');
      }
    }

    // ── STEP 2: Respond to student right away ───────────────────
    res.status(201).json({
      success: true,
      message: 'Registration successful! AI score computing in background.',
      data: {
        id:        registration._id,
        teamName:  registration.teamName,
        aiScore:   null,
        resumeUrl: registration.resumeUrl,
      },
    });

    // ── STEP 3: OCR + Groq in background ────────────────────────
    if (resumeFile) {
      setImmediate(async () => {
        try {
          console.log('\n[BG-Score] Starting OCR for:', registration._id);
          const extractedText = await extractResumeText(resumeFile.path);
          console.log('[BG-Score] OCR done, chars:', extractedText?.length);
          const aiScore = await getAIScore(extractedText);
          console.log('[BG-Score] Groq score:', aiScore);
          await Registration.findByIdAndUpdate(registration._id, { extractedText, aiScore });
          console.log('[BG-Score] ✅ aiScore saved to DB:', aiScore);
        } catch (err) {
          console.error('[BG-Score] Error:', err.message);
        }
      });
    }

  } catch (error) {
    console.error('[registerWithResume] ❌', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: `Validation error: ${Object.keys(error.errors).join(', ')}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/registrations/:hackathonId
   Returns registrations sorted by aiScore desc (highest first).
───────────────────────────────────────────────────────────── */
const getRegistrations = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const registrations = await Registration.find({ hackathon: hackathonId }).sort({ aiScore: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/registrations/all
   Returns ALL registrations across all hackathons, sorted by aiScore.
───────────────────────────────────────────────────────────── */
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({}).sort({ aiScore: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/registrations/my-registrations
   Returns ONLY registrations for hackathons the logged-in organizer owns.
   Requires auth middleware so req.user.id is available.
───────────────────────────────────────────────────────────── */
const getMyRegistrations = async (req, res) => {
  try {
    // Find all hackathon IDs owned by this organizer
    const myHackathons = await Hackathon.find({ createdBy: req.user.id }).select('_id');
    const hackathonIds = myHackathons.map(h => h._id);

    if (!hackathonIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const registrations = await Registration
      .find({ hackathon: { $in: hackathonIds } })
      .sort({ aiScore: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/registrations/check/:hackathonId/:email
   Returns whether an email is already registered for a hackathon.
───────────────────────────────────────────────────────────── */
const checkRegistration = async (req, res) => {
  try {
    const { hackathonId, email } = req.params;
    const reg = await Registration.findOne({ hackathon: hackathonId, leaderEmail: email });
    res.status(200).json({ success: true, registered: !!reg, data: reg || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/shortlist/:id
   Organizer shortlists a registration.
───────────────────────────────────────────────────────────── */
const shortlistRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { shortlisted: true },
      { new: true }
    );
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    res.status(200).json({ success: true, message: 'Shortlisted!', data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rescoreRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Not found.' });
    if (!reg.resumeUrl) return res.status(400).json({ success: false, message: 'No resume on file.' });

    const filePath = require('path').join(__dirname, '..', reg.resumeUrl);
    res.json({ success: true, message: 'Re-scoring started in background.' });

    setImmediate(async () => {
      try {
        console.log('\n[Rescore] Starting OCR for:', reg._id);
        const extractedText = await extractResumeText(filePath);
        console.log('[Rescore] OCR chars:', extractedText?.length);
        const aiScore = await getAIScore(extractedText);
        console.log('[Rescore] Score:', aiScore);
        await Registration.findByIdAndUpdate(reg._id, { extractedText, aiScore });
        console.log('[Rescore] ✅ Done:', aiScore);
      } catch (err) { console.error('[Rescore] Error:', err.message); }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/send-emails/:hackathonId
   Sends HTML confirmation emails to all shortlisted teams.
───────────────────────────────────────────────────────────── */
const sendShortlistEmails = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Fetch shortlisted registrations + hackathon name in parallel
    const [shortlisted, hackathon] = await Promise.all([
      Registration.find({ hackathon: hackathonId, shortlisted: true }),
      Hackathon.findById(hackathonId).select('title organizerContact'),
    ]);

    if (!shortlisted.length) {
      return res.status(400).json({ success: false, message: 'No shortlisted teams found.' });
    }

    const hackathonName = hackathon?.title || 'the Hackathon';

    // Build and send each email
    await Promise.all(
      shortlisted.map(reg => {
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
            <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:32px 24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">🎉 Congratulations!</h1>
              <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px">You've been shortlisted!</p>
            </div>
            <div style="padding:32px 24px;background:#fff">
              <p style="font-size:15px;color:#374151;margin:0 0 16px">Dear <strong>${reg.leaderName}</strong>,</p>
              <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px">
                We are thrilled to inform you that your team <strong>&ldquo;${reg.teamName}&rdquo;</strong> has been
                <strong>shortlisted</strong> to participate in the <strong>Offline Round</strong> of
                <strong>${hackathonName}</strong>!
              </p>
              <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px">
                Your presentation score stood out among all submissions, and we can't wait to see your project in action.
              </p>
              <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px 20px;margin:20px 0">
                <p style="font-weight:700;color:#1e40af;margin:0 0 10px;font-size:13px">📋 WHAT'S NEXT</p>
                <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:2">
                  <li>Watch your email for venue details and the full schedule closer to the event date.</li>
                  <li>Ensure all your team members are available on the event day.</li>
                  <li>Bring a valid ID and this email as your entry confirmation.</li>
                  <li>Log in to the HackFlow portal to access your Live Event dashboard on event day.</li>
                </ul>
              </div>
              <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:16px 0 0">
                If you have any questions, feel free to reply to this email or reach us at
                <a href="mailto:hackflow453@gmail.com" style="color:#3b82f6">hackflow453@gmail.com</a>.
              </p>
              <p style="font-size:14px;color:#4b5563;margin:24px 0 0">See you at the event! 🚀</p>
              <p style="font-size:14px;color:#374151;margin:4px 0 0"><strong>Warm regards,</strong><br/>The HackFlow Team</p>
            </div>
            <div style="background:#f3f4f6;padding:16px 24px;text-align:center">
              <p style="font-size:11px;color:#9ca3af;margin:0">This email was sent by HackFlow · hackflow453@gmail.com</p>
            </div>
          </div>
        `;
        return sendEmail(
          reg.leaderEmail,
          `🎉 Shortlisted! – ${hackathonName} Offline Round`,
          html,
        );
      })
    );

    res.status(200).json({
      success: true,
      message: `Confirmation emails sent to ${shortlisted.length} team${shortlisted.length > 1 ? 's' : ''}.`,
      count: shortlisted.length,
    });
  } catch (error) {
    console.error('[sendShortlistEmails]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/publish/:hackathonId
   Marks hackathon results as published (unlocks LiveEvent for students).
───────────────────────────────────────────────────────────── */
const publishResults = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.hackathonId,
      { resultsPublished: true },
      { new: true }
    );
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }
    res.status(200).json({ success: true, message: 'Results published! Shortlisted students can now access the Live Event page.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTeam, registerWithResume, getRegistrations, getAllRegistrations, getMyRegistrations, checkRegistration, shortlistRegistration, deleteRegistration, rescoreRegistration, sendShortlistEmails, publishResults };
