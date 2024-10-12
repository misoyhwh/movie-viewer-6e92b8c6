import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { scheduleJob } from 'node-schedule';
import { BlobServiceClient } from '@azure/storage-blob';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // バックアップスケジュールの設定を取得
    const { data: backupSettings, error: settingsError } = await supabase
      .from('system_settings')
      .select('backup_settings')
      .single();

    if (settingsError) throw settingsError;

    const { frequency, retentionPeriod } = backupSettings.backup_settings;

    // バックアップジョブのスケジューリング
    scheduleJob(frequency, async () => {
      try {
        // データベースのバックアップ
        const { data: dbBackup, error: dbError } = await supabase.rpc('backup_database');
        if (dbError) throw dbError;

        // Azure Blob Storageの接続情報を取得
        const { data: storageSettings, error: storageError } = await supabase
          .from('system_settings')
          .select('storage_settings')
          .single();

        if (storageError) throw storageError;

        const { connectionString, containerName } = storageSettings.storage_settings;

        // Azure Blob Storageクライアントの初期化
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // 動画ファイルとサムネイル画像のバックアップ
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('file_path, thumbnail_path');

        if (videosError) throw videosError;

        for (const video of videos) {
          const videoBlob = containerClient.getBlobClient(video.file_path);
          const thumbnailBlob = containerClient.getBlobClient(video.thumbnail_path);

          await videoBlob.beginCopyFromURL(video.file_path);
          await thumbnailBlob.beginCopyFromURL(video.thumbnail_path);
        }

        // システム設定ファイルのバックアップ
        const { data: systemSettings, error: systemSettingsError } = await supabase
          .from('system_settings')
          .select('*');

        if (systemSettingsError) throw systemSettingsError;

        const settingsBlob = containerClient.getBlockBlobClient('system_settings_backup.json');
        await settingsBlob.upload(JSON.stringify(systemSettings), JSON.stringify(systemSettings).length);

        // バックアップの完了をログに記録
        await supabase.from('system_logs').insert({
          event_type: 'バックアップ',
          event_description: 'システムバックアップが完了しました',
        });

        // 管理者に通知
        const notificationContent = await getLlmModelAndGenerateContent(
          "Gemini",
          "あなたはシステム管理者向けの通知を生成するアシスタントです。",
          "システムバックアップが完了したことを通知する簡潔なメッセージを生成してください。"
        );

        await axios.post('/api/send-notification', {
          title: 'システムバックアップ完了',
          content: notificationContent,
          userRole: 'admin'
        });

        console.log('バックアップが正常に完了しました');
      } catch (error) {
        console.error('バックアップ中にエラーが発生しました:', error);
        
        // エラーをログに記録
        await supabase.from('system_logs').insert({
          event_type: 'バックアップエラー',
          event_description: `バックアップ中にエラーが発生しました: ${error.message}`,
        });

        // 管理者にエラー通知
        await axios.post('/api/send-notification', {
          title: 'バックアップエラー',
          content: `システムバックアップ中にエラーが発生しました: ${error.message}`,
          userRole: 'admin'
        });
      }
    });

    res.status(200).json({ message: 'バックアップスケジュールが設定されました' });
  } catch (error) {
    console.error('バックアップスケジュールの設定中にエラーが発生しました:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}