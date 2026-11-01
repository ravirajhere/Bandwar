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
    <div className="flex flex-col lg:flex-row gap-8 3xl:gap-12">
      
      {/* 🏛️ Desktop Sidebar Categories */}
      <aside className="hidden lg:block w-64 3xl:w-72 shrink-0">
        <div className="bg-surface border border-divider rounded-lg shadow-sm sticky top-24 overflow-hidden">
          <div className="p-4 border-b border-divider bg-canvas/50">
            <h2 className="font-serif font-semibold text-ink text-lg">Categories</h2>
          </div>
          <div className="flex flex-col p-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-left px-4 py-2.5 rounded-md text-[15px] transition-colors mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeCategory === "all" 
                  ? "bg-canvas font-semibold text-accent border border-divider shadow-sm" 
                  : "text-ink/70 hover:bg-canvas hover:text-ink font-medium border border-transparent"
              }`}
            >
              All Listings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-4 py-2.5 rounded-md text-[15px] transition-colors flex items-center gap-3 mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  activeCategory === cat.id 
                    ? "bg-canvas font-semibold text-accent border border-divider shadow-sm" 
                    : "text-ink/70 hover:bg-canvas hover:text-ink font-medium border border-transparent"
                }`}
              >
                <span className="text-lg">{cat.icon}</span> {cat.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0">
        
        {/* 🔍 Search Bar */}
        <div className="relative mb-6 3xl:mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20} />
          <input
            type="text"
            placeholder="Search for doctors, shops, addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 3xl:py-4 bg-surface border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-ink text-base 3xl:text-lg shadow-sm transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 📱 Mobile/Tablet Categories (Horizontal Scroll) */}
        <div className="lg:hidden flex overflow-x-auto pb-4 mb-2 gap-2 scrollbar-hide -mx-4 px-4 snap-x">
          <button
            onClick={() => setActiveCategory("all")}
            className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeCategory === "all" ? "bg-accent text-white border-accent" : "bg-surface text-ink/80 border-divider"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeCategory === cat.id ? "bg-accent text-white border-accent" : "bg-surface text-ink/80 border-divider"
              }`}
            >
              <span>{cat.icon}</span> {cat.title}
            </button>
          ))}
        </div>

        {/* 📇 Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-4 3xl:gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-divider rounded-lg">
              <AlertCircle size={40} className="text-ink/30 mb-4" />
              <h3 className="text-lg font-semibold text-ink mb-1">No records found</h3>
              <p className="text-ink/60 text-sm md:text-base">
                We couldn't find any listings matching your query.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-surface border border-divider rounded-lg p-5 3xl:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-full"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif font-bold text-lg 3xl:text-xl text-ink leading-tight group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    {item.isEmergency && (
                      <span className="shrink-0 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] 3xl:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-red-500/20 flex items-center gap-1.5">
                        <ShieldAlert size={12} className="3xl:w-4 3xl:h-4" />
                        Emergency
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {item.description && (
                    <p className="text-ink/70 text-sm 3xl:text-base mb-4 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div>
                  {/* Meta Info (Address & Timing) */}
                  <div className="flex flex-col gap-2 text-[13px] 3xl:text-sm text-ink/60 font-medium mb-4">
                    {item.address && (
                      <span className="flex items-start gap-2">
                        <MapPin size={16} className="text-accent shrink-0 mt-0.5 3xl:w-5 3xl:h-5"/> 
                        <span>{item.address}</span>
                      </span>
                    )}
                    {item.timing && (
                      <span className="flex items-start gap-2">
                        <Clock size={16} className="text-accent shrink-0 mt-0.5 3xl:w-5 3xl:h-5"/> 
                        <span>{item.timing}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Area (Phone & Call Now) */}
                  {item.phone && (
                    <div className="mt-auto pt-4 border-t border-divider flex items-center justify-between gap-2">
                      {/* Phone display + Edit Button */}
                      <div className="flex items-center gap-1 text-sm 3xl:text-base font-semibold text-ink">
                        <Phone size={14} className="text-accent/70 shrink-0" /> 
                        <span className="truncate">{item.phone}</span>
                        <div className="opacity-50 hover:opacity-100 transition-opacity ml-1">
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
                        className="shrink-0 flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md transition-all shadow-sm font-semibold text-[13px] 3xl:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        <Phone size={14} /> Call
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