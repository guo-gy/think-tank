import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 审核通过
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: '无权限' }, { status: 403 });
  }
  const article = await Article.findById(id);
  if (!article) return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  if (article.status !== 'PENDING') {
    return NextResponse.json({ message: '文章状态不正确' }, { status: 400 });
  }
  article.status = 'PUBLIC';
  await article.save();
  return NextResponse.json({ message: '审核通过', status: 'PUBLIC' });
}

// 审核拒绝
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: '无权限' }, { status: 403 });
  }
  const article = await Article.findById(id);
  if (!article) return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  if (article.status !== 'PENDING') {
    return NextResponse.json({ message: '文章状态不正确' }, { status: 400 });
  }
  article.status = 'PRIVATE';
  await article.save();
  return NextResponse.json({ message: '已拒绝', status: 'PRIVATE' });
}
