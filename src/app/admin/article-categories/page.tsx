"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
export default function ArticleCategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", icon: "", description: "" });
  const [del, setDel] = useState<any>(null); const [confirm, setConfirm] = useState("");
  const load = async () => { const r = await fetch("/api/admin/article-categories"); const j = await r.json(); setCats(j.data?.categories || []); };
  useEffect(() => { load(); }, []);
  const post = async (b: any) => { const r = await fetch("/api/admin/article-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const j = await r.json(); if (!r.ok) { alert(j.error); return false; } return true; };
  const save = async () => { if (!form.title.trim()) return alert("Title zaroori hai"); const ok = await post(editing ? { action: "edit", id: editing.id, ...form } : { action: "add", ...form }); if (ok) { setShow(false); load(); } };
  const doDel = async () => { if (confirm.trim() !== del.id) return alert("ID sahi se type karo"); const ok = await post({ action: "delete", id: del.id }); if (ok) { setDel(null); load(); } };
  return (
    <AdminShell title="Article Categories" subtitle={`${cats.length} categories • Nayi category banate hi uski article file bhi ban jayegi`}>
      <button onClick={() => { setEditing(null); setForm({ title: "", icon: "", description: "" }); setShow(true); }} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm mb-4">+ Add Category</button>
      <div className="space-y-2">{cats.map(c => (
        <div key={c.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
          <div><p className="text-sm font-semibold">{c.icon} {c.title} <span className="text-ink-muted font-normal">• {c.id}</span></p><p className="text-xs text-ink-muted mt-0.5">{c.description}</p></div>
          <div className="flex gap-2 shrink-0 items-start"><button onClick={() => { setEditing(c); setForm({ title: c.title, icon: c.icon, description: c.description || "" }); setShow(true); }} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button><button onClick={() => { setDel(c); setConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button></div>
        </div>
      ))}</div>
      {show && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShow(false)}><div className="bg-surface w-full max-w-md rounded-sm p-5" onClick={e => e.stopPropagation()}><h3 className="font-serif font-bold">{editing ? "Edit Category" : "Add Category"}</h3><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title — jaise History" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" /><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon — emoji" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" /><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" /><div className="flex gap-2 mt-4"><button onClick={save} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button><button onClick={() => setShow(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div></div></div>)}
      {del && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-surface w-full max-w-md rounded-sm p-5"><h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3><p className="text-sm mt-2">{del.title} — category delete hogi. Agar kisi article me use ho rahi hai toh pehle waha se hatani padegi.</p><p className="text-sm mt-3">ID type karo: <b>{del.id}</b></p><input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={del.id} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" /><div className="flex gap-2 mt-4"><button onClick={doDel} className="flex-1 bg-red-600 text-white py-2 text-sm font-semibold rounded-sm">Delete Permanently</button><button onClick={() => setDel(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div></div></div>)}
    </AdminShell>
  );
}