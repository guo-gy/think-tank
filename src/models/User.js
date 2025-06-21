// src/models/User.js

import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({ // 直接使用解构出来的 Schema
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
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 防止在热重载时重复编译模型
export default models.User || model('User', UserSchema); // 使用解构出来的 models 和 model