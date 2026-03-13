import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, Clock, AlertCircle, User,
  GraduationCap, Linkedin, Globe, Upload,
  ShieldCheck, FileText, X, Camera, Edit3, Zap,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('hf_token');
const getUser  = () => ({
  name:  localStorage.getItem('hf_name')  || 'Organizer',
  email: localStorage.getItem('hf_email') || '',
});

/* ─── STATUS CONFIG ─── */
const STATUS_MAP = {
  unverified: { label: 'Not Verified',      icon: AlertCircle,  cls: 'text-amber-600 bg-amber-50 ring-amber-200'       },
  pending:    { label: 'Under Review',       icon: Clock,        cls: 'text-blue-600  bg-blue-50  ring-blue-200'        },
  approved:   { label: 'Verified Organizer', icon: ShieldCheck,  cls: 'text-emerald-600 bg-emerald-50 ring-emerald-200' },
  rejected:   { label: 'Rejected',           icon: AlertCircle,  cls: 'text-red-600 bg-red-50 ring-red-200'             },
};

/* ─── TOAST ─── */
function Toast({ t, type = 'success' }) {
  if (!t) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 ${type === 'error' ? 'bg-red-600' : 'bg-[#0A1628]'}`}
      style={{ animation: 'toastIn .3s ease' }}>
      {type === 'error' ? <AlertCircle size={15} className="shrink-0" /> : <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
      {t}
    </div>
  );
}

/* ─── FIELD ─── */
function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dark mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ─── MAIN ─── */
export default function OrganizerProfile() {
  const [sbOpen, setSbOpen]   = useState(true);
  const [toast, setToast]     = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(null), 3000);
  };

  /* Verification data from backend */
  const [verification, setVerification] = useState(null); // null = not loaded yet
  const [loading, setLoading]           = useState(true);

  /* Form state */
  const [form, setForm] = useState({ clubName: '', college: '', linkedin: '', website: '' });
  const [docFile, setDocFile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState({});
  const [avatar, setAvatar]     = useState(null);
  const avatarRef               = useRef();
  const docRef                  = useRef();
  const { name: userName, email: userEmail } = getUser();

  /* Derive status */
  const status = !verification ? 'unverified' : verification.status;
  const { label: stLabel, icon: StIcon, cls: stCls } = STATUS_MAP[status] || STATUS_MAP.unverified;

  /* Load existing verification on mount */
  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${API}/organizer/verification/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.verification) {
            setVerification(data.verification);
            setForm({
              clubName: data.verification.clubName || '',
              college:  data.verification.college  || '',
              linkedin: data.verification.linkedin || '',
              website:  data.verification.website  || '',
            });
            setEditing(data.verification.status === 'rejected'); // allow resubmit if rejected
          } else {
            setEditing(true); // no record yet → show form in edit mode
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, []);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.clubName.trim()) e.clubName = 'Club / organisation name is required';
    if (!form.college.trim())  e.college  = 'College name is required';
    if (!verification && !docFile) e.doc = 'Proof document is required for first submission';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const token = getToken();
      const body  = new FormData();
      body.append('clubName', form.clubName);
      body.append('college',  form.college);
      body.append('linkedin', form.linkedin);
      body.append('website',  form.website);
      if (docFile) body.append('proofDocument', docFile);

      const res = await fetch(`${API}/organizer/verification`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setVerification(data.verification);
      setEditing(false);
      showToast('Verification request submitted!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleDocChange = e => {
    const file = e.target.files?.[0];
    if (file) { setDocFile(file); setErrors(er => ({ ...er, doc: '' })); }
  };

  /* ─── Steps ─── */
  const steps = [
    { label: 'Create Account',       done: true },
    { label: 'Complete Profile',      done: status !== 'unverified' },
    { label: 'Submit Verification',   done: ['pending','approved'].includes(status) },
    { label: 'Get Approved',          done: status === 'approved' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-royal/30 border-t-royal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans overflow-x-hidden">
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <OrganizerSidebar open={sbOpen} onToggle={() => setSbOpen(s => !s)} />
      <Toast t={toast} type={toastType} />

      <div className={`transition-all duration-300 ${sbOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>

        {/* ── TOP NAVBAR ── */}
        <div className="sticky top-0 z-20 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 pl-14 lg:pl-6">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/organizer-dashboard" className="text-gray-400 hover:text-royal transition-colors">Dashboard</Link>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-dark">Profile & Verification</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ${stCls}`}>
            <StIcon size={12} />{stLabel}
          </span>
        </div>

        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">

          {/* ── PAGE HEADER ── */}
          <div className="rounded-2xl mb-6 overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(30,100,255,0.07)]">
            <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-violet-500" />
            <div className="bg-white px-4 sm:px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight">Profile &amp; Verification</h1>
                  <p className="text-sm text-gray-400 mt-1">Complete your profile and submit for verification to start creating hackathons.</p>
                </div>
                {status === 'unverified' && (
                  <div className="flex items-start sm:items-center gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl sm:self-center sm:shrink-0">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs font-semibold text-amber-700">Verification required to create hackathons</p>
                  </div>
                )}
                {status === 'rejected' && verification?.rejectionReason && (
                  <div className="flex items-start sm:items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl sm:self-center sm:shrink-0">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs font-semibold text-red-700">Rejected: {verification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── STEPS ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-4 sm:p-5 mb-6">
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 sm:gap-0">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.done ? 'bg-royal text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {s.done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium leading-tight ${s.done ? 'text-dark' : 'text-gray-400'}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className="hidden sm:block w-8 lg:w-12 h-px bg-gray-200 ml-2 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT: Avatar + Why Verify ── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-royal to-violet-500 flex items-center justify-center">
                    {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={36} className="text-white/80" />}
                  </div>
                  <button onClick={() => avatarRef.current.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-royal text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors cursor-pointer">
                    <Camera size={13} />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <p className="font-extrabold text-dark text-base">{userName}</p>
                <p className="text-xs text-royal/70 mt-0.5 font-medium">{userEmail}</p>
                {form.clubName && (
                  <p className="text-xs text-gray-400 mt-0.5">{form.clubName}{form.college ? ` · ${form.college}` : ''}</p>
                )}
                <span className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ${stCls}`}>
                  <StIcon size={11} />{stLabel}
                </span>
              </div>

              <div className="bg-gradient-to-br from-royal/5 to-violet-50 rounded-2xl border border-royal/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-royal rounded-lg flex items-center justify-center"><Zap size={13} className="text-white" /></div>
                  <h3 className="text-sm font-bold text-dark">Why Verify?</h3>
                </div>
                <ul className="space-y-2">
                  {['Create & manage hackathons','Access PPT review tools','Issue verified certificates','Appear as trusted organizer'].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 size={12} className="text-royal mt-0.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>

              {status === 'pending' && (
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                  <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-blue-600 shrink-0" /><h3 className="text-sm font-bold text-blue-800">Under Review</h3></div>
                  <p className="text-xs text-blue-600">Your verification is being reviewed by the admin. This typically takes 1–2 business days.</p>
                </div>
              )}
              {status === 'approved' && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
                  <div className="flex items-center gap-2 mb-2"><ShieldCheck size={14} className="text-emerald-600 shrink-0" /><h3 className="text-sm font-bold text-emerald-800">Verified!</h3></div>
                  <p className="text-xs text-emerald-600">Your organizer account is verified. You can now create and manage hackathons.</p>
                  <Link to="/organizer/create" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer">
                    <Zap size={11} /> Create Hackathon
                  </Link>
                </div>
              )}
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-dark flex items-center gap-2">
                      <ShieldCheck size={15} className="text-royal shrink-0" />
                      <span>Organizer Verification Details</span>
                    </h2>
                    {status !== 'unverified' && status !== 'rejected' && !editing && (
                      <button type="button" onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-royal border border-royal/20 rounded-lg hover:bg-royal/5 transition-colors cursor-pointer">
                        <Edit3 size={11} /> Edit
                      </button>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Club / Organisation Name" required>
                        <input value={form.clubName} onChange={e => set('clubName', e.target.value)} disabled={!editing}
                          placeholder="e.g. ACM Chapter BITS"
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2
                            ${errors.clubName ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-royal focus:ring-royal/20'}
                            ${!editing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        {errors.clubName && <p className="text-xs text-red-500 mt-1">{errors.clubName}</p>}
                      </Field>
                      <Field label="College / University Name" required>
                        <div className="relative">
                          <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.college} onChange={e => set('college', e.target.value)} disabled={!editing}
                            placeholder="e.g. BITS Pilani"
                            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2
                              ${errors.college ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-royal focus:ring-royal/20'}
                              ${!editing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        </div>
                        {errors.college && <p className="text-xs text-red-500 mt-1">{errors.college}</p>}
                      </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="LinkedIn Profile" hint="Your personal or club LinkedIn">
                        <div className="relative">
                          <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} disabled={!editing}
                            placeholder="linkedin.com/in/your-profile"
                            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal ${!editing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        </div>
                      </Field>
                      <Field label="Club / Event Website" hint="Optional">
                        <div className="relative">
                          <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.website} onChange={e => set('website', e.target.value)} disabled={!editing}
                            placeholder="https://yourclub.com"
                            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal ${!editing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        </div>
                      </Field>
                    </div>

                    <Field label="Proof Document" required={!verification}
                      hint="ID card, official letter, or club certificate (PDF/JPG/PNG, max 5MB)">
                      {editing ? (
                        <div onClick={() => docRef.current.click()}
                          className={`relative flex flex-col items-center justify-center gap-3 px-4 sm:px-6 py-6 sm:py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                            ${errors.doc ? 'border-red-300 bg-red-50' : docFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-royal hover:bg-royal/5'}`}>
                          <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocChange} />
                          {docFile ? (
                            <>
                              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><FileText size={22} className="text-emerald-600" /></div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-emerald-700">{docFile.name}</p>
                                <p className="text-xs text-emerald-500 mt-0.5">{(docFile.size / 1024).toFixed(1)} KB · Click to change</p>
                              </div>
                              <button type="button" onClick={e => { e.stopPropagation(); setDocFile(null); }}
                                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer">
                                <X size={12} className="text-gray-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"><Upload size={22} className="text-gray-400" /></div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-gray-600">Click to upload proof document</p>
                                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, or PNG · Max 5 MB</p>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                          <FileText size={16} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-600">{verification?.proofDocument || 'Document uploaded'}</span>
                          <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">Uploaded</span>
                        </div>
                      )}
                      {errors.doc && <p className="text-xs text-red-500 mt-1.5">{errors.doc}</p>}
                    </Field>

                    {editing && (
                      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <ShieldCheck size={15} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-600">By submitting, you confirm all information is accurate. False information may result in account suspension.</p>
                      </div>
                    )}
                  </div>

                  {editing && (
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3 flex-wrap">
                      {status !== 'unverified' && (
                        <button type="button" onClick={() => setEditing(false)}
                          className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
                          Cancel
                        </button>
                      )}
                      <button type="submit" disabled={submitting}
                        className="ml-auto px-6 py-2.5 text-sm font-bold text-white bg-royal rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-royal/20">
                        {submitting
                          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Submitting…</>
                          : <><ShieldCheck size={14} />Submit for Verification</>}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
