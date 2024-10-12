import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import { supabase } from '@/supabase';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: '動画IDが必要です' });
  }

  try {
    // 1. 動画ファイルの取得
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('file_path')
      .eq('id', videoId)
      .single();

    if (videoError) {
      throw new Error('動画ファイルの取得に失敗しました');
    }

    const videoPath = video.file_path;

    // 2. サムネイル生成
    const thumbnailPath = await generateThumbnail(videoPath);

    // 3. サムネイルのアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(`${videoId}.jpg`, fs.createReadStream(thumbnailPath), {
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      throw new Error('サムネイルのアップロードに失敗しました');
    }

    // 4. サムネイルURLの取得
    const { data: urlData } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(`${videoId}.jpg`);

    const thumbnailUrl = urlData.publicUrl;

    // 5. データベース更新
    const { data: updateData, error: updateError } = await supabase
      .from('videos')
      .update({ thumbnail_path: thumbnailUrl })
      .eq('id', videoId);

    if (updateError) {
      throw new Error('データベースの更新に失敗しました');
    }

    // 一時ファイルの削除
    fs.unlinkSync(thumbnailPath);

    res.status(200).json({ success: true, thumbnailUrl });
  } catch (error) {
    console.error('サムネイル生成エラー:', error);
    res.status(500).json({ error: 'サムネイル生成に失敗しました' });
  }
}

async function generateThumbnail(videoPath) {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join('/tmp', `${uuidv4()}.jpg`);
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['5%'],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '280x158'
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', (err) => reject(err));
  });
}