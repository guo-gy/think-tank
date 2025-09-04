// src/app/api/articles/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

// POST /api/articles - 创建新文章
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: '请先登录后再操作' }, { status: 401 });
  }

  try {
    await dbConnect();
    // 支持 multipart/form-data 或 application/json
    let body;
    let isMultipart = false;
    const reqContentType = request.headers.get('content-type') || '';
    if (reqContentType.includes('multipart/form-data')) {
      isMultipart = true;
      // 这里建议用第三方库如 formidable-serverless 解析 multipart，略（如需可补充）
      return NextResponse.json({ message: '暂不支持 multipart/form-data，请用 JSON 提交' }, { status: 400 });
    } else {
      body = await request.json();
    }
    const {
      title,
      content,
      description,
      coverImage,
      attachments = [], 
      status = 'PRIVATE',
      partition, // 分区，
      category, // 分类，
      subCategory,
    } = body;

    // 基本校验
    if (!title || !content || !partition) {
      return NextResponse.json({ message: '标题、内容、分区不能为空' }, { status: 400 });
    }
    if (!['SQUARE', 'NOTICE', 'DOWNLOAD'].includes(partition)) {
      return NextResponse.json({ message: '分区不合法' }, { status: 400 });
    }
    if (!['PRIVATE', 'PENDING', 'PUBLIC'].includes(status)) {
      return NextResponse.json({ message: '文章状态不合法' }, { status: 400 });
    }

    const newArticle = new Article({
      title,
      content,
      description,
      coverImage,
      attachments,
      status,
      author: session.user.id,
      partition,
      category,
      subCategory,
    });

    const savedArticle = await newArticle.save();

    return NextResponse.json({ success: true, message: '文章创建成功', data: savedArticle }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    if (error.name === 'ValidationError') {
      let errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json({ message: '数据校验失败', errors }, { status: 400 });
    }
    return NextResponse.json({ message: '创建文章失败', error: error.message }, { status: 500 });
  }
}

// GET /api/articles - 获取文章列表
export async function GET(request) {
  try {
    await dbConnect();
    // 支持按状态、分区、分类筛选
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PUBLIC';
    const partition = searchParams.get('partition');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const filter = {};
    if (status.includes(',')) {
      filter.status = { $in: status.split(',') };
    } else {
      filter.status = status;
    }
    if (partition) filter.partition = partition;
    if (category) filter.category = category;
    if (author) filter.author = author; // 关联作者ID筛选
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    // 调试输出每篇文章的 attachments 字段
    return NextResponse.json({ success: true, data: articles }, { status: 200 });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ message: '获取文章列表失败', error: error.message }, { status: 500 });
  }
}