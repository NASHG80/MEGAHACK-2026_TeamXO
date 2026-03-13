import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ChevronDown, Eye, X, Check, Clock, AlertCircle,
  Mail, Users, Trophy, Award, Loader2, PartyPopper, Search,
  ChevronLeft, Download, RefreshCw,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import { CERTIFICATE_BACKGROUNDS } from '../../components/CertificateTemplateCard';

const API   = 'http://localhost:5000/api/certificates';
const token = () => localStorage.getItem('hf_token');

/* ═══════════ CONFETTI ═══════════ */
function Confetti() {
  const colors = ['#1E3A8A','#2563EB','#D97706','#059669','#7C3AED','#DC2626','#0891B2'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div key={i}
          initial={{ x: Math.random() * window.innerWidth, y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: window.innerHeight + 50, rotate: Math.random() * 720 - 360, opacity: [1, 1, 0] }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.8, ease: 'easeIn' }}
          className="absolute"
          style={{ width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px' }} />
      ))}
    </div>
  );
}

/* ═══════════ CERTIFICATE PREVIEW MODAL ═══════════ */
function CertificatePreviewModal({ person, hackathon, templateMeta, onClose }) {
  const BgComponent = templateMeta?.presetId
    ? CERTIFICATE_BACKGROUNDS.find(b => b.id === templateMeta.presetId)?.Component
    : null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
          onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
                <Award size={16} className="text-royal" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark">Certificate Preview</h3>
                <p className="text-[10px] text-gray-400">{person.name} — {person.type === 'winner' ? person.position : 'Participant'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="relative mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200"
              style={{ width: '100%', maxWidth: 640, aspectRatio: '1.414 / 1' }}>
              {templateMeta?.backgroundImageUrl
                ? <img src={templateMeta.backgroundImageUrl} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
                : BgComponent && <div className="absolute inset-0 z-0"><BgComponent /></div>
              }
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] font-serif tracking-wide">
                  {person.type === 'winner' ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION'}
                </h2>
                <p className="text-xs text-gray-500 mt-2">This certificate is proudly awarded to</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark font-serif mt-1">{person.name}</h1>
                <p className="text-xs text-gray-500 mt-2">
                  {person.type === 'winner' ? `for winning ${person.position} in` : 'for participating in'}
                </p>
                <h3 className="text-lg font-bold text-[#1E3A8A] mt-1">{hackathon?.name || 'Hackathon'}</h3>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                  <span>{hackathon?.date ? new Date(hackathon.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                  {hackathon?.organizer && <><span>·</span><span>{hackathon.organizer}</span></>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              Close
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-royal rounded-lg hover:bg-royal/90 transition-colors cursor-pointer">
              <Download size={13} /> Download PDF
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════ STATUS BADGE ═══════════ */
function StatusBadge({ status }) {
  const cfg = {
    pending:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-200',   icon: Clock,        label: 'Pending' },
    generated: { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-200',    icon: Award,        label: 'Generated' },
    sent:      { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', icon: Check,        label: 'Sent' },
    failed:    { bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-red-200',     icon: AlertCircle,  label: 'Failed' },
  }[status] || { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-200', icon: Clock, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

const GENERATION_STEPS = [
  { label: 'Generating certificates', icon: Award },
  { label: 'Preparing emails',        icon: Mail  },
  { label: 'Sending to participants', icon: Send  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function GenerateCertificatesPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { templateId, hackathonId: passedHackId } = location.state || {};

  // Fall back to localStorage if not in router state
  const hackathonId = passedHackId || localStorage.getItem('hf_active_hackathon') || '';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certType, setCertType]       = useState('participants');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPerson, setPreviewPerson] = useState(null);
  const [hackathon, setHackathon]     = useState(null);
  const [templateMeta, setTemplateMeta] = useState(null);
  const [recipients, setRecipients]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [genStatuses, setGenStatuses] = useState({}); // { recipientEmail: status }

  // generation UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress,  setGenProgress]  = useState(0);
  const [genStep,      setGenStep]      = useState(0);
  const [isComplete,   setIsComplete]   = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sendEmail,    setSendEmail]    = useState(true);
  const [genError,     setGenError]     = useState(null);
  const pollRef = useRef(null);

  /* ── Fetch hackathon info + template meta ── */
  useEffect(() => {
    if (!hackathonId) return;
    // Fetch template
    if (templateId && templateId.match(/^[a-f\d]{24}$/i)) {
      fetch(`${API}/template/${templateId}`, { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json())
        .then(d => setTemplateMeta(d.template || null))
        .catch(() => {});
    }
  }, [hackathonId, templateId]);

  /* ── Fetch recipients when certType changes ── */
  useEffect(() => {
    if (!hackathonId) return;
    setLoading(true);
    setRecipients([]);
    setIsComplete(false);
    setIsGenerating(false);
    setGenStatuses({});

    fetch(`${API}/recipients/${hackathonId}?type=${certType}`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(data => {
        setRecipients(data.recipients || []);
        setHackathon(data.hackathon || null);
      })
      .catch(() => setRecipients([]))
      .finally(() => setLoading(false));
  }, [hackathonId, certType]);

  /* ── Filtered by search ── */
  const tableData = recipients.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Poll generation status ── */
  const startPolling = () => {
    if (!hackathonId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/status/${hackathonId}`, { headers: { Authorization: `Bearer ${token()}` } });
        const data = await res.json();
        setGenProgress(data.progress || 0);

        // Map statuses back to recipient IDs
        const statusMap = {};
        (data.certs || []).forEach(c => { statusMap[c.recipientEmail] = c.status; });
        setGenStatuses(statusMap);

        if (data.pending === 0 && data.total > 0) {
          clearInterval(pollRef.current);
          setIsGenerating(false);
          setIsComplete(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        } else {
          // Update step indicator
          if (data.progress < 40)      setGenStep(0);
          else if (data.progress < 75) setGenStep(1);
          else                          setGenStep(2);
        }
      } catch {}
    }, 1500);
  };

  /* ── Start generation ── */
  const startGeneration = async () => {
    if (tableData.length === 0) return;
    setIsGenerating(true);
    setIsComplete(false);
    setGenProgress(0);
    setGenStep(0);
    setGenError(null);
    setGenStatuses({});

    // Mark all as pending locally for instant feedback
    const initial = {};
    tableData.forEach(p => { initial[p.email] = 'pending'; });
    setGenStatuses(initial);

    try {
      const res = await fetch(`${API}/generate/${hackathonId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({
          templateId: templateId || null,
          recipients: tableData,
          sendEmail,
        }),
      });
      if (!res.ok) throw new Error('Generation failed to start');
      startPolling();
    } catch (err) {
      setGenError(err.message);
      setIsGenerating(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const sentCount   = Object.values(genStatuses).filter(s => s === 'sent').length;
  const failedCount = Object.values(genStatuses).filter(s => s === 'failed').length;

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <OrganizerSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Back + Header ── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button onClick={() => navigate('/organizer/certificates')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-royal font-semibold mb-4 cursor-pointer transition-colors">
              <ChevronLeft size={14} /> Back to Templates
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-royal/10 flex items-center justify-center">
                <Send size={18} className="text-royal" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-dark tracking-tight">Generate &amp; Send Certificates</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hackathonId
                    ? <>Certificates for <span className="font-semibold text-royal">{hackathon?.name || 'your hackathon'}</span></>
                    : <span className="text-amber-600">⚠ No active hackathon — set one in the dashboard first.</span>
                  }
                </p>
              </div>
            </div>
            <div className="ml-[52px] mt-2 w-16 h-1 rounded-full bg-royal" />
          </motion.div>

          {/* ── Info cards ── */}
          {hackathon && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Hackathon', value: hackathon.name,     icon: Award, color: 'bg-royal/10 text-royal' },
                { label: 'Organizer', value: hackathon.organizer || '—', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Date',      value: hackathon.date ? new Date(hackathon.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—', icon: Clock, color: 'bg-amber-50 text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-dark truncate">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Type + Search + Options ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">

            {/* Type selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Certificate Type</label>
              <div className="relative">
                <select value={certType} onChange={e => setCertType(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-dark
                             focus:outline-none focus:ring-2 focus:ring-royal/30 cursor-pointer w-48">
                  <option value="participants">Participants</option>
                  <option value="winners">Winners</option>
                  <option value="both">Both</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
                             focus:outline-none focus:ring-2 focus:ring-royal/30 placeholder:text-gray-400" />
              </div>
            </div>

            {/* Count + email toggle */}
            <div className="flex items-center gap-3">
              <div className="bg-royal/5 text-royal px-4 py-2.5 rounded-xl text-sm font-bold">
                {loading ? <Loader2 size={14} className="animate-spin" /> : `${tableData.length} recipient${tableData.length !== 1 ? 's' : ''}`}
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setSendEmail(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${sendEmail ? 'bg-royal' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sendEmail ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Send Email</span>
              </label>
            </div>
          </motion.div>

          {/* ── Recipients table ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="text-royal animate-spin" />
                <p className="text-sm text-gray-400">Loading recipients…</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                      {Object.keys(genStatuses).length > 0 && (
                        <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      )}
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {tableData.map((person, i) => (
                        <motion.tr key={`${person.id}`}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center text-xs font-bold text-royal shrink-0">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-sm font-semibold text-dark">{person.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">{person.email}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1
                              ${person.type === 'winner' ? 'bg-amber-50 text-amber-600 ring-amber-200' : 'bg-blue-50 text-blue-600 ring-blue-200'}`}>
                              {person.type === 'winner' ? <Trophy size={9} /> : <Users size={9} />}
                              {person.type === 'winner' ? (person.position || 'Winner') : 'Participant'}
                            </span>
                          </td>
                          {Object.keys(genStatuses).length > 0 && (
                            <td className="px-6 py-3">
                              <StatusBadge status={genStatuses[person.email] || 'pending'} />
                            </td>
                          )}
                          <td className="px-6 py-3 text-right">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setPreviewPerson(person)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-royal
                                         bg-royal/5 rounded-lg hover:bg-royal/10 transition-colors cursor-pointer">
                              <Eye size={12} /> Preview
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {!loading && tableData.length === 0 && (
                  <div className="py-16 text-center">
                    <Search size={24} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">
                      {hackathonId ? 'No recipients found' : 'Set an active hackathon to see recipients'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ── Generation CTA / Progress / Complete ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">

            {genError && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                <AlertCircle size={16} /> {genError}
              </div>
            )}

            {!isGenerating && !isComplete && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-dark text-lg mb-1">Ready to Generate</h3>
                  <p className="text-xs text-gray-500">
                    {tableData.length} certificate{tableData.length !== 1 ? 's' : ''} will be generated
                    {sendEmail ? ' and sent via email.' : '.'}
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={startGeneration} disabled={tableData.length === 0 || !hackathonId}
                  className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white
                             bg-gradient-to-r from-royal to-blue-500 rounded-xl
                             shadow-lg shadow-royal/25 hover:shadow-xl hover:shadow-royal/30
                             transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={16} /> Generate &amp; Send Certificates
                </motion.button>
              </div>
            )}

            {isGenerating && !isComplete && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-dark">Processing Certificates…</span>
                    <span className="text-sm font-bold text-royal">{Math.round(genProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-royal to-blue-500 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${genProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {GENERATION_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i === genStep;
                    const isDone   = i < genStep;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-2 text-xs font-semibold transition-colors
                          ${isActive ? 'text-royal' : isDone ? 'text-emerald-500' : 'text-gray-300'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center
                          ${isActive ? 'bg-royal/10' : isDone ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                          {isDone ? <Check size={13} /> : isActive ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                        </div>
                        {step.label}
                      </motion.div>
                    );
                  })}
                </div>
                <button onClick={() => { clearInterval(pollRef.current); setIsGenerating(false); }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer mt-2">
                  <X size={12} /> Cancel &amp; check status later
                </button>
              </div>
            )}

            {isComplete && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper size={28} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-dark mb-1">Certificates Processed! 🎉</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {sentCount} sent · {failedCount} failed
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setIsGenerating(false); setIsComplete(false); setGenStatuses({}); setGenProgress(0); }}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    <RefreshCw size={12} /> Reset
                  </button>
                  <button onClick={() => navigate('/organizer/certificates')}
                    className="px-5 py-2 text-xs font-bold text-white bg-royal rounded-lg hover:bg-royal/90 transition-colors cursor-pointer">
                    Back to Templates
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

        </main>
      </div>

      {/* Preview Modal */}
      {previewPerson && (
        <CertificatePreviewModal
          person={previewPerson}
          hackathon={hackathon}
          templateMeta={templateMeta}
          onClose={() => setPreviewPerson(null)}
        />
      )}

      {showConfetti && <Confetti />}
    </div>
  );
}
