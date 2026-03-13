import { useState } from 'react';
import { Award, Download, Eye, Calendar, Search, FileX } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

/* ─────────────────────── MOCK DATA ─────────────────────── */

const mockCertificates = [
  {
    certificateId: 'cert_001',
    hackathonTitle: 'BuildFest 2025',
    certificateUrl: '#',
    issueDate: 'November 20, 2025',
    organizer: 'IIT Delhi',
    rank: '2nd Place',
    badgeColor: 'from-amber-400 to-amber-600',
    accentColor: 'border-amber-300',
  },
  {
    certificateId: 'cert_002',
    hackathonTitle: 'HackIndia 2025',
    certificateUrl: '#',
    issueDate: 'August 5, 2025',
    organizer: 'NASSCOM',
    rank: 'Participant',
    badgeColor: 'from-royal to-royal-light',
    accentColor: 'border-blue-300',
  },
  {
    certificateId: 'cert_003',
    hackathonTitle: 'DataThon Winter \'24',
    certificateUrl: '#',
    issueDate: 'December 18, 2024',
    organizer: 'Google DSC',
    rank: '3rd Place',
    badgeColor: 'from-emerald-400 to-emerald-600',
    accentColor: 'border-emerald-300',
  },
];

/* ─────────────────────── CERTIFICATE CARD ─────────────────── */

function CertificateCard({ cert }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(30,58,138,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Certificate Preview Area */}
      <div className={`relative h-40 bg-linear-to-br ${cert.badgeColor} flex flex-col items-center justify-center gap-2 overflow-hidden`}>
        {/* Decorative rings */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />

        {/* Cert Icon */}
        <div className="relative w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <Award size={30} className="text-white" />
        </div>

        <span className="relative text-white/90 text-xs font-bold uppercase tracking-widest">Certificate of Achievement</span>

        {/* Rank badge */}
        <span className="relative inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/30">
          {cert.rank}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-base font-extrabold text-dark leading-snug group-hover:text-royal transition-colors mb-1">
          {cert.hackathonTitle}
        </h3>
        <p className="text-xs font-semibold text-gray-400 mb-4">{cert.organizer}</p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-5">
          <Calendar size={12} className="text-gray-400" />
          Issued: {cert.issueDate}
        </div>

        <p className="text-[10px] font-mono text-gray-300 mb-5">ID: {cert.certificateId}</p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={cert.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-royal border-2 border-royal/20 hover:bg-royal hover:text-white hover:border-royal transition-all duration-200 cursor-pointer"
          >
            <Eye size={14} /> View
          </a>
          <a
            href={cert.certificateUrl}
            download
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-royal hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── EMPTY STATE ───────────────────── */

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-light-gray flex items-center justify-center mx-auto mb-5">
        <FileX size={28} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-dark mb-2">No Certificates Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Participate in hackathons and complete them to earn certificates. They'll show up here.
      </p>
    </div>
  );
}

/* ─────────────────────── CERTIFICATES PAGE ───────────────── */

export default function Certificates() {
  const [search, setSearch] = useState('');

  const filtered = mockCertificates.filter(c =>
    c.hackathonTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.organizer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-2">
              My Achievements
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Your <span className="text-royal">Certificates</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">{mockCertificates.length} certificate{mockCertificates.length !== 1 ? 's' : ''} earned</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Certificate Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0
            ? filtered.map(cert => <CertificateCard key={cert.certificateId} cert={cert} />)
            : <EmptyState />
          }
        </div>

      </div>
    </div>
  );
}
