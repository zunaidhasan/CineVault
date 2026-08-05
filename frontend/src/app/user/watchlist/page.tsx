'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { watchlist, getToken } from '@/lib/api';
import { MediaCard } from '@/components/MediaCard';
import { useRouter } from 'next/navigation';
import { BookmarkIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function WatchlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    watchlist.list(token).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const handleRemove = async (id: string) => {
    const token = getToken();
    if (!token) return;
    await watchlist.remove(token, id);
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-8 w-48 bg-gray-800 rounded mb-6" /><div className="grid grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg" />)}</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title"><BookmarkIcon className="w-6 h-6 text-yellow-500" /> My Watchlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookmarkIcon className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <p className="text-lg">Your watchlist is empty</p>
          <p className="text-sm">Start adding movies and shows you want to watch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => {
            const m = item.movie || item.series;
            return (
              <div key={item.id} className="relative group">
                <button onClick={() => handleRemove(item.id)} title="Remove from watchlist"
                  className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <MediaCard {...m} releaseDate={item.movie?.releaseDate} firstAirDate={item.series?.firstAirDate} type={item.movie ? 'movie' : 'series'} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
