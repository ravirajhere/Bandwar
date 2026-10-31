import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { getSearchIndex } from "@/lib/search-data"; 
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

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
    icons: {
      icon: "/icon.png", // Update: icon.png use kiya hai jo humne src/app me daala tha
      apple: "/icon.png",
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getMasterData();
  const searchIndex = getSearchIndex(); 

  // ==========================================
  // 🚀 2026 SEO: Advanced Structured Data (JSON-LD)
  // ==========================================
  const jsonLd = [
    // 1. Website Schema (Search Action)
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${config.site.url}/#website`,
      url: config.site.url,
      name: config.site.name,
      description: config.site.description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${config.site.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    // 2. Organization Schema (Portal Identity)
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${config.site.url}/#organization`,
      name: config.organization?.name || config.site.name,
      url: config.site.url,
      logo: `${config.site.url}/icon.png`,
      description: config.site.description,
      foundingDate: config.organization?.foundingDate,
      email: config.contact?.email,
      sameAs: [
        config.social?.github
      ].filter(Boolean) // Khali links ko hata dega
    },
    // 3. Place Schema (Village Location for Local SEO)
    ...(config.village ? [{
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": `${config.site.url}/#place`,
      name: config.village.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: config.village.name,
        addressRegion: config.village.state,
        postalCode: config.village.pincode,
        addressCountry: config.village.country
      },
      ...(config.village.coordinates && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: config.village.coordinates.lat,
          longitude: config.village.coordinates.lng
        }
      })
    }] : [])
  ];

  return (
    <html lang="en-IN" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Theme Flash Prevention Script */}
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
        
        {/* 🚀 Advanced JSON-LD Schema Array */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      <body className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
        
        <ToastProvider>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg transition-all"
          >
            Skip to main content
          </a>

          <Header config={config} searchIndex={searchIndex} />
          
          <main id="main-content" className="flex-grow w-full outline-none" tabIndex={-1}>
            {children}
          </main>
          
          <Footer config={config} />
        </ToastProvider>
        
      </body>
    </html>
  );
}