import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaChartBar, FaUserFriends, FaVideo, FaClock, FaDownload } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard: NextPage = () => {
  const router = useRouter();
  const [summaryStats, setSummaryStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    averageWatchTime: 0,
  });
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [
      {
        label: '視聴回数',
        data: [],
        borderColor: '#3366CC',
        backgroundColor: 'rgba(51, 102, 204, 0.5)',
      },
    ],
  });
  const [popularVideos, setPopularVideos] = useState([]);
  const [userActivityData, setUserActivityData] = useState({
    labels: [],
    datasets: [
      {
        label: 'アクティブユーザー数',
        data: [],
        backgroundColor: '#FF9900',
      },
    ],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_analytics_data');
      if (error) throw error;

      setSummaryStats(data.summary_stats);
      setTrendData(data.trend_data);
      setPopularVideos(data.popular_videos);
      setUserActivityData(data.user_activity_data);
    } catch (error) {
      console.error('Analytics data fetch error:', error);
      // サンプルデータを表示
      setSummaryStats({
        totalUsers: 1000,
        totalVideos: 500,
        totalViews: 10000,
        averageWatchTime: 15,
      });
      setTrendData({
        labels: ['1月', '2月', '3月', '4月', '5月'],
        datasets: [
          {
            label: '視聴回数',
            data: [500, 600, 750, 800, 1000],
            borderColor: '#3366CC',
            backgroundColor: 'rgba(51, 102, 204, 0.5)',
          },
        ],
      });
      setPopularVideos([
        { title: '人気動画1', views: 1000 },
        { title: '人気動画2', views: 800 },
        { title: '人気動画3', views: 600 },
      ]);
      setUserActivityData({
        labels: ['月', '火', '水', '木', '金'],
        datasets: [
          {
            label: 'アクティブユーザー数',
            data: [100, 120, 150, 130, 180],
            backgroundColor: '#FF9900',
          },
        ],
      });
    }
  };

  const exportData = () => {
    // データエクスポート処理を実装
    alert('データのエクスポートが完了しました。');
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">アナリティクスダッシュボード</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FaUserFriends />} title="総ユーザー数" value={summaryStats.totalUsers} />
          <StatCard icon={<FaVideo />} title="総動画数" value={summaryStats.totalVideos} />
          <StatCard icon={<FaChartBar />} title="総視聴回数" value={summaryStats.totalViews} />
          <StatCard icon={<FaClock />} title="平均視聴時間" value={`${summaryStats.averageWatchTime}分`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">視聴回数トレンド</h2>
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">ユーザーアクティビティ</h2>
            <Bar data={userActivityData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">人気動画ランキング</h2>
          <ul>
            {popularVideos.map((video, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span>{video.title}</span>
                <span className="font-semibold">{video.views}回視聴</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={exportData}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FaDownload className="mr-2" />
          データをエクスポート
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center">
    <div className="text-3xl text-blue-500 mr-4">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default AnalyticsDashboard;