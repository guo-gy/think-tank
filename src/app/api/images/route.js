import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// MongoDB 图片模型
async function getImageModel() {
  await dbConnect();
  const ImageSchema = new mongoose.Schema(
    {
      filename: String,
      contentType: String,
      size: Number,
      data: Buffer,
      userId: String,
      createdAt: { type: Date, default: Date.now },
    },
    { collection: 'images' }
  );
  return mongoose.models.Image || mongoose.model('Image', ImageSchema);
}

export const runtime = 'nodejs'; // 需要 nodejs runtime 支持 Buffer

export async function POST(req) {
  const { user } = await getServerSession(authOptions);
  const userId = user?.id || user?.userId; // 取决于你的 session 结构
  if (!userId) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }
  const formData = await req.formData();
  const files = formData.getAll('images');
  if (!files || files.length === 0) {
    return NextResponse.json({ message: '未上传图片' }, { status: 400 });
  }
  const Image = await getImageModel();
  const urls = [];
  const ids = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const doc = await Image.create({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: buffer,
      userId,
    });
    // 返回 /api/images/图片id
    urls.push(`/api/images/${doc._id}`);
    ids.push(doc._id.toString());
  }
  return NextResponse.json({ urls, ids });
}
