export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
        <span>© {new Date().getFullYear()} DevFlow</span>
        <span>Built with React, Node.js & PostgreSQL</span>
      </div>
    </footer>
  );
}
