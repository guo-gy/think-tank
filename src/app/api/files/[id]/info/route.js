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
  try {
    const { id } = await params;

    // 查询图片
    const File = await getFileModel();
    const fileDoc = await File.findById(id);
    // 图片不存在
    if (!fileDoc) {
      return NextResponse.json({ message: '文件不存在' }, { status: 404 });
    }
    // 返回图片信息（仅包含需要的元数据，避免返回二进制data）
    return NextResponse.json(
      {
        success: true,
        data: {
          id: fileDoc._id,
          name: fileDoc.filename, // 图片名称
          //   contentType: fileDoc.contentType, // 图片类型（如image/jpeg）
          size: fileDoc.size, // 图片大小（字节）
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('查询文件信息失败:', error);
    return NextResponse.json({ message: '服务器错误，查询文件信息失败' }, { status: 500 });
  }
}
