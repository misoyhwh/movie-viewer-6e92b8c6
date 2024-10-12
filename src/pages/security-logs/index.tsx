import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Topbar from '@/components/Topbar';
import { FiCalendar, FiTag, FiAlertTriangle, FiSearch, FiDownload } from 'react-icons/fi';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SecurityLogs = () => {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [eventType, setEventType] = useState('');
  const [severity, setSeverity] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data);
    } catch (error) {
      console.error('ログの取得に失敗しました:', error.message);
      // サンプルデータを表示
      setLogs([
        { id: 1, event_type: 'ログイン', event_description: '管理者がログインしました', created_at: '2023-06-01T10:00:00Z', ip_address: '192.168.1.1' },
        { id: 2, event_type: 'ファイルアクセス', event_description: '機密ファイルにアクセスしました', created_at: '2023-06-01T11:30:00Z', ip_address: '192.168.1.2' },
        { id: 3, event_type: 'パスワード変更', event_description: 'ユーザーがパスワードを変更しました', created_at: '2023-06-02T09:15:00Z', ip_address: '192.168.1.3' },
      ]);
    }
  };

  const filterLogs = () => {
    // フィルタリングロジックを実装
  };

  const exportLogs = () => {
    // ログのエクスポート機能を実装
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">セキュリティログ</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/3 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateRange">
                期間
              </label>
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-600" />
                <input
                  type="date"
                  id="startDate"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span className="mx-2">~</span>
                <input
                  type="date"
                  id="endDate"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventType">
                イベントタイプ
              </label>
              <div className="flex items-center">
                <FiTag className="mr-2 text-gray-600" />
                <select
                  id="eventType"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="login">ログイン</option>
                  <option value="file_access">ファイルアクセス</option>
                  <option value="password_change">パスワード変更</option>
                </select>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="severity">
                重要度
              </label>
              <div className="flex items-center">
                <FiAlertTriangle className="mr-2 text-gray-600" />
                <select
                  id="severity"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
              onClick={filterLogs}
            >
              <FiSearch className="inline-block mr-2" />
              フィルター
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={exportLogs}
            >
              <FiDownload className="inline-block mr-2" />
              エクスポート
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  日時
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  イベントタイプ
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  説明
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  IPアドレス
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {log.event_type}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {log.event_description}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">ログ詳細</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    日時: {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    イベントタイプ: {selectedLog.event_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    説明: {selectedLog.event_description}
                  </p>
                  <p className="text-sm text-gray-500">
                    IPアドレス: {selectedLog.ip_address}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    id="ok-btn"
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => setSelectedLog(null)}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityLogs;