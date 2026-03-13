import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHackathonBySlug } from '../../api/hackathonApi';
import StudentNavbar from '../../components/StudentNavbar';
import {
  Users, Plus, Trash2, Loader2, CheckCircle2,
  ArrowLeft, AlertCircle, Info, Upload, FileText,
} from 'lucide-react';

export default function HackathonRegisterPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [hack,     setHack]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [submit,   setSubmit]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [regData,  setRegData]  = useState(null); // saved registration info
  const [error,    setError]    = useState('');

  const [form, setForm] = useState({
    teamName: '', leaderName: '', leaderEmail: '', college: '',
    teamMembers: [{ name: '', email: '', college: '' }],
  });
  const [resumeFile, setResumeFile] = useState(null);

  // Decode JWT to get logged-in user's email
  const getEmailFromToken = () => {
    try {
      const token = localStorage.getItem('hf_token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.leaderEmail || '';
    } catch { return ''; }
  };

  // On mount: load hackathon and pre-fill email from JWT
  useEffect(() => {
    getHackathonBySlug(slug)
      .then(r => {
        setHack(r.data.data);
        // Pre-fill leaderEmail from JWT token
        const email = getEmailFromToken();
        if (email) setForm(f => ({ ...f, leaderEmail: email }));
      })
      .catch(() => setError('Hackathon not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Once hackathon loaded: ALWAYS verify with backend (localStorage may be stale)
  useEffect(() => {
    if (!hack) return;
    const storageKey = `reg_${hack._id}`;
    const userEmail  = getEmailFromToken() || localStorage.getItem('hf_user_email');

    if (!userEmail) {
      // No email yet — fall back to localStorage-only (pre-login view)
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.id) { setRegData(parsed); setSuccess(true); }
        } catch {}
      }
      return;
    }

    // Always check backend — localStorage might have a stale/deleted record
    fetch(`http://localhost:5000/api/registrations/check/${hack._id}/${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then(data => {
        if (data.registered && data.data) {
          const entry = { ...data.data, id: data.data._id };
          setRegData(entry);
          setSuccess(true);
          localStorage.setItem(storageKey, JSON.stringify(entry));
        } else {
          // Backend says not registered — clear any stale localStorage entry
          localStorage.removeItem(storageKey);
          setSuccess(false);
          setRegData(null);
        }
      })
      .catch(() => {
        // Network error — fall back to localStorage if it has a valid entry
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.id) { setRegData(parsed); setSuccess(true); }
          } catch {}
        }
      });
  }, [hack]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const memberSet = (i, k, v) => {
    const m = [...form.teamMembers];
    m[i] = { ...m[i], [k]: v };
    set('teamMembers', m);
  };
  const addMember = () => {
    if (hack && form.teamMembers.length >= hack.teamSizeMax - 1) return;
    set('teamMembers', [...form.teamMembers, { name: '', email: '', college: '' }]);
  };
  const removeMember = i => set('teamMembers', form.teamMembers.filter((_, x) => x !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmit(true); setError('');
    try {
      const fd = new FormData();
      fd.append('hackathonId', hack._id);
      fd.append('teamName',    form.teamName);
      fd.append('leaderName',  form.leaderName);
      fd.append('leaderEmail', form.leaderEmail);
      fd.append('college',     form.college);
      fd.append('teamMembers', JSON.stringify(form.teamMembers));
      if (resumeFile) fd.append('resume', resumeFile);

      const token = localStorage.getItem('hf_token');
      const res = await fetch('http://localhost:5000/api/registrations/register-with-resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');

      // Save to localStorage keyed by hackathon _id so reload restores success screen
      const saved = { ...(data.data || {}), id: data.data?.id, teamName: form.teamName };
      localStorage.setItem(`reg_${hack._id}`, JSON.stringify(saved));
      localStorage.setItem('hf_user_email', form.leaderEmail);
      setRegData(saved);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmit(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />
      <div className="flex-1 flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-royal" />
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6 py-40">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-dark mb-2">You're In! 🎉</h1>
          <p className="text-gray-500 max-w-sm mb-2">
            Team <strong className="text-dark">{regData?.teamName || form.teamName}</strong> is registered for{' '}
            <strong className="text-dark">{hack?.title}</strong>.
          </p>
          {regData?.aiScore != null && (
            <p className="text-sm font-semibold mb-6">
              AI Resume Score: <span className="text-royal font-black text-lg">{regData.aiScore}/100</span>
            </p>
          )}
          {regData?.aiScore == null && (
            <p className="text-xs text-gray-400 mb-6">Resume score will appear here once processed.</p>
          )}
          <Link to={`/hackathon/${slug}`} className="btn-primary px-8 py-3 text-base">
            Back to Event Page
          </Link>
        </div>
      </div>
    </div>
  );

  const maxMembers = hack ? hack.teamSizeMax - 1 : 4;
  const canAddMore = form.teamMembers.length < maxMembers;

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <StudentNavbar />

      <div className="pt-16">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container-lg py-5">
            <Link to={`/hackathon/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-royal mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to {hack?.title}
            </Link>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0
                              bg-gradient-to-br from-royal to-purple-600 flex items-center justify-center">
                {hack?.organizerLogo
                  ? <img src={hack.organizerLogo} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-xl">{hack?.organizerName?.charAt(0)}</span>
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-royal uppercase tracking-wide mb-0.5">
                  {hack?.organizerName}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold text-dark">
                  Register for {hack?.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Team size: {hack?.teamSizeMin}–{hack?.teamSizeMax} members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container-lg py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

            {/* Left: info card */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="card p-5 sticky top-20">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-royal mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-dark text-sm mb-1">Registration Info</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      One person registers per team. Add members below. The team leader's email
                      cannot be reused for the same event.
                    </p>
                  </div>
                </div>
                <hr className="border-gray-100 mb-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode</span>
                    <span className="font-semibold text-dark">{hack?.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Size</span>
                    <span className="font-semibold text-dark">{hack?.teamSizeMin}–{hack?.teamSizeMax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eligibility</span>
                    <span className="font-semibold text-dark text-right max-w-[130px]">{hack?.eligibility}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Team Details */}
                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <Users className="w-4 h-4 text-royal" /> Team Details
                  </h2>
                  <div>
                    <label className="label">Team Name *</label>
                    <input value={form.teamName} onChange={e => set('teamName', e.target.value)}
                      className="input" placeholder="e.g. Code Avengers" required />
                  </div>
                </div>

                {/* Team Leader */}
                <div className="form-card">
                  <h2 className="form-card-title">Team Leader (You)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input value={form.leaderName} onChange={e => set('leaderName', e.target.value)}
                        className="input" placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" value={form.leaderEmail}
                        onChange={e => set('leaderEmail', e.target.value)}
                        className="input" placeholder="leader@example.com" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">College / Institution *</label>
                      <input value={form.college} onChange={e => set('college', e.target.value)}
                        className="input" placeholder="Your college or university name" required />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="form-card">
                  <h2 className="form-card-title flex items-center gap-2">
                    <FileText className="w-4 h-4 text-royal" /> Resume Upload
                  </h2>
                  <p className="text-xs text-gray-400 mb-3">
                    Your resume will be automatically scored by AI to help organizers shortlist candidates.
                  </p>
                  <label className="flex flex-col items-center justify-center gap-3 w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-royal hover:bg-royal/5 transition-all duration-200 group">
                    <Upload size={22} className="text-gray-400 group-hover:text-royal transition-colors" />
                    {resumeFile ? (
                      <span className="text-sm font-medium text-royal">{resumeFile.name}</span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Click to upload <span className="text-royal font-semibold">Resume</span>{' '}(PDF / PNG / JPG)
                      </span>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* Team Members */}
                <div className="form-card">
                  <div className="flex items-center justify-between form-card-title">
                    <span>Team Members</span>
                    <span className="text-xs font-normal text-gray-400">
                      {form.teamMembers.length + 1} / {hack?.teamSizeMax} added
                    </span>
                  </div>

                  {form.teamMembers.map((m, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 mb-4 bg-gray-50 relative">
                      {form.teamMembers.length > 1 && (
                        <button type="button" onClick={() => removeMember(i)}
                          className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Member {i + 2}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="label">Name</label>
                          <input value={m.name} onChange={e => memberSet(i, 'name', e.target.value)}
                            className="input" placeholder="Full name" />
                        </div>
                        <div>
                          <label className="label">Email</label>
                          <input value={m.email} onChange={e => memberSet(i, 'email', e.target.value)}
                            className="input" placeholder="email@example.com" />
                        </div>
                        <div>
                          <label className="label">College</label>
                          <input value={m.college} onChange={e => memberSet(i, 'college', e.target.value)}
                            className="input" placeholder="Institution" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {canAddMore && (
                    <button type="button" onClick={addMember}
                      className="text-royal text-xs font-semibold flex items-center gap-1 hover:text-royal-light">
                      <Plus className="w-3.5 h-3.5" /> Add Team Member
                    </button>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200
                                  text-red-700 rounded-xl p-4 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={submit} className="btn-register disabled:opacity-60">
                  {submit
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering…</>
                    : '✅ Confirm Registration'
                  }
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
