import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0D0B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const defaultOgImage = config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg";
  
  return {
    title: { 
      default: "Bandwar Village Archive — Begusarai, Bihar", 
      template: "%s — Bandwar Village Archive"
    },
    description: config.seo?.defaultDescription || config.site.description,
    metadataBase: new URL(config.site.url),
    robots: {
      index: true, follow: true,
      googleBot: {
        index: true, follow: true,
        "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1,
      },
    },
    openGraph: {
      siteName: "Bandwar Village Archive",
      locale: "en_IN",
      type: "website",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "The Burhi Gandak river at dawn in Bandwar village, Begusarai" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [defaultOgImage],
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: { url: "/images/brand/apple-touch-icon.png", sizes: "180x180" },
    },
    verification: {
      google: config.seo?.verification?.google || undefined,
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getMasterData();
  const baseUrl = config.site.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Bandwar Village Archive",
        description: config.site.description,
        inLanguage: "en-IN",
        publisher: { "@id": `${baseUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "NGO"],
        "@id": `${baseUrl}/#organization`,
        name: config.organization?.name || "Bandwar Village Archive",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/images/brand/bandwar-logo.svg`,
          width: 512, height: 512,
        },
        description: config.organization?.mission || config.site.description,
        foundingDate: "2024",
        areaServed: { "@type": "Place", name: "Bandwar, Begusarai, Bihar, India" },
      },
      ...(config.village ? [{
        "@type": "Place",
        "@id": `${baseUrl}/#place`,
        name: config.village.name,
        alternateName: config.village.alias,
        additionalType: "https://en.wikipedia.org/wiki/Village",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bandwar",
          addressRegion: "Bihar",
          postalCode: config.village.pincode || "851131",
          addressCountry: "IN", 
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: config.village.coordinates?.lat || 25.5009,
          longitude: config.village.coordinates?.lng || 86.1606,
        },
        containedInPlace: [
          { "@type": "AdministrativeArea", name: "Begusarai district" },
          { "@type": "State", name: "Bihar" },
          { "@type": "Country", name: "India" },
        ],
      }] : [])
    ]
  };

  const fontStyles = `
    :root {
      --font-inter: 'Inter', sans-serif;
      --font-fraunces: 'Fraunces', serif;
      --font-jetbrains: 'JetBrains Mono', monospace;
    }
  `;

  return (
    <html lang={config.site.language || "en-IN"} dir={config.site.dir || "ltr"} suppressHydrationWarning>
      <head>
        {/* 🚀 FIX: Google Fonts Non-Blocking Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
          media="print" 
          // @ts-ignore
          onLoad="this.media='all'" 
        />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        </noscript>
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
        
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('bandwar-theme')==='dark'||(!('bandwar-theme'in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-modal focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-sm font-medium text-sm shadow-md">
          Skip to main content
        </a>
        <ToastProvider>
          <Header />
          <main id="main-content" className="flex-grow w-full outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}