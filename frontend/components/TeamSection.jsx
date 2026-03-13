import { useState } from 'react';
import { Users, Copy, Star, Plus, Hash, CheckCircle2, ArrowLeft, UserPlus, Shuffle } from 'lucide-react';

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

/* ─── Generate a random team code ─── */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ─── Copyable code pill ─── */
function CodePill({ code }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
      <div>
        <p className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-0.5">Team Invite Code</p>
        <p className="text-xl font-mono font-extrabold text-violet-700 tracking-widest">{code}</p>
      </div>
      <button
        onClick={doCopy}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-violet-200 text-sm font-semibold text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all cursor-pointer"
      >
        <Copy size={13} />
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

/* ─── Member row ─── */
function MemberRow({ member }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <div className="w-9 h-9 rounded-full bg-royal/10 text-royal font-bold text-xs flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark truncate">{member.name}</p>
        <p className="text-xs text-gray-500 truncate">{member.email}</p>
      </div>
      {member.role === 'Leader' && (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-royal/5 text-royal shrink-0">
          <Star size={9} className="inline -mt-0.5 mr-0.5" />Leader
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────────
  Props:
    team: { teamId, teamCode, leaderId, members: [{name, email, role}] } | null

  Internal flow (when team prop is null):
    'choose'  → show Create / Join option cards
    'create'  → "Create Team" form (team name + generated code preview)
    'join'    → "Join Team" form (enter code)
    'done'    → shows the team dashboard (same as when team prop is provided)
──────────────────────────────────────────────────────────────────────── */
export default function TeamSection({ team: initialTeam = null }) {
  // If a team is already passed in (from mock DB), go straight to 'done'
  const [view, setView] = useState(initialTeam ? 'done' : 'choose');
  const [generatedCode] = useState(generateCode);      // created once, stable
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [team, setTeam] = useState(initialTeam);

  /* ── CREATE: confirm team creation ── */
  const handleCreate = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setTeam({
      teamId: `team_${Date.now()}`,
      teamCode: generatedCode,
      leaderId: 'stu_me',
      members: [{ name: 'You (Leader)', email: 'you@college.edu', role: 'Leader' }],
    });
    setView('done');
  };

  /* ── JOIN: validate & join ── */
  const handleJoin = (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (code.length < 6) {
      setJoinError('Please enter a valid team code.');
      return;
    }
    // Simulate joining — in real app this hits an API
    setTeam({
      teamId: `team_joined_${Date.now()}`,
      teamCode: code,
      leaderId: 'stu_other',
      members: [
        { name: 'Team Leader', email: 'leader@college.edu', role: 'Leader' },
        { name: 'You', email: 'you@college.edu', role: 'Member' },
      ],
    });
    setView('done');
  };

  /* ════════════════ VIEW: CHOOSE ════════════════ */
  if (view === 'choose') {
    return (
      <SectionCard title="Team Registration" icon={Users} iconBg="bg-violet-50" iconColor="text-violet-600">
        <p className="text-sm text-gray-500 mb-7">
          You haven't registered a team for this hackathon yet. Create a new team or join an existing one with an invite code.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Create Team Card */}
          <button
            onClick={() => setView('create')}
            className="flex flex-col items-start gap-3 p-6 rounded-2xl border-2 border-violet-100 bg-violet-50/40 hover:border-violet-500 hover:bg-violet-50 transition-all text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-dark">Create Team</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Start a new team, get an invite code, and add members.
              </p>
            </div>
            <span className="text-xs font-bold text-violet-600 mt-auto">Get Started →</span>
          </button>

          {/* Join Team Card */}
          <button
            onClick={() => setView('join')}
            className="flex flex-col items-start gap-3 p-6 rounded-2xl border-2 border-gray-100 bg-gray-50/60 hover:border-royal hover:bg-royal/5 transition-all text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-royal flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Hash size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-dark">Join Team</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Have an invite code? Enter it here to join your teammate's team.
              </p>
            </div>
            <span className="text-xs font-bold text-royal mt-auto">Enter Code →</span>
          </button>
        </div>
      </SectionCard>
    );
  }

  /* ════════════════ VIEW: CREATE TEAM ════════════════ */
  if (view === 'create') {
    return (
      <SectionCard title="Create Team" icon={Plus} iconBg="bg-violet-50" iconColor="text-violet-600">
        <button
          onClick={() => setView('choose')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-royal mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Team Name
            </label>
            <input
              type="text"
              placeholder="e.g. Team Nexus"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              required
            />
          </div>

          {/* Generated Invite Code preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                Your Team Invite Code
              </label>
              <span className="text-[10px] text-gray-400 font-medium">Share this with your teammates</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="flex-1 text-xl font-mono font-extrabold text-violet-700 tracking-widest">
                {generatedCode}
              </p>
              <Shuffle size={14} className="text-violet-400" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              This code is auto-generated. Share it so teammates can join your team.
            </p>
          </div>

          <button
            type="submit"
            disabled={!teamName.trim()}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${
              teamName.trim()
                ? 'bg-violet-600 text-white hover:bg-violet-700 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Create Team
          </button>
        </form>
      </SectionCard>
    );
  }

  /* ════════════════ VIEW: JOIN TEAM ════════════════ */
  if (view === 'join') {
    return (
      <SectionCard title="Join Team" icon={UserPlus} iconBg="bg-royal/5" iconColor="text-royal">
        <button
          onClick={() => { setView('choose'); setJoinError(''); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-royal mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Team Invite Code
            </label>
            <input
              type="text"
              placeholder="e.g. ABCD1234"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-dark font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-royal/20 transition-all ${
                joinError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-royal'
              }`}
              maxLength={12}
            />
            {joinError && <p className="text-xs text-red-500 font-medium mt-1.5">{joinError}</p>}
            <p className="text-[11px] text-gray-400 mt-1.5">
              Ask your team leader for the invite code.
            </p>
          </div>

          <button
            type="submit"
            disabled={!joinCode.trim()}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${
              joinCode.trim()
                ? 'bg-royal text-white hover:bg-royal-light cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Join Team
          </button>
        </form>
      </SectionCard>
    );
  }

  /* ════════════════ VIEW: TEAM DASHBOARD (done) ════════════════ */
  return (
    <SectionCard title="Team" icon={Users} iconBg="bg-violet-50" iconColor="text-violet-600">
      {/* Success banner */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-700">You're in a team!</p>
          <p className="text-xs text-emerald-600 mt-0.5">Your team is registered for this hackathon.</p>
        </div>
      </div>

      {/* Invite Code */}
      <div className="mb-6">
        <CodePill code={team?.teamCode ?? '—'} />
      </div>

      {/* Members List */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Members ({team?.members?.length ?? 0})
        </p>
        <div className="space-y-2">
          {team?.members?.map((m, i) => (
            <MemberRow key={i} member={m} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
