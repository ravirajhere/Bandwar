import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getMasterData } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Master.json se fonts load kar rahe hain
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  return {
    title: {
      default: config.site.name,
      template: `%s | ${config.site.name}`,
    },
    description: config.site.description,
    metadataBase: new URL(config.site.url),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Har page pe master.json ka data available hoga
  const config = getMasterData();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-[#f7f5ef] text-[#1a1a18] font-sans antialiased min-h-screen flex flex-col">
        <Header config={config} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer config={config} />
      </body>
    </html>
  );
}