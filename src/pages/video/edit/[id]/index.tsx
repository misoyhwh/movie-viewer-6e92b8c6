import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiSave, FiX } from 'react-icons/fi';

const VideoEdit = () => {
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchVideoData();
    }
  }, [id]);

  const fetchVideoData = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('title, description, thumbnail_path, tags(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description);
      setThumbnailPath(data.thumbnail_path);
      setTags(data.tags.map((tag: any) => tag.name));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching video data:', error);
      setError('動画データの取得に失敗しました。');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ title, description })
        .eq('id', id);

      if (error) throw error;

      // タグの更新処理（簡略化のため省略）

      router.push('/video/list');
    } catch (error) {
      console.error('Error updating video:', error);
      setError('動画の更新に失敗しました。');
    }
  };

  const handleCancel = () => {
    router.push('/video/list');
  };

  if (loading) {
    return <div className="min-h-screen h-full flex items-center justify-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="min-h-screen h-full flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">動画メタデータ編集</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">説明</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">タグ</label>
            <input
              type="text"
              id="tags"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(', '))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">カンマ区切りで複数入力できます</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">サムネイル</label>
            <div className="mt-2 flex items-center">
              <img src={thumbnailPath || 'https://placehold.co/300x169'} alt="サムネイル" className="w-48 h-27 object-cover rounded" />
              <button className="ml-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                変更
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiX className="inline-block mr-2" />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiSave className="inline-block mr-2" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEdit;