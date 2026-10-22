import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmergencyBar } from "@/components/layout/EmergencyBar";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const merriweather = Merriweather({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  variable: "--font-fraunces",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getMasterData();

  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <head>
        {/* Flash Prevention Scripts (Font Size & Theme) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var size = localStorage.getItem('bandwar-font-size');
                if (size) document.documentElement.style.setProperty('--base-font-size', size + 'px');
                
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
      </head>
      <body className="bg-wiki-bg text-wiki-text font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0 transition-colors duration-300">
        <Header config={config} />
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer config={config} />
        <EmergencyBar config={config} />
      </body>
    </html>
  );
}