import { useEffect, useState } from "react";
import api from "../lib/api";
import Avatar from "./Avatar";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  labels: string[];
  projectId: string;
  assignee: { id: string; name: string; email: string } | null;
};

type Props = {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
};

type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};

export default function TaskModal({ task, onClose, onTaskUpdated }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigning, setAssigning] = useState(false);

  async function fetchComments() {
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setComments(res.data.comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      const res = await api.get(`/projects/${task.projectId}/members`);
      setMembers(res.data.members);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }

  async function handleAssign(userId: string) {
    setAssigning(true);
    try {
      await api.patch(`/tasks/${task.id}`, { assigneeId: userId || null });
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to assign task:", err);
    } finally {
      setAssigning(false);
    }
  }

  useEffect(() => {
    fetchComments();
    fetchMembers();
  }, [task.id]);

  async function handlePostComment(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError("");
    setPosting(true);
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {task.description && (
          <p className="text-slate-400 text-sm mb-4">{task.description}</p>
        )}

        <div className="flex gap-2 mb-6">
          {task.labels.map((label) => (
            <span
              key={label}
              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <label className="block text-xs text-slate-400 mb-1">
            Assigned to
          </label>
          <select
            value={task.assignee?.id || ""}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={assigning}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-sm font-semibold text-white mb-3">Comments</h3>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-slate-500 text-sm mb-4">No comments yet.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.author.name} />
                    <span className="text-xs font-medium text-white">
                      {c.author.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handlePostComment} className="flex gap-2">
          {error && <p className="text-red-400 text-xs w-full">{error}</p>}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={posting}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
