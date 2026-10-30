import { getDirectoryData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Village Directory | Bandwar Portal",
  description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
};

export default function DirectoryPage() {
  const data = getDirectoryData();

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom">
        
        {/* 🏛️ Page Header (Premium Style) */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Village Directory
          </h1>
          {/* Decorative Brand Line */}
          <div className="w-20 h-1 bg-brand mb-6 rounded-full"></div>
          
          <p className="text-lg text-muted leading-relaxed">
            Your one-stop guide to essential services in Bandwar. Find emergency numbers, doctors, local shops, and government offices quickly.
          </p>
        </div>

        {/* Client Component for Interactivity */}
        <DirectoryClient items={data.items} categories={data.categories} />
        
      </div>
    </div>
  );
}