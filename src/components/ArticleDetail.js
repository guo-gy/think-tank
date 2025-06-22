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
    const [imgIndex, setImgIndex] = useState(0);
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
            .then(res => res.json())
            .then(data => setComments(data.comments || []))
            .catch(() => setComments([]))
            .finally(() => setCommentLoading(false));
    }, [articleId]);

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

    // 审核通过操作
    async function handleApprove() {
        if (!articleId) return;
        setApproving(true);
        try {
            const res = await fetch(`/api/articles/${articleId}/approve`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success('审核通过！');
                setArticle(a => ({ ...a, status: 'PUBLIC' }));
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
            const res = await fetch(`/api/articles/${articleId}/approve`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                toast.success('已拒绝！');
                setArticle(a => ({ ...a, status: 'PRIVATE' }));
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
            const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
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
                body: JSON.stringify({ content: commentContent })
            });
            const data = await res.json();
            if (res.ok) {
                setCommentContent('');
                setComments(c => [data.comment, ...c]);
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

    if (loading) return <div className="py-20 text-center text-gray-400">文章加载中...</div>;
    if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
    if (!article) return <div className="py-20 text-center text-gray-400">未找到文章</div>;

    // 图片轮播数据
    let images = [];
    if (Array.isArray(article.images) && article.images.length > 0) {
        images = article.images;
    } else if (article.cover) {
        images = [article.cover];
    }

    // 附件数据
    const attachments = Array.isArray(article.attachments) ? article.attachments.filter(f => f.url) : [];

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
                            className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-2xl shadow-lg border-2 border-green-200 hover:from-green-500 hover:to-green-700 transition-all text-lg"
                        >
                            {approving ? '正在通过...' : '通过审核'}
                        </button>
                    )}
                    {/* 点赞按钮 */}
                    <button
                        onClick={handleLike}
                        disabled={liking}
                        className={`flex items-center gap-2 px-5 py-2 rounded-2xl border-2 shadow font-bold text-lg transition-all ${liked ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'}`}
                    >
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
                    <span>发布时间：{article.createdAt ? new Date(article.createdAt).toLocaleString() : ''}</span>
                </div>
                {/* 图片轮播 */}
                {images.length > 0 && (
                    <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
                        <div className="relative w-full h-80 flex items-center justify-center bg-gray-50 rounded-2xl shadow overflow-hidden">
                            <img src={images[imgIndex]} alt={`图片${imgIndex + 1}`} className="object-contain w-full h-full" />
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setImgIndex(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-indigo-100 rounded-full p-2 shadow border border-gray-200 z-10">
                                        <svg width="24" height="24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                    </button>
                                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-indigo-100 rounded-full p-2 shadow border border-gray-200 z-10">
                                        <svg width="24" height="24" fill="none"><path d="M9 6l6 6-6 6" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                    </button>
                                </>
                            )}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {images.map((img, idx) => (
                                        <span key={idx} className={`w-2.5 h-2.5 rounded-full ${imgIndex === idx ? 'bg-indigo-500' : 'bg-gray-300'} block`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <article className="markdown-body w-full max-w-3xl text-lg leading-relaxed bg-white/0" style={{ minHeight: 320 }} dangerouslySetInnerHTML={{ __html: html }} />
                {/* 附件区 */}
                {attachments.length > 0 && (
                    <div className="w-full max-w-3xl mt-12 flex flex-col gap-3 items-start">
                        <div className="text-base font-semibold text-indigo-700 mb-2">附件下载：</div>
                        {attachments.map((f, idx) => (
                            <a key={idx} href={f.url} download={f.fileName || `附件${idx + 1}`} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 shadow-sm font-medium transition-all" target="_blank" rel="noopener noreferrer">
                                <svg width="18" height="18" fill="none"><path d="M9 3v9m0 0l-3-3m3 3l3-3M4 15h10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" /></svg>
                                {f.fileName || f.url}
                            </a>
                        ))}
                    </div>
                )}
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
                            style={{ minHeight: 96 }}
                        >
                            {approving ? '正在通过...' : '审核通过'}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={approving}
                            className="flex-1 flex flex-col items-center justify-center rounded-3xl shadow-xl border border-red-200 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-bold text-lg p-8 transition-all hover:from-red-200 hover:to-red-300 disabled:opacity-60"
                            style={{ minHeight: 96 }}
                        >
                            审核拒绝
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={liking ? undefined : handleLike}
                        className={`w-full cursor-pointer select-none flex flex-col items-center justify-center rounded-3xl shadow-xl border border-gray-100 p-8 font-bold text-lg transition-all duration-150
              ${liked ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-white/90 border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'}
              ${liking ? 'opacity-60 pointer-events-none' : ''}`}
                        style={{ minHeight: 96 }}
                        title={session?.user ? (liked ? '取消点赞' : '点赞') : '请先登录'}
                    >
                        <div className="flex items-center gap-3">
                            {/* 爱心图标用 viewBox 0 0 24 24，宽高20，竖直居中，彻底避免裁切 */}
                            <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'24px',height:'24px',lineHeight:'0'}}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#f43f5e' : 'none'} stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{display:'block'}}>
                                <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" />
                              </svg>
                            </span>
                            <span className="text-2xl font-extrabold">{likeCount}</span>
                        </div>
                    </div>
                )}
                {/* 评论区卡片 */}
                <div className={`w-full rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-stretch h-full min-h-0 overflow-y-auto bg-white/90 ${isAdmin && article?.status === 'PENDING' ? 'opacity-60 pointer-events-none grayscale' : ''}`}>
                    <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">评论区</h2>
                    {/* 评论输入框 */}
                    <form onSubmit={handleSubmitComment} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-gray-50 placeholder-gray-800 text-gray-900"
                            placeholder="写下你的评论..."
                            value={commentContent}
                            onChange={e => setCommentContent(e.target.value)}
                            disabled={submitting || (isAdmin && article?.status === 'PENDING')}
                            maxLength={300}
                        />
                        <button
                            type="submit"
                            disabled={submitting || (isAdmin && article?.status === 'PENDING')}
                            className="px-5 py-2 rounded-xl bg-indigo-500 text-white font-bold shadow hover:bg-indigo-600 transition-all disabled:opacity-60"
                        >{submitting ? '发送中...' : '发送'}</button>
                    </form>
                    {/* 评论列表 */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                        {commentLoading ? (
                            <div className="text-gray-400 text-center py-8">评论加载中...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">暂无评论，快来抢沙发吧！</div>
                        ) : (
                            comments.map(c => (
                                <div key={c._id} className="bg-gray-50 rounded-xl px-4 py-3 shadow flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-bold text-indigo-700">{c.author?.username || '匿名'}</span>
                                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                                    </div>
                                    <div className="text-gray-800 text-base break-words">{c.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
