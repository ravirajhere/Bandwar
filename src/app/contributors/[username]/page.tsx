import type { Metadata } from "next";
import { getContributorByUsername, getAllArticles, getMasterData, getAllContributors, getMediaData } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Calendar, ChevronRight, BadgeCheck, FileText, Camera, Shield } from "lucide-react";
import { ProfileClientWrapper } from "@/components/contributor/ProfileClientWrapper";
import { ArticleCard } from "@/components/article/ArticleCard";

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
  const media = getMediaData(); // 🚀 Fetch media for photo stats

  if (!contributor) notFound();

  const baseUrl = config.site.url;
  const profileUrl = `${baseUrl}/contributors/${contributor.username}`;
  
  // E-E-A-T: Find articles edited by this user
  const authoredArticles = allArticles.filter(a => 
    a.lastEditedByUsername === contributor.username || a.lastEditedBy === contributor.displayName
  );

  // 🚀 Find photos by this user (Agar future mein uploadedBy field add hoti hai)
  const uploadedPhotos = media.gallery.photos.filter(p => 
    (p as any).uploadedBy === contributor.username || (p as any).credit === contributor.displayName
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
      
      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <Link href="/contributors" className="hover:text-accent transition-colors">Contributors</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium truncate">{contributor.displayName}</span>
        </nav>

        {/* 🚀 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_minmax(0,1fr)] gap-8 items-start">
          
          {/* LEFT SIDEBAR (Profile Info) */}
          <aside className="bg-surface border border-divider rounded-lg overflow-hidden shadow-sm sticky top-24">
            {/* Cover Banner */}
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
            
            <div className="px-6 pb-8 relative">
              {/* Avatar with Ring */}
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

              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-serif text-2xl font-bold text-ink truncate">{contributor.displayName}</h1>
                <BadgeCheck size={20} className="text-accent shrink-0" aria-label="Verified Contributor" />
              </div>
              
              <p className="text-sm text-ink-muted mb-6 flex items-center gap-2">
                <Calendar size={14} aria-hidden="true" />
                {contributor.joinedAt ? (
                  <time dateTime={contributor.joinedAt}>
                    Joined {new Date(contributor.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                  </time>
                ) : (
                  <span>Active contributor</span>
                )}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
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
              </div>

              <div className="prose prose-sm dark:prose-invert text-ink/80 mb-6">
                {contributor.bio ? (
                  <p className="whitespace-pre-wrap">{contributor.bio}</p>
                ) : (
                  <p className="italic text-ink/40">This contributor has not added a bio yet.</p>
                )}
              </div>

              <div className="pt-6 border-t border-divider">
                <ProfileClientWrapper contributor={contributor} />
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN AREA (Activity) */}
          <main className="min-w-0">
            {authoredArticles.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
                  <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                    <Shield size={20} className="text-accent" aria-hidden="true" /> 
                    Recent Contributions
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {authoredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-dashed border-divider p-12 text-center rounded-lg flex flex-col items-center justify-center min-h-[300px]">
                <FileText size={48} className="text-ink/20 mb-4" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold text-ink mb-2">No Articles Yet</h3>
                <p className="text-sm text-ink-muted max-w-xs mx-auto">This contributor hasn't published any articles at the moment. Check back later.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}