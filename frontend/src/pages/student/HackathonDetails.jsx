import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Building2, Tag, Users, Calendar,
  FileText, AlertCircle, Mail, MessageSquare,
  ExternalLink, Download, Loader2, CalendarCheck,
  IndianRupee, CheckCircle2, UserCircle2, Copy, Check, Shield,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

/* ── date formatter ──────────────────────────────────────── */
function fmt(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Section heading ─────────────────────────────────────── */
function SectionHeading({ title }) {
  return (
    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
      {title}
    </h3>
  );
}

/* ── Section divider wrapper ─────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mb-8 last:mb-0">
      <SectionHeading title={title} />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function HackathonDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [hack,     setHack]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [myTeam,   setMyTeam]   = useState(null);  // team the user belongs to
  const [copied,   setCopied]   = useState(false);

  const copyCode = code => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`http://localhost:5000/api/hackathons/${id}`)
      .then(res => {
        setHack(res.data.data);
        setLoading(false);
        // Fetch user's team for this hackathon
        const token = localStorage.getItem('hf_token');
        if (token && res.data.data?._id) {
          fetch(`http://localhost:5000/api/teams/by-hackathon/${res.data.data._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(r => r.json())
            .then(data => { if (data.success && data.data) setMyTeam(data.data); })
            .catch(() => {});
        }
      })
      .catch(e  => { setError(e.response?.data?.message || 'Hackathon not found'); setLoading(false); });
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="w-10 h-10 text-royal animate-spin" />
        <p className="text-gray-500 font-medium">Loading hackathon…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !hack) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex flex-col items-center justify-center gap-5 text-center py-40 px-4">
        <AlertCircle className="w-14 h-14 text-red-300" />
        <h2 className="text-2xl font-extrabold text-dark mb-2">Hackathon Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-light transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );

  const prizes = hack.prizes || [];
  const stages = hack.stages || [];
  const rules  = hack.rules  || [];
  const timeline = hack.timeline || [];

  const registerUrl = `/hackathon/${hack.slug}/register`;

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <StudentNavbar />

      {/* ── Sticky Action Bar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-royal transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CalendarCheck size={12} /> Student View
          </span>
          <div className="flex-1" />
          <button
            onClick={() => navigate(registerUrl)}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${
              myTeam
                ? 'text-royal bg-royal/10 border border-royal/20 hover:bg-royal/15'
                : 'text-white bg-royal hover:bg-royal-light'
            }`}
          >
            {myTeam ? <><CheckCircle2 size={14} className="text-emerald-500" /> View Team</> : 'Register Now →'}
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* ── Banner + Hero Info Card ── */}
        <div className="mb-7 rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-white">
          {/* Banner */}
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            {hack.bannerImage
              ? <img src={hack.bannerImage} alt="banner" className="w-full h-full object-cover" />
              : <span className="text-gray-200 text-[120px] font-black select-none">{hack.title?.[0] || 'H'}</span>
            }
          </div>

          {/* Info row */}
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-5 items-start border-t border-gray-100">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl shrink-0 shadow-lg -mt-5 border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
              {hack.logoImage
                ? <img src={hack.logoImage} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-gray-400 font-black text-xl">{hack.organizerName?.[0] || hack.title?.[0] || '?'}</span>
              }
            </div>

            {/* Middle */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-[1.75rem] font-black text-dark tracking-tight leading-tight mb-0.5">
                {hack.title}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-3">
                <Building2 size={13} className="text-gray-400" />
                {hack.organizerName}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(hack.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-royal/5 text-royal border border-royal/15"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
                {hack.mode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {hack.mode === 'Offline' ? '📍' : '🌐'} {hack.mode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl w-fit">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-royal" />
                  {hack.teamSizeMin}–{hack.teamSizeMax} members
                </span>
                {hack.registrationDeadline && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-royal" />
                      Deadline: {fmt(hack.registrationDeadline)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Prize Pool */}
            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-center shrink-0 w-full sm:w-auto shadow-sm shadow-amber-500/5">
              <span className="text-3xl mb-1 drop-shadow-sm">🏆</span>
              <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mb-0.5">Prize Pool</p>
              <p className="text-xl font-black text-dark">{hack.prizePool || '—'}</p>
            </div>
          </div>
        </div>

        {/* ── All Content Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-7 py-6">

          {/* About */}
          {hack.description && (
            <Section title="About">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {hack.description}
              </p>
            </Section>
          )}

          {/* Stages & Timeline */}
          {stages.length > 0 && stages[0].name && (
            <Section title="Stages & Timeline">
              <div className="relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 z-0" />
                <div className="space-y-4">
                  {stages.map((stage, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-gray-200 bg-white text-xs font-extrabold text-gray-500">
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4">
                        {stage.round && (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{stage.round}</span>
                        )}
                        <h4 className="text-sm font-bold text-dark mt-0.5 mb-1">{stage.name}</h4>
                        {stage.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mb-2">{stage.description}</p>
                        )}
                        {stage.date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                            <Calendar size={11} />
                            {stage.date}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Timeline / Schedule */}
          {timeline.length > 0 && (
            <Section title="Schedule">
              <div className="relative">
                <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-100" />
                <div className="space-y-0">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex gap-5 pb-6 last:pb-0 relative">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-gray-200 bg-white text-xs font-extrabold text-gray-400">
                        {i + 1}
                      </div>
                      <div className="pt-1.5">
                        <p className="text-sm font-bold text-dark">{t.event}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={11} /> {fmt(t.date) || t.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Problem Statement */}
          {hack.problemStatement?.title && (
            <Section title="Problem Statement">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark">{hack.problemStatement.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {hack.problemStatement.fileName || 'document.pdf'} • {hack.problemStatement.fileSize || '—'}
                  </p>
                </div>
                {hack.problemStatement.downloadUrl ? (
                  <a
                    href={
                      hack.problemStatement.downloadUrl?.startsWith('data:')
                        ? hack.problemStatement.downloadUrl
                        : `http://localhost:5000/${hack.problemStatement.downloadUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-royal shadow-sm shrink-0 hover:bg-royal/5 transition-all"
                  >
                    <Download size={13} /> Download
                  </a>
                ) : (
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-300 pointer-events-none shadow-sm shrink-0">
                    <Download size={13} /> Download
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* Prizes & Rewards */}
          {prizes.length > 0 && prizes[0].amount && (
            <Section title="Prizes & Rewards">
              {/* Top 3 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {prizes.slice(0, 3).map((prize, i) => {
                  const colors = [
                    { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                    { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
                    { color: '#b45309', bg: '#fefce8', border: '#fef08a' },
                  ];
                  const c = colors[i] || colors[0];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center rounded-2xl border py-5 px-3 text-center"
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                    >
                      <span className="text-3xl mb-2">{prize.emoji || '🏆'}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: c.color }}>
                        {prize.rank}
                      </span>
                      <span className="text-base font-black text-dark">{prize.amount}</span>
                      <span className="text-[11px] text-gray-500 font-medium mt-0.5">{prize.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Special / remaining */}
              {prizes.length > 3 && (
                <div className="space-y-2">
                  {prizes.slice(3).map((prize, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                      <span className="text-xl">{prize.emoji || '⭐'}</span>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{prize.rank}</p>
                        <p className="text-sm font-bold text-dark">{prize.label}</p>
                      </div>
                      <span className="text-sm font-black text-dark">{prize.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Rules & Regulations */}
          {rules.length > 0 && rules[0] !== '' && (
            <Section title="Rules & Regulations">
              <ul className="space-y-2.5">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Organizer Contact */}
          {(hack.organizerContact || hack.whatsappLink) && (
            <Section title="Organizer Contact">
              <div className="flex flex-wrap gap-3">
                {hack.organizerContact && (
                  <a
                    href={`mailto:${hack.organizerContact}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-dark hover:border-royal/30 transition-all"
                  >
                    <Mail size={14} /> {hack.organizerContact}
                  </a>
                )}
                {hack.whatsappLink && (
                  <a
                    href={hack.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-sm hover:bg-emerald-600 transition-all"
                  >
                    <MessageSquare size={14} /> WhatsApp Group <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </Section>
          )}

        </div>

        {/* ── My Team Card — shown if already in a team ── */}
        {myTeam && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm font-extrabold text-dark">You're Registered!</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                Team: {myTeam.teamName}
              </span>
            </div>

            {/* Team code */}
            <div className="flex items-center gap-3 mb-4 bg-white border border-emerald-100 rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Team Code</p>
                <p className="text-xl font-black text-royal tracking-[0.2em]">{myTeam.teamCode}</p>
              </div>
              <button
                onClick={() => copyCode(myTeam.teamCode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal/10 text-royal text-xs font-bold hover:bg-royal/20 transition-all"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Members */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Members ({(myTeam.members || []).length})
            </p>
            <div className="space-y-1">
              {(myTeam.members || []).map((m, i) => (
                <div key={m._id || i} className="flex items-center gap-2 text-xs text-dark font-semibold">
                  <UserCircle2 size={13} className="text-royal shrink-0" />
                  <span className="flex-1">{m.name || m.email || `Member ${i + 1}`}</span>
                  {myTeam.leader && (m._id === myTeam.leader._id || m._id === myTeam.leader) && (
                    <span className="text-[9px] font-bold text-royal bg-royal/10 px-1.5 py-0.5 rounded-full">Leader</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-royal to-purple-700 px-8 py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
            Ready to build something amazing?
          </h2>
          <p className="text-blue-200 text-sm mb-6">
            Register your team before the deadline and compete for{' '}
            <span className="text-white font-bold">{hack.prizePool || 'exciting prizes'}</span>!
          </p>
          <button
            onClick={() => navigate(registerUrl)}
            className="inline-flex items-center gap-2 px-9 py-3.5 bg-white text-royal font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg"
          >
            Register Now →
          </button>
        </div>

      </main>
    </div>
  );
}
