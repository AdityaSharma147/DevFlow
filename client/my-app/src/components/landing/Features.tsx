import { KanbanSquare, Bot, Bell } from "lucide-react";
import TaskStatusChart from "../TaskStatusChart";
import CommitActivityChart from "../CommitActivityChart";
import Avatar from "../Avatar";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SAMPLE_STATUS = { TODO: 4, IN_PROGRESS: 3, REVIEW: 2, DONE: 7 };

const SAMPLE_COMMITS = [
  {
    sha: "a1b2c3d",
    message: "Fix auth redirect",
    author: "you",
    date: daysAgo(9),
  },
  {
    sha: "e4f5g6h",
    message: "Add Kanban drag handlers",
    author: "you",
    date: daysAgo(9),
  },
  {
    sha: "i7j8k9l",
    message: "Wire up GitHub OAuth",
    author: "you",
    date: daysAgo(6),
  },
  {
    sha: "m1n2o3p",
    message: "Dashboard charts",
    author: "you",
    date: daysAgo(3),
  },
  { sha: "q4r5s6t", message: "Fix TS build", author: "you", date: daysAgo(3) },
  {
    sha: "u7v8w9x",
    message: "Add commit chart",
    author: "you",
    date: daysAgo(1),
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white mb-3 max-w-md">
        Everything your team needs, without the bloat
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-lg mb-12">
        DevFlow keeps planning, code, and collaboration in one place — each
        piece built to stay out of your way.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
            GitHub integration
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Link a repo and see commits, pull requests, and issues on the board.
          </p>
          <CommitActivityChart commits={SAMPLE_COMMITS} />
        </div>

        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
            Reports &amp; analytics
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Track status, spot blockers, and understand team velocity at a
            glance.
          </p>
          <TaskStatusChart data={SAMPLE_STATUS} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <KanbanSquare
            className="text-teal-500 dark:text-teal-400 mb-3"
            size={22}
          />
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1.5 text-sm">
            Kanban boards
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Drag-and-drop tasks across To Do, In Progress, Review, and Done.
          </p>
        </div>

        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <Bot className="text-teal-500 dark:text-teal-400 mb-3" size={22} />
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1.5 text-sm">
            AI task generation
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Describe a goal in plain language and get a reviewable task
            checklist.
          </p>
        </div>

        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex -space-x-2 mb-3">
            <Avatar name="Aditya Sharma" />
            <Avatar name="Maya Chen" />
            <Avatar name="Sam Okafor" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1.5 text-sm">
            Team workspaces
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Invite members and manage roles — Admin, Manager, Developer, Viewer.
          </p>
        </div>

        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <Bell className="text-teal-500 dark:text-teal-400 mb-3" size={22} />
          <h3 className="text-slate-900 dark:text-white font-semibold mb-1.5 text-sm">
            Real-time updates
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            See task changes, comments, and notifications the moment they
            happen.
          </p>
        </div>
      </div>
    </section>
  );
}
