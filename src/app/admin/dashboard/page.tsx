import type { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";
import { getAllArticles, getPeopleData, getContributors, getMediaData } from "@/lib/data";

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
  // 🚀 Server side pe saara stats ek baar me calculate karo — client ko load nahi dena
  const allArticles = getAllArticles();
  const people = getPeopleData().people || [];
  const contributors = getContributors() || [];
  let galleryCount = 0;
  try {
    galleryCount = getMediaData().gallery?.photos?.length || 0;
  } catch {
    galleryCount = 0;
  }

  const pendingVerificationCount = allArticles.filter(
    (a) => !a.confidence || a.confidence === "unverified"
  ).length;

  const publishedCount = allArticles.filter(
    (a) => a.status === "published" || (a as any).published
  ).length;

  const draftCount = allArticles.filter(
    (a) => a.status === "draft" || !(a as any).published
  ).length;

  // Last 7 days me kya update hua
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = allArticles.filter(
    (a) => new Date(a.dateModified || a.lastUpdated || 0).getTime() > sevenDaysAgo
  ).length;

  // Recent 5 articles — Recent Activity ke liye
  const recentArticles = allArticles.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status || ((a as any).published ? "published" : "draft"),
    confidence: a.confidence || "unverified",
    lastUpdated: a.dateModified || a.lastUpdated,
    lastEditedBy: (a as any).lastEditedBy || "—",
  }));

  return (
    <AdminDashboard
      pendingVerificationCount={pendingVerificationCount}
      stats={{
        totalArticles: allArticles.length,
        published: publishedCount,
        drafts: draftCount,
        unverified: pendingVerificationCount,
        people: people.length,
        contributors: contributors.length,
        gallery: galleryCount,
        updatedThisWeek: recentCount,
      }}
      recentArticles={recentArticles}
    />
  );
}