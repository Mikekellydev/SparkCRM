import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();

    const contactId = searchParams.get("id");
    if (contactId) {
      const fetchContact = async () => {
        const { data } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", contactId)
          .single();
        if (data) {
          setName(data.name);
          setEmail(data.email);
          setEditingId(data.id);
        }
      };
      fetchContact();
    }
  }, [searchParams]);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (editingId) {
      await supabase
        .from("contacts")
        .update({ name, email })
        .eq("id", editingId);
    } else {
      await supabase
        .from("contacts")
        .insert({ name, email, user_id: userId });
    }

    setName("");
    setEmail("");
    setEditingId(null);
    fetchContacts();
  };

  const handleEdit = (contact) => {
    setName(contact.name);
    setEmail(contact.email);
    setEditingId(contact.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("contacts").delete().eq("id", id);
    fetchContacts();
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Contacts</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          className="w-full border p-2"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" type="submit">
          {editingId ? "Update Contact" : "Add Contact"}
        </button>
      </form>

      <ul className="space-y-2">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="bg-white shadow p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{contact.name}</p>
              <p className="text-gray-600 text-sm">{contact.email}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(contact)} className="text-blue-500">
                Edit
              </button>
              <button onClick={() => handleDelete(contact.id)} className="text-red-500">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
