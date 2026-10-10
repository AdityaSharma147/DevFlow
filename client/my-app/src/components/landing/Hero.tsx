import { Link } from "react-router-dom";
import { GitCommit, GripVertical } from "lucide-react";

const COLUMNS = ["To Do", "In Progress", "Done"];

const MOCK_CARDS = [
  { id: "c1", title: "Design auth flow", priority: "HIGH", col: 0 },
  { id: "c2", title: "Set up CI pipeline", priority: "MEDIUM", col: 0 },
  { id: "c3", title: "Build Kanban board", priority: "URGENT", col: 1 },
  { id: "c4", title: "Link GitHub repo", priority: "MEDIUM", col: 1 },
  { id: "c5", title: "Write API tests", priority: "LOW", col: 2 },
];

const DRAGGED_CARD = { title: "Design auth flow", priority: "HIGH" as const };

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-ink">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-28 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-36">
        {/* Left column */}
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
            Tasks and commits, finally in the same place.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-400">
            DevFlow pairs a real Kanban board with your GitHub activity, so your
            team sees what's being built and what's been shipped — in one view,
            without switching tabs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
            >
              Start building — it's free
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-10 font-plex-mono text-xs uppercase tracking-wider text-slate-400 dark:text-slate-600">
            React · TypeScript · Node.js · PostgreSQL · Socket.IO · GitHub API
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-surface">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 truncate rounded bg-slate-100 px-2 py-0.5 font-plex-mono text-[11px] text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                devflow-flame-one.vercel.app/projects
              </span>
            </div>

            <div className="relative grid grid-cols-3 gap-3 p-4">
              {COLUMNS.map((col, colIndex) => (
                <div key={col} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <span className="font-plex text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
                      {col}
                    </span>
                    <span className="font-plex-mono text-[10px] text-slate-400 dark:text-slate-600">
                      {MOCK_CARDS.filter((c) => c.col === colIndex).length}
                    </span>
                  </div>

                  {colIndex === 1 && (
                    <div className="drop-zone mb-2 rounded-lg border-2 border-dashed border-teal-400/0 bg-teal-400/0 p-2.5">
                      <div className="h-10 w-2/3 rounded bg-transparent" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {MOCK_CARDS.filter((c) => c.col === colIndex).map(
                      (card, i) => (
                        <div
                          key={card.id}
                          className="hero-card group flex cursor-grab items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-teal-300 hover:shadow-md active:cursor-grabbing dark:border-slate-700/60 dark:bg-ink/60"
                          style={{
                            animationDelay: `${(colIndex * 2 + i) * 90}ms`,
                          }}
                        >
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-slate-400 dark:text-slate-600" />
                          <div className="min-w-0">
                            <p className="truncate font-plex text-[12.5px] font-medium text-slate-700 dark:text-slate-300">
                              {card.title}
                            </p>
                            <span
                              className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[card.priority]}`}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ))}

              <div className="drag-ghost pointer-events-none absolute left-4 top-9 flex w-[calc(33.333%-1.25rem)] items-start gap-2 rounded-lg border border-teal-400 bg-white p-2.5 shadow-xl dark:bg-ink">
                <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                <div className="min-w-0">
                  <p className="truncate font-plex text-[12.5px] font-medium text-slate-700 dark:text-slate-300">
                    {DRAGGED_CARD.title}
                  </p>
                  <span
                    className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[DRAGGED_CARD.priority]}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-ink">
              <GitCommit className="h-3.5 w-3.5 text-teal-500" />
              <span className="font-plex-mono text-[11px] text-slate-500 dark:text-slate-500">
                3 commits synced from main
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
