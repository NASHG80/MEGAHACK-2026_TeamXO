import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ChevronDown, Eye, X, Check, Clock, AlertCircle,
  Mail, Users, Trophy, Award, Loader2, PartyPopper, Search,
  ChevronLeft, Download,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import { CERTIFICATE_BACKGROUNDS } from '../../components/CertificateTemplateCard';

/* ═══════════ SIMULATED BACKEND DATA ═══════════ */
const HACKATHON = {
  hackathonName: 'AI Innovation Hackathon 2026',
  organizerName: 'Tech Club',
  date: 'March 15, 2026',
};

const PARTICIPANTS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com' },
  { id: 2, name: 'Priya Patel', email: 'priya@example.com' },
  { id: 3, name: 'Arjun Singh', email: 'arjun@example.com' },
  { id: 4, name: 'Neha Gupta', email: 'neha@example.com' },
  { id: 5, name: 'Vikram Reddy', email: 'vikram@example.com' },
  { id: 6, name: 'Ananya Iyer', email: 'ananya@example.com' },
  { id: 7, name: 'Karan Mehta', email: 'karan@example.com' },
  { id: 8, name: 'Shreya Das', email: 'shreya@example.com' },
];

const WINNERS = [
  { id: 101, name: 'Rahul Sharma', email: 'rahul@example.com', position: '1st Place' },
  { id: 102, name: 'Priya Patel', email: 'priya@example.com', position: '2nd Place' },
  { id: 103, name: 'Arjun Singh', email: 'arjun@example.com', position: '3rd Place' },
];

