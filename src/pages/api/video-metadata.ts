import { supabase } from '@/supabase';
import { BlobServiceClient } from '@azure/storage-blob';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    // Azure Blob Storageに接続
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = 'videos';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // 新しくアップロードされた動画ファイルのリストを取得
    const blobs = containerClient.listBlobsFlat();
    const newVideos = [];

    for await (const blob of blobs) {
      const { data, error } = await supabase
        .from('videos')
        .select('file_path')
        .eq('file_path', blob.name)
        .single();

      if (error || !data) {
        newVideos.push(blob);
      }
    }

    // 各動画ファイルのメタデータを抽出し、データベースに保存
    for (const video of newVideos) {
      const blobClient = containerClient.getBlobClient(video.name);
      const properties = await blobClient.getProperties();

      // AIを使用して動画のタイトルと説明を生成
      const prompt = `動画ファイル名: ${video.name}
長さ: ${properties.contentLength} バイト
作成日時: ${properties.createdOn}

この情報から、動画のタイトルと説明を生成してください。`;
      const aiResponse = await getLlmModelAndGenerateContent('Gemini', 'あなたは動画のメタデータを生成するAIアシスタントです。', prompt);

      let title = video.name;
      let description = '';

      if (aiResponse) {
        const aiData = JSON.parse(aiResponse);
        title = aiData.title || video.name;
        description = aiData.description || '';
      }

      const { data, error } = await supabase.from('videos').insert({
        title: title,
        description: description,
        file_path: video.name,
        file_size: properties.contentLength,
        upload_date: properties.createdOn,
      });

      if (error) {
        console.error('動画メタデータの保存に失敗しました:', error);
      }
    }

    // 処理結果をログに記録
    await supabase.from('system_logs').insert({
      event_type: '動画メタデータ取得',
      event_description: `${newVideos.length}件の新しい動画のメタデータを取得し、保存しました。`,
    });

    res.status(200).json({ message: '動画メタデータの取得と保存が完了しました', count: newVideos.length });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    res.status(500).json({ error: '動画メタデータの取得と保存中にエラーが発生しました' });
  }
}