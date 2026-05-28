import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";
import {
  BarChart3, Package, TrendingUp, Shield, ArrowRight, ChevronDown,
  Menu, X, CheckCircle, Star, Users, Zap, BrainCircuit,
} from "lucide-react";

const metrics = [
  { label: "Products Tracked", value: "10K+", icon: Package },
  { label: "Forecast Accuracy", value: "94%", icon: TrendingUp },
  { label: "Active Users", value: "2,500+", icon: Users },
  { label: "Avg. Cost Saved", value: "32%", icon: Zap },
];

const features = [
  {
    title: "AI-Powered Demand Forecasting",
    desc: "Leverage state-of-the-art machine learning models to predict demand with up to 94% accuracy. Reduce stockouts and overstock situations.",
    icon: BrainCircuit,
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Real-Time Inventory Tracking",
    desc: "Monitor stock levels across warehouses in real time. Get instant alerts when products reach critical thresholds.",
    icon: Package,
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Smart Alerts & Notifications",
    desc: "Receive intelligent alerts for stockouts, overstock, and reorder points. Prioritize actions with severity-based notifications.",
    icon: Shield,
    color: "from-amber-500 to-orange-400",
  },
  {
    title: "Analytics & Reporting",
    desc: "Beautiful, interactive dashboards with drill-down analytics. Understand trends, seasonality, and revenue patterns at a glance.",
    icon: BarChart3,
    color: "from-purple-500 to-pink-400",
  },
];

const steps = [
  { step: "01", title: "Create Account", desc: "Sign up in seconds with your email and get instant access." },
  { step: "02", title: "Import Your Data", desc: "Upload your product catalog and sales history via CSV or connect directly." },
  { step: "03", title: "Get AI Insights", desc: "Receive accurate demand forecasts, smart alerts, and actionable recommendations." },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Supply Chain Director, TechCorp",
    content: "This system transformed our inventory management. We reduced stockouts by 45% in the first quarter.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Operations Manager, RetailPlus",
    content: "The AI forecasting is remarkably accurate. It's like having a data science team built into our workflow.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "CEO, SupplyChain Pro",
    content: "We evaluated 12 platforms before choosing this one. The ROI has been exceptional — setup took just hours.",
    rating: 5,
  },
];

const faqs = [
  { q: "What data do I need to get started?", a: "You can start with just your product catalog. Upload sales history for more accurate forecasts." },
  { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption, secure JWT authentication, and never share your data." },
  { q: "Can I integrate with my existing systems?", a: "Yes! We support CSV import and REST API integration with your ERP or inventory systems." },
  { q: "How accurate are the forecasts?", a: "Our models typically achieve 85-94% accuracy depending on data quality and history length." },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                SC
              </div>
              <span className="text-lg font-bold text-gray-900">
                Supply<span className="text-brand-600">Chain</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 py-2">How It Works</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 py-2">Testimonials</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 py-2">Pricing</a>
            <div className="pt-3 flex flex-col gap-2">
              <Link href="/login" className="text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50">Sign In</Link>
              <Link href="/signup" className="text-center text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg px-4 py-2.5">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-brand-200/30 via-brand-100/20 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium mb-6">
              <Zap size={14} />
              AI-Powered Supply Chain Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Predict Demand.
              <br />
              Optimize Stock.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                Grow Smarter.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              AI-driven supply chain platform that forecasts demand, prevents stockouts,
              and helps you make data-backed inventory decisions — in real time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-200 hover:shadow-xl hover:from-brand-700 hover:to-brand-800 transition-all text-sm"
              >
                Start Free Trial
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                Explore Features
                <ChevronDown size={16} />
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400">No credit card required • Free for 14 days</p>
          </div>

          {/* Hero dashboard preview */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-400 ml-2">dashboard.supplychain.ai</span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {metrics.map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <m.icon size={18} className="mx-auto text-brand-500 mb-1" />
                      <div className="text-lg font-bold text-gray-900">{m.value}</div>
                      <div className="text-xs text-gray-500">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-48 bg-gradient-to-r from-brand-50 via-brand-100/40 to-brand-50 rounded-xl flex items-center justify-center">
                  <div className="flex items-end gap-3 h-24">
                    {[35, 55, 45, 70, 60, 85, 65, 90, 75, 95, 80, 88].map((h, i) => (
                      <div
                        key={i}
                        className="w-6 sm:w-8 rounded-t-md bg-gradient-to-t from-brand-500 to-brand-300 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to
              <br />
              <span className="text-brand-600">manage inventory smarter</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From AI forecasting to real-time alerts — one platform, complete control.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Get started in{" "}
              <span className="text-brand-600">three simple steps</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From signup to AI insights — faster than you think.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative text-center group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg mb-5 group-hover:scale-110 group-hover:bg-brand-100 transition-all">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trusted by{" "}
              <span className="text-brand-600">supply chain leaders</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              See what our customers have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent
              <br />
              <span className="text-brand-600">pricing for every stage</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Start free and upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: "Free Trial",
                plan: "free_trial",
                price: "$0",
                period: "14 days",
                desc: "Get started with full access for 14 days.",
                features: [
                  "AI demand forecasting",
                  "Real-time inventory tracking",
                  "Smart alerts & notifications",
                  "Analytics dashboard",
                  "CSV data import",
                ],
                cta: "Start Free Trial",
                popular: false,
              },
              {
                name: "Weekly",
                plan: "weekly",
                price: "$9",
                period: "/week",
                desc: "Perfect for short-term projects and evaluation.",
                features: [
                  "Everything in Free Trial",
                  "Unlimited products",
                  "Priority email support",
                  "Extended forecast periods",
                  "Data export (PDF/CSV)",
                ],
                cta: "Start Weekly",
                popular: false,
              },
              {
                name: "Monthly",
                plan: "monthly",
                price: "$29",
                period: "/month",
                desc: "Best for growing businesses with regular needs.",
                features: [
                  "Everything in Weekly",
                  "Advanced AI models",
                  "API access & integrations",
                  "Role-based user access",
                  "Priority chat support",
                ],
                cta: "Start Monthly",
                popular: true,
              },
              {
                name: "Yearly",
                plan: "yearly",
                price: "$249",
                period: "/year",
                desc: "Save 28% with annual billing. For serious teams.",
                features: [
                  "Everything in Monthly",
                  "Dedicated account manager",
                  "Custom AI model tuning",
                  "SSO & team management",
                  "99.9% SLA guarantee",
                ],
                cta: "Start Yearly",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.plan}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col transition-all duration-200 hover:shadow-lg ${
                  plan.popular
                    ? "border-brand-500 shadow-md shadow-brand-100 ring-1 ring-brand-500"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{plan.desc}</p>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={14} className="text-brand-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={{
                    pathname: "/signup",
                    query: { plan: plan.plan },
                  }}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm hover:from-brand-700 hover:to-brand-800"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your supply chain?
          </h2>
          <p className="text-brand-200/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of businesses using AI to predict demand, reduce costs, and grow faster.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-sm"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <p className="mt-4 text-xs text-brand-300/60">No credit card required</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-xs">
                SC
              </div>
              <span className="text-sm font-bold text-gray-900">
                Supply<span className="text-brand-600">Chain</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <a href="#features" className="hover:text-gray-700">Features</a>
              <a href="#how-it-works" className="hover:text-gray-700">How It Works</a>
              <a href="#testimonials" className="hover:text-gray-700">Testimonials</a>
              <a href="#faq" className="hover:text-gray-700">FAQ</a>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} SupplyChain AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
