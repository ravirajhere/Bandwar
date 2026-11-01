"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, FileText, User, Clock, Search, LogOut, ChevronRight } from "lucide-react";

// Mock Data (Baad mein ye API se aayega)
const MOCK_QUEUE = [
  {
    id: "edit_123",
    timestamp: "2026-11-01T12:50:00",
    type: "Person Edit",
    contextId: "navin-kumar-navin-bandwar",
    field: "Role",
    oldValue: "Politician & Social Worker",
    newValue: "Politician & Teacher",
    submitter: "Village People"
  },
  {
    id: "edit_124",
    timestamp: "2026-11-01T12:55:00",
    type: "Article Edit",
    contextId: "bandwar-post-office",
    field: "Article Title",
    oldValue: "Banduar Post Office (PIN 851131): Village Postal Hub",
    newValue: "Banduar Post Office: Village Postal Hub",
    submitter: "Anonymous"
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [activeTab, setActiveTab] = useState("pending");

  // Check Auth
  useEffect(() => {
    const isAuth = document.cookie.includes("admin_session=true");
    if (!isAuth) router.push("/admin");
  }, [router]);

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/admin");
  };

  const handleAction = (id: string, action: "approve" | "reject") => {
    // API call yahan aayegi
    console.log(`${action} action for ${id}`);
    // UI se remove kar denge
    setQueue(queue.filter(item => item.id !== id));
  };

  return (
    <div className="bg-canvas min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-divider pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">Moderation Dashboard</h1>
            <p className="text-sm text-ink-muted mt-1">Review and manage pending community contributions.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button onClick={handleLogout} className="text-sm text-ink-muted hover:text-red-500 flex items-center gap-1 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-surface border border-divider rounded-sm p-1">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "pending" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"}`}
            >
              Pending ({queue.length})
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "history" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"}`}
            >
              History
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              className="w-full h-9 pl-9 pr-3 border border-divider bg-surface text-sm text-ink rounded-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="text-center py-20 bg-surface border border-divider rounded-sm">
              <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3 opacity-50" />
              <h3 className="text-lg font-serif text-ink">All caught up!</h3>
              <p className="text-sm text-ink-muted">There are no pending edits to review.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="bg-surface border border-divider rounded-sm overflow-hidden">
                
                {/* Item Header */}
                <div className="bg-canvas/50 border-b border-divider px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3 text-xs font-medium text-ink-muted">
                    <span className="flex items-center gap-1"><FileText size={14} className="text-accent"/> {item.type}</span>
                    <span className="text-divider">|</span>
                    <span className="font-mono text-ink">{item.contextId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-ink-muted">
                    <span className="flex items-center gap-1"><User size={14}/> {item.submitter}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Diff Viewer */}
                <div className="p-4">
                  <div className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">Field: {item.field}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm">
                      <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Old Value</span>
                      <p className="text-sm text-ink line-through opacity-70">{item.oldValue}</p>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-sm">
                      <span className="text-[10px] font-bold text-green-600 uppercase block mb-1">Proposed Value</span>
                      <p className="text-sm text-ink font-medium">{item.newValue}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-canvas/50 border-t border-divider flex justify-end gap-2">
                  <button 
                    onClick={() => handleAction(item.id, "reject")}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold border border-divider bg-surface text-ink hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors rounded-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(item.id, "approve")}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors rounded-sm"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}