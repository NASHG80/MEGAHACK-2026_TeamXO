import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, Clock, ClipboardList, MapPin, Calendar,
  AlertTriangle, Flag, Loader2, CheckCheck, PhoneCall,
  AlertCircle, Building2, ArrowRight, Zap, RefreshCw,
  Trophy, Timer, Gift, Star, PackageCheck,
} from 'lucide-react';
import api from '../../lib/api';

/* ─────────────────── constants ──────────────────────── */
const PRIORITY_COLORS = {
  High:   { bg: 'bg-red-50',    text: 'text-red-600'    },
  Medium: { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  Low:    { bg: 'bg-emerald-50',text: 'text-emerald-600'},
};
const STATUS_COLORS = {
  pending:     { bg: 'bg-gray-100',   text: 'text-gray-600'    },
  in_progress: { bg: 'bg-blue-50',    text: 'text-blue-600'    },
  completed:   { bg: 'bg-emerald-50', text: 'text-emerald-600' },
};


/* ─────────────────── helpers ────────────────────────── */
function Badge({ label, colors }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

function Toast({ msg }) {
  if (!msg.text) return null;
  const isErr = msg.type === 'error';
  return (
    <div style={{ animation: 'toastIn .3s ease' }}
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
        ${isErr ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {msg.text}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = '#1E64FF' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_8px_rgba(30,100,255,0.06)] px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-[#0A1628]">{value}</p>
      </div>
    </div>
  );
}

/* ── Confirm Modal ─────────────────────────────────── */
function ConfirmModal({ taskTitle, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm"
        style={{ animation: 'fadeUp .25s ease' }}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-4">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
        <h3 className="text-base font-bold text-[#0A1628] text-center mb-1">Mark as Completed?</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          <span className="font-semibold text-gray-700">&ldquo;{taskTitle}&rdquo;</span> will be marked done and removed from your list.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer">
            No, Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Yes, Complete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ Join Code Screen ══════════════════ */
function JoinScreen({ onJoined, showToast }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || code.trim().length < 4) {
      showToast('Enter a valid join code.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/organizer/cocom/join', { join_code: code.trim() });
      if (data.member_id) localStorage.setItem('cocom_member_id', data.member_id);
      showToast(data.message || 'Joined successfully!');
      setTimeout(() => onJoined(data.member_id), 800);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invalid join code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4">
      <div className="w-full max-w-md" style={{ animation: 'fadeUp .45s ease' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#1E64FF] flex items-center justify-center">
              <Zap size={17} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-[#1E64FF]">Hack<span className="text-[#0A1628]">Flow</span></span>
          </div>
         
          <h1 className="text-2xl font-extrabold text-[#0A1628] tracking-tight">Join Hackathon Committee</h1>
          <p className="text-sm text-gray-500 mt-1.5">Enter the code shared by your Organizer Core team.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.08)] p-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Join Code</label>
          <input
            type="text"
            placeholder="e.g. HX92K7"
            value={code}
            maxLength={10}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && !loading && handleJoin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono font-bold
              text-gray-900 tracking-widest placeholder:font-normal placeholder:tracking-normal
              focus:outline-none focus:ring-2 focus:ring-[#1E64FF]/30 focus:border-[#1E64FF] transition mb-5"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold
              text-white bg-[#1E64FF] rounded-xl hover:bg-[#1550d4] transition-all duration-200
              shadow-md shadow-blue-200 hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Joining…</>
              : <><span>Join Hackathon</span><ArrowRight size={16} /></>}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">Don't have a code? Contact your Organizer Core.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ MyTasksPage ══════════════════════ */
export default function MyTasksPage() {
  const [joined, setJoined]             = useState(null); // null=loading, false=not joined, true=joined
  const [memberId, setMemberId]         = useState(null);
  const [hackathon, setHackathon]       = useState(null);
  const [tasks, setTasks]               = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [taskFilter, setTaskFilter]     = useState('all');
  const [toast, setToast]               = useState({ text: '', type: '' });
  const [completing, setCompleting]     = useState(false);
  const [confirmTask, setConfirmTask]   = useState(null);
  const [resolving, setResolving]       = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [chillTasks, setChillTasks]     = useState([]);
  const [chillRefreshing, setChillRefreshing] = useState(false);
  const [verifying, setVerifying]       = useState(null);
  const memberIdRef = useRef(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const loadDashboard = useCallback(async (mid) => {
    try {
      const dash = await api.get(`/organizer/cocom/dashboard/${mid}`);
      setHackathon(dash.hackathon);
      setTasks(dash.tasks || []);
      setHelpRequests(dash.helpRequests || []);
    } catch {
      showToast('Failed to load dashboard data.', 'error');
    }
  }, []);

  const loadChillTasks = useCallback(async () => {
    try {
      const data = await api.get('/organizer/cocom/gamification/pending');
      setChillTasks(data.tasks || []);
    } catch { /* silent */ }
  }, []);

  /* ── Check join status on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const meData = await api.get('/organizer/cocom/me');
        if (!meData.joined) {
          setJoined(false);
        } else {
          const mid = meData.member_id || localStorage.getItem('cocom_member_id');
          if (mid) localStorage.setItem('cocom_member_id', mid);
          memberIdRef.current = mid;
          setMemberId(mid);
          setJoined(true);
          await loadDashboard(mid);
          await loadChillTasks();
        }
      } catch {
        setJoined(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDashboard]);

  /* ── Auto-refresh help requests + chill tasks every 15 s ── */
  useEffect(() => {
    const interval = setInterval(async () => {
      const mid = memberIdRef.current;
      if (!mid) return;
      try {
        const dash = await api.get(`/organizer/cocom/dashboard/${mid}`);
        setHelpRequests(dash.helpRequests || []);
      } catch { /* silent */ }
      await loadChillTasks();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadChillTasks]);

  /* ── Manual refresh ── */
  const handleRefreshHelp = useCallback(async () => {
    const mid = memberIdRef.current;
    if (!mid) return;
    setRefreshing(true);
    try {
      const dash = await api.get(`/organizer/cocom/dashboard/${mid}`);
      setHelpRequests(dash.helpRequests || []);
    } catch {
      showToast('Failed to refresh.', 'error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleJoined = async (mid) => {
    setMemberId(mid);
    setJoined(true);
    setLoading(true);
    await loadDashboard(mid);
    await loadChillTasks();
    setLoading(false);
  };

  // Step 1: show confirm modal
  const requestComplete = (task) => setConfirmTask(task);

  // Step 2: user confirmed → delete the task
  const handleComplete = useCallback(async () => {
    if (!confirmTask) return;
    setCompleting(true);
    try {
      await api.delete(`/organizer/cocom/tasks/${confirmTask._id}`);
      setTasks(prev => prev.filter(t => t._id !== confirmTask._id));
      showToast('Task completed and removed!');
    } catch {
      showToast('Failed to complete task.', 'error');
    } finally {
      setCompleting(false);
      setConfirmTask(null);
    }
  }, [confirmTask]);

  const handleResolve = useCallback(async (hrId) => {
    setResolving(hrId);
    try {
      const data = await api.put(`/organizer/cocom/help-requests/${hrId}/resolve`);
      if (data.deleted) {
        setHelpRequests(prev => prev.filter(h => h._id !== hrId));
        showToast('Request fully resolved and removed!');
      } else {
        setHelpRequests(prev => prev.map(h =>
          h._id === hrId ? { ...h, cocomResolved: true } : h
        ));
        showToast('Marked resolved — awaiting student confirmation.');
      }
    } catch {
      showToast('Failed to resolve request.', 'error');
    } finally {
      setResolving(null);
    }
  }, []);

  const handleVerifyHunt = useCallback(async (huntId) => {
    setVerifying(huntId);
    try {
      const data = await api.put(`/organizer/cocom/gamification/${huntId}/verify`);
      setChillTasks(prev => prev.filter(t => t._id !== huntId));
      showToast(`✅ Verified! Student gets: ${data.goodiesReward}`);
    } catch {
      showToast('Failed to verify task.', 'error');
    } finally {
      setVerifying(null);
    }
  }, []);

  const handleRefreshChill = useCallback(async () => {
    setChillRefreshing(true);
    await loadChillTasks();
    setChillRefreshing(false);
  }, [loadChillTasks]);

  /* ── Derived counts ── */
  const filteredTasks   = taskFilter === 'all' ? tasks : tasks.filter(t => t.status === taskFilter);
  const pendingTasks    = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks  = tasks.filter(t => t.status === 'completed').length;
  const pendingHelp  = helpRequests.filter(h => !h.cocomResolved).length;
  const pendingChill = chillTasks.length;

  /* ── Global loader ── */
  if (loading || joined === null) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1E64FF]/30 border-t-[#1E64FF] rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Join screen ── */
  if (!joined) {
    return (
      <>
        <style>{`
          @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <Toast msg={toast} />
        <JoinScreen onJoined={handleJoined} showToast={showToast} />
      </>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <Toast msg={toast} />
      {confirmTask && (
        <ConfirmModal
          taskTitle={confirmTask.title}
          loading={completing}
          onConfirm={handleComplete}
          onCancel={() => setConfirmTask(null)}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hackathon Info Header ── */}
        {hackathon && (
          <div className="rounded-2xl mb-6 overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]"
            style={{ animation: 'fadeIn .4s ease' }}>
            <div className="bg-gradient-to-r from-[#1E64FF] to-[#4481FF] px-6 py-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Your Hackathon</p>
                <h1 className="text-white text-xl font-extrabold truncate">{hackathon.name || 'Hackathon'}</h1>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <Building2 size={14} className="text-blue-100" />
                <div>
                  <p className="text-[10px] text-blue-200 font-medium leading-none">Organizer</p>
                  <p className="text-white text-sm font-bold">{hackathon.organizer || 'Organizer Core'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" style={{ animation: 'fadeIn .5s ease' }}>
          <StatCard icon={AlertTriangle} label="Pending Tasks"  value={pendingTasks}    color="#f59e0b" />
          <StatCard icon={Clock}         label="In Progress"    value={inProgressTasks} color="#1E64FF" />
          <StatCard icon={CheckCircle2}  label="Completed"      value={completedTasks}  color="#10b981" />
          <StatCard icon={PhoneCall}     label="Help Requests"  value={pendingHelp}     color="#ef4444" />
          <StatCard icon={Trophy}        label="Chill Out Tasks" value={pendingChill}   color="#8b5cf6" />
        </div>

        {/* ═══════════ TASKS ═══════════ */}
        <section className="mb-8" style={{ animation: 'fadeIn .55s ease' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[#0A1628] flex items-center gap-2">
              <ClipboardList size={17} className="text-[#1E64FF]" /> My Assigned Tasks
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'pending', 'in_progress', 'completed'].map(f => (
                <button key={f} onClick={() => setTaskFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer
                    ${taskFilter === f ? 'bg-[#1E64FF] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1E64FF]/40'}`}>
                  {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {' '}({f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length})
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <CheckCheck size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No tasks here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => {
                const pr = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;
                const st = STATUS_COLORS[task.status]     || STATUS_COLORS.pending;
                return (
                  <div key={task._id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_8px_rgba(30,100,255,0.04)] p-4 flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-[#0A1628] truncate">{task.title}</h3>
                        <Badge label={task.priority || 'Medium'} colors={pr} />
                        <Badge label={task.status?.replace('_', ' ')} colors={st} />
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                        {task.location && <span className="flex items-center gap-1"><MapPin size={11} />{task.location}</span>}
                        {task.deadline && <span className="flex items-center gap-1"><Calendar size={11} />Due {task.deadline}</span>}
                      </div>
                    </div>
                    {task.status !== 'completed' && (
                      <button onClick={() => requestComplete(task)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white
                          bg-[#1E64FF] rounded-lg hover:bg-[#1550d4] transition cursor-pointer">
                        <CheckCircle2 size={12} />
                        Complete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════ HELP REQUESTS ═══════════ */}
        <section style={{ animation: 'fadeIn .6s ease' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[#0A1628] flex items-center gap-2">
              <PhoneCall size={17} className="text-red-500" />
              Student Help Requests
              {pendingHelp > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  {pendingHelp} Pending
                </span>
              )}
            </h2>
            <button onClick={handleRefreshHelp} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500
                bg-white border border-gray-200 rounded-lg hover:border-[#1E64FF]/40 hover:text-[#1E64FF]
                transition cursor-pointer disabled:opacity-50">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {helpRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <CheckCheck size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No help requests right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {helpRequests.map(hr => {
                const awaitingStudent = hr.cocomResolved && !hr.studentResolved;
                return (
                  <div key={hr._id}
                    className={`bg-white rounded-xl border shadow-[0_1px_8px_rgba(30,100,255,0.04)] p-4 flex flex-wrap items-start gap-4
                      ${awaitingStudent ? 'border-amber-100 bg-amber-50/30' : 'border-gray-100'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-[#0A1628]">{hr.studentName || 'Student'}</h3>
                        <Badge label={hr.issueType || 'Help Request'} colors={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
                        {awaitingStudent
                          ? <Badge label="Awaiting Student" colors={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
                          : <Badge label="Pending" colors={{ bg: 'bg-red-50', text: 'text-red-500' }} />
                        }
                      </div>
                      {hr.message && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{hr.message}</p>}
                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                        {hr.workspace && <span className="flex items-center gap-1"><MapPin size={11} />{hr.workspace}</span>}
                        <span>{new Date(hr.createdAt || hr.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    {!hr.cocomResolved && (
                      <button onClick={() => handleResolve(hr._id)} disabled={resolving === hr._id}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white
                          bg-emerald-500 rounded-lg hover:bg-emerald-600 transition disabled:opacity-60 cursor-pointer">
                        {resolving === hr._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Resolve
                      </button>
                    )}
                    {awaitingStudent && (
                      <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                        text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
                        <Clock size={12} /> Waiting for student
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════ CHILL OUT ZONE ══════════════ */}
        <section style={{ animation: 'fadeIn .65s ease' }} className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-[#0A1628] flex items-center gap-2">
              <Trophy size={17} className="text-violet-500" />
              Chill Out Zone
              {pendingChill > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                  {pendingChill} Active
                </span>
              )}
            </h2>
            <button onClick={handleRefreshChill} disabled={chillRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500
                bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-600
                transition cursor-pointer disabled:opacity-50">
              <RefreshCw size={12} className={chillRefreshing ? 'animate-spin' : ''} />
              {chillRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {chillTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                <Trophy size={26} className="text-violet-300" />
              </div>
              <p className="text-sm text-gray-400">No active treasure hunt tasks right now.</p>
              <p className="text-xs text-gray-300 mt-1">Students taking on chill out challenges will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chillTasks.map(task => {
                const remMins = Math.floor(task.remainingSec / 60);
                const remSecs = task.remainingSec % 60;
                const timerStr = `${String(remMins).padStart(2,'0')}:${String(remSecs).padStart(2,'0')}`;
                const urgent = task.remainingSec < 120;
                return (
                  <div key={task._id}
                    className="bg-white rounded-xl border border-violet-100 shadow-[0_1px_8px_rgba(139,92,246,0.06)] p-4 flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Trophy size={14} className="text-violet-600" />
                        </div>
                        <h3 className="text-sm font-bold text-[#0A1628]">{task.studentName}</h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                          <Timer size={10} />
                          <span className={urgent ? 'text-red-500 font-bold' : ''}>{timerStr}</span>
                        </span>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-3 mb-2">
                        <p className="text-xs text-gray-700 leading-relaxed">{task.questionText}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                        <span>{task.studentEmail}</span>
                        <span>Started {new Date(task.startTime).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVerifyHunt(task._id)}
                      disabled={verifying === task._id}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white
                        bg-gradient-to-r from-violet-500 to-purple-700 rounded-lg hover:opacity-90
                        transition disabled:opacity-60 cursor-pointer shadow-md shadow-violet-200"
                    >
                      {verifying === task._id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <PackageCheck size={12} />}
                      Verify &amp; Accept
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}