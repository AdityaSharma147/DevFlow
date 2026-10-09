import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Commit = { sha: string; message: string; author: string; date: string };

type Props = { commits: Commit[] };

export default function CommitActivityChart({ commits }: Props) {
  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-xs text-slate-500 dark:text-slate-400">
        No commit data
      </div>
    );
  }

  const counts: Record<string, number> = {};
  commits.forEach((c) => {
    const day = new Date(c.date).toISOString().slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });

  const chartData = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      commits: count,
    }));

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "currentColor" }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "currentColor" }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          cursor={{ fill: "rgba(20,184,166,0.08)" }}
          contentStyle={{
            borderRadius: 8,
            fontSize: 12,
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar
          dataKey="commits"
          fill="#14b8a6"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
