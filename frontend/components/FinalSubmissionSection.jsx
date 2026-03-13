import { useState } from 'react';
import { Github, Globe, Upload, Link2, CheckCircle2 } from 'lucide-react';

/* ─── Shared SectionCard ─── */
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

function LinkField({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-royal/20 focus-within:border-royal transition-all bg-white">
        <Icon size={15} className="text-gray-400 shrink-0" />
        <input
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm text-dark focus:outline-none bg-transparent min-w-0"
        />
        {value && <Link2 size={13} className="text-royal shrink-0" />}
      </div>
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

/* ─────────────────────── FINAL SUBMISSION SECTION ──────────
  Props:
    finalSubmission: {
      githubLink: string,
      deployLink: string,
      finalPptUrl: string
    } | null
─────────────────────────────────────────────────────────── */
export default function FinalSubmissionSection({ finalSubmission = null }) {
  const [github, setGithub]   = useState(finalSubmission?.githubLink || '');
  const [deploy, setDeploy]   = useState(finalSubmission?.deployLink || '');
  const [pptFile, setPptFile] = useState(null);
  const [done, setDone]       = useState(false);

  if (done) {
    return (
      <SectionCard title="Final Submission" icon={Github} iconBg="bg-dark/5" iconColor="text-dark">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Final submission received!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Your project has been submitted successfully.</p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Final Submission" icon={Github} iconBg="bg-dark/5" iconColor="text-dark">
      <p className="text-sm text-gray-500 mb-6">Submit your final project before the deadline. Include all deliverables.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); setDone(true); }}
        className="space-y-5"
      >
        <LinkField
          icon={Github}
          label="GitHub Repository URL"
          placeholder="https://github.com/your-org/project"
          value={github}
          onChange={setGithub}
        />
        <LinkField
          icon={Globe}
          label="Deployed Project URL"
          placeholder="https://your-project.vercel.app"
          value={deploy}
          onChange={setDeploy}
        />
        <UploadField
          label="Upload Final PPT"
          accept=".ppt,.pptx,.pdf"
          hint="PPT, PPTX or PDF"
          file={pptFile}
          onChange={setPptFile}
        />
        <button
          type="submit"
          disabled={!github && !deploy && !pptFile}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${
            (github || deploy || pptFile)
              ? 'bg-dark text-white hover:bg-gray-800 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Final Project
        </button>
      </form>
    </SectionCard>
  );
}
