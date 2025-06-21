"use client";
import { useState } from "react";
import Link from "next/link";

// 示例数据
const categories = [
  { id: "all", name: "全部" },
  { id: "school", name: "学校要闻" },
  { id: "activity", name: "学生活动" },
  { id: "notice", name: "通知公告" },
];

// 假设有更多新闻用于分页演示
const newsList = [
  { id: 1, title: "学校召开2025年发展大会", category: "school", desc: "学校2025年发展大会顺利召开，校领导发表重要讲话。", img: "/images/1.jpg" },
  { id: 2, title: "学生会举办迎新晚会", category: "activity", desc: "迎新晚会精彩纷呈，师生反响热烈。", img: "/images/2.jpg" },
  { id: 3, title: "关于暑假放假安排的通知", category: "notice", desc: "2025年暑假放假时间及相关安排。", img: "/images/3.jpg" },
  { id: 4, title: "校运动会圆满落幕", category: "activity", desc: "运动会各项赛事顺利完成，师生积极参与。", img: "/images/1.jpg" },
  { id: 5, title: "新学期教学安排", category: "school", desc: "新学期教学计划已发布，请同学们及时查阅。", img: "/images/2.jpg" },
  { id: 6, title: "志愿服务活动启动", category: "activity", desc: "志愿服务活动正式启动，欢迎同学们报名参与。", img: "/images/3.jpg" },
  { id: 7, title: "关于期末考试的通知", category: "notice", desc: "期末考试时间及注意事项，请查收。", img: "/images/1.jpg" },
  { id: 8, title: "校友返校日活动", category: "school", desc: "校友返校日活动圆满举办，师生共叙情谊。", img: "/images/2.jpg" },
  // ...可继续添加更多新闻
];

const PAGE_SIZE = 5;

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  // 过滤新闻
  const filteredNews = selectedCategory === "all"
    ? newsList
    : newsList.filter(n => n.category === selectedCategory);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  const pagedNews = filteredNews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 切换分类时回到第一页
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setPage(1);
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-red-100 via-red-50 to-white">
      {/* 预留顶栏高度 */}
      <div
        className="container mx-auto px-4 py-10 h-full flex items-stretch"
        style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full h-full">
          {/* 左侧分类 */}
          <aside className="md:col-span-3 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">新闻分类</h2>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                      ${selectedCategory === cat.id
                        ? "bg-red-100 text-red-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {/* 右侧新闻列表 */}
          <main className="md:col-span-7 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">新闻列表</h2>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              {pagedNews.length === 0 && (
                <div className="text-gray-400 text-center py-10">暂无该分类新闻</div>
              )}
              {pagedNews.map(news => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex flex-row h-32 relative">
                    {/* 左侧：标题和描述 */}
                    <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                      <span className="text-lg font-semibold text-gray-800">{news.title}</span>
                      <span className="text-sm text-gray-500 mt-1">{news.desc}</span>
                    </div>
                    {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                    {news.img && (
                      <div className="relative w-2/3 h-full min-w-[6rem] z-0">
                        <img
                          src={news.img}
                          alt="新闻配图"
                          className="object-cover w-full h-full object-center"
                        />
                        {/* 渐变遮罩，仅在图片区域内，宽度加大 */}
                        <div
                          className="absolute top-0 left-0 h-full w-full pointer-events-none"
                          style={{
                            background: "linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 90%)"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {/* 分页器 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 select-none">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                      ${page === i + 1
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}