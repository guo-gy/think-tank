// src/app/admin/articles/new/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// 假设你有一个富文本编辑器组件，我们稍后会集成
// import RichTextEditor from '@/components/articles/RichTextEditor';

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState(''); // 用于富文本编辑器的内容
  const [excerpt, setExcerpt] = useState('');
  const [type, setType] = useState('NEWS'); // 'NEWS' or 'KNOWLEDGE'
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // 简单用逗号分隔的字符串
  const [isPublished, setIsPublished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 权限检查和重定向
  useEffect(() => {
    if (status === "loading") return; // 等待 session 加载完成
    if (status === "unauthenticated") {
      router.push('/login?callbackUrl=/admin/articles/new'); // 未登录则重定向到登录
      return;
    }
    if (session && session.user.role !== 'ADMIN') {
      router.push('/unauthorized'); // 或者一个通用的未授权页面，或者首页
      // 你也可以创建一个 /unauthorized/page.js 来显示具体的未授权信息
      return;
    }
  }, [session, status, router]);

  // 根据标题自动生成 slug (简易版)
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!title || !slug || !content) {
      setError('标题、Slug 和内容不能为空。');
      setLoading(false);
      return;
    }

    const articleData = {
      title,
      slug,
      content,
      excerpt,
      type,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag), // 将逗号分隔的字符串转为数组
      isPublished,
      // author 会在后端根据 session 自动添加
    };

    try {
      const res = await fetch('/api/articles', { // 我们需要创建这个 API 端点
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || `创建文章失败 (Status: ${res.status})`);
      } else {
        setSuccess(`文章 "${result.data.title}" 创建成功！`);
        // 清空表单或跳转到文章列表/详情页
        setTitle('');
        setSlug('');
        setContent('');
        setExcerpt('');
        // setType('NEWS');
        // setCategory('');
        // setTags('');
        // setIsPublished(false);
        // router.push(`/admin/articles`); // 例如跳转到管理列表
        router.push(`/${result.data.type.toLowerCase()}/${result.data.slug}`); // 跳转到新发布的文章详情页
      }
    } catch (err) {
      console.error("Error creating article:", err);
      setError('创建文章时发生网络错误或未知错误。');
    } finally {
      setLoading(false);
    }
  };

  // 如果 session 还在加载或用户不符合条件，显示加载或不渲染表单
  if (status === "loading" || (status === "authenticated" && session?.user?.role !== 'ADMIN')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>正在加载或验证权限...</p>
      </div>
    );
  }
  // 如果未认证，useEffect 会处理重定向，这里可以返回 null 或一个简单的提示
  if (status === "unauthenticated") {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <p>请先登录...</p>
          </div>
      );
  }


  return (
    <div className="fixed inset-0 w-full min-h-screen bg-white flex flex-col" style={{paddingTop: '80px'}}>
      <div className="flex-1 flex flex-row gap-8 w-full max-w-5xl mx-auto items-stretch px-2 pb-8">
        {/* 左侧：文章配置卡片 */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col">
          <h1 className="text-2xl font-extrabold mb-8 text-indigo-700 text-center tracking-tight">文章配置</h1>
          {error && <p className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 border border-red-200">{error}</p>}
          {success && <p className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 border border-green-200">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-7 flex-1 flex flex-col">
            <div>
              <label htmlFor="title" className="block text-base font-semibold text-gray-700 mb-1">标题</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-lg bg-gray-50 placeholder-gray-500"
                placeholder="请输入文章标题"
                style={{color: "#222"}}
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-base font-semibold text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-lg bg-gray-50 placeholder-gray-500"
                placeholder="如 my-new-article"
                style={{color: "#222"}}
              />
              <p className="text-xs text-gray-400 mt-1">用于文章的URL，例如 <span className="font-mono">my-new-article</span></p>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-base font-semibold text-gray-700 mb-1">摘要 (可选)</label>
              <textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-gray-50 placeholder-gray-500"
                placeholder="一句话描述文章内容"
                style={{color: "#222"}}
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block text-base font-semibold text-gray-700 mb-1">分类 (可选)</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-gray-50 placeholder-gray-500"
                placeholder="如 校园生活、技术分享"
                style={{color: "#222"}}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-base font-semibold text-gray-700 mb-1">标签 (可选, 逗号分隔)</label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-gray-50 placeholder-gray-500"
                placeholder="如 AI, 校园, 经验"
                style={{color: "#222"}}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-base font-semibold text-gray-700 mb-1">类型</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-gray-50"
              >
                <option value="NEWS">新闻</option>
                <option value="NOTICE">通知</option>
                <option value="DOWNLOAD">资料</option>
                <option value="LECTURE">助学</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPublished" className="ml-3 block text-base text-gray-700">立即发布</label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-70 transition"
              >
                {loading ? '正在提交...' : '发布文章'}
              </button>
            </div>
          </form>
        </div>
        {/* 右侧：文章内容卡片 */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">文章内容</h2>
          <textarea
            id="content"
            rows={22}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="flex-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-gray-50 placeholder-gray-500"
            placeholder="在此输入文章内容 (支持 Markdown 或 HTML)..."
            style={{color: "#222", minHeight: 320}}
          ></textarea>
        </div>
      </div>
    </div>
  );
}