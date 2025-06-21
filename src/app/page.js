"use client";

import React, { useRef, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

// 现代化纯白卡片风格
function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 shadow-md p-4 transition-all hover:scale-105 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const newsList = [
    { id: 1, title: '智库官网全新上线', desc: '欢迎访问我们的新平台！', img: '/images/1.jpg' },
    { id: 2, title: '运营部月度简报', desc: '本月运营数据创新高。', img: '/images/2.jpg' },
    { id: 3, title: '行业动态速递', desc: '最新行业资讯一览。', img: '/images/3.jpg' },
    { id: 4, title: '活动预告', desc: '下月精彩活动不容错过。', img: '/images/1.jpg' },
  ];
  const downloadList = [
    { id: 1, title: '2025年资料包', desc: '最新学习资料免费下载。', img: '/images/1.jpg' },
    { id: 2, title: '行业报告合集', desc: '权威报告一键获取。', img: '/images/2.jpg' },
  ];
  const lectureList = [
    { id: 1, title: '高效学习方法', desc: '朋辈部讲师经验分享。', img: '/images/1.jpg' },
    { id: 2, title: '时间管理讲义', desc: '助你高效规划每一天。', img: '/images/2.jpg' },
  ];
  const noticeList = [
    { id: 1, title: '五一放假通知', desc: '放假时间及安排说明。', img: '/images/3.jpg' },
    { id: 2, title: '朋辈部纳新公告', desc: '欢迎新成员加入！', img: '/images/2.jpg' },
  ];

  const carouselImages = [
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg',
    '/images/5.jpg',
  ];

  const scrollRef = useRef(null);

  // 鼠标拖动横向滚动（需用 pointer 事件防止被子元素拦截）
  function handleDragScroll(ref) {
    let isDown = false;
    let startX, scrollLeft;
    const el = ref.current;
    if (!el) return;

    // 只绑定一次
    if (el._hasDragScroll) return;
    el._hasDragScroll = true;

    el.addEventListener('pointerdown', (e) => {
      isDown = true;
      el.classList.add('cursor-grabbing');
      startX = e.pageX;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('pointerleave', () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    });
    el.addEventListener('pointerup', () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    });
    el.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    });

    // 鼠标滚轮横向滚动
    el.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }

  // 左右箭头滑动
  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleDragScroll(scrollRef);
  }, []);

  // 四个大卡片分别占据屏幕宽度的0.7, 0.5, 0.5, 0.5
  // 横向滑动，顶部多留空间，卡片有圆角和间距，卡片内部不可滚动，内容自适应
  return (
    <div className="fixed inset-0 w-full h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white overflow-hidden">
      <div className="w-full h-full pt-[96px] relative">
        {/* 左右箭头按钮 */}
        <button
          className="absolute left-2 top-1/2 z-30 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => scrollBy(-400)}
          tabIndex={-1}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          className="absolute right-2 top-1/2 z-30 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => scrollBy(400)}
          tabIndex={-1}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <div
          ref={scrollRef}
          className="flex flex-row h-[calc(100vh-96px)] gap-12 px-8 pb-8 overflow-x-auto cursor-grab select-none scrollbar-hide"
          style={{
            userSelect: "none",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {/* 智库介绍区 0.3 屏宽 */}
          <div
            className="flex flex-col justify-center items-center h-full flex-shrink-0"
            style={{ width: '29vw', minWidth: 260, maxWidth: 520 }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center px-6">
              <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center">山东大学软件智库</h1>
              <p className="text-lg text-gray-700 leading-relaxed text-center mb-4">
                山东大学软件智库致力于服务师生、赋能成长，聚合校内外优质资源，打造集资讯、通知、资料、讲义于一体的综合性平台。<br />
                我们关注学业、生活、就业等多元需求，助力每一位同学高效成长、全面发展。
              </p>
              <p className="text-base text-gray-500 text-center">
                欢迎加入我们，共建共享智慧校园！
              </p>
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
                  {carouselImages.map((src, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="relative w-full h-full" style={{ minHeight: 200 }}>
                        <Image
                          src={src}
                          alt={`轮播图${idx + 1}`}
                          fill
                          className="object-cover w-full h-full rounded-3xl shadow-lg"
                          style={{ background: '#f3f4f6' }}
                          priority={idx === 0}
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent text-white px-6 py-6 rounded-b-2xl">
                          <Link href={`/news/${newsList[idx]?.id || ''}`}>
                            <span className="hover:underline cursor-pointer text-xl font-bold text-white">{newsList[idx]?.title || ''}</span>
                          </Link>
                          <div className="text-sm text-white mt-1">{newsList[idx]?.desc || ''}</div>
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
                  key={item.id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.desc}</span>
                  </div>
                  {item.img && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={item.img}
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
                  key={item.id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.desc}</span>
                  </div>
                  {item.img && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={item.img}
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
                  key={item.id}
                  className="flex flex-row h-20 rounded-xl border border-gray-100 bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex-1 flex flex-col justify-center px-5 py-2">
                    <span className="text-base font-semibold text-gray-800">{item.title}</span>
                    <span className="text-sm text-gray-500 mt-1">{item.desc}</span>
                  </div>
                  {item.img && (
                    <div className="relative w-1/2 h-full min-w-[4rem]">
                      <Image
                        src={item.img}
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