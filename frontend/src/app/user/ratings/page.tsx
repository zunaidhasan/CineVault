'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ratings, getToken } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/solid';

export default function RatingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    ratings.mine(token).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse h-8 w-48 bg-gray-800 rounded mb-6" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title"><StarIcon className="w-6 h-6 text-yellow-500" /> My Ratings ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <StarIcon className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <p className="text-lg">No ratings yet</p>
          <p className="text-sm">Rate movies and shows to keep track of what you've watched!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(r => {
            const item = r.movie || r.series;
            return (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                    {r.movie ? '🎬' : '📺'}
                  </div>
                  <div>
                    <Link href={`/${r.movie ? 'movie' : 'series'}/${item.slug}`} className="font-medium hover:text-yellow-500">{item.title}</Link>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{r.score}/10</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
