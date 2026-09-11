import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

type DashboardData = {
  workspaceCount: number;
  taskCount: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  upcomingTasks: {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
    project: { id: string; name: string };
  }[];
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "In Review",
  DONE: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-700 text-slate-300",
  MEDIUM: "bg-blue-500/20 text-blue-300",
  HIGH: "bg-orange-500/20 text-orange-300",
  URGENT: "bg-red-500/20 text-red-300",
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {user.name || "there"}
        </h1>
        <p className="text-slate-400 text-sm mb-8">{user.email}</p>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
        ) : !data ? (
          <p className="text-slate-400">Couldn't load dashboard data.</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">
                  {data.workspaceCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">Workspaces</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">
                  {data.taskCount}
                </p>
                <p className="text-xs text-slate-400 mt-1">My Tasks</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-orange-300">
                  {data.tasksByStatus.IN_PROGRESS}
                </p>
                <p className="text-xs text-slate-400 mt-1">In Progress</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-300">
                  {data.tasksByStatus.DONE}
                </p>
                <p className="text-xs text-slate-400 mt-1">Completed</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
              <h2 className="text-white font-semibold mb-1">Quick Actions</h2>
              <p className="text-slate-500 text-xs mb-4">
                Jump straight to common tasks
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/workspaces"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  + New Workspace
                </Link>
                <Link
                  to="/workspaces"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  + New Project
                </Link>
                <Link
                  to="/workspaces"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  👥 Invite Teammate
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
              <h2 className="text-white font-semibold mb-4">My Tasks</h2>
              {data.upcomingTasks.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No tasks assigned to you yet. Head to a project board to get
                  started.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.upcomingTasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/projects/${task.project.id}`}
                      className="flex items-center justify-between bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-4 py-3 transition"
                    >
                      <div>
                        <p className="text-white text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">
                          {task.project.name} · {STATUS_LABELS[task.status]}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/workspaces"
              className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Go to Workspaces
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
