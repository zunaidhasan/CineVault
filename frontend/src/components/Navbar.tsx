'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { search, notifications as notifApi, getToken } from '@/lib/api';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, FilmIcon, UserCircleIcon, HeartIcon, BookmarkIcon, BellIcon, BellAlertIcon } from '@heroicons/react/24/outline';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;
    notifApi.unreadCount(token).then(r => setUnreadNotifs(r.count)).catch(() => {});
    const interval = setInterval(() => {
      notifApi.unreadCount(token).then(r => setUnreadNotifs(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    const token = getToken();
    if (!token) return;
    const data = await notifApi.list(token);
    setNotifList(data.notifications.slice(0, 10));
    setNotifOpen(!notifOpen);
  };

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await notifApi.markAllRead(token);
    setUnreadNotifs(0);
    setNotifList(notifList.map(n => ({ ...n, isRead: true })));
  };

  const openNotification = async (n: any) => {
    setNotifOpen(false);
    if (!n.isRead) {
      const token = getToken();
      if (!token) return;
      notifApi.markRead(token, n.id).catch(() => {});
      setNotifList(notifList.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadNotifs(Math.max(0, unreadNotifs - 1));
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) {
      try {
        const data = await search.query(q);
        setSuggestions([...data.movies.slice(0, 3), ...data.series.slice(0, 2), ...(data.people || []).slice(0, 2)]);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const goToItem = (item: any) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (item.type === 'person') router.push(`/person/${item.slug}`);
    else router.push(`/${item.type === 'series' ? 'series' : 'movie'}/${item.slug}`);
  };

  return (
    <nav className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <FilmIcon className="w-7 h-7 text-yellow-500" />
            <span className="text-yellow-500">Cine</span><span className="text-white">Vault</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
            <Link href="/search?type=movie" className="text-gray-300 hover:text-white transition">Movies</Link>
            <Link href="/search?type=series" className="text-gray-300 hover:text-white transition">TV Series</Link>
            <Link href="/activities" className="text-gray-300 hover:text-white transition">Activity</Link>
          </div>

          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md mx-6">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search movies, TV shows, people..." value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
              </div>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((item, i) => (
                  <button key={i} onClick={() => goToItem(item)} className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center gap-3 transition">
                    <div className="w-8 h-12 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-xs">
                      {item.type === 'person' ? '👤' : item.type === 'series' ? '📺' : '🎬'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title || item.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.type}{item.releaseDate ? ` • ${new Date(item.releaseDate).getFullYear()}` : ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="badge-yellow text-xs">Admin</Link>
                )}
                <Link href="/user/watchlist" className="p-2 text-gray-400 hover:text-white transition" title="Watchlist">
                  <BookmarkIcon className="w-5 h-5" />
                </Link>
                <Link href="/user/favorites" className="p-2 text-gray-400 hover:text-white transition" title="Favorites">
                  <HeartIcon className="w-5 h-5" />
                </Link>
                <div ref={notifRef} className="relative">
                  <button onClick={loadNotifications} className="p-2 text-gray-400 hover:text-white transition relative">
                    {unreadNotifs > 0 ? <BellAlertIcon className="w-5 h-5 text-yellow-500" /> : <BellIcon className="w-5 h-5" />}
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-800">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadNotifs > 0 && <button onClick={markAllRead} className="text-xs text-yellow-500 hover:text-yellow-400">Mark all read</button>}
                      </div>
                      {notifList.length === 0 ? (
                        <p className="text-gray-500 text-sm px-4 py-6 text-center">No notifications yet</p>
                      ) : (
                        notifList.map(n => (
                          <Link key={n.id} href={n.link || '/notifications'} onClick={() => openNotification(n)}
                            className={`block px-4 py-3 hover:bg-gray-800 transition ${!n.isRead ? 'bg-yellow-500/5' : ''}`}>
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-gray-400">{n.body}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 overflow-hidden flex items-center justify-center text-yellow-500 font-bold text-xs">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                    <Link href={`/user/${user.username}`} className="block px-4 py-2 text-sm hover:bg-gray-800 transition">My Profile</Link>
                    <Link href="/user/ratings" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">My Ratings</Link>
                    <Link href="/user/reviews" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">My Reviews</Link>
                    <Link href="/notifications" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">Notifications</Link>
                    <hr className="border-gray-800 my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition">Sign Out</button>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm py-1.5 px-4">Sign In</Link>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-4 space-y-3">
          <form onSubmit={submitSearch} className="mb-4">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input text-sm" />
          </form>
          <Link href="/" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/search?type=movie" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Movies</Link>
          <Link href="/search?type=series" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>TV Series</Link>
          <Link href="/activities" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Activity</Link>
          {user ? (
            <>
              <Link href={`/user/${user.username}`} className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>My Profile</Link>
              <Link href="/user/watchlist" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Watchlist</Link>
              <Link href="/user/favorites" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Favorites</Link>
              <Link href="/notifications" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Notifications {unreadNotifs > 0 && `(${unreadNotifs})`}</Link>
              {user.role === 'ADMIN' && <Link href="/admin" className="block py-2 text-yellow-500" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-red-400">Sign Out</button>
            </>
          ) : (
            <Link href="/auth/login" className="block py-2 text-yellow-500" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
