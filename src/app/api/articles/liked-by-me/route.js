import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: '未登录' }, { status: 401 });
  }
  await dbConnect();
  try {
    // 假设 Article.likes 是用户id数组
    const articles = await Article.find({ likes: session.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    return NextResponse.json({ success: true, data: articles }, { status: 200 });
  } catch (error) {
    console.error('Error fetching liked articles:', error);
    return NextResponse.json({ message: '获取点赞文章失败', error: error.message }, { status: 500 });
  }
}
