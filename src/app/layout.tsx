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
  axes: ["SOFT", "WONK"], // Fraunces signature axes
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
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('bandwar-theme') === 'dark' || (!('bandwar-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-modal focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-sm font-medium text-sm">
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