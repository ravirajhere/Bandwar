import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { getSearchIndex } from "@/lib/search-data"; 
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmergencyBar } from "@/components/layout/EmergencyBar";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap"
});

// 🏛️ Senior POV: Dynamic Theme Color (Mobile Status Bar)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  
  return {
    title: { default: config.site.name, template: `%s | ${config.site.name}` },
    description: config.site.description,
    metadataBase: new URL(config.site.url),
    openGraph: {
      title: config.site.name,
      description: config.site.description,
      url: config.site.url,
      siteName: config.site.name,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.site.name,
      description: config.site.description,
    },
    // 2026 Standard: Add basic icons for browsers
    icons: {
      icon: "/favicon.ico",
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getMasterData();
  const searchIndex = getSearchIndex(); 

  // 🔍 2026 SEO: JSON-LD Structured Data for AI & Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.site.name,
    url: config.site.url,
    description: config.site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${config.site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    // en-IN batata hai ki yeh Indian English context hai
    <html lang="en-IN" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Theme Flash Prevention Script (Saves user preference) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('bandwar-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0 transition-colors duration-300">
        
        {/* ♿ Senior Accessibility: Skip to Content Link (Hidden visually, visible on keyboard Tab) */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg transition-all"
        >
          Skip to main content
        </a>

        <Header config={config} searchIndex={searchIndex} />
        
        {/* id="main-content" is used by the Skip link. tabIndex={-1} allows focus */}
        <main id="main-content" className="flex-grow w-full outline-none" tabIndex={-1}>
          {children}
        </main>
        
        <Footer config={config} />
        
        <EmergencyBar config={config} />
      </body>
    </html>
  );
}