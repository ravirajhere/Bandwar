import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

// 🚀 Vercel Inspiration: next/font for Zero Layout Shift & Performance
const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#101418" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allows zoom for accessibility
  viewportFit: "cover", // Fixes edge-to-edge display on modern iPhones
};

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  
  return {
    title: { 
      default: config.site.name, 
      template: `%s | ${config.site.name}` 
    },
    description: config.site.description,
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
          url: "/images/home/burhi-gandak-river-dawn-bandwar.jpg",
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
    },
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getMasterData();

  // 🚀 Wikipedia/Meta Inspiration: Structured Data (JSON-LD)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${config.site.url}/#website`,
      url: config.site.url,
      name: config.site.name,
      description: config.site.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${config.site.url}/#organization`,
      name: config.organization?.name || config.site.name,
      url: config.site.url,
      logo: `${config.site.url}/icon.png`,
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
      }
    }] : [])
  ];

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Anti-Flicker Dark Mode Script (Standard in Vercel/Next.js) */}
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
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col">
        
        {/* 🚀 GitHub/GOV.UK Inspiration: Skip to Content (Accessibility) */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-modal focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-sm focus:shadow-md transition-all font-medium text-sm"
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