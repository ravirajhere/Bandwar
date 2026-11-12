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
  const baseUrl = config.site.url;
  const defaultOgImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  const siteLanguage = config.site.language || "en-IN";
  
  return {
    title: { 
      default: "Bandwar Village Archive — Begusarai, Bihar", 
      template: "%s — Bandwar Village Archive"
    },
    description: config.seo?.defaultDescription || "Explore the history, temples, schools, and daily life of Bandwar village, Begusarai (Bihar). A community-built digital archive.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
      languages: { [siteLanguage]: "/", "x-default": "/" },
    },
    robots: {
      index: true, follow: true,
      googleBot: {
        index: true, follow: true,
        "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Bandwar Village Archive",
      locale: siteLanguage.replace("-", "_"), // en_IN format for OG
      url: baseUrl,
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description: config.seo?.defaultDescription || "A community-built digital archive of Bandwar village.",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "The Burhi Gandak river at dawn in Bandwar village, Begusarai" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description: config.seo?.defaultDescription || "A community-built digital archive of Bandwar village.",
      images: [defaultOgImage],
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: { url: "/images/brand/apple-touch-icon.png", sizes: "180x180" },
    },
    verification: {
      google: "Xy4-LAYUiew9mIskBFJOgSQR1pRRObyOjF9rkn_U8Zs",
    },
    category: "history",
    creator: "Bandwar Village Community",
    publisher: "Bandwar Village Archive",
    // 🚀 2026 SEO FIX: Apple Web App meta tags for iOS users
    appleWebApp: {
      capable: true,
      title: "Bandwar Archive",
      statusBarStyle: "default",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const siteLanguage = config.site.language || "en-IN";

  // 🚀 2026 ADVANCED JSON-LD (Entity SEO, E-E-A-T & AI Optimization)
  
  // Extract social links safely
  const socialLinks = Object.values(config.social || {}).filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Bandwar Village Archive",
        description: config.site.description,
        inLanguage: siteLanguage,
        publisher: { "@id": `${baseUrl}/#organization` },
        // 🚀 AI SEARCH CONTEXT
        about: { "@id": `${baseUrl}/#place` },
        keywords: "Bandwar, Begusarai, Bihar, Mithila, Village Archive, History",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "NGO", "CommunityOrganization"], // 🚀 Broadened Entity Types
        "@id": `${baseUrl}/#organization`,
        name: config.organization?.name || "Bandwar Village Archive",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/images/brand/bandwar-logo.svg`,
          width: 512, height: 512,
        },
        description: config.organization?.mission || config.site.description,
        foundingDate: config.organization?.foundingDate || "2024",
        email: config.contact?.email || "contact@bandwar.in", // 🚀 Added Email
        // 🚀 NEW: Verified Social Links (E-E-A-T)
        ...(socialLinks.length > 0 && { sameAs: socialLinks }),
        areaServed: { "@type": "Place", name: "Bandwar, Begusarai, Bihar, India" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: config.contact?.email || "contact@bandwar.in",
          availableLanguage: ["English", "Hindi", "Maithili"] // 🚀 Localized Support
        },
        knowsAbout: [
          "Bandwar Village History",
          "Mithila Culture",
          "Begusarai District",
          "Bihar Heritage",
          "Village Archives",
          "Folk Festivals of Bihar"
        ],
      },
      ...(config.village ? [{
        "@type": "Place",
        "@id": `${baseUrl}/#place`,
        name: config.village.name,
        alternateName: config.village.alias,
        additionalType: "https://en.wikipedia.org/wiki/Village",
        description: "Bandwar is a historic village in the Mithila region of Bihar, India, located on the banks of the Burhi Gandak river.",
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
    <html lang={siteLanguage} dir={config.site.dir || "ltr"} suppressHydrationWarning>
      <head>
        {/* 🚀 Core Web Vitals: Fonts loaded asynchronously */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
          media="print"
          // @ts-ignore
          onLoad="this.media='all'"
        />
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
        
        {/* Anti-Flicker Dark Mode Script */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('bandwar-theme')==='dark'||(!('bandwar-theme'in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}` }} />
        
        {/* Site-wide JSON-LD Schema */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
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