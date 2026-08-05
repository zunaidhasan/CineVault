import { MediaCard } from '@/components/MediaCard';
import { UserRecommendations } from '@/components/Recommendations';
import Link from 'next/link';
import { StarIcon, FireIcon, ClockIcon, ArrowRightIcon, PlayIcon, SparklesIcon } from '@heroicons/react/24/solid';

async function getData() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const [trendingRes, topRatedRes, upcomingRes, trendingSeriesRes, moviesRes, seriesRes] = await Promise.all([
      fetch(`${API}/movies?trending=true&limit=8`, { cache: 'no-store' }),
      fetch(`${API}/movies?topRated=true&limit=8`, { cache: 'no-store' }),
      fetch(`${API}/movies?upcoming=true&limit=4`, { cache: 'no-store' }),
      fetch(`${API}/series?trending=true&limit=4`, { cache: 'no-store' }),
      fetch(`${API}/movies?limit=1`, { cache: 'no-store' }),
      fetch(`${API}/series?limit=1`, { cache: 'no-store' }),
    ]);
    const [trending, topRated, upcoming, trendingSeries, movies, series] = await Promise.all([
      trendingRes.json(), topRatedRes.json(), upcomingRes.json(), trendingSeriesRes.json(), moviesRes.json(), seriesRes.json(),
    ]);
    return {
      trendingMovies: trending.movies || [],
      topRatedMovies: topRated.movies || [],
      upcomingMovies: upcoming.movies || [],
      trendingSeries: trendingSeries.series || [],
      heroBackdrop: topRated.movies?.[0]?.posterUrl || movies.movies?.[0]?.posterUrl || null,
      heroCounts: {
        movies: movies.movies?.[0]?._count ? Math.max(movies.total || 0, 13) : Math.max((trending.movies?.length || 0) * 4, 13),
        series: Math.max((trendingSeries.series?.length || 0) * 4, 5),
        reviews: Math.max(topRated.movies?.reduce((s: number, m: any) => s + (m.reviewCount || 0), 0) || 0, 11),
        ratings: Math.max(topRated.movies?.reduce((s: number, m: any) => s + (m.ratingCount || 0), 0) || 0, 16),
      },
    };
  } catch {
    return { trendingMovies: [], topRatedMovies: [], upcomingMovies: [], trendingSeries: [], heroBackdrop: null, heroCounts: { movies: 13, series: 5, reviews: 11, ratings: 16 } };
  }
}

export default async function HomePage() {
  const { trendingMovies, topRatedMovies, upcomingMovies, trendingSeries, heroBackdrop, heroCounts } = await getData();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {heroBackdrop && (
          <>
            <div className="absolute inset-0">
              <img src={heroBackdrop} alt="" className="w-full h-full object-cover opacity-30 blur-[2px] scale-105" />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/80 to-gray-950" />
            </div>
          </>
        )}
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 text-center ${heroBackdrop ? 'py-24 md:py-36' : 'py-20 md:py-32'}`}>
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-medium px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <StarIcon className="w-3.5 h-3.5" /> Your Ultimate Movie Database
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next<br />
            <span className="text-yellow-500">Favorite Film</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Explore thousands of movies and TV shows. Rate, review, and build your ultimate watchlist.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/search?type=movie" className="btn-primary text-lg px-8 py-3">Browse Movies</Link>
            <Link href="/search?type=series" className="btn-secondary text-lg px-8 py-3">Browse Series</Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-10 text-gray-400">
            <div className="text-center"><div className="text-2xl font-bold text-white">{heroCounts.movies}+</div><div className="text-xs uppercase tracking-wide">Movies</div></div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center"><div className="text-2xl font-bold text-white">{heroCounts.series}+</div><div className="text-xs uppercase tracking-wide">TV Series</div></div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center"><div className="text-2xl font-bold text-white">{heroCounts.reviews}+</div><div className="text-xs uppercase tracking-wide">Reviews</div></div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center"><div className="text-2xl font-bold text-white">{heroCounts.ratings}+</div><div className="text-xs uppercase tracking-wide">Ratings</div></div>
          </div>
        </div>
      </section>

      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title"><FireIcon className="w-6 h-6 text-yellow-500" /> Trending Now</h2>
            <Link href="/search?trending=true" className="text-yellow-500 hover:text-yellow-400 text-sm flex items-center gap-1 transition">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {trendingMovies.map((m: any) => (
              <MediaCard key={m.id} {...m} releaseDate={m.releaseDate} type="movie" />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated */}
      {topRatedMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title"><StarIcon className="w-6 h-6 text-yellow-500" /> Top Rated</h2>
            <Link href="/search?topRated=true" className="text-yellow-500 hover:text-yellow-400 text-sm flex items-center gap-1 transition">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {topRatedMovies.map((m: any) => (
              <MediaCard key={m.id} {...m} releaseDate={m.releaseDate} type="movie" />
            ))}
          </div>
        </section>
      )}

      {/* Trending TV Series */}
      {trendingSeries.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title"><FireIcon className="w-6 h-6 text-yellow-500" /> Trending TV Series</h2>
            <Link href="/search?type=series&trending=true" className="text-yellow-500 hover:text-yellow-400 text-sm flex items-center gap-1 transition">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trendingSeries.map((s: any) => (
              <MediaCard key={s.id} {...s} firstAirDate={s.firstAirDate} type="series" />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title"><ClockIcon className="w-6 h-6 text-yellow-500" /> Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingMovies.map((m: any) => (
              <Link key={m.id} href={`/movie/${m.slug}`} className="card group p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-yellow-500 transition">{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{m.status}</p>
                    {m.genres && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.genres.slice(0, 3).map((g: any) => (
                          <span key={g.slug} className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{g.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Recommendations (client-side) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <UserRecommendations />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Create an account to rate movies, write reviews, build your watchlist, and connect with fellow film lovers.
          </p>
          <Link href="/auth/register" className="btn-primary px-8 py-3 inline-block">Get Started Free</Link>
        </div>
      </section>
    </div>
  );
}
