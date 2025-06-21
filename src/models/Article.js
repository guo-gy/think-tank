import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title.'],
        trim: true,
    },
    slug: { // 用于 URL, e.g., my-first-article
        type: String,
        required: [true, 'Please provide a slug.'],
        unique: true,
        trim: true,
    },
    content: { // 可以是 Markdown 或 HTML
        type: String,
        required: [true, 'Please provide content.'],
    },
    excerpt: { // 摘要
        type: String,
        trim: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 引用 User 模型
        required: true,
    },
    type: { // 资讯 NEWS 或 知识库 KNOWLEDGE
        type: String,
        enum: ['NEWS', 'KNOWLEDGE'],
        default: 'NEWS',
    },
    category: { // 可选的分类
        type: String, // 可以简单地用字符串，或者更复杂地引用一个 Category 模型
        trim: true,
    },
    tags: [{ // 标签
        type: String,
        trim: true,
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


export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);