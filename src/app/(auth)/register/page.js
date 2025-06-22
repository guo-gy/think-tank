"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Toaster, toast } from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/');
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <p className="text-lg text-gray-600">正在校验登录状态...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error('请填写所有信息');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || `注册失败 (状态码: ${res.status})`);
        } else {
          toast.success(data.message + '，即将跳转到登录页...');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        }
      } else {
        await res.text();
        toast.error(`服务器返回了异常响应 (状态码: ${res.status})，请联系管理员。`);
      }
    } catch (err) {
      toast.error('网络异常，无法连接服务器。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      {/* 左侧注册表单 4/10 */}
      <div className="flex flex-col justify-center items-center w-full md:w-2/5 h-full px-8 bg-white z-10 relative">
        <div
          className="w-full max-w-md absolute left-1/2 -translate-x-1/2"
          style={{ top: "33.3333%" }}
        >
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">注册新账号</h2>
          <p className="text-center text-gray-500 mb-6">欢迎加入山东大学软件学院智库</p>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请输入密码（至少6位）"
              />
            </div>
            <div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="请再次输入密码"
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
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            已有账号？
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
              立即登录
            </Link>
          </p>
        </div>
      </div>
      {/* 右侧图片 6/10 */}
      <div className="hidden md:block md:w-3/5 w-0 h-full relative">
        <img
          src="/api/images/3.jpg"
          alt="注册配图"
          className="object-right object-cover w-full h-full"
        />
        {/* 渐变遮罩，左侧淡出过渡 */}
        <div
          className="absolute top-0 left-0 h-full w-128 pointer-events-none"
          style={{
            background: "linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 100%)"
          }}
        />
      </div>
    </div>
  );
}