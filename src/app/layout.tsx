import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmergencyBar } from "@/components/layout/EmergencyBar"; // 👈 Naya Import

// 1. Font Optimization (Wikipedia Style: Clean Sans + Serif Headings)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const merriweather = Merriweather({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  variable: "--font-fraunces", // Variable name same rakha hai taaki globals.css match kare
  display: "swap"
});

// 2. SEO & Viewport Configuration
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  
  return {
    title: {
      default: config.site.name,
      template: `%s | ${config.site.name}`,
    },
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
  };
}

// 3. Next.js 15 Readonly Type
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getMasterData();

  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`} suppressHydrationWarning>
      {/* 4. Wiki Classes Applied & Padding for Mobile Bar */}
      <body className="bg-wiki-bg text-wiki-text font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0">
        <Header config={config} />
        
        <main className="flex-grow w-full">
          {children}
        </main>
        
        <Footer config={config} />
        
        {/* 5. Emergency Sticky Bar (Sirf Mobile par dikhegi) */}
        <EmergencyBar config={config} />
      </body>
    </html>
  );
}