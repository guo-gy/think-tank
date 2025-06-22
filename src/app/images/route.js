import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// MongoDB 图片模型
async function getImageModel() {
  await dbConnect();
  const ImageSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  }, { collection: 'uploads_images' });
  return mongoose.models.Image || mongoose.model('Image', ImageSchema);
}

export const runtime = 'nodejs';

// 统一图片上传接口 POST /images
export async function POST(req) {
  const formData = await req.formData();
  // 支持单文件和多文件上传，字段名为 images
  const files = formData.getAll('images');
  if (!files || files.length === 0) {
    return NextResponse.json({ message: '未上传图片' }, { status: 400 });
  }
  const Image = await getImageModel();
  const urls = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const doc = await Image.create({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: buffer,
      userId: null, // 如需用户信息可扩展
    });
    urls.push(`/images/${doc._id}`);
  }
  return NextResponse.json({ urls });
}

// 统一图片访问/下载接口 GET /images/[id]
// 注意：此 route.js 仅处理 POST 上传，实际图片访问由 /images/[id]/route.js 处理
// 若 Next.js 14+ 支持 catch-all，可合并 GET/POST 到同一文件
