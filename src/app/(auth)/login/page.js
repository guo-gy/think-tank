// src/app/(auth)/login/page.js

"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';

// 可以在这里配置全局的toast样式和行为
const toastOptions = {
  duration: 3000, // 提示显示时间3秒
  position: 'top-center' , // 提示位置
  // 可以添加自定义样式
  style: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px 20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginTop: '55px', 
  },
  error: {
    style: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderColor: '#fecaca',
    },
  },
  success: {
    style: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      borderColor: '#bbf7d0',
    },
  },
};
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请输入邮箱和密码', toastOptions);
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      console.log('signIn result:', result);
      if (result?.ok) {
          const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/';
          router.push(callbackUrl);
      } else {
        const errorMessage = result?.error || '邮箱或密码错误';
        toast.error(errorMessage, {
          ...toastOptions,
          error: toastOptions.error,
        });
      }
    } catch (err) {
      console.error('登录错误:', err);
      toast.error('发生意外错误，请联系管理员。', {
        ...toastOptions,
        error: toastOptions.error,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl') || '/';
      router.push(callbackUrl);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <p className="text-lg text-gray-600">正在校验登录状态...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      {/* 左侧图片 6/10 */}
      <div className="hidden md:block md:w-3/5 w-0 h-full relative">
        {/* 在大多数前端框架（如 React、Vue）中，public目录是根目录，正确的路径应该去掉public，直接写成/images/3.jpg */}
        <img
          src="images/3.jpg"
          alt="登录配图"
          className="object-left object-cover w-full h-full"
        />
        {/* 渐变遮罩，右侧淡出过渡 */}
        <div
          className="absolute top-0 right-0 h-full w-128 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,0) 0%, #fff 100%)"
          }}
        />
      </div>
      {/* 右侧登录表单 4/10 */}
      <div className="flex flex-col justify-center items-center w-full md:w-2/5 h-full px-8 bg-white z-10 relative">
        <div
          className="w-full max-w-md absolute left-1/2 -translate-x-1/2"
          style={{ top: "33.3333%" }}
        >
          {/* LOGO区域 */}
          <div className="flex justify-center mb-6">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-800">欢迎登录</h1>
          <p className="text-center text-gray-500 mb-8">山东大学软件学院智库账号登录</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请输入密码"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">
            没有账号？
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}