import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle, FileText, CalendarCheck, Award,
  Users, Trophy, CheckCircle2, Clock, Bell,
  TrendingUp, Calendar, ShieldCheck, ArrowUpRight, Zap, BarChart2,
} from 'lucide-react';
import axios from 'axios';
import OrganizerSidebar from '../../components/OrganizerSidebar';

/* ── Constants ─────────────────────────────────────────── */
const STAT_ICONS = [
  { label: 'Hackathons',   icon: Trophy,       iconCls: 'bg-royal/5 text-royal',          sub: 'Total created' },
  { label: 'Participants', icon: Users,         iconCls: 'bg-emerald-50 text-emerald-600', sub: 'Registered students' },
  { label: 'Submissions',  icon: FileText,      iconCls: 'bg-violet-50 text-violet-600',   sub: 'PPTs received' },
  { label: 'Pending',      icon: Clock,         iconCls: 'bg-amber-50 text-amber-600',     sub: 'Awaiting approval' },
];

const ACTIVITY_ICONS = {
  success: { icon: CheckCircle2, cls: 'text-emerald-500 bg-emerald-50' },
  info:    { icon: FileText,     cls: 'text-royal bg-royal/5' },
  neutral: { icon: Trophy,       cls: 'text-gray-400 bg-gray-50' },
};

