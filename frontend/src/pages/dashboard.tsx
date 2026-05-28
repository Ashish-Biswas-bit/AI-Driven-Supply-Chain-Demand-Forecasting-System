import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getDashboardStats } from "../utils/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { Package, TrendingUp, Bell, DollarSign, Clock, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const monthly = stats?.monthly_sales || [];
  const chartData = monthly.map((m: any) => ({
    month: m.month?.slice(5) || m.month,
    units: m.units || 0,
    revenue: Math.round(m.revenue || 0),
  }));
  const hasChartData = chartData.length > 0;

  // Determine subscription state for banner
  const isTrial = user?.subscription_plan === 'free_trial' && user?.subscription_status === 'active';
  const isExpired = user?.subscription_status === 'expired';
  const trialEndDate = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const daysLeft = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-6">
      {/* Subscription status banner */}
      {isTrial && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">Free Trial Active</p>
            <p className="text-xs text-blue-700 mt-0.5">
              {daysLeft > 0
                ? `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial. `
                : 'Your trial ends today. '}
              <Link href="/subscribe" className="underline font-medium hover:text-blue-800">
                Upgrade to keep access
              </Link>
            </p>
          </div>
          <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full shrink-0">
            {daysLeft} day{daysLeft === 1 ? '' : 's'} left
          </span>
        </div>
      )}

      {isExpired && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">Subscription Expired</p>
            <p className="text-xs text-red-700 mt-0.5">
              Your subscription has ended.{' '}
              <Link href="/subscribe" className="underline font-medium hover:text-red-800">
                Renew now to regain full access
              </Link>
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered supply chain overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats?.total_products ?? 0}
          delta="Active SKUs"
          deltaType="neutral"
          icon={<Package size={18} />}
          color="blue"
        />
        <StatCard
          label="Forecast Accuracy"
          value={`${stats?.forecast_accuracy ?? 0}%`}
          delta="Avg confidence"
          deltaType="up"
          icon={<TrendingUp size={18} />}
          color="green"
        />
        <StatCard
          label="Active Alerts"
          value={stats?.active_alerts ?? 0}
          delta={`${stats?.critical_alerts ?? 0} critical`}
          deltaType={stats?.critical_alerts > 0 ? "down" : "neutral"}
          icon={<Bell size={18} />}
          color={stats?.critical_alerts > 0 ? "red" : "amber"}
        />
        <StatCard
          label="Revenue (30d)"
          value={`$${(stats?.revenue_last_30d ?? 0).toLocaleString()}`}
          delta="Last 30 days"
          deltaType="up"
          icon={<DollarSign size={18} />}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Sales Volume</h2>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="units" stroke="#1a7fc1" strokeWidth={2} dot={false} name="Units Sold" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              No sales data available. Import data to see monthly trends.
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue ($)</h2>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#0f4c81" radius={[3, 3, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              No revenue data available. Import data to see monthly trends.
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown + Low stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={stats?.top_categories || []}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a7fc1" radius={[0, 3, 3, 0]} name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Low Stock Products</h2>
          {stats?.low_stock_products?.length === 0 ? (
            <p className="text-sm text-gray-400">All products above safety stock levels.</p>
          ) : (
            <div className="space-y-3">
              {(stats?.low_stock_products || []).slice(0, 6).map((p: any) => {
                const pct = Math.min(100, Math.round((p.current_stock / p.safety_stock) * 100));
                const color = pct < 50 ? "bg-red-500" : "bg-amber-400";
                const widthClass =
                  pct === 0 ? "w-0" :
                  pct < 25 ? "w-1/4" :
                  pct < 50 ? "w-1/2" :
                  pct < 75 ? "w-3/4" :
                  "w-full";
                return (
                  <div key={p.product_id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate max-w-[60%]">{p.name}</span>
                      <span className="text-gray-500">{p.current_stock} / {p.safety_stock} units</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} ${widthClass}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24 bg-gray-100" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-72 bg-gray-100" />
        <div className="card h-72 bg-gray-100" />
      </div>
    </div>
  );
}
