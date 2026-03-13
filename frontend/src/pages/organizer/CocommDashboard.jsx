import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, RefreshCw, Users, ClipboardList, PlusCircle, CheckCircle2,
  AlertTriangle, Clock, Zap, X, ChevronDown, ArrowUpRight,
  MapPin, Flag, Calendar, Trash2, LogOut, Gift, Timer, Trophy, Loader2,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

const API = 'http://localhost:5000/api/organizer/cocom';

/* ── Helpers ────────────────────────────────────────────── */
function Toast({ t }) {
  if (!t) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-[#0A1628] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
      style={{ animation: 'toastIn .3s ease' }}>
      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />{t}
    </div>
  );
}

const STATUS_MAP = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  busy:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  offline:  'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

const PRIORITY_MAP = {
  high:   'bg-red-50 text-red-700 ring-1 ring-red-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  low:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

const TASK_STATUS_MAP = {
  pending:     'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  in_progress: 'bg-blue-50 text-royal ring-1 ring-blue-200',
  completed:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {label?.replace('_', ' ')}
    </span>
  );
}

/* ── Task Modal ─────────────────────────────────────────── */
function TaskModal({ members, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '', location: '', priority: 'medium', deadline: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ animation: 'slideDown .25s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-base font-bold text-[#0A1628]">Assign New Task</p>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below to assign a task</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Task Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Manage Lab 1 entry"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 focus:border-royal bg-gray-50" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Task details..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 focus:border-royal bg-gray-50 resize-none" />
          </div>

          {/* Assigned To + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Assign To</label>
              <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 bg-gray-50 cursor-pointer">
                <option value="">-- Select Member --</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Lab 1"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 focus:border-royal bg-gray-50" />
            </div>
          </div>

          {/* Priority + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 bg-gray-50 cursor-pointer">
                {['low', 'medium', 'high'].map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Deadline (optional)</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/25 focus:border-royal bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2.5 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!form.title.trim() || saving}
            className="px-5 py-2 rounded-xl bg-royal text-white text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-royal/20">
            {saving ? 'Saving…' : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, iconCls, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_20px_rgba(30,100,255,0.09)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon size={17} />
        </div>
        <ArrowUpRight size={13} className="text-gray-300 group-hover:text-royal transition-colors mt-1" />
      </div>
      <p className="text-2xl font-extrabold text-[#0A1628]">{value}</p>
      <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
      <p className="text-[11px] text-gray-300 mt-1.5 font-medium">{sub}</p>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function CocomManagementDashboard() {
  const navigate = useNavigate();
  const [joinCode,    setJoinCode]    = useState('——');
  const [members,    setMembers]    = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [generating, setGenerating] = useState(false);

  /* ── Chill Zone / Treasure Hunt ── */
  const [huntTasks,    setHuntTasks]    = useState([]);
  const [huntLoading,  setHuntLoading]  = useState(true);
  const [approving,    setApproving]    = useState(null); // task _id being approved
  const [huntTimers,   setHuntTimers]   = useState({});  // { taskId: secondsRemaining }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const [hackathonId, setHackathonId] = useState(null);

  /* ── Fetch pending treasure hunts (called on mount + every 10s) ── */
  const fetchHunts = useCallback(async () => {
    try {
      const token = localStorage.getItem('hf_token');
      const res = await fetch(`${API}/gamification/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setHuntTasks(data.tasks || []);
        // Initialise timers for any new tasks
        setHuntTimers(prev => {
          const next = { ...prev };
          (data.tasks || []).forEach(t => {
            if (!(t._id in next)) next[t._id] = t.remainingSec ?? 0;
          });
          return next;
        });
      }
    } catch (_) { /* silent */ } finally {
      setHuntLoading(false);
    }
  }, []);

  /* Approve a single challenge */
  const approveHunt = async (taskId) => {
    setApproving(taskId);
    try {
      const token = localStorage.getItem('hf_token');
      const res = await fetch(`${API}/gamification/${taskId}/verify`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✅ Approved! Reward: ${data.goodiesReward}`);
        setHuntTasks(prev => prev.filter(t => t._id !== taskId));
      } else {
        showToast(data.message || 'Approval failed');
      }
    } catch (_) {
      showToast('Network error — please retry');
    } finally {
      setApproving(null);
    }
  };

  /* ── Fetch initial data ── */
  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, membersRes, tasksRes, hackRes] = await Promise.all([
          fetch(`${API}/latest-code`),
          fetch(`${API}/members`),
          fetch(`${API}/tasks`),
          fetch('http://localhost:5000/api/hackathons/latest'),
        ]);
        const codeData    = await codeRes.json();
        const membersData = await membersRes.json();
        const tasksData   = await tasksRes.json();
        if (codeData.join_code)  setJoinCode(codeData.join_code);
        if (membersData.members) setMembers(membersData.members);
        if (tasksData.tasks)     setTasks(tasksData.tasks);

        // Try to get hackathon id (may 404 if route not available)
        if (hackRes.ok) {
          const hackData = await hackRes.json();
          const id = hackData._id || hackData.hackathon?._id || hackData.hackathons?.[0]?._id;
          if (id) setHackathonId(id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchHunts();
  }, [fetchHunts]);

  /* Poll for new treasure-hunt submissions every 10 s */
  useEffect(() => {
    const id = setInterval(fetchHunts, 10000);
    return () => clearInterval(id);
  }, [fetchHunts]);

  /* Count-down existing timers locally every second */
  useEffect(() => {
    const id = setInterval(() => {
      setHuntTimers(prev => {
        const next = {};
        for (const [k, v] of Object.entries(prev)) {
          next[k] = Math.max(0, v - 1);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmtTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ── Generate Code ── */
  const generateCode = async () => {
    setGenerating(true);
    try {
      const res  = await fetch(`${API}/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hackathonId ? { hackathon_id: hackathonId } : {}),
      });
      const data = await res.json();
      if (data.join_code) { setJoinCode(data.join_code); showToast('New join code generated!'); }
    } catch (err) {
      showToast('Error generating code');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Copy Code ── */
  const copyCode = () => {
    if (joinCode === '——') return;
    navigator.clipboard?.writeText(joinCode);
    showToast('Code copied to clipboard!');
  };

  /* ── Assign Task ── */
  const handleAssignTask = async (form) => {
    try {
      const res  = await fetch(`${API}/assign-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.task) { setTasks(t => [data.task, ...t]); showToast('Task assigned successfully!'); }
    } catch (err) {
      showToast('Error assigning task');
    }
    setShowModal(false);
  };

  /* ── Update Task Status ── */
  const updateTaskStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API}/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.task) setTasks(t => t.map(x => x._id === id ? data.task : x));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Remove Member ── */
  const removeMember = async (id) => {
    try {
      await fetch(`${API}/members/${id}`, { method: 'DELETE' });
      setMembers(m => m.filter(x => x._id !== id));
      showToast('Member removed');
    } catch (err) {
      showToast('Error removing member');
    }
  };

  /* ── Derived stats ── */
  const activeCount    = members.filter(m => m.status === 'active').length;
  const pendingTasks   = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  /* ── Member active task count ── */
  const memberTaskCount = id => tasks.filter(t => t.assigned_to?._id === id && t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideDown{ from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <OrganizerSidebar />
      <Toast t={toast} />
      {showModal && <TaskModal members={members} onClose={() => setShowModal(false)} onSave={handleAssignTask} />}

      <div className="transition-all duration-300 lg:pl-60">

        {/* ── Top Navbar ── */}
        <div className="sticky top-0 z-20 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 pl-14 lg:pl-6">
          <span className="font-semibold text-[#0A1628] text-sm">CoCom Dashboard</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-royal rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-royal/20 cursor-pointer">
              <PlusCircle size={12} /> Assign Task
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('hf_token');
                navigate('/');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

          {/* ── Page Header ── */}
          <div className="rounded-2xl mb-6 overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]">
            <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-violet-500" />
            <div className="bg-white px-6 py-5 flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-2xl bg-royal/10 text-royal flex items-center justify-center ring-4 ring-royal/10 shrink-0">
                <Users size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-[#0A1628]">CoCom Management</h1>
                <p className="text-sm text-gray-400">Manage committee members, join codes, and task assignments</p>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users}         iconCls="bg-royal/5 text-royal"          label="Total Members"    value={members.length}   sub="Committee size" />
            <StatCard icon={CheckCircle2}  iconCls="bg-emerald-50 text-emerald-600" label="Active Members"   value={activeCount}      sub="Online now" />
            <StatCard icon={ClipboardList} iconCls="bg-amber-50 text-amber-600"     label="Pending Tasks"    value={pendingTasks}     sub="Awaiting action" />
            <StatCard icon={Zap}           iconCls="bg-violet-50 text-violet-600"   label="In Progress"      value={inProgressTasks}  sub="Currently active" />
          </div>

          {/* ── Join Code Section ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 mb-5">
            <h2 className="text-sm font-bold text-[#0A1628] mb-1 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Committee Join Code
            </h2>
            <p className="text-xs text-gray-400 mb-5">Share this code with volunteers so they can join the committee.</p>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Code display */}
              <div className="flex items-center gap-3 bg-[#F5F7FB] border border-gray-200 rounded-2xl px-6 py-4">
                <span className="text-3xl font-black tracking-[0.25em] text-[#0A1628] font-mono">
                  {loading ? '······' : joinCode}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 flex-wrap">
                <button onClick={generateCode} disabled={generating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-royal text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-royal/20 cursor-pointer disabled:opacity-60">
                  <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                  {generating ? 'Generating…' : 'Generate New Code'}
                </button>
                <button onClick={copyCode}
                  className="flex items-center gap-2 px-4 py-2.5 border border-royal/20 text-royal text-sm font-semibold rounded-xl hover:bg-royal/5 transition-colors cursor-pointer">
                  <Copy size={13} /> Copy Code
                </button>
              </div>

              {joinCode !== '——' && (
                <div className="ml-auto text-xs text-gray-400 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Code is active
                </div>
              )}
            </div>
          </div>

          {/* ── CoCom Members ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                  <Users size={14} className="text-royal" /> CoCom Members
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Volunteers who joined using the committee code</p>
              </div>
              <span className="text-xs font-bold text-royal bg-royal/8 px-3 py-1 rounded-full">{members.length} members</span>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Loading members…</div>
            ) : members.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold text-sm">No members yet</p>
                <p className="text-xs text-gray-400 mt-1">Share the join code so volunteers can join</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Name', 'Email', 'Assigned Lab', 'Role', 'Status', 'Active Tasks', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                              style={{ background: `hsl(${m.name?.charCodeAt(0) * 47 % 360},55%,55%)` }}>
                              {m.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-[#0A1628]">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{m.email || '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-600">{m.assigned_lab || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{m.role}</td>
                        <td className="px-4 py-3"><Badge label={m.status} cls={STATUS_MAP[m.status]} /></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${memberTaskCount(m._id) > 0 ? 'text-royal bg-royal/8' : 'text-gray-400 bg-gray-100'}`}>
                            {memberTaskCount(m._id)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => removeMember(m._id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Task Tracking ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                  <ClipboardList size={14} className="text-violet-500" /> Task Tracking
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">All assigned tasks and their live status</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {completedTasks > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {completedTasks} done
                  </span>
                )}
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-royal rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-royal/20 cursor-pointer">
                  <PlusCircle size={11} /> Assign Task
                </button>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Loading tasks…</div>
            ) : tasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold text-sm">No tasks assigned yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Assign Task" to create the first one</p>
                <button onClick={() => setShowModal(true)}
                  className="mt-4 text-sm font-bold text-royal bg-royal/10 px-4 py-2 rounded-xl hover:bg-royal/15 transition-colors cursor-pointer">
                  Assign First Task
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Task', 'Assigned To', 'Location', 'Priority', 'Deadline', 'Status', 'Update'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-[#0A1628]">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{task.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {task.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                style={{ background: `hsl(${task.assigned_to.name?.charCodeAt(0) * 47 % 360},55%,55%)` }}>
                                {task.assigned_to.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-gray-700">{task.assigned_to.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={11} className="text-gray-400" />{task.location || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge label={task.priority} cls={PRIORITY_MAP[task.priority]} /></td>
                        <td className="px-4 py-3">
                          {task.deadline ? (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={11} className="text-gray-400" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3"><Badge label={task.status} cls={TASK_STATUS_MAP[task.status]} /></td>
                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={e => updateTaskStatus(task._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-royal/25 cursor-pointer">
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Chill Zone Challenges ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden mt-5">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                  <Gift size={14} className="text-violet-500" /> Chill Zone Challenges
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Students waiting for your verification — click Approve to reward them</p>
              </div>
              <div className="flex items-center gap-2">
                {huntTasks.length > 0 && (
                  <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                    {huntTasks.length} pending
                  </span>
                )}
                <button
                  onClick={fetchHunts}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {huntLoading ? (
              <div className="px-6 py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading challenges…
              </div>
            ) : huntTasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                  <Trophy size={22} className="text-violet-300" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">No pending challenges</p>
                <p className="text-xs text-gray-400 mt-1">Students who start a Chill Zone challenge will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {huntTasks.map(task => {
                  const secsLeft = huntTimers[task._id] ?? task.remainingSec ?? 0;
                  const isLow    = secsLeft < 60;
                  const isApproving = approving === task._id;
                  return (
                    <div key={task._id} className="px-6 py-4 flex items-start gap-4 hover:bg-violet-50/30 transition-colors">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `hsl(${task.studentName?.charCodeAt(0) * 47 % 360},55%,55%)` }}
                      >
                        {task.studentName?.charAt(0)?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-bold text-[#0A1628]">{task.studentName}</p>
                          <span className="text-[10px] text-gray-400">{task.studentEmail}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">{task.questionText}</p>
                        {/* Timer */}
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          secsLeft === 0
                            ? 'bg-red-100 text-red-600'
                            : isLow
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-violet-50 text-violet-600'
                        }`}>
                          <Timer size={11} />
                          {secsLeft === 0 ? 'Expired' : `${fmtTimer(secsLeft)} left`}
                        </div>
                      </div>

                      {/* Approve button */}
                      <button
                        onClick={() => approveHunt(task._id)}
                        disabled={isApproving || secsLeft === 0}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white
                          bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-sm shadow-violet-200
                          hover:shadow-md hover:from-violet-600 hover:to-purple-700 transition-all
                          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isApproving
                          ? <><Loader2 size={12} className="animate-spin" /> Approving…</>
                          : <><CheckCircle2 size={12} /> Approve</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}