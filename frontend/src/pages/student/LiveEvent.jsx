import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Utensils, DoorOpen, QrCode, Clock, CheckCircle2,
  Wifi, Battery, Coffee, Sparkles, Navigation, Users, Shield,
  ScanLine, CircleDot, HelpCircle, X, Send, Paperclip,
  Megaphone, Wrench, Ticket, MessageSquare, Loader2, AlertTriangle,
  Trophy, Timer, Gift, Star, PackageCheck, Zap, ChevronRight,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import EventQRScanner from '../../components/EventQRScanner';

const API_BASE = 'http://localhost:5000/api/live-event';

/* ═══════════ FALLBACK DATA (used when API is unavailable) ═══════════ */
const FALLBACK_EVENT = {
  studentId: 'STU102',
  studentName: 'Arjun Mehta',
  teamName: 'Code Crusaders',
  hackathonId: 'HACK501',
  hackathonName: 'AI Innovation Hackathon 2026',
  venue: 'Innovation Hall, IIT Bombay',
  date: 'March 15, 2026',
  time: '9:00 AM – 9:00 PM',
  workspaceNumber: 'A-12',
  workspaceLocation: 'Innovation Hall – Row 3, Seat 7',
  entryStatus: 'Not Entered',
  lunchStatus: 'Not Claimed',
  dinnerStatus: 'Not Claimed',
};

/* ═══════════ STATUS HELPERS ═══════════ */
const STATUS_CFG = {
  'Not Entered': { color: 'bg-gray-100 text-gray-500 ring-gray-200', dot: 'bg-gray-400', done: false },
  'Entered':     { color: 'bg-emerald-50 text-emerald-600 ring-emerald-200', dot: 'bg-emerald-500', done: true },
  'Not Claimed': { color: 'bg-amber-50 text-amber-600 ring-amber-200', dot: 'bg-amber-400', done: false },
  'Claimed':     { color: 'bg-emerald-50 text-emerald-600 ring-emerald-200', dot: 'bg-emerald-500', done: true },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Not Entered'];
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ring-1 ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </motion.span>
  );
}

/* ═══════════ CARD ANIMATION ═══════════ */
const cardUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ═══════════ TIMELINE CONVERTER (same logic as EventManagement.jsx) ═══════════ */
function convertDbTimeline(dbItems) {
  if (!dbItems || dbItems.length === 0) return [];
  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowMs    = now.getTime();

  return dbItems.map((item, i) => {
    let startMs = null;
    if (item.date && item.time) {
      const dt = new Date(`${item.date}T${item.time}`);
      if (!isNaN(dt.getTime())) startMs = dt.getTime();
    } else if (item.time) {
      const dt = new Date(`${todayStr}T${item.time}`);
      if (!isNaN(dt.getTime())) startMs = dt.getTime();
    }

    let status = 'upcoming';
    if (startMs !== null) {
      const next   = dbItems[i + 1];
      let nextMs   = null;
      if (next?.date && next?.time) {
        const nd = new Date(`${next.date}T${next.time}`);
        if (!isNaN(nd.getTime())) nextMs = nd.getTime();
      } else if (next?.time) {
        const nd = new Date(`${todayStr}T${next.time}`);
        if (!isNaN(nd.getTime())) nextMs = nd.getTime();
      }
      if (nextMs !== null && nowMs >= nextMs) status = 'done';
      else if (nowMs >= startMs) status = 'active';
    }

    // Format time display
    let displayTime = item.time || 'TBD';
    if (item.time && item.time.includes(':')) {
      const [hStr, mStr] = item.time.split(':');
      const h = parseInt(hStr, 10);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      displayTime = `${String(h12).padStart(2,'0')}:${mStr.padStart(2,'0')} ${suffix}`;
    }
    if (item.date) {
      const d = new Date(item.date + 'T00:00:00');
      const dateLabel = isNaN(d) ? item.date : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      displayTime = `${dateLabel} · ${displayTime}`;
    }
    return { id: item._id || i, time: displayTime, label: item.title, description: item.description, status };
  });
}

