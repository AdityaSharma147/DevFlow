import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Props = {
  data: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
};

const STATUS_META: {
  key: keyof Props["data"];
  label: string;
  color: string;
}[] = [
  { key: "TODO", label: "To Do", color: "#64748b" }, // slate-500
  { key: "IN_PROGRESS", label: "In Progress", color: "#3b82f6" }, // blue-500
  { key: "REVIEW", label: "In Review", color: "#f97316" }, // orange-500
  { key: "DONE", label: "Done", color: "#10b981" }, // emerald-500
];

export default function TaskStatusChart({ data }: Props) {
  const chartData = STATUS_META.map((s) => ({
    name: s.label,
    value: data[s.key],
    color: s.color,
  })).filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500 dark:text-slate-400">
        No tasks yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--tooltip-bg, #fff)",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
