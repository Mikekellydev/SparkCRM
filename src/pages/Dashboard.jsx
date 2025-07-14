import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-6">
        <h2 className="text-xl font-bold">SparkCRM</h2>
        <nav className="space-y-2">
          <a href="/" className="block hover:text-yellow-400">Dashboard</a>
          <a href="/contacts" className="block hover:text-yellow-400">Contacts</a>
          <a href="/tasks" className="block hover:text-yellow-400">Tasks</a>
          <a href="/reset-password" className="block hover:text-yellow-400">Reset Password</a>
          <button
            onClick={signOut}
            className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome {user ? user.email : ''}
        </h1>

        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Total Contacts</h2>
            <p className="text-2xl font-bold">{contacts.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Tasks Due</h2>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Completed Tasks</h2>
            <p className="text-2xl font-bold">{tasks.filter(t => t.completed).length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleAddContact} 
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded shadow"
          >
            Add Contact
          </button>
          <button 
            onClick={handleAddTask} 
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded shadow"
          >
            Add Task
          </button>
        </div>

        {/* Contacts Section */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Contacts</h2>
          <div className="bg-white rounded shadow p-4">
            <ul className="space-y-2">
              {contacts.map(contact => (
                <li key={contact.id} className="border-b pb-2">
                  {contact.name} - {contact.email}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Tasks</h2>
          <div className="bg-white rounded shadow p-4">
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id} className="border-b pb-2">
                  {task.title} - Due {task.due_date}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
