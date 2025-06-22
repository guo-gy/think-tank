import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getFileModel() {
  await dbConnect();
  const FileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer,
    createdAt: { type: Date, default: Date.now },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }, { collection: 'files' });
  return mongoose.models.File || mongoose.model('File', FileSchema);
}

export const runtime = 'nodejs';

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 });
  }
  const { userId, filename } = await req.json();
  if (!userId || !filename) {
    return NextResponse.json({ message: '参数缺失' }, { status: 400 });
  }
  const File = await getFileModel();
  const result = await File.deleteOne({ uploader: userId, filename });
  if (result.deletedCount === 1) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, message: '未找到文件' }, { status: 404 });
  }
}
