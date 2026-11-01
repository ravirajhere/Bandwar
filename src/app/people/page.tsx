import Link from "next/link";
import Image from "next/image";
import { getPeopleData } from "@/lib/data";
import { AddContentModal } from "@/components/shared/AddContentModal";
import { MapPin, User, ArrowRight } from "lucide-react"; // 👈 Clean Icons

export const metadata = {
  title: "People | Bandwar Portal",
  description: "Notable personalities, elders, and leaders from Bandwar village.",
};

export default function PeoplePage() {
  const data = getPeopleData();

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Page Header */}
        <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight text-balance">
              The People of Bandwar
            </h1>
            
            {/* Decorative Accent Line */}
            <div className="w-16 md:w-20 h-1 bg-accent mb-6 rounded-full"></div>
            
            <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
              A comprehensive record of the notable personalities, elders, leaders, and legends who have shaped our village's history, culture, and identity.
            </p>
          </div>
          
          {/* Add a Person Button */}
          <div className="shrink-0 pb-2 3xl:pb-4">
            <AddContentModal 
              type="person" 
              customButtonText="Add a Person" 
            />
          </div>
        </div>

        {/* 👥 People Directory Grid */}
        {data.people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface border border-dashed border-divider rounded-lg">
            <User size={56} className="text-ink/20 mb-4 3xl:w-16 3xl:h-16" />
            <h3 className="text-xl 3xl:text-2xl font-serif font-semibold text-ink mb-2">No profiles found</h3>
            <p className="text-ink/60 3xl:text-lg">The archive currently has no person profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-6 md:gap-8 3xl:gap-10">
            {data.people.map((person) => (
              <Link 
                href={`/people/${person.id}`} 
                key={person.id}
                className="group flex flex-col bg-surface rounded-lg border border-divider shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {/* Photo Section */}
                <div className="relative w-full aspect-[4/3] bg-canvas border-b border-divider overflow-hidden">
                  {person.photo ? (
                    <Image
                      src={person.photo.startsWith("/") ? person.photo : `/${person.photo}`}
                      alt={person.photoAlt || person.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-canvas text-ink/20">
                      <User size={64} className="3xl:w-24 3xl:h-24" />
                    </div>
                  )}
                  
                  {/* Deceased Badge */}
                  {person.deathDate && (
                    <div className="absolute top-3 right-3 bg-ink/70 backdrop-blur-md text-white text-[11px] 3xl:text-xs px-3 py-1.5 rounded uppercase tracking-wider font-semibold shadow-sm flex items-center gap-1.5 border border-white/10">
                      <span aria-hidden="true">🕊️</span> In Memoriam
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 md:p-6 3xl:p-8 flex flex-col flex-grow">
                  <div className="mb-3">
                    <h2 className="font-serif text-xl 3xl:text-2xl font-bold text-ink group-hover:text-accent transition-colors leading-tight line-clamp-1">
                      {person.name}
                    </h2>
                    
                    {/* Lifespan */}
                    {(person.dob || person.deathDate) && (
                      <p className="text-[13px] 3xl:text-sm text-ink/50 font-medium mt-1">
                        {person.dob && person.deathDate 
                          ? `${person.dob} – ${person.deathDate}` 
                          : person.dob 
                            ? `Born: ${person.dob}` 
                            : `Died: ${person.deathDate}`}
                      </p>
                    )}
                  </div>

                  {/* Roles / Titles */}
                  <p className="text-accent font-semibold text-sm 3xl:text-base mb-3 line-clamp-1">
                    {person.role}
                  </p>
                  
                  {/* Bio */}
                  <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed mb-6 line-clamp-3">
                    {person.bio}
                  </p>
                  
                  {/* Footer Info (Locality & Read More) */}
                  <div className="mt-auto pt-4 border-t border-divider flex items-center justify-between">
                    <div className="flex items-center text-sm 3xl:text-base text-ink/60 font-medium">
                      <MapPin size={16} className="mr-1.5 text-accent/70 3xl:w-5 3xl:h-5" />
                      <span className="line-clamp-1">{person.locality || "Bandwar"}</span>
                    </div>
                    
                    {/* Read More Arrow */}
                    <span className="text-accent text-sm 3xl:text-base font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight size={16} className="ml-1 3xl:w-5 3xl:h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}