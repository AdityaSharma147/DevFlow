import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          Dev<span className="text-indigo-400">Flow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
