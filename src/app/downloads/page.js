"use client";
import { useState } from "react";
import Link from "next/link";

// 示例分类
const categories = [
  { id: "all", name: "全部" },
  { id: "doc", name: "文档资料" },
  { id: "form", name: "表格模板" },
  { id: "guide", name: "操作指南" },
];

// 示例下载数据
const downloadList = [
  { id: 1, title: "学生手册.pdf", category: "doc", desc: "最新学生手册电子版，供下载参考。", img: "/images/1.jpg" },
  { id: 2, title: "请假条模板.docx", category: "form", desc: "标准请假条模板，支持打印填写。", img: "/images/2.jpg" },
  { id: 3, title: "实验报告模板.docx", category: "form", desc: "实验课程通用报告模板。", img: "/images/3.jpg" },
  { id: 4, title: "校园网使用指南.pdf", category: "guide", desc: "校园网账号申请与使用详细说明。", img: "/images/1.jpg" },
  { id: 5, title: "毕业论文格式要求.pdf", category: "doc", desc: "毕业论文排版及格式要求文档。", img: "/images/2.jpg" },
  { id: 6, title: "奖学金申请表.xlsx", category: "form", desc: "奖学金申请专用表格。", img: "/images/3.jpg" },
  { id: 7, title: "教务系统操作手册.pdf", category: "guide", desc: "教务系统常用功能操作手册。", img: "/images/1.jpg" },
  { id: 8, title: "学籍异动申请表.docx", category: "form", desc: "学籍异动相关申请表格。", img: "/images/2.jpg" },
  // ...可继续添加更多资料
];

const PAGE_SIZE = 5;

export default function DownloadsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  // 过滤资料
  const filteredDownloads = selectedCategory === "all"
    ? downloadList
    : downloadList.filter(n => n.category === selectedCategory);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredDownloads.length / PAGE_SIZE));
  const pagedDownloads = filteredDownloads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 切换分类时回到第一页
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setPage(1);
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-green-100 via-green-50 to-white">
      {/* 预留顶栏高度 */}
      <div
        className="container mx-auto px-4 py-10 h-full flex items-stretch"
        style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full h-full">
          {/* 左侧分类 */}
          <aside className="md:col-span-3 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">资料分类</h2>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                      ${selectedCategory === cat.id
                        ? "bg-green-100 text-green-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {/* 右侧资料列表 */}
          <main className="md:col-span-7 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">资料列表</h2>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              {pagedDownloads.length === 0 && (
                <div className="text-gray-400 text-center py-10">暂无该分类资料</div>
              )}
              {pagedDownloads.map(item => (
                <Link
                  key={item.id}
                  href={`/downloads/${item.id}`}
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
                          alt="资料配图"
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
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"}`}
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