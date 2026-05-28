import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { updateSubscription } from "../utils/api";
import { CheckCircle, Loader2, ArrowLeft, Zap, AlertCircle } from "lucide-react";
import axios from "axios";

const PLANS = [
  {
    value: "free_trial",
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    desc: "Full access for 14 days, no credit card needed.",
    features: ["AI demand forecasting", "Real-time inventory tracking", "Smart alerts", "Analytics dashboard", "CSV data import"],
    popular: false,
  },
  {
    value: "weekly",
    name: "Weekly",
    price: "$9",
    period: "/week",
    desc: "For short-term projects and evaluation.",
    features: ["Everything in Free Trial", "Unlimited products", "Priority email support", "Extended forecast periods", "Data export"],
    popular: false,
  },
  {
    value: "monthly",
    name: "Monthly",
    price: "$29",
    period: "/month",
    desc: "Best for growing businesses.",
    features: ["Everything in Weekly", "Advanced AI models", "API access", "Role-based access", "Priority chat support"],
    popular: true,
  },
  {
    value: "yearly",
    name: "Yearly",
    price: "$249",
    period: "/year",
    desc: "Save 28% with annual billing.",
    features: ["Everything in Monthly", "Dedicated manager", "Custom AI tuning", "SSO & team management", "99.9% SLA"],
    popular: false,
  },
];

export default function SubscribePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, mounted, router]);

  // Pre-select current plan
  useEffect(() => {
    if (user?.subscription_plan) {
      setSelectedPlan(user.subscription_plan);
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan === user?.subscription_plan) return;
    setError("");
    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("sc_access_token") : null;
      await axios.put(
        `${API_URL}/api/auth/subscription?plan=${selectedPlan}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to update subscription.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }
  if (!user) return null;

  const currentPlan = PLANS.find((p) => p.value === user.subscription_plan);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan updated!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your subscription has been changed to <strong className="text-gray-700 capitalize">{selectedPlan}</strong>.
            Redirecting to dashboard...
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform">
              SC
            </div>
            <span className="text-sm font-bold text-gray-900">
              Supply<span className="text-brand-600">Chain</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Current plan info */}
        {currentPlan && (
          <div className="flex items-start gap-3 p-4 mb-8 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">
                Current Plan: <span className="capitalize">{currentPlan.name}</span>
              </p>
              <p className="text-xs text-brand-700 mt-0.5">
                {user.subscription_plan === "free_trial"
                  ? `Your trial ${user.subscription_status === "expired" ? "has expired" : "is active"}.`
                  : `Your ${currentPlan.name.toLowerCase()} subscription is ${user.subscription_status}.`}
                {user.subscription_expires_at && (
                  <span> Expires: {new Date(user.subscription_expires_at).toLocaleDateString()}.</span>
                )}
                {user.trial_ends_at && user.subscription_plan === "free_trial" && (
                  <span> Trial ends: {new Date(user.trial_ends_at).toLocaleDateString()}.</span>
                )}
              </p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 capitalize ${
              user.subscription_status === "active"
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }`}>
              {user.subscription_status}
            </span>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Choose your plan</h1>
          <p className="text-gray-500 mt-2">Upgrade or change your subscription anytime.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm max-w-xl mx-auto">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.value;
            const isCurrent = user.subscription_plan === plan.value;
            return (
              <button
                key={plan.value}
                type="button"
                onClick={() => setSelectedPlan(plan.value)}
                className={`relative bg-white rounded-2xl border p-5 flex flex-col text-left transition-all duration-200 hover:shadow-md ${
                  active
                    ? "border-brand-500 shadow-md shadow-brand-100 ring-1 ring-brand-500"
                    : "border-gray-100 hover:border-gray-200"
                } ${isCurrent ? "opacity-90" : ""}`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 text-white text-[9px] font-semibold uppercase tracking-wider">
                    Best
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-semibold uppercase tracking-wider">
                    Current
                  </div>
                )}

                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500">{plan.period}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{plan.desc}</p>

                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                      <CheckCircle size={12} className="text-brand-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {active && !isCurrent && (
                  <div className="mt-4">
                    <div className="w-full py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold text-center">
                      Selected
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="mt-4">
                    <div className="w-full py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold text-center">
                      Active
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        {selectedPlan && selectedPlan !== user.subscription_plan && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Switch to {PLANS.find((p) => p.value === selectedPlan)?.name}
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Your billing will be processed securely. Cancel anytime.
            </p>
          </div>
        )}

        {selectedPlan === user.subscription_plan && (
          <p className="text-center text-sm text-gray-400 mt-8">
            This is your current plan. Select a different plan to upgrade or downgrade.
          </p>
        )}
      </main>
    </div>
  );
}