"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Cat = { id: string; title: string; icon: string };
type Item = { id: string; name: string; categoryId: string; description: string; phone: string; address: string; timing: string; isEmergency: boolean };

const emptyItem: Item = { id: "", name: "", categoryId: "emergency", description: "", phone: "", address: "", timing: "", isEmergency: false };

export default function DirectoryPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"items" | "cats">("items");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showItem, setShowItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState<Item>(emptyItem);
  const [showCat, setShowCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [catForm, setCatForm] = useState({ title: "", icon: "" });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "item" | "cat"; id: string; label: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/directory");
    const j = await r.json();
    setCats(j.data?.categories || []); setItems(j.data?.items || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const post = async (body: any) => {
    const res = await fetch("/api/admin/directory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (!res.ok) { alert(j.error || "Failed"); return false; }
    return true;
  };

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.phone.trim()) return alert("Name + Phone zaroori hai");
    const ok = await post(editingItem ? { action: "edit_item", id: editingItem.id, ...itemForm } : { action: "add_item", ...itemForm });
    if (ok) { setShowItem(false); load(); }
  };
  const saveCat = async () => {
    if (!catForm.title.trim()) return alert("Title zaroori hai");
    const ok = await post(editingCat ? { action: "edit_category", id: editingCat.id, ...catForm } : { action: "add_category", ...catForm });
    if (ok) { setShowCat(false); load(); }
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirm.trim() !== deleteTarget.id) return alert("ID sahi se type karo");
    const ok = await post({ action: deleteTarget.type === "item" ? "delete_item" : "delete_category", id: deleteTarget.id });
    if (ok) { setDeleteTarget(null); load(); }
  };

  const catTitle = (id: string) => cats.find(c => c.id === id)?.title || id;
  const filteredItems = items.filter(i =>
    (filterCat === "all" || i.categoryId === filterCat) &&
    `${i.name} ${i.phone} ${i.address} ${i.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Directory" subtitle={`${items.length} numbers • ${cats.length} categories • Galat number turant sahi karo`}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("items")} className={`px-4 py-2 text-sm font-semibold rounded-sm border ${tab === "items" ? "bg-ink text-white" : "bg-surface border-divider"}`}>Numbers ({items.length})</button>
        <button onClick={() => setTab("cats")} className={`px-4 py-2 text-sm font-semibold rounded-sm border ${tab === "cats" ? "bg-ink text-white" : "bg-surface border-divider"}`}>Categories ({cats.length})</button>
      </div>

      {tab === "items" && (
        <>
          <div className="flex gap-2 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone..." className="flex-1 border border-divider bg-surface px-3 py-2 text-sm rounded-sm" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-divider bg-surface px-2 py-2 text-sm rounded-sm">
              <option value="all">All Categories</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={() => { setEditingItem(null); setItemForm(emptyItem); setShowItem(true); }} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm">+ Add Number</button>
          </div>
          {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
            <div className="space-y-2">
              {filteredItems.map(it => (
                <div key={it.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{it.name} {it.isEmergency && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm ml-1">🚨 Emergency</span>}</p>
                    <p className="text-xs text-ink-muted">{catTitle(it.categoryId)} • {it.phone} • {it.address} • {it.timing}</p>
                    <p className="text-xs mt-1">{it.description}</p>
                    {it.phone.includes("INSERT") && <p className="text-xs text-amber-700 font-semibold mt-1">⚠️ Phone abhi bhi [INSERT] hai — public ko aisa hi dikhega</p>}
                  </div>
                  <div className="flex gap-2 shrink-0 items-start">
                    <button onClick={() => { setEditingItem(it); setItemForm(it); setShowItem(true); }} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button>
                    <button onClick={() => { setDeleteTarget({ type: "item", id: it.id, label: it.name }); setDeleteConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && <p className="text-sm text-ink-muted">Koi number nahi mila.</p>}
            </div>
          )}
        </>
      )}

      {tab === "cats" && (
        <>
          <button onClick={() => { setEditingCat(null); setCatForm({ title: "", icon: "" }); setShowCat(true); }} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm mb-4">+ Add Category</button>
          <div className="space-y-2">
            {cats.map(c => {
              const count = items.filter(i => i.categoryId === c.id).length;
              return (
                <div key={c.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between">
                  <p className="text-sm font-semibold">{c.icon} {c.title} <span className="text-ink-muted font-normal">• {c.id} • {count} items</span></p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCat(c); setCatForm({ title: c.title, icon: c.icon }); setShowCat(true); }} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button>
                    <button onClick={() => { setDeleteTarget({ type: "cat", id: c.id, label: c.title }); setDeleteConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowItem(false)}>
          <div className="bg-surface w-full max-w-md rounded-sm p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">{editingItem ? "Edit Number" : "Add Number"}</h3>
            <input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Name — jaise SBI Bandwar" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <select value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2">{cats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            <input value={itemForm.phone} onChange={e => setItemForm({ ...itemForm, phone: e.target.value })} placeholder="Phone" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={itemForm.address} onChange={e => setItemForm({ ...itemForm, address: e.target.value })} placeholder="Address" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={itemForm.timing} onChange={e => setItemForm({ ...itemForm, timing: e.target.value })} placeholder="Timing — 10 AM - 4 PM" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description" rows={2} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={itemForm.isEmergency} onChange={e => setItemForm({ ...itemForm, isEmergency: e.target.checked })} /> Emergency number hai?</label>
            <div className="flex gap-2 mt-4"><button onClick={saveItem} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button><button onClick={() => setShowItem(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}

      {showCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCat(false)}>
          <div className="bg-surface w-full max-w-md rounded-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">{editingCat ? "Edit Category" : "Add Category"}</h3>
            <input value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} placeholder="Title — jaise Daily Utilities" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="Icon — emoji, jaise ⚡" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={saveCat} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button><button onClick={() => setShowCat(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-sm p-5">
            <h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3>
            <p className="text-sm mt-2">{deleteTarget.label} — hamesha ke liye delete ho jayega. Koi Trash / Undo nahi hai.</p>
            {deleteTarget.type === "cat" && <p className="text-sm mt-1 text-amber-700">Category tabhi delete hogi jab usme koi item na ho.</p>}
            <p className="text-sm mt-3">Delete karne ke liye ID type karo: <b>{deleteTarget.id}</b></p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={deleteTarget.id} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={doDelete} className="flex-1 bg-red-600 text-white py-2 text-sm font-semibold rounded-sm">Delete Permanently</button><button onClick={() => setDeleteTarget(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}