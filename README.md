# 智库官网 (Think Tank Hub)

这是一个使用 [Next.js](https://nextjs.org/) (JavaScript 版本) 构建的智库官网项目，旨在提供资讯发布、知识库管理、用户登录与评论等功能。项目采用前后端不分离的架构，后端 API 通过 Next.js API Routes 实现。

## 项目概述

本项目旨在创建一个现代化的智库平台，主要功能包括：

*   **资讯发布：** 管理员可以发布最新的行业资讯和研究成果。
*   **知识库：** 构建结构化的知识库，方便用户查阅和学习。
*   **用户系统：** 支持用户注册、登录。
*   **管理员权限：** 管理员拥有发布和管理文章的权限。
*   **用户评论：** 普通注册用户可以对文章进行评论和讨论。

## 技术栈

*   **前端框架：** [Next.js](https://nextjs.org/) (v14+ App Router, JavaScript)
*   **UI 库/样式：** [Tailwind CSS](https://tailwindcss.com/)
*   **后端 API：** Next.js API Routes (Node.js 环境)
*   **数据库：** [MongoDB](https://www.mongodb.com/) (通过 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 云服务托管)
*   **ODM (Object Document Mapper)：** [Mongoose](https://mongoosejs.com/)
*   **用户认证：** [NextAuth.js](https://next-auth.js.org/)
*   **富文本编辑器：** [React-Quill](https://github.com/zenoamaro/react-quill) / [Tiptap](https://tiptap.dev/) (待定或根据实际选择填写)
*   **状态管理：** React Context API (按需使用)
*   **部署平台：** [Vercel](https://vercel.com/)

## 环境准备

在开始开发之前，请确保你已经安装并配置好以下环境：

1.  **Node.js:** (建议 LTS 版本，例如 v18.x 或更高)
2.  **npm / pnpm / yarn:** (本项目使用 `npm` / `pnpm` / `yarn` - 选择你使用的那个)
3.  **Git:** 版本控制系统。
4.  **MongoDB Atlas 账户 (或本地 MongoDB 实例):**
    *   注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 并创建一个免费集群。
    *   获取你的 MongoDB 连接字符串。

## 项目设置与启动

1.  **克隆仓库 (如果你是从 Git 克隆的)：**
    ```bash
    git clone https://github.com/guo-gy/think-tank
    cd think-tank
    ```

2.  **安装依赖：**
    ```bash
    npm install
    ```

3.  **配置环境变量：**
    *   创建 `.env.local` 文件：
        ```env
        # .env.local

        # MongoDB 连接字符串 (从 MongoDB Atlas 获取)
        MONGODB_URI="mongodb+srv://<username>:<password>@yourcluster.mongodb.net/<dbname>?retryWrites=true&w=majority"

        # NextAuth.js 配置
        NEXTAUTH_URL="http://localhost:3000" # 开发环境 URL
        NEXTAUTH_SECRET="生成一个强随机字符串，例如使用 openssl rand -base64 32"

        # 其他可能需要的环境变量...
        # 例如，第三方 API 密钥等
        ```
    *   **重要：** `.env.local` 文件不应提交到版本控制。确保它在 `.gitignore` 文件中。

4.  **运行开发服务器：**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

5.  在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `src/app/page.js` (如果使用 App Router) 或 `src/pages/index.js` (如果使用 Pages Router) 来开始编辑主页。页面会在你编辑文件时自动更新。

## 学习更多

要了解更多关于我们使用的技术，请查看以下资源：

*   [Next.js Documentation](https://nextjs.org/docs) - Next.js 特性及 API。
*   [Learn Next.js](https://nextjs.org/learn) - Next.js 官方交互式教程。
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind CSS 工具类。
*   [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) / [Mongoose Documentation](https://mongoosejs.com/docs/guide.html) - MongoDB 与 Node.js 交互。
*   [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction) - Next.js 应用认证。

## 部署

本项目推荐使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 进行部署，这是由 Next.js 的创建者提供的最简单的部署方式。

1.  将你的项目推送到 Git 仓库 (如 GitHub, GitLab, Bitbucket)。
2.  在 Vercel 上导入你的项目。
3.  配置生产环境变量 (如 `MONGODB_URI`, `NEXTAUTH_URL` 应设为你的生产域名, `NEXTAUTH_SECRET`)。
4.  Vercel 将会自动构建和部署你的应用。

更多细节请参考 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 贡献

欢迎提出 Issue 和 Pull Request！如果你想为这个项目做出贡献，请先 Fork 本仓库，然后在你的分支上进行修改，并提交 Pull Request。

---

_本项目由 `create-next-app` 初始化，并针对智库官网的需求进行了规划。_

---

统一图片上传、访问、删除接口说明：
- 上传：POST /images
- 访问/下载：GET /images/:id
- 删除：DELETE /images/:id
所有图片路径、接口、Markdown 插入均统一为 /images/图片id

历史 /api/upload/images 路径已废弃，请勿再使用。

示例 Markdown 插入：![](/images/图片id)

详情见 src/app/images/route.js 和 src/app/images/[id]/route.js
