import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function Tasks() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchTasks();

    const taskId = searchParams.get("id");
    if (taskId) {
      const fetchTask = async () => {
        const { data } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .single();
        if (data) {
          setTitle(data.title);
          setDueDate(data.due_date);
          setEditingId(data.id);
        }
      };
      fetchTask();
    }
  }, [searchParams]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });
    if (error) {
      toast.error("Unable to load tasks.");
    }
    setTasks(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setIsSaving(true);

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const payload = { title, due_date: dueDate, user_id: userId };
    let error;

    if (editingId) {
      ({ error } = await supabase
        .from("tasks")
        .update({ title, due_date: dueDate })
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("tasks").insert(payload));
    }

    if (error) {
      toast.error("Could not save task.");
    } else {
      toast.success(editingId ? "Task updated." : "Task added.");
      setTitle("");
      setDueDate("");
      setEditingId(null);
      fetchTasks();
    }
    setIsSaving(false);
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setDueDate(task.due_date);
    setEditingId(task.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Unable to delete task.");
    } else {
      toast.success("Task removed.");
      fetchTasks();
    }
  };

  const toggleComplete = async (task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    if (error) {
      toast.error("Could not update task.");
    } else {
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);
  const overdueTasks = filteredTasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    const due = new Date(task.due_date);
    const now = new Date();
    return due < now;
  });

  return (
    <AppShell
      title="Tasks"
      subtitle="A single queue for customer work. Prioritize, assign dates, and keep promises current."
      actions={
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200">
          {openTasks.length} open tasks
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-white">
              {editingId ? "Update task" : "Add task"}
            </p>
            <p className="text-xs text-slate-400">
              Give every task a clear title and a date when possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Task title</span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                type="text"
                placeholder="Follow up on renewal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Due date</span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                  ? "Update task"
                  : "Add task"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDueDate("");
                  }}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-amber-200/60 hover:bg-slate-900/70"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Open" value={openTasks.length} />
            <Stat label="Completed" value={completedTasks.length} />
            <Stat label="Overdue" value={overdueTasks.length} tone="amber" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Keep tasks focused and short. Close the loop before adding more.
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <span aria-hidden className="text-slate-500">
                ⌕
              </span>
              <input
                className="w-48 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none"
                placeholder="Search task titles"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40">
            <SectionHeader title="Open tasks" />
            <div className="space-y-2">
              {openTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
                  Nothing open. Great time to schedule new outreach.
                </div>
              )}
              {openTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleComplete(task)}
                  onEdit={() => handleEdit(task)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>

            <SectionHeader title="Completed" />
            <div className="space-y-2">
              {completedTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
                  No completed tasks yet.
                </div>
              )}
              {completedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleComplete(task)}
                  onEdit={() => handleEdit(task)}
                  onDelete={() => handleDelete(task.id)}
                  completed
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "text-slate-200 bg-slate-900/70 border-slate-800",
    amber: "text-amber-100 bg-amber-300/10 border-amber-300/40",
  };
  const toneClass = toneMap[tone] || toneMap.slate;

  return (
    <div className={`rounded-2xl border ${toneClass} p-4`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="mb-2 mt-4 flex items-center justify-between text-sm text-slate-400">
      <span className="font-semibold text-slate-200">{title}</span>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete, completed = false }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={completed || task.completed}
          onChange={onToggle}
          className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
        />
        <div>
          <p
            className={`font-semibold text-white ${
              completed || task.completed ? "line-through text-slate-500" : ""
            }`}
          >
            {task.title}
          </p>
          <p className="text-xs text-slate-400">
            {task.due_date ? `Due ${task.due_date}` : "No due date"}
          </p>
        </div>
      </div>
      <div className="flex gap-2 text-xs font-semibold">
        <button
          onClick={onEdit}
          className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-200/60"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-400/40 px-3 py-1 text-red-200 hover:border-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
