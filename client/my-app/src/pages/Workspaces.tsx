import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Avatar from "../components/Avatar";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: Member[];
};

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const ROLES = ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"];

export default function Workspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const [membersOpenFor, setMembersOpenFor] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState("");

  async function fetchWorkspaces() {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post("/workspaces", { name, description });
      setName("");
      setDescription("");
      setShowForm(false);
      fetchWorkspaces();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite(
    e: React.SubmitEvent<HTMLFormElement>,
    workspaceId: string,
  ) {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail,
      });
      setInviteSuccess(`${inviteEmail} added successfully`);
      setInviteEmail("");
      fetchWorkspaces();
    } catch (err: any) {
      setInviteError(err.response?.data?.error || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  function toggleInvite(workspaceId: string) {
    setInviteError("");
    setInviteSuccess("");
    setInviteEmail("");
    setInviteOpenFor(inviteOpenFor === workspaceId ? null : workspaceId);
  }

  function toggleMembers(workspaceId: string) {
    setMemberActionError("");
    setMembersOpenFor(membersOpenFor === workspaceId ? null : workspaceId);
  }

  async function handleRoleChange(
    workspaceId: string,
    memberId: string,
    newRole: string,
  ) {
    setMemberActionError("");
    try {
      await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, {
        role: newRole,
      });
      fetchWorkspaces();
    } catch (err: any) {
      setMemberActionError(
        err.response?.data?.error || "Failed to update role",
      );
    }
  }

  async function handleRemoveMember(workspaceId: string, memberId: string) {
    setMemberActionError("");
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      fetchWorkspaces();
    } catch (err: any) {
      setMemberActionError(
        err.response?.data?.error || "Failed to remove member",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Workspaces
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {showForm ? "Cancel" : "+ New Workspace"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 space-y-4"
          >
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                placeholder="Acme Team"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                placeholder="What's this workspace for?"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {creating ? "Creating..." : "Create Workspace"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-slate-600 dark:text-slate-400">
            Loading workspaces...
          </p>
        ) : workspaces.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            You don't have any workspaces yet. Create your first one above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {workspaces.map((ws) => {
              const myMembership = ws.members.find(
                (m) => m.user.id === currentUser.id,
              );
              const isAdmin = myMembership?.role === "ADMIN";

              return (
                <div
                  key={ws.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-teal-500/50 transition"
                >
                  <h3
                    onClick={() => navigate(`/workspaces/${ws.id}`)}
                    className="text-slate-900 dark:text-white font-semibold mb-1 cursor-pointer hover:text-teal-400 transition"
                  >
                    {ws.name}
                  </h3>
                  {ws.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {ws.description}
                    </p>
                  )}

                  <button
                    onClick={() => toggleMembers(ws.id)}
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium mr-4"
                  >
                    {membersOpenFor === ws.id ? "Hide" : "View"}{" "}
                    {ws.members.length} member
                    {ws.members.length !== 1 ? "s" : ""}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => toggleInvite(ws.id)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                    >
                      {inviteOpenFor === ws.id ? "Cancel" : "+ Invite member"}
                    </button>
                  )}

                  {membersOpenFor === ws.id && (
                    <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                      {memberActionError && (
                        <p className="text-xs text-red-400">
                          {memberActionError}
                        </p>
                      )}
                      {ws.members.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar name={m.user.name} />
                            <div>
                              <span className="text-slate-900 dark:text-white">
                                {m.user.name}
                              </span>
                              <span className="text-slate-500 dark:text-slate-500 ml-1">
                                ({m.user.email})
                              </span>
                            </div>
                          </div>
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={m.role}
                                onChange={(e) =>
                                  handleRoleChange(ws.id, m.id, e.target.value)
                                }
                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white text-xs"
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemoveMember(ws.id, m.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-400">
                              {m.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {inviteOpenFor === ws.id && (
                    <form
                      onSubmit={(e) => handleInvite(e, ws.id)}
                      className="mt-3 space-y-2"
                    >
                      {inviteError && (
                        <p className="text-xs text-red-400">{inviteError}</p>
                      )}
                      {inviteSuccess && (
                        <p className="text-xs text-green-400">
                          {inviteSuccess}
                        </p>
                      )}
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        placeholder="teammate@example.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="submit"
                        disabled={inviting}
                        className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        {inviting ? "Inviting..." : "Send Invite"}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
