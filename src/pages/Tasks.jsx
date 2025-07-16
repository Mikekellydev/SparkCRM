import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Tasks() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true });
    setTasks(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (editingId) {
      await supabase
        .from("tasks")
        .update({ title, due_date: dueDate })
        .eq("id", editingId);
    } else {
      await supabase
        .from("tasks")
        .insert({ title, due_date: dueDate, user_id: userId });
    }

    setTitle("");
    setDueDate("");
    setEditingId(null);
    fetchTasks();
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setDueDate(task.due_date);
    setEditingId(task.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    fetchTasks();
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          className="w-full border p-2"
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full border p-2"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" type="submit">
          {editingId ? "Update Task" : "Add Task"}
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-white shadow p-3 rounded flex justify-between items-center"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task)}
              />
              <span className={task.completed ? "line-through text-gray-500" : ""}>
                {task.title} {task.due_date ? `(Due: ${task.due_date})` : ""}
              </span>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(task)} className="text-blue-500">
                Edit
              </button>
              <button onClick={() => handleDelete(task.id)} className="text-red-500">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
