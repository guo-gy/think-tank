// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // 解析请求体
        const { username, email, password } = await request.json();

        // 基本校验
        if (!username || !email || !password) {
            return NextResponse.json({ message: '用户名、邮箱和密码均为必填' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ message: '密码长度不能少于6位' }, { status: 400 });
        }

        // 连接数据库
        await dbConnect();

        // 检查邮箱和用户名唯一性
        const [emailExists, usernameExists] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username })
        ]);
        if (emailExists) {
            return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 });
        }
        if (usernameExists) {
            return NextResponse.json({ message: '用户名已被占用' }, { status: 409 });
        }

        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户，默认角色 USER
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'USER',
        });
        await newUser.save();

        return NextResponse.json({ message: '注册成功' }, { status: 201 });
    } catch (error) {
        console.error('注册错误:', error);
        if (error.code === 11000) {
            return NextResponse.json({ message: '邮箱或用户名已存在' }, { status: 409 });
        }
        return NextResponse.json({ message: '注册失败', error: error.message }, { status: 500 });
    }
}