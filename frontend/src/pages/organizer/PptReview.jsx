import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Star, FileText, Mail, Trash2, CheckCircle2,
  BarChart2, ArrowLeft, TrendingUp, Users, Award, Zap,
  Search, X, ArrowUpRight
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

/* ─── MOCK DATA ─── */
const SUBS_INIT = [
  { id:'S001', team:'ByteForce',   title:'EcoTrack — Carbon Footprint Monitor', at:'Mar 10, 2:30 PM', score:91, sc:{innovation:95,technical:88,clarity:92,design:89}, shortlisted:false, track:'Climate & Sustainability', members:4 },
  { id:'S002', team:'NullPointers',title:'MedAI — Diagnosis Assistant',          at:'Mar 10, 4:15 PM', score:87, sc:{innovation:88,technical:90,clarity:82,design:86}, shortlisted:false, track:'Healthcare AI',            members:3 },
  { id:'S003', team:'404Found',    title:'FinFlow — Smart Budget Planner',       at:'Mar 11, 9:00 AM', score:78, sc:{innovation:75,technical:80,clarity:79,design:78}, shortlisted:false, track:'FinTech Innovation',        members:5 },
  { id:'S004', team:'StackSmash',  title:'RuralConnect — Last Mile Delivery',    at:'Mar 11,11:45 AM', score:84, sc:{innovation:86,technical:82,clarity:85,design:83}, shortlisted:false, track:'Climate & Sustainability', members:4 },
  { id:'S005', team:'DevCraft',    title:'CodeBuddy — AI Pair Programmer',       at:'Mar 11, 1:00 PM', score:73, sc:{innovation:70,technical:78,clarity:72,design:72}, shortlisted:false, track:'Developer Tools',          members:2 },
  { id:'S006', team:'AlgoRhythm', title:'BeatSync — Music Collaboration Tool',  at:'Mar 11, 3:30 PM', score:68, sc:{innovation:72,technical:65,clarity:68,design:67}, shortlisted:false, track:'Creative Tech',            members:3 },
];

/* ─── SCORE HELPERS ─── */
const sColor = s => s >= 90 ? '#10b981' : s >= 80 ? '#3b82f6' : s >= 70 ? '#f59e0b' : '#ef4444';
const sBg    = s => s >= 90 ? 'rgba(16,185,129,.12)' : s >= 80 ? 'rgba(59,130,246,.12)' : s >= 70 ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)';
const sLabel = s => s >= 90 ? 'Excellent' : s >= 80 ? 'Strong' : s >= 70 ? 'Good' : 'Needs Work';
const rankMedal = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

/* ─── ANIMATED SCORE BAR ─── */
function ScoreBar({ label, value, weight }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 80); return () => clearTimeout(t); }, [value]);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-slate-400">{label} <span className="text-slate-500">({weight})</span></span>
        <span className="text-sm font-bold" style={{ color: sColor(value) }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800/60">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${sColor(value)}99, ${sColor(value)})` }} />
      </div>
    </div>
  );
}

/* ─── TOAST ─── */
function Toast({ t }) {
  if (!t) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 border border-slate-700"
      style={{ animation: 'toastIn .25s cubic-bezier(.17,.67,.35,1.2)' }}>
      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />{t}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ icon: Icon, label, value, sub, iconCls }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_20px_rgba(30,100,255,0.09)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon size={17} />
        </div>
        <ArrowUpRight size={13} className="text-gray-300 group-hover:text-royal transition-colors mt-1" />
      </div>
      <p className="text-2xl font-extrabold text-dark">{value}</p>
      <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-300 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

