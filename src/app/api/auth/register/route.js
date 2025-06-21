// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // 简单的密码强度校验 (示例)
        if (password.length < 6) {
            return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        await dbConnect();

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 哈希密码

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            // role 默认为 'USER'
        });

        await newUser.save();

        // 可以在这里选择是否自动登录用户，或者仅返回成功消息
        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        // 避免暴露过多错误细节给客户端
        if (error.code === 11000) { // MongoDB duplicate key error
            return NextResponse.json({ message: 'Email or username already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'An error occurred during registration', error: error.message }, { status: 500 });
    }
}