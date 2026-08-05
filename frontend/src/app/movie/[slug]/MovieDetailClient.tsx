'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StarRating } from '@/components/StarRating';
import { MediaCard } from '@/components/MediaCard';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { Recommendations } from '@/components/Recommendations';
import { ratings, reviews, watchlist, favorites, getToken } from '@/lib/api';
import { StarIcon, BookmarkIcon, HeartIcon, ClockIcon, CalendarIcon, PlayIcon, UserGroupIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';

export function MovieDetailClient({ movie }: { movie: any }) {
  const { user } = useAuth();
  const token = getToken();
  const [rating, setRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allReviews, setAllReviews] = useState(movie.reviews || []);
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    if (!user || !token) return;
    ratings.status(token, { movieId: movie.id }).then(r => r.score && setRating(r.score)).catch(() => {});
    watchlist.check(token, { movieId: movie.id }).then(r => setInWatchlist(r.isInWatchlist)).catch(() => {});
    favorites.list(token).then(r => {
      setInFavorites(r.some((f: any) => f.movie?.id === movie.id));
    }).catch(() => {});
  }, [user, token, movie.id]);

  const handleRate = async (val: number) => {
    if (!token) return alert('Please sign in to rate');
    setRating(val);
    await ratings.submit(token, { movieId: movie.id, score: val });
  };

  const handleWatchlist = async () => {
    if (!token) return alert('Please sign in');
    if (inWatchlist) {
      const items = await watchlist.list(token);
      const item = items.find((i: any) => i.movie?.id === movie.id);
      if (item) await watchlist.remove(token, item.id);
      setInWatchlist(false);
    } else {
      await watchlist.add(token, { movieId: movie.id });
      setInWatchlist(true);
    }
  };

  const handleFavorite = async () => {
    if (!token) return alert('Please sign in');
    if (inFavorites) {
      const items = await favorites.list(token);
      const item = items.find((i: any) => i.movie?.id === movie.id);
      if (item) await favorites.remove(token, item.id);
      setInFavorites(false);
    } else {
      await favorites.add(token, { movieId: movie.id });
      setInFavorites(true);
    }
  };

  const handleReview = async () => {
    if (!token) return alert('Please sign in');
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const r = await reviews.create(token, { movieId: movie.id, title: reviewTitle, content: reviewText });
      setAllReviews([r, ...allReviews]);
      setReviewText('');
      setReviewTitle('');
    } catch (e: any) { alert(e.message); }
    setSubmitting(false);
  };

  const loadMoreReviews = async () => {
    const next = reviewPage + 1;
    try {
      const data = await reviews.forMovie(movie.id, next);
      setAllReviews([...allReviews, ...data.reviews]);
      setReviewPage(next);
    } catch {}
  };

  const handleVote = async (reviewId: string, type: 'like' | 'dislike') => {
    if (!token) return alert('Please sign in to vote');
    try {
      const res = await reviews.vote(token, reviewId, type);
      setAllReviews(allReviews.map((r: any) => r.id === reviewId ? { ...r, likes: res.likes, dislikes: res.dislikes, hasLiked: res.hasLiked, hasDisliked: res.hasDisliked } : r));
    } catch (e: any) { alert(e.message); }
  };

  const backdrop = movie.backdropUrl || movie.posterUrl;

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
      <div className={`flex flex-col md:flex-row gap-8 ${backdrop ? 'mb-12' : 'mb-12'}`}>
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl">🎬</span>
                <p className="text-gray-500 text-sm mt-2 font-medium">{movie.title}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          {movie.tagline && <p className="text-gray-400 italic mb-4">{movie.tagline}</p>}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {movie.imdbRating && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-yellow-500">{movie.imdbRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
            )}
            {movie.runtime && <span className="flex items-center gap-1 text-gray-400"><ClockIcon className="w-4 h-4" /> {movie.runtime} min</span>}
            {movie.releaseDate && <span className="flex items-center gap-1 text-gray-400"><CalendarIcon className="w-4 h-4" /> {new Date(movie.releaseDate).getFullYear()}</span>}
            {movie.contentRating && <span className="badge-purple">{movie.contentRating}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.map((g: any) => (
              <Link key={g.slug} href={`/search?genre=${g.slug}`} className="badge-blue">{g.name}</Link>
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
            {movie.avgRating && <p className="text-xs text-gray-600 mt-1">Average: {movie.avgRating.toFixed(1)} ({movie.ratingCount} ratings)</p>}
          </div>

          <p className="text-gray-300 leading-relaxed">{movie.overview}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
            {movie.budget > 0 && <div><span className="text-gray-500">Budget</span><p className="font-medium">${(movie.budget / 1000000).toFixed(0)}M</p></div>}
            {movie.revenue > 0 && <div><span className="text-gray-500">Box Office</span><p className="font-medium">${(movie.revenue / 1000000).toFixed(0)}M</p></div>}
            {movie.status && <div><span className="text-gray-500">Status</span><p className="font-medium">{movie.status}</p></div>}
            {movie.productionCompanies?.length > 0 && (
              <div><span className="text-gray-500">Studios</span><p className="font-medium">{movie.productionCompanies.map((c: any) => c.name).join(', ')}</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer */}
      {movie.trailerUrl && (
        <section className="mb-12">
          <h2 className="section-title"><PlayIcon className="w-6 h-6 text-yellow-500" /> Trailer</h2>
          <YouTubeEmbed url={movie.trailerUrl} title={`${movie.title} — Official Trailer`} />
        </section>
      )}

      {/* Recommendations */}
      <Recommendations movieId={movie.id} />

      {/* Cast */}
      {movie.cast?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title"><UserGroupIcon className="w-6 h-6 text-yellow-500" /> Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.cast.map((c: any) => (
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

      {/* Crew */}
      {movie.crew?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title">Crew</h2>
          <div className="flex flex-wrap gap-4">
            {movie.crew.map((c: any) => (
              <Link key={c.id} href={`/person/${c.person.slug}`} className="card px-4 py-3 text-center group">
                <p className="text-sm font-medium text-white group-hover:text-yellow-500 transition">{c.person.name}</p>
                <p className="text-xs text-gray-500">{c.job}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {movie.media?.length > 0 && (
        <section className="mb-12">
          <h2 className="section-title">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {movie.media.map((m: any) => (
              <div key={m.id} className="aspect-video bg-gray-800 rounded-lg overflow-hidden group relative flex items-center justify-center">
                {m.url ? (
                  m.type === 'trailer' || m.url.includes('youtube') ? (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center group">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayIcon className="w-5 h-5 text-black ml-0.5" />
                      </div>
                    </a>
                  ) : (
                    <img src={m.url} alt={m.title || 'Gallery'} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )
                ) : (
                  <span className="text-gray-600">{m.type === 'trailer' ? <PlayIcon className="w-8 h-8" /> : '📷'}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="section-title">Reviews ({movie.reviewCount || 0})</h2>

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
        {allReviews.length < (movie.reviewCount || 0) && (
          <button onClick={loadMoreReviews} className="btn-secondary mt-4 mx-auto block">Load More Reviews</button>
        )}
      </section>
    </div>
  );
}
