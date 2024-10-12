import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: '動画IDが必要です' });
  }

  try {
    // 動画情報の取得
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError) throw videoError;

    if (!video) {
      return res.status(404).json({ error: '動画が見つかりません' });
    }

    // Azure Blob Storageから動画ファイルを取得
    const { data: blobData, error: blobError } = await supabase
      .storage
      .from('videos')
      .createSignedUrl(video.file_path, 3600); // 1時間有効な署名付きURLを生成

    if (blobError) throw blobError;

    // ストリーミングURLの生成
    const streamingUrl = blobData.signedUrl;

    // 視聴回数の更新
    const { error: updateError } = await supabase
      .from('videos')
      .update({ view_count: video.view_count + 1 })
      .eq('id', videoId);

    if (updateError) throw updateError;

    // 視聴履歴の記録
    const { error: historyError } = await supabase
      .from('view_history')
      .insert({
        user_id: req.headers['x-user-id'], // ユーザーIDはヘッダーから取得する想定
        video_id: videoId,
      });

    if (historyError) throw historyError;

    // レスポンスの返却
    res.status(200).json({
      video: {
        ...video,
        streaming_url: streamingUrl,
      },
    });
  } catch (error) {
    console.error('動画ストリーミングエラー:', error);
    res.status(500).json({ error: '動画のストリーミングに失敗しました' });
  }
}