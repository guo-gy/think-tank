// src/app/admin/articles/write/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [partition, setPartition] = useState('NEWS'); // 分区
  const [category, setCategory] = useState(''); // 分类
  const [isPublished, setIsPublished] = useState(false);
  // 附件即本体模式
  const [isMainAttachment, setIsMainAttachment] = useState(false);
  const [mainAttachmentFile, setMainAttachmentFile] = useState(null);
  const [mainAttachmentPreviewUrl, setMainAttachmentPreviewUrl] = useState(null); // 新增
  // 新增：图片和附件文件
  const [imageFile, setImageFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // 多图片上传与封面选择
  const [imageFiles, setImageFiles] = useState([]); // 多图片
  const [coverIndex, setCoverIndex] = useState(0); // 封面索引，默认第一个

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 左右卡片收起状态
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);


  // PDF/MD 预览 objectURL 管理（useEffect 必须在顶层调用）
  useEffect(() => {
    if (!isMainAttachment || !mainAttachmentFile) {
      setMainAttachmentPreviewUrl(null);
      return;
    }
    if (mainAttachmentFile.name.endsWith('.md')) {
      mainAttachmentFile.text().then(text => {
        setMainAttachmentFile(f => ({ ...f, _previewContent: text }));
      });
      setMainAttachmentPreviewUrl(null);
    } else if (mainAttachmentFile.name.match(/\.(pdf)$/i)) {
      const url = URL.createObjectURL(mainAttachmentFile);
      setMainAttachmentPreviewUrl(url);
      return () => { URL.revokeObjectURL(url); };
    } else {
      setMainAttachmentPreviewUrl(null);
    }
  }, [isMainAttachment, mainAttachmentFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!title || !content) {
      toast.error('标题和内容不能为空。');
      setLoading(false);
      return;
    }

    // 1. 上传所有图片，获取图片URL数组
    let imageUrls = [];
    if (imageFiles.length > 0) {
      const formData = new FormData();
      imageFiles.forEach(f => formData.append('images', f));
      try {
        const uploadRes = await fetch('/api/upload/images', {
          method: 'POST',
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadRes.ok && Array.isArray(uploadResult.urls)) {
          imageUrls = uploadResult.urls;
        } else {
          toast.error('图片上传失败');
          setLoading(false);
          return;
        }
      } catch (err) {
        toast.error('图片上传失败');
        setLoading(false);
        return;
      }
    }

    // 2. 组装文章数据
    let statusValue = "PRIVATE";
    if (isPublished) {
      if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
        statusValue = "PUBLIC";
      } else {
        statusValue = "PENDING";
      }
    } else {
      statusValue = "PRIVATE";
    }
    const articleData = {
      title,
      content,
      excerpt,
      partition, // 分区
      category, // 分类
      status: statusValue, // 关键：传递 status 字段
      images: imageUrls,
      cover: imageUrls[coverIndex] || imageUrls[0] || '',
      // 可根据后端需求添加附件字段
    };

    try {
      const res = await fetch('/api/articles', { // 我们需要创建这个 API 端点
        method: 'POST',
        headers:
         {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || `创建文章失败 (Status: ${res.status})`);
      } else {
        toast.success(`文章 "${result.data.title}" 创建成功！`);
        // 清空表单或跳转到文章列表/详情页
        setTitle('');
        setContent('');
        setExcerpt('');
        // setType('NEWS');
        // setCategory('');
        // setIsPublished(false);
        // router.push(`/admin/articles`); // 例如跳转到管理列表
        router.push(`/${result.data._id}`); // 跳转到新发布的文章详情页，使用id
      }
    } catch (err) {
      console.error("Error creating article:", err);
      toast.error('创建文章时发生网络错误或未知错误。');
    } finally {
      setLoading(false);
    }
  };

  // 处理图片和附件选择
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };
  const handleAttachmentChange = (e) => {
    setAttachmentFile(e.target.files[0] || null);
  };
  // 处理多图片选择
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setCoverIndex(0); // 默认第一个为封面
  };
  // 处理封面变化
  const handleCoverChange = (idx) => {
    setCoverIndex(idx);
  };

  // 在内容区插入图片markdown引用
  const insertImageMarkdown = (file) => {
    const md = `![](${file.name})`;
    // 在光标处插入
    const textarea = document.getElementById('content');
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      setContent(content.slice(0, start) + md + content.slice(end));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + md.length;
      }, 0);
    } else {
      setContent(content + md);
    }
  };

  // 判断是否为管理员
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="fixed inset-0 w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col" style={{paddingTop: '80px'}}>
      <Toaster position="top-center" toastOptions={{ style: { marginTop: '80px' } }} />
      <div className="flex-1 flex flex-row items-stretch px-0 pb-8" style={{gap: '48px', width: '100vw'}}>
        {/* 左侧：文章配置卡片 3/10 */}
        <div style={{marginLeft:24, transition:'all 0.4s cubic-bezier(.4,2,.6,1)', width: showLeft ? 340 : 32, minWidth: showLeft ? 260 : 32, maxWidth: showLeft ? 420 : 32, overflow:'visible', position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-start', zIndex:2}}>
          <button type="button" onClick={()=>setShowLeft(v=>!v)}
            style={{position:'absolute', top:24, right:-20, zIndex:20, width:40, height:40, background:'linear-gradient(135deg,#6366f1 60%,#a5b4fc)', border:'none', borderRadius:'50%', boxShadow:'0 4px 16px #6366f133', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s'}}
            className="hover:scale-110 hover:shadow-xl group">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showLeft?'rotate(180deg)':'none', transition:'transform .2s'}}>
              <path d="M8 6L12 11L8 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showLeft && (
            <div className="flex flex-col bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 h-fit backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_32px_#6366f122]" style={{color:'#222', boxShadow:'0 8px 32px #6366f122'}}>
              <h1 className="text-2xl font-extrabold mb-8 text-indigo-700 text-center tracking-tight drop-shadow">文章配置</h1>
              <form onSubmit={handleSubmit} className="space-y-7 flex-1 flex flex-col">
                <div>
                  <label htmlFor="title" className="block text-base font-semibold mb-1 text-indigo-900">标题</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-lg bg-indigo-50/60 placeholder-gray-400 transition"
                    placeholder="请输入文章标题"
                    style={{color: "#222"}}
                  />
                </div>

                {/* 类型/分区 */}
                <div>
                  <label htmlFor="partition" className="block text-base font-semibold mb-1 text-indigo-900">分区</label>
                  <select
                    id="partition"
                    value={partition}
                    onChange={(e) => setPartition(e.target.value)}
                    className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 transition"
                    style={{color: "#222"}}
                  >
                    {/* 管理员/超级管理员可选所有分区，普通用户无新闻/通知 */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') ? (
                      <>
                        <option value="NEWS">新闻</option>
                        <option value="NOTICE">通知</option>
                        <option value="DOWNLOAD">资料</option>
                        <option value="LECTURE">助学</option>
                      </>
                    ) : (
                      <>
                        <option value="DOWNLOAD">资料</option>
                        <option value="LECTURE">助学</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-base font-semibold mb-1 text-indigo-900">分类 (可选)</label>
                  <input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 placeholder-gray-400 transition"
                    placeholder="如 校园生活、技术分享"
                    style={{color: "#222"}}
                  />
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-base font-semibold mb-1 text-indigo-900">摘要 (可选)</label>
                  <textarea
                    id="excerpt"
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 placeholder-gray-400 transition"
                    placeholder="一句话描述文章内容"
                    style={{color: "#222"}}
                  ></textarea>
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
                  <label htmlFor="isPublished" className="ml-3 block text-base text-indigo-900">公开</label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-70 transition-all duration-200"
                  >
                    {loading ? '正在提交...' : '发布文章'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* 中间：内容编辑区自适应宽度 */}
        <div className="flex-1 bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col min-h-0 overflow-y-auto backdrop-blur-xl" style={{maxHeight:'calc(100vh - 120px)', color:'#222', minWidth:0, transition:'all 0.4s cubic-bezier(.4,2,.6,1)'}}>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center drop-shadow">文章内容</h2>
          {isMainAttachment && mainAttachmentFile ? (
            <div className="flex-1 min-h-0 w-full h-full bg-white/80 rounded-xl border border-gray-100 p-6 overflow-auto text-gray-700 text-base flex flex-col" style={{minHeight:0, height:'100%', maxHeight:'100%'}}>
              {/* 附件预览 */}
              {(() => {
                const name = mainAttachmentFile.name.toLowerCase();
                if (name.endsWith('.md')) {
                  return (
                    <pre className="whitespace-pre-wrap break-words text-sm flex-1 w-full h-full overflow-auto" style={{fontFamily:'inherit', minHeight:0, height:'100%', maxHeight:'100%'}}>{mainAttachmentFile._previewContent || '正在加载...'}</pre>
                  );
                } else if (name.match(/\.(pdf)$/)) {
                  return mainAttachmentPreviewUrl ? (
                    <object data={mainAttachmentPreviewUrl} type="application/pdf" width="100%" height="100%" style={{minHeight:0, height:'100%', maxHeight:'100%', display:'block'}}>
                      <iframe src={mainAttachmentPreviewUrl} title="pdf预览" width="100%" height="100%" style={{minHeight:0, height:'100%', maxHeight:'100%', display:'block'}}></iframe>
                      <div className="text-gray-400 text-center">PDF 预览不可用，请下载后本地查看。</div>
                    </object>
                  ) : (
                    <div className="text-gray-400 text-center">正在加载 PDF...</div>
                  );
                } else if (name.match(/\.(jpe?g|png|gif|webp|svg)$/)) {
                  // 图片预览
                  return (
                    <img src={URL.createObjectURL(mainAttachmentFile)} alt={mainAttachmentFile.name} style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:'1rem', background:'#f8fafc'}} />
                  );
                } else if (name.endsWith('.zip')) {
                  return (
                    <div className="text-gray-400 text-center">暂不支持预览 zip 文件</div>
                  );
                } else if (name.match(/\.(docx?|xlsx?)$/)) {
                  return (
                    <div className="text-gray-400 text-center">暂不支持直接预览该类型文件</div>
                  );
                } else {
                  return (
                    <div className="text-gray-400 text-center">暂不支持预览</div>
                  );
                }
              })()}
            </div>
          ) : (
            <textarea
              id="content"
              rows={22}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              className="flex-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-base bg-indigo-50/60 placeholder-gray-400 transition"
              placeholder="在此输入文章内容..."
              style={{color: "#222", minHeight: 320}}
              disabled={isMainAttachment}
            ></textarea>
          )}
        </div>
        {/* 右侧：图片和附件卡片 3/10 */}
        <div style={{marginRight:24, transition:'all 0.4s cubic-bezier(.4,2,.6,1)', width: showRight ? 340 : 32, minWidth: showRight ? 260 : 32, maxWidth: showRight ? 420 : 32, overflow:'visible', position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-start', zIndex:2}}>
          <button type="button" onClick={()=>setShowRight(v=>!v)}
            style={{position:'absolute', top:24, left:-20, zIndex:20, width:40, height:40, background:'linear-gradient(135deg,#6366f1 60%,#a5b4fc)', border:'none', borderRadius:'50%', boxShadow:'0 4px 16px #6366f133', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s'}}
            className="hover:scale-110 hover:shadow-xl group">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showRight?'none':'rotate(180deg)', transition:'transform .2s'}}>
              <path d="M8 6L12 11L8 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showRight && (
            <div className="flex flex-col bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-10 h-fit min-h-[420px] min-w-[260px] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_32px_#6366f122]" style={{color:'#222', boxShadow:'0 8px 32px #6366f122'}}>
              {/* 附件即本体勾选 */}
              <div className="flex items-center mb-4">
                <input id="isMainAttachment" type="checkbox" className="accent-indigo-500 w-5 h-5" checked={isMainAttachment} onChange={e=>{
                  setIsMainAttachment(e.target.checked);
                  if (!e.target.checked) setMainAttachmentFile(null);
                }} />
                <label htmlFor="isMainAttachment" className="ml-2 text-base text-indigo-900 font-semibold cursor-pointer">附件即本体</label>
              </div>
              <h2 className="text-xl font-bold mb-6 text-indigo-700 text-center drop-shadow">图片与附件</h2>
              {/* 渐变横线 */}
              <div className="w-full flex items-center mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent" style={{opacity:0.7}}></div>
              </div>
              {/* 图片区 */}
              {!isMainAttachment && (
              <div className="flex flex-col gap-2 mb-6 w-full relative">
                {/* 添加图片加号按钮 */}
                {imageFiles.length > 0 && (
                  <button type="button" title="添加图片" onClick={()=>document.getElementById('image-upload-input')?.click()} className="absolute top-0 right-0 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full p-2 shadow hover:scale-110 hover:bg-indigo-200 transition-all z-10 flex items-center justify-center" style={{width:32, height:32}}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  </button>
                )}
                {imageFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 w-full select-none cursor-pointer group" onClick={()=>document.getElementById('image-upload-input')?.click()}>
                    <svg width="48" height="48" fill="none" stroke="#a5b4fc" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#eef2ff"/><path d="M3 17l4.5-6a2 2 0 0 1 3.2-.2l2.6 3.2a2 2 0 0 0 3.2-.2L21 9" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <div className="mt-2 text-base group-hover:text-indigo-500 transition">还未添加图片，点击此处添加</div>
                    <input id="image-upload-input" type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleImagesChange} />
                  </div>
                ) : (
                  <>
                  <input id="image-upload-input" type="file" accept="image/*" multiple style={{display:'none'}} onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setImageFiles(prev => prev.concat(files));
                  }} />
                  <div className="flex flex-col gap-2 mt-2 w-full">
                    <div className="text-sm text-gray-700 mb-1">图片列表</div>
                    <div className="text-xs text-gray-400 mb-1 leading-tight">点击图片插入Markdown/设为封面</div>
                    <div className="flex flex-wrap gap-3">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className={`relative flex flex-col items-center border-2 rounded-xl p-2 transition cursor-pointer group ${coverIndex===idx ? 'border-indigo-500 bg-indigo-50/80 shadow-lg scale-105' : 'border-gray-200 bg-white/80 hover:scale-105 hover:shadow-md'}`}
                          style={{width:100, boxShadow:coverIndex===idx?'0 0 0 3px #6366f1aa':''}}
                          onClick={()=>insertImageMarkdown(file)}>
                          <div className="relative w-16 h-16 mb-1">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded border shadow group-hover:scale-110 group-hover:shadow-lg transition-all duration-200"
                              style={{boxShadow:coverIndex===idx?'0 0 0 2px #6366f1':''}}
                            />
                          </div>
                          <span className="text-xs truncate max-w-[80px] text-gray-700 mb-1" title={file.name}>{file.name}</span>
                          <label className="flex items-center gap-1 cursor-pointer select-none mt-1" onClick={e=>e.stopPropagation()}>
                            <input type="radio" name="cover" checked={coverIndex===idx} onChange={()=>setCoverIndex(idx)} className="accent-indigo-500 w-4 h-4" />
                            <span className={`text-xs ${coverIndex===idx?'text-indigo-600 font-bold':'text-gray-400'}`}>封面</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                )}
              </div>
              )}
              {/* 图片/附件分割横线 */}
              <div className="w-full flex items-center mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent" style={{opacity:0.7}}></div>
              </div>
              {/* 附件区 */}
              <div className="flex flex-col gap-2 w-full relative">
                {/* 附件即本体模式下只允许一个文件 */}
                {isMainAttachment ? (
                  <div className="flex flex-col items-center justify-center h-28 text-gray-400 w-full select-none group">
                    {mainAttachmentFile ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="truncate max-w-[180px] text-indigo-700 text-sm" title={mainAttachmentFile.name}>{mainAttachmentFile.name}</span>
                          <button type="button" className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200 font-semibold shadow-sm" onClick={()=>setMainAttachmentFile(null)}>移除</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button type="button" className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-200 transition font-semibold shadow-sm" onClick={()=>document.getElementById('main-attachment-upload-input')?.click()}>上传本体附件</button>
                        <input id="main-attachment-upload-input" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip" style={{display:'none'}} onChange={async e=>{
                          const file = e.target.files[0];
                          if (!file) return;
                          setMainAttachmentFile(file);
                          // 预览内容由 useEffect 统一处理
                        }} />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full relative">
                    {/* 添加附件加号按钮 */}
                    {attachmentFile && (Array.isArray(attachmentFile)?attachmentFile.length>0:!!attachmentFile) && (
                      <button type="button" title="添加附件" onClick={()=>document.getElementById('attachment-upload-input')?.click()} className="absolute top-0 right-0 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full p-2 shadow hover:scale-110 hover:bg-indigo-200 transition-all z-10 flex items-center justify-center" style={{width:32, height:32}}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                    {(!attachmentFile || (Array.isArray(attachmentFile) && attachmentFile.length === 0)) ? (
                      <div className="flex flex-col items-center justify-center h-28 text-gray-400 w-full select-none cursor-pointer group" onClick={()=>document.getElementById('attachment-upload-input')?.click()}>
                        <svg width="32" height="32" fill="none" stroke="#a5b4fc" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="6" y="8" width="12" height="8" rx="2" fill="#eef2ff"/><path d="M8 12h8" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        <div className="mt-1 text-sm group-hover:text-indigo-500 transition">还未添加附件，点击此处添加</div>
                        <input id="attachment-upload-input" type="file" multiple style={{display:'none'}} onChange={e=>{
                          const files = Array.from(e.target.files || []);
                          setAttachmentFile(prev => prev ? [...(Array.isArray(prev)?prev:[prev]), ...files] : files);
                        }} />
                      </div>
                    ) : (
                      <>
                      <input id="attachment-upload-input" type="file" multiple style={{display:'none'}} onChange={e=>{
                        const files = Array.from(e.target.files || []);
                        setAttachmentFile(prev => prev ? [...(Array.isArray(prev)?prev:[prev]), ...files] : files);
                      }} />
                      <div className="flex flex-col gap-2 w-full">
                        <div className="text-sm text-gray-700 mb-1">附件列表：</div>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(attachmentFile)?attachmentFile:[attachmentFile]).map((file, idx) => (
                            <div key={idx} className="flex items-center bg-indigo-50/60 border border-indigo-100 rounded px-2 py-1 text-xs text-indigo-800 gap-1">
                              <span className="truncate max-w-[120px]" title={file.name}>{file.name}</span>
                              <button type="button" className="ml-1 px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200 font-semibold shadow-sm" onClick={()=>{
                                setAttachmentFile(prev => {
                                  const arr = Array.isArray(prev)?[...prev]:[prev];
                                  arr.splice(idx,1);
                                  return arr.length>0?arr:[];
                                });
                              }}>删除</button>
                            </div>
                          ))}
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}