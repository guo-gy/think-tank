import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    try {
      const article = await Article.findById(id).populate('author', 'username');
      if (!article) return res.status(404).json({ message: '未找到文章' });
      res.status(200).json({ data: article });
    } catch (err) {
      res.status(500).json({ message: '获取文章失败', error: err.message });
    }
  } else {
    res.status(405).json({ message: '不支持该请求方法' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
