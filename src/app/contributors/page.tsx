import { getContributors, getMasterData } from "@/lib/data";
import { Metadata } from "next";
import Link from "next/link";
import { User, ChevronRight, Users } from "lucide-react";
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
  const config = getMasterData();
  const baseUrl = config.site.url;

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
      
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} className="text-divider" />
          <span className="text-ink font-medium">Contributors</span>
        </nav>

        <div className="mb-12 border-b border-divider pb-8 text-center">
          <div className="w-16 h-16 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Users size={32} aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-ink font-bold mb-4">
            Our Contributors
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-lg">
            The Bandwar Village Archive is built by the community. Meet the residents, descendants, and volunteers who preserve this history.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contributors.map((c) => (
            <Link 
              key={c.username} 
              href={`/contributors/${encodeURIComponent(c.username)}`}
              className="bg-surface border border-divider p-6 rounded-sm flex flex-col items-center text-center hover:border-accent transition-colors group"
            >
              <div className="w-20 h-20 bg-canvas border border-divider rounded-full flex items-center justify-center overflow-hidden mb-4">
                {c.photo ? (
                  <Image src={c.photo} alt={c.displayName} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-ink/20" />
                )}
              </div>
              <h2 className="font-serif font-bold text-ink group-hover:text-accent transition-colors text-lg">
                {c.displayName}
              </h2>
              <p className="text-sm text-ink-muted mt-1 line-clamp-2">
                {c.bio || "Community Contributor"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}