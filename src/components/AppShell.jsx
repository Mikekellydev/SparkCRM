import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const navItems = [
  { to: "/dashboard", label: "Dashboard", helper: "Pulse + pipeline" },
  { to: "/contacts", label: "Contacts", helper: "People + accounts" },
  { to: "/tasks", label: "Tasks", helper: "Work queue" },
  { to: "/reset-password", label: "Security", helper: "Credentials" },
];

export default function AppShell({ title, subtitle, actions, children }) {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) setUserEmail(data.user.email);
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const renderedNav = useMemo(
    () =>
      navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `group block rounded-2xl border px-4 py-3 transition ${
              isActive
                ? "border-amber-300 bg-amber-300/10 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.3)]"
                : "border-slate-800 bg-slate-900/40 text-slate-200 hover:border-amber-200/60 hover:bg-slate-800/80"
            }`
          }
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold tracking-tight">{item.label}</div>
            <div className="text-[10px] uppercase text-slate-400 group-hover:text-amber-200 tracking-[0.1em]">
              {item.helper}
            </div>
          </div>
        </NavLink>
      )),
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex h-full">
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur">
          <div className="px-6 py-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
                  SparkCRM
                </p>
                <h1 className="text-xl font-semibold text-white">
                  Customer OS
                </h1>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
                Live
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">{renderedNav}</nav>

          <div className="p-4 border-t border-slate-800">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Account
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {userEmail || "Signed in"}
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep sessions secure. Rotate credentials regularly to protect
                customer data.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300">
                  Operating layer
                </p>
                <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                  <span aria-hidden className="text-slate-500">
                    ⌕
                  </span>
                  <input
                    className="w-48 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Search contacts or tasks"
                    aria-label="Quick search"
                  />
                </div>
                {actions}
                <button
                  onClick={() => navigate("/contacts")}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  New contact
                </button>
              </div>
            </div>
          </header>

          <div className="p-5 md:p-8 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
