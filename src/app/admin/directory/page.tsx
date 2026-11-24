"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Cat = { id: string; title: string; icon: string; description?: string };
type Item = { id: string; category: string; name: string; phone: string; address?: string; note?: string };

const emptyItem = (): Omit<Item, "id"> => ({ category: "", name: "", phone: "", address: "", note: "" });

export default function DirectoryPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showItem, setShowItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<Omit<Item, "id">>(emptyItem());

  const [showCat, setShowCat] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ title: "", icon: "", description: "" });

  const [del, setDel] = useState<{ type: "item" | "cat"; data: any } | null>(null);
  const [delConfirm, setDelConfirm] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/directory");
    const j = await r.json();
    setCats(j.data?.categories || []);
    setItems(j.data?.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const post = async (body: any) => {
    const res = await fetch("/api/admin/directory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (!res.ok) { alert(j.error || "Failed"); return false; }
    return true;
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ category: cats[0]?.id || "", name: "", phone: "", address: "", note: "" });
    setShowItem(true);
  };
  const openEditItem = (it: Item) => {
    setEditingItem(it.id);
    // FIX: id ko form me nahi rakhenge — sirf baaki fields
    const { id: _omit, ...rest } = it as any;
    setItemForm({ category: rest.category || "", name: rest.name || "", phone: rest.phone || "", address: rest.address || "", note: rest.note || "" });
    setShowItem(true);
  };

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.phone.trim()) return alert("Name + Phone zaroori hai");
    if (!itemForm.category) return alert("Category chuno");
    // FIX: yaha ab id 1 baar hi jayega — itemForm me id hai hi nahi
    const ok = await post(editingItem ? { action: "edit_item", id: editingItem, ...itemForm } : { action: "add_item", ...itemForm });
    if (ok) { setShowItem(false); load(); }
  };

  const openAddCat = () => { setEditingCat(null); setCatForm({ title: "", icon: "", description: "" }); setShowCat(true); };
  const openEditCat = (c: Cat) => { setEditingCat(c.id); setCatForm({ title: c.title, icon: c.icon, description: c.description || "" }); setShowCat(true); };
  const saveCat = async () => {
    if (!catForm.title.trim()) return alert("Title zaroori hai");
    const ok = await post(editingCat ? { action: "edit_category", id: editingCat, ...catForm } : { action: "add_category", ...catForm });
    if (ok) { setShowCat(false); load(); }
  };

  const doDelete = async () => {
    if (!del) return;
    if (delConfirm.trim() !== del.data.id) return alert("ID sahi se type karo");
    const ok = await post(del.type === "item" ? { action: "delete_item", id: del.data.id } : { action: "delete_category", id: del.data.id });
    if (ok) { setDel(null); load(); }
  };

  const filtered = items.filter(i =>
    (filterCat === "all" || i.category === filterCat) &&
    `${i.name} ${i.phone} ${i.address || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Directory" subtitle={`${items.length} entries • ${cats.length} categories`}>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-divider bg-surface px-3 py-2 text-sm rounded-sm">
          <option value="all">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone..." className="flex-1 min-w-[180px] border border-divider bg-surface px-3 py-2 text-sm rounded-sm" />
        <button onClick={openAddItem} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm">+ Add Entry</button>
        <button onClick={openAddCat} className="border border-divider bg-surface px-4 py-2 text-sm font-semibold rounded-sm">+ Category</button>
      </div>

      {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
        <>
          <div className="space-y-2">
            {filtered.map(it => (
              <div key={it.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{it.name} <span className="text-xs font-normal text-ink-muted">• {cats.find(c => c.id === it.category)?.title || it.category}</span></p>
                  <p className="text-xs mt-0.5">📞 {it.phone} {it.address ? `• ${it.address}` : ""}</p>
                  {it.note && <p className="text-xs text-ink-muted mt-0.5">{it.note}</p>}
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  <button onClick={() => openEditItem(it)} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button>
                  <button onClick={() => { setDel({ type: "item", data: it }); setDelConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-ink-muted">Koi entry nahi mili.</p>}
          </div>

          <h3 className="font-serif font-bold mt-6 mb-2">Categories</h3>
          <div className="space-y-2">
            {cats.map(c => (
              <div key={c.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
                <div><p className="text-sm font-semibold">{c.icon} {c.title} <span className="text-ink-muted font-normal">• {c.id}</span></p><p className="text-xs text-ink-muted">{c.description}</p></div>
                <div className="flex gap-2 shrink-0 items-start">
                  <button onClick={() => openEditCat(c)} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button>
                  <button onClick={() => { setDel({ type: "cat", data: c }); setDelConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowItem(false)}>
          <div className="bg-surface w-full max-w-md rounded-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">{editingItem ? "Edit Entry" : "Add Entry"}</h3>
            <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} className="w-full border border-divider bg-surface px-3 py-2 text-sm rounded-sm mt-3">
              <option value="">Category chuno</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Name" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={itemForm.phone} onChange={e => setItemForm({ ...itemForm, phone: e.target.value })} placeholder="Phone" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={itemForm.address} onChange={e => setItemForm({ ...itemForm, address: e.target.value })} placeholder="Address (optional)" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={itemForm.note} onChange={e => setItemForm({ ...itemForm, note: e.target.value })} placeholder="Note (optional)" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={saveItem} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button><button onClick={() => setShowItem(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}

      {showCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCat(false)}>
          <div className="bg-surface w-full max-w-md rounded-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">{editingCat ? "Edit Category" : "Add Category"}</h3>
            <input value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} placeholder="Title" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="Icon — emoji" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <input value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Description" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={saveCat} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save</button><button onClick={() => setShowCat(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}

      {del && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-sm p-5">
            <h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3>
            <p className="text-sm mt-2">{del.data.title || del.data.name} — hamesha ke liye delete hoga.</p>
            <p className="text-sm mt-3">ID type karo: <b>{del.data.id}</b></p>
            <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)} placeholder={del.data.id} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={doDelete} className="flex-1 bg-red-600 text-white py-2 text-sm font-semibold rounded-sm">Delete Permanently</button><button onClick={() => setDel(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}