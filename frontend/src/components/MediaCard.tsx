'use client';

import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

interface MediaCardProps {
  id?: string;
  title: string;
  slug: string;
  posterUrl?: string;
  releaseDate?: string;
  firstAirDate?: string;
  imdbRating?: number | null;
  type: 'movie' | 'series';
  genres?: { name: string; slug: string }[];
}

function ratingColor(r: number): string {
  if (r >= 8) return 'bg-green-600/90';
  if (r >= 6) return 'bg-yellow-600/90';
  return 'bg-red-600/90';
}

export function MediaCard({ title, slug, posterUrl, releaseDate, firstAirDate, imdbRating, type, genres }: MediaCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : firstAirDate ? new Date(firstAirDate).getFullYear() : null;
  const link = type === 'series' ? `/series/${slug}` : `/movie/${slug}`;

  return (
    <Link href={link} className="card group">
      <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden flex items-center justify-center">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-gray-500 text-sm font-medium line-clamp-3">{title}</div>
          </div>
        )}
        {imdbRating && (
          <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-1.5 py-1 rounded-lg backdrop-blur-sm ${ratingColor(imdbRating)}`}>
            <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-white text-xs font-bold">{imdbRating.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-sm font-medium">{title}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-white line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{year || 'TBA'}</span>
          <span className="text-xs text-gray-500 uppercase">{type}</span>
        </div>
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {genres.slice(0, 2).map(g => (
              <span key={g.slug} className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{g.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
