import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const DeleteVideoConfirmation = () => {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const fetchVideo = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('動画の取得に失敗しました:', error);
    } else {
      setVideo(data);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('videos')
      .delete()
      .match({ id });

    if (error) {
      console.error('動画の削除に失敗しました:', error);
      alert('動画の削除に失敗しました。もう一度お試しください。');
    } else {
      alert('動画が正常に削除されました。');
      router.push('/video/list');
    }
  };

  const handleCancel = () => {
    router.push('/video/list');
  };

  if (!video) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Head>
        <title>動画削除確認 | 動画管理システム</title>
      </Head>
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">動画削除確認</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">削除対象の動画情報</h2>
          <div className="mb-4">
            <p><strong>タイトル:</strong> {video.title}</p>
            <p><strong>説明:</strong> {video.description}</p>
            <p><strong>アップロード日:</strong> {new Date(video.upload_date).toLocaleDateString()}</p>
          </div>
          <div className="mb-6">
            <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-2">
              削除理由（任意）
            </label>
            <textarea
              id="deleteReason"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="削除理由を入力してください"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FaTimes className="mr-2" />
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaTrash className="mr-2" />
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteVideoConfirmation;