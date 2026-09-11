import { KanbanSquare, Users, Bot, Bell, BarChart3 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
const features = [
  {
    icon: KanbanSquare,
    title: "Kanban Boards",
    desc: "Drag-and-drop task management across TODO, In Progress, Review, and Done.",
  },
  {
    icon: Users,
    title: "Team Workspaces",
    desc: "Invite members, manage roles, and collaborate across projects.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Generate tasks, get project summaries, and prioritize your backlog.",
  },
  {
    icon: FaGithub,
    title: "GitHub Integration",
    desc: "Connect repos and see commits, PRs, and issues right in your dashboard.",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    desc: "See task changes, comments, and notifications the moment they happen.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    desc: "Track progress, spot blockers, and understand team velocity.",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-white text-center mb-4">
        Everything your team needs
      </h2>
      <p className="text-slate-400 text-center max-w-xl mx-auto mb-14">
        From planning to deployment tracking, DevFlow keeps your team in sync.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 transition"
          >
            <Icon className="text-indigo-400 mb-4" size={28} />
            <h3 className="text-white font-semibold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
