import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
      <span className="inline-block text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1 mb-6">
        AI-Powered Project Management
      </span>

      <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto">
        Plan. Build. Ship.
        <span className="block text-indigo-400">Scale — with DevFlow.</span>
      </h1>

      <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
        A team project management platform built for developers — Kanban boards,
        real-time collaboration, GitHub integration, and an AI assistant that
        helps you plan.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          to="/register"
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Start for free
        </Link>

        <a
          href="#features"
          className="text-slate-300 hover:text-white px-6 py-3 rounded-lg border border-slate-700 transition"
        >
          See features
        </a>
      </div>
    </section>
  );
}
