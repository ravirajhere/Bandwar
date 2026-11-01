import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPeopleData, getMasterData } from "@/lib/data"; 
import { Metadata } from "next";
import { Edit3, ShieldCheck, Calendar, ChevronRight, User, MapPin } from "lucide-react"; 
import { EditableText } from "@/components/editor/EditableText";
import { EditableParagraph } from "@/components/editor/EditableParagraph";
import { EditModeProvider } from "@/components/editor/EditModeProvider";
import { EditModeToggle } from "@/components/editor/EditModeToggle";

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
    alternates: { canonical: personUrl },
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

  if (!person) notFound();

  const isDeceased = !!person.deathDate;
  
  const baseUrl = config.site.url;
  const personUrl = `${baseUrl}/people/${person.id}`;
  const imageUrl = person.photo 
    ? (person.photo.startsWith("http") ? person.photo : `${baseUrl}/${person.photo.startsWith("/") ? person.photo.slice(1) : person.photo}`)
    : `${baseUrl}/icon.png`;

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
    ...(person.birthplace && { "birthPlace": { "@type": "Place", "name": person.birthplace } }),
    ...(person.locality && { "homeLocation": { "@type": "Place", "name": person.locality } })
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

  return (
    <EditModeProvider>
      <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personJsonLd, breadcrumbJsonLd]) }}
        />

        <div className="container mx-auto px-4 md:px-0">
          
          {/* Breadcrumbs */}
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
                    <img
                      src={person.photo}
                      alt={person.photoAlt || person.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                      <User size={64} className="3xl:w-24 3xl:h-24" />
                    </div>
                  )}
                </div>

                {/* Deceased Badge */}
                {isDeceased && (
                  <div className="bg-canvas border-b border-divider text-center py-1.5 text-ink-muted text-[10px] 3xl:text-xs font-bold uppercase tracking-widest">
                    In Memoriam
                  </div>
                )}

                {/* Data Container */}
                <div className="p-5 3xl:p-6">
                  
                  {/* Name (Inline Editable) */}
                  <div className="mb-1">
                    <EditableText
                      initialValue={person.name}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Full Name"
                      as="h2"
                      className="font-serif text-xl 3xl:text-2xl text-ink leading-tight m-0 font-bold"
                    />
                  </div>

                  {/* Role (Inline Editable) */}
                  <div className="mb-4 pb-4 border-b border-divider">
                    <EditableText
                      initialValue={person.role}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Role"
                      as="p"
                      className="text-accent font-semibold text-sm 3xl:text-base m-0 leading-snug"
                    />
                  </div>

                  {/* Details List (Strict Rows) */}
                  <dl className="space-y-0 text-sm 3xl:text-base">
                    {(person.dob || person.deathDate) && (
                      <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                        <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Lifespan</dt>
                        <dd className="text-ink m-0">
                          <EditableText
                            initialValue={person.dob && person.deathDate ? `${person.dob} – ${person.deathDate}` : person.dob ? `Born: ${person.dob}` : `Died: ${person.deathDate}`}
                            contextId={person.id}
                            contextType="Person"
                            fieldName="Lifespan (DOB/DOD)"
                            as="span"
                            className="font-medium"
                          />
                        </dd>
                      </div>
                    )}

                    {person.birthplace && (
                      <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                        <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Birthplace</dt>
                        <dd className="text-ink m-0">
                           <EditableText
                            initialValue={person.birthplace}
                            contextId={person.id}
                            contextType="Person"
                            fieldName="Birthplace"
                            as="span"
                            className="font-medium"
                          />
                        </dd>
                      </div>
                    )}

                    {person.locality && (
                      <div className="flex flex-col gap-0.5 py-2 border-b border-divider/50 last:border-0 group">
                        <dt className="text-ink/50 font-bold text-[10px] 3xl:text-xs uppercase tracking-wider">Locality</dt>
                        <dd className="text-ink m-0">
                          <span className="font-medium flex items-center gap-1">
                            <MapPin size={12} className="text-accent shrink-0" /> 
                            <EditableText
                              initialValue={person.locality}
                              contextId={person.id}
                              contextType="Person"
                              fieldName="Locality"
                              as="span"
                              className="font-medium"
                            />
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: Biography & Journey */}
            <main className="lg:col-span-8 order-1 lg:order-2">
              
              <header className="mb-8 pb-4 border-b border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-3 font-bold tracking-tight">
                    {person.name}
                  </h1>
                  
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
                </div>
                <div className="no-print shrink-0">
                  <EditModeToggle />
                </div>
              </header>

              {/* Biography Section */}
              <section className="mb-10">
                <div className="flex items-center justify-between border-b border-divider pb-2 mb-4">
                  <h3 className="text-xl 3xl:text-2xl font-serif font-bold text-ink">Biography</h3>
                </div>
                <EditableParagraph
                  initialValue={person.bio}
                  contextId={person.id}
                  contextType="Person"
                  fieldName="Biography"
                  className="prose prose-lg dark:prose-invert max-w-[75ch] text-ink/90 leading-[1.8] text-base 3xl:text-lg"
                />
              </section>

              {/* Journey Section (Formal Blockquote) */}
              {person.journey && (
                <section className="mb-10">
                  <div className="flex items-center justify-between border-b border-divider pb-2 mb-4">
                    <h3 className="text-xl 3xl:text-2xl font-serif font-bold text-ink">Life Journey & Legacy</h3>
                  </div>
                  <div className="border-l-4 border-accent pl-4 md:pl-6 py-1 my-0 max-w-[75ch]">
                    <EditableParagraph
                      initialValue={person.journey}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Life Journey"
                      className="text-base md:text-lg 3xl:text-xl leading-relaxed text-ink/80 italic m-0"
                    />
                  </div>
                </section>
              )}

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
    </EditModeProvider>
  );
}