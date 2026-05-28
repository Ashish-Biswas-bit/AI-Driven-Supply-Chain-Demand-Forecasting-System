import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react";
import axios from "axios";

const PLANS = [
  { value: "free_trial", label: "Free Trial", price: "$0", period: "14 days", desc: "Full access for 14 days, no credit card needed." },
  { value: "weekly", label: "Weekly", price: "$9", period: "/week", desc: "For short-term projects and evaluation." },
  { value: "monthly", label: "Monthly", price: "$29", period: "/month", desc: "Best for growing businesses.", popular: true },
  { value: "yearly", label: "Yearly", price: "$249", period: "/year", desc: "Save 28% with annual billing." },
];

export default function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free_trial");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Read plan from URL query param
  useEffect(() => {
    if (mounted && router.query.plan) {
      const plan = router.query.plan as string;
      if (PLANS.some((p) => p.value === plan)) {
        setSelectedPlan(plan);
      }
    }
  }, [mounted, router.query.plan]);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && !authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, mounted, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your full name"); return; }
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPw) { setError("Passwords do not match"); return; }

    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await axios.post(`${API_URL}/api/auth/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        subscription_plan: selectedPlan,
        role: "viewer",
      });
      setSuccess(true);
      // Auto-redirect to login after 2 seconds
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent flash of signup page for authenticated users
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }
  if (user) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-gray-500 text-sm mb-6">
            {selectedPlan === "free_trial"
              ? "Your 14-day free trial has started. Redirecting you to sign in..."
              : `Your ${selectedPlan} subscription is active. Redirecting you to sign in...`}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-6">
            <UserPlus size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Get Started Free</h2>
          <p className="text-brand-200/80 text-lg max-w-sm mx-auto leading-relaxed">
            Join thousands of businesses using AI to optimize their supply chain.
          </p>
          <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
            {[
              "AI-powered demand forecasting",
              "Real-time inventory tracking",
              "Smart alerts & notifications",
              "Interactive analytics dashboard",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-brand-400 shrink-0 mt-0.5" />
                <span className="text-sm text-brand-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
              SC
            </div>
            <span className="text-lg font-bold text-gray-900">
              Supply<span className="text-brand-600">Chain</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>

          {/* Plan selector — compact cards */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {PLANS.map((plan) => {
              const active = selectedPlan === plan.value;
              return (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setSelectedPlan(plan.value)}
                  className={`relative text-left p-3 rounded-xl border transition-all ${
                    active
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-semibold uppercase tracking-wider">
                      Best
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      active ? "border-brand-600" : "border-gray-300"
                    }`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                    </div>
                    <span className={`text-sm font-semibold ${active ? "text-brand-700" : "text-gray-800"}`}>
                      {plan.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5 pl-5">
                    <span className="text-base font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-[10px] text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 pl-5 leading-tight">{plan.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input"
              />
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
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

            <div>
              <label htmlFor="confirmPw" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPw"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat your password"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {selectedPlan === "free_trial" ? "Start Free Trial" : `Subscribe ${selectedPlan}`}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-400 text-center">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-gray-500 underline hover:text-gray-700">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-gray-500 underline hover:text-gray-700">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}