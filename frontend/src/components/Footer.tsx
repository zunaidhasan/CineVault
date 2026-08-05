import Link from 'next/link';
import { FilmIcon } from '@heroicons/react/24/outline';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <FilmIcon className="w-6 h-6 text-yellow-500" />
              <span className="text-yellow-500">Cine</span><span className="text-white">Vault</span>
            </Link>
            <p className="text-gray-500 text-sm">Your ultimate destination for discovering movies, TV shows, and celebrities.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Browse</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/search?type=movie" className="block hover:text-white transition">Movies</Link>
              <Link href="/search?type=series" className="block hover:text-white transition">TV Series</Link>
              <Link href="/search?trending=true" className="block hover:text-white transition">Trending</Link>
              <Link href="/search?topRated=true" className="block hover:text-white transition">Top Rated</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Genres</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/search?genre=action" className="block hover:text-white transition">Action</Link>
              <Link href="/search?genre=drama" className="block hover:text-white transition">Drama</Link>
              <Link href="/search?genre=comedy" className="block hover:text-white transition">Comedy</Link>
              <Link href="/search?genre=sci-fi" className="block hover:text-white transition">Sci-Fi</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/auth/login" className="block hover:text-white transition">Sign In</Link>
              <Link href="/auth/register" className="block hover:text-white transition">Register</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} CineVault. Built with Next.js. All movie data is for demonstration purposes.
        </div>
      </div>
    </footer>
  );
}
