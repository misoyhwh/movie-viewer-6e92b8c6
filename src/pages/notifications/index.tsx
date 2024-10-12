import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FaBell, FaCheckCircle, FaEye, FaEyeSlash, FaCog } from 'react-icons/fa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('通知の取得に失敗しました:', error);
      return;
    }

    setNotifications(data || []);
  };

  const markAllAsRead = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.session.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('通知の一括既読に失敗しました:', error);
      return;
    }

    fetchNotifications();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">通知一覧</h1>
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              onClick={() => setFilter('all')}
              className={`mr-2 px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`mr-2 px-4 py-2 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              未読
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded ${filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              既読
            </button>
          </div>
          <button
            onClick={markAllAsRead}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
          >
            <FaCheckCircle className="mr-2" />
            全て既読にする
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b ${notification.is_read ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaBell className={`mr-3 ${notification.is_read ? 'text-gray-400' : 'text-blue-500'}`} />
                  <p className={`${notification.is_read ? 'text-gray-600' : 'text-black font-semibold'}`}>
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {new Date(notification.created_at).toLocaleString('ja-JP')}
                  </span>
                  {notification.is_read ? <FaEye className="text-gray-400" /> : <FaEyeSlash className="text-blue-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/settings" className="text-blue-500 hover:underline flex items-center justify-center">
            <FaCog className="mr-2" />
            通知設定
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;