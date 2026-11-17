import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPeopleData, getMasterData, getAllArticles } from "@/lib/data"; // 🚀 Added getAllArticles
import { Metadata } from "next";
import { ShieldCheck, Calendar, ChevronRight, User, MapPin, BookOpen, Quote, ArrowRight, Link2 } from "lucide-react"; 
import { EditableText } from "@/components/editor/EditableText";
import { EditableParagraph } from "@/components/editor/EditableParagraph";
import { EditModeProvider } from "@/components/editor/EditModeProvider";
import { EditModeToggle } from "@/components/editor/EditModeToggle";
import { ImageUpdateButton } from "@/components/shared/ImageUpdateButton";

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

  if (!person) return { title: "Person Not Found", robots: { index: false } };

  const baseUrl = config.site.url;
  const personUrl = `${baseUrl}/people/${person.id}`;
  const cleanPhoto = person.photo ? person.photo.split('?')[0] : null;
  const imageUrl = cleanPhoto 
    ? (cleanPhoto.startsWith("http") ? cleanPhoto : `${baseUrl}/${cleanPhoto.replace(/^\//, "")}`)
    : `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;

  const description = person.bio 
    ? person.bio.slice(0, 160) 
    : `${person.name} — ${person.role} from Bandwar village, Begusarai (Bihar).`;

  return {
    title: person.name,
    description,
    alternates: { canonical: personUrl, languages: { "en-IN": personUrl, "x-default": personUrl } },
    openGraph: {
      title: `${person.name} - ${person.role}`,
      description,
      url: personUrl,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: imageUrl, width: 800, height: 800, alt: person.photoAlt || person.name }],
      type: "profile",
    },
    twitter: { card: "summary_large_image", title: `${person.name} - ${person.role}`, description, images: [imageUrl] },
  };
}

export default async function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getPeopleData();
  const config = getMasterData(); 
  const allArticles = getAllArticles(); // 🚀 Fetch articles for backlinks
  const person = data.people.find((p) => p.id === id);

  if (!person) notFound();

  const isDeceased = !!person.deathDate;
  const baseUrl = config.site.url;
  const personUrl = `${baseUrl}/people/${person.id}`;
  
  const cleanPhoto = person.photo ? person.photo.split('?')[0] : null;
  const imageUrl = cleanPhoto 
    ? (cleanPhoto.startsWith("http") ? cleanPhoto : `${baseUrl}/${cleanPhoto.replace(/^\//, "")}`)
    : `${baseUrl}/icon.png`;

  // 🚀 Find articles that mention this person
  const backlinks = allArticles.filter(a => {
    const regex = new RegExp(`\\[\\[${person.id}(\\|.*?)?\\]\\]`, 'i');
    return a.content.some(block => regex.test(block.text)) || a.summary?.includes(`[[${person.id}`);
  });

  // 🚀 Schema Upgrade
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${personUrl}#webpage`,
        url: personUrl,
        name: `${person.name} — Bandwar Village Archive`,
        description: person.bio?.slice(0, 160) || `${person.name} - ${person.role}`,
        isPartOf: { "@id": `${baseUrl}/#website` },
        mainEntity: { "@id": `${personUrl}#person` },
        inLanguage: "en-IN",
      },
      {
        "@type": "Person",
        "@id": `${personUrl}#person`,
        "name": person.name,
        "jobTitle": person.role,
        "description": person.bio,
        "image": imageUrl,
        "url": personUrl,
        ...(person.dob && { "birthDate": person.dob }),
        ...(person.deathDate && { "deathDate": person.deathDate }),
        ...(person.birthplace && { "birthPlace": { "@type": "Place", "name": person.birthplace } }),
        ...(person.locality && { "homeLocation": { "@type": "Place", "name": person.locality } })
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "People", "item": `${baseUrl}/people` },
          { "@type": "ListItem", "position": 3, "name": person.name, "item": personUrl }
        ]
      }
    ]
  };

  return (
    <EditModeProvider>
      <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="container mx-auto px-4 md:px-0 max-w-6xl">
          
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-ink-muted flex items-center gap-2 no-print flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
            <Link href="/people" className="hover:text-accent transition-colors">People</Link>
            <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
            <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{person.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 3xl:gap-16 items-start">
            
            {/* 🚀 LEFT COLUMN: The "Archival Record" Sidebar */}
            <aside className="lg:sticky lg:top-24 order-2 lg:order-1">
              <div className="bg-surface border border-divider rounded-lg overflow-hidden shadow-sm">
                
                {/* Photo Container */}
                <div className="relative w-full aspect-[4/5] bg-canvas border-b border-divider overflow-hidden group">
                  {cleanPhoto ? (
                    <Image
                      src={cleanPhoto}
                      alt={person.photoAlt || person.name}
                      fill
                      className="object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                      <User size={64} aria-hidden="true" />
                    </div>
                  )}
                  <div className="no-print">
                    <ImageUpdateButton contextName={person.name} contextId={person.id} currentImage={person.photo} targetType="person" />
                  </div>
                </div>

                {/* Deceased Badge (Memorial Ribbon) */}
                {isDeceased && (
                  <div className="bg-accent text-white text-center py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> In Memoriam
                  </div>
                )}

                {/* Data Container */}
                <div className="p-6">
                  <div className="mb-2 text-center">
                    <EditableText
                      initialValue={person.name}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Full Name"
                      as="h2"
                      className="font-serif text-2xl text-ink leading-tight m-0 font-bold"
                    />
                  </div>

                  <div className="mb-6 text-center">
                    <EditableText
                      initialValue={person.role}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Role"
                      as="p"
                      className="text-accent font-bold text-sm uppercase tracking-wider m-0"
                    />
                  </div>

                  <dl className="space-y-0 text-sm border-t border-divider pt-4">
                    {(person.dob || person.deathDate) && (
                      <div className="flex flex-col gap-1 py-3 border-b border-divider/50 last:border-0">
                        <dt className="text-ink/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> Lifespan</dt>
                        <dd className="text-ink m-0 font-medium">
                          <EditableText
                            initialValue={person.dob && person.deathDate ? `${person.dob} – ${person.deathDate}` : person.dob ? `Born: ${person.dob}` : `Died: ${person.deathDate}`}
                            contextId={person.id}
                            contextType="Person"
                            fieldName="Lifespan (DOB/DOD)"
                            as="span"
                          />
                        </dd>
                      </div>
                    )}

                    {person.birthplace && (
                      <div className="flex flex-col gap-1 py-3 border-b border-divider/50 last:border-0">
                        <dt className="text-ink/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Birthplace</dt>
                        <dd className="text-ink m-0 font-medium">
                           <EditableText initialValue={person.birthplace} contextId={person.id} contextType="Person" fieldName="Birthplace" as="span" />
                        </dd>
                      </div>
                    )}

                    {person.locality && (
                      <div className="flex flex-col gap-1 py-3 border-b border-divider/50 last:border-0">
                        <dt className="text-ink/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Locality</dt>
                        <dd className="text-ink m-0 font-medium">
                          <EditableText initialValue={person.locality} contextId={person.id} contextType="Person" fieldName="Locality" as="span" />
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </aside>

            {/* 🚀 RIGHT COLUMN: Editorial Narrative */}
            <main className="order-1 lg:order-2 min-w-0">
              
              {/* Hero Header */}
              <header className="mb-10 pb-6 border-b border-divider">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-sm">Biography</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink mb-2 font-bold tracking-tight leading-[1.1]">
                    {person.name}
                  </h1>
                  <div className="no-print shrink-0 mt-2">
                    <EditModeToggle />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-ink-muted mt-4">
                  {person.lastEditedBy && person.lastUpdated ? (
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
                      <span>Verified on <time dateTime={person.lastUpdated}>{new Date(person.lastUpdated).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</time></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
                      <span>Verified Archival Record</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Biography Section */}
              <section className="mb-12">
                <EditableParagraph
                  initialValue={person.bio}
                  contextId={person.id}
                  contextType="Person"
                  fieldName="Biography"
                  className="prose prose-lg dark:prose-invert max-w-[75ch] text-ink/90 leading-[1.9] text-lg font-medium first-letter:text-5xl first-letter:font-serif first-letter:text-accent first-letter:float-left first-letter:mr-3 first-letter:mt-1"
                />
              </section>

              {/* 🚀 Journey Section (Vertical Timeline Style) */}
              {person.journey && (
                <section className="mb-12 bg-surface border border-divider rounded-lg p-6 md:p-8 relative overflow-hidden">
                  <Quote className="absolute top-4 right-4 text-accent/5 w-24 h-24 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 border-b border-divider pb-4 mb-6 relative z-10">
                    <BookOpen className="text-accent" size={24} />
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-ink m-0">Life Journey & Legacy</h3>
                  </div>
                  
                  <div className="relative z-10 border-l-2 border-accent/30 pl-6 ml-3">
                    {/* Decorative Dot */}
                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-accent" />
                    
                    <EditableParagraph
                      initialValue={person.journey}
                      contextId={person.id}
                      contextType="Person"
                      fieldName="Life Journey"
                      className="text-base md:text-lg leading-relaxed text-ink/80 italic m-0 whitespace-pre-wrap"
                    />
                  </div>
                </section>
              )}

              {/* 🚀 Mentioned In (Backlinks) */}
              {backlinks.length > 0 && (
                <section className="mt-12 pt-8 border-t border-divider">
                  <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Link2 size={16} /> Mentioned In These Records
                  </h3>
                  <ul className="space-y-2">
                    {backlinks.map((link) => (
                      <li key={link.id}>
                        <Link href={`/article/${link.id}`} className="group flex items-center justify-between p-3 bg-canvas border border-divider rounded-sm hover:border-accent transition-colors">
                          <span className="font-medium text-ink group-hover:text-accent transition-colors truncate pr-4">{link.title}</span>
                          <ArrowRight size={16} className="text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Back Button */}
              <div className="mt-12 pt-6 border-t border-divider no-print">
                <Link href="/people" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent transition-colors">
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