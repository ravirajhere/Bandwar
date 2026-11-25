import type { Metadata } from "next";
import { getContributorByUsername, getAllArticles, getMasterData, getAllContributors, getMediaData } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Calendar, ChevronRight, BadgeCheck, FileText, Camera, Shield, Lightbulb, CheckCircle2, Clock, XCircle } from "lucide-react";
import { ProfileClientWrapper } from "@/components/contributor/ProfileClientWrapper";
import { ArticleCard } from "@/components/article/ArticleCard";

// NOTE: Ye function abhi lib/data me nahi hai toh banao — neeche bataya hai
import { getSuggestionsFor } from "@/lib/data";

export async function generateStaticParams() {
  const contributors = getAllContributors();
  return contributors.map((c) => ({ username: c.username }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);
  const config = getMasterData();

  if (!contributor) return { title: "Contributor Not Found", robots: { index: false } };

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${contributor.username}`;
  const bio = contributor.bio?.slice(0, 160) || `${contributor.displayName} — a contributor to the Bandwar Village Archive.`;
  const ogImage = contributor.photo ? `${baseUrl}/${contributor.photo.replace(/^\//, "")}` : `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;

  return {
    title: `${contributor.displayName} — Contributor Profile`,
    description: bio,
    alternates: { canonical: profileUrl, languages: { "en-IN": profileUrl, "x-default": profileUrl } },
    robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "profile",
      title: `${contributor.displayName} — Bandwar Village Archive`,
      description: bio,
      url: profileUrl,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${contributor.displayName} — Bandwar Village Archive contributor` }],
      username: contributor.username,
    },
    twitter: { card: "summary_large_image", title: contributor.displayName, description: bio, images: [ogImage] },
  };
}

const STATUS_META = {
  pending: { label: "Pending Review", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Not Accepted", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
} as const;

export default async function ContributorProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);
  const config = getMasterData();
  const allArticles = getAllArticles();
  const media = getMediaData();

  if (!contributor) notFound();

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${contributor.username}`;

  const authoredArticles = allArticles.filter(a =>
    a.lastEditedByUsername === contributor.username || a.lastEditedBy === contributor.displayName
  );

  const uploadedPhotos = media.gallery.photos.filter(p =>
    (p as any).uploadedBy === contributor.username || (p as any).credit === contributor.displayName
  );

  // Suggestions — isi user ke, naye se purane
  const suggestions = getSuggestionsFor(contributor.username) || [];
  const approvedCount = suggestions.filter(s => s.status === "approved").length;
  const pendingCount = suggestions.filter(s => s.status === "pending").length;

  const coverImage = `${baseUrl}/images/geography/burhi-gandak-river-dawn-bandwar.jpg`;

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${profileUrl}#webpage`,
        url: profileUrl,
        name: `${contributor.displayName} — Bandwar Village Archive`,
        description: contributor.bio?.slice(0, 160) || `Profile of ${contributor.displayName}, contributor to the Bandwar Village Archive.`,
        isPartOf: { "@id": `${baseUrl}/#website` },
        mainEntity: { "@id": `${profileUrl}#person` },
        inLanguage: "en-IN",
      },
      {
        "@type": "Person",
        "@id": `${profileUrl}#person`,
        name: contributor.displayName,
        alternateName: contributor.username,
        description: contributor.bio || undefined,
        url: profileUrl,
        ...(contributor.photo && { image: { "@type": "ImageObject", url: `${baseUrl}/${contributor.photo.replace(/^\//, "")}`, width: 400, height: 400 } }),
        memberOf: { "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "Bandwar Village Archive" },
      },
    ],
  };

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }} />

      <div className="container mx-auto px-4 md:px-0 max-w-6xl">

        <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-muted mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <Link href="/contributors" className="hover:text-accent transition-colors">Contributors</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium truncate">{contributor.displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">

          {/* LEFT SIDEBAR */}
          <aside className="bg-surface border border-divider rounded-lg overflow-hidden shadow-sm w-full">
            <div className="relative h-32 w-full bg-accent/10">
              <Image
                src={coverImage}
                alt="Bandwar Village Cover"
                fill
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>

            <div className="px-6 pb-8 relative flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-canvas border-4 border-surface rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-md -mt-14 mb-4 z-10 relative">
                {contributor.photo ? (
                  <Image
                    src={contributor.photo}
                    alt={`${contributor.displayName} — Bandwar contributor`}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-ink/20" aria-hidden="true" />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mb-2 w-full">
                <h1 className="font-serif text-2xl font-bold text-ink truncate">{contributor.displayName}</h1>
                <BadgeCheck size={20} className="text-accent shrink-0" aria-label="Verified Contributor" />
              </div>

              <p className="text-sm text-ink-muted mb-6 flex items-center justify-center gap-2">
                <Calendar size={14} aria-hidden="true" />
                {contributor.joinedAt ? (
                  <time dateTime={contributor.joinedAt}>
                    Joined {new Date(contributor.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                  </time>
                ) : (
                  <span>Active contributor</span>
                )}
              </p>

              {/* Stats — ab 3 box: Articles / Photos / Suggestions */}
              <div className="grid grid-cols-3 gap-2 mb-6 w-full">
                <div className="bg-canvas border border-divider p-3 rounded-md text-center">
                  <FileText size={18} className="mx-auto text-accent mb-1" aria-hidden="true" />
                  <span className="block text-xl font-bold text-ink">{authoredArticles.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Articles</span>
                </div>
                <div className="bg-canvas border border-divider p-3 rounded-md text-center">
                  <Camera size={18} className="mx-auto text-accent mb-1" aria-hidden="true" />
                  <span className="block text-xl font-bold text-ink">{uploadedPhotos.length || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Photos</span>
                </div>
                <div className="bg-canvas border border-divider p-3 rounded-md text-center">
                  <Lightbulb size={18} className="mx-auto text-accent mb-1" aria-hidden="true" />
                  <span className="block text-xl font-bold text-ink">{suggestions.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">Suggest</span>
                </div>
              </div>

              {/* Chhota trust line — visitor ko samajh aaye */}
              {suggestions.length > 0 && (
                <p className="text-xs text-ink-muted mb-6">
                  {approvedCount} approved{pendingCount > 0 ? ` • ${pendingCount} pending review` : ""}
                </p>
              )}

              <div className="text-sm text-ink/80 mb-6 w-full text-left">
                {contributor.bio ? (
                  <p className="whitespace-pre-wrap">{contributor.bio}</p>
                ) : (
                  <p className="italic text-ink/40 text-center">This contributor has not added a bio yet.</p>
                )}
              </div>

              <div className="pt-6 border-t border-divider w-full flex justify-center">
                <ProfileClientWrapper contributor={contributor} />
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA */}
          <main className="min-w-0 w-full space-y-12">
            {authoredArticles.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
                  <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                    <Shield size={20} className="text-accent" aria-hidden="true" />
                    Recent Contributions
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  {authoredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="bg-surface border border-dashed border-divider p-12 text-center rounded-lg flex flex-col items-center justify-center min-h-[200px] w-full">
                <FileText size={48} className="text-ink/20 mb-4" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold text-ink mb-2">No Articles Yet</h3>
                <p className="text-sm text-ink-muted max-w-xs mx-auto">This contributor hasn't published any articles at the moment. Check back later.</p>
              </div>
            )}

            {/* SUGGESTIONS — naya section, alag page nahi */}
            <section id="suggestions">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
                <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                  <Lightbulb size={20} className="text-accent" aria-hidden="true" />
                  Suggestions
                  <span className="text-sm font-sans font-medium text-ink-muted">({suggestions.length})</span>
                </h2>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-surface border border-dashed border-divider p-8 text-center rounded-lg">
                  <Lightbulb size={32} className="text-ink/20 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-ink-muted">No suggestions yet. When this contributor suggests a correction, its status will appear here.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {suggestions.map((s) => {
                    const meta = STATUS_META[s.status] || STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <li key={s.id} className="bg-surface border border-divider rounded-sm p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/article/${s.articleId}`} className="text-sm font-semibold text-ink hover:text-accent line-clamp-1">
                              {s.articleTitle || s.articleId}
                            </Link>
                            <p className="text-xs text-ink-muted mt-0.5">{s.fieldName} • {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                            <p className="text-sm text-ink/80 mt-2 line-clamp-2 break-words">
                              <span className="text-ink-muted">Suggested: </span>{s.newValue}
                            </p>
                            {s.status === "rejected" && s.reason && (
                              <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 rounded-sm px-2 py-1.5">
                                Why not accepted: {s.reason}
                              </p>
                            )}
                          </div>
                          <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold border rounded-sm px-2 py-1 ${meta.cls}`}>
                            <Icon size={12} aria-hidden="true" /> {meta.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}