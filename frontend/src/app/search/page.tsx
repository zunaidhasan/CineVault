import { MediaCard } from '@/components/MediaCard';
import { SearchFilters } from '@/components/SearchFilters';
import Link from 'next/link';

async function getResults(params: Record<string, string>) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const type = params.type;
  const qs = new URLSearchParams(params).toString();
  try {
    if (type === 'people') {
      const q = params.q || '';
      if (q) {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&type=people`, { cache: 'no-store' });
        return { people: (await res.json()).people || [], movies: [], series: [] };
      }
      const res = await fetch(`${API}/people?limit=30`, { cache: 'no-store' });
      return { people: (await res.json()).people || [], movies: [], series: [] };
    } else if (params.q) {
      const res = await fetch(`${API}/search?${qs}`, { cache: 'no-store' });
      return res.json();
    } else if (type === 'series') {
      const res = await fetch(`${API}/series?${qs}`, { cache: 'no-store' });
      return { series: (await res.json()).series || [], movies: [], people: [] };
    } else {
      const res = await fetch(`${API}/movies?${qs}`, { cache: 'no-store' });
      return { movies: (await res.json()).movies || [], series: [], people: [] };
    }
  } catch { return { movies: [], series: [], people: [] }; }
}

async function getGenres() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API}/genres`, { cache: 'no-store' });
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((g: any) => ({ name: g.name, slug: g.slug }));
  } catch { return []; }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const { q, genre, year, sort, type, trending, topRated } = params;
  const [data, genres] = await Promise.all([getResults(params), getGenres()]);
  const movies = data.movies || [];
  const series = data.series || [];
  const people = data.people || [];

  const isPeople = type === 'people';
  const title = q ? `Results for "${q}"` : isPeople ? 'People' : genre ? `${genre} ${type === 'series' ? 'Series' : 'Movies'}` : trending ? 'Trending' : topRated ? 'Top Rated' : 'Browse';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">
        {movies.length + series.length + people.length} results found
      </p>

      <SearchFilters current={{ q, genre, year, sort, type, trending, topRated }} genres={genres} />

      {/* Movie Results */}
      {!isPeople && movies.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">🎬 Movies ({movies.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((m: any) => (
              <MediaCard key={m.id} {...m} releaseDate={m.releaseDate} type="movie" />
            ))}
          </div>
        </section>
      )}

      {/* Series Results */}
      {!isPeople && series.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">📺 TV Series ({series.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {series.map((s: any) => (
              <MediaCard key={s.id} {...s} firstAirDate={s.firstAirDate} type="series" />
            ))}
          </div>
        </section>
      )}

      {/* People Results */}
      {(isPeople || (!q && people.length > 0) || people.length > 0) && people.length > 0 && (
        <section className={isPeople ? '' : 'mb-10'}>
          {!isPeople && <h2 className="text-lg font-semibold mb-4">👤 People ({people.length})</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {people.map((p: any) => (
              <Link key={p.id} href={`/person/${p.slug}`} className="card p-4 flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center text-lg flex-shrink-0">
                  {p.photoUrl ? <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" /> : p.name[0]}
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-yellow-500 transition">{p.name}</p>
                  {p.knownFor && <p className="text-xs text-gray-500">{p.knownFor}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {movies.length === 0 && series.length === 0 && people.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">No results found</p>
          <p className="text-gray-600 text-sm mt-1">Try a different search term or filter</p>
        </div>
      )}
    </div>
  );
}
