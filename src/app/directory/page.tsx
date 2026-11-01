import { getDirectoryData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal";
import Link from "next/link";
import { ChevronRight, Phone, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Village Directory | Bandwar Portal",
  description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
};

export default function DirectoryPage() {
  const data = getDirectoryData();

  // 🚀 Dynamic categories for the form
  const dynamicCategories = data.categories.map(c => ({ id: c.id, title: c.title }));

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Breadcrumbs (Strict & Flat) */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            Home
          </Link>
          <ChevronRight size={14} className="text-divider shrink-0" />
          <span className="text-ink font-medium">Directory</span>
        </nav>

        {/* 🏛️ Page Header (Wikipedia / GOV.UK Inspired) */}
        <div className="border-b border-divider pb-6 mb-8 md:mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="text-accent" size={28} />
              <h1 className="font-serif text-3xl md:text-4xl 3xl:text-5xl text-ink font-bold tracking-tight">
                Village Directory
              </h1>
            </div>
            
            <p className="text-base 3xl:text-lg text-ink-muted leading-relaxed max-w-2xl mt-3">
              A comprehensive, community-maintained guide to essential services in Bandwar. Locate emergency contacts, medical facilities, local shops, and government offices. 
            </p>
          </div>
          
          {/* 🚀 Action Button (Dynamic Categories passed) */}
          <div className="shrink-0 pt-1">
            <AddContentModal 
              type="directory" 
              customButtonText="Add New Entry" 
              categories={dynamicCategories}
            />
          </div>
        </div>

        {/* ⚠️ Notice Banner (Optional but professional) */}
        <div className="bg-surface border border-divider p-3 mb-8 flex items-start gap-3">
          <ShieldAlert size={18} className="text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-ink-muted m-0">
            <strong className="text-ink font-semibold">Note:</strong> Information in this directory is maintained by the village community. If you notice an incorrect phone number or address, please use the edit icon next to the listing to suggest a correction.
          </p>
        </div>

        {/* Client Component for Interactivity (Search, Filter, List) */}
        <DirectoryClient items={data.items} categories={data.categories} />
        
      </div>
    </div>
  );
}