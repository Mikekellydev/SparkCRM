import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
        <div className="hidden flex-1 flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-inner shadow-slate-950/30 lg:flex">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            SparkCRM
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Operate like a large team without paying enterprise prices.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Centralize contacts, keep tasks under control, and give small teams
            enterprise-grade rhythm. Login below to get back to work.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Fast onboarding for lean teams.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Clear pricing. No surprise fees.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Hosted securely with Supabase auth.
            </li>
          </ul>
        </div>

        <div className="flex-1">
          <form
            onSubmit={handleLogin}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-inner shadow-slate-950/40"
          >
            <div className="mb-6 space-y-1 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
                Secure sign-in
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Enter your credentials to access SparkCRM.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <p className="text-center text-sm text-slate-400">
                <a
                  href="/reset-password"
                  className="text-amber-200 underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
