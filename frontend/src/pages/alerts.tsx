import { useEffect, useState } from "react";
import { getAlerts, resolveAlert, runAlertCheck } from "../utils/api";
import { AlertTriangle, CheckCircle2, RefreshCw, Check } from "lucide-react";
import clsx from "clsx";

interface Alert {
  id: number; product_id: number; product_name: string;
  alert_type: string; severity: string; message: string;
  is_resolved: boolean; created_at: string;
}

const severityConfig: Record<string, { badge: string; icon: string; border: string }> = {
  critical: { badge: "badge-danger", icon: "text-red-500", border: "border-l-red-500" },
  warning:  { badge: "badge-warn",   icon: "text-amber-500", border: "border-l-amber-400" },
  info:     { badge: "badge-info",   icon: "text-blue-500",  border: "border-l-blue-400" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const load = () => {
    setLoading(true);
    getAlerts(showResolved, filterSeverity || undefined)
      .then((r) => setAlerts(r.data || []))
      .catch((err) => {
        console.error("Failed to load alerts:", err);
        setAlerts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [showResolved, filterSeverity]);

  const handleResolve = async (id: number) => {
    await resolveAlert(id);
    load();
  };

  const handleRunCheck = async () => {
    setRunningCheck(true);
    const r = await runAlertCheck();
    setRunningCheck(false);
    alert(`Alert check complete. ${r.data.new_alerts_created} new alerts created.`);
    load();
  };

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const warning  = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {critical} critical · {warning} warnings
          </p>
        </div>
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={handleRunCheck}
          disabled={runningCheck}
        >
          <RefreshCw size={14} className={runningCheck ? "animate-spin" : ""} />
          Run Alert Check
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <label className="sr-only" htmlFor="severity-filter">
          Filter alerts by severity
        </label>
        <select
          id="severity-filter"
          className="input max-w-xs"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          aria-label="Filter alerts by severity"
        >
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved
        </label>
      </div>

      {/* Alert cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-20 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <CheckCircle2 size={40} className="text-green-400" />
          <p className="text-gray-500 text-sm">No alerts. All inventory levels are healthy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity] || severityConfig.info;
            return (
              <div
                key={alert.id}
                className={clsx(
                  "card border-l-4 flex items-start gap-4",
                  cfg.border,
                  alert.is_resolved && "opacity-60"
                )}
              >
                <AlertTriangle size={18} className={clsx("mt-0.5 flex-shrink-0", cfg.icon)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-gray-900 text-sm">{alert.product_name}</span>
                    <span className={`badge ${cfg.badge}`}>{alert.severity}</span>
                    <span className="badge badge-info">{alert.alert_type}</span>
                    {alert.is_resolved && <span className="badge badge-ok">Resolved</span>}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                {!alert.is_resolved && (
                  <button
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Mark resolved"
                    onClick={() => handleResolve(alert.id)}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
