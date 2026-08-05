'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StarRating } from '@/components/StarRating';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { ratings, reviews, watchlist, favorites, getToken } from '@/lib/api';
import { StarIcon, BookmarkIcon, HeartIcon, CalendarIcon, PlayIcon, UserGroupIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';

export function SeriesDetailClient({ series }: { series: any }) {
  const { user } = useAuth();
  const token = getToken();
  const [rating, setRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allReviews, setAllReviews] = useState(series.reviews || []);
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    if (!user || !token) return;
    ratings.status(token, { seriesId: series.id }).then(r => r.score && setRating(r.score)).catch(() => {});
    watchlist.check(token, { seriesId: series.id }).then(r => setInWatchlist(r.isInWatchlist)).catch(() => {});
    favorites.list(token).then(r => {
      setInFavorites(r.some((f: any) => f.series?.id === series.id));
    }).catch(() => {});
  }, [user, token, series.id]);

  const handleRate = async (val: number) => {
    if (!token) return alert('Please sign in to rate');
    setRating(val);
    try { await ratings.submit(token, { seriesId: series.id, score: val }); } catch (e: any) { alert(e.message); }
  };

  const handleWatchlist = async () => {
    if (!token) return alert('Please sign in');
    if (inWatchlist) {
      const items = await watchlist.list(token);
      const item = items.find((i: any) => i.series?.id === series.id);
      if (item) await watchlist.remove(token, item.id);
      setInWatchlist(false);
    } else {
      await watchlist.add(token, { seriesId: series.id });
      setInWatchlist(true);
    }
  };

  const handleFavorite = async () => {
    if (!token) return alert('Please sign in');
    if (inFavorites) {
      const items = await favorites.list(token);
      const item = items.find((i: any) => i.series?.id === series.id);
      if (item) await favorites.remove(token, item.id);
      setInFavorites(false);
    } else {
      await favorites.add(token, { seriesId: series.id });
      setInFavorites(true);
    }
  };

  const handleReview = async () => {
    if (!token) return alert('Please sign in');
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const r = await reviews.create(token, { seriesId: series.id, title: reviewTitle, content: reviewText });
      setAllReviews([r, ...allReviews]);
      setReviewText('');
      setReviewTitle('');
    } catch (e: any) { alert(e.message); }
    setSubmitting(false);
  };

  const handleVote = async (reviewId: string, type: 'like' | 'dislike') => {
    if (!token) return alert('Please sign in to vote');
    try {
      const res = await reviews.vote(token, reviewId, type);
      setAllReviews(allReviews.map((r: any) => r.id === reviewId ? { ...r, likes: res.likes, dislikes: res.dislikes, hasLiked: res.hasLiked, hasDisliked: res.hasDisliked } : r));
    } catch (e: any) { alert(e.message); }
  };

  const loadMoreReviews = async () => {
    const next = reviewPage + 1;
    try {
      const data = await reviews.forSeries(series.id, next);
      setAllReviews([...allReviews, ...data.reviews]);
      setReviewPage(next);
    } catch {}
  };

  const backdrop = series.backdropUrl || series.posterUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Cinematic backdrop header */}
      {backdrop && (
        <div className="relative -mx-4 sm:-mx-6 -mt-8 mb-10 overflow-hidden">
          <div className="absolute inset-0">
            <img src={backdrop} alt="" className="w-full h-72 md:h-96 object-cover opacity-25 blur-[3px] scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/70 to-gray-950" />
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
            {series.posterUrl ? (
              <img src={series.posterUrl} alt={series.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl">📺</span>
                <p className="text-gray-500 text-sm mt-2 font-medium">{series.title}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{series.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {series.imdbRating && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-500">{series.imdbRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
            )}
            <span className="text-gray-400">{series.numberOfSeasons} Seasons • {series.numberOfEpisodes} Episodes</span>
            {series.firstAirDate && <span className="flex items-center gap-1 text-gray-400"><CalendarIcon className="w-4 h-4" /> {new Date(series.firstAirDate).getFullYear()}</span>}
            {series.contentRating && <span className="badge-purple">{series.contentRating}</span>}
            <span className={`badge ${series.status === 'Returning Series' ? 'badge-green' : 'badge-red'}`}>{series.status}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {series.genres?.map((g: any) => (
              <Link key={g.slug} href={`/search?genre=${g.slug}&type=series`} className="badge-blue">{g.name}</Link>
            ))}
          </div>

          {/* User actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={handleWatchlist} className={`btn-secondary flex items-center gap-2 text-sm ${inWatchlist ? '!bg-yellow-500/20 !text-yellow-500 !border-yellow-500/50' : ''}`}>
              <BookmarkIcon className="w-4 h-4" /> {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
            <button onClick={handleFavorite} className={`btn-secondary flex items-center gap-2 text-sm ${inFavorites ? '!bg-red-500/20 !text-red-400 !border-red-500/50' : ''}`}>
              <HeartIcon className="w-4 h-4" /> {inFavorites ? 'Favorited' : 'Favorite'}
            </button>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Your Rating:</p>
            <StarRating value={rating} onChange={handleRate} />
            {series.avgRating && <p className="text-xs text-gray-600 mt-1">Average: {series.avgRating.toFixed(1)} ({series.ratingCount} ratings)</p>}
          </div>

          <p className="text-gray-300 leading-relaxed">{series.overview}</p>
        </div>
      </div>

      {/* Trailer */}
      {series.trailerUrl && (
        <section className="mb-12">
          <h2 className="section-title"><PlayIcon className="w-6 h-6 text-yellow-500" /> Trailer</h2>
          <YouTubeEmbed url={series.trailerUrl} title={`${series.title} — Official Trailer`} />
        </section>
      )}

      {/* Seasons & Episodes */}
      {series.seasons?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title">Seasons & Episodes</h2>
          <div className="space-y-6">
            {series.seasons.map((season: any) => (
              <div key={season.id} className="card overflow-hidden">
                <div className="bg-gray-800 px-6 py-4">
                  <h3 className="font-semibold">{season.title || `Season ${season.seasonNumber}`}</h3>
                  {season.overview && <p className="text-sm text-gray-400 mt-1">{season.overview}</p>}
                  <p className="text-xs text-gray-600 mt-1">{season.episodeCount || season.episodes?.length} Episodes</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {season.episodes?.map((ep: any) => (
                    <div key={ep.id} className="px-6 py-3 hover:bg-gray-800/50 transition flex items-center justify-between">
                      <div>
                        <span className="text-gray-600 text-sm mr-3">{ep.episodeNumber}.</span>
                        <span className="text-white">{ep.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {ep.runtime && <span>{ep.runtime}m</span>}
                        {ep.imdbRating && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <StarIcon className="w-3.5 h-3.5" /> {ep.imdbRating}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cast */}
      {series.cast?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title"><UserGroupIcon className="w-6 h-6 text-yellow-500" /> Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {series.cast.map((c: any) => (
              <Link key={c.id} href={`/person/${c.person.slug}`} className="card p-3 text-center group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 mx-auto mb-2 ring-2 ring-gray-700 group-hover:ring-yellow-500/70 transition">
                  {c.person.photoUrl ? (
                    <img src={c.person.photoUrl} alt={c.person.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-gray-400">{c.person.name[0]}</div>
                  )}
                </div>
                <p className="text-sm font-medium text-white group-hover:text-yellow-500 transition">{c.person.name}</p>
                <p className="text-xs text-gray-500">{c.character || c.role}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="section-title">Reviews ({series.reviewCount || 0})</h2>

        {user && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <input type="text" placeholder="Review title (optional)" value={reviewTitle}
              onChange={e => setReviewTitle(e.target.value)} className="input mb-3" />
            <textarea placeholder="Share your thoughts..." value={reviewText}
              onChange={e => setReviewText(e.target.value)} rows={4} className="input mb-3 resize-none" />
            <button onClick={handleReview} disabled={submitting || !reviewText.trim()}
              className="btn-primary text-sm disabled:opacity-50">
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {allReviews.map((r: any) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                  {r.user?.avatarUrl ? (
                    <img src={r.user.avatarUrl} alt={r.user.username} className="w-full h-full object-cover" />
                  ) : (
                    r.user?.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <Link href={`/user/${r.user?.username}`} className="text-sm font-medium text-white hover:text-yellow-500">{r.user?.username}</Link>
                  <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {r.title && <h4 className="font-medium mb-1">{r.title}</h4>}
              <p className="text-gray-300 text-sm">{r.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <button onClick={() => handleVote(r.id, 'like')} className={`flex items-center gap-1 transition hover:text-green-400 ${r.hasLiked ? 'text-green-400' : ''}`}>
                  <HandThumbUpIcon className="w-4 h-4" /> {r.likes}
                </button>
                <button onClick={() => handleVote(r.id, 'dislike')} className={`flex items-center gap-1 transition hover:text-red-400 ${r.hasDisliked ? 'text-red-400' : ''}`}>
                  <HandThumbDownIcon className="w-4 h-4" /> {r.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
        {allReviews.length < (series.reviewCount || 0) && (
          <button onClick={loadMoreReviews} className="btn-secondary mt-4 mx-auto block">Load More Reviews</button>
        )}
      </section>
    </div>
  );
}
