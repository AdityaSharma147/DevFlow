import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import api from "../../lib/api";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

type SearchResults = {
  projects: { id: string; name: string; workspaceId: string }[];
  tasks: { id: string; title: string; projectId: string }[];
};

export default function AppHeader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    projects: [],
    tasks: [],
  });
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggleTheme } = useTheme();
  function handleSearchChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults({ projects: [], tasks: [] });
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(value)}`);
        setResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 350);
  }

  function goToProject(id: string) {
    setShowResults(false);
    setQuery("");
    navigate(`/projects/${id}`);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-lg font-bold text-slate-900 dark:text-white shrink-0"
        >
          Dev<span className="text-indigo-400">Flow</span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Search projects or tasks..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
              {results.projects.length === 0 && results.tasks.length === 0 ? (
                <p className="text-slate-500 text-sm p-4">No results found.</p>
              ) : (
                <>
                  {results.projects.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 px-3 pt-3 pb-1">
                        Projects
                      </p>
                      {results.projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => goToProject(p.id)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {results.tasks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 px-3 pt-3 pb-1">
                        Tasks
                      </p>
                      {results.tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => goToProject(t.projectId)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-800 transition"
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NotificationBell />
          <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
