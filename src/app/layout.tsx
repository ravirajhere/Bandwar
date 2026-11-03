import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

// 🚀 BANDWAR IDENTITY: Signature Typefaces
const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-inter" 
});

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

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

// 🚀 SENIOR SEO: Complete Metadata Setup
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const defaultOgImage = config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg";
  
  return {
    title: { 
      default: config.seo?.titlePatternHome?.replace("{siteName}", config.site.name) || config.site.name, 
      template: config.seo?.titlePattern?.replace("{site}", config.site.name) || `%s | ${config.site.name}`
    },
    description: config.seo?.defaultDescription || config.site.description,
    metadataBase: new URL(config.site.url),
    alternates: {
      canonical: "/",
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
      description: config.seo?.defaultDescription || config.site.description,
      url: config.site.url,
      siteName: config.site.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: defaultOgImage,
          width: config.seo?.ogImageWidth || 1200,
          height: config.seo?.ogImageHeight || 630,
          alt: config.site.name,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.site.name,
      description: config.seo?.defaultDescription || config.site.description,
      images: [defaultOgImage],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/images/brand/apple-touch-icon.png",
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getMasterData();

  // 🚀 SENIOR SEO: Structured Data (JSON-LD) for Google
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${config.site.url}/#website`,
      url: config.site.url,
      name: config.site.name,
      description: config.site.description,
      publisher: { "@id": `${config.site.url}/#organization` }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${config.site.url}/#organization`,
      name: config.organization?.name || config.site.name,
      url: config.site.url,
      logo: `${config.site.url}${config.brand?.logo?.primary || "/icon.png"}`,
      description: config.organization?.mission || config.site.description,
      ...(config.organization?.foundingDate && { foundingDate: config.organization.foundingDate }),
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
    <html 
      lang={config.site.language || "en-IN"} 
      suppressHydrationWarning 
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Anti-Flicker Dark Mode Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('bandwar-theme') === 'dark' || (!('bandwar-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        
        {/* 🚀 JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col">
        
        {/* Accessibility Skip Link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-modal focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-sm font-medium text-sm shadow-md"
        >
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