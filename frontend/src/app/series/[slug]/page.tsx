import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SeriesDetailClient } from './SeriesDetailClient';

async function getSeries(slug: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API}/series/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return { title: 'Series Not Found' };
  return { title: series.title, description: series.overview?.slice(0, 160) };
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) notFound();
  return <SeriesDetailClient series={series} />;
}
