"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, Users, Images, Settings, History } from "lucide-react";

export default function AdminShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }); } catch {}
    router.replace("/admin");
    router.refresh();
  };

  const nav = [
    { href: "/admin/dashboard", label: "Moderation", icon: LayoutDashboard },
    { href: "/admin/verify", label: "Verification", icon: ShieldCheck },
    { href: "/admin/people", label: "People", icon: Users },
    { href: "/admin/gallery", label: "Gallery", icon: Images },
    { href: "/admin/audit", label: "Audit Log", icon: History },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-canvas min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-divider pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 flex-wrap">
            {nav.map(n => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-sm border ${path.startsWith(n.href) ? "bg-accent text-white border-accent" : "bg-surface border-divider text-ink-muted hover:text-ink"}`}>
                <n.icon size={16} /> {n.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="text-sm text-ink-muted hover:text-red-500 flex items-center gap-1 px-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}