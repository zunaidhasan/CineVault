import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StarIcon, ChatBubbleLeftIcon, BookmarkIcon, HeartIcon, CalendarIcon, UsersIcon, BoltIcon } from '@heroicons/react/24/solid';
import { FollowButton } from '@/components/FollowButton';

async function getUser(username: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const [userRes, followersRes, followingRes, activitiesRes] = await Promise.all([
      fetch(`${API}/users/${username}`, { cache: 'no-store' }),
      fetch(`${API}/follows/${username}/followers`, { cache: 'no-store' }),
      fetch(`${API}/follows/${username}/following`, { cache: 'no-store' }),
      fetch(`${API}/activities/user/${username}`, { cache: 'no-store' }),
    ]);
    const [user, followers, following, activities] = await Promise.all([
      userRes.json(), followersRes.json(), followingRes.json(), activitiesRes.json(),
    ]);
    return { ...user, followers, following, recentActivities: activities };
  } catch { return null; }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();

  const typeLabels: Record<string, string> = { rating: 'rated', review: 'reviewed', watchlist: 'added to watchlist', favorite: 'favorited', follow: 'followed' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center text-4xl font-bold text-yellow-500 flex-shrink-0">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                <p className="text-gray-500">@{user.username}</p>
                {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  {user.role === 'ADMIN' && <span className="badge-yellow">Admin</span>}
                </div>
              </div>
              <FollowButton userId={user.id} username={user.username} />
            </div>
            <div className="flex gap-6 mt-4 flex-wrap">
              <div className="text-center"><div className="font-bold">{user._count?.reviews || 0}</div><div className="text-xs text-gray-500">Reviews</div></div>
              <div className="text-center"><div className="font-bold">{user._count?.ratings || 0}</div><div className="text-xs text-gray-500">Ratings</div></div>
              <div className="text-center"><div className="font-bold">{user._count?.watchlist || 0}</div><div className="text-xs text-gray-500">Watchlist</div></div>
              <div className="text-center"><div className="font-bold">{user._count?.favorites || 0}</div><div className="text-xs text-gray-500">Favorites</div></div>
              <Link href={`/user/${username}/followers`} className="text-center hover:text-yellow-500 transition">
                <div className="font-bold">{user.followers?.length || 0}</div><div className="text-xs text-gray-500">Followers</div>
              </Link>
              <Link href={`/user/${username}/following`} className="text-center hover:text-yellow-500 transition">
                <div className="font-bold">{user.following?.length || 0}</div><div className="text-xs text-gray-500">Following</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      {user.recentActivities?.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title"><BoltIcon className="w-5 h-5 text-yellow-500" /> Recent Activity</h2>
          <div className="space-y-2">
            {user.recentActivities.slice(0, 10).map((a: any) => (
              <div key={a.id} className="card p-3 flex items-center gap-3 text-sm">
                <span className="text-gray-600">{typeLabels[a.type] || a.type}</span>
                {a.targetTitle && (
                  <Link href={`/${a.targetType}/${a.targetSlug}`} className="text-yellow-500 hover:text-yellow-400 font-medium">{a.targetTitle}</Link>
                )}
                {a.metadata && <span className="text-yellow-500 font-bold">{a.metadata}/10</span>}
                <span className="ml-auto text-xs text-gray-600">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Ratings */}
      {user.recentRatings?.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title"><StarIcon className="w-5 h-5 text-yellow-500" /> Recent Ratings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {user.recentRatings.map((r: any) => {
              const item = r.movie || r.series;
              return (
                <Link key={r.id} href={`/${r.movie ? 'movie' : 'series'}/${item.slug}`} className="card p-3 text-center group">
                  <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-2xl">
                    {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover rounded-lg" /> : (r.movie ? '🎬' : '📺')}
                  </div>
                  <p className="text-xs text-white font-medium truncate group-hover:text-yellow-500">{item.title}</p>
                  <p className="text-yellow-500 text-xs font-bold">{r.score}/10</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Reviews */}
      {user.recentReviews?.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title"><ChatBubbleLeftIcon className="w-5 h-5 text-yellow-500" /> Recent Reviews</h2>
          <div className="space-y-3">
            {user.recentReviews.map((r: any) => {
              const item = r.movie || r.series;
              return (
                <div key={r.id} className="card p-4">
                  <Link href={`/${r.movie ? 'movie' : 'series'}/${item.slug}`} className="text-sm font-medium hover:text-yellow-500">{item.title}</Link>
                  {r.title && <p className="text-sm font-medium mt-1">{r.title}</p>}
                  <p className="text-gray-400 text-sm mt-1 line-clamp-3">{r.content}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
