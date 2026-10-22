import { getDirectoryData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

export const metadata = {
  title: "Village Directory",
  description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
};

export default function DirectoryPage() {
  const data = getDirectoryData();

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      
      {/* Page Header (Wikipedia Style) */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
          Village Directory
        </h1>
        <div className="w-full border-b border-wiki-border-light mb-3"></div>
        <p className="text-[15px] text-wiki-text-muted">
          Find essential services, shops, emergency contacts, and government offices in Bandwar.
        </p>
      </div>

      {/* Client Component for Interactivity */}
      <DirectoryClient items={data.items} categories={data.categories} />
      
    </div>
  );
}