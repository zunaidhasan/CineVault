'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notifications, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { BellIcon, BellAlertIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = getToken();
    if (!token) return;
    notifications.list(token).then(d => setNotifs(d.notifications||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, [user, router]);

  const markRead = async (id: string) => {
    const token = getToken(); if (!token) return;
    await notifications.markRead(token, id);
    setNotifs(notifs.map(n => n.id===id?{...n,isRead:true}:n));
  };
  const markAllRead = async () => {
    const token = getToken(); if (!token) return;
    await notifications.markAllRead(token);
    setNotifs(notifs.map(n=>({...n,isRead:true})));
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><div className="space-y-3">{Array(5).fill(0).map((_,i)=><div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"/>)}</div></div>;

  const unread = notifs.filter(n=>!n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">{unread>0?<BellAlertIcon className="w-6 h-6 text-yellow-500"/>:<BellIcon className="w-6 h-6 text-yellow-500"/>} Notifications {unread>0&&<span className="text-sm text-gray-500 font-normal">({unread} unread)</span>}</h1>
        {unread>0&&<button onClick={markAllRead} className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/>Mark all read</button>}
      </div>
      {notifs.length===0?<div className="text-center py-20 text-gray-500"><BellIcon className="w-16 h-16 mx-auto text-gray-700 mb-4"/><p className="text-lg">No notifications yet</p></div>:(
        <div className="space-y-2">
          {notifs.map(n=>(
            <Link key={n.id} href={n.link||'#'} onClick={e=>{if(!n.isRead){e.preventDefault();markRead(n.id);}}}
              className={`card block p-4 transition ${!n.isRead?'bg-yellow-500/5 border-yellow-500/20':''}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium">{n.title}</p><p className="text-sm text-gray-400 mt-0.5">{n.body}</p><p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p></div>
                {!n.isRead&&<span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5"/>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
