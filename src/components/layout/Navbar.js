// src/components/layout/Navbar.js

"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// 主题色映射，直接用十六进制或 rgb
const navTheme = {
  '/': { from: '#6366f1', to: '#a5b4fc' },      // indigo
  '/news': { from: '#ef4444', to: '#fca5a5' },  // red
  '/notices': { from: '#3b82f6', to: '#93c5fd' }, // blue
  '/downloads': { from: '#22c55e', to: '#86efac' }, // green
  '/lectures': { from: '#facc15', to: '#fde68a' }, // yellow
};

// 液态球NavLink
function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const theme = navTheme[href] || navTheme['/'];

  return (
    <Link
      href={href}
      className="relative px-3 py-1 font-medium transition-colors duration-300 text-black"
      style={{ display: 'inline-block' }}
    >
      {/* 液态球包裹动画，放在文字下层 */}
      <span
        className={[
          "absolute inset-0 rounded-full pointer-events-none transition-all duration-500",
          "ease-[cubic-bezier(.4,2,.6,1)]",
          isActive ? "scale-110 opacity-100" : "scale-75 opacity-0"
        ].join(' ')}
        style={{
          background: `radial-gradient(ellipse 120% 80% at 50% 60%, ${theme.from}, ${theme.to} 80%, transparent 100%)`,
          zIndex: 0,
        }}
        aria-hidden="true"
      ></span>
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navInputRef = useRef(null);
  const modalInputRef = useRef(null);
  const timerRef = useRef(null);

  // Ctrl+K 聚焦搜索框（优先聚焦蒙层input，否则聚焦导航栏input并弹出蒙层），Esc 退出聚焦
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setFocused(true);
        setTimeout(() => {
          modalInputRef.current?.focus();
        }, 0);
      }
      if (e.key === 'Escape') {
        setFocused(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 停止输入0.5s后自动搜索（改为后端请求）
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (search.trim()) {
        fetch(`/api/search?q=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data.results || []);
            setActiveIndex(-1);
          })
          .catch(() => {
            setSearchResults([]);
            setActiveIndex(-1);
          });
      } else {
        setSearchResults([]);
        setActiveIndex(-1);
      }
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  // 键盘上下选择和回车跳转
  useEffect(() => {
    if (!focused) return;
    const keyHandler = (e) => {
      if (searchResults.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % searchResults.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      }
      if (e.key === 'Enter' && activeIndex >= 0 && searchResults[activeIndex]) {
        window.location.href = searchResults[activeIndex].url;
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [focused, searchResults, activeIndex]);

  return (
    <>
      {/* 蒙层与搜索结果 */}
      {focused && (
        <div
          className="fixed inset-0 z-40 bg-white/40 backdrop-blur-lg flex flex-col items-center pt-32"
          onMouseDown={() => setFocused(false)}
        >
          <div
            className="w-full max-w-xl bg-white/80 rounded-2xl shadow-2xl p-6"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="relative">
              <input
                ref={modalInputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg bg-white/80 shadow text-black pr-12"
                placeholder="搜索内容…"
                autoFocus
                onFocus={() => setFocused(true)}
              />
              {/* 放大镜图标 */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" />
                  <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((item, idx) => (
                    <li
                      key={item.title}
                      className={`px-4 py-2 rounded cursor-pointer text-black ${activeIndex === idx ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseDown={() => window.location.href = item.url}
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-center py-6">暂无结果</div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center py-3 px-4 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-700 hover:text-indigo-500 transition-colors">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            山东大学软件学院智库(BETA)
          </Link>

          {/* 搜索框居中 */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md relative">
              <input
                ref={navInputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base bg-white/80 shadow transition text-black pr-10"
                placeholder="搜索内容…（Ctrl+K）"
                onFocus={() => {
                  setFocused(true);
                  setTimeout(() => {
                    modalInputRef.current?.focus();
                  }, 0);
                }}
              />
              {/* 放大镜图标 */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" />
                  <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>

          {/* 右侧主导航栏 */}
          <div className="flex items-center space-x-2 ml-6">
            <NavLink href="/">首页</NavLink>
            <NavLink href="/news">新闻</NavLink>
            <NavLink href="/notices">通知</NavLink>
            <NavLink href="/downloads">资料</NavLink>
            <NavLink href="/lectures">助学</NavLink>

            {/* 登录/用户等功能区，保持原有逻辑 */}
            {status === "loading" && <span className="text-sm text-gray-500">校验中...</span>}

            {status === "authenticated" && session && (
              <>
                <Link
                  href="/write"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors shadow-sm mr-2"
                >
                  发布
                </Link>
                {session.user.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/admin/permissions"
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors shadow-sm mr-2"
                  >
                    权限管理
                  </Link>
                )}
                <div className="relative group">
                  <button
                    className="md:inline text-sm text-gray-700 px-2 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1 focus:outline-none"
                    onClick={() => setShowUserMenu((v) => !v)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                    tabIndex={0}
                    style={{ minWidth: 0 }}
                  >
                    <span>{session.user.username || session.user.name || session.user.email}</span>
                    {session.user.role === 'SUPER_ADMIN' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-300 shadow-sm animate-pulse">
                        <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2l6 3v4.5c0 4.418-2.94 8.418-6 9-3.06-.582-6-4.582-6-9V5l6-3z" />
                        </svg>
                        超级管理员
                      </span>
                    )}
                    {session.user.role === 'ADMIN' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-300 shadow-sm">
                        <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2l6 3v4.5c0 4.418-2.94 8.418-6 9-3.06-.582-6-4.582-6-9V5l6-3z" />
                        </svg>
                        管理员
                      </span>
                    )}
                  </button>
                  {/* 二级菜单 */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 animate-fade-in"
                      onMouseDown={e => e.preventDefault()}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-t-xl transition-colors text-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        个人中心
                      </Link>
                      <button
                        onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: '/' }); }}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-b-xl transition-colors text-sm"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {status === "unauthenticated" && (
              <>
                <button
                  onClick={() => signIn()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors"
                >
                  登录
                </button>
                <Link
                  href="/register"
                  className="ml-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-2 py-1 rounded transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}