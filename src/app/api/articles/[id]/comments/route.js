import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import Comment from '@/models/Comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 获取评论列表
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const article = await Article.findById(id).populate({
    path: 'commentIds',
    populate: { path: 'author', select: 'username email' },
    options: { sort: { createdAt: -1 } }
  });
  if (!article) return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  return NextResponse.json({ comments: article.commentIds || [] });
}

// 新增评论
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: '请先登录' }, { status: 401 });
  const { content } = await req.json();
  if (!content || !content.trim()) return NextResponse.json({ message: '评论内容不能为空' }, { status: 400 });
  const article = await Article.findById(id);
  if (!article) return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  const comment = await Comment.create({
    content,
    article: id,
    author: session.user.id,
    createdAt: new Date(),
  });
  article.commentIds = article.commentIds || [];
  article.commentIds.push(comment._id);
  await article.save();
  await comment.populate('author', 'username email');
  return NextResponse.json({ comment });
}
