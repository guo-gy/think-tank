import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: '缺少文章ID' }, { status: 400 });
  }
  const article = await Article.findById(id).select('attachments');
  if (!article) {
    return NextResponse.json({ message: '未找到文章' }, { status: 404 });
  }
  // 保证返回 attachments 字段且为一维数组
  return NextResponse.json({ attachments: Array.isArray(article.attachments) ? article.attachments.flat() : [] });
}
