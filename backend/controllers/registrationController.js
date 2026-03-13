const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const path = require('path');
const { extractResumeText, getAIScore } = require('../services/ai_service/resume_extractor');

/* ─────────────────────────────────────────────────────────────
   POST /api/registrations/
   Simple team registration (no file upload)
───────────────────────────────────────────────────────────── */
const registerTeam = async (req, res) => {
  try {
    const { hackathonId, teamName, leaderName, leaderEmail, college, teamMembers } = req.body;
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
    });
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
    const { hackathonId, teamName, leaderName, leaderEmail, college, teamMembers } = req.body;

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
    });
    console.log('[registerWithResume] ✅ Saved instantly! ID:', registration._id);

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

module.exports = { registerTeam, registerWithResume, getRegistrations, getAllRegistrations, checkRegistration, shortlistRegistration, deleteRegistration, rescoreRegistration };
