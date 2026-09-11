import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdBy: { name: string; email: string };
  members: {
    id: string;
    role: string;
    user: { name: string; email: string };
  }[];
  tasks: { status: string }[];
};

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  members: { user: { id: string }; role: string }[];
};

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      const [wsRes, projRes] = await Promise.all([
        api.get("/workspaces"),
        api.get(`/workspaces/${workspaceId}/projects`),
      ]);

      const thisWorkspace = wsRes.data.workspaces.find(
        (w: Workspace) => w.id === workspaceId,
      );
      setWorkspace(thisWorkspace || null);
      setProjects(projRes.data.projects);
    } catch (err) {
      console.error("Failed to fetch workspace data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post(`/workspaces/${workspaceId}/projects`, {
        name,
        description,
      });
      setName("");
      setDescription("");
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Workspace not found.</p>
      </div>
    );
  }

  const myMembership = workspace.members.find(
    (m) => m.user.id === currentUser.id,
  );
  const canManageProjects =
    myMembership?.role === "ADMIN" || myMembership?.role === "MANAGER";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/workspaces"
          className="text-sm text-slate-400 hover:text-white mb-4 inline-block"
        >
          ← Back to Workspaces
        </Link>

        <div className="flex items-center justify-between mb-2 mt-2">
          <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
          {canManageProjects && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {showForm ? "Cancel" : "+ New Project"}
            </button>
          )}
        </div>
        {workspace.description && (
          <p className="text-slate-400 text-sm mb-8">{workspace.description}</p>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 space-y-4"
          >
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Project name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Website Redesign"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="What's this project about?"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>
        )}

        {projects.length === 0 ? (
          <p className="text-slate-400">No projects yet in this workspace.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition"
              >
                <Link to={`/projects/${p.id}`}>
                  <h3 className="text-white font-semibold mb-1 hover:text-indigo-400 transition">
                    {p.name}
                  </h3>
                </Link>
                {p.description && (
                  <p className="text-slate-400 text-sm mb-3">{p.description}</p>
                )}

                {(() => {
                  const total = p.tasks.length;
                  const done = p.tasks.filter(
                    (t) => t.status === "DONE",
                  ).length;
                  const percent =
                    total === 0 ? 0 : Math.round((done / total) * 100);

                  return (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>
                          {total === 0
                            ? "No tasks yet"
                            : `${done}/${total} tasks done`}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <p className="text-xs text-slate-500">
                  Created by {p.createdBy.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
