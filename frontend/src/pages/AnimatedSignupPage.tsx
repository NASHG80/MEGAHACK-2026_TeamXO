import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff,
  User, GraduationCap, Building2,
} from "lucide-react";
import AnimatedCharactersPanel from "../components/ui/AnimatedCharactersPanel";
import api from "../lib/api";

/* ══════════════ AuthInput ══════════════ */

function AuthInput({
  label, type = "text", placeholder, value, onChange, error,
  icon: Icon, onFocus, onBlur,
}: {
  label?: string; type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
  icon?: React.FC<{ size?: number; className?: string }>;
  onFocus?: () => void; onBlur?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={onChange} onFocus={onFocus} onBlur={onBlur}
          className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 text-sm text-gray-900 bg-gray-50 border ${error ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-royal"} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 placeholder:text-gray-400`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ══════════════ Role Selector ══════════════ */

const topLevelRoles = [
  { id: "student",   label: "Student",   description: "Participate in hackathons, create teams, and submit projects.", icon: GraduationCap },
  { id: "organizer", label: "Organizer", description: "Create and manage hackathons, review submissions and participants.", icon: Building2 },
];

const orgSubRoles = [
  { id: "organizer", label: "Core Team",     description: "Full organizer access — create events, manage hackathons, and review submissions." },
  { id: "cocom",     label: "CoCom Member",  description: "Committee volunteer — view and complete assigned tasks from the organizer." },
];

function RoleSelector({ selectedRole, onSelect }: { selectedRole: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {topLevelRoles.map(role => {
        const sel = selectedRole === role.id || (role.id === "organizer" && (selectedRole === "organizer" || selectedRole === "cocom"));
        return (
          <button key={role.id} type="button" onClick={() => onSelect(role.id)}
            className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${sel ? "border-royal bg-royal/5 shadow-md" : "border-gray-200 bg-white hover:border-royal/40 hover:bg-gray-50"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${sel ? "bg-royal text-white" : "bg-gray-100 text-gray-500 group-hover:bg-royal/10 group-hover:text-royal"}`}>
              <role.icon size={20} />
            </div>
            <h3 className={`text-xs font-bold mb-1 ${sel ? "text-royal" : "text-gray-900"}`}>{role.label}</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">{role.description}</p>
            <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${sel ? "border-royal" : "border-gray-300"}`}>
              {sel && <div className="w-2 h-2 rounded-full bg-royal" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OrgSubRoleSelector({ selectedSubRole, onSelect }: { selectedSubRole: string; onSelect: (id: string) => void }) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select your organizer type</p>
      <div className="grid grid-cols-2 gap-2">
        {orgSubRoles.map(sub => {
          const sel = selectedSubRole === sub.id;
          return (
            <button key={sub.id} type="button" onClick={() => onSelect(sub.id)}
              className={`relative flex flex-col text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${sel ? "border-royal bg-royal/5 shadow-sm" : "border-gray-200 bg-white hover:border-royal/30 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? "border-royal" : "border-gray-300"}`}>
                  {sel && <div className="w-1.5 h-1.5 rounded-full bg-royal" />}
                </div>
                <span className={`text-xs font-bold ${sel ? "text-royal" : "text-gray-800"}`}>{sub.label}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-snug pl-5">{sub.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ Signup Page (Steps 1 & 2) ══════════════ */

export default function AnimatedSignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [subRole, setSubRole] = useState("organizer"); // "organizer" = Core Team, "cocom" = CoCom Member

  /* form fields */
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirmPassword: "", agreeTerms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  /* password visibility */
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* character animation */
  const [isTyping, setIsTyping] = useState(false);

  /* ── Password eye handlers ── */
  const toggleShowPwd = () => setShowPwd(v => !v);
  const toggleShowConfirm = () => {
    const next = !showConfirm;
    setShowConfirm(next);
    if (next) setShowPwd(true);
    else       setShowPwd(false);
  };

  /* ── Step 2 form validation ── */
  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) e.password = "Password must contain letters and numbers";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms";
    return e;
  };

  /* ── Submit: validate → send OTP → navigate to OTP page ── */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setApiError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: form.email });
      // Resolve final role: student stays student; organizer uses subRole ("organizer" or "cocom")
      const finalRole = role === "organizer" ? subRole : role;
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`, {
        state: { password: form.password, name: form.name, role: finalRole },
      });
    } catch (err: unknown) {
      // 409 = already registered → show error and stop
      if ((err as { status?: number }).status === 409) {
        setApiError((err as Error).message);
        return;
      }
      // 429 = OTP already sent recently (backend cooldown).
      // A valid OTP is waiting in the inbox, so navigate anyway.
      if ((err as { status?: number }).status === 429) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`, {
          state: { password: form.password, name: form.name, role },
        });
        return;
      }
      // Any other error — show it
      setApiError((err as Error).message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Captions per step ── */
  const captions = [
    { title: "Join HackFlow Today",  subtitle: "Select your role to start your hackathon journey." },
    { title: "Almost There!",        subtitle: "Fill in your details to create your account." },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Left — animated characters panel */}
      <AnimatedCharactersPanel
        isTyping={isTyping}
        passwordValue={form.password || form.confirmPassword}
        passwordVisible={showPwd || showConfirm}
        caption={captions[step - 1]}
      />

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto px-4 py-6 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-7">

          {/* Logo */}
          <Link to="/" className="inline-block mb-4">
            <span className="text-2xl font-extrabold text-royal tracking-tight">Hack<span className="text-gray-900">Flow</span></span>
          </Link>

          {/* ─── STEP 1: Role selector ─── */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Create your HackFlow account</h1>
              <p className="text-sm text-gray-500 mb-5">Select your role to get started.</p>
              <div className="space-y-4">
                <RoleSelector selectedRole={role === "cocom" ? "organizer" : role} onSelect={(id) => {
                  setRole(id);
                  if (id !== "organizer") setSubRole("organizer"); // reset sub-role when switching away
                }} />
                {(role === "organizer" || role === "cocom") && (
                  <OrgSubRoleSelector selectedSubRole={subRole} onSelect={(id) => {
                    setSubRole(id);
                    setRole(id); // keep role in sync so the subtitle on Step 2 is accurate
                  }} />
                )}
                <button type="button" disabled={!role} onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-40 cursor-pointer">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 2: Details form ─── */}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Create your HackFlow account</h1>
              <p className="text-sm text-gray-500 mb-5">
                Signing up as{" "}
                {role === "student" ? "a Student" : role === "cocom" ? "a CoCom Member" : "an Organizer (Core Team)"}
              </p>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-royal transition-colors cursor-pointer mb-1">
                  <ArrowLeft size={14} /> Change role
                </button>

                <AuthInput label="Full Name" placeholder="John Doe" icon={User}
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} error={errors.name} />

                <AuthInput label="Email" type="email" placeholder="you@example.com" icon={Mail}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} error={errors.email} />

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={(showPwd || showConfirm) ? "text" : "password"}
                      placeholder="••••••••" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}
                      className={`w-full pl-11 pr-11 py-3 text-sm text-gray-900 bg-gray-50 border ${errors.password ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-royal"} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 placeholder:text-gray-400`}
                    />
                    <button type="button" onClick={toggleShowPwd}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                      {(showPwd || showConfirm) ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={(showPwd || showConfirm) ? "text" : "password"}
                      placeholder="••••••••" value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      className={`w-full pl-11 pr-11 py-3 text-sm text-gray-900 bg-gray-50 border ${errors.confirmPassword ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-royal"} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 placeholder:text-gray-400`}
                    />
                    <button type="button" onClick={toggleShowConfirm}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.agreeTerms}
                      onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-royal focus:ring-royal cursor-pointer" />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-royal font-medium hover:underline">Terms of Service</a>{" "}
                      and <a href="#" className="text-royal font-medium hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-xs text-red-500 ml-6">{errors.agreeTerms}</p>}
                </div>

                {apiError && (
                  <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">{apiError}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Send Verification Code <ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-royal hover:text-royal-light transition-colors">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
