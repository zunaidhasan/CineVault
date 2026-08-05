'use client';

import { useState, useEffect } from 'react';
import { follows, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function FollowButton({ userId, username }: { userId: string; username: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.username === username) return;
    const token = getToken();
    if (!token) return;
    follows.check(token, userId).then(r => setIsFollowing(r.isFollowing)).catch(() => {});
  }, [user, userId, username]);

  const handleToggle = async () => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      if (isFollowing) {
        await follows.unfollow(token, userId);
        setIsFollowing(false);
      } else {
        await follows.follow(token, userId);
        setIsFollowing(true);
      }
    } catch {}
    setLoading(false);
  };

  if (!user || user.username === username) return null;

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
        isFollowing ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-500 hover:text-red-400' :
        'bg-yellow-500 text-black hover:bg-yellow-400'
      }`}>
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