/* ═══════════ PROGRESS TRACKER ═══════════ */
function ProgressTracker({ entry, lunch, dinner }) {
  const steps = [
    { label: 'Entry Completed', done: STATUS_CFG[entry]?.done },
    { label: 'Lunch Collected', done: STATUS_CFG[lunch]?.done },
    { label: 'Dinner Collected', done: STATUS_CFG[dinner]?.done },
  ];
  const completed = steps.filter(s => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div>
      {/* Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-dark">Event Progress</span>
        <span className="text-xs font-bold text-royal">{pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-royal to-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              animate={step.done ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0
                ${step.done ? 'bg-emerald-500' : 'bg-gray-200 text-gray-400'}`}
            >
              {step.done ? <CheckCircle2 size={14} /> : i + 1}
            </motion.div>
            <span className={`text-[11px] font-semibold ${step.done ? 'text-emerald-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ SCAN STATUS ROW ═══════════ */
function ScanStatusRow({ icon: Icon, label, status, iconBg, onScan }) {
  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: 'rgba(30,58,138,0.02)' }}
      className="flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100"
      onClick={onScan}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-dark">{label}</p>
          <p className="text-[10px] text-gray-400">Tap to open camera scanner</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <StatusBadge status={status} />
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   GITHUB LINK CARD
   ═══════════════════════════════════════ */
function GithubLinkCard({ hackathonId, existingLink }) {
  const [link, setLink]       = useState(existingLink || '');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(!!existingLink);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    if (!link.trim()) { setError('Please enter your GitHub link.'); return; }
    if (!/^https?:\/\/.+/i.test(link.trim())) { setError('Enter a valid URL starting with http(s).'); return; }
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('hf_token');
      const res = await fetch('http://localhost:5000/api/registrations/github-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ hackathonId, githubLink: link.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setLink(data.githubLink);
      } else {
        setError(data.message || 'Failed to save. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark">GitHub Repository</h3>
          <p className="text-[10px] text-gray-400">Submit your project's GitHub link — visible to the organizer</p>
        </div>
        {saved && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 size={10} /> Submitted
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={link}
          onChange={e => { setLink(e.target.value); setSaved(false); setError(''); }}
          placeholder="https://github.com/your-username/your-project"
          className="flex-1 px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-700
                     placeholder:text-gray-400 font-mono"
        />
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold text-white
                     bg-gray-900 hover:bg-gray-800 shadow-md transition-all cursor-pointer
                     disabled:opacity-50 shrink-0"
        >
          {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Send size={13} /> Submit</>}
        </motion.button>
      </div>

      {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}

      {saved && link && (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors">
          <ChevronRight size={11} /> View submitted repo
        </a>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN LIVE EVENT PAGE
   ═══════════════════════════════════════ */
export default function LiveEvent() {
  const [event, setEvent] = useState(FALLBACK_EVENT);
  const [loading, setLoading] = useState(true);
  const [workspaceAssigning, setWorkspaceAssigning] = useState(false);
  // 'checking' | 'not_published' | 'not_shortlisted' | 'granted'
  const [accessState, setAccessState] = useState('checking');

  /* Feedback State */
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  /* Helper to get auth headers */
  const getHeaders = () => {
    const token = localStorage.getItem('hf_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const submitFeedback = async () => {
    if (feedbackRating < 1 || feedbackRating > 5) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          hackathonId: event.hackathonId,
          rating: feedbackRating,
        }),
      });
      if (res.ok) {
        setEvent(prev => ({ ...prev, feedbackSubmitted: true }));
      }
    } catch { /* ignore */ }
    setFeedbackSubmitting(false);
  };


  /* Fetch live event data + shortlist status on mount */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('hf_token');

        // Fetch live event data + student's shortlist status in parallel
        const [eventRes, statusRes] = await Promise.allSettled([
          fetch(`${API_BASE}/me`, { headers: getHeaders() }),
          fetch('http://localhost:5000/api/registrations/my-shortlist-status', { headers: getHeaders() }),
        ]);

        let merged = { ...FALLBACK_EVENT };

        if (eventRes.status === 'fulfilled' && eventRes.value.ok) {
          const data = await eventRes.value.json();
          merged = { ...merged, ...data };
        }

        // ── ACCESS GATE via my-shortlist-status ─────────────────────
        let grantedViaStatus = false;
        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          const statusData = await statusRes.value.json();
          if (statusData.success) {
            if (!statusData.published) {
              // Results not published for any hackathon this student joined
              setAccessState('not_published');
              setLoading(false);
              return;
            }
            if (statusData.shortlisted) {
              // Shortlisted + published → grant access
              if (statusData.hackathon?.title) merged.hackathonName = statusData.hackathon.title;
              if (statusData.registration?.teamName) merged.teamName = statusData.registration.teamName;
              setAccessState('granted');
              grantedViaStatus = true;
            } else {
              // Published but not shortlisted
              setAccessState('not_shortlisted');
              setLoading(false);
              return;
            }
          }
        }

        // Fallback: if the status endpoint wasn't available (no token / network error),
        // try the old hackathons/latest approach
        if (!grantedViaStatus) {
          let studentEmail = null;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            studentEmail = payload.email || payload.leaderEmail || null;
          } catch { /* ignore */ }

          try {
            const hackRes = await fetch('http://localhost:5000/api/hackathons/latest');
            if (hackRes.ok) {
              const hack = await hackRes.json();
              if (hack.title)         merged.hackathonName = hack.title;
              if (hack.organizerName) merged.organizerName = hack.organizerName;
              const hackId = hack._id || hack.id || null;
              const resultsPublished = hack.resultsPublished === true;

              if (!resultsPublished) {
                setAccessState('not_published');
                setLoading(false);
                return;
              }
              if (hackId && studentEmail) {
                const checkRes = await fetch(
                  `http://localhost:5000/api/registrations/check/${hackId}/${encodeURIComponent(studentEmail)}`
                );
                if (checkRes.ok) {
                  const checkData = await checkRes.json();
                  if (checkData.registered && checkData.data?.shortlisted) {
                    setAccessState('granted');
                  } else {
                    setAccessState('not_shortlisted');
                    setLoading(false);
                    return;
                  }
                } else {
                  setAccessState('granted');
                }
              } else {
                setAccessState('granted');
              }
            } else {
              setAccessState('granted'); // fail-open
            }
          } catch {
            setAccessState('granted'); // fail-open
          }
        }
        // ─────────────────────────────────────────────────────────────

        setEvent(merged);

        // Auto-assign workspace if not yet assigned
        if (!merged.workspaceNumber) {
          setWorkspaceAssigning(true);
          try {
            const wsRes = await fetch('http://localhost:5000/api/event/assign-workspace', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                studentId: merged.studentId,
                hackathonId: merged.hackathonId,
              }),
            });
            if (wsRes.ok) {
              const wsData = await wsRes.json();
              setEvent(prev => ({
                ...prev,
                workspaceNumber: wsData.workspaceNumber ?? prev.workspaceNumber,
                workspaceLocation: wsData.workspaceLocation ?? prev.workspaceLocation,
              }));
            }
          } catch {
            // silent — workspace will remain from fallback
          } finally {
            setWorkspaceAssigning(false);
          }
        }
      } catch {
        setAccessState('granted'); // fail-open on complete error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── Universal Scanner state ────────────────────────────────────── */
  const [scannerOpen, setScannerOpen] = useState(false);
  const [workspaceJustRevealed, setWorkspaceJustRevealed] = useState(false);

  /**
   * Called by EventQRScanner once the backend confirms a scan (success or duplicate).
   * Receives authoritative status values straight from the API response.
   */
  const handleScanSuccess = useCallback(({ action, entryStatus, lunchStatus, dinnerStatus, workspaceNumber, workspaceLocation }) => {
    setEvent(prev => {
      const next = {
        ...prev,
        entryStatus:  entryStatus  ?? (action === 'entry'  ? 'Entered' : prev.entryStatus),
        lunchStatus:  lunchStatus  ?? (action === 'lunch'  ? 'Claimed' : prev.lunchStatus),
        dinnerStatus: dinnerStatus ?? (action === 'dinner' ? 'Claimed' : prev.dinnerStatus),
      };
      // Update workspace details if returned by backend (entry scan response)
      if (workspaceNumber)   next.workspaceNumber   = workspaceNumber;
      if (workspaceLocation) next.workspaceLocation = workspaceLocation;
      return next;
    });
    // Pulse-highlight the workspace card when entry is freshly scanned
    if (action === 'entry') {
      setWorkspaceJustRevealed(true);
      setTimeout(() => setWorkspaceJustRevealed(false), 4000);
    }
  }, []);

  /* Simulate scans (fallback when no camera) */
  const simEntry  = () => setEvent(p => ({ ...p, entryStatus:  p.entryStatus  === 'Entered'   ? 'Not Entered' : 'Entered' }));
  const simLunch  = () => setEvent(p => ({ ...p, lunchStatus:  p.lunchStatus  === 'Claimed'   ? 'Not Claimed' : 'Claimed' }));
  const simDinner = () => setEvent(p => ({ ...p, dinnerStatus: p.dinnerStatus === 'Claimed'   ? 'Not Claimed' : 'Claimed' }));

  /* Help state */
  const [helpModal, setHelpModal] = useState(false);
  const [helpIssue, setHelpIssue] = useState('Workspace Issue');
  const [helpMsg, setHelpMsg] = useState('');
  const [helpFile, setHelpFile] = useState(null);
  const [helpSending, setHelpSending] = useState(false);
  const [helpRequests, setHelpRequests] = useState([]);

  /* Fetch help requests on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/help`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setHelpRequests(data);
        }
      } catch { /* fallback — empty */ }
    })();
  }, []);

  const submitHelp = async () => {
    setHelpSending(true);
    try {
      const res = await fetch(`${API_BASE}/help`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ issueType: helpIssue, message: helpMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpRequests(prev => [data, ...prev]);
      } else {
        setHelpRequests(prev => [{
          id: Date.now(), issue: helpIssue, message: helpMsg,
          cocomResolved: false, studentResolved: false, time: new Date().toISOString(),
        }, ...prev]);
      }
    } catch {
      setHelpRequests(prev => [{
        id: Date.now(), issue: helpIssue, message: helpMsg,
        cocomResolved: false, studentResolved: false, time: new Date().toISOString(),
      }, ...prev]);
    }
    setHelpSending(false);
    setHelpModal(false);
    setHelpMsg('');
    setHelpFile(null);
  };

  /* Confirm-resolve: student confirms after CoCom resolves */
  const [confirming, setConfirming] = useState(null);

  const confirmResolve = async (id) => {
    setConfirming(id);
    try {
      const res = await fetch(`${API_BASE}/help/${id}/student-resolve`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deleted) {
          setHelpRequests(prev => prev.filter(r => r.id !== id));
        } else {
          setHelpRequests(prev => prev.map(r =>
            r.id === id ? { ...r, studentResolved: true } : r
          ));
        }
      }
    } catch { /* silent */ }
    setConfirming(null);
  };

  /* ─── Chill Out Zone / Treasure Hunt state ──────────────────────── */
  const TREASURE_HUNT_QUESTIONS = [
    { q: 'Find the tallest plant or tree on this floor and take a photo next to it 🌿', timeMins: 7 },
    { q: 'Get a signature from 3 different hackathon volunteers on any piece of paper 📝', timeMins: 10 },
    { q: 'Find a team whose name starts with the letter \'A\' or \'B\' and get a selfie with them 🤝', timeMins: 8 },
    { q: 'Locate the nearest fire exit and photo it. Then name the color of the emergency sign 🛑', timeMins: 5 },
    { q: 'Count the total number of whiteboards or flip-charts in the venue and report the number 📊', timeMins: 8 },
    { q: 'Find a mentor badge wearer and ask them one technical question about their domain 💡', timeMins: 10 },
    { q: 'Locate the nearest water refill station and bring back a full water bottle to show CoCom 💧', timeMins: 6 },
    { q: 'Find a team hacking with Python AND another team hacking with JavaScript 🐍', timeMins: 9 },
    { q: 'Take a boomerang-style video near the event banner and show it to CoCom 📹', timeMins: 7 },
    { q: 'Find 2 organizers wearing the same color t-shirt and get a group photo 👕', timeMins: 8 },
    { q: 'Collect business cards (physical or digital) from 2 different sponsors \' booths 💼', timeMins: 10 },
    { q: 'Find the snack station and name 3 items currently available (show CoCom a photo) 🍰', timeMins: 5 },
  ];
  const [chillOpen, setChillOpen]               = useState(false);
  const [huntTask, setHuntTask]                 = useState(null);   // active task from backend
  const [huntLoading, setHuntLoading]           = useState(true);
  const [huntStarting, setHuntStarting]         = useState(false);
  const [huntTimer, setHuntTimer]               = useState(0);      // seconds remaining
  const [goodiesModal, setGoodiesModal]         = useState(null);   // reward text or null
  const [selectedQ, setSelectedQ]               = useState(null);   // chosen question index

  /* Fetch current treasure-hunt status on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/gamification/status`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.task) setHuntTask(data.task);
        }
      } catch { /* silent */ } finally { setHuntLoading(false); }
    })();
  }, []);

  /* Countdown timer for active task */
  useEffect(() => {
    if (!huntTask || huntTask.status !== 'in_progress') return;
    const computeRemaining = () => {
      const elapsedMs = Date.now() - new Date(huntTask.startTime).getTime();
      return Math.max(0, Math.round((huntTask.timeLimitMinutes * 60 * 1000 - elapsedMs) / 1000));
    };
    setHuntTimer(computeRemaining());
    const id = setInterval(() => setHuntTimer(computeRemaining()), 1000);
    return () => clearInterval(id);
  }, [huntTask]);

  /* Poll task status every 8 sec to catch CoComm acceptance */
  useEffect(() => {
    if (!huntTask || huntTask.status !== 'in_progress') return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/gamification/status`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.task?.status === 'completed' && huntTask.status !== 'completed') {
            setHuntTask(data.task);
            setGoodiesModal(data.task.goodiesReward);
          } else if (data.task?.status === 'expired') {
            setHuntTask(data.task);
          }
        }
      } catch { /* silent */ }
    }, 8000);
    return () => clearInterval(id);
  }, [huntTask]);

  const startHunt = async (qIdx) => {
    const q = TREASURE_HUNT_QUESTIONS[qIdx];
    setHuntStarting(true);
    try {
      const res = await fetch(`${API_BASE}/gamification/start`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          questionText:     q.q,
          questionIndex:    qIdx,
          timeLimitMinutes: q.timeMins,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHuntTask(data.task);
      } else {
        // Fallback: create a local task so UI still works
        setHuntTask({
          _id: 'local-' + Date.now(),
          questionText:     q.q,
          questionIndex:    qIdx,
          timeLimitMinutes: q.timeMins,
          startTime:        new Date().toISOString(),
          status:           'in_progress',
          goodiesReward:    null,
        });
      }
    } catch {
      setHuntTask({
        _id: 'local-' + Date.now(),
        questionText:     q.q,
        questionIndex:    qIdx,
        timeLimitMinutes: q.timeMins,
        startTime:        new Date().toISOString(),
        status:           'in_progress',
        goodiesReward:    null,
      });
    }
    setHuntStarting(false);
    setChillOpen(true);
  };

  const fmtTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <StudentNavbar />

      {/* ── ACCESS GATE SCREENS ── */}
      {accessState === 'not_published' && (
        <main className="max-w-lg mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 mx-auto">
              <Clock size={28} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-extrabold text-dark mb-2">Results Not Published Yet</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              The organizer hasn't published the shortlist results yet.
              Check back later — you'll receive a confirmation email if your team is selected!
            </p>
          </motion.div>
        </main>
      )}

      {accessState === 'not_shortlisted' && (
        <main className="max-w-lg mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5 mx-auto">
              <Shield size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-extrabold text-dark mb-2">Not Shortlisted</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Unfortunately your team was not selected for the offline round this time.
              Thank you for participating — keep building and try again next time! 🚀
            </p>
          </motion.div>
        </main>
      )}

      {/* ── FULL LIVE EVENT PAGE (only for shortlisted / granted) ── */}
      {(accessState === 'granted' || accessState === 'checking') && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-royal/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-royal" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  Hackathon Live Event
                </h1>
              </div>
              <p className="text-sm text-gray-500 ml-[52px]">
                Track your event participation, workspace allocation and meal access.
              </p>
              <div className="ml-[52px] mt-3 w-16 h-1 rounded-full bg-royal" />
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-royal/10 text-royal text-xs
                         font-bold rounded-full ring-1 ring-royal/20 self-start sm:self-auto"
            >
              <CheckCircle2 size={14} /> Offline Round Participant
            </motion.span>
          </div>
        </motion.div>

        {/* ── Event Info Bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8
                     flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal to-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-sm">AI</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-dark truncate">{event.hackathonName}</h2>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} /> {event.venue}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-gray-500 font-medium shrink-0">
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-400" /> {event.date}</span>
            <span className="flex items-center gap-1.5"><Wifi size={12} className="text-gray-400" /> {event.time}</span>
          </div>
        </motion.div>

        {/* ── Post-Hackathon Feedback ── */}
        {event.hackathonStatus === 'completed' && !event.feedbackSubmitted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-extrabold text-amber-900 flex items-center gap-2 mb-1">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                Rate Your Experience
              </h3>
              <p className="text-xs text-amber-700 font-medium">
                The hackathon has ended! How was your experience with the organizers? Your feedback gives them loyalty points!
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 cursor-pointer p-1"
                  >
                    <Star size={28} className={feedbackRating >= star ? 'text-amber-500 fill-amber-500' : 'text-amber-200 fill-amber-50'} />
                  </button>
                ))}
              </div>
              <button
                onClick={submitFeedback}
                disabled={feedbackRating === 0 || feedbackSubmitting}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all hover:shadow-lg cursor-pointer"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </motion.div>
        )}
        {event.hackathonStatus === 'completed' && event.feedbackSubmitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 justify-center"
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <p className="text-sm font-bold text-emerald-800">Thank you for submitting your feedback!</p>
          </motion.div>
        )}

        {/* ═══════ UNIVERSAL QR SCANNER SECTION ═══════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <ScanLine size={18} className="text-royal" />
            <h2 className="text-lg font-extrabold text-dark">Event Access</h2>
          </div>
          <p className="text-xs text-gray-400 ml-[26px] mb-5">
            Use the scanner at Entry, Lunch, and Dinner counters — one scanner handles everything.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Universal Scan CTA Card ── */}
            <motion.div
              custom={0} variants={cardUp} initial="hidden" animate="visible"
              className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-md p-6 relative overflow-hidden flex flex-col items-center justify-center gap-5"
            >
              {/* Decorative blobs */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-royal/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

              {/* Animated scanner icon */}
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-gray-900 relative overflow-hidden flex items-center justify-center">
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-royal rounded-tl-md" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-royal rounded-tr-md" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-royal rounded-bl-md" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-royal rounded-br-md" />
                  {/* Scan line animation */}
                  <motion.div
                    className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-royal to-transparent"
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <QrCode size={32} className="text-royal/40" />
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-royal/30"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-dark">Universal QR Scanner</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Entry • Lunch • Dinner — one scan</p>
              </div>

              {/* THE single scan button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 12px 35px rgba(30,58,138,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setScannerOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-bold text-white
                           bg-gradient-to-r from-royal to-blue-500 rounded-xl shadow-lg shadow-royal/25
                           hover:shadow-xl transition-all cursor-pointer"
              >
                <QrCode size={17} />
                Scan QR Code
              </motion.button>

              {/* Status chips */}
              <div className="w-full flex flex-col gap-1.5">
                {[
                  { icon: DoorOpen, label: 'Entry', status: event.entryStatus, color: 'text-blue-500' },
                  { icon: Coffee,   label: 'Lunch',  status: event.lunchStatus,  color: 'text-amber-500' },
                  { icon: Utensils, label: 'Dinner', status: event.dinnerStatus, color: 'text-violet-500' },
                ].map(({ icon: I, label, status, color }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <I size={12} className={color} />
                      <span className="text-[11px] font-semibold text-gray-600">{label}</span>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Scan Status Tracking + Progress (spans 2 cols) ── */}
            <motion.div
              custom={1} variants={cardUp} initial="hidden" animate="visible"
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col"
            >
              <h3 className="text-sm font-bold text-dark mb-1">Scan Status Tracking</h3>
              <p className="text-[10px] text-gray-400 mb-4">Click any row to open the QR scanner &amp; mark your status</p>

              <div className="space-y-1 flex-1">
                <ScanStatusRow
                  icon={DoorOpen} label="Gate Entry" status={event.entryStatus}
                  iconBg="bg-gradient-to-br from-blue-500 to-royal"
                  onScan={() => setScannerOpen(true)}
                />
                <div className="h-px bg-gray-50 mx-4" />
                <ScanStatusRow
                  icon={Coffee} label="Lunch" status={event.lunchStatus}
                  iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
                  onScan={() => setScannerOpen(true)}
                />
                <div className="h-px bg-gray-50 mx-4" />
                <ScanStatusRow
                  icon={Utensils} label="Dinner" status={event.dinnerStatus}
                  iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                  onScan={() => setScannerOpen(true)}
                />
              </div>

              {/* Progress tracker */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <ProgressTracker
                  entry={event.entryStatus}
                  lunch={event.lunchStatus}
                  dinner={event.dinnerStatus}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Workspace + Amenities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

          {/* Workspace Card */}
          <motion.div custom={3} variants={cardUp} initial="hidden" animate="visible"
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className={`bg-white rounded-2xl border p-6 shadow-md transition-all ${
              workspaceJustRevealed
                ? 'border-emerald-300 ring-2 ring-emerald-200 shadow-emerald-100'
                : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <Navigation size={18} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-dark">Your Workspace</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Workspace Number</p>
                  {workspaceAssigning ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-9 w-24 rounded-lg bg-gray-200"
                      />
                      <span className="text-xs text-gray-400 font-medium">Assigning…</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-extrabold text-royal tracking-tight">
                      {event.workspaceNumber || '—'}
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-royal/10 flex items-center justify-center">
                  <MapPin size={24} className="text-royal" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: MapPin,  text: event.workspaceLocation },
                  { icon: Users,   text: 'Team seating — bring your team badge' },
                  { icon: Battery, text: 'Power outlets available at desk' },
                  { icon: Wifi,    text: 'WiFi: HackFlow_Event (password at check-in)' },
                ].map(({ icon: I, text }, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <I size={14} className="text-gray-400 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Event Timeline Card */}
          <motion.div custom={4} variants={cardUp} initial="hidden" animate="visible"
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal to-indigo-500 flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">Event Schedule</h3>
                <p className="text-[10px] text-gray-400">Live timeline set by the organizer</p>
              </div>
            </div>

            {(() => {
              const tl = convertDbTimeline(event.timeline || []);
              if (tl.length === 0) return (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                    <Clock size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400">Schedule not set yet</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">The organizer hasn't published a timeline</p>
                </div>
              );
              return (
                <div className="space-y-0">
                  {tl.map((t, idx) => {
                    const done   = t.status === 'done';
                    const active = t.status === 'active';
                    return (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.06 }}
                        className={`flex items-start gap-3 relative group ${
                          active ? '' : 'hover:bg-gray-50/50'
                        } rounded-lg transition-colors`}
                      >
                        {idx < tl.length - 1 && <div className="absolute left-[15px] top-8 w-px h-full bg-gray-100" />}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all
                          ${ done   ? 'bg-emerald-500 text-white'
                           : active ? 'bg-royal text-white shadow-md shadow-royal/25 ring-4 ring-royal/10'
                           :          'bg-gray-100 text-gray-400 group-hover:bg-royal/10 group-hover:text-royal'}`}>
                          {done ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        </div>
                        <div className="pb-4 pt-1 flex-1">
                          <p className={`text-[10px] font-bold ${
                            done ? 'text-emerald-500' : active ? 'text-royal' : 'text-gray-400'
                          }`}>{t.time}</p>
                          <p className={`text-xs font-semibold ${
                            done ? 'text-gray-400 line-through' : active ? 'text-dark' : 'text-gray-500'
                          }`}>{t.label}</p>
                          {t.description && <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{t.description}</p>}
                          {active && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-royal bg-royal/8 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-royal animate-pulse" /> LIVE NOW
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        </div>

        {/* ── Help & Support Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

          {/* Help Card */}
          <motion.div custom={5} variants={cardUp} initial="hidden" animate="visible"
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
                <HelpCircle size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">Help & Support</h3>
                <p className="text-[10px] text-gray-400">Need assistance? Request help from organizers</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Having a workspace problem, technical issue, or food coupon trouble?
              Send a help request and our event team will assist you.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setHelpModal(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white
                         bg-gradient-to-r from-royal to-blue-500 rounded-xl shadow-lg shadow-royal/25
                         hover:shadow-xl hover:shadow-royal/30 transition-all cursor-pointer"
            >
              <HelpCircle size={16} /> Request Help
            </motion.button>
          </motion.div>

          {/* Help Requests History */}
          <motion.div custom={6} variants={cardUp} initial="hidden" animate="visible"
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md"
          >
            <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-gray-400" /> Your Help Requests
            </h3>

          {helpRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={20} className="text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-400">No help requests yet</p>
              <p className="text-[10px] text-gray-300 mt-0.5">Everything running smoothly!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {helpRequests.map(req => {
                const resolved = req.cocomResolved;
                return (
                  <motion.div key={req.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-3.5 border ${
                      resolved ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-dark">{req.issue}</span>
                      <motion.span
                        key={resolved ? 'resolved' : 'pending'}
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ring-1 ${
                          resolved
                            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                            : 'bg-amber-50 text-amber-600 ring-amber-200'
                        }`}
                      >
                        {resolved ? 'Resolved by CoCom ✓' : 'Pending'}
                      </motion.span>
                    </div>
                    {req.message && <p className="text-[11px] text-gray-500 mb-2">{req.message}</p>}
                    <p className="text-[9px] text-gray-400 mb-2">Submitted at {new Date(req.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {resolved && !req.studentResolved && (
                      <button
                        onClick={() => confirmResolve(req.id)}
                        disabled={confirming === req.id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                          bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600
                          transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {confirming === req.id
                          ? <><Loader2 size={12} className="animate-spin" /> Confirming...</>
                          : <><CheckCircle2 size={12} /> Confirm Resolved</>}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
          </motion.div>
        </div>

        {/* ── Chill Out Zone / Treasure Hunt ── */}
        <motion.div custom={8} variants={cardUp} initial="hidden" animate="visible" className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={18} className="text-violet-500" />
            <h2 className="text-lg font-extrabold text-dark">Chill Out Zone 🎮</h2>
          </div>
          <p className="text-xs text-gray-400 ml-[26px] mb-5">
            Take a break and join the Treasure Hunt challenge — complete tasks, impress CoCom, and win goodies!
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">

            {/* Loading state */}
            {huntLoading ? (
              <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 className="animate-spin text-royal" size={20} />
                <p className="text-sm text-gray-400">Loading challenge status…</p>
              </div>
            ) : !huntTask ? (
              /* ── No active task — pick a challenge ── */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-dark">Pick a Challenge</p>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                    {TREASURE_HUNT_QUESTIONS.length} tasks available
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {TREASURE_HUNT_QUESTIONS.map((q, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedQ(selectedQ === idx ? null : idx)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedQ === idx
                          ? 'border-violet-400 bg-violet-50'
                          : 'border-gray-100 hover:border-violet-200 bg-gray-50/70'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Trophy size={14} className={`shrink-0 mt-0.5 ${selectedQ === idx ? 'text-violet-500' : 'text-gray-300'}`} />
                        <p className="text-xs text-gray-700 leading-relaxed flex-1">{q.q}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Timer size={11} className="text-gray-400" />
                        <span className="text-[10px] font-semibold text-gray-400">{q.timeMins} min limit</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Start button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={selectedQ === null || huntStarting}
                  onClick={() => startHunt(selectedQ)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white
                             bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25
                             disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {huntStarting
                    ? <><Loader2 size={15} className="animate-spin" /> Starting…</>
                    : <><Zap size={15} /> Start Challenge</>
                  }
                </motion.button>
              </div>

            ) : huntTask.status === 'in_progress' ? (
              /* ── Active challenge in progress ── */
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Timer size={28} className="text-violet-500" />
                </div>
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">Challenge In Progress</p>
                <p className="text-sm font-bold text-dark leading-snug mb-5 max-w-sm mx-auto">{huntTask.questionText}</p>

                {/* Countdown timer */}
                <motion.div
                  animate={huntTimer < 60 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl mb-6 text-3xl font-black font-mono tracking-widest ${
                    huntTimer < 60 ? 'bg-red-50 text-red-500' : 'bg-violet-50 text-violet-600'
                  }`}
                >
                  <Timer size={22} />
                  {fmtTimer(huntTimer)}
                </motion.div>

                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Complete the task and show proof to a CoCom member to get it verified. They'll mark it as accepted!
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <PackageCheck size={14} /> Waiting for CoCom verification…
                </div>
              </div>

            ) : huntTask.status === 'completed' ? (
              /* ── Completed ── */
              <div className="text-center py-6">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy size={38} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-dark mb-1">Challenge Completed! 🎉</h3>
                <p className="text-sm text-gray-500 mb-4">CoCom has verified your task. Your reward is on its way!</p>
                {huntTask.goodiesReward && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 max-w-xs mx-auto">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Prize</p>
                    <p className="text-base font-extrabold text-dark">{huntTask.goodiesReward}</p>
                  </div>
                )}
              </div>

            ) : (
              /* ── Expired ── */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={28} className="text-red-400" />
                </div>
                <h3 className="text-base font-extrabold text-dark mb-1">Time's Up!</h3>
                <p className="text-sm text-gray-500 mb-5">Your challenge expired. Pick a new one!</p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setHuntTask(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-md cursor-pointer"
                >
                  Try Another Challenge
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── GitHub Repository Link ── */}
        <GithubLinkCard hackathonId={event.hackathonId} existingLink={event.githubLink} />

        {/* ── Quick Tips ── */}
        <motion.div custom={7} variants={cardUp} initial="hidden" animate="visible"
          className="bg-gradient-to-r from-royal/5 to-blue-50 rounded-2xl border border-royal/10 p-6"
        >
          <h3 className="font-bold text-dark text-sm mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-royal" /> Quick Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              'Arrive 30 minutes early for a smooth check-in',
              'Scan the QR placed at Entry, Lunch, and Dinner counters',
              'One universal scanner handles all check-ins automatically',
              'Submit your project before the deadline timer ends',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 size={14} className="text-royal shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>


      </main>
      )}


      {/* ═══════ HELP REQUEST MODAL ═══════ */}
      <AnimatePresence>
        {helpModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !helpSending && setHelpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <HelpCircle size={16} className="text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark">Request Help</h3>
                    <p className="text-[10px] text-gray-400">Our team will respond ASAP</p>
                  </div>
                </div>
                <button onClick={() => setHelpModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Issue Type */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Issue Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'Workspace Issue', icon: Wrench,        color: 'text-blue-500' },
                      { value: 'Technical Issue', icon: AlertTriangle,  color: 'text-amber-500' },
                      { value: 'Food Coupon Issue', icon: Ticket,       color: 'text-emerald-500' },
                      { value: 'Other',             icon: MessageSquare, color: 'text-gray-500' },
                    ].map(({ value, icon: I, color }) => (
                      <button key={value} onClick={() => setHelpIssue(value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer
                          ${helpIssue === value
                            ? 'bg-royal/10 text-royal ring-1 ring-royal/20'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        <I size={14} className={helpIssue === value ? 'text-royal' : color} />
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Message</label>
                  <textarea
                    value={helpMsg} onChange={e => setHelpMsg(e.target.value)}
                    placeholder="Describe your issue..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white
                               focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal/40
                               placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Attachment (optional)</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-200
                                    bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Paperclip size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {helpFile ? helpFile.name : 'Add screenshot or file'}
                    </span>
                    <input type="file" className="hidden" onChange={e => setHelpFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setHelpModal(false)} disabled={helpSending}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={submitHelp}
                  disabled={helpSending}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white
                             bg-gradient-to-r from-royal to-blue-500 rounded-lg shadow-md shadow-royal/25
                             transition-all cursor-pointer disabled:opacity-60"
                >
                  {helpSending ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : <><Send size={13} /> Send Request</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ UNIVERSAL QR SCANNER MODAL ═══════ */}
      <AnimatePresence>
        {scannerOpen && (
          <EventQRScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setScannerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══════ GOODIES NOTIFICATION MODAL ═══════ */}
      <AnimatePresence>
        {goodiesModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setGoodiesModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Confetti header */}
              <div className="bg-gradient-to-br from-violet-600 to-purple-800 px-6 pt-8 pb-6 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1.05, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: 2 }}
                  className="w-20 h-20 rounded-2xl bg-yellow-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/30"
                >
                  <Gift size={38} className="text-violet-700" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-white mb-1">🎉 You&apos;ve Won!</h3>
                <p className="text-purple-200 text-sm">Your treasure hunt was verified by CoCom!</p>
              </div>

              {/* Reward */}
              <div className="px-6 py-6">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 p-5 mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Prize</p>
                  <p className="text-lg font-extrabold text-dark leading-snug">{goodiesModal}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Goodies will be delivered to you in a few days. Congratulations on completing the campus challenge! 🏆
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setGoodiesModal(null)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Awesome, Thanks! 🙌
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
