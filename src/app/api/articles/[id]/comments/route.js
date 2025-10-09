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
    options: { sort: { createdAt: -1 } },
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

// 删除评论
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id: articleId } = await params;

  // 获取URL查询参数中的commentId
  const searchParams = req.nextUrl.searchParams;
  const commentId = searchParams.get('commentId');

  // 验证用户登录状态
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }
  // 验证参数完整性
  if (!commentId) {
    return NextResponse.json({ message: '评论ID不能为空' }, { status: 400 });
  }
  try {
    // 查找评论并验证所有权
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ message: '未找到评论' }, { status: 404 });
    }
    // 检查评论是否属于当前用户（权限验证）
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ message: '没有权限删除此评论' }, { status: 403 });
    }
    // 查找文章并移除评论引用
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json({ message: '未找到文章' }, { status: 404 });
    }
    // 从文章的评论ID数组中移除当前评论ID
    article.commentIds = article.commentIds.filter((id) => id.toString() !== commentId);
    await article.save();

    // 删除评论
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ success: true, message: '评论已删除' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ message: '服务器错误，删除失败' }, { status: 500 });
  }
}

//简洁版删除，无安全验证

// export async function DELETE(req, { params }) {
//   await dbConnect();
//   const { id: articleId } = params;

//   // 获取URL查询参数中的commentId
//   const searchParams = req.nextUrl.searchParams;
//   const commentId = searchParams.get('commentId');

//     // 查找文章并移除评论引用
//     const article = await Article.findById(articleId);
//     // 从文章的评论ID数组中移除当前评论ID
//     article.commentIds = article.commentIds.filter(
//       id => id.toString() !== commentId
//     );
//     await article.save();
//     // 删除评论
//     await Comment.findByIdAndDelete(commentId);

//     return NextResponse.json({ success: true, message: '评论已删除' });
// }
