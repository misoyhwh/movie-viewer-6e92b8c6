import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: '動画IDが必要です' });
  }

  try {
    // 動画の視聴回数を取得
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('view_count')
      .eq('id', videoId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!video) {
      return res.status(404).json({ error: '動画が見つかりません' });
    }

    // 視聴回数を1増やす
    const newViewCount = (video.view_count || 0) + 1;

    // 更新された視聴回数をデータベースに保存
    const { error: updateError } = await supabase
      .from('videos')
      .update({ view_count: newViewCount })
      .eq('id', videoId);

    if (updateError) {
      throw updateError;
    }

    // 視聴履歴テーブルに新しいエントリーを追加
    const { error: historyError } = await supabase
      .from('view_history')
      .insert({
        user_id: req.headers['x-user-id'], // ユーザーIDをヘッダーから取得（認証ミドルウェアで設定されていると仮定）
        video_id: videoId,
      });

    if (historyError) {
      throw historyError;
    }

    res.status(200).json({ success: true, newViewCount });
  } catch (error) {
    console.error('視聴回数の更新中にエラーが発生しました:', error);
    res.status(500).json({ error: '視聴回数の更新中にエラーが発生しました' });
  }
}