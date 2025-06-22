// src/app/layout.js

import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionWrapper from '@/components/SessionWrapper/SessionWrapper';
export const metadata = {
  title: '山东大学软件学院智库',
  description: '分享知识与资讯',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="zh-CN" className="h-full bg-gray-100">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionWrapper session={session}>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}