"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Photo = { id: string; src: string; caption: string; category: string; year: string };

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Photo | null>(null);
  const [form, setForm] = useState({ caption: "", category: "", year: "" });
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/gallery");
    const j = await r.json();
    setPhotos(j.photos || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p: Photo) => {
    setEditing(p);
    setForm({ caption: p.caption, category: p.category, year: p.year });
  };

  const save = async () => {
    if (!editing) return;
    const res = await fetch("/api/admin/gallery", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", id: editing.id, ...form }),
    });
    if (!res.ok) return alert("Save failed");
    setEditing(null);
    load();
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirm.trim() !== deleteTarget.id) return alert("ID sahi se type karo");
    const res = await fetch("/api/admin/gallery", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: deleteTarget.id }),
    });
    if (!res.ok) return alert("Delete failed");
    setDeleteTarget(null);
    load();
  };

  const filtered = photos.filter(p =>
    p.caption.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Gallery" subtitle={`${photos.length} photos • Edit / Delete — Photo file bhi delete hogi, koi Trash nahi`}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search caption / id / category..." className="w-full border border-divider bg-surface px-3 py-2 text-sm rounded-sm mb-4" />
      {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-surface border border-divider rounded-sm overflow-hidden">
              <img src={p.src} alt={p.caption} className="w-full h-36 object-cover" />
              <div className="p-3">
                <p className="text-sm font-semibold line-clamp-2">{p.caption}</p>
                <p className="text-xs text-ink-muted mt-1">{p.category} • {p.year} • {p.id}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(p)} className="flex-1 border border-divider py-1 text-xs font-semibold rounded-sm">Edit</button>
                  <button onClick={() => { setDeleteTarget(p); setDeleteConfirm(""); }} className="px-3 py-1 text-xs font-semibold rounded-sm border border-red-200 text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink-muted">Koi photo nahi mili.</p>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-surface w-full max-w-md rounded-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">Edit Photo</h3>
            <img src={editing.src} alt="" className="w-full h-40 object-cover rounded-sm my-3" />
            <input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} placeholder="Caption" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mb-2" />
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mb-2" />
            <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="Year" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button>
              <button onClick={() => setEditing(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-sm p-5">
            <h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3>
            <p className="text-sm mt-2">Ye photo + uski file dono hamesha ke liye delete ho jayegi. Koi Trash / Undo nahi hai.</p>
            <p className="text-sm mt-3">Delete karne ke liye ID type karo: <b>{deleteTarget.id}</b></p>
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