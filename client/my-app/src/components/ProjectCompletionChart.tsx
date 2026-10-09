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
  projects: { name: string; percent: number; done: number; total: number }[];
};

function colorFor(percent: number) {
  if (percent === 100) return "#10b981"; // emerald-500
  if (percent >= 50) return "#3b82f6"; // blue-500
  if (percent > 0) return "#f97316"; // orange-500
  return "#64748b"; // slate-500
}

export default function ProjectCompletionChart({ projects }: Props) {
  const withTasks = projects.filter((p) => p.total > 0);

  if (withTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-500 dark:text-slate-400">
        No tasks tracked yet
      </div>
    );
  }

  const chartData = withTasks.map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name,
    percent: p.percent,
    done: p.done,
    total: p.total,
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(160, chartData.length * 44)}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "currentColor" }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
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
          formatter={(_value, _name, props: any) => [
            `${props.payload.done}/${props.payload.total} tasks (${props.payload.percent}%)`,
            "Completed",
          ]}
        />
        <Bar dataKey="percent" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={colorFor(entry.percent)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
