import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-wiki-bg">
      
      {/* Big 404 Text */}
      <h1 className="font-serif text-7xl md:text-9xl text-wiki-text mb-4">
        404
      </h1>
      
      {/* Wikipedia style separator line */}
      <div className="w-24 h-px bg-wiki-border-light mb-6"></div>
      
      {/* Text Content */}
      <h2 className="font-serif text-2xl text-wiki-text mb-4">
        Page not found
      </h2>
      <p className="text-[15px] text-wiki-text-muted max-w-md mb-8 leading-relaxed">
        The page you are looking for isn't here. It may have been moved, or the link may be incorrect. Please check the URL or return to the homepage.
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link 
          href="/" 
          className="bg-wiki-link text-white px-6 py-2.5 font-bold text-[15px] hover:bg-blue-800 transition-colors"
        >
          Return to Homepage
        </Link>
        <Link 
          href="/section" 
          className="bg-wiki-bg border border-wiki-border-light text-wiki-text hover:bg-wiki-bg-alt px-6 py-2.5 font-bold text-[15px] transition-colors"
        >
          Browse the Archive
        </Link>
      </div>

    </div>
  );
}