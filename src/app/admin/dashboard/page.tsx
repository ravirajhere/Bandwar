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
  // Server side pe saara stats ek baar me calculate karo — client ko load nahi dena
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

  // FIX 1: Sirf status se count — pehle published + draft double ho raha tha
  // Kyunki (a as any).published aur a.status dono check ho raha tha
  const publishedCount = allArticles.filter((a) => a.status === "published").length;
  const draftCount = allArticles.filter((a) => a.status !== "published").length;

  // Last 7 days me kya update hua
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCount = allArticles.filter(
    (a) => new Date(a.dateModified || a.lastUpdated || 0).getTime() > sevenDaysAgo
  ).length;

  // FIX 2: Sort karke hi top 5 — pehle slice(0,5) bina sort ke tha,
  // isiliye purana article upar dikhta tha
  const sorted = [...allArticles].sort(
    (a, b) =>
      new Date(b.dateModified || b.lastUpdated || 0).getTime() -
      new Date(a.dateModified || a.lastUpdated || 0).getTime()
  );

  // Recent 5 articles — Recent Activity ke liye
  const recentArticles = sorted.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status || "draft",
    confidence: a.confidence || "unverified",
    lastUpdated: a.dateModified || a.lastUpdated,
    lastEditedBy: (a as any).lastEditedBy || "—",
  }));

  // NEW V2: Full list — All / Published / Draft tab ke liye
  // Ye prop nahi bhejega toh All Articles tab khaali dikhega
  const allForAdmin = sorted.map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status || "draft",
    confidence: a.confidence || "unverified",
    categories: a.categories || [],
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
      allArticles={allForAdmin}
    />
  );
}