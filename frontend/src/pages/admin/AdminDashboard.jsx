import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Building2, Trophy, Zap, Bell, FileText,
  CheckCircle, XCircle, Clock, Shield, RotateCcw,
  GraduationCap, Mail, CalendarDays, ExternalLink,
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const getAdminToken = () => localStorage.getItem('hf_token');

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }) {
  const map = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${map[status] || map.pending}`}>
      {status === 'pending'  && <Clock       size={11} />}
      {status === 'approved' && <CheckCircle size={11} />}
      {status === 'rejected' && <XCircle     size={11} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function VerifiedBadge({ isVerified }) {
  return isVerified
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200"><CheckCircle size={10} />Verified</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200"><Clock size={10} />Pending</span>;
}

/* ─── TOAST ─── */
function Toast({ t, type = 'success' }) {
  if (!t) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 ${type === 'error' ? 'bg-red-600' : 'bg-[#0A1628]'}`}
      style={{ animation: 'toastIn .3s ease' }}>
      {type === 'error' ? <XCircle size={15} className="shrink-0" /> : <CheckCircle size={15} className="text-emerald-400 shrink-0" />}
      {t}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-2xl font-extrabold text-dark">{value ?? '—'}</p>
        <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─── AVATAR INITIALS ─── */
function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const hue = (name || 'A').charCodeAt(0) * 47 % 360;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: `hsl(${hue},55%,52%)` }}>
      {initials}
    </div>
  );
}

