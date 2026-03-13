import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHackathonBySlug } from '../../api/hackathonApi';
import StudentNavbar from '../../components/StudentNavbar';
import {
  ArrowLeft, Building2, Tag, Users, Calendar,
  FileText, AlertCircle, Mail, MessageSquare,
  ExternalLink, Download, Loader2, Clock, MapPin,
  CheckCircle2, UserCircle2, Copy, Check,
} from 'lucide-react';

/* ── date helpers ────────────────────────────────────────── */
function fmt(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(val) {
  if (!val) return null;
  const diff = new Date(val) - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── Right-side Register Card ───────────────────────────── */
function RegisterCard({ hack, registerUrl, myTeam }) {
  const days = daysLeft(hack.registrationDeadline);
  const isOpen = days === null || days > 0;
  const [copied, setCopied] = useState(false);

  const copyCode = code => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.07)] overflow-hidden sticky top-20">

      {/* Countdown banner */}
      {!myTeam && isOpen && days !== null && (
        <div className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 ${
          days <= 3 ? 'bg-red-50 text-red-600 border-b border-red-100'
                    : 'bg-amber-50 text-amber-700 border-b border-amber-100'
        }`}>
          <Clock size={14} className="shrink-0" />
          {days === 0 ? 'Closes today!' : `${days} day${days !== 1 ? 's' : ''} left to register`}
        </div>
      )}
      {!myTeam && !isOpen && (
        <div className="px-5 py-3 text-sm font-semibold text-gray-400 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Clock size={14} /> Registration Closed
        </div>
      )}
      {myTeam && (
        <div className="px-5 py-3 text-sm font-semibold text-emerald-600 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={14} /> You're Registered!
        </div>
      )}

      <div className="p-5">
        {/* CTA button */}
        {myTeam ? (
          <Link
            to={registerUrl}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm mb-4 bg-royal/10 text-royal border border-royal/20 hover:bg-royal/15"
          >
            <Users size={14} /> View / Share Team
          </Link>
        ) : (
          <Link
            to={registerUrl}
            className={`flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm mb-4 ${
              isOpen
                ? 'bg-royal text-white hover:bg-royal-light'
                : 'bg-gray-100 text-gray-400 pointer-events-none cursor-not-allowed'
            }`}
          >
            {isOpen ? 'Register Now →' : 'Registration Closed'}
          </Link>
        )}

        {/* Team info if registered */}
        {myTeam && (
          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-100 bg-white">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Team Code</p>
                <p className="text-lg font-black text-royal tracking-[0.2em]">{myTeam.teamCode}</p>
              </div>
              <button
                onClick={() => copyCode(myTeam.teamCode)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-royal/10 text-royal text-xs font-bold hover:bg-royal/20 transition-all"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {myTeam.teamName} · {(myTeam.members || []).length} member{(myTeam.members || []).length !== 1 ? 's' : ''}
              </p>
              {(myTeam.members || []).map((m, i) => (
                <div key={m._id || i} className="flex items-center gap-2 text-xs text-dark font-semibold">
                  <UserCircle2 size={12} className="text-royal shrink-0" />
                  <span className="flex-1 truncate">{m.name || m.email || `Member ${i + 1}`}</span>
                  {myTeam.leader && (m._id === (myTeam.leader._id || myTeam.leader)) && (
                    <span className="text-[9px] font-bold text-royal bg-royal/10 px-1.5 py-0.5 rounded-full shrink-0">Leader</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta rows */}
        <div className="space-y-3 text-sm">
          {hack.registrationDeadline && (
            <div className="flex items-start gap-3">
              <Calendar size={15} className="text-royal mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Reg. Deadline</p>
                <p className="font-semibold text-dark">{fmt(hack.registrationDeadline)}</p>
              </div>
            </div>
          )}
          {(hack.teamSizeMin || hack.teamSizeMax) && (
            <div className="flex items-start gap-3">
              <Users size={15} className="text-royal mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Team Size</p>
                <p className="font-semibold text-dark">{hack.teamSizeMin}–{hack.teamSizeMax} members</p>
              </div>
            </div>
          )}
          {hack.mode && (
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-royal mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Mode</p>
                <p className="font-semibold text-dark">{hack.mode}</p>
              </div>
            </div>
          )}
          {hack.eligibility && (
            <div className="flex items-start gap-3">
              <Users size={15} className="text-royal mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Eligibility</p>
                <p className="font-semibold text-dark">{hack.eligibility}</p>
              </div>
            </div>
          )}
          {(hack.organizerContact || hack.contactEmail) && (
            <>
              <hr className="border-gray-100 my-4" />
              <a
                href={`mailto:${hack.organizerContact || hack.contactEmail}`}
                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-royal transition-colors"
              >
                <Mail size={13} /> Contact Organizer
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function HackathonPublicPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [myTeam,    setMyTeam]    = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getHackathonBySlug(slug)
      .then(r  => {
        setHackathon(r.data.data);
        // Fetch user's team for this hackathon
        const token = localStorage.getItem('hf_token');
        if (token && r.data.data?._id) {
          fetch(`http://localhost:5000/api/teams/by-hackathon/${r.data.data._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(data => { if (data.success && data.data) setMyTeam(data.data); })
            .catch(() => {});
        }
      })
      .catch(e => setError(e.response?.data?.message || 'Hackathon not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="w-10 h-10 text-royal animate-spin" />
        <p className="text-gray-500 font-medium">Loading hackathon…</p>
      </div>
    </div>
  );

  if (error || !hackathon) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex flex-col items-center justify-center gap-5 text-center py-40 px-4">
        <AlertCircle className="w-14 h-14 text-red-300" />
        <h2 className="text-2xl font-extrabold text-dark mb-2">Hackathon Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-light transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  const hack       = hackathon;
  const prizes     = hack.prizes   || [];
  const stages     = hack.stages   || [];
  const rules      = hack.rules    || [];
  const registerUrl = `/hackathon/${slug}/register`;

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <StudentNavbar />

      {/* ── Sticky Action Bar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-royal transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="truncate max-w-[200px] text-xs font-semibold text-gray-400">
            {hack.title}
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* ── Banner + Hero Info Card ── */}
        <div className="mb-7 rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-white">
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            {hack.bannerImage
              ? <img src={hack.bannerImage} alt="banner" className="w-full h-full object-cover" />
              : <span className="text-gray-200 text-[110px] font-black select-none">{hack.title?.[0] || 'H'}</span>
            }
          </div>

          <div className="px-6 py-5 flex flex-col sm:flex-row gap-5 items-start border-t border-gray-100">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl shrink-0 shadow-lg -mt-5 border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
              {hack.logoImage
                ? <img src={hack.logoImage} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-gray-400 font-black text-xl">{hack.organizerName?.[0] || '?'}</span>
              }
            </div>

            {/* Title + Tags */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-[1.75rem] font-black text-dark tracking-tight leading-tight mb-0.5">
                {hack.title}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-3">
                <Building2 size={13} className="text-gray-400" />
                {hack.organizerName}
              </p>
              <div className="flex flex-wrap gap-2">
                {(hack.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-royal/5 text-royal border border-royal/15">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
                {hack.mode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {hack.mode === 'Offline' ? '📍' : '🌐'} {hack.mode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-7">

          {/* LEFT — content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-7 py-6">

              {/* About */}
              {hack.description && (
                <Section title="About">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {hack.description}
                  </p>
                </Section>
              )}

              {/* Stages */}
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
                                <Calendar size={11} /> {stage.date}
                              </div>
                            )}
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

              {/* Prizes */}
              {prizes.length > 0 && prizes[0].amount && (
                <Section title="Prizes & Rewards">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {prizes.slice(0, 3).map((prize, i) => {
                      const colors = [
                        { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                        { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
                        { color: '#b45309', bg: '#fefce8', border: '#fef08a' },
                      ];
                      const c = colors[i] || colors[0];
                      return (
                        <div key={i} className="flex flex-col items-center rounded-2xl border py-5 px-3 text-center"
                          style={{ backgroundColor: c.bg, borderColor: c.border }}>
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

              {/* Rules */}
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
              {(hack.organizerContact || hack.contactEmail || hack.whatsappLink) && (
                <Section title="Organizer Contact">
                  <div className="flex flex-wrap gap-3">
                    {(hack.organizerContact || hack.contactEmail) && (
                      <a
                        href={`mailto:${hack.organizerContact || hack.contactEmail}`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-dark hover:border-royal/30 transition-all"
                      >
                        <Mail size={14} /> {hack.organizerContact || hack.contactEmail}
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
          </div>

          {/* RIGHT — sticky register card */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <RegisterCard hack={hack} registerUrl={registerUrl} myTeam={myTeam} />
          </div>

        </div>
      </main>
    </div>
  );
}
