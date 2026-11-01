import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPeopleData, getMasterData } from "@/lib/data"; 
import { Metadata } from "next";
import { Edit3, ShieldCheck, Calendar, ChevronRight, User, MapPin, FileText } from "lucide-react"; 
import { UniversalEditModal } from "@/components/shared/UniversalEditModal";

export async function generateStaticParams() {
  const data = getPeopleData();
  return data.people.map((person) => ({
    id: person.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = getPeopleData();
  const config = getMasterData();
  const person = data.people.find((p) => p.id === id);

  if (!person) {
    return { title: "Person Not Found | Bandwar Portal" };
  }

  const baseUrl = config.site.url;
  const personUrl = `${baseUrl}/people/${person.id}`;
  
  const imageUrl = person.photo 
    ? (person.photo.startsWith("http") ? person.photo : `${baseUrl}/${person.photo.startsWith("/") ? person.photo.slice(1) : person.photo}`)
    : `${baseUrl}/icon.png`;

  return {
    title: `${person.name} | ${config.site.name}`,
    description: person.bio.substring(0, 160),
    alternates: {
      canonical: personUrl,
    },
    openGraph: {
      title: `${person.name} - ${person.role}`,
      description: person.bio.substring(0, 160),
      url: personUrl,
      siteName: config.site.name,
      images: [{ url: imageUrl, width: 800, height: 800, alt: person.name }],
      type: "profile",
    },
  };
}

export default async function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getPeopleData();
  const config = getMasterData(); 
  const person = data.people.find((p) => p.id === id);

  if (!person) {
    notFound();
  }

  const isDeceased = !!person.deathDate;
  
  const baseUrl = config.site.url;
  const personUrl = `${baseUrl}/people/${person.id}`;
  const imageUrl = person.photo 
    ? (person.photo.startsWith("http") ? person.photo : `${baseUrl}/${person.photo.startsWith("/") ? person.photo.slice(1) : person.photo}`)
    : `${baseUrl}/icon.png`;

  // ==========================================
  // 🚀 2026 SEO: Person & Breadcrumb Schema
  // ==========================================
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${personUrl}/#person`,
    "name": person.name,
    "jobTitle": person.role,
    "description": person.bio,
    "image": imageUrl,
    "url": personUrl,
    ...(person.dob && { "birthDate": person.dob }),
    ...(person.deathDate && { "deathDate": person.deathDate }),
    ...(person.birthplace && { 
      "birthPlace": { "@type": "Place", "name": person.birthplace } 
    }),
    ...(person.locality && {
      "homeLocation": { "@type": "Place", "name": person.locality }
    })
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "People", "item": `${baseUrl}/people` },
      { "@type": "ListItem", "position": 3, "name": person.name, "item": personUrl }
    ]
  };

  const combinedJsonLd = [personJsonLd, breadcrumbJsonLd];

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Breadcrumbs (Strict) */}
        <nav className="mb-6 text-sm text-ink-muted flex items-center gap-2 no-print flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" />
          <Link href="/people" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">People</Link>
          <ChevronRight size={14} className="text-divider shrink-0" />
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{person.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 3xl:gap-16">
          
          {/* LEFT COLUMN: Wikipedia-Style Infobox */}
          <aside className="lg:col-span-4 order-2 lg:order-1 no-print">
            <div className="lg:sticky lg:top-24 bg-surface border border-divider rounded-sm">
              
              {/* Photo Container */}
              <div className="relative w-full aspect-square bg-canvas border-b border-divider overflow-hidden">
                {person.photo ? (
                  <Image
                    src={person.photo.startsWith("/") ? person.photo : `/${person.photo}`}
                    alt={person.photoAlt || person.name}
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                    <User size={64} className="3xl:w-24 3xl:h-24" />
                  </div>
                )}
              </div>

              {/* Deceased Badge (Flat & Formal) */}
              {isDeceased && (
                <div className="bg-canvas border-b border-divider text-center py-1.5 text-ink-muted text-[10px] 3xl:text-xs font-bold uppercase tracking-widest">
                  In Memoriam
                </div>
              )}

              {/* Data Container */}
              <div className="p-5 3xl:p-6">
                
                {/* Name */}
                <div className="flex items-start gap-2 mb-1 group">
                  <h2 className="font-serif text-xl 3xl:text-2xl text-ink leading-tight m-0 font-bold">
                    {person.name}
                  </h2>
                  <div className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UniversalEditModal fieldName="Full Name" currentValue={person.name} contextId={person.id} contextType="Person" variant="icon" />
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-2 mb-4 pb-4 border-b border-divider group">
                  <p className="text-accent font-semibold text-sm 3xl:text-base m-0 leading-snug">
                    {person.role}
                  </p>
                  <div className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UniversalEditModal fieldName="Role" currentValue={person.role} contextId={person.id} contextType="Person" variant="icon" />
                  </div>
                </div>

                {/* Details List (Strict Rows) */}
                <dl className="space-y-0 text-sm 3xl:text-base">
                  {(person.dob || person.deathDate) && (
                    <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                      <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Lifespan</dt>
                      <dd className="text-ink flex items-center justify-between m-0">
                        <span className="font-medium">
                          {person.dob && person.deathDate 
                            ? `${person.dob} – ${person.deathDate}` 
                            : person.dob 
                              ? `Born: ${person.dob}` 
                              : `Died: ${person.deathDate}`}
                        </span>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UniversalEditModal 
                            fieldName="Lifespan (DOB/DOD)" 
                            currentValue={`${person.dob || ''} - ${person.deathDate || ''}`} 
                            contextId={person.id} contextType="Person" variant="icon" 
                          />
                        </div>
                      </dd>
                    </div>
                  )}

                  {person.birthplace && (
                    <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                      <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Birthplace</dt>
                      <dd className="text-ink flex items-center justify-between m-0">
                        <span className="font-medium">{person.birthplace}</span>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UniversalEditModal fieldName="Birthplace" currentValue={person.birthplace} contextId={person.id} contextType="Person" variant="icon" />
                        </div>
                      </dd>
                    </div>
                  )}

                  {person.locality && (
                    <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                      <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Locality</dt>
                      <dd className="text-ink flex items-center justify-between m-0">
                        <span className="font-medium flex items-center gap-1">
                          <MapPin size={12} className="text-accent shrink-0" /> 
                          {person.locality}
                        </span>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UniversalEditModal fieldName="Locality" currentValue={person.locality} contextId={person.id} contextType="Person" variant="icon" />
                        </div>
                      </dd>
                    </div>
                  )}

                  {person.titles && person.titles.length > 0 && (
                    <div className="flex flex-col gap-1 pt-3">
                      <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Titles</dt>
                      <dd className="flex flex-wrap gap-1.5 m-0">
                        {person.titles.map((title, idx) => (
                          <span key={idx} className="bg-canvas border border-divider text-ink/80 px-2 py-0.5 rounded-sm text-[11px] 3xl:text-xs font-semibold">
                            {title}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Biography & Journey */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            
            <header className="mb-8 pb-4 border-b border-divider">
              <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-3 font-bold tracking-tight">
                {person.name}
              </h1>
              
              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                {person.lastEditedBy ? (
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck size={16} className="text-accent" />
                    <span>Verified by {person.lastEditedBy}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={16} />
                    <span>Profile Verified</span>
                  </div>
                )}
              </div>
            </header>

            {/* Biography Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between border-b border-divider pb-2 mb-4">
                <h3 className="text-xl 3xl:text-2xl font-serif font-bold text-ink">
                  Biography
                </h3>
                <span className="not-prose no-print">
                  <UniversalEditModal fieldName="Biography" currentValue={person.bio} contextId={person.id} contextType="Person" variant="icon" />
                </span>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-[75ch] text-ink/90 leading-[1.8] text-base 3xl:text-lg">
                <p className="m-0">
                  {person.bio}
                </p>
              </div>
            </section>

            {/* Journey Section (Formal Blockquote) */}
            {person.journey && (
              <section className="mb-10">
                <div className="flex items-center justify-between border-b border-divider pb-2 mb-4">
                  <h3 className="text-xl 3xl:text-2xl font-serif font-bold text-ink">
                    Life Journey & Legacy
                  </h3>
                  <span className="not-prose no-print">
                    <UniversalEditModal fieldName="Life Journey" currentValue={person.journey} contextId={person.id} contextType="Person" variant="icon" />
                  </span>
                </div>
                <blockquote className="border-l-4 border-accent pl-4 md:pl-6 py-1 my-0 max-w-[75ch]">
                  <p className="text-base md:text-lg 3xl:text-xl leading-relaxed text-ink/80 italic m-0">
                    {person.journey}
                  </p>
                </blockquote>
              </section>
            )}

            {/* Tags Section (Flat) */}
            {person.tags && person.tags.length > 0 && (
              <section className="mt-8 pt-6 border-t border-divider">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-ink-muted mr-1 font-bold uppercase tracking-wider flex items-center gap-1"><FileText size={12}/> Tags:</span>
                  {person.tags.map((tag, idx) => (
                    <span key={idx} className="bg-surface border border-divider text-ink-muted px-2 py-1 rounded-sm text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Contribute CTA (Flat Box) */}
            <div className="mt-10 bg-surface border border-divider rounded-sm p-6 text-center no-print">
              <h3 className="font-serif text-lg font-bold text-ink mb-1">
                Know more about {person.name}?
              </h3>
              <p className="text-ink-muted text-sm mb-4">
                If you have historical photographs or additional information, please share it with us.
              </p>
              <Link 
                href={`/contribute?person=${person.id}`} 
                className="inline-flex items-center gap-2 bg-canvas border border-divider text-ink px-4 py-2 rounded-sm text-sm font-semibold hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Edit3 size={14} /> Contribute Info
              </Link>
            </div>

            {/* Back Button */}
            <div className="mt-8 no-print">
              <Link 
                href="/people" 
                className="inline-flex items-center text-sm font-semibold text-accent hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                ← Back to People Directory
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}