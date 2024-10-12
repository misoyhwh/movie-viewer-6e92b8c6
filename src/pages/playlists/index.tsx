import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const { data, error } = await supabase.from('playlists').select('*');
    if (error) {
      console.error('プレイリストの取得に失敗しました:', error);
      // サンプルデータを表示
      setPlaylists([
        { id: 1, name: 'お気に入り動画', description: 'よく見る動画のコレクション' },
        { id: 2, name: '学習用動画', description: '勉強に役立つ動画集' },
        { id: 3, name: '音楽プレイリスト', description: '作業用BGM集' },
      ]);
    } else {
      setPlaylists(data);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const { data, error } = await supabase
      .from('playlists')
      .insert({ name: newPlaylistName, description: '' });
    if (error) {
      console.error('プレイリストの作成に失敗しました:', error);
    } else {
      setNewPlaylistName('');
      fetchPlaylists();
    }
  };

  const updatePlaylist = async (id, name, description) => {
    const { error } = await supabase
      .from('playlists')
      .update({ name, description })
      .eq('id', id);
    if (error) {
      console.error('プレイリストの更新に失敗しました:', error);
    } else {
      setEditingPlaylist(null);
      fetchPlaylists();
    }
  };

  const deletePlaylist = async (id) => {
    const { error } = await supabase.from('playlists').delete().eq('id', id);
    if (error) {
      console.error('プレイリストの削除に失敗しました:', error);
    } else {
      fetchPlaylists();
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">プレイリスト管理</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">新規プレイリスト作成</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="プレイリスト名"
              className="flex-grow mr-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createPlaylist}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
            >
              <FiPlus className="mr-2" />
              作成
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">プレイリスト一覧</h2>
          {playlists.map((playlist) => (
            <div key={playlist.id} className="mb-4 p-4 border rounded-md">
              {editingPlaylist === playlist.id ? (
                <div>
                  <input
                    type="text"
                    value={playlist.name}
                    onChange={(e) => setPlaylists(playlists.map(p => p.id === playlist.id ? { ...p, name: e.target.value } : p))}
                    className="w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={playlist.description}
                    onChange={(e) => setPlaylists(playlists.map(p => p.id === playlist.id ? { ...p, description: e.target.value } : p))}
                    className="w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => updatePlaylist(playlist.id, playlist.name, playlist.description)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 mr-2"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingPlaylist(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{playlist.name}</h3>
                  <p className="text-gray-600 mb-4">{playlist.description}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingPlaylist(playlist.id)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300 mr-2 flex items-center"
                    >
                      <FiEdit2 className="mr-2" />
                      編集
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 flex items-center"
                    >
                      <FiTrash2 className="mr-2" />
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlists;