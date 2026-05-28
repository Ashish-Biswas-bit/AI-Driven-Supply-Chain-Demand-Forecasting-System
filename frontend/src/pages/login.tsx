import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && !authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, mounted, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password) { setError("Please enter your password"); return; }

    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Invalid email or password";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent flash of login page for authenticated users
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }
  if (user) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 overflow-hidden items-center justify-center">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-6">
            <LogIn size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-brand-200/80 text-lg max-w-sm mx-auto leading-relaxed">
            Access your AI-powered supply chain dashboard and continue where you left off.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "94%", label: "Forecast Accuracy" },
              { value: "10K+", label: "Products Tracked" },
              { value: "32%", label: "Avg. Cost Saved" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-brand-300/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
              SC
            </div>
            <span className="text-lg font-bold text-gray-900">
              Supply<span className="text-brand-600">Chain</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Or{" "}
            <Link href="/signup" className="text-brand-600 font-medium hover:text-brand-700">
              create a new account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-400 text-center">
            By signing in, you agree to our{" "}
            <a href="#" className="text-gray-500 underline hover:text-gray-700">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-gray-500 underline hover:text-gray-700">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}