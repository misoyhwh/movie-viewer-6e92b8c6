import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiSave, FiHardDrive, FiUsers, FiArchive, FiZap } from 'react-icons/fi';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const SystemSettings = () => {
  const router = useRouter();
  const [storageSettings, setStorageSettings] = useState({
    connectionString: '',
    containerName: '',
  });
  const [userManagementSettings, setUserManagementSettings] = useState({
    maxUsers: 0,
    passwordPolicy: '',
  });
  const [backupSettings, setBackupSettings] = useState({
    frequency: '',
    retentionPeriod: '',
  });
  const [performanceSettings, setPerformanceSettings] = useState({
    cacheSize: 0,
    maxConcurrentConnections: 0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setStorageSettings(data.storage_settings);
        setUserManagementSettings(data.user_management_settings);
        setBackupSettings(data.backup_settings);
        setPerformanceSettings(data.performance_settings);
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
      // エラー時のサンプルデータ
      setStorageSettings({
        connectionString: 'DefaultConnectionString',
        containerName: 'DefaultContainer',
      });
      setUserManagementSettings({
        maxUsers: 100,
        passwordPolicy: 'デフォルトパスワードポリシー',
      });
      setBackupSettings({
        frequency: '毎日',
        retentionPeriod: '30日',
      });
      setPerformanceSettings({
        cacheSize: 1024,
        maxConcurrentConnections: 100,
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          storage_settings: storageSettings,
          user_management_settings: userManagementSettings,
          backup_settings: backupSettings,
          performance_settings: performanceSettings,
        });

      if (error) throw error;

      alert('設定が保存されました');
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      alert('設定の保存に失敗しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">システム設定</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiHardDrive className="mr-2" />
            ストレージ設定
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">接続文字列</label>
            <input
              type="text"
              value={storageSettings.connectionString}
              onChange={(e) => setStorageSettings({ ...storageSettings, connectionString: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">コンテナ名</label>
            <input
              type="text"
              value={storageSettings.containerName}
              onChange={(e) => setStorageSettings({ ...storageSettings, containerName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiUsers className="mr-2" />
            ユーザー管理設定
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">最大ユーザー数</label>
            <input
              type="number"
              value={userManagementSettings.maxUsers}
              onChange={(e) => setUserManagementSettings({ ...userManagementSettings, maxUsers: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">パスワードポリシー</label>
            <textarea
              value={userManagementSettings.passwordPolicy}
              onChange={(e) => setUserManagementSettings({ ...userManagementSettings, passwordPolicy: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiArchive className="mr-2" />
            バックアップ設定
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">バックアップ頻度</label>
            <select
              value={backupSettings.frequency}
              onChange={(e) => setBackupSettings({ ...backupSettings, frequency: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">保持期間</label>
            <input
              type="text"
              value={backupSettings.retentionPeriod}
              onChange={(e) => setBackupSettings({ ...backupSettings, retentionPeriod: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiZap className="mr-2" />
            パフォーマンス設定
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">キャッシュサイズ (MB)</label>
            <input
              type="number"
              value={performanceSettings.cacheSize}
              onChange={(e) => setPerformanceSettings({ ...performanceSettings, cacheSize: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">最大同時接続数</label>
            <input
              type="number"
              value={performanceSettings.maxConcurrentConnections}
              onChange={(e) => setPerformanceSettings({ ...performanceSettings, maxConcurrentConnections: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FiSave className="mr-2" />
          設定を保存
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;