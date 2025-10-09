// src/app/admin/articles/write/page.js
'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

export default function NewArticlePage({ params }) {
  const unwrappedParams = use(params);
  const articleId = unwrappedParams.id;

  const router = useRouter();
  const { data: session, status } = useSession();

  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState(''); // 摘要/描述
  const [partition, setPartition] = useState('SQUARE'); // 分区
  const [category, setCategory] = useState('学科分享'); // 分类，默认显示，与下拉菜单保持一致
  const [isPublished, setIsPublished] = useState(false);
  // 多图片上传与封面选择
  const [imageFiles, setImageFiles] = useState([]); // {name，id，size}
  const [coverImage, setCoverImage] = useState(''); //存id
  const [imageList, setImageList] = useState([]); //存id

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // 左右卡片收起状态
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  // 文件上传相关 state
  const [fileList, setFileList] = useState([]); // {name, id, size}
  // const [fileIdList, setFileIdList] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);

  const [comments, setComments] = useState([]);

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
        setTitle(art.title);
        setContent(art.content);
        setDescription(art.description);
        setPartition(art.partition);
        setCategory(art?.category);
        if (art?.status === 'PUBLIC' || art?.status === 'PENDING') {
          setIsPublished(true);
        } else setIsPublished(false);
        setCoverImage(art?.coverImage);
        setImageList(art?.images);
        setComments(art?.commentIds);

        fetchFiles(art?.attachments);
        fetchImageFiles(art?.images);

        console.log('[ArticleDetail] 文章数据:', art);
      })
      .catch((err) => {
        // setError('文章加载失败：' + err.message);
        toast.error('文章加载失败');
      })
      .finally(() => setLoading(false));
  }, [articleId, session?.user]);

  //根据图片id，批量获取图片信息
  const fetchImageFiles = async (imageIds) => {
    try {
      // console.log(imageList[0]);
      const fetchPromises = imageIds.map(async (imageId) => {
        const response = await fetch(`/api/images/${imageId}/info`);
        if (!response.ok) {
          throw new Error(`查询图片 ${imageId} 失败: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
      });
      const imageFiles = await Promise.all(fetchPromises);
      // console.log(imageFiles);
      setImageFiles(imageFiles);
    } catch (error) {
      console.error('批量查询图片失败:', error.message);
    }
  };

  //根据文件id，批量获取文件信息
  const fetchFiles = async (fileIds) => {
    console.log('----');
    console.log(fileIds);
    try {
      // console.log(imageList[0]);
      const fetchPromises = fileIds.map(async (fileId) => {
        const response = await fetch(`/api/files/${fileId}/info`);
        if (!response.ok) {
          throw new Error(`查询文件 ${fileId} 失败: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
      });
      const files = await Promise.all(fetchPromises);
      // console.log(imageFiles);
      setFileList(files);
    } catch (error) {
      console.error('批量查询文件失败:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!title || !content) {
      toast.error('标题和内容不能为空。');
      setLoading(false);
      return;
    }
    // 直接用 imageUrls 和 coverIndex 取封面id
    let statusValue = 'PRIVATE';
    if (isPublished) {
      if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
        statusValue = 'PUBLIC';
      } else {
        statusValue = 'PENDING';
      }
    } else {
      statusValue = 'PRIVATE';
    }

    const articleData = {
      title,
      content,
      description,
      partition,
      attachments: fileList.map((f) => f.id), // 只存一维id数组
      category, // 分类
      status: statusValue,
      coverImage: coverImage,
      images: imageList,
    };

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || `修改文章失败 (Status: ${res.status})`);
      } else {
        toast.success(`文章 "${result.data.title}" 修改成功！`);
        setTitle('');
        setContent('');
        setDescription('');
        router.push(`/${result.data._id}`);
      }
    } catch (err) {
      console.error('Error creating article:', err);
      toast.error('创建文章时发生网络错误或未知错误。');
    } finally {
      setLoading(false);
    }
  };

  // 处理多图片选择，选择即上传
  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    console.log(files);
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    try {
      const uploadRes = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      console.log('uploadResult.ids' + uploadResult.ids);
      const filesWithId = files.map((file, index) => ({
        // 手动提取File的关键属性
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // 新增id
        id: uploadResult.ids[index],
      }));
      console.dir(filesWithId, { depth: null });
      if (uploadRes.ok && Array.isArray(uploadResult.urls)) {
        setImageFiles((prev) => [...prev, ...filesWithId]);
        console.log('imageFiles' + imageFiles);
        setImageList((prev) => [...prev, ...uploadResult.ids]);
        console.log('imageList' + imageList);
      } else {
        toast.error('图片上传失败');
      }
    } catch (err) {
      toast.error('图片上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除图片
  const handleRemoveImage = async (idx) => {
    const deleteId = imageList[idx];
    if (deleteId) {
      try {
        await fetch(`/api/images/${deleteId}`, {
          method: 'DELETE',
        });
      } catch {}
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImageList((prev) => prev.filter((_, i) => i !== idx));
    if (coverImage === imageFiles[idx].id) setCoverImage('');
    // else if (coverIndex > idx) setCoverIndex((c) => c - 1);
  };

  // 在内容区插入图片markdown引用
  const insertImageMarkdown = (file) => {
    // url 为 /api/images/图片id

    console.log(comments);

    const md = `![${file.name}](api/images/${file.id})`;
    // 在光标处插入
    const textarea = document.getElementById('content');
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const scrollTop = textarea.scrollTop;
      setContent(content.slice(0, start) + md + content.slice(end));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + md.length;
        textarea.scrollTop = scrollTop;
      }, 0);
    } else {
      setContent(content + md);
    }
  };

  // 文件上传处理
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setFileUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    try {
      const uploadRes = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      if (uploadRes.ok && Array.isArray(uploadResult.urls) && Array.isArray(uploadResult.ids)) {
        // 组装文件信息，自动带上id
        const newFiles = files.map((f, i) => ({
          name: f.name,
          size: f.size,
          // url: uploadResult.urls[i],
          id: uploadResult.ids[i],
        }));
        setFileList((prev) => [...prev, ...newFiles]);
        toast.success('文件上传成功');
      } else {
        toast.error('文件上传失败');
      }
    } catch (err) {
      toast.error('文件上传失败');
    } finally {
      setFileUploading(false);
    }
  };

  // 文件删除
  const handleRemoveFile = async (idx) => {
    const file = fileList[idx];
    // 前端移除 + 后端删除
    if (file.id) {
      try {
        await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
      } catch {}
    }
    setFileList((prev) => prev.filter((_, i) => i !== idx));
  };

  //删除评论
  async function handleDeleteComment(commentId) {
    try {
      // 发送删除请求
      const res = await fetch(`/api/articles/${articleId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('删除评论出错:', error);
      toast.error('删除失败，请稍后重试');
    }
  }

  //文章删除
  const handleDeleteArticle = async () => {
    // 1. 确认弹窗
    const isConfirm = window.confirm('确定要删除这篇文章吗？删除后无法恢复！');
    if (!isConfirm) return;

    // 2. 加载状态
    setDeleteLoading(true);
    for (let i = imageList.length - 1; i >= 0; i--) {
      await handleRemoveImage(i);
    }
    for (let i = fileList.length - 1; i >= 0; i--) {
      await handleRemoveFile(i);
    }
    for (let i = comments.length - 1; i >= 0; i--) {
      await handleDeleteComment(comments[i]);
    }
    try {
      // 3. 调用删除接口（替换为实际接口地址）
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        alert('删除成功！');
        window.location.href = '/';
      } else {
        alert('删除失败，请重试！');
      }
    } catch (err) {
      console.error('删除错误：', err);
      alert('删除出错，请稍后再试！');
    } finally {
      // 5. 关闭加载状态
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col" style={{ paddingTop: '80px' }}>
      <Toaster position="top-center" toastOptions={{ style: { marginTop: '80px' } }} />
      <div className="flex-1 flex flex-row items-stretch px-0 pb-8" style={{ gap: '48px', width: '100vw' }}>
        {/* 左侧：文章配置卡片 3/10 */}
        <div
          style={{
            marginLeft: 24,
            transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
            width: showLeft ? 340 : 32,
            minWidth: showLeft ? 260 : 32,
            maxWidth: showLeft ? 420 : 32,
            overflow: 'visible',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            zIndex: 2,
          }}>
          <button
            type="button"
            onClick={() => setShowLeft((v) => !v)}
            style={{
              position: 'absolute',
              top: 24,
              right: -20,
              zIndex: 20,
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg,#6366f1 60%,#a5b4fc)',
              border: 'none',
              borderRadius: '50%',
              boxShadow: '0 4px 16px #6366f133',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            className="hover:scale-110 hover:shadow-xl group">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: showLeft ? 'rotate(180deg)' : 'none',
                transition: 'transform .2s',
              }}>
              <path d="M8 6L12 11L8 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showLeft && (
            <div
              className="flex flex-col bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 h-fit backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_32px_#6366f122]"
              style={{ color: '#222', boxShadow: '0 8px 32px #6366f122' }}>
              <h1 className="text-2xl font-extrabold mb-8 text-indigo-700 text-center tracking-tight drop-shadow">文章配置</h1>
              <form onSubmit={handleSubmit} className="space-y-7 flex-1 flex flex-col">
                <div>
                  <label htmlFor="title" className="block text-base font-semibold mb-1 text-indigo-900">
                    标题
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-lg bg-indigo-50/60 placeholder-gray-400 transition"
                    placeholder="请输入文章标题"
                    style={{ color: '#222' }}
                  />
                </div>

                <div>
                  <label htmlFor="partition" className="block text-base font-semibold mb-1 text-indigo-900">
                    分区
                  </label>
                  <select
                    id="partition"
                    value={partition}
                    onChange={(e) => setPartition(e.target.value)}
                    className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 transition"
                    style={{ color: '#222' }}>
                    {session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN' ? (
                      <>
                        <option value="NOTICE" onChange={() => setCategory('日常推文')}>
                          通知
                        </option>
                        <option value="DOWNLOAD" onChange={() => setCategory('朋辈讲义')}>
                          资料
                        </option>
                        <option value="SQUARE" onChange={() => setCategory('学科分享')}>
                          广场
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="SQUARE">广场</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-base font-semibold mb-1 text-indigo-900">
                    分类
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 transition"
                    style={{ color: '#222' }}>
                    {partition === 'DOWNLOAD' ? (
                      <>
                        <option value="朋辈讲义">朋辈讲义</option>
                        <option value="知识见解">知识见解</option>
                        <option value="科研分享">科研分享</option>
                      </>
                    ) : (
                      <>
                        {partition === 'NOTICE' ? (
                          <>
                            <option value="DAILIY">日常推文</option>
                          </>
                        ) : (
                          <>
                            <option value="学科分享">学科分享</option>
                            <option value="技术分享">技术分享</option>
                            <option value="经验分享">经验分享</option>
                            <option value="其它">其它</option>
                          </>
                        )}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-base font-semibold mb-1 text-indigo-900">
                    描述 (可选)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 placeholder-gray-400 transition"
                    placeholder="一句话描述文章内容"
                    style={{ color: '#222' }}></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 accent-indigo-500"
                  />
                  <label htmlFor="isPublished" className="ml-3 block text-base text-indigo-900">
                    公开
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-70 transition-all duration-200">
                    {loading ? '正在提交...' : '发布文章'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteArticle}
                    // disabled={deleteLoading || loading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow text-base font-bold text-white bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:opacity-70 transition-all duration-200">
                    {/* {deleteLoading ? '正在删除...' : '删除文章'} */}
                    {'删除文章'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* 中间：内容编辑区自适应宽度 */}
        <div
          className="flex-1 bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col min-h-0 overflow-y-auto backdrop-blur-xl"
          style={{
            maxHeight: 'calc(100vh - 120px)',
            color: '#222',
            minWidth: 0,
            transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
          }}>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center drop-shadow">文章内容</h2>
          <textarea
            id="content"
            rows={22}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="flex-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 placeholder-gray-400 transition"
            placeholder="在此输入文章内容..."
            style={{ color: '#222', minHeight: 320 }}></textarea>
          {/* )} */}
        </div>
        {/* 右侧：图片卡片 3/10 */}
        <div
          style={{
            marginRight: 24,
            transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
            width: showRight ? 340 : 32,
            minWidth: showRight ? 260 : 32,
            maxWidth: showRight ? 420 : 32,
            overflow: 'visible',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            zIndex: 2,
          }}>
          <button
            type="button"
            onClick={() => setShowRight((v) => !v)}
            style={{
              position: 'absolute',
              top: 24,
              left: -20,
              zIndex: 20,
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg,#6366f1 60%,#a5b4fc)',
              border: 'none',
              borderRadius: '50%',
              boxShadow: '0 4px 16px #6366f133',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            className="hover:scale-110 hover:shadow-xl group">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: showRight ? 'none' : 'rotate(180deg)',
                transition: 'transform .2s',
              }}>
              <path d="M8 6L12 11L8 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showRight && (
            <div
              className="flex flex-col bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 h-[700px] min-h-[600px] min-w-[260px] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_32px_#6366f122]"
              style={{ color: '#222', boxShadow: '0 8px 32px #6366f122' }}>
              <h2 className="text-xl font-bold mb-6 text-indigo-700 text-center drop-shadow">图片</h2>
              {/* 图片区 */}
              <div className="flex flex-col gap-2 mb-6 w-full relative flex-1">
                {/* 添加图片加号按钮 */}
                {imageList.length > 0 && (
                  <button
                    type="button"
                    title="添加图片"
                    onClick={() => document.getElementById('image-upload-input')?.click()}
                    className="absolute top-0 right-0 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full p-2 shadow hover:scale-110 hover:bg-indigo-200 transition-all z-10 flex items-center justify-center"
                    style={{ width: 32, height: 32 }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M4 10h12" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {imageList.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-40 text-gray-400 w-full select-none cursor-pointer group"
                    onClick={() => document.getElementById('image-upload-input')?.click()}>
                    <svg width="48" height="48" fill="none" stroke="#a5b4fc" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="3" fill="#eef2ff" />
                      <path d="M3 17l4.5-6a2 2 0 0 1 3.2-.2l2.6 3.2a2 2 0 0 0 3.2-.2L21 9" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="mt-2 text-base group-hover:text-indigo-500 transition">还未添加图片，点击此处添加</div>
                    <input id="image-upload-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImagesChange} />
                  </div>
                ) : (
                  <>
                    <input id="image-upload-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImagesChange} />
                    <div className="flex flex-col gap-1 mt-1 w-full">
                      <div className="text-sm text-gray-700 mb-1">图片列表</div>
                      <div className="text-xs text-gray-400 mb-1 leading-tight">点击图片插入Markdown/设为封面</div>
                      <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto pr-1">
                        {imageFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className={`relative flex flex-col items-center border-2 rounded-xl p-2 transition cursor-pointer group ml-1.5 mt-1.5 ${
                              coverImage === file.id ? 'border-indigo-500 bg-indigo-50/80 shadow-lg scale-105' : 'border-gray-200 bg-white/80 hover:scale-105 hover:shadow-md'
                            }`}
                            style={{
                              width: 100,
                              boxShadow: coverImage === file.id ? '0 0 0 3px #6366f1aa' : '',
                            }}
                            onClick={() => insertImageMarkdown(file || '')}>
                            <div className="relative w-16 h-16 mb-1">
                              <img
                                src={`/api/images/${file.id}`}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded border shadow group-hover:scale-110 group-hover:shadow-lg transition-all duration-200"
                                style={{
                                  boxShadow: coverImage === file.id ? '0 0 0 2px #6366f1' : '',
                                }}
                              />
                              <button
                                type="button"
                                title="删除图片"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 z-20 text-xs font-bold">
                                ×
                              </button>
                            </div>
                            <span className="text-xs truncate max-w-[80px] text-gray-700 mb-1" title={file.name}>
                              {file.name}
                            </span>
                            <label className="flex items-center gap-1 cursor-pointer select-none mt-1" onClick={(e) => e.stopPropagation()}>
                              <input type="radio" name="cover" checked={coverImage === file.id} onChange={() => setCoverImage(file.id)} className="accent-indigo-500 w-4 h-4" />
                              <span className={`text-xs ${coverImage === file.id ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>封面</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 渐变横线分隔 */}
              <div className="w-full h-px my-4 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" style={{ opacity: 0.8 }}></div>
              {/* 文件区 */}
              <div className="flex flex-col gap-2 w-full flex-1 overflow-auto">
                <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center drop-shadow">文件</h2>
                <div className="flex flex-row items-center gap-2 mb-2">
                  <input id="file-upload-input" type="file" multiple onChange={handleFilesChange} style={{ display: 'none' }} />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition disabled:opacity-60"
                    disabled={fileUploading}>
                    {fileUploading ? '正在上传...' : '上传文件'}
                  </button>
                  <span className="text-xs text-gray-400">支持pdf/zip/doc/excel等</span>
                </div>
                {fileList.length === 0 ? (
                  <div className="text-gray-400 text-center">还未上传文件</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {fileList.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 px-1 group">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate text-sm text-gray-800" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <a href={`/api/files/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline text-xs px-2">
                          下载
                        </a>
                        <button type="button" onClick={() => handleRemoveFile(idx)} className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold">
                          删除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
