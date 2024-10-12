import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiDownload } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const Reports: NextPage = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewCountData, setViewCountData] = useState<any>(null);
  const [popularVideosData, setPopularVideosData] = useState<any>(null);
  const [userActivityData, setUserActivityData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      const { data, error } = await supabase
        .from('view_history')
        .select('*')
        .gte('viewed_at', startDate)
        .lte('viewed_at', endDate);

      if (error) throw error;

      // ここでデータを加工して、各グラフ用のデータを生成
      const processedViewCountData = processViewCountData(data);
      const processedPopularVideosData = processPopularVideosData(data);
      const processedUserActivityData = processUserActivityData(data);

      setViewCountData(processedViewCountData);
      setPopularVideosData(processedPopularVideosData);
      setUserActivityData(processedUserActivityData);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      // エラー時のサンプルデータ
      setViewCountData(sampleViewCountData);
      setPopularVideosData(samplePopularVideosData);
      setUserActivityData(sampleUserActivityData);
    }
  };

  const processViewCountData = (data: any) => {
    // 実際のデータ処理ロジックをここに記述
    return sampleViewCountData;
  };

  const processPopularVideosData = (data: any) => {
    // 実際のデータ処理ロジックをここに記述
    return samplePopularVideosData;
  };

  const processUserActivityData = (data: any) => {
    // 実際のデータ処理ロジックをここに記述
    return sampleUserActivityData;
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/export-report', {
        startDate,
        endDate,
        viewCountData,
        popularVideosData,
        userActivityData,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'usage_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('レポートのエクスポートに失敗しました:', error);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">使用状況レポート</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">期間選択</h2>
          <div className="flex space-x-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">視聴回数推移</h2>
            {viewCountData && <Line data={viewCountData} />}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">人気動画ランキング</h2>
            {popularVideosData && <Bar data={popularVideosData} />}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ユーザーアクティビティ</h2>
          {userActivityData && <Line data={userActivityData} />}
        </div>
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FiDownload className="mr-2" />
          レポートをエクスポート
        </button>
      </div>
    </div>
  );
};

const sampleViewCountData = {
  labels: ['1日目', '2日目', '3日目', '4日目', '5日目', '6日目', '7日目'],
  datasets: [
    {
      label: '視聴回数',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

const samplePopularVideosData = {
  labels: ['動画A', '動画B', '動画C', '動画D', '動画E'],
  datasets: [
    {
      label: '視聴回数',
      data: [300, 250, 200, 150, 100],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
  ],
};

const sampleUserActivityData = {
  labels: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
  datasets: [
    {
      label: 'アクティブユーザー数',
      data: [120, 190, 30, 50, 20, 30, 40],
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    },
  ],
};

export default Reports;