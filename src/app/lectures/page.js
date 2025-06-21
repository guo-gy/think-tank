"use client";
import { useState } from "react";
import Link from "next/link";

// 示例分类
const categories = [
  { id: "all", name: "全部" },
  { id: "study", name: "学习经验" },
  { id: "life", name: "生活分享" },
  { id: "career", name: "升学就业" },
];

// 示例讲义数据
const lectureList = [
  { id: 1, title: "高数学习方法分享", category: "study", desc: "学长带你突破高数难关，掌握高效学习技巧。", img: "/images/1.jpg" },
  { id: 2, title: "宿舍生活小妙招", category: "life", desc: "如何打造舒适的宿舍环境，提升生活幸福感。", img: "/images/2.jpg" },
  { id: 3, title: "考研经验交流", category: "career", desc: "考研备考全流程、心态调整与资料推荐。", img: "/images/3.jpg" },
  { id: 4, title: "英语四级高分心得", category: "study", desc: "英语四级高分学姐的备考经验与资源分享。", img: "/images/1.jpg" },
  { id: 5, title: "校园兼职与实习", category: "career", desc: "如何寻找合适的兼职和实习机会，提升能力。", img: "/images/2.jpg" },
  { id: 6, title: "健康饮食指南", category: "life", desc: "大学生健康饮食建议，合理搭配营养。", img: "/images/3.jpg" },
  { id: 7, title: "时间管理与自律", category: "study", desc: "高效时间管理方法，助你学业与生活兼顾。", img: "/images/1.jpg" },
  { id: 8, title: "简历制作与面试技巧", category: "career", desc: "求职简历制作要点与常见面试问题解析。", img: "/images/2.jpg" },
  // ...可继续添加更多讲义
];

const PAGE_SIZE = 5;

export default function LecturesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  // 过滤讲义
  const filteredLectures = selectedCategory === "all"
    ? lectureList
    : lectureList.filter(n => n.category === selectedCategory);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredLectures.length / PAGE_SIZE));
  const pagedLectures = filteredLectures.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 切换分类时回到第一页
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setPage(1);
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-yellow-100 via-yellow-50 to-white">
      {/* 预留顶栏高度 */}
      <div
        className="container mx-auto px-4 py-10 h-full flex items-stretch"
        style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full h-full">
          {/* 左侧分类 */}
          <aside className="md:col-span-3 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">讲义分类</h2>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                      ${selectedCategory === cat.id
                        ? "bg-yellow-100 text-yellow-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {/* 右侧讲义列表 */}
          <main className="md:col-span-7 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">讲义列表</h2>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              {pagedLectures.length === 0 && (
                <div className="text-gray-400 text-center py-10">暂无该分类讲义</div>
              )}
              {pagedLectures.map(item => (
                <Link
                  key={item.id}
                  href={`/lectures/${item.id}`}
                  className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex flex-row h-24 relative">
                    {/* 左侧：标题和描述 */}
                    <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                      <span className="text-base font-semibold text-gray-800">{item.title}</span>
                      <span className="text-sm text-gray-500 mt-1">{item.desc}</span>
                    </div>
                    {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                    {item.img && (
                      <div className="relative w-1/2 h-full min-w-[5rem] z-0">
                        <img
                          src={item.img}
                          alt="讲义配图"
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
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"}`}
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