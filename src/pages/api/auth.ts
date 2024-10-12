import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      throw userError;
    }

    // JWTトークンの生成
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
      },
    });
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ error: '認証中にエラーが発生しました' });
  }
}