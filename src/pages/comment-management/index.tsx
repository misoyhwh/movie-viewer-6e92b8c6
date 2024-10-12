import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error.message);
      // サンプルデータを表示
      setComments([
        { id: 1, content: 'サンプルコメント1', status: 'pending', user_name: 'ユーザー1' },
        { id: 2, content: 'サンプルコメント2', status: 'approved', user_name: 'ユーザー2' },
        { id: 3, content: 'サンプルコメント3', status: 'rejected', user_name: 'ユーザー3' },
      ]);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error('コメントの承認に失敗しました:', error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error('コメントの拒否に失敗しました:', error.message);
    }
  };

  const handleEdit = (id) => {
    // 編集画面への遷移処理
    router.push(`/comment-edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('このコメントを削除してもよろしいですか？')) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchComments();
      } catch (error) {
        console.error('コメントの削除に失敗しました:', error.message);
      }
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    return comment.status === filter;
  });

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">コメント管理</h1>
        <div className="mb-4 flex items-center">
          <FiFilter className="mr-2" />
          <select
            className="border rounded p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">全て</option>
            <option value="pending">承認待ち</option>
            <option value="approved">承認済み</option>
            <option value="rejected">拒否済み</option>
          </select>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">ユーザー</th>
                <th className="px-4 py-2">コメント</th>
                <th className="px-4 py-2">ステータス</th>
                <th className="px-4 py-2">アクション</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="border-b">
                  <td className="px-4 py-2">{comment.user_name}</td>
                  <td className="px-4 py-2">{comment.content}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      comment.status === 'approved' ? 'bg-green-200 text-green-800' :
                      comment.status === 'rejected' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleApprove(comment.id)} className="mr-2 text-green-500">
                      <FiCheckCircle />
                    </button>
                    <button onClick={() => handleReject(comment.id)} className="mr-2 text-red-500">
                      <FiXCircle />
                    </button>
                    <button onClick={() => handleEdit(comment.id)} className="mr-2 text-blue-500">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="text-red-500">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <Link href="/comment-policy" className="text-blue-500 hover:underline">
            コメントポリシーを確認・更新
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommentManagement;