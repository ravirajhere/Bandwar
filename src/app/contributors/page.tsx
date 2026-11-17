import { getContributors, getMasterData, getAllArticles } from "@/lib/data"; // 🚀 Added getAllArticles
import { Metadata } from "next";
import Link from "next/link";
import { User, ChevronRight, Users, BadgeCheck, FileText, ArrowRight } from "lucide-react";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  
  const title = "Our Contributors";
  const description = "Meet the residents, former residents, and descendants who contribute to the Bandwar Village Archive.";

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/contributors` },
    openGraph: {
      type: "website",
      title: `${title} — ${config.site.name}`,
      description,
      url: `${baseUrl}/contributors`,
      images: [{ url: `${baseUrl}${config.seo?.ogImage}`, width: 1200, height: 630 }],
    },
  };
}

export default function ContributorsPage() {
  const contributors = getContributors();
  const allArticles = getAllArticles(); // 🚀 Fetch all articles to count
  const config = getMasterData();
  const baseUrl = config.site.url;

  // 🚀 JSON-LD Upgrade: Adding Person Entities to the ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/contributors#webpage`,
        url: `${baseUrl}/contributors`,
        name: "Contributors — Bandwar Village Archive",
        description: "Meet the people who contribute to the archive.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        mainEntity: {
          "@type": "ItemList",
          "itemListElement": contributors.map((c, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Person",
              "name": c.displayName,
              "url": `${baseUrl}/contributors/${encodeURIComponent(c.username)}`,
              ...(c.photo && { "image": `${baseUrl}/${c.photo.replace(/^\//, "")}` })
            }
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Contributors", "item": `${baseUrl}/contributors` }
        ]
      }
    ]
  };

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">Contributors</span>
        </nav>

        {/* Header Section */}
        <div className="mb-12 border-b border-divider pb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Users size={28} aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-ink font-bold mb-4 tracking-tight">
            Our Contributors
          </h1>
          <div className="w-16 h-1 bg-accent mb-6 rounded-full"></div>
          <p className="text-ink-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            The Bandwar Village Archive is built by the community. Meet the residents, descendants, and volunteers who are preserving our history for future generations.
          </p>
        </div>

        {/* 🚀 UPGRADED CONTRIBUTORS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 3xl:gap-8">
          {contributors.map((c) => {
            // Calculate how many articles this person has authored
            const articleCount = allArticles.filter(a => 
              a.lastEditedByUsername === c.username || a.lastEditedBy === c.displayName
            ).length;

            return (
              <Link 
                key={c.username} 
                href={`/contributors/${encodeURIComponent(c.username)}`}
                className="group relative bg-surface border border-divider rounded-lg p-6 flex flex-col items-center text-center hover:border-accent hover:shadow-md transition-all duration-300"
              >
                {/* Avatar with subtle ring */}
                <div className="relative w-24 h-24 bg-canvas border-2 border-divider group-hover:border-accent transition-colors rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-sm z-10">
                  {c.photo ? (
                    <Image src={c.photo} alt={c.displayName} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-ink/20" aria-hidden="true" />
                  )}
                </div>

                {/* Name & Badge */}
                <div className="flex items-center justify-center gap-1.5 mb-1 w-full px-2">
                  <h2 className="font-serif font-bold text-ink group-hover:text-accent transition-colors text-xl truncate">
                    {c.displayName}
                  </h2>
                  <BadgeCheck size={18} className="text-accent shrink-0" aria-label="Verified Contributor" />
                </div>

                {/* Bio snippet */}
                <p className="text-sm text-ink-muted mt-2 line-clamp-2 min-h-[40px] mb-4">
                  {c.bio || "Community Contributor"}
                </p>

                {/* Stats footer */}
                <div className="mt-auto pt-4 border-t border-divider w-full flex items-center justify-between text-xs text-ink-muted font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-accent/70" aria-hidden="true" />
                    {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
                  </span>
                  
                  {/* Hover Arrow */}
                  <span className="text-accent flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-semibold">
                    Profile <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {contributors.length === 0 && (
          <div className="text-center py-20 bg-surface border border-dashed border-divider rounded-lg">
            <p className="text-ink-muted">No contributors found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}