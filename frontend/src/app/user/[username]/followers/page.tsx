import Link from 'next/link';
import { UsersIcon } from '@heroicons/react/24/solid';

async function getFollowers(username: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const [userRes, followersRes] = await Promise.all([
      fetch(`${API}/users/${username}`, { cache: 'no-store' }),
      fetch(`${API}/follows/${username}/followers`, { cache: 'no-store' }),
    ]);
    return { user: await userRes.json(), followers: await followersRes.json() };
  } catch { return { user: null, followers: [] }; }
}

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { followers } = await getFollowers(username);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title"><UsersIcon className="w-6 h-6 text-yellow-500" /> {followers.length} Followers</h1>
      {followers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No followers yet</p>
      ) : (
        <div className="space-y-2">
          {followers.map((f: any) => (
            <Link key={f.id} href={`/user/${f.follower?.username}`} className="card p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center font-bold text-yellow-500 text-sm">
                {f.follower?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-yellow-500 transition">{f.follower?.fullName || f.follower?.username}</p>
                <p className="text-sm text-gray-500">@{f.follower?.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
