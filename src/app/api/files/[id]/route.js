import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// MongoDB 文件模型
async function getFileModel() {
  await dbConnect();
  const FileSchema = new mongoose.Schema(
    {
      filename: String,
      contentType: String,
      size: Number,
      data: Buffer,
      userId: String,
      createdAt: { type: Date, default: Date.now },
    },
    { collection: 'files' }
  );
  return mongoose.models.File || mongoose.model('File', FileSchema);
}

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: '缺少文件ID' }, { status: 400 });
  }
  const File = await getFileModel();
  const file = await File.findById(id);
  if (!file) {
    return NextResponse.json({ message: '文件不存在' }, { status: 404 });
  }
  return new NextResponse(file.data.buffer, {
    status: 200,
    headers: {
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
      'Content-Length': file.size,
    },
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ message: '缺少文件id' }, { status: 400 });
  const file = await getFileModel();
  const doc = await file.findByIdAndDelete(id);
  if (!doc) return NextResponse.json({ message: '文件不存在' }, { status: 404 });
  return NextResponse.json({ message: '文件已删除', id });
}
