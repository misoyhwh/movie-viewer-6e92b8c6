import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';
import { FiSearch, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState('upload_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    searchVideos();
  }, [searchQuery, sortBy, sortOrder, currentPage]);

  const searchVideos = async () => {
    try {
      let query = supabase
        .from('videos')
        .select('*', { count: 'exact' })
        .ilike('title', `%${searchQuery}%`)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      setSearchResults(data);
      setTotalPages(Math.ceil(count / 10));
    } catch (error) {
      console.error('Error fetching videos:', error);
      setSearchResults([]);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">検索結果</h1>
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索キーワードを入力"
              className="flex-grow p-2 border rounded-l"
            />
            <button
              onClick={searchVideos}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            >
              <FiSearch />
            </button>
          </div>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => handleSortChange('title')}
              className="mr-2 p-2 bg-white rounded shadow"
            >
              タイトル {sortBy === 'title' && (sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
            </button>
            <button
              onClick={() => handleSortChange('upload_date')}
              className="mr-2 p-2 bg-white rounded shadow"
            >
              アップロード日 {sortBy === 'upload_date' && (sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
            </button>
            <button
              onClick={() => handleSortChange('view_count')}
              className="p-2 bg-white rounded shadow"
            >
              視聴回数 {sortBy === 'view_count' && (sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
            </button>
          </div>
          <button className="p-2 bg-white rounded shadow">
            <FiFilter /> フィルター
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((video) => (
            <Link href={`/video/${video.id}`} key={video.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={video.thumbnail_path || 'https://placehold.co/300x169'}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                  <p className="text-gray-600 mb-2">{new Date(video.upload_date).toLocaleDateString()}</p>
                  <p className="text-gray-600">視聴回数: {video.view_count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === page ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;