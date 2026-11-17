import type { Metadata } from "next";
import { getContributorByUsername, getAllArticles, getMasterData, getAllContributors } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Calendar, ChevronRight, BadgeCheck, FileText } from "lucide-react";
import { ProfileClientWrapper } from "@/components/contributor/ProfileClientWrapper";
import { ArticleCard } from "@/components/article/ArticleCard"; // 🚀 IMPORT ADDED

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

export default async function ContributorProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);
  const config = getMasterData();
  const allArticles = getAllArticles();

  if (!contributor) notFound();

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${contributor.username}`;
  
  // E-E-A-T: Find articles edited by this user
  const authoredArticles = allArticles.filter(a => 
    a.lastEditedByUsername === contributor.username || a.lastEditedBy === contributor.displayName
  );

  // Default cover image (Nadi wali)
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
      
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} className="text-divider" aria-hidden="true" />
          <Link href="/contributors" className="hover:text-accent">Contributors</Link>
          <ChevronRight size={14} className="text-divider" aria-hidden="true" />
          <span className="text-ink font-medium">{contributor.displayName}</span>
        </nav>

        {/* 🚀 UPGRADED PROFILE CARD */}
        <div className="bg-surface border border-divider rounded-lg overflow-hidden shadow-sm">
          
          {/* Cover Banner */}
          <div className="relative h-32 md:h-48 w-full bg-accent/10">
            <Image 
              src={coverImage} 
              alt="Bandwar Village Cover" 
              fill 
              className="object-cover opacity-60" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
          </div>

          <div className="px-6 pb-8 md:px-10 md:pb-10 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20">
              
              {/* Avatar with Ring */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-canvas border-4 border-surface rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-md z-10">
                {contributor.photo ? (
                  <Image src={contributor.photo} alt={`${contributor.displayName} — Bandwar contributor`} width={160} height={160} className="w-full h-full object-cover" sizes="(max-width: 768px) 128px, 160px" />
                ) : (
                  <User size={56} className="text-ink/20" aria-hidden="true" />
                )}
              </div>

              <div className="flex-grow text-center md:text-left mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink">{contributor.displayName}</h1>
                  {/* Verified Badge */}
                  <BadgeCheck size={28} className="text-accent" aria-label="Verified Contributor" />
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-ink-muted mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} aria-hidden="true" />
                    {contributor.joinedAt ? (
                      <time dateTime={contributor.joinedAt}>
                        Joined {new Date(contributor.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                      </time>
                    ) : (
                      <span>Active contributor</span>
                    )}
                  </span>
                  <span className="hidden md:inline text-divider">|</span>
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} aria-hidden="true" />
                    {authoredArticles.length} Articles
                  </span>
                </div>
              </div>

              <div className="shrink-0 mt-4 md:mt-0">
                <ProfileClientWrapper contributor={contributor} />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8 prose prose-sm dark:prose-invert max-w-3xl text-ink/80">
              {contributor.bio ? (
                <p className="whitespace-pre-wrap">{contributor.bio}</p>
              ) : (
                <p className="italic text-ink/40">This contributor has not added a bio yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* 🚀 E-E-A-T: Show articles by this contributor */}
        {authoredArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-divider">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-6">Articles by {contributor.displayName}</h2>
            
            {/* Using the premium ArticleCard component */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authoredArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}