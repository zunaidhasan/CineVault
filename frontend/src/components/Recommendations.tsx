'use client';

import { useState, useEffect } from 'react';
import { recommendations, getToken } from '@/lib/api';
import { MediaCard } from '@/components/MediaCard';
import { SparklesIcon } from '@heroicons/react/24/solid';

export function Recommendations({ movieId }: { movieId: string }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendations.forMovie(movieId)
      .then(setRecs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full" /></div>;
  if (recs.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="section-title"><SparklesIcon className="w-6 h-6 text-yellow-500" /> More Like This</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recs.map(m => (
          <MediaCard key={m.id} {...m} releaseDate={m.releaseDate} type="movie" />
        ))}
      </div>
    </section>
  );
}

export function UserRecommendations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    recommendations.forUser(token || undefined)
      .then(setRecs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />)}</div>;
  if (recs.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="section-title"><SparklesIcon className="w-6 h-6 text-yellow-500" /> Recommended For You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recs.map(m => (
          <MediaCard key={m.id} {...m} releaseDate={m.releaseDate} type="movie" />
        ))}
      </div>
    </section>
  );
}
