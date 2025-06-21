// src/app/api/articles/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import User from '@/models/User';

// POST /api/articles - 创建新文章
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: '未认证，禁止访问' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: '无权限操作，需要管理员身份' }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { title, slug, content, excerpt, type, category, tags, isPublished } = body;

    // 基本校验
    if (!title || !slug || !content) {
      return NextResponse.json({ message: '标题、Slug 和内容不能为空' }, { status: 400 });
    }

    // 检查 slug 是否唯一
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      return NextResponse.json({ message: 'Slug 已存在，请使用唯一的 Slug' }, { status: 409 }); // 409 Conflict
    }

    const newArticle = new Article({
      title,
      slug,
      content,
      excerpt,
      type,
      category,
      tags,
      isPublished,
      author: session.user.id, // 从 session 中获取作者 ID
    });

    const savedArticle = await newArticle.save();

    return NextResponse.json({ success: true, message: '文章创建成功', data: savedArticle }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    // Mongoose 校验错误
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

// GET /api/articles - 获取文章列表 (我们稍后会用到)
export async function GET(request) {
    // ... (获取文章列表的逻辑，现在可以先留空或返回一个简单消息)
    try {
        await dbConnect();
        // 示例：获取所有已发布的文章
        const articles = await Article.find({ isPublished: true })
                                  .sort({ createdAt: -1 })
                                  .populate('author', 'username');
        return NextResponse.json({ success: true, data: articles }, { status: 200 });
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json({ message: '获取文章列表失败', error: error.message }, { status: 500 });
    }
}