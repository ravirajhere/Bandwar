import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// 1. Font Optimization with display: "swap" (Performance Expert Approved)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-fraunces",
  display: "swap"
});

// 2. SEO & Viewport Configuration (SEO Expert Approved)
export const viewport: Viewport = {
  themeColor: "#f7f5ef",
  width: "device-width",
  initialScale: 1,
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
    // OpenGraph for WhatsApp/Facebook sharing
    openGraph: {
      title: config.site.name,
      description: config.site.description,
      url: config.site.url,
      siteName: config.site.name,
      locale: "en_IN",
      type: "website",
    },
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: config.site.name,
      description: config.site.description,
    },
  };
}

// 3. Next.js 15 Readonly Type (TypeScript Expert Approved)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getMasterData();

  return (
    // suppressHydrationWarning prevents console errors from browser extensions
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      {/* 4. Using Custom Tailwind Classes instead of Hardcoded Hex (Architect Approved) */}
      <body className="bg-paper text-primary font-sans antialiased min-h-screen flex flex-col">
        <Header config={config} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer config={config} />
      </body>
    </html>
  );
}