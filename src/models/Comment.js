// src/models/Comment.js

import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please provide comment content.'],
        trim: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);