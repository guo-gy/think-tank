import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q) {
    return Response.json({ results: [] });
  }
  await dbConnect();
  // 模糊查找标题包含关键词的文章，最多返回20条
  const articles = await Article.find({ title: { $regex: q, $options: 'i' } })
    .select('title _id')
    .limit(20)
    .lean();
  const results = articles.map(a => ({
    title: a.title,
    url: `/${a._id}`
  }));
  return Response.json({ results });
}
