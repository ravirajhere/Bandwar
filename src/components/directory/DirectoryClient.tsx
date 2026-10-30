"use client";

import { useState } from "react";
import { Search, Phone, MapPin, Clock, X, AlertCircle } from "lucide-react";
import { DirectoryItem } from "@/lib/schema";
import { EditContactModal } from "./EditContactModal"; // 👈 Import kiya

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
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* Desktop Sidebar Categories */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="bg-card border border-border rounded-xl shadow-sm sticky top-24 overflow-hidden">
          <div className="p-4 border-b border-border bg-muted-background">
            <h2 className="font-serif font-semibold text-foreground">Categories</h2>
          </div>
          <div className="flex flex-col p-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-left px-4 py-2.5 rounded-lg text-[15px] transition-colors mb-1 ${
                activeCategory === "all" 
                  ? "bg-brand/10 font-bold text-brand" 
                  : "text-foreground/70 hover:bg-muted-background hover:text-foreground font-medium"
              }`}
            >
              All Listings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-[15px] transition-colors flex items-center gap-3 mb-1 ${
                  activeCategory === cat.id 
                    ? "bg-brand/10 font-bold text-brand" 
                    : "text-foreground/70 hover:bg-muted-background hover:text-foreground font-medium"
                }`}
              >
                <span className="text-lg">{cat.icon}</span> {cat.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow min-w-0">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Search for doctors, shops, addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand text-foreground text-lg shadow-sm transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden flex overflow-x-auto pb-4 mb-2 gap-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === "all" ? "bg-brand text-white border-brand" : "bg-card text-foreground border-border"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                activeCategory === cat.id ? "bg-brand text-white border-brand" : "bg-card text-foreground border-border"
              }`}
            >
              <span>{cat.icon}</span> {cat.title}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border border-dashed border-border rounded-xl">
              <AlertCircle size={40} className="text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
              <p className="text-muted">We couldn't find anything matching "{searchQuery}".</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-serif font-bold text-xl text-foreground">{item.name}</h3>
                    {item.isEmergency && (
                      <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-red-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Emergency
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-foreground/70 text-base mb-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-sm text-muted font-medium mb-1">
                    {item.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-brand/70"/> {item.address}
                      </span>
                    )}
                    {item.timing && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={16} className="text-brand/70"/> {item.timing}
                      </span>
                    )}
                  </div>

                  {/* 🚀 NAYA: Phone Number with Edit Button */}
                  {item.phone && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground bg-muted-background border border-border-subtle px-3 py-1.5 rounded-lg">
                      <Phone size={14} className="text-brand" /> 
                      {item.phone}
                      {/* Pencil Button */}
                      <EditContactModal itemName={item.name} currentPhone={item.phone} />
                    </div>
                  )}
                </div>

                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`}
                    className="shrink-0 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow font-semibold text-base w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <Phone size={18} /> Call Now
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