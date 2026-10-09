import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  data: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
};

const PRIORITY_META = [
  { key: "LOW" as const, label: "Low", color: "#64748b" }, // slate-500
  { key: "MEDIUM" as const, label: "Medium", color: "#3b82f6" }, // blue-500
  { key: "HIGH" as const, label: "High", color: "#f97316" }, // orange-500
  { key: "URGENT" as const, label: "Urgent", color: "#ef4444" }, // red-500
];

export default function PriorityChart({ data }: Props) {
  const chartData = PRIORITY_META.map((p) => ({
    name: p.label,
    value: data[p.key],
    color: p.color,
  }));

  const hasData = chartData.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500 dark:text-slate-400">
        No tasks yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "currentColor" }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "currentColor" }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
          contentStyle={{
            borderRadius: 8,
            fontSize: 12,
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
