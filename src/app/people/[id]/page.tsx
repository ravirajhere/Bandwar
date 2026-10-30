import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPeopleData } from "@/lib/data";
import { Metadata } from "next";

// ==========================================
// 1. Generate Static Params (For SSG)
// ==========================================
export async function generateStaticParams() {
  const data = getPeopleData();
  return data.people.map((person) => ({
    id: person.id,
  }));
}

// ==========================================
// 2. Dynamic SEO Metadata (2026 Standard)
// ==========================================
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = getPeopleData();
  const person = data.people.find((p) => p.id === id);

  if (!person) {
    return { title: "Person Not Found | Bandwar Portal" };
  }

  return {
    title: `${person.name} | People of Bandwar`,
    description: person.bio.substring(0, 160), // First 160 chars for SEO
    openGraph: {
      title: `${person.name} - ${person.role}`,
      description: person.bio.substring(0, 160),
      images: person.photo ? [{ url: person.photo }] : [],
    },
  };
}

// ==========================================
// 3. Main Page Component
// ==========================================
export default async function PersonProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getPeopleData();
  const person = data.people.find((p) => p.id === id);

  if (!person) {
    notFound(); // Renders the custom 404 page
  }

  // Check if person is deceased
  const isDeceased = !!person.deathDate;

  return (
    <div className="bg-background min-h-screen py-10 md:py-16">
      <div className="container-custom">
        
        {/* 🧭 Breadcrumbs */}
        <nav className="mb-8 text-sm text-muted flex items-center gap-2 no-print">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <Link href="/people" className="hover:text-brand transition-colors">People</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{person.name}</span>
        </nav>

        {/* 🏛️ Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ==========================================
              LEFT COLUMN: Sticky Infobox (Desktop)
             ========================================== */}
          <aside className="lg:col-span-4 order-2 lg:order-1 no-print">
            <div className="lg:sticky lg:top-24 bg-card border border-border rounded-xl shadow-card overflow-hidden">
              
              {/* Photo Section */}
              <div className="relative w-full aspect-square bg-muted-background">
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={person.photoAlt || person.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted">
                    <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                
                {isDeceased && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span>🕊️</span> In Memoriam
                  </div>
                )}
              </div>

              {/* Quick Info (Infobox Style) */}
              <div className="p-6">
                <h2 className="font-serif text-2xl text-foreground mb-1 leading-tight">
                  {person.name}
                </h2>
                <p className="text-brand font-medium text-sm mb-6 pb-4 border-b border-border-subtle">
                  {person.role}
                </p>

                <dl className="space-y-4 text-sm">
                  {person.dob || person.deathDate ? (
                    <div>
                      <dt className="text-muted font-medium mb-1">Lifespan</dt>
                      <dd className="text-foreground">
                        {person.dob && person.deathDate 
                          ? `${person.dob} – ${person.deathDate}` 
                          : person.dob 
                            ? `Born: ${person.dob}` 
                            : `Died: ${person.deathDate}`}
                      </dd>
                    </div>
                  ) : null}

                  {person.birthplace && (
                    <div>
                      <dt className="text-muted font-medium mb-1">Birthplace</dt>
                      <dd className="text-foreground">{person.birthplace}</dd>
                    </div>
                  )}

                  {person.locality && (
                    <div>
                      <dt className="text-muted font-medium mb-1">Locality</dt>
                      <dd className="text-foreground flex items-center gap-1">
                        <span className="text-brand">📍</span> {person.locality}
                      </dd>
                    </div>
                  )}

                  {person.titles && person.titles.length > 0 && (
                    <div>
                      <dt className="text-muted font-medium mb-2">Titles</dt>
                      <dd className="flex flex-wrap gap-2">
                        {person.titles.map((title, idx) => (
                          <span key={idx} className="bg-brand/10 text-brand px-2.5 py-1 rounded-md text-xs font-medium">
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

          {/* ==========================================
              RIGHT COLUMN: Biography & Journey
             ========================================== */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            
            {/* Header for Mobile */}
            <div className="mb-8 lg:mb-10">
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold">
                {person.name}
              </h1>
              <p className="text-xl text-brand font-medium">{person.role}</p>
            </div>

            {/* Biography */}
            <section className="mb-12">
              <h3 className="text-2xl font-serif text-foreground mb-4 border-b border-border pb-2">
                Biography
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                <p>{person.bio}</p>
              </div>
            </section>

            {/* Journey / Life Story (If available) */}
            {person.journey && (
              <section className="mb-12">
                <h3 className="text-2xl font-serif text-foreground mb-4 border-b border-border pb-2">
                  Unki Kahani (Life Journey)
                </h3>
                <div className="bg-card border-l-4 border-brand p-6 rounded-r-xl shadow-sm">
                  <p className="text-lg leading-relaxed text-foreground/90 italic">
                    "{person.journey}"
                  </p>
                </div>
              </section>
            )}

            {/* Tags */}
            {person.tags && person.tags.length > 0 && (
              <section className="mt-16 pt-6 border-t border-border-subtle">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted mr-2 font-medium">Tags:</span>
                  {person.tags.map((tag, idx) => (
                    <span key={idx} className="bg-muted-background text-foreground/70 px-3 py-1 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Back Button */}
            <div className="mt-12 no-print">
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