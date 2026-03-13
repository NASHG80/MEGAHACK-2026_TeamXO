import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, Download, Award, Calendar } from 'lucide-react';

/* ─────────────────────── MOCK DATA ───────────────────────── */

const mockRegistered = [
  {
    hackathonId: 'h1',
    title: 'CodeStorm 2026',
    teamId: 'team_42',
    submissionStatus: 'Submitted',
    resultStatus: 'Shortlisted',
  },
  {
    hackathonId: 'h2',
    title: 'InnoVerse Hack',
    teamId: 'team_17',
    submissionStatus: 'Pending',
    resultStatus: 'Awaited',
  },
];

const mockOngoing = [
  {
    hackathonId: 'h1',
    title: 'CodeStorm 2026',
    workspaceNumber: 'WS-14B',
    eventDate: 'March 28, 2026',
  },
];

const mockCertificates = [
  {
    certificateId: 'cert_001',
    hackathonTitle: 'BuildFest 2025',
    certificateUrl: '#',
    issueDate: 'November 20, 2025',
  },
  {
    certificateId: 'cert_002',
    hackathonTitle: 'HackIndia 2025',
    certificateUrl: '#',
    issueDate: 'August 5, 2025',
  },
];

/* ─────────────────────── STATUS COLOR MAP ─────────────────── */

const STATUS_COLORS = {
  Submitted: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Shortlisted: 'bg-royal/10 text-royal',
  Awaited: 'bg-gray-100 text-gray-500',
};

/* ─────────────────────── EMPTY STATE ─────────────────────── */

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/* ─────────────────────── REGISTERED TAB ─────────────────── */

function RegisteredTab() {
  const navigate = useNavigate();
  if (!mockRegistered.length) return <EmptyState message="You have not registered for any hackathons yet." />;
  return (
    <div className="space-y-4">
      {mockRegistered.map((item) => (
        <div
          key={item.hackathonId}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center shrink-0">
              <ClipboardList size={18} className="text-royal" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Team ID: {item.teamId}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[item.submissionStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {item.submissionStatus}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[item.resultStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {item.resultStatus}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/hackathon/${item.hackathonId}`)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-royal border border-royal/20 hover:bg-royal hover:text-white transition-all self-start sm:self-center cursor-pointer"
          >
            Details <ArrowRight size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── ONGOING TAB ─────────────────────── */

function OngoingTab() {
  const navigate = useNavigate();
  if (!mockOngoing.length) return <EmptyState message="No ongoing offline events at the moment." />;
  return (
    <div className="space-y-4">
      {mockOngoing.map((item) => (
        <div
          key={item.hackathonId}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-violet-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Workspace: <span className="font-bold text-dark">{item.workspaceNumber}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Event Date: <span className="font-semibold text-dark">{item.eventDate}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/hackathon/${item.hackathonId}?section=offline`)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-violet-600 border border-violet-200 hover:bg-violet-600 hover:text-white transition-all self-start sm:self-center cursor-pointer"
          >
            View Event <ArrowRight size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────── CERTIFICATES TAB ───────────────────── */

function CertificatesTab() {
  if (!mockCertificates.length) return <EmptyState message="No certificates received yet. Keep participating!" />;
  return (
    <div className="space-y-3">
      {mockCertificates.map((cert) => (
        <div
          key={cert.certificateId}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Award size={18} className="text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{cert.hackathonTitle}</h4>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Issued: {cert.issueDate}</p>
              <p className="text-[10px] font-mono text-gray-300 mt-1">ID: {cert.certificateId}</p>
            </div>
          </div>
          <a
            href={cert.certificateUrl}
            download
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white transition-all self-start sm:self-center cursor-pointer"
          >
            <Download size={13} /> Download
          </a>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── TABS CONFIG ─────────────────────── */

const TABS = [
  { id: 'registered',   label: 'Registered',   Component: RegisteredTab   },
  { id: 'ongoing',      label: 'Ongoing',       Component: OngoingTab      },
  { id: 'certificates', label: 'Certificates',  Component: CertificatesTab },
];

/* ─────────────────────── ACTIVITY TABS ─────────────────────*/

export default function ActivityTabs() {
  const [active, setActive] = useState('registered');
  const { Component } = TABS.find((t) => t.id === active);

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold transition-all -mb-px cursor-pointer ${
              active === tab.id
                ? 'text-royal border-b-2 border-royal'
                : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Component />
    </div>
  );
}
