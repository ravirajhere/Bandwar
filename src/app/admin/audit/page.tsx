"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Log = { id: string; at: string; actor: string; action: string; target: string; detail: string };

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/api/admin/audit").then(r => r.json()).then(j => { setLogs(j.logs || []); setLoading(false); });
  }, []);
  const filtered = logs.filter(l => `${l.action} ${l.target} ${l.detail}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <AdminShell title="Audit Log" subtitle="Kisne, kab, kya kiya — sirf log hai, history nahi">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action / target..." className="w-full border border-divider bg-surface px-3 py-2 text-sm rounded-sm mb-4" />
      {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
        <div className="space-y-2">
          {filtered.slice().reverse().map(l => (
            <div key={l.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
              <div><p className="text-sm font-semibold">{l.action} <span className="text-ink-muted font-normal">• {l.target}</span></p><p className="text-xs text-ink-muted">{l.detail}</p></div>
              <p className="text-xs text-ink-muted whitespace-nowrap">{new Date(l.at).toLocaleString("en-IN")}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink-muted">Koi log nahi.</p>}
        </div>
      )}
    </AdminShell>
  );
}