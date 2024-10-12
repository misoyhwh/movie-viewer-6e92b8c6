import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FaTrash, FaSort, FaFilter } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';

const ViewHistory = () => {
  const router = useRouter();
  const [viewHistory, setViewHistory] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchViewHistory();
  }, []);

  const fetchViewHistory = async () => {
    const { data, error } = await supabase
      .from('view_history')
      .select('*, videos(title)')
      .order('viewed_at', { ascending: sortOrder === 'asc' });

    if (error) {
      console.error('視聴履歴の取得に失敗しました:', error);
      return;
    }

    setViewHistory(data);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    fetchViewHistory();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('view_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('視聴履歴の削除に失敗しました:', error);
      return;
    }

    fetchViewHistory();
  };

  const handleDeleteAll = async () => {
    const { error } = await supabase
      .from('view_history')
      .delete()
      .neq('id', null);

    if (error) {
      console.error('全ての視聴履歴の削除に失敗しました:', error);
      return;
    }

    fetchViewHistory();
  };

  const filteredHistory = viewHistory.filter((item) => {
    if (!dateFilter) return true;
    return new Date(item.viewed_at).toDateString() === new Date(dateFilter).toDateString();
  });

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">個人視聴履歴</h1>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateFilter}
              className="p-2 border rounded mr-2"
            />
            <button
              onClick={() => setDateFilter('')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              フィルターをクリア
            </button>
          </div>
          <div>
            <button
              onClick={handleSort}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            >
              <FaSort className="mr-2" />
              {sortOrder === 'asc' ? '昇順' : '降順'}
            </button>
          </div>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            全ての履歴を削除
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  動画タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/video-player?id=${item.video_id}`} className="text-blue-600 hover:underline">
                      {item.videos.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.viewed_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewHistory;