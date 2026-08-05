import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';

async function getPerson(slug: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API}/people/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPerson(slug);
  if (!person) return { title: 'Person Not Found' };
  return { title: person.name, description: person.biography?.slice(0, 160) };
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await getPerson(slug);
  if (!person) notFound();

  const FilmCard = ({ item, type }: { item: any; type: 'movie' | 'series' }) => (
    <Link href={`/${type}/${item.slug}`} className="card p-3 flex gap-3 group">
      <div className="w-12 h-16 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-xs">🎬</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-yellow-500 transition truncate">{item.title}</p>
        <p className="text-xs text-gray-500">
          {item.releaseDate ? new Date(item.releaseDate).getFullYear() : item.firstAirDate ? new Date(item.firstAirDate).getFullYear() : ''}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center text-6xl">
            {person.photoUrl ? (
              <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
            ) : person.name[0]}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{person.name}</h1>
          {person.knownFor && <p className="text-yellow-500 text-sm mb-3">Known For: {person.knownFor}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            {person.birthDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {new Date(person.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {person.deathDate && ` — ${new Date(person.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </span>
            )}
            {person.birthPlace && (
              <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {person.birthPlace}</span>
            )}
          </div>
          {person.biography && <p className="text-gray-300 leading-relaxed">{person.biography}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Acting Roles */}
        <div>
          <h2 className="section-title">Filmography</h2>
          <div className="space-y-3">
            {person.movieCastRoles?.map((r: any) => (
              <FilmCard key={r.id} item={r.movie} type="movie" />
            ))}
            {person.seriesCastRoles?.map((r: any) => (
              <FilmCard key={r.id} item={r.series} type="series" />
            ))}
          </div>
        </div>

        {/* Crew Roles */}
        {(person.movieCrewRoles?.length > 0 || person.seriesCrewRoles?.length > 0) && (
          <div>
            <h2 className="section-title">Crew Work</h2>
            <div className="space-y-3">
              {person.movieCrewRoles?.map((r: any) => (
                <div key={r.id} className="card p-3 flex gap-3">
                  <div className="w-12 h-16 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-xs">🎬</div>
                  <div className="min-w-0">
                    <Link href={`/movie/${r.movie.slug}`} className="text-sm font-medium hover:text-yellow-500">{r.movie.title}</Link>
                    <p className="text-xs text-gray-500">{r.job}</p>
                  </div>
                </div>
              ))}
              {person.seriesCrewRoles?.map((r: any) => (
                <div key={r.id} className="card p-3 flex gap-3">
                  <div className="w-12 h-16 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-xs">📺</div>
                  <div className="min-w-0">
                    <Link href={`/series/${r.series.slug}`} className="text-sm font-medium hover:text-yellow-500">{r.series.title}</Link>
                    <p className="text-xs text-gray-500">{r.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
