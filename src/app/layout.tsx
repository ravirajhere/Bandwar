import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { getSearchIndex } from "@/lib/search-data"; 
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

// 🖥️ VIEWPORT: Mobile notches, TV screens, and touch scaling
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Accessibility: Allows users to zoom in if needed
  viewportFit: "cover", // Fixes edge-to-edge display on modern iPhones
};

// 🔍 SEO METADATA
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  
  return {
    title: { default: config.site.name, template: `%s | ${config.site.name}` },
    description: config.site.description,
    metadataBase: new URL(config.site.url),
    alternates: {
      canonical: "/", // Important for SEO
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: config.site.name,
      description: config.site.description,
      url: config.site.url,
      siteName: config.site.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/images/home/burhi-gandak-river-dawn-bandwar.jpg", // Fallback OG Image
          width: 1200,
          height: 630,
          alt: config.site.name,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: config.site.name,
      description: config.site.description,
      images: ["/images/home/burhi-gandak-river-dawn-bandwar.jpg"],
    },
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getMasterData();
  const searchIndex = getSearchIndex(); 

  // ==========================================
  // 🚀 ADVANCED STRUCTURED DATA (JSON-LD)
  // ==========================================
  const jsonLd = [
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
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${config.site.url}/#organization`,
      name: config.organization?.name || config.site.name,
      url: config.site.url,
      logo: `${config.site.url}/icon.png`,
      description: config.site.description,
      ...(config.organization?.foundingDate && { foundingDate: config.organization.foundingDate }),
      ...(config.contact?.email && { email: config.contact.email }),
      sameAs: [
        config.social?.github,
        config.social?.instagram,
        config.social?.twitter,
        config.social?.youtube
      ].filter((link): link is string => Boolean(link))
    },
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
    <html lang={config.site.language || "en-IN"} suppressHydrationWarning>
      <head>
        {/* Fonts Loading with Display Swap for Zero Layout Shift */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />

        {/* Anti-Flicker Dark Mode Script */}
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
        
        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      {/* 
        🏛️ BODY STYLES:
        - bg-canvas & text-ink: Naye design tokens
        - min-h-screen flex flex-col: Ensures footer sticks to bottom
      */}
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col transition-colors duration-300 selection:bg-accent selection:text-white">
        
        <ToastProvider>
          {/* Skip to Content Link (Accessibility) */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-accent focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/50 transition-all font-medium"
          >
            Skip to main content
          </a>

          <Header config={config} searchIndex={searchIndex} />
          
          {/* 
            🏛️ MAIN LAYOUT WRAPPER:
            - The <main> tag handles the flex-grow to push footer down.
            - Inner div uses our custom Tailwind container (max-width 1440px on TV) 
              to keep content readable and centered, avoiding stretched text on big screens.
          */}
          <main id="main-content" className="flex-grow w-full outline-none" tabIndex={-1}>
            <div className="container mx-auto py-6 md:py-8 lg:py-10">
              {children}
            </div>
          </main>
          
          <Footer config={config} />
        </ToastProvider>
        
      </body>
    </html>
  );
}