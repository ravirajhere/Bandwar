import { getPeopleData } from "@/lib/data";

export const metadata = {
  title: "People | Bandwar Portal",
  description: "Notable personalities, elders, and leaders from Bandwar village.",
};

export default function PeoplePage() {
  const data = getPeopleData();

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            The People of Bandwar
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            A record of the notable personalities, elders, and leaders who have shaped the village's history and identity.
          </p>
        </div>

        {/* People Directory Grid (No Photos, Text Focus) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.people.map((person) => (
            <div 
              key={person.id} 
              className="border border-wiki-border-light bg-wiki-bg-alt p-4 flex flex-col hover:border-wiki-border hover:bg-wiki-bg transition-colors"
            >
              
              {/* Info Area */}
              <h2 className="font-serif text-xl text-wiki-text mb-1 leading-tight">
                {person.name}
              </h2>
              
              <p className="text-wiki-link font-bold text-[13px] mb-3">
                {person.role}
              </p>
              
              <p className="text-wiki-text text-[14px] leading-relaxed mb-4 flex-grow">
                {person.bio}
              </p>
              
              {/* Locality (Like a Wiki field) */}
              <div className="mt-auto pt-2 border-t border-wiki-border-light text-[12px] text-wiki-text-muted flex items-center gap-1.5">
                <span aria-hidden="true">📍</span> {person.locality}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}