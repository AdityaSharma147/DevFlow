import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-500">
        <span>© {new Date().getFullYear()} DevFlow</span>
        <span className="font-plex-mono text-xs">
          React · Node.js · PostgreSQL · Prisma
        </span>
        <a
          href="https://github.com/AdityaSharma147/DevFlow"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
        >
          <FaGithub size={15} />
          Source
        </a>
      </div>
    </footer>
  );
}
