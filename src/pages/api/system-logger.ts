import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { event, userId, details } = req.body;

    // イベントの種類、発生時刻、関連ユーザー情報などを含むログエントリーを生成
    const logEntry = {
      event_type: event,
      event_description: details,
      user_id: userId,
      created_at: new Date().toISOString(),
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    // ログエントリーをデータベースに保存
    const { data, error } = await supabase
      .from('system_logs')
      .insert(logEntry);

    if (error) throw error;

    // 重要なセキュリティイベントの場合、管理者に通知を送る
    if (event === 'security_breach' || event === 'unauthorized_access') {
      await sendAdminNotification(logEntry);
    }

    // 古いログエントリーのアーカイブ（例：30日以上前のログ）
    await archiveOldLogs();

    res.status(200).json({ message: 'ログが正常に記録されました' });
  } catch (error) {
    console.error('ログの記録中にエラーが発生しました:', error);
    res.status(500).json({ error: 'ログの記録中にエラーが発生しました' });
  }
}

async function sendAdminNotification(logEntry: any) {
  // 管理者への通知ロジックを実装
  // 例: メール送信、Slack通知など
  const adminNotificationPrompt = `
    重要なセキュリティイベントが発生しました。
    イベントタイプ: ${logEntry.event_type}
    説明: ${logEntry.event_description}
    ユーザーID: ${logEntry.user_id}
    発生時刻: ${logEntry.created_at}
    IPアドレス: ${logEntry.ip_address}
    
    適切な対応を行ってください。
  `;

  try {
    const notificationContent = await getLlmModelAndGenerateContent(
      "ChatGPT",
      "あなたはセキュリティ専門家です。重要なセキュリティイベントに対する適切な対応策を提案してください。",
      adminNotificationPrompt
    );

    console.log('管理者通知内容:', notificationContent);
    // ここで実際の通知送信処理を実装（メール送信やSlack通知など）
  } catch (error) {
    console.error('管理者通知の生成中にエラーが発生しました:', error);
  }
}

async function archiveOldLogs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // 30日以上前のログを取得
    const { data: oldLogs, error: fetchError } = await supabase
      .from('system_logs')
      .select('*')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (fetchError) throw fetchError;

    if (oldLogs && oldLogs.length > 0) {
      // アーカイブテーブルに古いログを挿入
      const { error: insertError } = await supabase
        .from('archived_logs')
        .insert(oldLogs);

      if (insertError) throw insertError;

      // 元のテーブルから古いログを削除
      const { error: deleteError } = await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (deleteError) throw deleteError;

      console.log(`${oldLogs.length}件の古いログがアーカイブされました`);
    }
  } catch (error) {
    console.error('ログのアーカイブ中にエラーが発生しました:', error);
  }
}