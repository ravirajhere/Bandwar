import { getDirectoryData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal"; // 👈 Naya Import

export const metadata: Metadata = {
  title: "Village Directory | Bandwar Portal",
  description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
};

export default function DirectoryPage() {
  const data = getDirectoryData();

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom">
        
        {/* 🏛️ Page Header (Updated with Flex Layout for Add Button) */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
              Village Directory
            </h1>
            {/* Decorative Brand Line */}
            <div className="w-20 h-1 bg-brand mb-6 rounded-full"></div>
            
            <p className="text-lg text-muted leading-relaxed">
              Your one-stop guide to essential services in Bandwar. Find emergency numbers, doctors, local shops, and government offices quickly.
            </p>
          </div>
          
          {/* 👇 Yahan "Add New Entry" button add kiya hai 👇 */}
          <div className="shrink-0 pb-2">
            <AddContentModal 
              type="directory" 
              customButtonText="Add New Entry" 
            />
          </div>
        </div>

        {/* Client Component for Interactivity */}
        <DirectoryClient items={data.items} categories={data.categories} />
        
      </div>
    </div>
  );
}