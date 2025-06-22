import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 点赞/取消点赞
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: '请先登录' }, { status: 401 });
  const article = await Article.findById(id);
  if (!article) return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  const userId = session.user.id;
  let liked = false;
  if (Array.isArray(article.likes) && article.likes.includes(userId)) {
    // 取消点赞
    article.likes = article.likes.filter(uid => uid.toString() !== userId);
    liked = false;
  } else {
    // 点赞
    article.likes = [...(article.likes || []), userId];
    liked = true;
  }
  await article.save();
  return NextResponse.json({ liked, likeCount: article.likes.length });
}
