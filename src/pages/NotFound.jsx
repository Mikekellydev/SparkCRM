// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-center px-4 text-slate-50">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-slate-400 mb-6">We could not find that page.</p>
      <Link
        to="/dashboard"
        className="px-6 py-2 bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition font-semibold"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
