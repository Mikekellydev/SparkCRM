import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error) setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, due_date: dueDate, completed: false }]);

    if (!error) {
      setTasks([...tasks, ...data]);
      setTitle('');
      setDueDate('');
    }
  };

  const toggleComplete = async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id);

    if (!error && data.length > 0) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? data[0] : t))
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      <form onSubmit={handleAddTask} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Task
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border-b pb-2 flex justify-between items-center"
          >
            <div>
              <p className={task.completed ? 'line-through' : ''}>
                <strong>{task.title}</strong> — Due {task.due_date}
              </p>
            </div>
            <button
              onClick={() => toggleComplete(task)}
              className={`px-3 py-1 rounded ${
                task.completed ? 'bg-yellow-500' : 'bg-blue-500'
              } text-white`}
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-blue-500 hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
