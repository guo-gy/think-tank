import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title.'],
    trim: true,
  },
  content: {
    type: String, // markdown 或 html
    required: [true, 'Please provide content.'],
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    trim: true, // 保存图片id字符串
  },
  attachments: [
    {
      type: String, // 附件的 URL 或 ID
      trim: true,
    },
  ],
  images: [
    {
      type: String,
      trim: true,
    },
  ],
  status: {
    type: String,
    enum: ['PRIVATE', 'PENDING', 'PUBLIC'],
    default: 'PRIVATE',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partition: {
    type: String,
    enum: ['SQUARE', 'NOTICE', 'DOWNLOAD'],
    required: true,
  },
  category: {
    type: String, // 分类自定义
    trim: true,
  },
  subCategory: {
    type: String, // 小分类自定义（如有）
    trim: true,
  },
  commentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 更新 updatedAt 字段的中间件
ArticleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

ArticleSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 防止模型缓存导致的 schema 不一致
if (mongoose.models.Article) {
  delete mongoose.models.Article;
}

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