const QUICK = [
  { label: 'Create Hackathon', icon: PlusCircle,   href: '/organizer/create',       cls: 'text-royal bg-royal/5 hover:bg-royal/10 border-royal/15' },
  { label: 'Review PPTs',      icon: BarChart2,     href: '/organizer/ppt-review',   cls: 'text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-100' },
  { label: 'Manage Events',    icon: CalendarCheck, href: '/organizer/events',       cls: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-100' },
  { label: 'Certificates',     icon: Award,         href: '/organizer/certificates', cls: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-100' },
];

/* ── Status Badge ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Live:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Completed: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status] || map.Pending}`}>
      {status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status}
    </span>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const [hackathons,        setHackathons]        = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [activities,        setActivities]        = useState([]);
  const [user,              setUser]              = useState(null);
  const [activeHackathonId, setActiveHackathonId] = useState(
    () => localStorage.getItem('hf_active_hackathon') || ''
  );
  const [stats, setStats] = useState({
    totalHackathons: 0, totalParticipants: 0, totalSubmissions: 0, totalPending: 0,
  });

  // Activate a hackathon for the certificate module
  const activateHackathon = (id, e) => {
    e.stopPropagation();
    localStorage.setItem('hf_active_hackathon', id);
    setActiveHackathonId(id);
  };

  useEffect(() => {
    // Fetch all hackathons from the standard public endpoint
    axios.get('http://localhost:5000/api/hackathons')
      .then(res => {
        const list = res.data.data || [];
        setHackathons(list);
        setStats(s => ({ ...s, totalHackathons: list.length }));
        // Auto-activate the first hackathon if none is saved yet
        if (list.length > 0 && !localStorage.getItem('hf_active_hackathon')) {
          localStorage.setItem('hf_active_hackathon', list[0]._id);
          setActiveHackathonId(list[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <OrganizerSidebar />

      <div className="transition-all duration-300 lg:pl-60">

        {/* ── Top Navbar ── */}
        <div className="sticky top-0 z-20 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6">
          <span className="font-semibold text-dark text-sm">Organizer Dashboard</span>
          <div className="flex items-center gap-2">
            <Link
              to="/organizer/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-royal border border-royal/20 rounded-lg hover:bg-royal/5 transition-colors"
            >
              <ShieldCheck size={12} /> My Profile
            </Link>
            <Link
              to="/organizer/create"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-royal rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-royal/20"
            >
              <PlusCircle size={12} /> Create Hackathon
            </Link>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

          {/* ── Profile Header Card ── */}
          <div className="rounded-2xl mb-6 overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]">
            <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-violet-500" />
            <div className="bg-white px-6 py-5 flex items-center gap-4 flex-wrap">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-royal/10 text-royal flex items-center justify-center font-bold text-xl ring-4 ring-royal/10 uppercase">
                  {user?.name?.charAt(0) || 'O'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-dark">{user?.name || 'Organizer'}</h1>
                <p className="text-sm text-gray-500">{user?.email || 'organizer@hackflow.in'}</p>
              </div>
              <div className="flex items-center gap-6 sm:border-l sm:border-gray-100 sm:pl-6">
                {[
                  [stats.totalHackathons,   'Events'],
                  [stats.totalParticipants,  'Participants'],
                  [stats.totalSubmissions,   'Submissions'],
                ].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <p className="text-xl font-extrabold text-dark">{v}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STAT_ICONS.map(({ label, icon: Icon, iconCls, sub }) => {
              const valMap = {
                Hackathons:   stats.totalHackathons,
                Participants: stats.totalParticipants,
                Submissions:  stats.totalSubmissions,
                Pending:      stats.totalPending,
              };
              return (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_20px_rgba(30,100,255,0.09)] hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls}`}>
                      <Icon size={17} />
                    </div>
                    <ArrowUpRight size={13} className="text-gray-300 group-hover:text-royal transition-colors mt-1" />
                  </div>
                  <p className="text-2xl font-extrabold text-dark">{valMap[label] ?? 0}</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
                  <p className="text-[11px] text-gray-300 mt-1.5 font-medium">{sub}</p>
                </div>
              );
            })}
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 mb-6">
            <h2 className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUICK.map(({ label, icon: Icon, href, cls }) => (
                <Link
                  key={label}
                  to={href}
                  className={`flex flex-col items-start gap-2 px-3 py-3 rounded-xl border text-xs font-semibold transition-all hover:-translate-y-0.5 ${cls}`}
                >
                  <Icon size={15} className="shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Hackathons + Activity ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Hackathon list — 2/3 */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-dark">Your Hackathons</h2>
                <Link to="/organizer/events" className="text-sm font-bold text-royal hover:underline">View All</Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-6">Loading hackathons...</p>
                ) : hackathons.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm">
                    <Trophy size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold mb-1">No Hackathons yet</p>
                    <p className="text-sm text-gray-400 mb-4">You haven't created any hackathons.</p>
                    <Link to="/organizer/create" className="text-sm font-bold text-royal bg-royal/10 px-4 py-2 rounded-xl">
                      Create One Now
                    </Link>
                  </div>
                ) : (
                  hackathons.map((hack) => {
                    const isActive = hack._id === activeHackathonId;
                    return (
                      <div
                        key={hack.slug}
                        onClick={() => navigate(`/organizer/hackathon/${hack.slug}/preview`)}
                        className={`bg-white rounded-2xl p-5 border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center
                          ${isActive ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100 hover:border-royal/30'}`}
                      >
                        <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border
                          ${isActive ? 'border-emerald-300' : 'border-gray-200'}`}>
                          {hack.logoImage
                            ? <img src={hack.logoImage} alt="logo" className="w-full h-full object-cover" />
                            : <span className="text-gray-400 font-black text-2xl">{hack.title?.[0]}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-dark truncate">{hack.title}</h3>
                            <StatusBadge status="Live" />
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Certificate Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-semibold mb-2">
                            <Calendar size={12} className="inline mr-1" />
                            Deadline: {hack.registrationDeadline
                              ? new Date(hack.registrationDeadline).toLocaleDateString()
                              : 'TBA'}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-400">
                            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                              <Users size={12} /> {hack.teamSizeMin || 2}–{hack.teamSizeMax || 4} Members
                            </span>
                            <span className="flex items-center gap-1.5 text-royal bg-royal/5 px-2 py-0.5 rounded-lg border border-royal/10">
                              <Trophy size={12} /> {hack.prizePool || '—'}
                            </span>
                            {/* Activate for certificates button */}
                            {!isActive && (
                              <button
                                onClick={(e) => activateHackathon(hack._id, e)}
                                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg
                                           text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                <Award size={10} /> Activate for Certificates
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Activity Feed — 1/3 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-dark flex items-center gap-2">
                  <Bell size={14} className="text-violet-500" /> Recent Activity
                </h2>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                {activities.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No recent activity</p>
                  </div>
                ) : activities.map((a, i) => {
                  const conf = ACTIVITY_ICONS[a.actionType] || ACTIVITY_ICONS.info;
                  const Icon = conf.icon;
                  return (
                    <div
                      key={a._id || i}
                      className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${i < activities.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${conf.cls}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{a.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}