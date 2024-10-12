import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    // データベースからアナリティクスデータを取得
    const { data, error } = await supabase.rpc('get_analytics_data');

    if (error) {
      throw error;
    }

    // データが正常に取得できた場合
    if (data) {
      return res.status(200).json(data);
    }

    // データがない場合はAI APIを使用してサンプルデータを生成
    const systemPrompt = "あなたは動画管理システムのアナリティクスデータを生成するAIアシスタントです。";
    const userPrompt = "動画管理システムのアナリティクスデータのサンプルを生成してください。総ユーザー数、総動画数、総視聴回数、平均視聴時間、過去5ヶ月の視聴回数トレンド、人気動画トップ3、過去5日間のユーザーアクティビティを含めてください。";

    const aiResponse = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);

    if (aiResponse) {
      const sampleData = JSON.parse(aiResponse);
      return res.status(200).json(sampleData);
    } else {
      throw new Error("AI APIからのレスポンスの解析に失敗しました");
    }
  } catch (error) {
    console.error('アナリティクスデータの取得に失敗しました:', error);

    // エラー時のサンプルデータ
    const sampleData = {
      summary_stats: {
        totalUsers: 1000,
        totalVideos: 500,
        totalViews: 10000,
        averageWatchTime: 15,
      },
      trend_data: {
        labels: ['1月', '2月', '3月', '4月', '5月'],
        datasets: [
          {
            label: '視聴回数',
            data: [500, 600, 750, 800, 1000],
            borderColor: '#3366CC',
            backgroundColor: 'rgba(51, 102, 204, 0.5)',
          },
        ],
      },
      popular_videos: [
        { title: '人気動画1', views: 1000 },
        { title: '人気動画2', views: 800 },
        { title: '人気動画3', views: 600 },
      ],
      user_activity_data: {
        labels: ['月', '火', '水', '木', '金'],
        datasets: [
          {
            label: 'アクティブユーザー数',
            data: [100, 120, 150, 130, 180],
            backgroundColor: '#FF9900',
          },
        ],
      },
    };

    return res.status(200).json(sampleData);
  }
}