"use client";
import Link from 'next/link';
export default function ArticleCard({ article, type }) {
  const formattedDate = article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '未知日期';

  const linkPath = `/${type}/${article.slug}`; // 构建正确的链接路径

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* 可以在这里添加文章的特色图片，如果你的 Article 模型有 image 字段 */}
      {/* <Link href={linkPath} className="block">
        <img className="w-full h-48 object-cover" src={article.imageUrl || 'https://via.placeholder.com/400x250?text=Article+Image'} alt={article.title} />
      </Link> */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {type === 'news' ? '资讯' : '知识'}
          </p>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          <Link href={linkPath} className="hover:text-indigo-700 transition-colors duration-300 line-clamp-2">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
            {article.excerpt}
          </p>
        )}
        {!article.excerpt && <div className="flex-grow"></div>} {/* 确保卡片等高 */}
        <div className="mt-auto">
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <span>{article.author?.username || '匿名作者'}</span>
            <span className="mx-2">&bull;</span>
            <span>{formattedDate}</span>
          </div>
          <Link
            href={linkPath}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-300"
          >
            阅读更多
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}