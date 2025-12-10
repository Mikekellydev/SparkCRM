import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();

  const startOfMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

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
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Unable to load contacts.");
    }
    setContacts(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const payload = { name, email, user_id: userId };
    let error;

    if (editingId) {
      ({ error } = await supabase
        .from("contacts")
        .update({ name, email })
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("contacts").insert(payload));
    }

    if (error) {
      toast.error("Could not save contact.");
    } else {
      toast.success(editingId ? "Contact updated." : "Contact added.");
      setName("");
      setEmail("");
      setEditingId(null);
      fetchContacts();
    }

    setIsSaving(false);
  };

  const handleEdit = (contact) => {
    setName(contact.name);
    setEmail(contact.email);
    setEditingId(contact.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast.error("Unable to delete contact.");
    } else {
      toast.success("Contact removed.");
      fetchContacts();
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const q = search.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(q) ||
      contact.email?.toLowerCase().includes(q)
    );
  });

  const newThisMonth = contacts.filter((contact) => {
    if (!contact.created_at) return false;
    const created = new Date(contact.created_at);
    return created >= startOfMonth;
  }).length;

  return (
    <AppShell
      title="Contacts"
      subtitle="Keep a clean, actionable system of record. Every contact here should have a next step."
      actions={
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200">
          {contacts.length} total records
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40">
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold text-white">
              {editingId ? "Update contact" : "Add contact"}
            </p>
            <p className="text-xs text-slate-400">
              Capture who they are and how to reach them. Keep it lightweight.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Full name</span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-amber-200/70 focus:outline-none"
                type="email"
                placeholder="ada@sparkcrm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <div className="flex items-center gap-2 pt-2">
              <button
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                  ? "Update contact"
                  : "Add contact"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setEmail("");
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
            <StatBlock label="Total contacts" value={contacts.length} />
            <StatBlock label="New this month" value={newThisMonth} />
            <StatBlock
              label="Currently editing"
              value={editingId ? "Yes" : "No"}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              Keep the list clean. Search and make small updates quickly.
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <span aria-hidden className="text-slate-500">
                ⌕
              </span>
              <input
                className="w-48 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/40">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {filteredContacts.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
                  No contacts yet. Add your first customer.
                </div>
              )}
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-slate-400">{contact.email}</p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-200/60"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="rounded-lg border border-red-400/40 px-3 py-1 text-red-200 hover:border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
