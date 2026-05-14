import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "amber";
}

const colorMap = {
  blue:  { bg: "bg-blue-50",  text: "text-blue-700",  icon: "bg-blue-100"  },
  green: { bg: "bg-green-50", text: "text-green-700", icon: "bg-green-100" },
  red:   { bg: "bg-red-50",   text: "text-red-700",   icon: "bg-red-100"   },
  amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "bg-amber-100" },
};

export default function StatCard({
  label, value, delta, deltaType = "neutral", icon, color = "blue",
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="card flex items-start gap-4">
      {icon && (
        <div className={clsx("p-2.5 rounded-lg flex-shrink-0", c.icon)}>
          <span className={clsx("block", c.text)}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
        {delta && (
          <p className={clsx("text-xs mt-1",
            deltaType === "up" ? "text-green-600" :
            deltaType === "down" ? "text-red-500" : "text-gray-400"
          )}>
            {deltaType === "up" ? "↑" : deltaType === "down" ? "↓" : ""} {delta}
          </p>
        )}
      </div>
    </div>
  );
}
