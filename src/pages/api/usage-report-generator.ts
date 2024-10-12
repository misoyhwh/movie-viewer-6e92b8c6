import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { startDate, endDate } = req.body;

  try {
    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from('view_history')
      .select('*')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate);

    if (error) throw error;

    // データを分析し、統計情報を計算
    const viewCountData = processViewCountData(data);
    const popularVideosData = processPopularVideosData(data);
    const userActivityData = processUserActivityData(data);

    // AIを使用してレポートの要約を生成
    const summaryPrompt = `${startDate}から${endDate}までの期間の動画視聴データに基づいて、以下の点について簡潔な要約を作成してください：
    1. 全体的な視聴傾向
    2. 最も人気のある動画とその特徴
    3. ユーザーアクティビティの傾向
    4. 改善が必要な点や注目すべき事項`;

    const summary = await getLlmModelAndGenerateContent("Gemini", "あなたは動画分析の専門家です。", summaryPrompt);

    // レポートデータを作成
    const reportData = {
      summary,
      viewCountData,
      popularVideosData,
      userActivityData,
    };

    // PDFレポートを生成（この部分は実際のPDF生成ロジックに置き換える必要があります）
    const pdfBuffer = await generatePdfReport(reportData);

    // レポートを一時的に保存し、ダウンロードURLを生成
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('reports')
      .upload(`usage_report_${startDate}_${endDate}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase
      .storage
      .from('reports')
      .getPublicUrl(`usage_report_${startDate}_${endDate}.pdf`);

    res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('レポート生成エラー:', error);
    res.status(500).json({ error: 'レポートの生成中にエラーが発生しました' });
  }
}

function processViewCountData(data: any[]) {
  // 実際のデータ処理ロジックをここに実装
  // この例ではサンプルデータを返しています
  return {
    labels: ['1日目', '2日目', '3日目', '4日目', '5日目', '6日目', '7日目'],
    datasets: [{
      label: '視聴回数',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };
}

function processPopularVideosData(data: any[]) {
  // 実際のデータ処理ロジックをここに実装
  // この例ではサンプルデータを返しています
  return {
    labels: ['動画A', '動画B', '動画C', '動画D', '動画E'],
    datasets: [{
      label: '視聴回数',
      data: [300, 250, 200, 150, 100],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }],
  };
}

function processUserActivityData(data: any[]) {
  // 実際のデータ処理ロジックをここに実装
  // この例ではサンプルデータを返しています
  return {
    labels: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    datasets: [{
      label: 'アクティブユーザー数',
      data: [120, 190, 30, 50, 20, 30, 40],
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    }],
  };
}

async function generatePdfReport(reportData: any) {
  // ここではPDF生成のためのライブラリ（例：PDFKit）を使用することを想定しています
  // 実際のPDF生成ロジックに置き換える必要があります
  // この例ではダミーのバッファを返しています
  return Buffer.from('ダミーPDFデータ');
}