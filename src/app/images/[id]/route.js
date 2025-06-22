import dbConnect from '@/lib/dbConnect';
import ImageModel from '@/models/Image';

export async function GET(req, context) {
  const params = typeof context.params?.then === 'function' ? await context.params : context.params;
  const { id } = params;
  await dbConnect();
  if (!id) {
    return new Response('参数缺失', { status: 400 });
  }
  try {
    const imageDoc = await ImageModel.findById(id);
    if (!imageDoc || !imageDoc.data) {
      return new Response('未找到图片', { status: 404 });
    }
    let contentType = imageDoc.contentType || 'application/octet-stream';
    return new Response(imageDoc.data.buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response('服务器错误', { status: 500 });
  }
}
