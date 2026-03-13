import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Globe,
  Users,
  Building2,
  Calendar,
  Check,
  MonitorPlay,
  Trophy,
  CalendarDays,
  ArrowRight,
  Zap,
} from 'lucide-react';
import axios from 'axios';
import StudentNavbar from '../../components/StudentNavbar';
import ActivityTabs from '../../components/ActivityTabs';

/* ─────────────────────── MOCK DATA ─────────────────────── */
const mockRegistered = [
  {
    hackathonId: 'h1',
    title: 'CodeStorm 2026',
    teamId: 'team_42',
    submissionStatus: 'Submitted',
    resultStatus: 'Shortlisted',
  },
];

const mockOngoing = [];
const mockCertificates = [];

/* ────────────────── LIVE HACKATHON CARD ──────────────────── */
function LiveHackathonCard({ hackathon }) {
  const navigate = useNavigate();
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => navigate(`/student/hackathon/${hackathon.slug}`)}>
      {/* Green top strip */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Logo + LIVE badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
            {hackathon.logoImage
              ? <img src={`http://localhost:5000/${hackathon.logoImage}`} alt="" className="w-full h-full object-cover" />
              : <span className="text-xl font-extrabold text-gray-400">{hackathon.title?.[0]}</span>}
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </span>
        </div>

        {/* Title + organizer */}
        <div>
          <h3 className="font-bold text-gray-900 leading-snug text-sm line-clamp-2">{hackathon.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Building2 size={10} /> {hackathon.organizerName}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
            <p className="text-gray-400 font-medium">Start</p>
            <p className="font-bold text-gray-700">{fmt(hackathon.startDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
            <p className="text-gray-400 font-medium">End</p>
            <p className="font-bold text-gray-700">{fmt(hackathon.endDate)}</p>
          </div>
        </div>

        {/* Prize pool */}
        {hackathon.prizePool && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Trophy size={12} /> {hackathon.prizePool} in prizes
          </div>
        )}

        {/* View Details */}
        <button
          onClick={e => { e.stopPropagation(); navigate(`/student/hackathon/${hackathon.slug}`); }}
          className="mt-auto w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
          View Details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── HACKATHON LIST CARD (REDESIGNED) ─────────────────── */

function HackathonListCard({ hackathon }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/hackathon/${hackathon.slug}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer w-full items-stretch"
    >
      {/* 1. Left: Large Logo Box */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl shrink-0 flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200">
        {hackathon.logoImage ? (
          <img src={hackathon.logoImage} alt={hackathon.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-3xl sm:text-5xl font-bold select-none">
            {hackathon.title[0]}
          </span>
        )}
      </div>

      {/* 2. Middle: Main Details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {hackathon.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f8f1] text-[#047857]">
              Open
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
              <Globe size={15} className="text-gray-400" /> {hackathon.mode || 'Online'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <span className="text-gray-900 text-[15px]">
            <strong className="font-extrabold">{hackathon.prizePool || '—'}</strong> <span className="text-gray-500 font-medium">in prizes</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-[15px] font-medium">
            <Users size={16} /> {hackathon.teamSizeMin || 2}-{hackathon.teamSizeMax || 4} members
          </span>
        </div>
      </div>

      {/* 3. Right: Meta Info & Tags */}
      <div className="shrink-0 flex flex-col items-start sm:items-end justify-between py-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
        
        <div className="flex flex-col items-start sm:items-end gap-3 w-full">
          <span className="bg-[#f8fafc] border border-gray-200 text-gray-600 px-2.5 py-1 rounded text-xs flex items-center gap-1.5 w-fit font-medium">
            <Building2 size={13} className="text-gray-400" /> {hackathon.organizerName}
          </span>
          <span className="text-gray-600 flex items-center gap-1.5 text-sm font-medium">
            <Calendar size={15} className="text-gray-400" /> Deadline: {hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleDateString() : 'TBA'}
          </span>
        </div>

        <div className="flex flex-wrap justify-start sm:justify-end gap-2 mt-4 sm:mt-0">
          {(hackathon.tags || []).slice(0,2).map((interest, i) => (
            <span key={i} className="text-xs font-medium text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-1 rounded-md">
              {interest}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────── SIDEBAR FILTERS ─────────────────── */

function SidebarFilters() {
  const categories = [
    { title: "Location", options: ["Online", "In-person"] },
    { title: "Status", options: ["Upcoming", "Open", "Ended"] },
    { title: "Length", options: ["1-6 days", "1-4 weeks", "1+ month"] },
    { title: "Interest tags", options: ["Beginner Friendly", "Social Good", "Machine Learning/AI", "Open Ended"] }
  ];

  return (
    <div className="w-64 shrink-0 hidden lg:flex flex-col gap-6 text-sm text-gray-700 sticky top-6 self-start h-[calc(100vh-2rem)] overflow-y-auto pb-10 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium">Clear filters <span className="bg-gray-200 text-gray-600 rounded px-1.5 text-xs ml-1 font-bold">0</span></span>
      </div>


      {categories.map((cat, idx) => (
        <div key={idx} className="flex flex-col gap-2.5">
          <h4 className="font-bold text-gray-900">{cat.title}</h4>
          {cat.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              {opt}
            </label>
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-gray-900">Host</h4>
        <div className="border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between text-gray-500 bg-white shadow-sm cursor-pointer hover:border-gray-400">
          <span className="font-medium">Select host</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

/* ActivityTabs is imported from ../../components/ActivityTabs */



/* ─────────────────────── DASHBOARD PAGE ─────────────────── */

export default function Dashboard() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevant');

  useEffect(() => {
    axios.get('http://localhost:5000/api/hackathons')
      .then(res => {
        setHackathons(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  
  const sortedHackathons = useMemo(() => {
    const list = [...hackathons];
    if (sortBy === 'prize') {
      return list.sort((a, b) => {
        const valA = parseInt((a.prizePool || '').replace(/\D/g, '')) || 0;
        const valB = parseInt((b.prizePool || '').replace(/\D/g, '')) || 0;
        return valB - valA;
      });
    }
    if (sortBy === 'submission') {
      // Soonest deadline first
      return list.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
    }
    if (sortBy === 'added') {
      return list; // mock: use natural order (desc createdAt)
    }
    return list; // 'relevant'
  }, [sortBy, hackathons]);

  const liveHackathons = useMemo(() => {
    const now = new Date();
    return hackathons.filter(h => {
      if (h.status === 'live') return true;
      if (h.startDate && h.endDate) {
        return now >= new Date(h.startDate) && now <= new Date(h.endDate);
      }
      return false;
    });
  }, [hackathons]);


  return (
    <div className="min-h-screen bg-white">
      <StudentNavbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">

        {/* ── Live Hackathons Section ── */}
        {liveHackathons.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                  Live <span className="text-emerald-600">Hackathons</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{liveHackathons.length} hackathon{liveHackathons.length !== 1 ? 's' : ''} happening right now</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liveHackathons.map(hack => (
                <LiveHackathonCard key={hack.slug} hackathon={hack} />
              ))}
            </div>
          </section>
        )}
        <section>
          {/* Top Centered Search Bar */}
          <div className="flex justify-center mb-10">
            <div className="flex w-full max-w-3xl gap-3">
              <div className="flex-1 relative shadow-sm">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by hackathon title or keyword" 
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all text-sm font-medium placeholder:text-gray-400"
                />
              </div>
              <button className="bg-royal hover:bg-royal/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all">
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 relative items-start">
            {/* Left Fixed Sidebar */}
            <SidebarFilters />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              
              {/* Controls / Showing Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200">
                <span className="text-gray-500 text-sm py-3 font-medium">
                  Showing {sortedHackathons.length} hackathons
                </span>
                
                {/* SORT TABS (Interactive Frontend sorting) */}
                <div className="flex flex-wrap items-center gap-x-6 text-sm">
                  <span className="text-gray-900 font-bold py-3">Sort:</span>
                  {[
                    { id: 'relevant', label: 'Most relevant' },
                    { id: 'submission', label: 'Submission date' },
                    { id: 'added', label: 'Recently added' },
                    { id: 'prize', label: 'Prize amount' }
                  ].map(sortOption => (
                    <button 
                      key={sortOption.id}
                      onClick={() => setSortBy(sortOption.id)}
                      className={`py-3 -mb-[1px] transition-colors ${
                        sortBy === sortOption.id 
                          ? 'font-bold text-royal border-b-2 border-royal' 
                          : 'font-semibold text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                      }`}
                    >
                      {sortOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hackathon List */}
              <div className="flex flex-col gap-5 mt-2">
                {loading ? (
                  <p className="text-center text-gray-400 py-10 font-bold">Loading hackathons...</p>
                ) : sortedHackathons.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 font-bold">No hackathons available yet.</p>
                ) : (
                  sortedHackathons.map((hack) => (
                    <HackathonListCard key={hack.slug} hackathon={hack} />
                  ))
                )}
              </div>
              
            </div>
          </div>
        </section>

        {/* ── My Activity ──
        <section className="bg-gray-50/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              My <span className="text-royal">Activity</span>
            </h2>
            <ActivityTabs />
          </div>
        </section> */}
        
      </div>
    </div>
  );
}