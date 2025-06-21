// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect(); // 确保数据库已连接

        const user = await User.findOne({ email: credentials.email }).select('+password'); // 明确选择密码字段

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Incorrect password');
        }

        // 返回的对象将包含在 JWT 的 `user` 属性中，并传递给 session 回调
        return {
          id: user._id.toString(), // Mongoose _id 是 ObjectId，转为 string
          username: user.username,
          email: user.email,
          role: user.role,
        };
      }
    })
    // 你可以在这里添加其他 Providers，例如 GitHub, Google 等
    // import GithubProvider from "next-auth/providers/github";
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
  session: {
    strategy: "jwt", // 使用 JSON Web Tokens
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // `user` 参数只在初次登录（或注册后自动登录）时可用
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username; // 可以添加更多信息到 token
      }
      return token;
    },
    async session({ session, token, user }) {
      // `token` 来自 jwt 回调
      // 将 token 中的自定义属性添加到 session.user 对象
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // 指定自定义的登录页面路径
    // error: '/auth/error', // (可选) 自定义错误页面
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (e.g. for email verification)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
  secret: process.env.NEXTAUTH_SECRET, // 从 .env.local 读取
  // debug: process.env.NODE_ENV === 'development', // (可选) 开发模式下开启调试
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };