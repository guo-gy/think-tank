//该页面废弃
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const PAGE_SIZE = 5;

export default function NewsPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 判断是否管理员
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    setLoading(true);
    setError("");
    // 管理员拉取 PUBLIC,PENDING，普通用户只拉取 PUBLIC
    const statusParam = isAdmin ? "PUBLIC,PENDING" : "PUBLIC";
    fetch(`/api/articles?partition=NEWS&status=${statusParam}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setNewsList(data.data || []);
      })
      .catch((err) => {
        setError("新闻加载失败");
        toast.error("新闻加载失败");
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // 动态提取所有分类（仅分区为NEWS的文章）
  const categories = useMemo(() => {
    const set = new Set();
    newsList.forEach(item => {
      if (item.category) set.add(item.category);
    });
    let arr = [
      { id: "all", name: "全部" },
      ...Array.from(set).map(cat => ({ id: cat, name: cat }))
    ];
    // 管理员加“审核中”
    if (isAdmin) arr.push({ id: "pending", name: "审核中" });
    return arr;
  }, [newsList, isAdmin]);

  // 分类过滤
  let filteredNews = newsList;
  if (selectedCategory === "pending") {
    filteredNews = newsList.filter(n => n.status === "PENDING");
  } else if (selectedCategory !== "all") {
    filteredNews = newsList.filter(n => n.category === selectedCategory && n.status === "PUBLIC");
  } else {
    filteredNews = newsList.filter(n => n.status === "PUBLIC");
  }

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));
  const pagedNews = filteredNews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 切换分类时回到第一页
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setPage(1);
  }

  console.log(newsList);

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
            <div className="flex flex-col  flex-1 overflow-y-auto">
              {loading && <div className="text-gray-400 text-center py-10">加载中...</div>}
              {error && <div className="text-red-400 text-center py-10">{error}</div>}
              {!loading && !error && pagedNews.length === 0 && (
                <div className="text-gray-400 text-center py-10">暂无该分类新闻</div>
              )}
              {pagedNews.map(item => (
                <Link
                  key={item._id}
                  href={`/${item._id}`}
                  className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex flex-row h-24 relative">
                    {/* 左侧：标题和描述 */}
                    <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                      <span className="text-base font-semibold text-gray-800">{item.title}</span>
                      <span className="text-sm text-gray-500 mt-1">{item.description || ''}</span>
                    </div>
                    {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                    {item.coverImage && (
                      <div className="relative w-2/3 h-full min-w-[5rem] z-0">
                        <img
                          src={`/api/images/${item.coverImage}`}
                          alt="新闻配图"
                          className="object-cover w-full h-full object-center"
                        />
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