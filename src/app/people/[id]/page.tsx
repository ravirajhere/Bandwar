import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPeopleData, getMasterData } from "@/lib/data"; 
import { Metadata } from "next";
import { Edit3, ShieldCheck, Calendar, ChevronRight, User } from "lucide-react"; 
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
    <div className="bg-background min-h-screen py-10 md:py-16">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
      />

      <div className="container-custom">
        
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-muted flex items-center gap-2 no-print flex-wrap">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight size={14} className="text-border" />
          <Link href="/people" className="hover:text-brand transition-colors">People</Link>
          <ChevronRight size={14} className="text-border" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{person.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Premium Knowledge Panel */}
          <aside className="lg:col-span-4 order-2 lg:order-1 no-print">
            <div className="lg:sticky lg:top-24 bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              
              {/* Photo Container */}
              <div className="relative w-full aspect-square bg-muted-background">
                {person.photo ? (
                  <Image
                    src={person.photo.startsWith("/") ? person.photo : `/${person.photo}`}
                    alt={person.photoAlt || person.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted">
                    <User size={80} className="opacity-20" />
                  </div>
                )}
                
                {isDeceased && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm border border-white/20">
                    <span>🕊️</span> In Memoriam
                  </div>
                )}
              </div>

              {/* Data Container */}
              <div className="p-6">
                
                {/* Name with Edit */}
                <div className="flex items-start gap-2 mb-1 group">
                  <h2 className="font-serif text-2xl text-foreground leading-tight m-0">
                    {person.name}
                  </h2>
                  <div className="mt-1 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <UniversalEditModal fieldName="Full Name" currentValue={person.name} contextId={person.id} contextType="Person" variant="icon" />
                  </div>
                </div>

                {/* Role with Edit */}
                <div className="flex items-start gap-2 mb-6 pb-5 border-b border-border-subtle group">
                  <p className="text-brand font-semibold text-[15px] m-0 leading-snug">
                    {person.role}
                  </p>
                  <div className="mt-0.5 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <UniversalEditModal fieldName="Role" currentValue={person.role} contextId={person.id} contextType="Person" variant="icon" />
                  </div>
                </div>

                {/* Details List */}
                <dl className="space-y-4 text-[14px]">
                  {(person.dob || person.deathDate) && (
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted font-medium text-[13px] uppercase tracking-wider">Lifespan</dt>
                      <dd className="text-foreground flex items-center justify-between group">
                        <span className="font-medium">
                          {person.dob && person.deathDate 
                            ? `${person.dob} – ${person.deathDate}` 
                            : person.dob 
                              ? `Born: ${person.dob}` 
                              : `Died: ${person.deathDate}`}
                        </span>
                        <div className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
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
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted font-medium text-[13px] uppercase tracking-wider">Birthplace</dt>
                      <dd className="text-foreground flex items-center justify-between group">
                        <span className="font-medium">{person.birthplace}</span>
                        <div className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          <UniversalEditModal fieldName="Birthplace" currentValue={person.birthplace} contextId={person.id} contextType="Person" variant="icon" />
                        </div>
                      </dd>
                    </div>
                  )}

                  {person.locality && (
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted font-medium text-[13px] uppercase tracking-wider">Locality</dt>
                      <dd className="text-foreground flex items-center justify-between group">
                        <span className="font-medium flex items-center gap-1.5"><span className="text-brand text-lg leading-none">📍</span> {person.locality}</span>
                        <div className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          <UniversalEditModal fieldName="Locality" currentValue={person.locality} contextId={person.id} contextType="Person" variant="icon" />
                        </div>
                      </dd>
                    </div>
                  )}

                  {person.titles && person.titles.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2">
                      <dt className="text-muted font-medium text-[13px] uppercase tracking-wider">Titles</dt>
                      <dd className="flex flex-wrap gap-2">
                        {person.titles.map((title, idx) => (
                          <span key={idx} className="bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-md text-[12px] font-bold tracking-wide">
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
            
            <header className="mb-10 pb-6 border-b border-border">
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
                {person.name}
              </h1>
              
              {/* Trust Badge / Last Updated */}
              <div className="flex items-center gap-2 text-sm text-muted">
                {person.lastEditedBy ? (
                  <div className="flex items-center gap-1.5 bg-brand/5 text-brand/90 px-3 py-1.5 rounded-md font-medium border border-brand/10">
                    <ShieldCheck size={16} />
                    <span>Verified by {person.lastEditedBy}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-muted-background px-3 py-1.5 rounded-md font-medium border border-border">
                    <Calendar size={16} />
                    <span>Profile Verified</span>
                  </div>
                )}
              </div>
            </header>

            {/* Biography Section */}
            <section className="mb-12">
              <h3 className="text-2xl font-serif text-foreground mb-4 border-b border-border pb-2 flex items-center justify-between">
                Biography
                <span className="not-prose no-print">
                  <UniversalEditModal fieldName="Biography" currentValue={person.bio} contextId={person.id} contextType="Person" variant="icon" />
                </span>
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-[1.8] text-[17px]">
                <p className="m-0">
                  {person.bio}
                </p>
              </div>
            </section>

            {/* Journey Section */}
            {person.journey && (
              <section className="mb-12">
                <h3 className="text-2xl font-serif text-foreground mb-4 border-b border-border pb-2 flex items-center justify-between">
                  Unki Kahani (Life Journey)
                  <span className="not-prose no-print">
                    <UniversalEditModal fieldName="Life Journey" currentValue={person.journey} contextId={person.id} contextType="Person" variant="icon" />
                  </span>
                </h3>
                <div className="bg-card border-l-4 border-brand p-6 md:p-8 rounded-r-2xl shadow-sm relative group">
                  <span className="absolute top-4 left-4 text-6xl text-brand/10 font-serif leading-none">"</span>
                  <p className="text-lg md:text-xl leading-relaxed text-foreground/90 italic m-0 relative z-10">
                    {person.journey}
                  </p>
                </div>
              </section>
            )}

            {/* Tags Section */}
            {person.tags && person.tags.length > 0 && (
              <section className="mt-16 pt-8 border-t border-border-subtle">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[13px] text-muted mr-2 font-bold uppercase tracking-wider">Tags:</span>
                  {person.tags.map((tag, idx) => (
                    <span key={idx} className="bg-muted-background border border-border text-foreground/70 px-3 py-1 rounded-full text-[13px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Contribute CTA */}
            <div className="mt-12 bg-muted-background border border-border rounded-2xl p-6 sm:p-8 text-center no-print">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Know more about {person.name}?
              </h3>
              <p className="text-muted mb-6 text-[15px]">
                If you have historical photos or additional information about their life, please share it with us.
              </p>
              <Link 
                href={`/contribute?person=${person.id}`} 
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors shadow-sm"
              >
                <Edit3 size={18} /> Contribute Info
              </Link>
            </div>

            {/* Back Button */}
            <div className="mt-10 no-print">
              <Link 
                href="/people" 
                className="inline-flex items-center text-brand hover:text-brand-hover font-medium transition-colors"
              >
                <span className="mr-2">←</span> Back to People Directory
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}