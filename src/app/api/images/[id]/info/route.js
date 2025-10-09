import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// 复用图片模型定义
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

export const runtime = 'nodejs';

// GET /api/images/[id]/info - 根据ID查询图片信息（包含名称）
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // 查询图片
    const Image = await getImageModel();
    const imageDoc = await Image.findById(id);

    // 图片不存在
    if (!imageDoc) {
      return NextResponse.json({ message: '图片不存在' }, { status: 404 });
    }

    // 返回图片信息（仅包含需要的元数据，避免返回二进制data）
    return NextResponse.json(
      {
        success: true,
        data: {
          id: imageDoc._id,
          name: imageDoc.filename, // 图片名称
          contentType: imageDoc.contentType, // 图片类型（如image/jpeg）
          size: imageDoc.size, // 图片大小（字节）
          createdAt: imageDoc.createdAt, // 上传时间
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('查询图片信息失败:', error);
    return NextResponse.json({ message: '服务器错误，查询图片信息失败' }, { status: 500 });
  }
}
