"use client";

import { useState } from "react";
import { Search, Phone, MapPin, Clock } from "lucide-react";
import { DirectoryItem } from "@/lib/schema";

interface DirectoryClientProps {
  items: DirectoryItem[];
  categories: { id: string; title: string; icon: string }[];
}

export function DirectoryClient({ items, categories }: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* LEFT SIDEBAR: Categories */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="border border-wiki-border-light bg-wiki-bg-alt sticky top-20">
          <div className="p-3 border-b border-wiki-border-light bg-[#eaecf0]">
            <h2 className="font-bold text-wiki-text text-sm">Categories</h2>
          </div>
          <div className="flex flex-col text-sm">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-left px-4 py-2 hover:bg-wiki-bg transition-colors ${
                activeCategory === "all" ? "bg-wiki-bg font-bold text-wiki-text border-l-4 border-wiki-link" : "text-wiki-text-muted"
              }`}
            >
              All Listings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-4 py-2 hover:bg-wiki-bg transition-colors flex items-center gap-2 ${
                  activeCategory === cat.id ? "bg-wiki-bg font-bold text-wiki-text border-l-4 border-wiki-link" : "text-wiki-text-muted"
                }`}
              >
                <span>{cat.icon}</span> {cat.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT: Search & List */}
      <div className="flex-grow min-w-0">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wiki-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search for doctors, shops, addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-wiki-border focus:outline-none focus:ring-2 focus:ring-wiki-link focus:border-wiki-link bg-wiki-bg text-wiki-text"
          />
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-wiki-text-muted border border-dashed border-wiki-border-light">
              No results found. Try a different search term.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="border border-wiki-border-light bg-wiki-bg-alt p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-wiki-border transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-wiki-text">{item.name}</h3>
                    {item.isEmergency && (
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-red-200">
                        Emergency
                      </span>
                    )}
                  </div>
                  {item.description && <p className="text-[14px] text-wiki-text-muted mb-2">{item.description}</p>}
                  
                  <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-[13px] text-wiki-text">
                    {item.address && (
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-wiki-text-muted"/> {item.address}</span>
                    )}
                    {item.timing && (
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-wiki-text-muted"/> {item.timing}</span>
                    )}
                  </div>
                </div>

                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`}
                    className="shrink-0 flex items-center justify-center gap-2 bg-wiki-bg border border-wiki-border text-wiki-link px-4 py-2 hover:bg-[#eaecf0] transition-colors font-bold text-sm w-full sm:w-auto"
                  >
                    <Phone size={16} /> Call Now
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}