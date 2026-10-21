import Image from "next/image";
import { getPeopleData } from "@/lib/data";

export const metadata = {
  title: "People | Bandwar Archive",
  description: "Notable personalities, elders, and leaders from Bandwar village.",
};

export default function PeoplePage() {
  const data = getPeopleData();

  return (
    <div className="bg-[#f7f5ef] min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-4">
            The People of Bandwar
          </h1>
          <p className="text-lg text-[#1a1a18]/60 max-w-2xl mx-auto">
            A record of the notable personalities, elders, and leaders who have shaped the village's history and identity.
          </p>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.people.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl border border-[#1a1a18]/10 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              
              {/* Photo Area */}
              <div className="relative aspect-[4/5] bg-[#efece4] overflow-hidden">
                {person.photo ? (
                  <Image
                    src={`/${person.photo}`}
                    alt={person.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#1a1a18]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
                {/* Locality Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#1a1a18] shadow-sm">
                  📍 {person.locality}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6">
                <h2 className="font-serif text-2xl font-bold text-[#1a1a18] mb-1 group-hover:text-[#1f3d2f] transition-colors">
                  {person.name}
                </h2>
                <p className="text-[#a64b2a] font-medium text-sm mb-4">
                  {person.role}
                </p>
                <p className="text-[#1a1a18]/70 text-sm leading-relaxed">
                  {person.bio}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}