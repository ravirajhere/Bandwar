import Link from "next/link";
import { Home, Search, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-canvas min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 3xl:py-32 text-center">
      
      {/* 🏛️ Icon Section (Formal Archive Seal) */}
      <div className="w-24 h-24 3xl:w-32 3xl:h-32 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mb-8 shadow-sm">
        <MapPin size={48} strokeWidth={1.5} className="3xl:w-16 3xl:h-16" />
      </div>

      {/* 📝 Text Section */}
      <h1 className="font-serif text-4xl md:text-5xl 3xl:text-7xl font-bold text-ink mb-4 tracking-tight">
        Page Not Found <span className="text-ink/30">(404)</span>
      </h1>
      
      <p className="text-base md:text-lg 3xl:text-xl text-ink/70 max-w-md 3xl:max-w-xl mx-auto mb-10 leading-relaxed text-pretty">
        The page you are looking for does not exist in this archive, or it may have been moved to a different location.
      </p>

      {/* 🔘 Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md font-semibold transition-all shadow-sm w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Home size={18} className="3xl:w-5 3xl:h-5" />
          Return to Home
        </Link>
        
        <Link 
          href="/section" 
          className="flex items-center justify-center gap-2 bg-surface border border-divider hover:bg-canvas text-ink px-8 py-3.5 rounded-md font-semibold transition-all shadow-sm w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Search size={18} className="3xl:w-5 3xl:h-5" />
          Browse the Archive
        </Link>
      </div>
      
    </div>
  );
}