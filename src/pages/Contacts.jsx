import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase.from('contacts').select('*');
      if (!error) setContacts(data);
    };
    fetchContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email }]);

    if (!error) {
      setContacts([...contacts, ...data]);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>

      <form onSubmit={handleAddContact} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Contact
        </button>
      </form>

      <ul className="space-y-2">
        {contacts.map((contact) => (
          <li key={contact.id} className="border-b pb-2">
            <strong>{contact.name}</strong> — {contact.email}
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
