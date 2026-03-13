import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHackathonBySlug } from '../../api/hackathonApi';
import StudentNavbar from '../../components/StudentNavbar';
import {
  Users, Loader2, CheckCircle2, ArrowLeft, AlertCircle,
  Info, Upload, FileText, Layers, Copy, Check,
  UserCircle2, Shield, LogIn,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

function decodeToken() {
  try {
    const token = localStorage.getItem('hf_token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
}

export default function HackathonRegisterPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [hack,    setHack]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [leader,  setLeader]  = useState({ name: '', email: '', id: '' });

  const [mode, setMode] = useState('create');

  const [teamName,   setTeamName]   = useState('');
  const [college,    setCollege]    = useState('');
  const [domain,     setDomain]     = useState('');
  const [psId,       setPsId]       = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [pptFile,    setPptFile]    = useState(null);
  const [joinCode,   setJoinCode]   = useState('');
  const [joinCollege, setJoinCollege] = useState('');

  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [createdTeam, setCreatedTeam] = useState(null); // { _id, teamName, teamCode }
  const [joinedTeam,  setJoinedTeam]  = useState(null);
  const [liveMembers, setLiveMembers] = useState([]);
  const [copied,      setCopied]      = useState(false);

  /* ── Load hackathon + leader ───────────────────────────── */
  useEffect(() => {
    getHackathonBySlug(slug)
      .then(r => setHack(r.data.data))
      .catch(() => setError('Hackathon not found'))
      .finally(() => setLoading(false));

    const p = decodeToken();
    if (p.name && p.email) {
      setLeader({ name: p.name, email: p.email, id: p.id || p._id || '' });
    } else {
      const token = localStorage.getItem('hf_token');
      if (token) {
        fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => {
            const u = data.user || data;
            setLeader({ name: u.name || '', email: u.email || '', id: u._id || p.id || '' });
          })
          .catch(() => {});
      }
    }
  }, [slug]);

  /* ── Poll live members every 5s ───────────────────────── */
  useEffect(() => {
    if (!createdTeam?._id) return;
    const token = localStorage.getItem('hf_token');
    const poll = () => {
      fetch(`${API}/teams/${createdTeam._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data.success && data.data?.members) setLiveMembers(data.data.members); })
        .catch(() => {});
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [createdTeam?._id]);

  /* ── Create team ──────────────────────────────────────── */
  const handleCreate = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      const token = localStorage.getItem('hf_token');

      const teamRes = await fetch(`${API}/teams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamName, hackathonId: hack._id }),
      }).then(r => r.json());

      // Already in a team → fetch that team and show its details
      if (!teamRes.success && teamRes.message?.toLowerCase().includes('already part of a team')) {
        const ex = await fetch(`${API}/teams/by-hackathon/${hack._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        if (ex.success && ex.data) {
          const t = ex.data;
          setCreatedTeam({ _id: t._id, teamName: t.teamName, teamCode: t.teamCode });
          setLiveMembers(t.members || []);
          return;
        }
        throw new Error(teamRes.message);
      }

      if (!teamRes.success) throw new Error(teamRes.message);

      // Register the leader
      const fd = new FormData();
      fd.append('hackathonId', hack._id);
      fd.append('teamName',    teamRes.teamName || teamName);
      fd.append('leaderName',  leader.name);
      fd.append('leaderEmail', leader.email);
      fd.append('college',     college);
      fd.append('domain',      domain);
      fd.append('psId',        psId);
      fd.append('teamMembers', JSON.stringify([]));
      if (resumeFile) fd.append('resume', resumeFile);

      const regRes = await fetch(`${API}/registrations/register-with-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(r => r.json());
      if (!regRes.success && !regRes.message?.toLowerCase().includes('already')) {
        throw new Error(regRes.message);
      }

      setCreatedTeam({ _id: teamRes._id, teamName: teamRes.teamName || teamName, teamCode: teamRes.teamCode });
      setLiveMembers(teamRes.members || []);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Join team ────────────────────────────────────────── */
  const handleJoin = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      const token = localStorage.getItem('hf_token');

      // Already in a team check via join code lookup
      const res = await fetch(`${API}/teams/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamCode: joinCode.trim().toUpperCase(), college: joinCollege.trim() }),
      }).then(r => r.json());

      if (!res.success && res.message?.toLowerCase().includes('already a member')) {
        // Show team details even if already joined
        const ex = await fetch(`${API}/teams/by-hackathon/${hack._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        if (ex.success && ex.data) { setJoinedTeam(ex.data); return; }
      }

      if (!res.success) throw new Error(res.message);
      setJoinedTeam(res);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = code => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  /* ── States ───────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="w-10 h-10 text-royal animate-spin" />
        <p className="text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  );

  if (error || !hack) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex flex-col items-center justify-center gap-5 text-center py-40 px-4">
        <AlertCircle className="w-14 h-14 text-red-300" />
        <h2 className="text-xl font-extrabold text-dark">{error || 'Not found'}</h2>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  /* ── Created Team Success ─────────────────────────────── */
  if (createdTeam) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-1">Team Created! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">Share this code with teammates so they can join.</p>

          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-6 py-5 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Team Code</p>
            <p className="text-4xl font-black text-royal tracking-[0.25em] mb-3">{createdTeam.teamCode}</p>
            <button onClick={() => copyCode(createdTeam.teamCode)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-royal text-white text-xs font-bold shadow-sm hover:bg-royal-light transition-all">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="text-left mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team: {createdTeam.teamName}</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {liveMembers.length} member{liveMembers.length !== 1 ? 's' : ''} · Live
              </span>
            </div>
            <div className="space-y-1.5 bg-gray-50 rounded-xl border border-gray-100 p-3">
              {liveMembers.length === 0
                ? <p className="text-xs text-gray-400 text-center py-2">No members yet…</p>
                : liveMembers.map((m, i) => (
                  <div key={m._id || i} className="flex items-center gap-2 text-sm text-dark font-medium">
                    <UserCircle2 size={14} className="text-royal shrink-0" />
                    <span className="flex-1">{m.name || m.email || `Member ${i + 1}`}</span>
                    {i === 0 && <span className="text-[10px] font-bold text-royal bg-royal/10 px-2 py-0.5 rounded-full">Leader</span>}
                  </div>
                ))
              }
            </div>
          </div>

          <Link to={`/hackathon/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-royal transition-colors">
            <ArrowLeft size={14} /> Back to hackathon
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── Joined Team Success ──────────────────────────────── */
  if (joinedTeam) return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-1">Joined Team! 🙌</h2>
          <p className="text-sm text-gray-500 mb-6">You're now part of <strong>{joinedTeam.teamName}</strong>.</p>

          <div className="text-left mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Team Members</p>
            <div className="space-y-1.5 bg-gray-50 rounded-xl border border-gray-100 p-3">
              {(joinedTeam.members || []).map((m, i) => (
                <div key={m._id || i} className="flex items-center gap-2 text-sm text-dark font-medium">
                  <UserCircle2 size={14} className="text-blue-500 shrink-0" />
                  <span className="flex-1">{m.name || m.email || `Member ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to={`/hackathon/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-royal transition-colors">
            <ArrowLeft size={14} /> Back to hackathon
          </Link>
        </div>
      </div>
    </div>
  );

  /* ═══ Main Form ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <StudentNavbar />

      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container-lg py-5 flex items-center gap-4">
          <Link to={`/hackathon/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-royal font-semibold transition-colors">
            <ArrowLeft size={15} /> Back
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center bg-gray-50">
              {hack?.logoImage
                ? <img src={hack.logoImage} alt="" className="w-full h-full object-cover" />
                : <span className="text-gray-400 font-bold">{hack?.organizerName?.[0]}</span>
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-royal">{hack?.organizerName}</p>
              <h1 className="text-sm font-extrabold text-dark">Register for {hack?.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container-lg py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="card p-5 sticky top-20 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-royal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Registering as</p>
                  <p className="text-sm font-bold text-dark">{leader.name || '—'}</p>
                  <p className="text-xs text-gray-400">{leader.email}</p>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-royal shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create a team to get a shareable code. Teammates paste that code to join.
                </p>
              </div>
              <hr className="border-gray-100" />
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-semibold text-dark">{hack?.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Size</span>
                  <span className="font-semibold text-dark">{hack?.teamSizeMin}–{hack?.teamSizeMax}</span>
                </div>
                {hack?.eligibility && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eligibility</span>
                    <span className="font-semibold text-dark text-right max-w-[130px]">{hack?.eligibility}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">

            {submitError && (
              <div className="flex items-start gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                <AlertCircle size={15} className="shrink-0 mt-0.5" /> {submitError}
              </div>
            )}

            <div className="space-y-5">

              {/* Your Details */}
              <div className="form-card">
                <h2 className="form-card-title flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-royal" /> Your Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                    <p className="text-sm font-semibold text-dark">{leader.name || '—'}</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-dark">{leader.email || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">College / Institution</label>
                    <input value={college} onChange={e => setCollege(e.target.value)}
                      className="input" placeholder="Your college or university name" />
                  </div>
                </div>
              </div>

              {/* Create-mode fields */}
              {mode === 'create' && (<>
                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <Users className="w-4 h-4 text-royal" /> Team Details
                  </h2>
                  <label className="label">Team Name *</label>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)}
                    className="input" placeholder="e.g. Code Avengers" />
                </div>

                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <Layers className="w-4 h-4 text-royal" /> Domain &amp; Problem Statement
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Domain *</label>
                      <input value={domain} onChange={e => setDomain(e.target.value)}
                        className="input" placeholder="e.g. AI/ML, FinTech" />
                    </div>
                    <div>
                      <label className="label">PS ID *</label>
                      <input value={psId} onChange={e => setPsId(e.target.value)}
                        className="input" placeholder="e.g. PS-101" />
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <Upload className="w-4 h-4 text-royal" /> Uploads
                  </h2>
                  <div className="mb-4">
                    <p className="label mb-1.5">Resume <span className="text-gray-400 font-normal">(PDF / PNG / JPG)</span></p>
                    <p className="text-xs text-gray-400 mb-2">AI-scored to help organizers shortlist your team.</p>
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-royal hover:bg-royal/5 transition-all group">
                      <FileText size={18} className="text-gray-400 group-hover:text-royal" />
                      {resumeFile
                        ? <span className="text-sm font-medium text-royal">{resumeFile.name}</span>
                        : <span className="text-sm text-gray-400">Upload <span className="text-royal font-semibold">Resume</span></span>
                      }
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                        onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <div>
                    <p className="label mb-1.5">PPT / Presentation <span className="text-gray-400 font-normal">(PDF / PPTX)</span></p>
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-royal hover:bg-royal/5 transition-all group">
                      <Layers size={18} className="text-gray-400 group-hover:text-royal" />
                      {pptFile
                        ? <span className="text-sm font-medium text-royal">{pptFile.name}</span>
                        : <span className="text-sm text-gray-400">Upload <span className="text-royal font-semibold">PPT / Slides</span></span>
                      }
                      <input type="file" accept=".pdf,.ppt,.pptx" className="hidden"
                        onChange={e => setPptFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </>)}

              {/* Join-mode code input */}
              {mode === 'join' && (
                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-royal" /> Join with Team Code
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Ask your team leader for the 6-character code and enter it below.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Team Code *</label>
                      <input
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                        className="input text-center text-2xl font-black tracking-[0.4em] uppercase"
                        placeholder="X4K9P2"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="label">Your College / Institution *</label>
                      <input
                        value={joinCollege}
                        onChange={e => setJoinCollege(e.target.value)}
                        className="input"
                        placeholder="e.g. NMIMS Mumbai"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom action buttons */}
              <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={mode === 'create' ? handleCreate : () => { setMode('create'); setSubmitError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all disabled:opacity-60 ${
                    mode === 'create' ? 'bg-royal text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {submitting && mode === 'create'
                    ? <><Loader2 size={15} className="animate-spin" /> Creating…</>
                    : <><Users size={15} /> Create a Team</>
                  }
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={mode === 'join' ? handleJoin : () => { setMode('join'); setSubmitError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all disabled:opacity-60 ${
                    mode === 'join' ? 'bg-royal text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {submitting && mode === 'join'
                    ? <><Loader2 size={15} className="animate-spin" /> Joining…</>
                    : <><LogIn size={15} /> Join a Team</>
                  }
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
