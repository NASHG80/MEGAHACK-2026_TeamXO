import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import AnimatedCharactersPanel from "../components/ui/AnimatedCharactersPanel";
import api from "../lib/api";

/* ══════════════ AuthInput ══════════════ */
function AuthInput({ label, type = "text", placeholder, value, onChange, error, icon: Icon, onFocus, onBlur }: {
  label?: string; type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
  icon?: React.FC<{ size?: number; className?: string }>;
  onFocus?: () => void; onBlur?: () => void;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={isPwd && show ? "text" : type} placeholder={placeholder} value={value}
          onChange={onChange} onFocus={onFocus} onBlur={onBlur}
          className={`w-full ${Icon ? "pl-11" : "pl-4"} ${isPwd ? "pr-11" : "pr-4"} py-3 text-sm text-gray-900 bg-gray-50 border ${error ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-royal"} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 placeholder:text-gray-400`}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ══════════════ Login Page ══════════════ */
export default function AnimatedLoginPage() {
  const navigate = useNavigate();

  // Tab: "user" = student/organizer login, "admin" = admin login
  const [tab, setTab] = useState<"user" | "admin">("user");

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setApiError("");
    setLoading(true);
    try {
      const endpoint = tab === "admin" ? "/auth/admin-login" : "/auth/login";
      const data = await api.post(endpoint, { email: form.email, password: form.password });
      // Persist session
      localStorage.setItem("hf_token", data.token as string);
      localStorage.setItem("hf_role",  data.role as string);
      localStorage.setItem("hf_name",  data.name as string);
      localStorage.setItem("hf_email", form.email);
      // Role-based redirect
      const role = data.role as string;
      if (role === "admin")          navigate("/admin-dashboard");
      else if (role === "organizer") navigate("/organizer-dashboard");
      else if (role === "cocom")     navigate("/cocom/my-tasks");
      else                           navigate("/student/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const caption = tab === "admin"
    ? { title: "Admin Portal", subtitle: "Sign in with your admin credentials to manage HackFlow." }
    : { title: "Welcome Back to HackFlow", subtitle: "Sign in to access your hackathons, manage teams, and track submissions." };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Left — shared animated characters */}
      <AnimatedCharactersPanel
        isTyping={isTyping}
        passwordValue={form.password}
        passwordVisible={showPwd}
        caption={caption}
      />

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-7">
          <Link to="/" className="inline-block mb-5">
            <span className="text-2xl font-extrabold text-royal tracking-tight">Hack<span className="text-gray-900">Flow</span></span>
          </Link>

          {/* Tab switcher */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 gap-1">
            <button type="button" onClick={() => { setTab("user"); setApiError(""); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${tab === "user" ? "bg-royal text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setTab("admin"); setApiError(""); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${tab === "admin" ? "bg-royal text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <ShieldCheck size={14} /> Admin
            </button>
          </div>

          {tab === "user" && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your dashboard.</p>
            </>
          )}
          {tab === "admin" && (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Sign In</h1>
              <p className="text-sm text-gray-500 mb-6">Restricted access — HackFlow administrators only.</p>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput label="Email" type="email" placeholder="you@example.com" icon={Mail}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} error={errors.email} />

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-11 pr-11 py-3 text-sm text-gray-900 bg-gray-50 border ${errors.password ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:ring-royal"} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 placeholder:text-gray-400`}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {tab === "user" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-royal focus:ring-royal cursor-pointer" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-royal hover:text-royal-light transition-colors">Forgot password?</a>
              </div>
            )}

            {/* API error banner */}
            {apiError && (
              <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">{apiError}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{tab === "admin" ? "Sign In as Admin" : "Sign In"} <ArrowRight size={16} /></>}
            </button>
          </form>

          {tab === "user" && (
            <>
              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400 uppercase tracking-wider">or</span></div>
              </div>

              {/* Google */}
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-royal hover:text-royal-light transition-colors">Sign Up</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
