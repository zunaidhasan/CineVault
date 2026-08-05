'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  current: {
    q?: string;
    genre?: string;
    year?: string;
    sort?: string;
    type?: string;
    trending?: string;
    topRated?: string;
  };
  genres: { name: string; slug: string }[];
}

export function SearchFilters({ current, genres }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [yearInput, setYearInput] = useState(current.year || '');

  const buildHref = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base = { q: current.q, genre: current.genre, year: current.year, sort: current.sort, type: current.type, trending: current.trending, topRated: current.topRated, ...updates };
    (Object.entries(base) as [string, string | undefined][]).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  };

  const applyYear = (e: React.FormEvent) => {
    e.preventDefault();
    const y = yearInput.trim();
    router.push(buildHref({ year: y || undefined }));
  };

  const type = current.type || 'movie';
  const showGenres = !current.q;

  return (
    <div className="mb-8 space-y-5">
      {/* Type + quick filters */}
      <div className="flex flex-wrap gap-2">
        <a href={buildHref({ type: undefined, genre: undefined, sort: undefined, year: undefined, trending: undefined, topRated: undefined })}
          className={`px-4 py-1.5 rounded-full text-sm transition ${!type || type === 'movie' ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          Movies
        </a>
        <a href={buildHref({ type: 'series', genre: undefined, sort: undefined, year: undefined, trending: undefined, topRated: undefined })}
          className={`px-4 py-1.5 rounded-full text-sm transition ${type === 'series' ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          TV Series
        </a>
        <a href={buildHref({ type: 'people', genre: undefined, sort: undefined, year: undefined, trending: undefined, topRated: undefined })}
          className={`px-4 py-1.5 rounded-full text-sm transition ${type === 'people' ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          People
        </a>
        {!current.q && (
          <>
            <a href={buildHref({ trending: current.trending ? undefined : 'true', topRated: undefined })}
              className={`px-4 py-1.5 rounded-full text-sm transition ${current.trending ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              Trending
            </a>
            <a href={buildHref({ topRated: current.topRated ? undefined : 'true', trending: undefined })}
              className={`px-4 py-1.5 rounded-full text-sm transition ${current.topRated ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              Top Rated
            </a>
          </>
        )}
      </div>

      {/* Genre chips + sort + year */}
      {showGenres && type !== 'people' && (
        <div className="flex flex-wrap items-center gap-2">
          <a href={buildHref({ genre: undefined })}
            className={`px-3 py-1 rounded-full text-xs transition ${!current.genre ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
            All
          </a>
          {genres.slice(0, 16).map(g => (
            <a key={g.slug} href={buildHref({ genre: current.genre === g.slug ? undefined : g.slug })}
              className={`px-3 py-1 rounded-full text-xs transition ${current.genre === g.slug ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
              {g.name}
            </a>
          ))}
        </div>
      )}

      {/* Sort + year */}
      {type !== 'people' && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="relative">
            <select
              value={current.sort || ''}
              onChange={e => router.push(buildHref({ sort: e.target.value || undefined }))}
              className="appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-9 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer">
              <option value="">Sort: Popular</option>
              <option value="title">Sort: Title A-Z</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <form onSubmit={applyYear} className="flex items-center gap-2">
            <input
              type="number" min="1900" max="2100" placeholder="Year" value={yearInput}
              onChange={e => setYearInput(e.target.value)}
              className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            {yearInput && <button type="submit" className="btn-primary text-xs px-3 py-2">Apply</button>}
            {current.year && <button onClick={() => { setYearInput(''); router.push(buildHref({ year: undefined })); }} className="text-xs text-gray-500 hover:text-red-400 transition">Clear</button>}
          </form>
        </div>
      )}
    </div>
  );
}
