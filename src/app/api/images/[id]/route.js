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
  }, { collection: 'images' });
  return mongoose.models.Image || mongoose.model('Image', ImageSchema);
}

export const runtime = 'nodejs';

// 统一图片访问/下载/删除接口 GET/DELETE /api/images/[id]
export async function GET(req, { params }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ message: '缺少图片id' }, { status: 400 });
  const Image = await getImageModel();
  const doc = await Image.findById(id);
  if (!doc) return NextResponse.json({ message: '图片不存在' }, { status: 404 });
  return new NextResponse(doc.data.buffer, {
    status: 200,
    headers: {
      'Content-Type': doc.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.filename)}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ message: '缺少图片id' }, { status: 400 });
  const Image = await getImageModel();
  const doc = await Image.findByIdAndDelete(id);
  if (!doc) return NextResponse.json({ message: '图片不存在' }, { status: 404 });
  return NextResponse.json({ message: '图片已删除', id });
}

// 仅处理 GET/DELETE，POST 上传由 /api/images/route.js 处理
