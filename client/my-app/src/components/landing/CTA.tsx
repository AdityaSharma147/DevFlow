import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="bg-linear-to-br from-teal-600 to-teal-800 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to organize your team?
        </h2>
        <p className="text-teal-100 mb-8">
          Free to start. No credit card required.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-teal-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition"
        >
          Create your workspace
        </Link>
      </div>
    </section>
  );
}
