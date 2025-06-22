import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// MongoDB 文件模型
async function getFileModel() {
  await dbConnect();
  const FileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  }, { collection: 'files' });
  return mongoose.models.File || mongoose.model('File', FileSchema);
}

export const runtime = 'nodejs';

export async function POST(req) {
  const { user } = await getServerSession(authOptions);
  const userId = user?.id || user?.userId;
  if (!userId) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }
  const formData = await req.formData();
  let files = formData.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ message: '未上传文件' }, { status: 400 });
  }
  // 兼容单文件上传
  if (!Array.isArray(files)) files = [files];
  const File = await getFileModel();
  const urls = [];
  const ids = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const doc = await File.create({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      data: buffer,
      userId,
    });
    urls.push(`/files/${doc._id}`);
    ids.push(doc._id.toString());
  }
  return NextResponse.json({ urls, ids });
}
