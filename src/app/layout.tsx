import './globals.css';

export const metadata = {
  title: 'Bandwar Archive',
  description: 'Community-built digital archive of Bandwar village.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Yahan Navbar aayega baad mein */}
        <main>{children}</main>
      </body>
    </html>
  );
}