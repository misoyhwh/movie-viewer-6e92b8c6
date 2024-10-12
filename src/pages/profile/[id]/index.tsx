import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaUser, FaLock, FaBell } from 'react-icons/fa';

const UserProfile = () => {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState({
    username: '',
    email: '',
    role: '',
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        const { data, error } = await supabase
          .from('users')
          .select('username, email, role')
          .eq('id', id)
          .single();

        if (error) {
          console.error('ユーザー情報の取得に失敗しました', error);
        } else {
          setUser(data);
        }
      }
    };

    fetchUser();
  }, [id]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('users')
      .update({ username: user.username, email: user.email })
      .eq('id', id);

    if (error) {
      console.error('プロフィールの更新に失敗しました', error);
    } else {
      alert('プロフィールを更新しました');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">ユーザープロフィール</h1>
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
                <FaUser className="inline-block mr-2" />
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                <FaUser className="inline-block mr-2" />
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">パスワード変更</h2>
              <div className="mb-4">
                <label htmlFor="current" className="block text-gray-700 font-bold mb-2">
                  <FaLock className="inline-block mr-2" />
                  現在のパスワード
                </label>
                <input
                  type="password"
                  id="current"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="new" className="block text-gray-700 font-bold mb-2">
                  <FaLock className="inline-block mr-2" />
                  新しいパスワード
                </label>
                <input
                  type="password"
                  id="new"
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirm" className="block text-gray-700 font-bold mb-2">
                  <FaLock className="inline-block mr-2" />
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  id="confirm"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">通知設定</h2>
              <div className="flex items-center mb-2">
                <FaBell className="mr-2" />
                <label htmlFor="email" className="mr-2">メール通知</label>
                <input
                  type="checkbox"
                  id="email"
                  name="email"
                  checked={notifications.email}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
              <div className="flex items-center">
                <FaBell className="mr-2" />
                <label htmlFor="push" className="mr-2">プッシュ通知</label>
                <input
                  type="checkbox"
                  id="push"
                  name="push"
                  checked={notifications.push}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;