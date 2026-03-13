import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Utensils, DoorOpen, QrCode, Clock, CheckCircle2,
  Wifi, Battery, Coffee, Sparkles, Navigation, Users, Shield,
  ScanLine, CircleDot, HelpCircle, X, Send, Paperclip,
  Megaphone, Wrench, Ticket, MessageSquare, Loader2, AlertTriangle,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import { Html5Qrcode } from 'html5-qrcode';

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
  entryQR: '',
  mealsQR: '',
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
function ScanStatusRow({ icon: Icon, label, status, iconBg, onSimulate }) {
  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: 'rgba(30,58,138,0.02)' }}
      className="flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100"
      onClick={onSimulate}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-dark">{label}</p>
          <p className="text-[10px] text-gray-400">Tap to simulate scan</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <StatusBadge status={status} />
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN LIVE EVENT PAGE
   ═══════════════════════════════════════ */
export default function LiveEvent() {
  const [event, setEvent] = useState(FALLBACK_EVENT);
  const [loading, setLoading] = useState(true);

  /* Helper to get auth headers */
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /* Fetch live event data on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch {
        // API unavailable — keep fallback data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Scanner state */
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerType, setScannerType] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const openScanner = useCallback((type) => {
    setScannerType(type);
    setScanResult(null);
    setScanError(null);
    setScannerOpen(true);
  }, []);

  const closeScanner = useCallback(async () => {
    try {
      if (html5QrRef.current) {
        const state = html5QrRef.current.getState();
        if (state === 2) await html5QrRef.current.stop();
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    } catch { /* ignore */ }
    setScannerOpen(false);
    setScannerType(null);
  }, []);

  /* Start scanner when modal opens */
  useEffect(() => {
    if (!scannerOpen || !scannerRef.current) return;

    const scannerId = 'qr-scanner-region';
    const html5Qr = new Html5Qrcode(scannerId);
    html5QrRef.current = html5Qr;

    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        setScanResult(decodedText);
        if (scannerType === 'entry') {
          setEvent(p => ({ ...p, entryStatus: 'Entered' }));
        } else if (scannerType === 'meals') {
          setEvent(p => ({ ...p, lunchStatus: 'Claimed', dinnerStatus: 'Claimed' }));
        }
        setTimeout(() => closeScanner(), 1500);
      },
      () => {}
    ).catch((err) => {
      setScanError('Camera access denied or unavailable. Please allow camera permissions.');
      console.error('Scanner start error:', err);
    });

    return () => {
      html5Qr.stop().catch(() => {});
      html5Qr.clear();
    };
  }, [scannerOpen, scannerType, closeScanner]);

  /* Simulate scans (fallback for no camera) */
  const simEntry = () => setEvent(p => ({ ...p, entryStatus: p.entryStatus === 'Entered' ? 'Not Entered' : 'Entered' }));
  const simLunch = () => setEvent(p => ({ ...p, lunchStatus: p.lunchStatus === 'Claimed' ? 'Not Claimed' : 'Claimed' }));
  const simDinner = () => setEvent(p => ({ ...p, dinnerStatus: p.dinnerStatus === 'Claimed' ? 'Not Claimed' : 'Claimed' }));

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
        // Fallback: add locally
        setHelpRequests(prev => [{
          id: Date.now(),
          issue: helpIssue,
          message: helpMsg,
          status: 'Pending',
          time: new Date().toISOString(),
        }, ...prev]);
      }
    } catch {
      // Offline fallback
      setHelpRequests(prev => [{
        id: Date.now(),
        issue: helpIssue,
        message: helpMsg,
        status: 'Pending',
        time: new Date().toISOString(),
      }, ...prev]);
    }
    setHelpSending(false);
    setHelpModal(false);
    setHelpMsg('');
    setHelpFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <StudentNavbar />

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

        {/* ═══════ EVENT ACCESS QR SECTION ═══════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <ScanLine size={18} className="text-royal" />
            <h2 className="text-lg font-extrabold text-dark">Event Access Scanners</h2>
          </div>
          <p className="text-xs text-gray-400 ml-[26px] mb-5">
            Use these scanners during the hackathon for entry and meals.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Entry QR Card ── */}
            <motion.div
              custom={0} variants={cardUp} initial="hidden" animate="visible"
              whileHover={{ y: -4 }}
              onClick={() => openScanner('entry')}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-royal/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-royal flex items-center justify-center">
                  <DoorOpen size={15} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">Gate Entry Scanner</h3>
                  <p className="text-[10px] text-gray-400">Scan at venue entrance</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-40 h-40 rounded-2xl bg-gray-900 relative overflow-hidden flex items-center justify-center mb-3">
                  {/* Scanner corners */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-royal rounded-tl-md" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-royal rounded-tr-md" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-royal rounded-bl-md" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-royal rounded-br-md" />
                  {/* Animated scan line */}
                  <motion.div
                    className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-royal to-transparent"
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <ScanLine size={36} className="text-royal/40" />
                </div>
                <p className="text-xs font-bold text-dark">{event.studentName}</p>
                <p className="text-[10px] text-gray-400">{event.teamName}</p>
                <StatusBadge status={event.entryStatus} />
              </div>
            </motion.div>

            {/* ── Meals QR Card ── */}
            <motion.div
              custom={1} variants={cardUp} initial="hidden" animate="visible"
              whileHover={{ y: -4 }}
              onClick={() => openScanner('meals')}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Utensils size={15} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark">Meals Scanner</h3>
                  <p className="text-[10px] text-gray-400">Scan at lunch & dinner counters</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-40 h-40 rounded-2xl bg-gray-900 relative overflow-hidden flex items-center justify-center mb-3">
                  {/* Scanner corners */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
                  {/* Animated scan line */}
                  <motion.div
                    className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                    animate={{ top: ['15%', '85%', '15%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  />
                  <ScanLine size={36} className="text-amber-400/40" />
                </div>
                <p className="text-xs font-bold text-dark">{event.studentName}</p>
                <p className="text-[10px] text-gray-400">Lunch & Dinner Access</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={event.lunchStatus} />
                  <StatusBadge status={event.dinnerStatus} />
                </div>
              </div>
            </motion.div>

            {/* Scan Status + Progress — spans 3 cols */}
            <motion.div
              custom={1} variants={cardUp} initial="hidden" animate="visible"
              className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col"
            >
              <h3 className="text-sm font-bold text-dark mb-1">Scan Status Tracking</h3>
              <p className="text-[10px] text-gray-400 mb-4">Click any row to simulate a QR scan</p>

              <div className="space-y-1 flex-1">
                <ScanStatusRow
                  icon={DoorOpen} label="Gate Entry" status={event.entryStatus}
                  iconBg="bg-gradient-to-br from-blue-500 to-royal"
                  onSimulate={simEntry}
                />
                <div className="h-px bg-gray-50 mx-4" />
                <ScanStatusRow
                  icon={Coffee} label="Lunch" status={event.lunchStatus}
                  iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
                  onSimulate={simLunch}
                />
                <div className="h-px bg-gray-50 mx-4" />
                <ScanStatusRow
                  icon={Utensils} label="Dinner" status={event.dinnerStatus}
                  iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                  onSimulate={simDinner}
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
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md transition-all"
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
                  <p className="text-3xl font-extrabold text-royal tracking-tight">{event.workspaceNumber}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-royal/10 flex items-center justify-center">
                  <MapPin size={24} className="text-royal" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: MapPin, text: event.workspaceLocation },
                  { icon: Users, text: 'Team seating — bring your team badge' },
                  { icon: Battery, text: 'Power outlets available at desk' },
                  { icon: Wifi, text: 'WiFi: HackFlow_Event (password at check-in)' },
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
                <p className="text-[10px] text-gray-400">Full day hackathon timeline</p>
              </div>
            </div>
            <div className="space-y-0">
              {[
                { time: '09:00 AM', label: 'Gate Entry', icon: DoorOpen, active: true },
                { time: '10:00 AM', label: 'Opening Ceremony', icon: Sparkles, active: false },
                { time: '10:30 AM', label: 'Hacking Begins', icon: CircleDot, active: false },
                { time: '01:30 PM', label: 'Lunch Break', icon: Coffee, active: false },
                { time: '05:00 PM', label: 'Submission Deadline', icon: AlertTriangle, active: false },
                { time: '06:00 PM', label: 'Final Presentations', icon: Megaphone, active: false },
                { time: '07:30 PM', label: 'Dinner', icon: Utensils, active: false },
                { time: '08:30 PM', label: 'Winners Announcement', icon: Sparkles, active: false },
              ].map(({ time, label, icon: I, active }, idx, arr) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.06 }}
                  className={`flex items-start gap-3 relative group
                    ${active ? '' : 'hover:bg-gray-50/50'} rounded-lg transition-colors`}
                >
                  {idx < arr.length - 1 && <div className="absolute left-[15px] top-8 w-px h-full bg-gray-100" />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors
                    ${active
                      ? 'bg-royal text-white shadow-md shadow-royal/25'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-royal/10 group-hover:text-royal'
                    }`}>
                    <I size={14} />
                  </div>
                  <div className="pb-4 pt-1">
                    <p className={`text-[10px] font-bold ${active ? 'text-royal' : 'text-gray-400'}`}>{time}</p>
                    <p className={`text-xs font-semibold ${active ? 'text-dark' : 'text-gray-500'}`}>{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                {helpRequests.map(req => (
                  <motion.div key={req.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-dark">{req.issue}</span>
                      <motion.span
                        key={req.status}
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ring-1
                          ${req.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                            : 'bg-amber-50 text-amber-600 ring-amber-200'
                          }`}
                      >
                        {req.status}
                      </motion.span>
                    </div>
                    {req.message && <p className="text-[11px] text-gray-500 mb-1">{req.message}</p>}
                    <p className="text-[9px] text-gray-400">Submitted at {req.time}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

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
              'Keep your QR code ready on your phone',
              'Meals are served at the food court — follow signs',
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
                      { value: 'Workspace Issue', icon: Wrench, color: 'text-blue-500' },
                      { value: 'Technical Issue', icon: AlertTriangle, color: 'text-amber-500' },
                      { value: 'Food Coupon Issue', icon: Ticket, color: 'text-emerald-500' },
                      { value: 'Other', icon: MessageSquare, color: 'text-gray-500' },
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

      {/* ═══════ QR SCANNER MODAL ═══════ */}
      <AnimatePresence>
        {scannerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4"
          >
            {/* Close */}
            <button onClick={closeScanner}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10">
              <X size={20} className="text-white" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-white text-lg font-bold">
                {scannerType === 'entry' ? 'Gate Entry Scanner' : 'Meals Scanner'}
              </h2>
              <p className="text-white/50 text-xs mt-1">
                Point your camera at the QR code
              </p>
            </div>

            {/* Scanner viewport */}
            <div className="relative w-full max-w-sm">
              {/* Scanner frame corners */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-3 border-l-3 border-royal rounded-tl-lg z-10" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-3 border-r-3 border-royal rounded-tr-lg z-10" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-3 border-l-3 border-royal rounded-bl-lg z-10" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-3 border-r-3 border-royal rounded-br-lg z-10" />

              {/* Animated scan line */}
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-royal to-transparent z-10"
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* html5-qrcode renders into this div */}
              <div
                ref={scannerRef}
                id="qr-scanner-region"
                className="w-full rounded-xl overflow-hidden bg-gray-900"
                style={{ minHeight: 300 }}
              />
            </div>

            {/* Success result */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-5 py-3"
              >
                <CheckCircle2 size={20} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-300 text-sm font-bold">Scan Successful!</p>
                  <p className="text-emerald-400/60 text-[10px] font-mono mt-0.5">{scanResult}</p>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {scanError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-3 max-w-sm"
              >
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-5 py-3">
                  <AlertTriangle size={16} className="text-red-400" />
                  <p className="text-red-300 text-xs">{scanError}</p>
                </div>
                <button onClick={() => { closeScanner(); if (scannerType === 'entry') simEntry(); else { simLunch(); simDinner(); } }}
                  className="text-white/50 text-xs hover:text-white underline cursor-pointer">
                  Simulate scan instead
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
