'use client';

import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = url.includes('embed/') ? url.split('embed/')[1]?.split('?')[0] : url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : null;
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  if (playing && videoId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          width="100%" height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title || 'Trailer'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full" />
      </div>
    );
  }

  return (
    <button onClick={() => setPlaying(true)}
      className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden group w-full">
      {thumbnail ? (
        <img src={thumbnail} alt={title || 'Trailer'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <span className="text-4xl">🎥</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/30">
          <PlayIcon className="w-8 h-8 text-black ml-1" />
        </div>
      </div>
      {title && <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-sm font-medium text-white">{title}</p>
      </div>}
    </button>
  );
}
