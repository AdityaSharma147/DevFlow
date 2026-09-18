import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="block text-center text-2xl font-bold text-slate-900 dark:text-white mb-8"
        >
          Dev<span className="text-teal-500 dark:text-teal-400">Flow</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
