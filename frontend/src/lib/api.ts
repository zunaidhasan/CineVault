const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

// Auth
export const auth = {
  register: (body: { email: string; username: string; password: string; fullName?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => apiFetch('/auth/me', { token }),
  updateProfile: (token: string, body: Record<string, unknown>) =>
    apiFetch('/auth/profile', { method: 'PATCH', token, body: JSON.stringify(body) }),
};

// Movies
export const movies = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/movies${qs}`);
  },
  get: (slug: string) => apiFetch(`/movies/${slug}`),
};

// TV Series
export const series = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/series${qs}`);
  },
  get: (slug: string) => apiFetch(`/series/${slug}`),
};

// People
export const people = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/people${qs}`);
  },
  get: (slug: string) => apiFetch(`/people/${slug}`),
};

// Genres
export const genres = {
  list: () => apiFetch('/genres'),
  get: (slug: string) => apiFetch(`/genres/${slug}`),
};

// Search
export const search = {
  query: (q: string, type?: string) =>
    apiFetch(`/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`),
};

// Ratings
export const ratings = {
  submit: (token: string, body: { movieId?: string; seriesId?: string; score: number }) =>
    apiFetch('/ratings', { method: 'POST', token, body: JSON.stringify(body) }),
  mine: (token: string) => apiFetch('/ratings/my', { token }),
  status: (token: string, params: { movieId?: string; seriesId?: string }) => {
    const qs = '?' + new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch(`/ratings/status${qs}`, { token });
  },
};

// Reviews
export const reviews = {
  forMovie: (movieId: string, page = 1) => apiFetch(`/reviews/movie/${movieId}?page=${page}`),
  forSeries: (seriesId: string, page = 1) => apiFetch(`/reviews/series/${seriesId}?page=${page}`),
  create: (token: string, body: { movieId?: string; seriesId?: string; title?: string; content: string; isSpoiler?: boolean }) =>
    apiFetch('/reviews', { method: 'POST', token, body: JSON.stringify(body) }),
  update: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch(`/reviews/${id}`, { method: 'PUT', token, body: JSON.stringify(body) }),
  delete: (token: string, id: string) =>
    apiFetch(`/reviews/${id}`, { method: 'DELETE', token }),
  vote: (token: string, id: string, type: 'like' | 'dislike') =>
    apiFetch(`/reviews/${id}/vote`, { method: 'POST', token, body: JSON.stringify({ type }) }),
  mine: (token: string) => apiFetch('/reviews/user/me', { token }),
};

// Watchlist
export const watchlist = {
  list: (token: string) => apiFetch('/watchlist', { token }),
  add: (token: string, body: { movieId?: string; seriesId?: string }) =>
    apiFetch('/watchlist', { method: 'POST', token, body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    apiFetch(`/watchlist/${id}`, { method: 'DELETE', token }),
  check: (token: string, params: { movieId?: string; seriesId?: string }) => {
    const qs = '?' + new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch(`/watchlist/check${qs}`, { token });
  },
};

// Favorites
export const favorites = {
  list: (token: string) => apiFetch('/favorites', { token }),
  add: (token: string, body: { movieId?: string; seriesId?: string }) =>
    apiFetch('/favorites', { method: 'POST', token, body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    apiFetch(`/favorites/${id}`, { method: 'DELETE', token }),
};

// Admin
export const admin = {
  dashboard: (token: string) => apiFetch('/admin/dashboard', { token }),
  users: (token: string, page = 1) => apiFetch(`/admin/users?page=${page}`, { token }),
  updateUser: (token: string, id: string, body: Record<string, unknown>) =>
    apiFetch(`/admin/users/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  deleteUser: (token: string, id: string) =>
    apiFetch(`/admin/users/${id}`, { method: 'DELETE', token }),
  pendingReviews: (token: string) => apiFetch('/admin/reviews/pending', { token }),
  moderateReview: (token: string, id: string, isApproved: boolean) =>
    apiFetch(`/admin/reviews/${id}/moderate`, { method: 'PATCH', token, body: JSON.stringify({ isApproved }) }),
};

// Users
export const users = {
  get: (username: string) => apiFetch(`/users/${username}`),
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Follows
export const follows = {
  follow: (token: string, userId: string) => apiFetch('/follows/' + userId, { method: 'POST', token }),
  unfollow: (token: string, userId: string) => apiFetch('/follows/' + userId, { method: 'DELETE', token }),
  followers: (userId: string) => apiFetch('/follows/' + userId + '/followers'),
  following: (userId: string) => apiFetch('/follows/' + userId + '/following'),
  check: (token: string, userId: string) => apiFetch('/follows/check/' + userId, { token }),
};

// Notifications
export const notifications = {
  list: (token: string) => apiFetch('/notifications', { token }),
  markRead: (token: string, id: string) => apiFetch('/notifications/' + id + '/read', { method: 'PATCH', token }),
  markAllRead: (token: string) => apiFetch('/notifications/read-all', { method: 'PATCH', token }),
  unreadCount: (token: string) => apiFetch('/notifications/unread-count', { token }),
};

// Activities
export const activities = {
  feed: (page = 1) => apiFetch('/activities?page=' + page),
  following: (token: string, page = 1) => apiFetch('/activities/following?page=' + page, { token }),
  user: (userId: string) => apiFetch('/activities/user/' + userId),
};

// Recommendations
export const recommendations = {
  forMovie: (movieId: string) => apiFetch('/recommendations/movie/' + movieId),
  forUser: (token?: string) => apiFetch('/recommendations/user', { token }),
};
