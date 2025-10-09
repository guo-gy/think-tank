'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { marked } from 'marked';
import 'github-markdown-css/github-markdown-light.css';
import { useSession } from 'next-auth/react';

export default function ArticleDetail({ articleId }) {
  const { data: session } = useSession();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  // const [imgIndex, setImgIndex] = useState(0);
  const [approving, setApproving] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // 评论区相关
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    fetch(`/api/articles/${articleId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        const art = data.data || data.article || null;
        setArticle(art);
        setError('');
        if (art && art.content) {
          setHtml(marked.parse(art.content));
        } else {
          setHtml('');
        }
        setLikeCount(Array.isArray(art?.likes) ? art.likes.length : 0);
        setLiked(Array.isArray(art?.likes) && session?.user ? art.likes.includes(session.user.id) : false);
        console.log('[ArticleDetail] 文章数据:', art);
      })
      .catch((err) => {
        setError('文章加载失败：' + err.message);
        toast.error('文章加载失败');
      })
      .finally(() => setLoading(false));
  }, [articleId, session?.user]);

  // 获取评论列表
  useEffect(() => {
    if (!articleId) return;
    setCommentLoading(true);
    fetch(`/api/articles/${articleId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.comments || []);
        console.log('[ArticleDetail] 评论数据:', data.comments || []);
      })
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
  }, [articleId]);

  // 附件id数据
  const [attachmentsIds, setAttachmentsIds] = useState([]);

  // 获取附件id列表
  useEffect(() => {
    if (!articleId) return;
    fetch(`/api/articles/${articleId}/attachments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.attachments)) {
          setAttachmentsIds(data.attachments);
          console.log('[ArticleDetail] 附件id:', data.attachments);
        } else {
          setAttachmentsIds([]);
          console.log('[ArticleDetail] 附件id(空):', []);
        }
      })
      .catch(() => {
        setAttachmentsIds([]);
        console.log('[ArticleDetail] 附件id(异常):', []);
      });
  }, [articleId]);

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  // 审核通过操作
  async function handleApprove() {
    if (!articleId) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('审核通过！');
        setArticle((a) => ({ ...a, status: 'PUBLIC' }));
      } else {
        toast.error(data.message || '审核失败');
      }
    } catch (e) {
      toast.error('审核失败');
    } finally {
      setApproving(false);
    }
  }

  // 审核拒绝操作
  async function handleReject() {
    if (!articleId) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/approve`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('已拒绝！');
        setArticle((a) => ({ ...a, status: 'PRIVATE' }));
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (e) {
      toast.error('操作失败');
    } finally {
      setApproving(false);
    }
  }

  // 点赞操作
  async function handleLike() {
    if (!articleId || !session?.user) {
      toast.error('请先登录');
      return;
    }
    setLiking(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        toast.error(data.message || '点赞失败');
      }
    } catch (e) {
      toast.error('点赞失败');
    } finally {
      setLiking(false);
    }
  }

  // 提交评论
  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!session?.user) {
      toast.error('请先登录');
      return;
    }
    if (!commentContent.trim()) {
      toast.error('评论内容不能为空');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentContent('');
        setComments((c) => [data.comment, ...c]);
        toast.success('评论成功');
      } else {
        toast.error(data.message || '评论失败');
      }
    } catch {
      toast.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  }

  //删除评论
  async function handleDeleteComment(commentId) {
    // 确认删除操作
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }
    try {
      // 发送删除请求
      const res = await fetch(`/api/articles/${articleId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        // 从评论列表中移除已删除的评论
        setComments(comments.filter((comment) => comment._id !== commentId));
        toast.success('评论已删除');
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除评论出错:', error);
      toast.error('删除失败，请稍后重试');
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400">文章加载中...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
  if (!article) return <div className="py-20 text-center text-gray-400">未找到文章</div>;

  return (
    <div className="fixed inset-0 w-screen h-screen box-border flex flex-row gap-8 bg-gradient-to-br from-indigo-50 to-white p-8 pt-24">
      {/* 主内容区 7/10 */}
      <div className="flex-[7] min-w-0 bg-white/95 rounded-3xl shadow-2xl p-12 border border-gray-100 flex flex-col items-center relative h-full min-h-0 overflow-y-auto">
        {/* 左侧按钮区 */}
        <div className="absolute -left-32 top-8 flex flex-col gap-6 items-center z-20">
          {article.status === 'PENDING' && isAdmin && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-2xl shadow-lg border-2 border-green-200 hover:from-green-500 hover:to-green-700 transition-all text-lg">
              {approving ? '正在通过...' : '通过审核'}
            </button>
          )}
          {/* 点赞按钮 */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl border-2 shadow font-bold text-lg transition-all ${
              liked ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'
            }`}>
            {/* 更换为更现代的爱心图标 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#f43f5e' : 'none'} stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" />
            </svg>
            <span>{likeCount}</span>
          </button>
        </div>
        <h1 className="text-4xl font-extrabold mb-6 text-indigo-800 text-center drop-shadow">{article.title}</h1>
        <div className="text-gray-500 text-base mb-8 flex flex-wrap gap-6 justify-center">
          <span>分类：{article.category}</span>
          <span>作者：{article.author?.username || '未知'}</span>
          <span>
            发布时间：
            {article.createdAt ? new Date(article.createdAt).toLocaleString() : ''}
          </span>
        </div>
        <article className="markdown-body w-full max-w-3xl text-lg leading-relaxed bg-white/0" style={{ minHeight: 320 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {/* 评论区 3/10 */}
      <div className="flex-[3] min-w-[320px] max-w-sm flex flex-col gap-6 h-full">
        {/* 点赞卡片或审核卡片 */}
        {isAdmin && article?.status === 'PENDING' ? (
          <div className="w-full flex gap-2">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 flex flex-col items-center justify-center rounded-3xl shadow-xl border border-green-200 bg-gradient-to-r from-green-100 to-green-200 text-green-700 font-bold text-lg p-8 transition-all hover:from-green-200 hover:to-green-300 disabled:opacity-60"
              style={{ minHeight: 96 }}>
              {approving ? '正在通过...' : '审核通过'}
            </button>
            <button
              onClick={handleReject}
              disabled={approving}
              className="flex-1 flex flex-col items-center justify-center rounded-3xl shadow-xl border border-red-200 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-bold text-lg p-8 transition-all hover:from-red-200 hover:to-red-300 disabled:opacity-60"
              style={{ minHeight: 96 }}>
              审核拒绝
            </button>
          </div>
        ) : (
          <>
            {/* 使用flex容器让两个按钮并排显示 */}
            <div className="flex gap-4">
              {/* 点赞按钮 - 占一半宽度 */}
              <div
                onClick={liking ? undefined : handleLike}
                className={`flex-1 cursor-pointer select-none flex flex-col items-center justify-center rounded-3xl shadow-xl border border-gray-100 p-8 font-bold text-lg transition-all duration-150
      ${liked ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-white/90 border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'}
      ${liking ? 'opacity-60 pointer-events-none' : ''}`}
                style={{ minHeight: 96 }}
                title={session?.user ? (liked ? '取消点赞' : '点赞') : '请先登录'}>
                <div className="flex items-center gap-3">
                  {/* 爱心图标 */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      lineHeight: '0',
                    }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={liked ? '#f43f5e' : 'none'}
                      stroke="#f43f5e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: 'block' }}>
                      <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" />
                    </svg>
                  </span>
                  <span className="text-2xl font-extrabold">{likeCount}</span>
                </div>
              </div>
              {/* 编辑按钮 - 仅作者可见，占一半宽度 */}
              {String(article?.author?.email) === String(session?.user?.email) && (
                <div
                  onClick={() => {
                    // 跳转到编辑页面，假设文章ID为article.id
                    window.location.href = `/write/${articleId}/edit`;
                  }}
                  className="flex-1 cursor-pointer select-none flex flex-col items-center justify-center rounded-3xl shadow-xl border border-gray-100 p-8 font-bold text-lg transition-all duration-150 bg-white/90 text-blue-600 hover:bg-blue-50"
                  style={{ minHeight: 96 }}
                  title="编辑文章">
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        lineHeight: '0',
                      }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </span>
                    <span className="text-2xl font-extrabold">编辑</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {/* 评论区卡片 */}
        <div
          className={`w-full rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-stretch h-full min-h-[350px] overflow-y-auto bg-white/90 ${
            isAdmin && article?.status === 'PENDING' ? 'opacity-60 pointer-events-none grayscale' : ''
          }`}>
          <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">评论区</h2>
          {/* 评论输入框 */}
          <form onSubmit={handleSubmitComment} className="mb-6 flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-gray-50 placeholder-gray-800 text-gray-900"
              placeholder="写下你的评论..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={submitting || (isAdmin && article?.status === 'PENDING')}
              maxLength={300}
            />
            <button
              type="submit"
              disabled={submitting || (isAdmin && article?.status === 'PENDING')}
              className="px-5 py-2 rounded-xl bg-indigo-500 text-white font-bold shadow hover:bg-indigo-600 transition-all disabled:opacity-60">
              {submitting ? '发送中...' : '发送'}
            </button>
          </form>
          {/* 评论列表 */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {commentLoading ? (
              <div className="text-gray-400 text-center py-8">评论加载中...</div>
            ) : comments.length === 0 ? (
              <div className="text-gray-400 text-center py-8">暂无评论，快来抢沙发吧！</div>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="bg-gray-50 rounded-xl px-4 py-3 shadow flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-bold text-indigo-700">{c.author?.username || '匿名'}</span>
                    <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                    {session?.user?.email === c.author?.email && (
                      <button className="text-gray-500 hover:text-red-700 text-xs px-2 py-1 cursor-pointer" onClick={() => handleDeleteComment(c._id)}>
                        删除
                      </button>
                    )}
                  </div>
                  <div className="text-gray-800 text-base break-words">{c.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* 附件下载卡片 */}
        {attachmentsIds.length > 0 && (
          <div className="w-full rounded-3xl shadow-xl border border-indigo-100 p-8 flex flex-col items-stretch bg-white/90" style={{ marginTop: 0 }}>
            <h3
              style={{
                fontWeight: 'bold',
                fontSize: '1.1em',
                marginBottom: 12,
                color: '#6366f1',
                letterSpacing: 1,
                textAlign: 'center',
              }}>
              📎 附件下载
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                justifyContent: 'center',
                // 限制最大高度为80px，可根据需求调整
                maxHeight: '80px',
                overflowY: 'auto',
              }}>
              {attachmentsIds.map((id, idx) => (
                <a
                  key={id}
                  href={`/api/files/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                    borderRadius: '1rem',
                    padding: '10px 18px',
                    boxShadow: '0 1px 4px 0 rgba(99,102,241,0.07)',
                    border: '1px solid #e0e7ff',
                    color: '#6366f1',
                    fontWeight: 500,
                    fontSize: '1em',
                    textDecoration: 'none',
                    transition: 'all 0.18s',
                    minWidth: 110,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}>
                  <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M12 5v8.59a2 2 0 0 1-4 0V5" />
                    <rect x="8" y="15" width="8" height="4" rx="2" />
                  </svg>
                  <span style={{ whiteSpace: 'nowrap' }}>附件{idx + 1}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
