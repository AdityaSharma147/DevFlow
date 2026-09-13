import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import api from "../lib/api";
import Avatar from "../components/Avatar";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  labels: string[];
  assignee: { id: string; name: string; email: string } | null;
  projectId: string;
};

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "DONE", label: "Done" },
];

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  LOW: "bg-slate-700 text-slate-300",
  MEDIUM: "bg-blue-500/20 text-blue-300",
  HIGH: "bg-orange-500/20 text-orange-300",
  URGENT: "bg-red-500/20 text-red-300",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const [showAiForm, setShowAiForm] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<
    { title: string; priority: string }[]
  >([]);
  const [aiAdding, setAiAdding] = useState(false);
  async function handleGenerateTasks(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setAiError("");
    setAiGenerating(true);
    setAiSuggestions([]);
    try {
      const res = await api.post(`/ai/projects/${projectId}/generate-tasks`, {
        goal: aiGoal,
      });
      setAiSuggestions(res.data.tasks);
    } catch (err: any) {
      setAiError(err.response?.data?.error || "Failed to generate tasks");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleAddAllSuggestions() {
    setAiAdding(true);
    try {
      for (const t of aiSuggestions) {
        await api.post(`/projects/${projectId}/tasks`, {
          title: t.title,
          priority: t.priority,
        });
      }
      setAiSuggestions([]);
      setAiGoal("");
      setShowAiForm(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to add generated tasks:", err);
    } finally {
      setAiAdding(false);
    }
  }

  async function fetchTasks() {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, priority });
      setTitle("");
      setPriority("MEDIUM");
      setShowForm(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: Task["status"]) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update task status:", err);
      fetchTasks();
    }
  }

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId);
  }

  function handleDrop(status: Task["status"]) {
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/workspaces"
          className="text-sm text-slate-400 hover:text-white mb-4 inline-block"
        >
          ← Back to Workspaces
        </Link>

        <div className="flex items-center justify-between mb-6 mt-2">
          <h1 className="text-2xl font-bold text-white">Board</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
          <button
            onClick={() => setShowAiForm(!showAiForm)}
            className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 px-4 py-2 rounded-lg text-sm font-medium transition ml-2"
          >
            {showAiForm ? "Cancel" : "✨ Generate with AI"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex gap-3 items-end flex-wrap"
          >
            {error && <p className="text-red-400 text-xs w-full">{error}</p>}
            <div className="flex-1 min-w-50">
              <label className="block text-xs text-slate-400 mb-1">
                Task title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Write the thing..."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Task["priority"])
                }
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {creating ? "Adding..." : "Add"}
            </button>
          </form>
        )}
        {showAiForm && (
          <div className="bg-slate-900 border border-violet-500/30 rounded-xl p-4 mb-6">
            <form
              onSubmit={handleGenerateTasks}
              className="flex gap-3 items-end flex-wrap mb-3"
            >
              {aiError && (
                <p className="text-red-400 text-xs w-full">{aiError}</p>
              )}
              <div className="flex-1 min-w-60">
                <label className="block text-xs text-slate-400 mb-1">
                  Describe a goal
                </label>
                <input
                  type="text"
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                  placeholder="e.g. Build a payment system"
                />
              </div>
              <button
                type="submit"
                disabled={aiGenerating}
                className="bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {aiGenerating ? "Generating..." : "Generate"}
              </button>
            </form>

            {aiSuggestions.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  {aiSuggestions.length} tasks generated — review, then add
                  them:
                </p>
                <div className="space-y-1.5 mb-3">
                  {aiSuggestions.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-white">{t.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority as Task["priority"]]}`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddAllSuggestions}
                  disabled={aiAdding}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {aiAdding
                    ? "Adding..."
                    : `Add all ${aiSuggestions.length} tasks`}
                </button>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.key)}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 min-h-75"
              >
                <h3 className="text-slate-300 text-sm font-semibold mb-3 flex items-center justify-between">
                  {col.label}
                  <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </h3>

                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition"
                    >
                      <p className="text-white text-sm mb-2">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {task.assignee && <Avatar name={task.assignee.name} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={fetchTasks}
          />
        )}
      </div>
    </div>
  );
}
