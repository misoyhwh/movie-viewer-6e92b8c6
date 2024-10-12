import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event } = req.body;

    // イベントに基づいて通知を生成
    const notificationContent = await generateNotificationContent(event);

    // 通知の送信先ユーザーを決定
    const targetUsers = await determineTargetUsers(event);

    // 各ユーザーに通知を送信
    for (const userId of targetUsers) {
      await sendNotificationToUser(userId, notificationContent);
    }

    res.status(200).json({ message: '通知が正常に送信されました' });
  } catch (error) {
    console.error('通知の送信中にエラーが発生しました:', error);
    res.status(500).json({ error: '通知の送信中にエラーが発生しました' });
  }
}

async function generateNotificationContent(event: any): Promise<string> {
  try {
    const systemPrompt = "あなたはユーザー通知を生成するAIアシスタントです。与えられたイベント情報に基づいて、簡潔で明確な通知メッセージを作成してください。";
    const userPrompt = `以下のイベントに基づいて通知メッセージを生成してください：${JSON.stringify(event)}`;

    const response = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);
    return response;
  } catch (error) {
    console.error('通知内容の生成に失敗しました:', error);
    return '新しいコンテンツが利用可能です。チェックしてみてください！';
  }
}

async function determineTargetUsers(event: any): Promise<string[]> {
  try {
    // イベントタイプに基づいてターゲットユーザーを決定するロジックを実装
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('notification_settings', true);

    if (error) throw error;

    return users.map(user => user.id);
  } catch (error) {
    console.error('ターゲットユーザーの決定に失敗しました:', error);
    return [];
  }
}

async function sendNotificationToUser(userId: string, content: string): Promise<void> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('notification_settings')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (user.notification_settings) {
      // 通知をデータベースに保存
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: content,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // ここで必要に応じてプッシュ通知やメール通知を送信するロジックを追加
    }
  } catch (error) {
    console.error(`ユーザー ${userId} への通知送信に失敗しました:`, error);
  }
}