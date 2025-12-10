import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-inner shadow-slate-950/40"
      >
        <div className="mb-4 space-y-1 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
            Security
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Reset your password
          </h2>
          <p className="text-sm text-slate-400">
            Use a strong password to protect customer data.
          </p>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">New password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Update password
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-slate-300">{message}</p>
        )}
      </form>
    </div>
  );
}
