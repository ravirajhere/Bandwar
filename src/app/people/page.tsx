import Link from "next/link";
import Image from "next/image";
import { getPeopleData } from "@/lib/data";
import { AddContentModal } from "@/components/shared/AddContentModal"; // 👈 Naya Import

export const metadata = {
  title: "People | Bandwar Portal",
  description: "Notable personalities, elders, and leaders from Bandwar village.",
};

export default function PeoplePage() {
  const data = getPeopleData();

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container-custom">
        
        {/* 🏛️ Page Header (Updated with Flex Layout for Add Button) */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold">
              The People of Bandwar
            </h1>
            <div className="w-20 h-1 bg-brand mb-6 rounded-full"></div>
            <p className="text-lg text-muted leading-relaxed">
              A record of the notable personalities, elders, leaders, and legends who have shaped our village's history, culture, and identity.
            </p>
          </div>
          
          {/* 👇 Yahan "Add a Person" button add kiya hai 👇 */}
          <div className="shrink-0 pb-2">
            <AddContentModal 
              type="person" 
              customButtonText="Add a Person" 
            />
          </div>
        </div>

        {/* 👥 People Directory Grid (Premium Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {data.people.map((person) => (
            <Link 
              href={`/people/${person.id}`} 
              key={person.id}
              className="group flex flex-col bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
            >
              {/* Photo Section */}
              <div className="relative w-full aspect-[4/3] bg-muted-background overflow-hidden">
                {person.photo ? (
                  <Image
                    src={person.photo.startsWith("/") ? person.photo : `/${person.photo}`}
                    alt={person.photoAlt || person.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand/5 text-brand/30">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                
                {/* Deceased Badge (Agar deathDate hai toh) */}
                {person.deathDate && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md font-medium tracking-wide flex items-center gap-1">
                    <span>🕊️</span> In Memoriam
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-2">
                  <h2 className="font-serif text-2xl text-foreground group-hover:text-brand transition-colors leading-tight">
                    {person.name}
                  </h2>
                  
                  {/* Lifespan (DOB - DeathDate) */}
                  {(person.dob || person.deathDate) && (
                    <p className="text-sm text-muted font-medium mt-1">
                      {person.dob && person.deathDate 
                        ? `${person.dob} – ${person.deathDate}` 
                        : person.dob 
                          ? `Born: ${person.dob}` 
                          : `Died: ${person.deathDate}`}
                    </p>
                  )}
                </div>

                {/* Roles / Titles */}
                <p className="text-brand font-semibold text-sm mb-4 line-clamp-1">
                  {person.role}
                </p>
                
                {/* Bio (Truncated to keep cards equal height) */}
                <p className="text-foreground/80 text-base leading-relaxed mb-6 line-clamp-3">
                  {person.bio}
                </p>
                
                {/* Footer Info (Locality & Tags) */}
                <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted">
                    <svg className="w-4 h-4 mr-1.5 text-brand/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {person.locality || "Bandwar"}
                  </div>
                  
                  {/* Read More Arrow */}
                  <span className="text-brand text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Read Story <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}