"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Person = {
  id: string; name: string; role: string; bio: string;
  locality?: string; photo?: string; dob?: string; deathDate?: string;
  birthplace?: string; journey?: string;
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState<Person>({ id: "", name: "", role: "", bio: "", locality: "", photo: "", dob: "", deathDate: "", birthplace: "", journey: "" });
  const [deleteId, setDeleteId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/people");
    const j = await r.json();
    setPeople(j.people || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: "", name: "", role: "", bio: "", locality: "", photo: "", dob: "", deathDate: "", birthplace: "", journey: "" });
    setShowForm(true);
  };
  const openEdit = (p: Person) => {
    setEditing(p);
    setForm({ ...p, locality: p.locality || "", photo: p.photo || "", dob: p.dob || "", deathDate: p.deathDate || "", birthplace: p.birthplace || "", journey: p.journey || "" });
    setShowForm(true);
  };

  const save = async () => {
    // Schema check — UI pe hi rok do, taaki GitHub pe galat data na jaye
    const id = form.id.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(id)) return alert("ID sirf lowercase, number aur - me hona chahiye. Eg: ram-kumar");
    if (!form.name.trim() || !form.role.trim() || !form.bio.trim()) return alert("Name, Role, Bio — teeno zaroori hai");
    const res = await fetch("/api/admin/people", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: editing ? "edit" : "add", ...form, id }),
    });
    const j = await res.json();
    if (!res.ok) return alert(j.error || "Save failed");
    setShowForm(false);
    load();
  };

  const askDelete = (p: Person) => {
    setDeleteTarget(p);
    setDeleteConfirm("");
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirm.trim() !== deleteTarget.id) return alert("ID sahi se type karo — delete cancel");
    const res = await fetch("/api/admin/people", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: deleteTarget.id }),
    });
    if (!res.ok) return alert("Delete failed");
    setDeleteTarget(null);
    load();
  };

  const filtered = people.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="People" subtitle={`${people.length} log • Add / Edit / Delete — Permanent delete, koi Trash nahi`}>
      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / id / role..." className="flex-1 border border-divider bg-surface px-3 py-2 text-sm rounded-sm" />
        <button onClick={openAdd} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm">+ Add Person</button>
      </div>

      {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-surface border border-divider rounded-sm p-4">
              <div className="flex gap-3">
                {p.photo ? <img src={p.photo} alt={p.name} className="w-14 h-14 object-cover rounded-sm" /> : <div className="w-14 h-14 bg-canvas flex items-center justify-center text-xl font-bold">{p.name[0]}</div>}
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold">{p.name}</p>
                  <p className="text-xs text-ink-muted">{p.role} • {p.id}</p>
                  <p className="text-sm mt-1 line-clamp-2">{p.bio}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(p)} className="flex-1 border border-divider py-1.5 text-sm font-semibold rounded-sm">Edit</button>
                <button onClick={() => askDelete(p)} className="px-3 py-1.5 text-sm font-semibold rounded-sm border border-red-200 text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink-muted">Koi person nahi mila.</p>}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-surface w-full max-w-lg max-h-[90vh] overflow-auto rounded-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold text-lg mb-3">{editing ? "Edit Person" : "Add Person"}</h3>
            <div className="space-y-2">
              <input value={form.id} disabled={!!editing} onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="id — eg: ram-kumar" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role * — eg: Elder" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Bio * — poora biography" rows={4} className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <input value={form.locality} onChange={e => setForm({ ...form, locality: e.target.value })} placeholder="Locality — eg: Bandwar" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <input value={form.birthplace} onChange={e => setForm({ ...form, birthplace: e.target.value })} placeholder="Birthplace" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="Photo URL — /images/people/ram-kumar.jpg" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
              <div className="flex gap-2">
                <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="flex-1 border border-divider px-3 py-2 text-sm rounded-sm" />
                <input type="date" value={form.deathDate} onChange={e => setForm({ ...form, deathDate: e.target.value })} className="flex-1 border border-divider px-3 py-2 text-sm rounded-sm" />
              </div>
              <textarea value={form.journey} onChange={e => setForm({ ...form, journey: e.target.value })} placeholder="Journey — optional" rows={2} className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE — Warning + ID confirm — Permanent, koi Trash nahi */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-sm p-5">
            <h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3>
            <p className="text-sm mt-2">Ye <b>{deleteTarget.name}</b> ko hamesha ke liye delete kar dega. Koi Trash / Undo nahi hai.</p>
            <p className="text-sm mt-3">Delete karne ke liye ye ID type karo: <b>{deleteTarget.id}</b></p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={deleteTarget.id} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4">
              <button onClick={doDelete} className="flex-1 bg-red-600 text-white py-2 text-sm font-semibold rounded-sm">Delete Permanently</button>
              <button onClick={() => setDeleteTarget(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}