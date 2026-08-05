import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MovieDetailClient } from './MovieDetailClient';

async function getMovie(slug: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API}/movies/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return { title: 'Movie Not Found' };
  return { title: movie.title, description: movie.overview?.slice(0, 160) };
}

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) notFound();
  return <MovieDetailClient movie={movie} />;
}
