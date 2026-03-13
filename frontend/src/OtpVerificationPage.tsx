import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import AnimatedCharactersPanel from "../components/ui/AnimatedCharactersPanel";
import api from "../lib/api";

/* ══════════════ OTP Input ══════════════ */

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Always render exactly 6 inputs. Use empty strings for empty boxes.
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If backspace is pressed on an already-empty box, move focus to the previous one
    if (e.key === "Backspace" && !digits[i]) {
      e.preventDefault();
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Extract only numeric digits
    const char = val.slice(-1); // Always take the last typed digit
    
    const arr = [...digits];
    arr[i] = char;
    onChange(arr.join("")); // Update state

    // If a digit was successfully typed, jump to the next input
    if (char) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={e => e.target.select()} // Select existing digit so it can be typed over
          className="w-12 h-12 text-center text-lg font-bold border-2 rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:border-royal focus:ring-2 focus:ring-royal focus:outline-none transition-all"
        />
      ))}
    </div>
  );
}

/* ══════════════ OTP Verification Page ══════════════ */

interface LocationState {
  password: string;
  name: string;
  role: string;
}

export default function OtpVerificationPage() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const [searchParams]    = useSearchParams();
  const email             = searchParams.get("email") ?? "";
  const state             = location.state as LocationState | null;

  // Guard: if no email in URL, redirect to signup
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  const [otp, setOtp]                         = useState("");
  const [otpError, setOtpError]               = useState("");
  const [apiError, setApiError]               = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [resendCooldown, setResendCooldown]   = useState(30); // 30s initial cooldown since OTP just sent

  /* ── Start / restart the resend countdown ── */
  const startCooldown = (seconds = 30) => {
    setResendCooldown(seconds);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return t;
  };

  // Auto-start cooldown on mount (OTP was just sent by signup page)
  useEffect(() => {
    const t = startCooldown(30);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setOtpError("");
    setApiError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      setOtp("");
      startCooldown(60); // longer cooldown on explicit resend
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify OTP then Register ── */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Please enter the full 6-digit OTP."); return; }
    if (!email) return;

    setOtpError("");
    setApiError("");
    setLoading(true);
    try {
      // Step A — verify OTP
      await api.post("/auth/verify-otp", { email, otp });

      // Step B — complete registration
      const data = await api.post("/auth/register", {
        email,
        password: state?.password ?? "",
        name:     state?.name     ?? "",
        role:     state?.role     ?? "",
      }) as { token: string; role: string; name: string };

      localStorage.setItem("hf_token", data.token);
      localStorage.setItem("hf_role",  data.role);
      localStorage.setItem("hf_name",  data.name);
      localStorage.setItem("hf_email", email);

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // guard while redirecting

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Left — animated characters panel */}
      <AnimatedCharactersPanel
        isTyping={false}
        passwordValue=""
        passwordVisible={false}
        caption={{
          title: "Check Your Inbox",
          subtitle: "Enter the 6-digit OTP we sent to your email address.",
        }}
      />

      {/* Right — OTP form panel */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto px-4 py-6 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-7">

          {/* Logo */}
          <Link to="/" className="inline-block mb-4">
            <span className="text-2xl font-extrabold text-royal tracking-tight">
              Hack<span className="text-gray-900">Flow</span>
            </span>
          </Link>

          {/* ─── Success State ─── */}
          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                <ShieldCheck size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Account Created!</h2>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
              <div className="w-5 h-5 mx-auto mt-3 border-2 border-royal/30 border-t-royal rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ─── OTP Verification ─── */}
              <h1 className="text-xl font-bold text-gray-900 mb-1">Verify your email</h1>
              <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
              <p className="text-sm font-semibold text-royal mb-6 truncate">{email}</p>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <OtpInput value={otp} onChange={setOtp} />

                {otpError && (
                  <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                    {otpError}
                  </p>
                )}
                {apiError && (
                  <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                    {apiError}
                  </p>
                )}

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Verify &amp; Create Account <ShieldCheck size={16} /></>}
                </button>

                {/* Resend OTP */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Didn't receive it?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1 font-semibold text-royal hover:text-royal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                {/* Back to signup */}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mx-auto"
                >
                  <ArrowLeft size={13} /> Back to sign up
                </button>
              </form>

              {/* Sign in link */}
              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-royal hover:text-royal-light transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
