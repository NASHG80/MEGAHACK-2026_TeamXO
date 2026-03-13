import { useState } from 'react';
import { Upload, CheckCircle2, ExternalLink } from 'lucide-react';

/* ─── Shared helpers ─── */
function SectionCard({ title, icon: Icon, iconBg = 'bg-royal/5', iconColor = 'text-royal', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        <h2 className="text-base font-extrabold text-dark">{title}</h2>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

function UploadField({ label, accept, hint, file, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <label className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-royal hover:bg-royal/5 transition-all cursor-pointer group">
        <span className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-royal transition-colors">
          <Upload size={15} /> {file ? file.name : `Choose file — ${hint}`}
        </span>
        {file && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}

function FileLink({ label, url }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-light-gray">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
            View <ExternalLink size={12} />
          </a>
        : <span className="text-xs text-gray-400">Not uploaded</span>
      }
    </div>
  );
}

/* ─────────────────────── SUBMISSION SECTION ─────────────────
  Props:
    submission: {
      pptUrl: string,
      resumeUrl: string,
      submissionDate: string | null
    } | null
─────────────────────────────────────────────────────────── */
export default function SubmissionSection({ submission = null }) {
  const [pptFile, setPptFile]       = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitted, setSubmitted]   = useState(!!(submission?.pptUrl));
  const [editing, setEditing]       = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEditing(false);
  };

  /* ── Already submitted ── */
  if (submitted && !editing) {
    return (
      <SectionCard title="Initial Submission" icon={Upload} iconBg="bg-emerald-50" iconColor="text-emerald-600">
        <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Submission Received</p>
            {submission?.submissionDate && (
              <p className="text-xs text-emerald-600 mt-0.5">Submitted on {submission.submissionDate}</p>
            )}
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <FileLink label="PPT / Presentation" url={submission?.pptUrl || pptFile?.name} />
          <FileLink label="Resume" url={submission?.resumeUrl || resumeFile?.name} />
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-royal border-2 border-royal/20 hover:bg-royal hover:text-white hover:border-royal transition-all cursor-pointer"
        >
          Edit Submission
        </button>
      </SectionCard>
    );
  }

  /* ── Upload form ── */
  return (
    <SectionCard title="Initial Submission" icon={Upload} iconBg="bg-emerald-50" iconColor="text-emerald-600">
      <p className="text-sm text-gray-500 mb-6">Upload your PPT and resume before the deadline. You can edit until the deadline.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <UploadField
          label="Upload PPT / Presentation"
          accept=".ppt,.pptx,.pdf"
          hint="PPT, PPTX or PDF"
          file={pptFile}
          onChange={setPptFile}
        />
        <UploadField
          label="Upload Resume"
          accept=".pdf"
          hint="PDF only"
          file={resumeFile}
          onChange={setResumeFile}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-royal text-white text-sm font-bold hover:bg-royal-light transition-all shadow-md cursor-pointer"
          >
            Submit
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
