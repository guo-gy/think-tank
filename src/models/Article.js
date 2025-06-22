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
    contentType: {
        type: String,
        enum: ['markdown', 'mainAttachment'],
        default: 'markdown',
    },
    description: {
        type: String,
        trim: true,
    },
    coverImage: {
        data: Buffer, // 封面图二进制
        mimeType: { type: String, enum: ['image/jpeg', 'image/png'], default: 'image/png' },
    },
    attachments: [
        {
            fileName: { type: String, required: true },
            fileType: {
                type: String,
                enum: [
                  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'zip',
                  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'
                ],
                required: true,
            },
            size: { type: Number }, // 字节数
            fileData: { type: Buffer, required: true }, // 文件二进制内容
            mimeType: { type: String, required: true }, // 文件 MIME 类型
            url: { type: String, trim: true }, // 可选，兼容外链
        }
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
        enum: ['NEWS', 'NOTICE', 'DOWNLOAD', 'LECTURE'],
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
    commentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
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