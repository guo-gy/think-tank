"use client";
import { useState } from "react";
import Link from "next/link";

// 示例分类
const categories = [
  { id: "all", name: "全部" },
  { id: "academic", name: "学术通知" },
  { id: "affair", name: "教务通知" },
  { id: "life", name: "生活服务" },
];

// 示例通知数据
const noticeList = [
  { id: 1, title: "2025年春季学期选课通知", category: "affair", desc: "选课系统将于3月1日开放，请同学们及时选课。", img: "/images/1.jpg" },
  { id: 2, title: "校园用电检修公告", category: "life", desc: "3月5日校园部分区域将进行用电检修，请注意安全。", img: "/images/2.jpg" },
  { id: 3, title: "学术讲座：人工智能前沿", category: "academic", desc: "邀请知名专家讲解AI最新进展，欢迎参加。", img: "/images/3.jpg" },
  { id: 4, title: "期末考试安排", category: "affair", desc: "期末考试时间及地点安排已公布，请查阅。", img: "/images/1.jpg" },
  { id: 5, title: "宿舍卫生检查", category: "life", desc: "本周将进行宿舍卫生检查，请同学们做好准备。", img: "/images/2.jpg" },
  { id: 6, title: "科研项目申报通知", category: "academic", desc: "2025年度科研项目申报工作已启动。", img: "/images/3.jpg" },
  { id: 7, title: "毕业论文提交说明", category: "affair", desc: "毕业论文提交截止时间为5月30日。", img: "/images/1.jpg" },
  { id: 8, title: "食堂菜单更新", category: "life", desc: "本月起食堂菜单有调整，敬请关注。", img: "/images/2.jpg" },
  // ...可继续添加更多通知
];

const PAGE_SIZE = 5;

export default function NoticesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);

  // 过滤通知
  const filteredNotices = selectedCategory === "all"
    ? noticeList
    : noticeList.filter(n => n.category === selectedCategory);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const pagedNotices = filteredNotices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 切换分类时回到第一页
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setPage(1);
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-blue-100 via-blue-50 to-white">
      {/* 预留顶栏高度 */}
      <div
        className="container mx-auto px-4 py-10 h-full flex items-stretch"
        style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full h-full">
          {/* 左侧分类 */}
          <aside className="md:col-span-3 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">通知分类</h2>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                      ${selectedCategory === cat.id
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {/* 右侧通知列表 */}
          <main className="md:col-span-7 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">通知列表</h2>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              {pagedNotices.length === 0 && (
                <div className="text-gray-400 text-center py-10">暂无该分类通知</div>
              )}
              {pagedNotices.map(notice => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex flex-row h-28 relative">
                    {/* 左侧：标题和描述 */}
                    <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                      <span className="text-lg font-semibold text-gray-800">{notice.title}</span>
                      <span className="text-sm text-gray-500 mt-1">{notice.desc}</span>
                    </div>
                    {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                    {notice.img && (
                      <div className="relative w-1/2 h-full min-w-[6rem] z-0">
                        <img
                          src={notice.img}
                          alt="通知配图"
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"}`}
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