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
   GET /api/registrations/my-shortlist-status
   Returns shortlist status for the logged-in student across all
   published hackathons they registered for (as leader OR member).
───────────────────────────────────────────────────────────── */
const getMyShortlistStatus = async (req, res) => {
  try {
    const email = (req.user?.email || '').toLowerCase().trim();
    if (!email) return res.status(401).json({ success: false, message: 'Not authenticated' });

    // Find registrations where this student is leader
    const asLeader = await Registration.find({
      leaderEmail: { $regex: new RegExp(`^${email}$`, 'i') },
    }).populate('hackathon', 'title slug resultsPublished').lean();

    // Find registrations where this student is a team member
    const asMember = await Registration.find({
      'teamMembers.email': { $regex: new RegExp(`^${email}$`, 'i') },
    }).populate('hackathon', 'title slug resultsPublished').lean();

    // Also check via Team model (for members joined via code)
    let asTeamModelMember = [];
    const User   = require('../models/User');
    const { Team } = require('../models/Team');
    const userDoc = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('_id').lean();
    if (userDoc) {
      const teamDocs = await Team.find({ members: userDoc._id }).lean();
      for (const t of teamDocs) {
        const reg = await Registration.findOne({
          hackathon: t.hackathonId,
          leaderEmail: { $regex: new RegExp(`^${t.leaderEmail}$`, 'i') },
        }).populate('hackathon', 'title slug resultsPublished').lean();
        if (reg) asTeamModelMember.push(reg);
      }
    }

    // Merge all, deduplicate by _id
    const allRegs = [...asLeader, ...asMember, ...asTeamModelMember];
    const seen = new Set();
    const unique = allRegs.filter(r => {
      const id = r._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Find any published + shortlisted registration
    const shortlistedPublished = unique.find(
      r => r.shortlisted && r.hackathon?.resultsPublished === true
    );

    if (shortlistedPublished) {
      return res.json({
        success: true,
        shortlisted: true,
        published: true,
        hackathon: shortlistedPublished.hackathon,
        registration: { teamName: shortlistedPublished.teamName, _id: shortlistedPublished._id },
      });
    }

    // Check if any hackathon published results but student not shortlisted
    const publishedButNotShortlisted = unique.find(r => r.hackathon?.resultsPublished === true && !r.shortlisted);
    if (publishedButNotShortlisted) {
      return res.json({ success: true, shortlisted: false, published: true });
    }

    // No published results yet
    return res.json({ success: true, shortlisted: false, published: false });
  } catch (error) {
    console.error('[getMyShortlistStatus]', error.message);
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
    const decodedEmail = decodeURIComponent(email).toLowerCase().trim();

    // Check if this email is a team leader for this hackathon
    let reg = await Registration.findOne({
      hackathon: hackathonId,
      leaderEmail: { $regex: new RegExp(`^${decodedEmail}$`, 'i') },
    });

    // If not a leader, check if they are a team member
    if (!reg) {
      reg = await Registration.findOne({
        hackathon: hackathonId,
        'teamMembers.email': { $regex: new RegExp(`^${decodedEmail}$`, 'i') },
      });
    }

    // Also cross-reference Team model for members joined via code (may not be in Registration.teamMembers yet)
    if (!reg) {
      const { Team } = require('../models/Team');
      const User = require('../models/User');
      // Find the User document for this email
      const userDoc = await User.findOne({ email: { $regex: new RegExp(`^${decodedEmail}$`, 'i') } }).select('_id').lean();
      if (userDoc) {
        // Find a team (for this hackathon) where this user is a member
        const teamDoc = await Team.findOne({ hackathonId, members: userDoc._id }).lean();
        if (teamDoc?.leaderEmail) {
          reg = await Registration.findOne({
            hackathon: hackathonId,
            leaderEmail: { $regex: new RegExp(`^${teamDoc.leaderEmail}$`, 'i') },
          });
        }
      }
    }

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
    const id = req.params.hackathonId;

    // Resolve hackathon by ObjectId OR slug
    let hackathon = null;
    if (id.match(/^[a-f\d]{24}$/i)) hackathon = await Hackathon.findById(id).select('title organizerContact _id');
    if (!hackathon) hackathon = await Hackathon.findOne({ slug: id }).select('title organizerContact _id').lean();
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

    const shortlisted = await Registration.find({ hackathon: hackathon._id, shortlisted: true });
    if (!shortlisted.length) {
      return res.status(400).json({ success: false, message: 'No shortlisted teams found.' });
    }

    const hackathonName = hackathon.title || 'the Hackathon';

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
   Also creates / upserts LiveEvent records for every shortlisted student
   (leader + team members) so they have real event data right away.
───────────────────────────────────────────────────────────── */
const publishResults = async (req, res) => {
  try {
    const id = req.params.hackathonId;

    // Resolve hackathon by ObjectId OR slug
    let hackathon = null;
    if (id.match(/^[a-f\d]{24}$/i)) hackathon = await Hackathon.findByIdAndUpdate(id, { resultsPublished: true }, { new: true });
    if (!hackathon) {
      const found = await Hackathon.findOne({ slug: id });
      if (found) hackathon = await Hackathon.findByIdAndUpdate(found._id, { resultsPublished: true }, { new: true });
    }
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    // ── Provision LiveEvent records for every shortlisted student ──────────
    (async () => {
      try {
        const LiveEvent = require('../models/LiveEvent');
        const User      = require('../models/User');
        const crypto    = require('crypto');

        const shortlistedRegs = await Registration.find({
          hackathon:   hackathon._id,
          shortlisted: true,
        }).lean();

        // Build a list of { userId, teamName } for leaders + all team members
        const participantPairs = [];

        for (const reg of shortlistedRegs) {
          // Leader
          const leaderUser = await User.findOne({
            email: { $regex: new RegExp(`^${reg.leaderEmail.trim()}$`, 'i') },
          }).select('_id').lean();
          if (leaderUser) {
            participantPairs.push({ userId: leaderUser._id, teamName: reg.teamName });
          }

          // Members stored directly on the registration document
          for (const member of (reg.teamMembers || [])) {
            if (!member.email?.trim()) continue;
            const memberUser = await User.findOne({
              email: { $regex: new RegExp(`^${member.email.trim()}$`, 'i') },
            }).select('_id').lean();
            if (memberUser) {
              participantPairs.push({ userId: memberUser._id, teamName: reg.teamName });
            }
          }

          // Members who joined via team code (Team model)
          try {
            const { Team } = require('../models/Team');
            const teamDocs = await Team.find({
              hackathonId:  hackathon._id,
              leaderEmail:  { $regex: new RegExp(`^${reg.leaderEmail.trim()}$`, 'i') },
            }).populate('members', '_id').lean();
            for (const teamDoc of teamDocs) {
              for (const member of (teamDoc.members || [])) {
                participantPairs.push({ userId: member._id, teamName: reg.teamName });
              }
            }
          } catch (_) { /* Team model unused — skip */ }
        }

        // Deduplicate by userId string
        const seen = new Set();
        const unique = participantPairs.filter(p => {
          const key = p.userId.toString();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Upsert one LiveEvent per unique student (idempotent — safe to re-publish)
        for (const { userId, teamName } of unique) {
          await LiveEvent.findOneAndUpdate(
            { student: userId, hackathon: hackathon._id },
            {
              $setOnInsert: {
                student:       userId,
                hackathon:     hackathon._id,
                isShortlisted: true,
                teamName,
                entryQR:       crypto.randomUUID(),
                mealsQR:       crypto.randomUUID(),
              },
            },
            { upsert: true, new: true }
          );
        }

        console.log(`[publishResults] Provisioned LiveEvent records for ${unique.length} participant(s).`);
      } catch (err) {
        console.error('[publishResults] LiveEvent upsert error:', err.message);
      }
    })();

    res.status(200).json({
      success: true,
      message: 'Results published! Shortlisted students can now access the Live Event page.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/registrations/github-link
   Student submits their GitHub repo link.
   Finds the registration by the student's email (leader OR member)
   and the provided hackathonId, then saves the link.
───────────────────────────────────────────────────────────── */
const saveGithubLink = async (req, res) => {
  try {
    const userEmail  = req.user?.email;
    const { hackathonId, githubLink } = req.body;

    if (!userEmail)   return res.status(401).json({ success: false, message: 'Not authenticated.' });
    if (!hackathonId) return res.status(400).json({ success: false, message: 'hackathonId is required.' });
    if (!githubLink)  return res.status(400).json({ success: false, message: 'githubLink is required.' });

    // Simple URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(githubLink.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL starting with http(s).' });
    }

    // Resolve hackathon ID or slug
    let hackathon = null;
    if (hackathonId.match(/^[a-f\d]{24}$/i)) {
      hackathon = await Hackathon.findById(hackathonId);
    }
    if (!hackathon) {
      hackathon = await Hackathon.findOne({ slug: hackathonId });
    }
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

    // Find registration where this user is the leader
    let reg = await Registration.findOne({
      hackathon:   hackathon._id,
      leaderEmail: { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') },
    });

    // Fallback: search as a team member
    if (!reg) {
      reg = await Registration.findOne({
        hackathon:              hackathon._id,
        'teamMembers.email':    { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') },
      });
    }

    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found for this hackathon.' });

    reg.githubLink = githubLink.trim();
    await reg.save();

    res.json({ success: true, message: 'GitHub link saved!', githubLink: reg.githubLink });
  } catch (err) {
    console.error('[saveGithubLink]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerTeam, registerWithResume, getRegistrations, getAllRegistrations, getMyRegistrations, checkRegistration, getMyShortlistStatus, shortlistRegistration, deleteRegistration, rescoreRegistration, sendShortlistEmails, publishResults, saveGithubLink };

