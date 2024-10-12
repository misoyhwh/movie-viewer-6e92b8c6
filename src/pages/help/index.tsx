import React, { useState, useEffect } from 'react';
import { FaSearch, FaQuestionCircle, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [faqItems, setFaqItems] = useState([
    { id: 1, question: '動画のアップロード方法は？', answer: '「アップロード」ボタンをクリックし、ファイルを選択してください。' },
    { id: 2, question: '動画の再生ができません', answer: 'ブラウザを最新版に更新するか、別のブラウザで試してみてください。' },
    { id: 3, question: 'アカウントの削除方法は？', answer: '設定画面から「アカウント削除」オプションを選択してください。' },
  ]);

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'upload', name: 'アップロード' },
    { id: 'playback', name: '再生' },
    { id: 'account', name: 'アカウント' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索ロジックをここに実装
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ヘルプ・サポート</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">よくある質問</h2>
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="質問を検索..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300"
              >
                <FaSearch />
              </button>
            </form>
          </div>
          <div className="flex mb-4 space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  <FaQuestionCircle className="inline-block mr-2 text-blue-500" />
                  {item.question}
                </h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">お問い合わせ</h2>
          <p className="text-gray-600 mb-4">
            上記のFAQで解決しない場合は、以下のフォームからお問い合わせください。
          </p>
          <Link href="/contact" className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
            <FaEnvelope className="mr-2" />
            お問い合わせフォームへ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;