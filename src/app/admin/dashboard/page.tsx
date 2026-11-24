import type { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";
import { getAllArticles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Moderation Dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function Page() {
  // 🚀 Server side pe count calculate karein
  const allArticles = getAllArticles();
  const pendingVerificationCount = allArticles.filter(a => !a.confidence || a.confidence === 'unverified').length;

  return <AdminDashboard pendingVerificationCount={pendingVerificationCount} />;
}