/* ─── SECTION WRAPPER ─── */
function SectionCard({ title, subtitle, icon: Icon, iconColor, count, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-dark flex items-center gap-2">
            <Icon size={15} className={iconColor} />{title}
            {count != null && <span className="ml-1 text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{count}</span>}
          </h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── REJECT MODAL ─── */
function RejectModal({ req, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-dark mb-1">Reject Verification</h3>
        <p className="text-sm text-gray-500 mb-4">Provide a reason for <span className="font-semibold">{req.clubName}</span></p>
        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Proof document is invalid or unclear"
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 resize-none mb-4" />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 cursor-pointer flex items-center gap-1.5">
            <XCircle size={13} /> Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DETAILS MODAL ─── */
function DetailsModal({ req, onClose, onApprove, onReject }) {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-dark">{req.clubName}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{req.college}</p>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <div className="space-y-4 mb-6">
          {/* Organizer Info */}
          <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
            <Avatar name={req.organizerId?.name} />
            <div>
              <p className="text-sm font-semibold text-dark">{req.organizerId?.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Mail size={12} /> {req.organizerId?.email}
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1"><ExternalLink size={12} /> LinkedIn</p>
              {req.linkedin ? (
                <a href={req.linkedin.startsWith('http') ? req.linkedin : `https://${req.linkedin}`} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-royal hover:underline break-all">
                  {req.linkedin}
                </a>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1"><ExternalLink size={12} /> Website</p>
              {req.website ? (
                <a href={req.website.startsWith('http') ? req.website : `https://${req.website}`} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-royal hover:underline break-all">
                  {req.website}
                </a>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
          </div>

          {/* Proof Document */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1"><FileText size={12} /> Proof Document</p>
            {req.proofDocument ? (
              <a href={`${API}/uploads/proofs/${req.proofDocumentPath?.split(/\\|\//).pop()}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg group hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <FileText size={18} className="text-royal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-royal group-hover:underline">{req.proofDocument}</p>
                  <p className="text-xs text-blue-500 mt-0.5">Click to view/download</p>
                </div>
              </a>
            ) : <span className="text-sm text-gray-500 italic">No document uploaded</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Close</button>
          
          {req.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => { onClose(); onReject(req); }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 flex items-center gap-1.5 shadow-sm">
                <XCircle size={14} /> Reject
              </button>
              <button onClick={() => { onClose(); onApprove(req._id); }}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 flex items-center gap-1.5 shadow-sm">
                <CheckCircle size={14} /> Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [students, setStudents]           = useState([]);
  const [organizers, setOrganizers]       = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [usersLoading, setUsersLoading]   = useState(true);
  const [filterStatus, setFilterStatus]   = useState('pending');
  const [toast, setToast]                 = useState(null);
  const [toastType, setToastType]         = useState('success');
  const [rejectTarget, setRejectTarget]   = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab]         = useState('verifications');

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(null), 3000);
  };

  const headers = { Authorization: `Bearer ${getAdminToken()}` };

  /* Fetch verifications + stats */
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const [vRes, sRes] = await Promise.all([
        fetch(`${API}/admin/verifications?status=${filterStatus}`, { headers }),
        fetch(`${API}/admin/stats`, { headers }),
      ]);
      if (vRes.ok) setVerifications((await vRes.json()).verifications || []);
      if (sRes.ok) setStats(await sRes.json());
    } catch {
      showToast('Failed to load verifications. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Fetch all users */
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const [sRes, oRes] = await Promise.all([
        fetch(`${API}/admin/users?role=student`,   { headers }),
        fetch(`${API}/admin/users?role=organizer`,  { headers }),
      ]);
      if (sRes.ok) setStudents((await sRes.json()).users || []);
      if (oRes.ok) setOrganizers((await oRes.json()).users || []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchVerifications(); }, [filterStatus]);
  useEffect(() => { fetchUsers(); }, []);

  const review = async (id, action, rejectionReason = '') => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${API}/admin/verifications/${id}/review`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(`Verification ${action}d successfully`);
      setRejectTarget(null);
      fetchVerifications();
      fetchUsers(); // refresh org verified status
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  const TABS = [
    { key: 'verifications', label: 'Verifications', icon: Shield, count: stats?.pendingVerifications },
    { key: 'students',      label: 'Students',      icon: GraduationCap, count: stats?.totalStudents },
    { key: 'organizers',    label: 'Organizers',    icon: Building2, count: stats?.totalOrganizers },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <Toast t={toast} type={toastType} />
      {rejectTarget && (
        <RejectModal req={rejectTarget} onClose={() => setRejectTarget(null)}
          onConfirm={reason => review(rejectTarget._id, 'reject', reason)} />
      )}

      {detailsTarget && (
        <DetailsModal req={detailsTarget} onClose={() => setDetailsTarget(null)}
          onApprove={id => review(id, 'approve')}
          onReject={req => setRejectTarget(req)} />
      )}

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-royal rounded-lg flex items-center justify-center"><Zap size={14} className="text-white" /></div>
          <span className="text-base font-extrabold text-royal tracking-tight">Hack<span className="text-dark">Flow</span></span>
          <span className="text-[10px] font-bold text-white bg-royal px-2 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="relative cursor-pointer" onClick={() => setActiveTab('verifications')}>
              <Bell size={18} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{pendingCount}</span>
            </div>
          )}
          <button onClick={() => { fetchVerifications(); fetchUsers(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-royal hover:text-royal transition-colors cursor-pointer">
            <RotateCcw size={11} /> Refresh
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal to-blue-500 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-dark leading-tight">Admin</p>
              <p className="text-[11px] text-gray-400">Super Admin</p>
            </div>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('hf_token'); navigate('/'); }}
              className="ml-2 px-2.5 py-1.5 text-[11px] font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── PAGE HEADER ── */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]">
          <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-violet-500" />
          <div className="bg-white px-6 py-5">
            <h1 className="text-2xl font-extrabold text-dark tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Manage users, review organizer verifications, and monitor platform activity</p>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={GraduationCap} label="Total Students"    value={stats?.totalStudents}        gradient="from-blue-600 to-indigo-600" />
          <StatCard icon={Building2}     label="Total Organizers"  value={stats?.totalOrganizers}      gradient="from-violet-600 to-purple-600" />
          <StatCard icon={Shield}        label="Pending Reviews"   value={stats?.pendingVerifications} gradient="from-amber-500 to-orange-500" />
          <StatCard icon={Trophy}        label="Verified Orgs"     value={organizers.filter(o => o.orgVerified).length} gradient="from-emerald-500 to-teal-500" />
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {TABS.map(({ key, label, icon: Icon, count }) => {
              const on = activeTab === key;
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${on ? 'border-royal text-royal' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
                  <Icon size={14} />
                  {label}
                  {count != null && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${on ? 'bg-royal text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── VERIFICATIONS TAB ── */}
          {activeTab === 'verifications' && (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-50 flex-wrap gap-2">
                <p className="text-xs text-gray-400">Filter by status</p>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {['pending', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${filterStatus === s ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16"><span className="w-7 h-7 border-4 border-royal/30 border-t-royal rounded-full animate-spin" /></div>
              ) : verifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3"><Shield size={22} className="text-gray-300" /></div>
                  <p className="font-semibold text-gray-500 text-sm">No {filterStatus} verifications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {['Organizer','Club','College','Proof','Status','Date','Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map(req => (
                        <tr key={req._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={req.organizerId?.name} />
                              <div>
                                <button onClick={() => setDetailsTarget(req)} className="text-sm font-semibold text-royal hover:underline text-left leading-tight">
                                  {req.organizerId?.name || 'Unknown'}
                                </button>
                                <p className="text-xs text-gray-400">{req.organizerId?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-gray-700">{req.clubName}</td>
                          <td className="px-5 py-4 text-sm text-gray-500 cursor-pointer hover:text-royal" onClick={() => setDetailsTarget(req)}>{req.college}</td>
                          <td className="px-5 py-4">
                            {req.proofDocument
                              ? <button onClick={() => setDetailsTarget(req)} className="inline-flex items-center gap-1 text-xs text-royal font-medium hover:underline"><FileText size={11} />{req.proofDocument.slice(0,18)}{req.proofDocument.length > 18 ? '…' : ''}</button>
                              : <span className="text-xs text-gray-300">—</span>}
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                          <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(req.createdAt)}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => setDetailsTarget(req)}
                              className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:border-royal hover:text-royal transition-colors">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && verifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{verifications.length} {filterStatus} request{verifications.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === 'students' && (
            <>
              {usersLoading ? (
                <div className="flex items-center justify-center py-16"><span className="w-7 h-7 border-4 border-royal/30 border-t-royal rounded-full animate-spin" /></div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3"><GraduationCap size={22} className="text-gray-300" /></div>
                  <p className="font-semibold text-gray-500 text-sm">No students registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {['Student','Email','Email Verified','Joined'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(u => (
                        <tr key={u._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={u.name} />
                              <p className="text-sm font-semibold text-dark">{u.name || '(no name)'}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600"><Mail size={12} className="text-gray-400" />{u.email}</div>
                          </td>
                          <td className="px-5 py-4"><VerifiedBadge isVerified={u.isVerified} /></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400"><CalendarDays size={11} />{fmt(u.createdAt)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!usersLoading && students.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
                </div>
              )}
            </>
          )}

          {/* ── ORGANIZERS TAB ── */}
          {activeTab === 'organizers' && (
            <>
              {usersLoading ? (
                <div className="flex items-center justify-center py-16"><span className="w-7 h-7 border-4 border-royal/30 border-t-royal rounded-full animate-spin" /></div>
              ) : organizers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3"><Building2 size={22} className="text-gray-300" /></div>
                  <p className="font-semibold text-gray-500 text-sm">No organizers registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {['Organizer','Email','Club','College','Loyalty Pts','Total Hosted','Org. Verified','Joined'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {organizers.map(u => {
                        // Find their verification record from the verifications list if loaded, else show from user.isVerified
                        return (
                          <tr key={u._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={u.name} />
                                <p className="text-sm font-semibold text-dark">{u.name || '(no name)'}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600"><Mail size={12} className="text-gray-400" />{u.email}</div>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-700">{u.verification?.clubName || <span className="text-gray-300">—</span>}</td>
                            <td className="px-5 py-4 text-sm text-gray-500">{u.verification?.college || <span className="text-gray-300">—</span>}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                                {u.loyaltyPoints || 0} pts
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-gray-700">{u.totalHackathonsHosted || 0}</td>
                            <td className="px-5 py-4"><VerifiedBadge isVerified={u.orgVerified} /></td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400"><CalendarDays size={11} />{fmt(u.createdAt)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!usersLoading && organizers.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{organizers.length} organizer{organizers.length !== 1 ? 's' : ''} · {organizers.filter(o => o.orgVerified).length} verified</p>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
}
