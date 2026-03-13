import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Building2,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  Mail,
  Phone,
  User,
  GraduationCap,
  Hash,
  Users,
  Tag,
  IndianRupee,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import StudentNavbar from '../../components/StudentNavbar';
import TeamSection from '../../components/TeamSection';
import SubmissionSection from '../../components/SubmissionSection';
import ResultSection from '../../components/ResultSection';
import OfflineEventSection from '../../components/OfflineEventSection';
import FinalSubmissionSection from '../../components/FinalSubmissionSection';
import HelpSection from '../../components/HelpSection';

/* ─────────────────────── MOCK STUDENT PROFILE ───────────────────── */
const MOCK_STUDENT = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@college.edu',
  phone: '+91 99887 76655',
  college: 'VJTI Mumbai',
  branch: 'Computer Engineering',
  year: '3rd Year',
};

/* ───────────────────────── MOCK HACKATHON DB ─────────────────────── */
const HACKATHON_DB = {
  h1: {
    hackathonId: 'h1',
    title: 'CodeStorm 2026',
    organizerName: 'IIT Bombay',
    prizePool: '₹5,00,000',
    prizePoolRaw: '5,00,000',
    registrationDeadline: 'March 25, 2026',
    logoImage: null,
    bannerImage: null,
    teamSize: '2–4 members',
    tags: ['Software Development', 'AI/ML', 'FinTech'],
    mode: 'Offline',
    description:
      'CodeStorm 2026 is the flagship hackathon organized by IIT Bombay, bringing together the brightest minds to tackle real-world challenges across AI/ML, FinTech, HealthTech, and Sustainability.',
    problemStatement: { title: 'Problem Statement', fileName: 'problem_statement.pdf', fileSize: '1.2 MB', downloadUrl: '#' },
    prizes: [
      { rank: '1st Place', label: 'Winner', amount: '₹2,00,000', emoji: '🥇', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
      { rank: '2nd Place', label: 'Runner Up', amount: '₹1,50,000', emoji: '🥈', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
      { rank: '3rd Place', label: '2nd Runner Up', amount: '₹75,000', emoji: '🥉', color: '#b45309', bg: '#fefce8', border: '#fef08a' },
      { rank: 'Special Prize', label: 'Best UI/UX', amount: '₹50,000', emoji: '⭐', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
      { rank: 'Special Prize', label: 'Best Innovation', amount: '₹25,000', emoji: '💡', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
    ],
    rules: [
      'Teams of 2–4 members only.',
      'All work must be original and created during the hackathon.',
      'PPT submission is mandatory before the deadline.',
      'Plagiarism or pre-built solutions will lead to disqualification.',
      "Organizers' decision on results is final.",
    ],
    timeline: [
      { date: 'March 15, 2026', event: 'Registration Opens' },
      { date: 'March 25, 2026', event: 'Registration Deadline' },
      { date: 'March 26, 2026', event: 'PPT Submission Deadline' },
      { date: 'March 27, 2026', event: 'Shortlist Announcement' },
      { date: 'March 28, 2026', event: 'Offline Event Day' },
    ],
    stages: [
      {
        round: 'Round 1',
        name: 'Registration & Idea Submission',
        description: 'Register your team and submit a 1-page idea brief explaining your proposed solution and approach.',
        date: 'March 15 – 25, 2026',
        status: 'completed',
      },
      {
        round: 'Round 2',
        name: 'PPT Presentation',
        description: 'Submit a detailed PowerPoint presentation covering your solution, tech stack, impact, and feasibility.',
        date: 'March 26, 2026',
        status: 'active',
      },
      {
        round: 'Round 3',
        name: 'Shortlisting & Announcement',
        description: 'Top teams will be shortlisted based on innovation, technical depth, and presentation quality.',
        date: 'March 27, 2026',
        status: 'upcoming',
      },
      {
        round: 'Grand Finale',
        name: 'Offline Hackathon & Judging',
        description: 'Selected teams compete in-person for 8 hours. Build, present, and win!',
        date: 'March 28, 2026',
        status: 'upcoming',
      },
    ],
    organizerContact: 'hackathon@iitb.ac.in',
    whatsappLink: 'https://chat.whatsapp.com/example',
    team: null,
    submission: { pptUrl: '', resumeUrl: '', submissionDate: null },
    result: {
      selectionStatus: 'selected',  // 'selected' | 'not_selected'
      rank: 4,
    },
    offlineEvent: {
      workspaceNumber: 'WS-14B',
      eventDate: 'March 28, 2026',
      venue: 'IIT Bombay, Powai, Mumbai',
      reportingTime: '9:00 AM',
      lunchStatus: 'collected',
      dinnerStatus: 'pending',
      eventTimeline: [
        { time: '9:00 AM',  activity: 'Reporting & Check-in'       },
        { time: '10:00 AM', activity: 'Problem Statement Reveal'   },
        { time: '1:00 PM',  activity: 'Lunch Break'                },
        { time: '5:00 PM',  activity: 'PPT Freeze'                 },
        { time: '6:00 PM',  activity: 'Presentations Begin'        },
        { time: '8:00 PM',  activity: 'Results & Dinner'           },
      ],
    },
    finalSubmission: { githubLink: '', deployLink: '', finalPptUrl: '' },
    queries: [],
  },
  h2: {
    hackathonId: 'h2',
    title: 'InnoVerse Hack',
    organizerName: 'BITS Pilani',
    prizePool: '₹3,00,000',
    prizePoolRaw: '3,00,000',
    registrationDeadline: 'April 10, 2026',
    logoImage: null,
    bannerImage: null,
    teamSize: '2–5 members',
    tags: ['UI/UX Design', 'Smart City', 'Innovation'],
    mode: 'Online',
    description:
      'InnoVerse Hack is an interdisciplinary hackathon encouraging innovation at the intersection of technology and business.',
    problemStatement: { title: 'Problem Statement', fileName: 'problem_statement.pdf', fileSize: '1.4 MB', downloadUrl: '#' },
    prizes: [
      { rank: '1st Place', label: 'Winner', amount: '₹1,50,000', emoji: '🥇', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
      { rank: '2nd Place', label: 'Runner Up', amount: '₹75,000', emoji: '🥈', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
      { rank: '3rd Place', label: '2nd Runner Up', amount: '₹50,000', emoji: '🥉', color: '#b45309', bg: '#fefce8', border: '#fef08a' },
      { rank: 'Special Prize', label: 'Best Smart City Solution', amount: '₹25,000', emoji: '🏙️', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    ],
    rules: ['Teams of 2–5 members.', 'Submit PPT before the deadline.'],
    timeline: [
      { date: 'April 1, 2026', event: 'Registration Opens' },
      { date: 'April 10, 2026', event: 'Registration Deadline' },
    ],
    stages: [
      {
        round: 'Round 1',
        name: 'Registration & Team Formation',
        description: 'Register your team of 2–5 members and submit your area of interest and problem domain.',
        date: 'April 1 – 10, 2026',
        status: 'active',
      },
      {
        round: 'Round 2',
        name: 'Prototype & Demo Submission',
        description: 'Submit a working prototype or demo video showcasing your solution to the smart city challenge.',
        date: 'April 15, 2026',
        status: 'upcoming',
      },
      {
        round: 'Grand Finale',
        name: 'Online Presentations & Judging',
        description: 'Top teams present their solutions live in an online session judged by industry experts.',
        date: 'April 20, 2026',
        status: 'upcoming',
      },
    ],
    organizerContact: 'hack@bits.ac.in',
    whatsappLink: '#',
    team: null,
    submission: { pptUrl: '', resumeUrl: '', submissionDate: null },
    result: null,
    offlineEvent: null,
    finalSubmission: null,
    queries: [],
  },
};

/* ─────────────────────── TAB DEFINITIONS ────────────────────────── */
const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'timeline',     label: 'Timeline'     },
  { id: 'application',  label: 'Application'  },
  { id: 'results',      label: 'Results'      },
];

/* ─────────────────────── CARD WRAPPER ───────────────────────────── */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function CardSection({ title, children }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* ─────────────────────── TAB: OVERVIEW ─────────────────────────── */
function OverviewTab({ hack }) {
  return (
    <div className="space-y-5">
      <Card>
        <div className="px-7 py-6">
          {/* Description */}
          <CardSection title="About">
            <p className="text-sm text-gray-600 leading-relaxed">{hack.description}</p>
          </CardSection>

          {/* Stages & Timeline — info only, no status */}
          {hack.stages && hack.stages.length > 0 && (
            <CardSection title="Stages & Timeline">
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 z-0" />

                <div className="space-y-4">
                  {hack.stages.map((stage, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {/* Step number bubble — always neutral */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-gray-200 bg-white text-xs font-extrabold text-gray-500">
                        {i + 1}
                      </div>

                      {/* Stage info card — always same style */}
                      <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                          {stage.round}
                        </span>
                        <h4 className="text-sm font-bold text-dark mt-0.5 mb-1">{stage.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-2">{stage.description}</p>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                          <Calendar size={11} />
                          {stage.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardSection>
          )}

          {/* Problem Statement — Single PDF Download */}
          {hack.problemStatement && hack.problemStatement.downloadUrl && (
            <CardSection title="Problem Statement">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:border-royal/20 hover:bg-royal/[0.02] transition-all group">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark">{hack.problemStatement.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {hack.problemStatement.fileName} &bull; {hack.problemStatement.fileSize}
                  </p>
                </div>
                <a
                  href={hack.problemStatement.downloadUrl?.startsWith('data:') ? hack.problemStatement.downloadUrl : `http://localhost:5000/${hack.problemStatement.downloadUrl}`}
                  download
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:border-royal hover:text-royal hover:bg-royal/5 transition-all shadow-sm shrink-0 group-hover:border-royal group-hover:text-royal"
                >
                  <Download size={13} />
                  Download
                </a>
              </div>
            </CardSection>
          )}

          {/* Prizes & Rewards */}
          {hack.prizes && hack.prizes.length > 0 && (
            <CardSection title="Prizes &amp; Rewards">
              {/* Top 3 podium row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {hack.prizes.slice(0, 3).map((prize, i) => {
                  const colors = [
                    { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' }, // Gold
                    { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' }, // Silver
                    { color: '#b45309', bg: '#fefce8', border: '#fef08a' }  // Bronze
                  ];
                  const c = colors[i] || colors[0];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center rounded-2xl border py-5 px-3 text-center"
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                    >
                      <span className="text-3xl mb-2">{prize.emoji || '🏆'}</span>
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
                        style={{ color: c.color }}
                      >
                        {prize.rank}
                      </span>
                      <span className="text-base font-black text-dark">{prize.amount}</span>
                      <span className="text-[11px] text-gray-500 font-medium mt-0.5">{prize.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Special / remaining prizes */}
              {hack.prizes.length > 3 && (
                <div className="space-y-2">
                  {hack.prizes.slice(3).map((prize, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl border"
                      style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}
                    >
                      <span className="text-xl">{prize.emoji || '⭐'}</span>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: '#6366f1' }}>
                          {prize.rank}
                        </p>
                        <p className="text-sm font-bold text-dark">{prize.label}</p>
                      </div>
                      <span className="text-sm font-black text-dark">{prize.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardSection>
          )}

          {/* Rules */}
          <CardSection title="Rules & Regulations">
            <ul className="space-y-2.5">
              {hack.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>
          </CardSection>

          {/* Contact */}
          <CardSection title="Organizer Contact">
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${hack.organizerContact}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-dark hover:border-royal hover:text-royal transition-all"
              >
                <Mail size={14} /> {hack.organizerContact}
              </a>
              <a
                href={hack.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all shadow-sm"
              >
                <MessageSquare size={14} /> Join WhatsApp Group
                <ExternalLink size={12} />
              </a>
            </div>
          </CardSection>
        </div>
      </Card>

      {/* Help / Query */}
      <HelpSection queries={hack.queries ?? []} organizerContact={hack.organizerContact} />
    </div>
  );
}

/* ─────────────────────── TAB: TIMELINE ─────────────────────────── */
function TimelineTab({ hack }) {
  return (
    <Card className="px-7 py-8">
      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-8">Schedule</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-100" />

        <div className="space-y-0">
          {hack.timeline.map((t, i) => {
            const isPast = i < 2;   // mock: first 2 are "past"
            const isCurrent = i === 2;
            return (
              <div key={i} className="flex gap-5 pb-8 last:pb-0 relative">
                {/* Dot */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                  isCurrent
                    ? 'bg-royal border-royal shadow-md shadow-royal/20'
                    : isPast
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-gray-200'
                }`}>
                  {isPast
                    ? <span className="text-white text-xs font-bold">✓</span>
                    : isCurrent
                    ? <span className="text-white text-xs font-bold">{i + 1}</span>
                    : <span className="text-gray-300 text-xs font-bold">{i + 1}</span>
                  }
                </div>

                {/* Content */}
                <div className="pt-1.5">
                  <p className={`text-base font-bold ${isCurrent ? 'text-royal' : isPast ? 'text-gray-400 line-through' : 'text-dark'}`}>
                    {t.event}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar size={11} /> {t.date}
                  </p>
                  {isCurrent && (
                    <span className="mt-2 inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-royal/10 text-royal uppercase tracking-wide">
                      Current Stage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────── TAB: APPLICATION ──────────────────────── */
function ApplicationTab({ hack }) {
  return (
    <div className="space-y-5">

      {/* Your Profile card */}
      <Card className="px-7 py-6">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-5">Your Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: User,           label: 'Full Name',  value: MOCK_STUDENT.name   },
            { icon: Mail,           label: 'Email',      value: MOCK_STUDENT.email  },
            { icon: Phone,          label: 'Phone',      value: MOCK_STUDENT.phone  },
            { icon: GraduationCap,  label: 'College',    value: MOCK_STUDENT.college},
            { icon: Hash,           label: 'Branch',     value: MOCK_STUDENT.branch },
            { icon: Calendar,       label: 'Year',       value: MOCK_STUDENT.year   },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-dark">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          This info will be shared with the organizer. Update it in{' '}
          <a href="/student/profile" className="text-royal font-semibold hover:underline">your profile</a>.
        </p>
      </Card>

      {/* Team */}
      <TeamSection team={hack.team} />

      {/* Initial Submission */}
      <SubmissionSection submission={hack.submission} />

    </div>
  );
}

/* ─────────────────────── TAB: RESULTS ──────────────────────────── */
function ResultsTab({ hack }) {
  const hasResult = !!hack.result;
  const isSelected = hack.result?.selectionStatus === 'selected';

  if (!hasResult) {
    return (
      <Card className="px-7 py-14 text-center">
        <p className="text-4xl mb-4">⏳</p>
        <p className="text-base font-extrabold text-dark mb-2">Results Not Announced Yet</p>
        <p className="text-sm text-gray-500">Check back after the shortlist announcement date on the Timeline tab.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Shortlist status */}
      <ResultSection result={hack.result} />

      {/* Offline event — only if selected */}
      {isSelected && hack.offlineEvent && (
        <OfflineEventSection event={hack.offlineEvent} />
      )}

      {/* Final submission — only if selected */}
      {isSelected && (
        <FinalSubmissionSection finalSubmission={hack.finalSubmission} />
      )}
    </div>
  );
}

export default function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [hack, setHack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/hackathons/${id}`)
      .then(res => {
        const dbData = res.data.data;
        // Merge with safe mock defaults for tabs not yet fully backended
        setHack({
          ...dbData,
          team: null,
          submission: { pptUrl: '', resumeUrl: '', submissionDate: null },
          result: null,
          offlineEvent: null,
          finalSubmission: null,
          queries: []
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex flex-col">
        <StudentNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-royal animate-spin" />
        </div>
      </div>
    );
  }

  if (!hack) {
    return (
      <div className="min-h-screen bg-light-gray">
        <StudentNavbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <h2 className="text-2xl font-extrabold text-dark mb-3">Hackathon Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">This hackathon doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-light transition-all cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-royal transition-colors cursor-pointer mb-5"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* ── Banner + Hero Info Card (always visible, above tabs) ── */}
        <div className="mb-7 rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-white">

          {/* Banner */}
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            {hack.bannerImage
              ? <img src={hack.bannerImage} alt={hack.title} className="w-full h-full object-cover" />
              : <span className="text-gray-200 text-[120px] font-black select-none">{hack.title[0]}</span>
            }
          </div>

          {/* Hero Info row */}
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-5 items-start border-t border-gray-100">

            {/* Logo — overlapping-style, pulled up */}
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl shrink-0 shadow-lg -mt-5 border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center relative z-10">
              {hack.logoImage
                ? <img src={hack.logoImage} alt={hack.organizerName} className="w-full h-full object-cover" />
                : <span className="text-gray-400 font-black text-xl">{hack.organizerName?.[0] ?? hack.title[0]}</span>
              }
            </div>

            {/* MIDDLE — Name, Organizer, Tags, Meta */}
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
                {(hack.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-royal/8 text-royal border border-royal/15"
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

              {/* Meta pills */}
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                  <Users size={12} className="text-gray-400" />
                  Team: {hack.teamSize}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                  <Calendar size={12} className="text-red-400" />
                  Deadline: {hack.registrationDeadline}
                </span>
              </div>
            </div>

            {/* RIGHT — Prize Pool */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-6 py-4 min-w-[130px] text-center shrink-0 shadow-sm">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mb-0.5">Prize Pool</p>
              <p className="text-xl font-black text-dark">{hack.prizePool}</p>
            </div>

          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-7 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-royal text-white shadow-md'
                  : 'text-gray-500 hover:text-dark hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview'    && <OverviewTab    hack={hack} />}
        {activeTab === 'timeline'    && <TimelineTab    hack={hack} />}
        {activeTab === 'application' && <ApplicationTab hack={hack} />}
        {activeTab === 'results'     && <ResultsTab     hack={hack} />}

      </div>
    </div>
  );
}
