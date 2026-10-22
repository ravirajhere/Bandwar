import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google"; // 👈 Fraunces replaced with Merriweather
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// 1. Font Optimization (Wikipedia Style: Clean Sans + Serif Headings)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const merriweather = Merriweather({ 
  subsets: ["latin"], 
  weight: ["400", "700"], // Wikipedia headings are mostly normal or bold
  variable: "--font-fraunces", // Variable name same rakha hai taaki globals.css mein change na karna pade
  display: "swap"
});

// 2. SEO & Viewport Configuration
export const viewport: Viewport = {
  themeColor: "#ffffff", // 👈 Changed to White for Wikipedia look
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Accessibility: Seniors ko zoom karne ki permission
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
      {/* 4. Wiki Classes Applied */}
      <body className="bg-wiki-bg text-wiki-text font-sans antialiased min-h-screen flex flex-col">
        <Header config={config} />
        {/* Wikipedia articles need full width for the 3-column layout */}
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer config={config} />
      </body>
    </html>
  );
}