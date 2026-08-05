import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { template: '%s | CineVault', default: 'CineVault — Discover Movies & TV Shows' },
  description: 'Your ultimate destination for movies, TV shows, and celebrity profiles. Rate, review, and discover your next favorite.',
  keywords: ['movies', 'TV shows', 'reviews', 'ratings', 'celebrities', 'IMDb'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject data-* attributes into <body> after SSR, which would otherwise cause hydration mismatches */}
      <body suppressHydrationWarning className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
