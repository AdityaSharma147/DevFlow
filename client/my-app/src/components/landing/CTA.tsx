import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-slate-200 dark:border-slate-800">
      <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white mb-4">
        Give your team's board a home
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Free to use, open source, and built to show exactly how a
        production-grade team tool comes together.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          to="/register"
          className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Create your workspace
        </Link>
        <a
          href="https://github.com/AdityaSharma147/DevFlow"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 transition"
        >
          <FaGithub size={16} />
          View source
        </a>
      </div>
    </section>
  );
}
