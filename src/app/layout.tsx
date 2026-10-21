import localFont from 'next/font/local';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

// Font Optimization (No more <link rel="preload">)
const inter = localFont({ src: '../../public/fonts/inter.woff2', variable: '--font-inter' });
const fraunces = localFont({ src: '../../public/fonts/fraunces.woff2', variable: '--font-fraunces' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}