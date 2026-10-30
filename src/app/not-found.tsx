import Link from "next/link";
import { Home, Search, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-background min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      
      {/* Icon Section */}
      <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-8">
        <MapPin size={48} strokeWidth={1.5} />
      </div>

      {/* Text Section */}
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
        Page Not Found (404)
      </h1>
      
      <p className="text-lg text-muted max-w-md mx-auto mb-10 leading-relaxed">
        Lagta hai aap raste bhatak gaye hain! Yeh page exist nahi karta ya ho sakta hai iska naam badal diya gaya ho.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Home size={18} />
          Back to Home
        </Link>
        
        <Link 
          href="/section" 
          className="flex items-center gap-2 bg-card border border-border hover:bg-muted-background text-foreground px-6 py-3 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Search size={18} />
          Browse All Articles
        </Link>
      </div>
      
    </div>
  );
}