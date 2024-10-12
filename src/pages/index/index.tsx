import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaSearch, FaSort, FaUpload } from 'react-icons/fa';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const MainPage = () => {
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('uploadDate');
    const [currentPage, setCurrentPage] = useState(1);
    const videosPerPage = 12;
    const router = useRouter();

    useEffect(() => {
        fetchVideos();
    }, [searchTerm, sortOption, currentPage]);

    const fetchVideos = async () => {
        let query = supabase
            .from('videos')
            .select('*')
            .range((currentPage - 1) * videosPerPage, currentPage * videosPerPage - 1);

        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        switch (sortOption) {
            case 'title':
                query = query.order('title');
                break;
            case 'viewCount':
                query = query.order('view_count', { ascending: false });
                break;
            case 'uploadDate':
            default:
                query = query.order('upload_date', { ascending: false });
                break;
        }

        const { data, error } = await query;

        if (error) {
            console.error('動画の取得に失敗しました:', error);
            // サンプルデータを表示
            setVideos([
                { id: 1, title: 'サンプル動画1', thumbnail_path: 'https://placehold.co/280x158', view_count: 100, upload_date: '2023-06-01' },
                { id: 2, title: 'サンプル動画2', thumbnail_path: 'https://placehold.co/280x158', view_count: 200, upload_date: '2023-06-02' },
                // ... 他のサンプルデータ
            ]);
        } else {
            setVideos(data);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchVideos();
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
    };

    const handleUpload = () => {
        router.push('/upload');
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">動画リスト</h1>

                <div className="flex justify-between items-center mb-6">
                    <form onSubmit={handleSearch} className="flex-1 mr-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="動画を検索..."
                                className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </form>

                    <div className="flex items-center">
                        <select
                            className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
                            value={sortOption}
                            onChange={handleSortChange}
                        >
                            <option value="uploadDate">アップロード日</option>
                            <option value="viewCount">視聴回数</option>
                            <option value="title">タイトル</option>
                        </select>
                        <button
                            onClick={handleUpload}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                        >
                            <FaUpload className="mr-2" />
                            アップロード
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <Link href={`/watch/${video.id}`} key={video.id}>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                                <img
                                    src={video.thumbnail_path || 'https://placehold.co/280x158'}
                                    alt={video.title}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold mb-2 text-gray-800 truncate">{video.title}</h2>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{video.view_count} 回視聴</span>
                                        <span>{new Date(video.upload_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="mx-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
                    >
                        前へ
                    </button>
                    <span className="mx-4 py-2">{currentPage}</span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="mx-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                        次へ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainPage;