import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiShare2, FiLock, FiUsers, FiLink, FiClock } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ShareSettings = () => {
  const router = useRouter();
  const [shareItems, setShareItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [shareType, setShareType] = useState('public');
  const [shareLink, setShareLink] = useState('');
  const [shareHistory, setShareHistory] = useState([]);

  useEffect(() => {
    fetchShareItems();
    fetchShareHistory();
  }, []);

  const fetchShareItems = async () => {
    const { data, error } = await supabase.from('videos').select('*');
    if (error) {
      console.error('Error fetching share items:', error);
    } else {
      setShareItems(data);
    }
  };

  const fetchShareHistory = async () => {
    const { data, error } = await supabase.from('view_history').select('*').order('viewed_at', { ascending: false }).limit(5);
    if (error) {
      console.error('Error fetching share history:', error);
    } else {
      setShareHistory(data);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleShareTypeChange = (type) => {
    setShareType(type);
  };

  const generateShareLink = () => {
    if (selectedItem) {
      const link = `https://yourdomain.com/share/${selectedItem.id}`;
      setShareLink(link);
    }
  };

  const saveShareSettings = async () => {
    if (selectedItem) {
      const { data, error } = await supabase
        .from('videos')
        .update({ share_type: shareType })
        .eq('id', selectedItem.id);

      if (error) {
        console.error('Error saving share settings:', error);
      } else {
        alert('共有設定を保存しました。');
      }
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">共有設定</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">共有可能アイテム</h2>
            <ul className="space-y-2">
              {shareItems.map((item) => (
                <li
                  key={item.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedItem && selectedItem.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleItemSelect(item)}
                >
                  <FiShare2 className="inline-block mr-2" />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">共有設定</h2>
            {selectedItem ? (
              <>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">共有タイプ</h3>
                  <div className="space-x-4">
                    <button
                      className={`px-4 py-2 rounded ${
                        shareType === 'public' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => handleShareTypeChange('public')}
                    >
                      <FiUsers className="inline-block mr-2" />
                      公開
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${
                        shareType === 'private' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => handleShareTypeChange('private')}
                    >
                      <FiLock className="inline-block mr-2" />
                      非公開
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${
                        shareType === 'specific' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      onClick={() => handleShareTypeChange('specific')}
                    >
                      <FiUsers className="inline-block mr-2" />
                      特定ユーザーのみ
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={generateShareLink}
                  >
                    <FiLink className="inline-block mr-2" />
                    共有リンク生成
                  </button>
                </div>
                {shareLink && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">共有リンク</h3>
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={saveShareSettings}
                  >
                    設定を保存
                  </button>
                </div>
              </>
            ) : (
              <p>共有するアイテムを選択してください。</p>
            )}
          </div>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">共有履歴</h2>
          <ul className="space-y-2">
            {shareHistory.map((history) => (
              <li key={history.id} className="flex items-center">
                <FiClock className="mr-2" />
                <span>{new Date(history.viewed_at).toLocaleString()}</span>
                <span className="ml-2">- {history.video_id}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareSettings;