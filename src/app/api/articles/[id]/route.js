import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const article = await Article.findById(id).populate('author', 'username email');
    if (!article) {
      return NextResponse.json({ message: '未找到文章' }, { status: 404 });
    }
    return NextResponse.json({ data: article }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: '获取文章失败', error: err.message }, { status: 500 });
  }
}

// 点赞/取消点赞
export async function POST(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }
  try {
    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ message: '未找到文章' }, { status: 404 });
    }
    const userId = session.user.id;
    let liked = false;
    if (article.likes.map(String).includes(userId)) {
      // 已点赞，取消
      article.likes = article.likes.filter(u => String(u) !== userId);
      liked = false;
    } else {
      // 未点赞，添加
      article.likes.push(userId);
      liked = true;
    }
    await article.save();
    return NextResponse.json({ success: true, liked, likeCount: article.likes.length });
  } catch (err) {
    return NextResponse.json({ message: '点赞失败', error: err.message }, { status: 500 });
  }
}
