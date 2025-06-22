"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Hero3D from "@/components/Hero3D";

// 现代化纯白卡片风格
function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 shadow-md p-4 transition-all hover:scale-105 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  // 后端数据
  const [newsList, setNewsList] = useState([]);
  const [downloadList, setDownloadList] = useState([]);
  const [lectureList, setLectureList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);

  // 轮播图图片
  const carouselImages = [
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg',
    '/images/5.jpg',
  ];

  // 拉取各分区最新5条
  useEffect(() => {
    fetch('/api/articles?partition=NEWS&status=PUBLIC')
      .then(res => res.json())
      .then((data) => setNewsList((data.data || []).slice(0, 5)));
    fetch('/api/articles?partition=DOWNLOAD&status=PUBLIC')
      .then(res => res.json())
      .then((data) => setDownloadList((data.data || []).slice(0, 5)));
    fetch('/api/articles?partition=LECTURE&status=PUBLIC')
      .then(res => res.json())
      .then((data) => setLectureList((data.data || []).slice(0, 5)));
    fetch('/api/articles?partition=NOTICE&status=PUBLIC')
      .then(res => res.json())
      .then((data) => setNoticeList((data.data || []).slice(0, 5)));
  }, []);

  const scrollRef = useRef(null);

  // 仅保留鼠标滚轮横向滚动，且全局可用（包括轮播图区域）
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el._hasWheelScroll) return;
    el._hasWheelScroll = true;

    const onWheel = (e) => {
      // 只要纵向滚轮，全部转为横向滚动
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 左右箭头滑动
  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white overflow-hidden">
      <div className="w-full h-full pt-[96px] relative">
        {/* 左右箭头按钮 */}
        <button
          className="absolute left-2 top-1/2 z-30 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => scrollBy(-window.innerWidth * 0.33)}
          tabIndex={-1}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          className="absolute right-2 top-1/2 z-30 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => scrollBy(window.innerWidth * 0.33)}
          tabIndex={-1}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <div
          ref={scrollRef}
          className="flex flex-row h-[calc(100vh-96px)] gap-12 px-8 pb-8 overflow-x-auto select-none scrollbar-hide"
          style={{
            userSelect: "none",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {/* 3D球体专属卡片（无背景、无阴影、无边框） */}
          <div
            className="flex flex-col justify-center items-center h-full flex-shrink-0 p-12"
            style={{ width: '29vw', minWidth: 260, maxWidth: 520 }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center px-6">
             
              <div className="w-full flex justify-center items-center mt-4 mb-4" style={{height:120, minHeight:90, maxHeight:150, position:'relative'}}>
                <Hero3D />
              </div>
            </div>
          </div>
          {/* 新闻资讯 0.7 屏宽 */}
          <section
            className="flex flex-col h-full flex-shrink-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-12"
            style={{ width: '65vw', minWidth: 400, maxWidth: 1200, overflow: 'visible' }}
          >
            <div className="flex items-center mb-8">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span className="inline-block w-6 h-6 mr-1 text-red-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" />
                  <path d="M16 3 12 7 8 3" stroke="currentColor" />
                </svg>
              </span>
              <Link
                href="/news"
                className="text-3xl font-bold text-red-600 text-center flex-1 transition-colors duration-200 hover:text-red-400 cursor-pointer select-none"
                style={{ textDecoration: 'none' }}
              >
                新闻资讯
              </Link>
            </div>
            <div className="border-b border-gray-100"></div>
            <div className="flex flex-col items-center mt-8">
              <div className="w-full" style={{ aspectRatio: '16/9', minHeight: 200 }}>
                <Swiper
                  spaceBetween={20}
                  slidesPerView={1}
                  loop
                  className="h-full rounded-2xl"
                >
                  {newsList.map((item, idx) => (
                    <SwiperSlide key={item._id || idx}>
                      <div className="relative w-full h-full" style={{ minHeight: 200 }}>
                        <Image
                          src={item.coverImage ? `/api/images/${item.coverImage}` : '/api/images/1.jpg'}
                          alt={`轮播图${idx + 1}`}
                          fill
                          className="object-cover w-full h-full rounded-3xl shadow-lg"
                          style={{ background: '#f3f4f6' }}
                          priority={idx === 0}
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent text-white px-6 py-6 rounded-b-2xl">
                          <Link href={`/${item._id || ''}`}>
                            <span className="hover:underline cursor-pointer text-xl font-bold text-white">{item.title || ''}</span>
                          </Link>
                          <div className="text-sm text-white mt-1">{item.description || ''}</div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </section>
          {/* 通知公告 0.5 屏宽 */}
          <section
            className="flex flex-col h-full flex-shrink-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-12"
            style={{ width: '29vw', minWidth: 340, maxWidth: 700, overflow: 'visible' }}
          >
            <div className="flex items-center mb-8">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              <span className="inline-block w-6 h-6 mr-1 text-blue-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10v4h2l5 5V5L5 10H3z" stroke="currentColor"/>
                  <path d="M16 8a4 4 0 0 1 0 8" stroke="currentColor"/>
                </svg>
              </span>
              <Link
                href="/notices"
                className="text-2xl font-bold text-blue-600 text-center flex-1 transition-colors duration-200 hover:text-blue-400 cursor-pointer select-none"
                style={{ textDecoration: 'none' }}
              >
                通知公告
              </Link>
            </div>
            <div className="border-b border-gray-100"></div>
            <div className="flex flex-col gap-4 mt-8">
              {noticeList.map(item => (
                <div
                  key={item._id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.description || '暂无摘要'}</span>
                  </div>
                  {item.coverImage && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={`/api/images/${item.coverImage}`}
                        alt="公告配图"
                        fill
                        className="object-cover w-full h-full object-center"
                        style={{ borderRadius: 0 }}
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
              ))}
            </div>
            <div className="text-right mt-6">
              <Link
                href="/notices"
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                查看更多公告 &rarr;
              </Link>
            </div>
          </section>
          {/* 资料下载 0.5 屏宽 */}
          <section
            className="flex flex-col h-full flex-shrink-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-12"
            style={{ width: '30vw', minWidth: 340, maxWidth: 700, overflow: 'visible' }}
          >
            <div className="flex items-center mb-8">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="inline-block w-6 h-6 mr-1 text-green-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor"/>
                  <path d="M8 20h8" stroke="currentColor"/>
                  <path d="M12 16v4" stroke="currentColor"/>
                </svg>
              </span>
              <Link
                href="/downloads"
                className="text-2xl font-bold text-green-600 text-center flex-1 transition-colors duration-200 hover:text-green-400 cursor-pointer select-none"
                style={{ textDecoration: 'none' }}
              >
                资料下载
              </Link>
            </div>
            <div className="border-b border-gray-100"></div>
            <div className="flex flex-col gap-4 mt-8">
              {downloadList.map(item => (
                <div
                  key={item._id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.description || '暂无摘要'}</span>
                  </div>
                  {item.coverImage && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={`/api/images/${item.coverImage}`}
                        alt="资料配图"
                        fill
                        className="object-cover w-full h-full object-center"
                        style={{ borderRadius: 0 }}
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
              ))}
            </div>
            <div className="text-right mt-6">
              <Link
                href="/downloads"
                className="text-sm text-gray-400 hover:text-green-500 transition-colors"
              >
                查看更多资料 &rarr;
              </Link>
            </div>
          </section>
          {/* 朋辈讲义 0.5 屏宽 */}
          <section
            className="flex flex-col h-full flex-shrink-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-12"
            style={{ width: '30vw', minWidth: 340, maxWidth: 700, overflow: 'visible' }}
          >
            <div className="flex items-center mb-8">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
              <span className="inline-block w-6 h-6 mr-1 text-yellow-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" stroke="currentColor"/>
                  <path d="M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" stroke="currentColor"/>
                </svg>
              </span>
              <Link
                href="/lectures"
                className="text-2xl font-bold text-yellow-500 text-center flex-1 transition-colors duration-200 hover:text-yellow-400 cursor-pointer select-none"
                style={{ textDecoration: 'none' }}
              >
                朋辈讲义
              </Link>
            </div>
            <div className="border-b border-gray-100"></div>
            <div className="flex flex-col gap-4 mt-8">
              {lectureList.map(item => (
                <div
                  key={item._id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.description || '暂无摘要'}</span>
                  </div>
                  {item.coverImage && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={`/api/images/${item.coverImage}`}
                        alt="讲义配图"
                        fill
                        className="object-cover w-full h-full object-center"
                        style={{ borderRadius: 0 }}
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
              ))}
            </div>
            <div className="text-right mt-6">
              <Link
                href="/lectures"
                className="text-sm text-gray-400 hover:text-yellow-500 transition-colors"
              >
                查看更多讲义 &rarr;
              </Link>
            </div>
          </section>
          {/* 介绍专属卡片（无背景、无阴影、无边框，排在最右） */}
          <div
            className="flex flex-col justify-center items-center h-full flex-shrink-0 p-12"
            style={{ width: '29vw', minWidth: 260, maxWidth: 520 }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center px-6">
              <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 text-center">山东大学软件学院智库</h1>
              <p className="text-lg text-gray-700 leading-relaxed text-center mb-2">
                山东大学软件学院智库致力于服务师生、赋能成长，聚合校内外优质资源，打造集资讯、通知、资料、讲义于一体的综合性平台。<br />
                我们关注学业、生活、就业等多元需求，助力每一位同学高效成长、全面发展。
              </p>
              <p className="text-base text-gray-500 text-center mb-2">
                欢迎加入我们，共建共享智慧校园！
              </p>
            </div>
          </div>
        </div>
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}