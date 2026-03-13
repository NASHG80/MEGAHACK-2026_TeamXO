import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Send,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const API = 'http://localhost:5000/api/auth';

/* ─────────────────────── DEFAULT DATA ─────────────────────── */

const defaultVerification = {
  collegeVerified: false,
  collegeEmail: null,
};

/* ─────────────────────── PROFILE INFO ─────────────────── */

function ProfileInfo({ user, onEdit }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
      {/* Avatar + Name */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-royal/10 flex items-center justify-center text-royal font-extrabold text-2xl shrink-0">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-dark">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <div className="mt-3">
            {user.verificationStatus ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <ShieldCheck size={12} />
                Verified Student
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                <ShieldOff size={12} />
                Not Verified
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-royal border-2 border-royal/20 rounded-xl hover:bg-royal hover:text-white hover:border-royal transition-all duration-200 cursor-pointer self-start"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        <InfoField icon={User} label="Full Name" value={user.name} />
        <InfoField icon={Mail} label="Email Address" value={user.email} />
        <InfoField icon={Building2} label="College / Institution" value={user.collegeName || '—'} />
        <InfoField
          icon={user.verificationStatus ? ShieldCheck : ShieldOff}
          label="Verification Status"
          value={user.verificationStatus ? 'Verified' : 'Pending Verification'}
          valueClass={user.verificationStatus ? 'text-emerald-600' : 'text-amber-600'}
        />
      </div>

      {/* Warning banner if not verified */}
      {!user.verificationStatus && (
        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Verification Required —</span> You must complete
            identity verification before registering for any hackathon.
          </p>
        </div>
      )}
    </div>
  );
}

function InfoField({ icon: Icon, label, value, valueClass = 'text-dark' }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-light-gray flex items-center justify-center shrink-0">
        <Icon size={16} className="text-royal" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────── VERIFICATION ─────────────────── */

const COLLEGE_DOMAIN = '@svkmmumbai.onmicrosoft.com';
const RESEND_COOLDOWN = 60; // seconds

function VerificationSection({ onVerified }) {
  /* step: 'email' | 'otp' | 'done' */
  const [step, setStep]             = useState('email');
  const [collegeName, setCollegeName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [otp, setOtp]               = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [countdown, setCountdown]   = useState(0);

  const token = localStorage.getItem('hf_token');

  /* ── countdown timer for resend ── */
  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  /* ── Step 1: send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!collegeEmail.toLowerCase().endsWith(COLLEGE_DOMAIN)) {
      setError(`Please use your college email ending with ${COLLEGE_DOMAIN}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/send-college-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: collegeEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep('otp');
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/send-college-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: collegeEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP.');
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/verify-college-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');
      // Persist college name so it survives reloads
      localStorage.setItem('hf_college_name', collegeName);
      setStep('done');
      onVerified?.(collegeName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (step === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-dark mb-2">College Email Verified!</h3>
        <p className="text-sm text-gray-500">
          Your college email <span className="font-semibold text-dark">{collegeEmail}</span> has
          been verified. You can now register for hackathons.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center">
          <ShieldCheck size={20} className="text-royal" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark">Identity Verification</h3>
          <p className="text-xs text-gray-500">
            {step === 'email'
              ? 'Enter your college details to receive a verification OTP.'
              : `OTP sent to ${collegeEmail}`}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['email', 'otp'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                step === s
                  ? 'bg-royal text-white'
                  : step === 'done' || (s === 'email' && step === 'otp')
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s === 'email' && step === 'otp' ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold ${step === s ? 'text-dark' : 'text-gray-400'}`}>
              {s === 'email' ? 'College Details' : 'Verify OTP'}
            </span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── STEP 1: Email form ── */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              College / Institution Name
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. SVKMs NMIMS"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              College Email ID
            </label>
            <input
              type="email"
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              placeholder={`yourname${COLLEGE_DOMAIN}`}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all duration-200"
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              Only <span className="font-semibold text-gray-500">{COLLEGE_DOMAIN}</span> emails are accepted.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !collegeName || !collegeEmail}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              !loading && collegeName && collegeEmail
                ? 'bg-royal text-white hover:bg-royal-light cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
            {loading ? 'Sending OTP…' : 'Send Verification OTP'}
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP form ── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="_ _ _ _ _ _"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold tracking-[0.4em] text-center text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all duration-200"
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              Check your inbox at <span className="font-semibold text-gray-500">{collegeEmail}</span>. OTP expires in 5 minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              !loading && otp.length === 6
                ? 'bg-royal text-white hover:bg-royal-light cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <KeyRound size={15} />
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>

          {/* Resend + go back */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError(''); }}
              className="text-xs text-gray-400 hover:text-dark transition-colors"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                countdown > 0 || loading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-royal hover:text-royal-light cursor-pointer'
              }`}
            >
              <RefreshCw size={12} />
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─────────────────────── PROFILE PAGE ─────────────────── */

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: localStorage.getItem('hf_name') || 'Unknown User',
    email: localStorage.getItem('hf_email') || '',
    collegeName: localStorage.getItem('hf_college_name') || '',
    verificationStatus: false,
  });
  const [verification] = useState(defaultVerification);

  // Sync collegeVerified from DB on mount so it persists across reloads
  useEffect(() => {
    const token = localStorage.getItem('hf_token');
    if (!token) return;
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser((u) => ({
            ...u,
            name: data.user.name || u.name,
            email: data.user.email || u.email,
            verificationStatus: data.user.collegeVerified || false,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleVerified = (name) => {
    if (name) setUser((u) => ({ ...u, verificationStatus: true, collegeName: name }));
    else setUser((u) => ({ ...u, verificationStatus: true }));
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div>
          <span className="inline-block text-xs font-semibold text-royal uppercase tracking-widest mb-2">
            Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Your <span className="text-royal">Profile</span>
          </h1>
        </div>

        <ProfileInfo
          user={user}
          onEdit={() => {
            /* open edit modal or navigate to edit page */
          }}
        />

        {!user.verificationStatus && (
          <VerificationSection
            verification={verification}
            onVerified={handleVerified}
          />
        )}

        {user.verificationStatus && (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Your identity is verified.
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                You can register for any hackathon on HackFlow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
