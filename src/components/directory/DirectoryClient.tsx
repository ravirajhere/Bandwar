"use client";

import { useState } from "react";
import { Search, Phone, MapPin, Clock, X, AlertCircle, ShieldAlert } from "lucide-react";
import { DirectoryItem } from "@/lib/schema";
import { EditContactModal } from "./EditContactModal"; 

interface DirectoryClientProps {
  items: DirectoryItem[];
  categories: { id: string; title: string; icon: string }[];
}

export function DirectoryClient({ items, categories }: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 3xl:gap-12 font-sans">
      
      {/* 🏛️ Desktop Sidebar (Wikipedia / GitHub Inspired) */}
      <aside className="hidden lg:block w-60 3xl:w-72 shrink-0">
        <div className="sticky top-24">
          <h3 className="font-bold text-xs text-ink-muted uppercase tracking-wider mb-4 px-2">
            Categories
          </h3>
          <nav className="flex flex-col space-y-0.5 border-l border-divider">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-left px-4 py-2 text-sm transition-colors border-l-2 focus-visible:outline-none focus-visible:bg-surface ${
                activeCategory === "all" 
                  ? "border-accent text-accent font-semibold bg-surface" 
                  : "border-transparent text-ink-muted hover:text-ink hover:bg-surface"
              }`}
            >
              All Listings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-4 py-2 text-sm transition-colors border-l-2 flex items-center gap-2.5 focus-visible:outline-none focus-visible:bg-surface ${
                  activeCategory === cat.id 
                    ? "border-accent text-accent font-semibold bg-surface" 
                    : "border-transparent text-ink-muted hover:text-ink hover:bg-surface"
                }`}
              >
                <span className="opacity-70 text-base">{cat.icon}</span> {cat.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0">
        
        {/* 🔍 Search Bar (Strict & Flat) */}
        <div className="relative mb-6 3xl:mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            type="text"
            placeholder="Search for doctors, shops, addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 3xl:py-3.5 bg-surface border border-divider rounded-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-ink text-sm 3xl:text-base transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 📱 Mobile Categories (Strict Tabs) */}
        <div className="lg:hidden flex overflow-x-auto pb-4 mb-2 gap-2 scrollbar-hide -mx-4 px-4 snap-x">
          <button
            onClick={() => setActiveCategory("all")}
            className={`snap-start whitespace-nowrap px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeCategory === "all" ? "bg-accent text-white border-accent" : "bg-surface text-ink-muted border-divider hover:text-ink"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors border flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeCategory === cat.id ? "bg-accent text-white border-accent" : "bg-surface text-ink-muted border-divider hover:text-ink"
              }`}
            >
              <span className="opacity-80">{cat.icon}</span> {cat.title}
            </button>
          ))}
        </div>

        {/* 📇 Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-4 3xl:gap-5">
          {filteredItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-divider rounded-sm">
              <AlertCircle size={40} className="text-ink/20 mb-4" />
              <h3 className="text-lg font-bold text-ink mb-1">No records found</h3>
              <p className="text-ink-muted text-sm">
                We couldn't find any listings matching your query.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-surface border border-divider rounded-sm p-4 3xl:p-5 hover:border-accent transition-colors flex flex-col justify-between group h-full"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-bold text-base 3xl:text-lg text-ink leading-tight group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    {item.isEmergency && (
                      <span className="shrink-0 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-red-500/20 flex items-center gap-1">
                        <ShieldAlert size={10} className="3xl:w-3 3xl:h-3" />
                        Emergency
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {item.description && (
                    <p className="text-ink-muted text-[13px] 3xl:text-sm mb-3 leading-snug line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div>
                  {/* Meta Info (Address & Timing) */}
                  <div className="flex flex-col gap-1.5 text-[12px] 3xl:text-sm text-ink-muted font-medium mb-3">
                    {item.address && (
                      <span className="flex items-start gap-1.5">
                        <MapPin size={14} className="text-accent shrink-0 mt-0.5" /> 
                        <span className="leading-tight">{item.address}</span>
                      </span>
                    )}
                    {item.timing && (
                      <span className="flex items-start gap-1.5">
                        <Clock size={14} className="text-accent shrink-0 mt-0.5" /> 
                        <span className="leading-tight">{item.timing}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Area (Phone & Call Now) */}
                  {item.phone && (
                    <div className="mt-auto pt-3 border-t border-divider flex items-center justify-between gap-2">
                      {/* Phone display + Edit Button */}
                      <div className="flex items-center gap-1 text-[13px] font-semibold text-ink min-w-0">
                        <Phone size={14} className="text-ink-muted shrink-0" /> 
                        <span className="truncate">{item.phone}</span>
                        <div className="opacity-40 hover:opacity-100 transition-opacity ml-1 shrink-0">
                          <EditContactModal 
                            itemName={item.name} 
                            itemId={item.id} 
                            currentPhone={item.phone} 
                          />
                        </div>
                      </div>

                      {/* Call Button */}
                      <a 
                        href={`tel:${item.phone}`}
                        className="shrink-0 flex items-center justify-center gap-1 bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-sm transition-colors font-semibold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        Call
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}