/* ─── RIGHT DETAIL PANEL ─── */
function DetailPanel({ sub, onClose, onToggleSl, showToast, notes, setNotes }) {
  if (!sub) return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BarChart2 size={26} className="text-slate-300" />
      </div>
      <p className="font-semibold text-slate-600 text-sm">Select a submission</p>
      <p className="text-xs text-slate-400 mt-1">Click any row to see the full AI score breakdown</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{sub.track}</p>
          <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{sub.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{sub.team} · {sub.members} members</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer">
          <X size={13} className="text-slate-500" />
        </button>
      </div>

      {/* Big score */}
      <div className="px-5 py-5 text-center border-b border-slate-100">
        <div className="inline-flex flex-col items-center px-8 py-4 rounded-2xl" style={{ background: sBg(sub.score) }}>
          <span className="text-5xl font-black leading-none" style={{ color: sColor(sub.score) }}>{sub.score}</span>
          <span className="text-xs font-bold mt-1" style={{ color: sColor(sub.score) }}>{sLabel(sub.score)}</span>
          <span className="text-xs text-slate-400 mt-0.5">AI Score / 100</span>
        </div>
      </div>

      {/* Score bars */}
      <div className="px-5 py-5 flex-1 overflow-y-auto border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Score Breakdown</p>
        <ScoreBar label="Innovation"  value={sub.sc.innovation} weight="40%" />
        <ScoreBar label="Technical"   value={sub.sc.technical}  weight="30%" />
        <ScoreBar label="Clarity"     value={sub.sc.clarity}    weight="20%" />
        <ScoreBar label="Design"      value={sub.sc.design}     weight="10%" />

        <div className="mt-5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Organizer Note</label>
          <textarea rows={3} value={notes[sub.id] || ''} onChange={e => setNotes(n => ({ ...n, [sub.id]: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none placeholder-slate-300 bg-slate-50"
            placeholder="Private note about this submission…" />
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 flex flex-col gap-2.5">
        <button onClick={() => onToggleSl(sub.id)}
          className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${sub.shortlisted ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
          <Star size={14} fill={sub.shortlisted ? 'currentColor' : 'none'} />
          {sub.shortlisted ? 'Remove from Shortlist' : 'Shortlist Team'}
        </button>
        <button className="w-full py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2">
          <FileText size={13} /> View PPT
        </button>
      </div>
    </div>
  );
}

/* ─── SUBMISSIONS TABLE ─── */
function SubmissionsPane({ subs, setSubs, showToast, selected, setSelected }) {
  const [sortBy, setSortBy]       = useState('score');
  const [threshold, setThreshold] = useState(85);
  const [search, setSearch]       = useState('');

  const filtered = [...subs]
    .filter(s => !search || s.team.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : a.team.localeCompare(b.team));

  const toggleSl = id => {
    const s = subs.find(x => x.id === id);
    setSubs(p => p.map(x => x.id === id ? { ...x, shortlisted: !x.shortlisted } : x));
    showToast(s.shortlisted ? `${s.team} removed from shortlist` : `${s.team} shortlisted ✓`);
  };

  const autoShortlist = () => {
    const eligible = subs.filter(s => s.score >= threshold && !s.shortlisted);
    if (!eligible.length) { showToast('No new teams above threshold'); return; }
    setSubs(p => p.map(s => s.score >= threshold ? { ...s, shortlisted: true } : s));
    showToast(`${eligible.length} team${eligible.length > 1 ? 's' : ''} auto-shortlisted (≥${threshold})`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team or project…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-slate-350" />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
        </div>
      </div>

      {/* Auto-shortlist banner */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl px-5 py-3.5 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 flex-1 min-w-[160px]">
          <Zap size={15} className="text-blue-600 shrink-0" />
          <p className="text-sm font-semibold text-slate-700">Auto-shortlist all teams scoring ≥</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <input type="range" min={50} max={100} step={5} value={threshold} onChange={e => setThreshold(Number(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer" />
            <span className="text-sm font-extrabold text-blue-700 w-8 text-center tabular-nums">{threshold}</span>
          </div>
          <button onClick={autoShortlist}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-200 whitespace-nowrap">
            <Star size={11} /> Shortlist {subs.filter(s => s.score >= threshold).length} Teams
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-medium text-slate-400 mb-3">{filtered.length} submissions · sorted by {sortBy === 'score' ? 'AI score' : 'team name'}</p>

      {/* Table header */}
      <div className="grid grid-cols-[32px_1fr_90px_90px_90px] gap-3 px-4 mb-2">
        <div />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project / Team</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Score</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center hidden md:block">Status</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</p>
      </div>

      {/* Rows */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {filtered.map((s, i) => {
          const isSelected = selected?.id === s.id;
          const medal = rankMedal(i);
          return (
            <div key={s.id} onClick={() => setSelected(isSelected ? null : s)}
              className={`grid grid-cols-[32px_1fr_90px_90px_90px] gap-3 items-center px-4 py-3.5 rounded-2xl border cursor-pointer transition-all duration-150
                ${isSelected
                  ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                  : s.shortlisted
                    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>

              {/* Rank */}
              <div className={`text-sm font-extrabold text-center ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                {medal || <span className="text-xs">#{i+1}</span>}
              </div>

              {/* Title + team */}
              <div className="min-w-0">
                <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{s.title}</p>
                <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{s.team} · {s.track}</p>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                <span className={`text-lg font-extrabold leading-none ${isSelected ? 'text-white' : ''}`}
                  style={isSelected ? {} : { color: sColor(s.score) }}>
                  {s.score}
                </span>
                <span className={`text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>/100</span>
              </div>

              {/* Status badge */}
              <div className="hidden md:flex justify-center">
                {s.shortlisted
                  ? <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>Shortlisted</span>
                  : <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${isSelected ? 'bg-white/20 text-blue-100' : 'bg-slate-100 text-slate-400'}`}>{sLabel(s.score)}</span>
                }
              </div>

              {/* Shortlist toggle */}
              <div className="flex justify-end" onClick={e => { e.stopPropagation(); toggleSl(s.id); }}>
                <button className={`p-2 rounded-xl border transition-all cursor-pointer
                  ${isSelected ? 'bg-white/20 border-white/30 hover:bg-white/30' :
                    s.shortlisted ? 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200' :
                    'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                  <Star size={13}
                    fill={s.shortlisted ? (isSelected ? 'white' : '#10b981') : 'none'}
                    className={isSelected ? 'text-white' : s.shortlisted ? 'text-emerald-500' : 'text-slate-400'} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SHORTLIST PANE ─── */
function ShortlistPane({ subs, setSubs, showToast }) {
  const sl = subs.filter(s => s.shortlisted).sort((a, b) => b.score - a.score);

  const rm = id => {
    setSubs(p => p.map(s => s.id === id ? { ...s, shortlisted: false } : s));
    showToast('Removed from shortlist');
  };

  if (!sl.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Star size={24} className="text-slate-300" />
      </div>
      <h3 className="font-bold text-slate-700 mb-1">No teams shortlisted yet</h3>
      <p className="text-sm text-slate-400">Switch to Submissions tab and star your top teams.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-extrabold text-slate-800">{sl.length} team{sl.length !== 1 ? 's' : ''} shortlisted</h2>
          <p className="text-xs text-slate-400 mt-0.5">Send confirmation emails to notify selected teams</p>
        </div>
        <button onClick={() => showToast('Confirmation emails sent!')}
          className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 cursor-pointer flex items-center gap-2">
          <Mail size={13} /> Send Confirmation Emails
        </button>
      </div>

      <div className="space-y-2.5 mb-6">
        {sl.map((s, i) => (
          <div key={s.id}
            className="bg-white border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap hover:shadow-md hover:shadow-emerald-50 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0" style={{ background: sBg(s.score), color: sColor(s.score) }}>
              #{i+1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{s.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.team} · {s.track}</p>
            </div>
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="text-xl font-extrabold" style={{ color: sColor(s.score) }}>{s.score}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <button onClick={() => rm(s.id)}
              className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 shrink-0">
              <Trash2 size={11} /> Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-extrabold text-base mb-1">Ready to publish results?</h3>
            <p className="text-sm text-white/70">Make shortlist visible on the public hackathon page. This cannot be undone.</p>
          </div>
          <button onClick={() => showToast('Results published!')}
            className="px-5 py-2.5 text-sm font-bold bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors shadow-lg cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap">
            <CheckCircle2 size={14} /> Publish Results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function PptReview() {
  const [sbOpen, setSbOpen]   = useState(true);
  const [tab, setTab]         = useState('submissions');
  const [subs, setSubs]       = useState(SUBS_INIT);
  const [toast, setToast]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]     = useState({});

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const slCount  = subs.filter(s => s.shortlisted).length;
  const avgScore = Math.round(subs.reduce((a, s) => a + s.score, 0) / subs.length);
  const topScore = Math.max(...subs.map(s => s.score));

  const toggleSl = id => {
    const s = subs.find(x => x.id === id);
    setSubs(p => p.map(x => x.id === id ? { ...x, shortlisted: !x.shortlisted } : x));
    // Keep detail panel in sync
    if (selected?.id === id) setSelected(prev => prev ? ({ ...prev, shortlisted: !prev.shortlisted }) : null);
    showToast(s.shortlisted ? `${s.team} removed from shortlist` : `${s.team} shortlisted ✓`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        .scrollbar-thin::-webkit-scrollbar{width:4px} .scrollbar-thin::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
      `}</style>

      <OrganizerSidebar open={sbOpen} onToggle={() => setSbOpen(s => !s)} />
      <Toast t={toast} />

      <div className={`transition-all duration-300 ${sbOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>

        {/* ── TOP NAVBAR ── */}
        <div className="sticky top-0 z-20 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/organizer-dashboard" className="text-gray-400 hover:text-royal transition-colors">Dashboard</Link>
            <ChevronRight size={13} className="text-gray-300" />
            <Link to="/organizer/manage" className="text-gray-400 hover:text-royal transition-colors">Manage</Link>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-dark">PPT Review</span>
          </div>
          <Link to="/organizer/manage"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-royal hover:text-royal transition-colors cursor-pointer">
            <ArrowLeft size={11} /> Back to Manage
          </Link>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

          {/* ── PAGE HEADER CARD ── */}
          <div className="rounded-2xl mb-6 overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]">
            <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-violet-500" />
            <div className="bg-white px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-extrabold text-dark tracking-tight">PPT Review Panel</h1>
                <p className="text-sm text-gray-400 mt-1">AI-evaluated submissions · review scores and shortlist top teams</p>
              </div>
              {slCount > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full self-center">
                  {slCount} team{slCount !== 1 ? 's' : ''} shortlisted
                </span>
              )}
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users}      label="Submissions"  value={subs.length}  iconCls="text-royal bg-royal/8"            sub="received" />
            <StatCard icon={TrendingUp} label="Avg AI Score" value={avgScore}      iconCls="text-violet-600 bg-violet-50"    sub="across all teams" />
            <StatCard icon={Award}      label="Top Score"    value={topScore}      iconCls="text-amber-600 bg-amber-50"      sub="highest score" />
            <StatCard icon={Star}       label="Shortlisted"  value={slCount}       iconCls="text-emerald-600 bg-emerald-50" sub={slCount ? 'teams selected' : 'none yet'} />
          </div>

          {/* ── TAB CARD ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'submissions', label: 'Submissions', icon: FileText, count: subs.length },
                { key: 'shortlist',   label: 'Shortlist',   icon: Star,     count: slCount    },
              ].map(({ key, label, icon: Icon, count }) => {
                const on = tab === key;
                return (
                  <button key={key} onClick={() => setTab(key)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${on ? 'border-royal text-royal' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                    <Icon size={14} />
                    {label}
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${on ? 'bg-royal text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content — two-pane for submissions */}
            {tab === 'submissions' ? (
              <div className="flex" style={{ minHeight: '520px' }}>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  <SubmissionsPane
                    subs={subs} setSubs={setSubs} showToast={showToast}
                    selected={selected} setSelected={setSelected} />
                </div>
                <div className={`border-l border-gray-100 bg-gray-50/40 transition-all duration-300 overflow-y-auto scrollbar-thin flex-shrink-0
                  ${selected ? 'w-[320px] xl:w-[360px]' : 'w-[260px]'}`}>
                  <DetailPanel
                    sub={selected}
                    onClose={() => setSelected(null)}
                    onToggleSl={toggleSl}
                    showToast={showToast}
                    notes={notes} setNotes={setNotes} />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <ShortlistPane subs={subs} setSubs={setSubs} showToast={showToast} />
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
