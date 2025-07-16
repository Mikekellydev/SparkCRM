import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: contactsData } = await supabase.from('contacts').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
      setContacts(contactsData || []);
      setTasks(tasksData || []);
    };
    fetchData();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddContact = () => navigate('/contacts');
  const handleAddTask = () => navigate('/tasks');

  const handleDeleteContact = async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete contact');
    } else {
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete task');
    } else {
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task deleted successfully');
    }
  };

  const handleCompleteTask = async (id) => {
    const { error } = await supabase.from('tasks').update({ completed: true }).eq('id', id);
    if (error) {
      toast.error('Failed to complete task');
    } else {
      setTasks(tasks.map(task => task.id === id ? { ...task, completed: true } : task));
      toast.success('Task marked as complete');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">SparkCRM</h2>
        <nav className="space-y-2">
          <a href="/" className="block hover:text-yellow-400">Dashboard</a>
          <a href="/contacts" className="block hover:text-yellow-400">Contacts</a>
          <a href="/tasks" className="block hover:text-yellow-400">Tasks</a>
          <a href="/reset-password" className="block hover:text-yellow-400">Reset Password</a>
          <button
            onClick={signOut}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full text-white"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome {user ? user.email : ''}
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-gray-700">Total Contacts</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{contacts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-gray-700">Tasks Due</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-gray-700">Completed Tasks</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.filter(t => t.completed).length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={handleAddContact} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition"
          >
            Add Contact
          </button>
          <button 
            onClick={handleAddTask} 
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg shadow-md transition"
          >
            Add Task
          </button>
        </div>

        {/* Contacts Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Recent Contacts</h2>
          <div className="bg-white rounded-lg shadow p-6 border">
            <ul className="space-y-4">
              {contacts.map(contact => (
                <li key={contact.id} className="flex justify-between items-center">
                  <span className="text-gray-800">{contact.name} - {contact.email}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => navigate(`/contacts?id=${contact.id}`)}
                      className="text-blue-600 hover:underline"
                    >Edit</button>
                    <button 
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Tasks</h2>
          <div className="bg-white rounded-lg shadow p-6 border">
            <ul className="space-y-4">
              {tasks.map(task => (
                <li key={task.id} className="flex justify-between items-center">
                  <span className="text-gray-800">{task.title} - Due {task.due_date}</span>
                  <div className="space-x-2">
                    {!task.completed && (
                      <button 
                        onClick={() => handleCompleteTask(task.id)}
                        className="text-green-600 hover:underline"
                      >Complete</button>
                    )}
                    <button 
                      onClick={() => navigate(`/tasks?id=${task.id}`)}
                      className="text-blue-600 hover:underline"
                    >Edit</button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
