import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiUpload, FiTag } from 'react-icons/fi';

const UploadPage: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagArray = e.target.value.split(',').map(tag => tag.trim());
    setTags(tagArray);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const filePath = `videos/${Date.now()}_${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          file_path: data?.path,
        });

      if (videoError) throw videoError;

      for (const tag of tags) {
        const { data: tagData, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tag)
          .single();

        if (tagError && tagError.code !== 'PGRST116') {
          throw tagError;
        }

        let tagId;
        if (!tagData) {
          const { data: newTag, error: newTagError } = await supabase
            .from('tags')
            .insert({ name: tag })
            .single();
          if (newTagError) throw newTagError;
          tagId = newTag.id;
        } else {
          tagId = tagData.id;
        }

        await supabase
          .from('video_tags')
          .insert({ video_id: videoData[0].id, tag_id: tagId });
      }

      router.push('/');
    } catch (error) {
      console.error('アップロードエラー:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">動画アップロード</h1>
        <form onSubmit={handleUpload} className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              動画ファイル
            </label>
            <input
              type="file"
              id="file"
              accept="video/*"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="動画のタイトルを入力"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="動画の説明を入力"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
              タグ
            </label>
            <div className="flex items-center">
              <FiTag className="text-gray-500 mr-2" />
              <input
                type="text"
                id="tags"
                value={tags.join(', ')}
                onChange={handleTagChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="カンマ区切りでタグを入力"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              <FiUpload className="mr-2" />
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
          {isUploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress.toFixed(0)}% 完了</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadPage;