import type { Metadata } from "next";
import { getContributorByUsername, getAllArticles, getMasterData, getAllContributors } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Calendar, ChevronRight } from "lucide-react";
import { ProfileClientWrapper } from "@/components/contributor/ProfileClientWrapper";

export async function generateStaticParams() {
  const contributors = getAllContributors();
  return contributors.map((c) => ({ username: encodeURIComponent(c.username) }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);
  const config = getMasterData();
  
  if (!contributor) return { title: "Contributor Not Found", robots: { index: false } };

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${encodeURIComponent(contributor.username)}`;
  const bio = contributor.bio?.slice(0, 160) || `${contributor.displayName} — a contributor to the Bandwar Village Archive.`;
  const ogImage = contributor.photo ? `${baseUrl}/${contributor.photo.replace(/^\//, "")}` : `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;

  return {
    title: contributor.displayName,
    description: bio,
    alternates: { canonical: profileUrl, languages: { "en-IN": profileUrl, "x-default": profileUrl } },
    robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "profile",
      title: contributor.displayName,
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

export default async function ContributorProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);
  const config = getMasterData();
  const allArticles = getAllArticles();

  if (!contributor) notFound();

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${encodeURIComponent(contributor.username)}`;
  
  // E-E-A-T: Find articles edited by this user
  const authoredArticles = allArticles.filter(a => 
    a.lastEditedByUsername === contributor.username || a.lastEditedBy === contributor.displayName
  );

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
      
      <div className="container mx-auto px-4 md:px-0 max-w-3xl">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} className="text-divider" aria-hidden="true" />
          <Link href="/contributors" className="hover:text-accent">Contributors</Link>
          <ChevronRight size={14} className="text-divider" aria-hidden="true" />
          <span className="text-ink font-medium">{contributor.displayName}</span>
        </nav>

        <div className="bg-surface border border-divider rounded-sm p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-canvas border border-divider rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              {contributor.photo ? (
                <Image src={contributor.photo} alt={`${contributor.displayName} — Bandwar contributor`} width={128} height={128} className="w-full h-full object-cover" sizes="(max-width: 768px) 96px, 128px" />
              ) : (
                <User size={48} className="text-ink/20" aria-hidden="true" />
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-2">{contributor.displayName}</h1>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-ink-muted mb-6">
                <Calendar size={14} aria-hidden="true" />
                {contributor.joinedAt ? (
                  <time dateTime={contributor.joinedAt}>
                    Joined {new Date(contributor.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                  </time>
                ) : (
                  <span>Active contributor</span>
                )}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-ink/80 mb-6">
                {contributor.bio ? (
                  <p className="whitespace-pre-wrap">{contributor.bio}</p>
                ) : (
                  <p className="italic text-ink/40">This contributor has not added a bio yet.</p>
                )}
              </div>

              <ProfileClientWrapper contributor={contributor} />
            </div>
          </div>
        </div>

        {/* 🚀 E-E-A-T: Show articles by this contributor */}
        {authoredArticles.length > 0 && (
          <section className="mt-10 pt-8 border-t border-divider">
            <h2 className="font-serif text-2xl font-bold text-ink mb-4">Articles by {contributor.displayName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authoredArticles.map(article => (
                <Link key={article.id} href={`/article/${article.id}`} className="bg-surface border border-divider p-4 hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <h3 className="font-serif font-bold text-ink mb-1">{article.title}</h3>
                  <p className="text-sm text-ink-muted line-clamp-2">{article.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}