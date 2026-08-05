'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { reviews, getToken } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatBubbleLeftIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    reviews.mine(token).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm({ title: r.title || '', content: r.content });
  };

  const handleSave = async (id: string) => {
    if (!editForm.content.trim()) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await reviews.update(token, id, { title: editForm.title, content: editForm.content });
      setItems(items.map(i => i.id === id ? { ...i, title: editForm.title, content: editForm.content } : i));
      setEditingId(null);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    if (!confirm('Delete this review?')) return;
    await reviews.delete(token, id);
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse h-8 w-48 bg-gray-800 rounded mb-6" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title"><ChatBubbleLeftIcon className="w-6 h-6 text-yellow-500" /> My Reviews ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ChatBubbleLeftIcon className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm">Share your thoughts on movies and shows you've watched!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(r => {
            const item = r.movie || r.series;
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link href={`/${r.movie ? 'movie' : 'series'}/${item.slug}`} className="font-medium hover:text-yellow-500">{item.title}</Link>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {!r.isApproved && <span className="badge-yellow text-xs">Pending</span>}
                    {editingId !== r.id && (
                      <button onClick={() => startEdit(r)} className="text-gray-600 hover:text-yellow-400 transition" title="Edit review">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-gray-600 hover:text-red-400 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === r.id ? (
                  <div className="mt-2 space-y-2">
                    <input type="text" placeholder="Review title (optional)" value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="input text-sm" />
                    <textarea placeholder="Your review..." value={editForm.content} rows={3}
                      onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="input text-sm resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(r.id)} disabled={saving || !editForm.content.trim()}
                        className="btn-primary text-xs disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {r.title && <h4 className="font-medium mb-1">{r.title}</h4>}
                    <p className="text-gray-300 text-sm">{r.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>👍 {r.likes}</span>
                      <span>👎 {r.dislikes}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
