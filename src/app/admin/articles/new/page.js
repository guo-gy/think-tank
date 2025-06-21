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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">发布新文章</h1>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input type="text" id="title" value={title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50" />
          <p className="text-xs text-gray-500 mt-1">用于文章的URL，例如 &quot;my-new-article&quot;。</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          {/* 这里未来会替换为富文本编辑器 */}
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="在此输入文章内容 (支持 Markdown 或 HTML，取决于后续处理)..."
          ></textarea>
          {/* 
          <RichTextEditor value={content} onChange={setContent} /> 
          */}
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">摘要 (可选)</label>
          <textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="NEWS">资讯 (NEWS)</option>
              <option value="KNOWLEDGE">知识库 (KNOWLEDGE)</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">分类 (可选)</label>
            <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">标签 (可选, 逗号分隔)</label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="flex items-center">
          <input id="isPublished" name="isPublished" type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">立即发布</label>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            {loading ? '正在提交...' : '发布文章'}
          </button>
        </div>
      </form>
    </div>
  );
}