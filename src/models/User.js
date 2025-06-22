// src/models/User.js

import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username.'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        select: false,
    },
    avatar: {
        type: Buffer, // 直接存储图片二进制
    },
    avatarType: {
        type: String, // 图片类型
        enum: ['image/jpeg', 'image/png'],
        default: 'image/png',
    },
    bio: {
        type: String, // 简介
        trim: true,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
        default: 'USER',
    },
    likedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
    }],
    likedComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 防止在热重载时重复编译模型
export default models.User || model('User', UserSchema); // 使用解构出来的 models 和 model