/* ═══════════ CONFETTI COMPONENT ═══════════ */
function Confetti() {
  const colors = ['#1E3A8A', '#2563EB', '#D97706', '#059669', '#7C3AED', '#DC2626', '#0891B2'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.8,
            ease: 'easeIn',
          }}
          className="absolute"
          style={{
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════ CERTIFICATE PREVIEW MODAL ═══════════ */
function CertificatePreviewModal({ person, type, onClose }) {
  const BgComponent = CERTIFICATE_BACKGROUNDS[0]?.Component;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
                <Award size={16} className="text-royal" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark">Certificate Preview</h3>
                <p className="text-[10px] text-gray-400">{person.name} — {type === 'winner' ? person.position : 'Participant'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Certificate preview */}
          <div className="p-6 bg-gray-50">
            <div className="relative mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200"
              style={{ width: '100%', maxWidth: 640, aspectRatio: '1.414 / 1' }}>
              {/* Template background */}
              {BgComponent && (
                <div className="absolute inset-0 z-0">
                  <BgComponent />
                </div>
              )}
              {/* Certificate content */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] font-serif tracking-wide">
                  {type === 'winner' ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION'}
                </h2>
                <p className="text-xs text-gray-500 mt-2">This certificate is proudly awarded to</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark font-serif mt-1">{person.name}</h1>
                <p className="text-xs text-gray-500 mt-2">
                  {type === 'winner'
                    ? `for winning ${person.position} in`
                    : 'for participating in'
                  }
                </p>
                <h3 className="text-lg font-bold text-[#1E3A8A] mt-1">{HACKATHON.hackathonName}</h3>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                  <span>{HACKATHON.date}</span>
                  <span>·</span>
                  <span>{HACKATHON.organizerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
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

/* ═══════════ PROGRESS STEPS ═══════════ */
const GENERATION_STEPS = [
  { label: 'Generating certificates', icon: Award },
  { label: 'Preparing emails', icon: Mail },
  { label: 'Sending to participants', icon: Send },
];

/* ═══════════ STATUS BADGE ═══════════ */
function StatusBadge({ status }) {
  const cfg = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', icon: Clock, label: 'Pending' },
    sent: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', icon: Check, label: 'Sent' },
    failed: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200', icon: AlertCircle, label: 'Failed' },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */
export default function GenerateCertificatesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certType, setCertType] = useState('participants');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPerson, setPreviewPerson] = useState(null);
  const [previewType, setPreviewType] = useState('participant');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState({});

  /* ── Build the table list ── */
  const getTableData = () => {
    let list = [];
    if (certType === 'participants' || certType === 'both') {
      list = [...list, ...PARTICIPANTS.map(p => ({ ...p, type: 'participant' }))];
    }
    if (certType === 'winners' || certType === 'both') {
      list = [...list, ...WINNERS.map(w => ({ ...w, type: 'winner' }))];
    }
    if (searchQuery) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };
  const tableData = getTableData();

  /* ── Simulate generation ── */
  const startGeneration = () => {
    setIsGenerating(true);
    setGenStep(0);
    setGenProgress(0);
    setIsComplete(false);

    // Initial statuses
    const initial = {};
    tableData.forEach(p => { initial[p.id] = 'pending'; });
    setEmailStatuses(initial);

    // Step 1: Generating certificates (0-40%)
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3 + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setGenStep(2);
        setGenProgress(100);

        // Mark all as sent with slight delays
        tableData.forEach((p, i) => {
          setTimeout(() => {
            setEmailStatuses(prev => ({
              ...prev,
              [p.id]: Math.random() > 0.05 ? 'sent' : 'failed',
            }));
          }, 300 + i * 200);
        });

        // Complete
        setTimeout(() => {
          setIsComplete(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }, 300 + tableData.length * 200 + 500);
      } else {
        if (progress < 40) setGenStep(0);
        else if (progress < 75) setGenStep(1);
        else setGenStep(2);
      }
      setGenProgress(Math.min(progress, 100));
    }, 80);
  };

  const openPreview = (person) => {
    setPreviewPerson(person);
    setPreviewType(person.type || 'participant');
  };

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
                <h1 className="text-2xl font-extrabold text-dark tracking-tight">Generate & Send Certificates</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generate certificates for <span className="font-semibold text-royal">{HACKATHON.hackathonName}</span>
                </p>
              </div>
            </div>
            <div className="ml-[52px] mt-2 w-16 h-1 rounded-full bg-royal" />
          </motion.div>

          {/* ── Hackathon Info Cards ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Hackathon', value: HACKATHON.hackathonName, icon: Award, color: 'bg-royal/10 text-royal' },
              { label: 'Organizer', value: HACKATHON.organizerName, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Date', value: HACKATHON.date, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-dark truncate">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Certificate Type + Search ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            {/* Type selector */}
            <div className="relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Certificate Type</label>
              <div className="relative">
                <select value={certType} onChange={e => { setCertType(e.target.value); setIsComplete(false); setIsGenerating(false); setEmailStatuses({}); }}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-dark
                             focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal/40 cursor-pointer w-48">
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
                             focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal/40 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Count */}
            <div className="sm:self-end">
              <div className="bg-royal/5 text-royal px-4 py-2.5 rounded-xl text-sm font-bold">
                {tableData.length} recipient{tableData.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.div>

          {/* ── Preview Table ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    {Object.keys(emailStatuses).length > 0 && (
                      <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    )}
                    <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {tableData.map((person, i) => (
                      <motion.tr
                        key={`${person.id}-${person.type}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
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
                            ${person.type === 'winner'
                              ? 'bg-amber-50 text-amber-600 ring-amber-200'
                              : 'bg-blue-50 text-blue-600 ring-blue-200'
                            }`}>
                            {person.type === 'winner' ? <Trophy size={9} /> : <Users size={9} />}
                            {person.type === 'winner' ? person.position || 'Winner' : 'Participant'}
                          </span>
                        </td>
                        {Object.keys(emailStatuses).length > 0 && (
                          <td className="px-6 py-3">
                            <StatusBadge status={emailStatuses[person.id] || 'pending'} />
                          </td>
                        )}
                        <td className="px-6 py-3 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => openPreview(person)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-royal
                                       bg-royal/5 rounded-lg hover:bg-royal/10 transition-colors cursor-pointer"
                          >
                            <Eye size={12} /> Preview
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {tableData.length === 0 && (
              <div className="py-16 text-center">
                <Search size={24} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No recipients found</p>
              </div>
            )}
          </motion.div>

          {/* ── Generation Progress / CTA ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">

            {!isGenerating && !isComplete && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-dark text-lg mb-1">Ready to Generate</h3>
                  <p className="text-xs text-gray-500">
                    {tableData.length} certificate{tableData.length !== 1 ? 's' : ''} will be generated and sent via email.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={startGeneration}
                  disabled={tableData.length === 0}
                  className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white
                             bg-gradient-to-r from-royal to-blue-500 rounded-xl
                             shadow-lg shadow-royal/25 hover:shadow-xl hover:shadow-royal/30
                             transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Generate & Send Certificates
                </motion.button>
              </div>
            )}

            {isGenerating && !isComplete && (
              <div className="space-y-6">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-dark">Generating Certificates...</span>
                    <span className="text-sm font-bold text-royal">{Math.round(genProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-royal to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${genProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-6">
                  {GENERATION_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i === genStep;
                    const isDone = i < genStep;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-2 text-xs font-semibold transition-colors
                          ${isActive ? 'text-royal' : isDone ? 'text-emerald-500' : 'text-gray-300'}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                          ${isActive ? 'bg-royal/10' : isDone ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                          {isDone ? <Check size={13} /> : isActive ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                        </div>
                        {step.label}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {isComplete && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper size={28} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-dark mb-1">Certificates Successfully Sent! 🎉</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {Object.values(emailStatuses).filter(s => s === 'sent').length} certificates sent ·{' '}
                  {Object.values(emailStatuses).filter(s => s === 'failed').length} failed
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setIsGenerating(false); setIsComplete(false); setEmailStatuses({}); }}
                    className="px-5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    Reset
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
          type={previewType}
          onClose={() => setPreviewPerson(null)}
        />
      )}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  );
}
