'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { admin, getToken, movies, series, people, genres as genreApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon, FilmIcon, TvIcon, UserGroupIcon, UsersIcon,
  ChatBubbleLeftIcon, StarIcon, Cog6ToothIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';

type Tab = 'dashboard' | 'movies' | 'series' | 'people' | 'users' | 'reviews' | 'genres';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movieList, setMovieList] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [genreList, setGenreList] = useState<any[]>([]);

  const token = getToken();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    loadTab(tab);
  }, [user, tab, router]);

  const loadTab = async (t: Tab) => {
    if (!token) return;
    setLoading(true);
    try {
      switch (t) {
        case 'dashboard': setData(await admin.dashboard(token)); break;
        case 'movies': setMovieList((await movies.list({ limit: '50' })).movies || []); break;
        case 'series': setSeriesList((await series.list({ limit: '50' })).series || []); break;
        case 'people': setPeopleList((await people.list({ limit: '50' })).people || []); break;
        case 'users': setUserList((await admin.users(token)).users || []); break;
        case 'reviews': setPendingReviews(await admin.pendingReviews(token)); break;
        case 'genres': setGenreList(await genreApi.list()); break;
      }
    } catch {}
    setLoading(false);
  };

  const handleModerate = async (id: string, approved: boolean) => {
    if (!token) return;
    await admin.moderateReview(token, id, approved);
    setPendingReviews(pendingReviews.filter(r => r.id !== id));
  };

  const handleDeleteMovie = async (id: string) => {
    if (!token || !confirm('Delete this movie?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/movies/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    setMovieList(movieList.filter(m => m.id !== id));
  };

  const handleDeleteSeries = async (id: string) => {
    if (!token || !confirm('Delete this TV series?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/series/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    setSeriesList(seriesList.filter(s => s.id !== id));
  };

  const handleDeletePerson = async (id: string) => {
    if (!token || !confirm('Delete this person?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/people/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    setPeopleList(peopleList.filter(p => p.id !== id));
  };

  const handleUpdateUser = async (id: string, body: Record<string, unknown>) => {
    if (!token) return;
    try {
      await admin.updateUser(token, id, body);
      setUserList(userList.map(u => u.id === id ? { ...u, ...body } : u));
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token || !confirm('Delete this user? This cannot be undone.')) return;
    try {
      await admin.deleteUser(token, id);
      setUserList(userList.filter(u => u.id !== id));
    } catch (e: any) { alert(e.message); }
  };

  // Add-content form state
  const [showAdd, setShowAdd] = useState<'movie' | 'series' | 'person' | null>(null);
  const [addForm, setAddForm] = useState({ title: '', overview: '', posterUrl: '', releaseDate: '', runtime: '', imdbRating: '', status: 'Released', knownFor: '', birthDate: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!token || !showAdd) return;
    setAdding(true);
    try {
      const body: Record<string, unknown> = {
        title: addForm.title, overview: addForm.overview, posterUrl: addForm.posterUrl || null,
        imdbRating: addForm.imdbRating ? parseFloat(addForm.imdbRating) : null, status: addForm.status,
      };
      if (showAdd === 'movie') {
        body.releaseDate = addForm.releaseDate ? new Date(addForm.releaseDate).toISOString() : null;
        body.runtime = addForm.runtime ? parseInt(addForm.runtime) : null;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/movies`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      } else if (showAdd === 'series') {
        body.firstAirDate = addForm.releaseDate ? new Date(addForm.releaseDate).toISOString() : null;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/series`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      } else {
        body.name = addForm.title;
        body.knownFor = addForm.knownFor || null;
        body.birthDate = addForm.birthDate ? new Date(addForm.birthDate).toISOString() : null;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/people`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      }
      setShowAdd(null);
      setAddForm({ title: '', overview: '', posterUrl: '', releaseDate: '', runtime: '', imdbRating: '', status: 'Released', knownFor: '', birthDate: '' });
      loadTab(tab);
    } catch (e: any) { alert(e.message); }
    setAdding(false);
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { key: 'movies', label: 'Movies', icon: FilmIcon },
    { key: 'series', label: 'TV Series', icon: TvIcon },
    { key: 'people', label: 'People', icon: UserGroupIcon },
    { key: 'users', label: 'Users', icon: UsersIcon },
    { key: 'reviews', label: 'Reviews', icon: ChatBubbleLeftIcon },
    { key: 'genres', label: 'Genres', icon: Cog6ToothIcon },
  ];

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage your CineVault platform</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              tab === t.key ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="animate-pulse h-64 bg-gray-800 rounded-xl" /> : (
        <>
          {/* Dashboard */}
          {tab === 'dashboard' && data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Movies', value: data.movieCount, icon: FilmIcon, color: 'text-blue-400 bg-blue-500/10' },
                  { label: 'TV Series', value: data.seriesCount, icon: TvIcon, color: 'text-purple-400 bg-purple-500/10' },
                  { label: 'People', value: data.personCount, icon: UserGroupIcon, color: 'text-green-400 bg-green-500/10' },
                  { label: 'Users', value: data.userCount, icon: UsersIcon, color: 'text-yellow-400 bg-yellow-500/10' },
                  { label: 'Reviews', value: data.reviewCount, icon: ChatBubbleLeftIcon, color: 'text-pink-400 bg-pink-500/10' },
                  { label: 'Ratings', value: data.totalRatings, icon: StarIcon, color: 'text-orange-400 bg-orange-500/10' },
                ].map(stat => (
                  <div key={stat.label} className="card p-5">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Recent Users</h3>
                  <div className="space-y-2">
                    {data.recentUsers?.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Top Rated Movies</h3>
                  <div className="space-y-2">
                    {data.topMovies?.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <Link href={`/movie/${m.slug}`} className="text-sm font-medium hover:text-yellow-500">{m.title}</Link>
                        <span className="text-yellow-500 text-sm font-bold">⭐ {m.imdbRating?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Movies */}
          {tab === 'movies' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Movies ({movieList.length})</h3>
                <button onClick={() => setShowAdd('movie')} className="btn-primary text-xs px-3 py-1.5">+ Add Movie</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Year</th>
                      <th className="pb-3 font-medium">Rating</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movieList.map(m => (
                      <tr key={m.id} className="border-b border-gray-800">
                        <td className="py-3">
                          <Link href={`/movie/${m.slug}`} className="hover:text-yellow-500">{m.title}</Link>
                        </td>
                        <td className="py-3 text-gray-500">{m.releaseDate ? new Date(m.releaseDate).getFullYear() : '—'}</td>
                        <td className="py-3">{m.imdbRating ? `⭐ ${m.imdbRating.toFixed(1)}` : '—'}</td>
                        <td className="py-3">{m.status}</td>
                        <td className="py-3">
                          <button onClick={() => handleDeleteMovie(m.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Series */}
          {tab === 'series' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">TV Series ({seriesList.length})</h3>
                <button onClick={() => setShowAdd('series')} className="btn-primary text-xs px-3 py-1.5">+ Add Series</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Seasons</th>
                      <th className="pb-3 font-medium">Rating</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesList.map(s => (
                      <tr key={s.id} className="border-b border-gray-800">
                        <td className="py-3"><Link href={`/series/${s.slug}`} className="hover:text-yellow-500">{s.title}</Link></td>
                        <td className="py-3 text-gray-500">{s.numberOfSeasons || '—'}</td>
                        <td className="py-3">{s.imdbRating ? `⭐ ${s.imdbRating.toFixed(1)}` : '—'}</td>
                        <td className="py-3">
                          <span className={`badge ${s.status === 'Returning Series' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
                        </td>
                        <td className="py-3">
                          <button onClick={() => handleDeleteSeries(s.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* People */}
          {tab === 'people' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">People ({peopleList.length})</h3>
                <button onClick={() => setShowAdd('person')} className="btn-primary text-xs px-3 py-1.5">+ Add Person</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Known For</th>
                      <th className="pb-3 font-medium">Birth Date</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peopleList.map(p => (
                      <tr key={p.id} className="border-b border-gray-800">
                        <td className="py-3"><Link href={`/person/${p.slug}`} className="hover:text-yellow-500">{p.name}</Link></td>
                        <td className="py-3 text-gray-500">{p.knownFor || '—'}</td>
                        <td className="py-3 text-gray-500">{p.birthDate ? new Date(p.birthDate).getFullYear() : '—'}</td>
                        <td className="py-3">
                          <button onClick={() => handleDeletePerson(p.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Users ({userList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-3 font-medium">Username</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map(u => (
                      <tr key={u.id} className="border-b border-gray-800">
                        <td className="py-3"><Link href={`/user/${u.username}`} className="hover:text-yellow-500">{u.username}</Link></td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3"><span className={`badge ${u.role === 'ADMIN' ? 'badge-yellow' : 'badge-blue'}`}>{u.role}</span></td>
                        <td className="py-3">
                          <span className={`badge ${u.isActive === false ? 'badge-red' : 'badge-green'}`}>{u.isActive === false ? 'Inactive' : 'Active'}</span>
                        </td>
                        <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateUser(u.id, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                              className="text-yellow-500 hover:text-yellow-400 text-xs">{u.role === 'ADMIN' ? 'Demote' : 'Promote'}</button>
                            <button onClick={() => handleUpdateUser(u.id, { isActive: u.isActive === false ? true : false })}
                              className="text-blue-400 hover:text-blue-300 text-xs">{u.isActive === false ? 'Activate' : 'Deactivate'}</button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews */}
          {tab === 'reviews' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Pending Reviews ({pendingReviews.length})</h3>
              {pendingReviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending reviews to moderate.</p>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map(r => (
                    <div key={r.id} className="border border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{r.user?.username}</span>
                          <span className="text-gray-500 text-sm ml-2">on {r.movie?.title || r.series?.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                      <p className="text-gray-300 text-sm mb-3">{r.content}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleModerate(r.id, true)} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20">Approve</button>
                        <button onClick={() => handleModerate(r.id, false)} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Genres */}
          {tab === 'genres' && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Genres ({genreList.length})</h3>
              <div className="flex flex-wrap gap-2">
                {genreList.map(g => (
                  <Link key={g.id} href={`/search?genre=${g.slug}`}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition">
                    {g.name} ({g._count?.movies || 0} movies, {g._count?.series || 0} series)
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add content modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(null)}>
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add {showAdd === 'movie' ? 'Movie' : showAdd === 'series' ? 'TV Series' : 'Person'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{showAdd === 'person' ? 'Name' : 'Title'}</label>
                <input type="text" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                  className="input text-sm" placeholder={showAdd === 'person' ? 'Christopher Nolan' : 'Movie Title'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Overview</label>
                <textarea value={addForm.overview} onChange={e => setAddForm({ ...addForm, overview: e.target.value })}
                  rows={3} className="input text-sm resize-none" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                <input type="text" value={addForm.posterUrl} onChange={e => setAddForm({ ...addForm, posterUrl: e.target.value })}
                  className="input text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {showAdd !== 'person' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{showAdd === 'movie' ? 'Release Date' : 'First Air Date'}</label>
                      <input type="date" value={addForm.releaseDate} onChange={e => setAddForm({ ...addForm, releaseDate: e.target.value })}
                        className="input text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">IMDb Rating</label>
                      <input type="number" min="0" max="10" step="0.1" value={addForm.imdbRating} onChange={e => setAddForm({ ...addForm, imdbRating: e.target.value })}
                        className="input text-sm" placeholder="8.5" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Known For</label>
                      <input type="text" value={addForm.knownFor} onChange={e => setAddForm({ ...addForm, knownFor: e.target.value })}
                        className="input text-sm" placeholder="Director, Actor" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Birth Date</label>
                      <input type="date" value={addForm.birthDate} onChange={e => setAddForm({ ...addForm, birthDate: e.target.value })}
                        className="input text-sm" />
                    </div>
                  </>
                )}
              </div>
              {showAdd === 'movie' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Runtime (min)</label>
                    <input type="number" value={addForm.runtime} onChange={e => setAddForm({ ...addForm, runtime: e.target.value })}
                      className="input text-sm" placeholder="148" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })} className="input text-sm">
                      <option>Released</option>
                      <option>In Production</option>
                      <option>Post Production</option>
                      <option>Upcoming</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} disabled={adding || !addForm.title.trim()}
                className="btn-primary text-sm flex-1 disabled:opacity-50">{adding ? 'Adding...' : 'Add'}</button>
              <button onClick={() => setShowAdd(null)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
