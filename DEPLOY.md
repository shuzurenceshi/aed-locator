# AED 定位器 - 部署指南

## 快速部署

### 方式一：Cloudflare Pages（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
3. 选择 GitHub 仓库 `shuzurenceshi/aed-locator`
4. 配置构建设置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `out`
   - **根目录**: `/`
5. 点击 **Save and Deploy**

### 方式二：Vercel

```bash
npx vercel --prod
```

### 方式三：静态托管

`out/` 目录包含完整的静态文件，可以部署到任何静态托管服务：
- GitHub Pages
- Netlify
- AWS S3
- 阿里云 OSS
- 腾讯云 COS

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 静态文件在 out/ 目录
```

## 环境要求

- Node.js 18+
- npm 9+

## 功能

- ✅ 地理定位
- ✅ 显示附近 AED
- ✅ 按距离排序
- ✅ 导航到高德地图
- ✅ 紧急求助电话
- ✅ 响应式设计
- ✅ PWA 支持（待添加）

## 注意事项

⚠️ 当前 AED 数据为示例数据，生产环境需要接入真实数据源。

## License

MIT
