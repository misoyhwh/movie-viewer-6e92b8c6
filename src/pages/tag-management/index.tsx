import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase.from('tags').select('*');
    if (error) {
      console.error('タグの取得に失敗しました:', error);
    } else {
      setTags(data);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: newTagName.trim() }]);

    if (error) {
      console.error('タグの追加に失敗しました:', error);
    } else {
      setNewTagName('');
      fetchTags();
    }
  };

  const handleEditTag = async (tag) => {
    if (editingTag && editingTag.id === tag.id) {
      const { data, error } = await supabase
        .from('tags')
        .update({ name: editingTag.name })
        .eq('id', tag.id);

      if (error) {
        console.error('タグの編集に失敗しました:', error);
      } else {
        setEditingTag(null);
        fetchTags();
      }
    } else {
      setEditingTag(tag);
    }
  };

  const handleDeleteTag = async (tagId) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('タグの削除に失敗しました:', error);
    } else {
      fetchTags();
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">タグ管理</h1>

        <form onSubmit={handleAddTag} className="mb-8">
          <div className="flex">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="新しいタグ名"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-200"
            >
              <FiPlus className="inline-block mr-2" />
              追加
            </button>
          </div>
        </form>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ名</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTag && editingTag.id === tag.id ? (
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FiEdit2 className="inline-block mr-1" />
                      {editingTag && editingTag.id === tag.id ? '保存' : '編集'}
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline-block mr-1" />
                      削除
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

export default TagManagement;