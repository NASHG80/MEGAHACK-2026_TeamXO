import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Building2, Tag, Users, Calendar,
  FileText, AlertCircle, Mail, MessageSquare,
  ExternalLink, Download, Loader2, Edit3,
  CalendarCheck, Eye,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

/* ── date formatter ─────────────────────────────── */
function fmt(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return val; // already a string like "March 15 – 25"
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function OrganizerHackathonPreview() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [hack, setHack]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`http://localhost:5000/api/hackathons/${slug}`)
      .then(res => { setHack(res.data.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.message || 'Hackathon not found'); setLoading(false); });
  }, [slug]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-light-gray">
      <OrganizerSidebar />
      <div className="lg:pl-60 flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="w-10 h-10 text-royal animate-spin" />
        <p className="text-gray-500 font-medium">Loading hackathon…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !hack) return (
    <div className="min-h-screen bg-light-gray">
      <OrganizerSidebar />
      <div className="lg:pl-60 flex flex-col items-center justify-center gap-5 text-center py-40 px-4">
        <AlertCircle className="w-14 h-14 text-red-300" />
        <h2 className="text-2xl font-extrabold text-dark mb-2">Hackathon Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate('/organizer-dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-light transition-all mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );

  const prizes = hack.prizes || [];
  const stages = hack.stages || [];
  const rules  = hack.rules  || [];

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <OrganizerSidebar />

      <div className="transition-all duration-300 lg:pl-60">

        {/* ── Organizer Action Bar ── */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/organizer-dashboard')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-royal transition-colors group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-royal bg-royal/5 px-2.5 py-1 rounded-full">
              <Eye size={12} /> Organizer Preview
            </span>
            <div className="flex-1" />
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-royal rounded-lg hover:bg-royal-light transition-all shadow-sm">
              <Edit3 size={14} /> Edit
            </button>
            <Link
              to={`/organizer/event/${hack._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-royal/10 hover:text-royal transition-all"
            >
              <CalendarCheck size={14} /> Manage Event
            </Link>
            <a
              href={`/hackathon/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-royal/10 hover:text-royal transition-all"
            >
              <ExternalLink size={14} /> Public Page
            </a>
          </div>
        </div>

        {/* ── Page body (exact same as FullPreviewModal in CreateHackathon) ── */}
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
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {hack.mode === 'Offline' ? '📍' : '🌐'} {hack.mode}
                  </span>
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

          {/* ── Tabs (static decoration — same as preview) ── */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            <button className="pb-3 text-sm font-bold text-royal border-b-2 border-royal">Overview</button>
            <button className="pb-3 text-sm font-semibold text-gray-400 pointer-events-none">Timeline</button>
            <button className="pb-3 text-sm font-semibold text-gray-400 pointer-events-none">Application</button>
          </div>

          {/* ── OVERVIEW TAB CONTENT ── */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-7 py-6">

              {/* About */}
              {hack.description && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">About</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {hack.description}
                  </p>
                </div>
              )}

              {/* Stages & Timeline */}
              {stages.length > 0 && stages[0].name && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Stages &amp; Timeline</h3>
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
                </div>
              )}

              {/* Problem Statement */}
              {hack.problemStatement?.title && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Problem Statement</h3>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 transition-all group">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark">{hack.problemStatement.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {hack.problemStatement.fileName || 'document.pdf'} • {hack.problemStatement.fileSize || '—'}
                      </p>
                    </div>
                    {hack.problemStatement.downloadUrl
                      ? (
                        <a
                          href={hack.problemStatement.downloadUrl?.startsWith('data:') ? hack.problemStatement.downloadUrl : `http://localhost:5000/${hack.problemStatement.downloadUrl}`}
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
                      )
                    }
                  </div>
                </div>
              )}

              {/* Prizes & Rewards */}
              {prizes.length > 0 && prizes[0].amount && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Prizes &amp; Rewards</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {prizes.slice(0, 3).map((prize, i) => (
                      <div key={i} className="flex flex-col items-center rounded-2xl border py-5 px-3 text-center border-gray-200 bg-gray-50">
                        <span className="text-3xl mb-2">{prize.emoji}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-gray-400">{prize.rank}</span>
                        <span className="text-base font-black text-dark">{prize.amount}</span>
                        <span className="text-[11px] text-gray-500 font-medium mt-0.5">{prize.label}</span>
                      </div>
                    ))}
                  </div>
                  {prizes.length > 3 && (
                    <div className="space-y-2">
                      {prizes.slice(3).map((prize, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                          <span className="text-xl">{prize.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{prize.rank}</p>
                            <p className="text-sm font-bold text-dark">{prize.label}</p>
                          </div>
                          <span className="text-sm font-black text-dark">{prize.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rules & Regulations */}
              {rules.length > 0 && rules[0] !== '' && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Rules &amp; Regulations</h3>
                  <ul className="space-y-2.5">
                    {rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Organizer Contact */}
              {(hack.organizerContact || hack.whatsappLink) && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Organizer Contact</h3>
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
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
