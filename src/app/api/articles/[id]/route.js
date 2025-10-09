import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

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
      article.likes = article.likes.filter((u) => String(u) !== userId);
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

// PUT /api/articles/[id] - 更新文章
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  // 验证用户是否登录
  if (!session) {
    return NextResponse.json({ message: '请先登录后再操作' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = params;
    let body;
    const reqContentType = request.headers.get('content-type') || '';
    if (reqContentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: '暂不支持 multipart/form-data，请用 JSON 提交' }, { status: 400 });
    } else {
      body = await request.json();
    }

    const { title, content, description, coverImage, attachments = [], images = [], status = 'PRIVATE', partition, category, subCategory } = body;

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

    // 查找文章并验证所有权
    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 });
    }

    // 验证当前用户是否为文章作者
    if (article.author.toString() !== session.user.id) {
      return NextResponse.json({ message: '没有权限修改此文章' }, { status: 403 });
    }

    // 更新文章字段
    article.title = title;
    article.content = content;
    article.description = description;
    article.coverImage = coverImage;
    article.attachments = attachments;
    article.images = images;
    article.status = status;
    article.partition = partition;
    article.category = category;
    article.subCategory = subCategory;
    article.updatedAt = new Date(); // 更新时间戳

    // 保存更新后的文章
    const updatedArticle = await article.save();
    console.log('修改后的文章' + article);

    return NextResponse.json(
      {
        success: true,
        message: '文章更新成功',
        data: updatedArticle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating article:', error);
    if (error.name === 'ValidationError') {
      let errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json({ message: '数据校验失败', errors }, { status: 400 });
    }
    return NextResponse.json({ message: '更新文章失败', error: error.message }, { status: 500 });
  }
}

//DELETE /api/articles/[id] - 删除文章
export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ message: '缺少文章id' }, { status: 400 });
  const doc = await Article.findByIdAndDelete(id);
  if (!doc) return NextResponse.json({ message: '文件不存在' }, { status: 404 });
  return NextResponse.json({ message: '文件已删除', id });
}
