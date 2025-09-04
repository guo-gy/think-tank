"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("my-articles");
  const [myArticles, setMyArticles] = useState([]);
  const [myArticlesPage, setMyArticlesPage] = useState(1);
  const [likedArticles, setLikedArticles] = useState([]);
  const [likedArticlesPage, setLikedArticlesPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError("");
    // 获取自己写的文章（所有状态）
    fetch(`/api/articles?author=${session.user.id}&&status=PUBLIC,PRIVATE,PENDING`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setMyArticles(data.data || []);
      })
      .catch(() => {
        setError("文章加载失败");
        toast.error("文章加载失败");
      })
      .finally(() => setLoading(false));
    // 获取自己点赞过的文章
    fetch(`/api/articles/liked-by-me`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setLikedArticles(data.data || []);
      })
      .catch(() => {
        toast.error("点赞文章加载失败");
      });
  }, [session]);

  //分页，总页数和当前页的文章集合
  const totalMyArticlesPages = Math.max(
    1,
    Math.ceil(myArticles.length / PAGE_SIZE)
  );
  //当前页的文章集合
  const pageMyArticles = myArticles.slice(
    (myArticlesPage - 1) * PAGE_SIZE,
    myArticlesPage * PAGE_SIZE
  );
  const totalLikedArticlesPages = Math.max(
    1,
    Math.ceil(likedArticles.length / PAGE_SIZE)
  );
  const pageLikedArticles = likedArticles.slice(
    (likedArticlesPage - 1) * PAGE_SIZE,
    likedArticlesPage * PAGE_SIZE
  );

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-indigo-100 via-indigo-50 to-white">
      {/* 预留顶栏高度 */}
      <div
        className="container mx-auto px-4 py-10 h-full flex items-stretch"
        style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full h-full">
          {/* 左侧功能卡片 */}
          <aside className="md:col-span-3 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">个人中心</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    tab === "my-articles"
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setTab("my-articles")}
                >
                  自己写的文章
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    tab === "liked-articles"
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setTab("liked-articles")}
                >
                  点赞过的文章
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    tab === "change-password"
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setTab("change-password")}
                >
                  修改密码
                </button>
              </li>
            </ul>
          </aside>
          {/* 右侧内容区 */}
          <main className="md:col-span-7 col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-full">
            {tab === "my-articles" && (
              //这个div作为父级把其他部分包裹起来，从而使得代码结构与其他界面一致
              <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                  自己写的文章</h2>
              <div className="flex flex-col   flex-1 overflow-y-auto">
                {loading && (
                  <div className="text-gray-500 text-center py-10">
                    加载中...
                  </div>
                )}
                {error && (
                  <div className="text-red-600 text-center py-10">{error}</div>
                )}
                {!loading && !error && myArticles.length === 0 && (
                  <div className="text-gray-500 text-center py-10">
                    暂无文章
                  </div>
                )}
                {pageMyArticles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/${article._id}`}
                    className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex flex-row h-24 relative">
                      {/* 左侧：标题和描述 */}
                      <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                        <span className="text-base font-semibold text-gray-900">
                          {article.title}
                        </span>
                        <span className="text-sm text-gray-700 mt-1">
                          状态：{article.status}
                        </span>
                        {article.description && (
                          <span className="text-sm text-gray-500 mt-1">
                            {article.description}
                          </span>
                        )}
                      </div>
                      {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                      {article.coverImage && (
                        <div className="relative w-2/3 h-full min-w-[5rem] z-0">
                          <img
                            src={`/api/images/${article.coverImage}`}
                            alt="文章配图"
                            className="object-cover w-full h-full object-center"
                          />
                          <div
                            className="absolute top-0 left-0 h-full w-full pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 90%)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {totalMyArticlesPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 select-none">
                    {Array.from({ length: totalMyArticlesPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setMyArticlesPage(i + 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                      ${
                        myArticlesPage === i + 1
                          ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "liked-articles" && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  点赞过的文章
                </h2>
              <div className="flex flex-col  flex-1 overflow-y-auto">
                {loading && (
                  <div className="text-gray-500 text-center py-10">
                    加载中...
                  </div>
                )}
                {error && (
                  <div className="text-red-600 text-center py-10">{error}</div>
                )}
                {!loading && !error && likedArticles.length === 0 && (
                  <div className="text-gray-500 text-center py-10">
                    暂无点赞文章
                  </div>
                )}
                {pageLikedArticles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/${article._id}`}
                    className="block rounded-xl border border-gray-100 p-0 bg-white group overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex flex-row h-24 relative">
                      {/* 左侧：标题和描述 */}
                      <div className="flex-1 flex flex-col justify-center px-5 py-3 z-20 relative">
                        <span className="text-base font-semibold text-gray-900">
                          {article.title}
                        </span>
                        {article.description && (
                          <span className="text-sm text-gray-500 mt-1">
                            {article.description}
                          </span>
                        )}
                      </div>
                      {/* 右侧：配图+渐变，仅在图片区域内渐变 */}
                      {article.coverImage && (
                        <div className="relative w-2/3 h-full min-w-[5rem] z-0">
                          <img
                            src={`/api/images/${article.coverImage}`}
                            alt="文章配图"
                            className="object-cover w-full h-full object-center"
                          />
                          <div
                            className="absolute top-0 left-0 h-full w-full pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to left, rgba(255,255,255,0) 0%, #fff 90%)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {totalLikedArticlesPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 select-none">
                    {Array.from({ length: totalLikedArticlesPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setLikedArticlesPage(i + 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                      ${
                        likedArticlesPage === i + 1
                          ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "change-password" && (
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  修改密码
                </h2>
                <ChangePasswordForm />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setMsg("请填写完整信息");
      return;
    }
    if (newPwd !== confirmPwd) {
      setMsg("两次新密码不一致");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPwd, newPwd }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("修改成功");
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } else {
      setMsg(data.message || "修改失败");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block mb-1">原密码</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={oldPwd}
          onChange={(e) => setOldPwd(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1">新密码</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1">确认新密码</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
        />
      </div>
      {msg && (
        <div className={msg === "修改成功" ? "text-green-600" : "text-red-500"}>
          {msg}
        </div>
      )}
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "提交中..." : "修改密码"}
      </button>
    </form>
  );
}
