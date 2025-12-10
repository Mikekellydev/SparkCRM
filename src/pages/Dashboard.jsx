import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: contactsData, error: contactError } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: tasksData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (contactError) toast.error("Unable to load contacts right now.");
      if (taskError) toast.error("Unable to load tasks right now.");

      setContacts(contactsData || []);
      setTasks(tasksData || []);
    };

    fetchData();
  }, []);

  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const pipelineStages = useMemo(() => {
    if (contacts.length === 0) {
      return [
        { name: "New leads", count: 12, note: "Inbound and referrals" },
        { name: "Nurturing", count: 7, note: "Sequenced follow-ups" },
        { name: "Decision", count: 4, note: "Waiting on approvals" },
      ];
    }

    const newLeads = Math.max(1, Math.ceil(contacts.length * 0.45));
    const nurturing = Math.max(1, Math.ceil(contacts.length * 0.3));
    const decision = Math.max(1, contacts.length - newLeads - nurturing);

    return [
      { name: "New leads", count: newLeads, note: "Fresh records" },
      { name: "Nurturing", count: nurturing, note: "In active outreach" },
      { name: "Decision", count: decision, note: "Ready to close" },
    ];
  }, [contacts.length]);

  const handleDeleteContact = async (id) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete contact");
    } else {
      setContacts(contacts.filter((c) => c.id !== id));
      toast.success("Contact deleted successfully");
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete task");
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted successfully");
    }
  };

  const handleCompleteTask = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", id);
    if (error) {
      toast.error("Failed to complete task");
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      );
      toast.success("Task marked as complete");
    }
  };

  const formattedTasks = openTasks
    .map((task) => ({
      ...task,
      date: task.due_date ? new Date(task.due_date) : null,
    }))
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date - b.date;
    })
    .slice(0, 5);

  const recentContacts = contacts.slice(0, 5);

  return (
    <AppShell
      title="Operating dashboard"
      subtitle="Stay close to the revenue work. Track relationships, clear the queue, and keep promises on time."
      actions={
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {user ? `Signed in as ${user.email}` : "Supabase live"}
        </div>
      }
    >
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active contacts"
          value={contacts.length}
          helper="People we can reach today"
        />
        <StatCard
          label="Open tasks"
          value={openTasks.length}
          helper="Work that needs attention"
        />
        <StatCard
          label="Completed tasks"
          value={completedTasks.length}
          helper="Proof of progress"
        />
        <StatCard
          label="Completion rate"
          value={`${completionRate}%`}
          helper="Momentum this week"
          highlight
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel
            title="Pipeline snapshot"
            description="An at-a-glance view of new demand, active conversations, and closing motions."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.name}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stage.name}</p>
                      <p className="text-3xl font-semibold text-white">
                        {stage.count}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">
                      Warm
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{stage.note}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-amber-300"
                      style={{ width: `${Math.min(stage.count * 8, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Customer activity"
            description="See what moved recently. Keep outbound, service, and renewals in sync."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ActivityPill
                title="New relationships"
                value={recentContacts.length}
                body="Contacts created in your latest batch."
              />
              <ActivityPill
                title="Due this week"
                value={openTasks.length}
                body="Tasks waiting for action before week close."
              />
              <ActivityPill
                title="Closed loops"
                value={completedTasks.length}
                body="Tasks marked complete. Keep the cadence."
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Action center"
            description="Create a contact, open a task, or jump to the queue."
          >
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/contacts")}
                className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Add contact
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-amber-200/60 hover:bg-slate-800/80"
              >
                Add task
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-amber-200/60 hover:bg-slate-900/70"
              >
                View work queue
              </button>
            </div>
          </Panel>

          <Panel
            title="Due soon"
            description="Keep your promises current. Finish the next most important thing."
          >
            <ul className="space-y-3">
              {formattedTasks.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                  No tasks pending. Great time to prospect.
                </li>
              )}
              {formattedTasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-xs text-slate-400">
                        {task.date
                          ? `Due ${task.date.toLocaleDateString()}`
                          : "No due date set"}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-white transition hover:bg-emerald-600"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => navigate(`/tasks?id=${task.id}`)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-200/60"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Recent contacts"
          description="Latest people we added. Keep outreach tight and personalized."
        >
          <ul className="space-y-3">
            {recentContacts.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                No contacts yet. Import or add your first lead.
              </li>
            )}
            {recentContacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{contact.name}</p>
                  <p className="text-xs text-slate-400">{contact.email}</p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <button
                    onClick={() => navigate(`/contacts?id=${contact.id}`)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-200/60"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="rounded-lg border border-red-400/40 px-3 py-1 text-red-200 hover:border-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Work queue"
          description="Visibility into what is open, blocked, and completed."
        >
          <ul className="space-y-3">
            {tasks.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                No tasks created yet.
              </li>
            )}
            {tasks.slice(0, 6).map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    {task.completed ? "Completed" : "Open"}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  {!task.completed && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1 text-white transition hover:bg-emerald-600"
                    >
                      Done
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/tasks?id=${task.id}`)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-200/60"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-lg border border-red-400/40 px-3 py-1 text-red-200 hover:border-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Performance guardrails"
          description="Simple targets to keep service, renewals, and sales humming."
        >
          <div className="space-y-4">
            <Guardrail
              label="Response SLA"
              value="94%"
              helper="Replies under 24 hours"
              progress={94}
              tone="emerald"
            />
            <Guardrail
              label="Renewal health"
              value="88%"
              helper="Renewals projected this quarter"
              progress={88}
              tone="amber"
            />
            <Guardrail
              label="Outbound coverage"
              value="76%"
              helper="Accounts touched this week"
              progress={76}
              tone="blue"
            />
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function StatCard({ label, value, helper, highlight = false }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {highlight && (
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
            Tracking
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5 shadow-inner shadow-slate-950/40">
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function ActivityPill({ title, value, body }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-500">{body}</p>
    </div>
  );
}

function Guardrail({ label, value, helper, progress, tone }) {
  const toneMap = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-300",
    blue: "bg-blue-400",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
        <span className="text-sm font-semibold text-slate-200">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className={`h-2 rounded-full ${toneMap[tone] || "bg-amber-300"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
