import Link from 'next/link';
import { UsersIcon } from '@heroicons/react/24/solid';

async function getFollowing(username: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${API}/follows/${username}/following`, { cache: 'no-store' });
    return await res.json();
  } catch { return []; }
}

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const following = await getFollowing(username);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title"><UsersIcon className="w-6 h-6 text-yellow-500" /> {following.length} Following</h1>
      {following.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Not following anyone yet</p>
      ) : (
        <div className="space-y-2">
          {following.map((f: any) => (
            <Link key={f.id} href={`/user/${f.following?.username}`} className="card p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center font-bold text-yellow-500 text-sm">
                {f.following?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-yellow-500 transition">{f.following?.fullName || f.following?.username}</p>
                <p className="text-sm text-gray-500">@{f.following?.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
