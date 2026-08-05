'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { activities, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { BoltIcon, StarIcon, ChatBubbleLeftIcon, BookmarkIcon, HeartIcon, UserPlusIcon } from '@heroicons/react/24/solid';

const typeIcons: Record<string, any> = { rating: StarIcon, review: ChatBubbleLeftIcon, watchlist: BookmarkIcon, favorite: HeartIcon, follow: UserPlusIcon };
const typeLabels: Record<string, string> = { rating: 'rated', review: 'reviewed', watchlist: 'added to watchlist', favorite: 'favorited', follow: 'followed' };

export default function ActivityFeedPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [tab, setTab] = useState<'all'|'following'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const token = getToken();
    const fetcher = tab === 'following' && token ? activities.following(token) : activities.feed();
    fetcher.then(setFeed).catch(()=>{}).finally(()=>setLoading(false));
  }, [tab]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="space-y-4">{Array(5).fill(0).map((_,i)=><div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse"/>)}</div></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BoltIcon className="w-6 h-6 text-yellow-500"/> Activity Feed</h1>
        {user && <div className="flex gap-2">
          <button onClick={()=>setTab('all')} className={`px-4 py-1.5 rounded-full text-sm transition ${tab==='all'?'bg-yellow-500 text-black font-medium':'bg-gray-800 text-gray-400'}`}>All</button>
          <button onClick={()=>setTab('following')} className={`px-4 py-1.5 rounded-full text-sm transition ${tab==='following'?'bg-yellow-500 text-black font-medium':'bg-gray-800 text-gray-400'}`}>Following</button>
        </div>}
      </div>
      {feed.length===0 ? <div className="text-center py-20 text-gray-500"><BoltIcon className="w-16 h-16 mx-auto text-gray-700 mb-4"/><p className="text-lg">No activity yet</p></div> : (
        <div className="space-y-3">
          {feed.map(a=>{
            const Icon = typeIcons[a.type]||BoltIcon;
            const label = typeLabels[a.type]||a.type;
            const link = a.targetType&&a.targetSlug?`/${a.targetType}/${a.targetSlug}`:a.user?`/user/${a.user.username}`:'#';
            return (
              <div key={a.id} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">{a.user?.username?.[0]?.toUpperCase()||'?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link href={`/user/${a.user?.username}`} className="font-medium text-white hover:text-yellow-500">{a.user?.username}</Link>
                    {' '}<span className="text-gray-400">{label}</span>{' '}
                    {a.targetTitle?<Link href={link} className="font-medium text-yellow-500 hover:text-yellow-400">{a.targetTitle}</Link>:a.metadata?<span className="text-yellow-500 font-bold">{a.metadata}/10</span>:null}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <Icon className="w-5 h-5 text-gray-600 flex-shrink-0"/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
