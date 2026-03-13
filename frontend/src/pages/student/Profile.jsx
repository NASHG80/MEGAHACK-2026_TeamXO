import { useState } from 'react';
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
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

/* ─────────────────────── DEFAULT DATA ─────────────────────── */

const defaultVerification = {
  collegeIdImage: null,
  extractedCollegeName: '',
  aadhaarVerified: false,
  verificationStatus: false,
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
        <InfoField icon={Building2} label="College / Institution" value={user.collegeName} />
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

function VerificationSection({ verification, onSubmit }) {
  const [collegeName, setCollegeName] = useState(verification.extractedCollegeName || '');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!collegeName || !collegeEmail) return;
    setDone(true);
    onSubmit?.({ collegeName, collegeEmail });
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-dark mb-2">Verification Submitted!</h3>
        <p className="text-sm text-gray-500">
          Your details have been submitted for review. You will be notified once verification is
          complete.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-royal/5 flex items-center justify-center">
          <ShieldCheck size={20} className="text-royal" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark">Identity Verification</h3>
          <p className="text-xs text-gray-500">
            Complete verification to register for hackathons.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* College Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            College / Institution Name
          </label>
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="e.g. Delhi Technological University"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all duration-200"
          />
        </div>

        {/* College Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            College Email ID
          </label>
          <input
            type="email"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
            placeholder="e.g. yourname@college.edu"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all duration-200"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!collegeName || !collegeEmail}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
            collegeName && collegeEmail
              ? 'bg-royal text-white hover:bg-royal-light cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Verification
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────── PROFILE PAGE ─────────────────── */

export default function Profile() {
  const navigate = useNavigate();
  const [user] = useState({
    name: localStorage.getItem('hf_name') || 'Unknown User',
    email: localStorage.getItem('hf_email') || '',
    collegeName: '',
    verificationStatus: false,
  });
  const [verification] = useState(defaultVerification);

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
            onSubmit={(data) => {
              console.log('Verification submitted:', data);
            }}
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
