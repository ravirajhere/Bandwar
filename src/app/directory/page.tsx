import { getDirectoryData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal";

export const metadata: Metadata = {
  title: "Village Directory | Bandwar Portal",
  description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
};

export default function DirectoryPage() {
  const data = getDirectoryData();

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Page Header */}
        <div className="mb-10 3xl:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight text-balance">
              Village Directory
            </h1>
            
            {/* Decorative Accent Line */}
            <div className="w-16 md:w-20 h-1 bg-accent mb-6 rounded-full"></div>
            
            <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
              Your comprehensive guide to essential services in Bandwar. Locate emergency numbers, medical facilities, local shops, and government offices efficiently.
            </p>
          </div>
          
          {/* Add New Entry Button */}
          <div className="shrink-0 pb-2 3xl:pb-4">
            <AddContentModal 
              type="directory" 
              customButtonText="Add New Entry" 
            />
          </div>
        </div>

        {/* Client Component for Interactivity (Search, Filter, List) */}
        <DirectoryClient items={data.items} categories={data.categories} />
        
      </div>
    </div>
  );
}