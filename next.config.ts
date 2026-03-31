import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 关闭静态导出（使用 static渲染）
  experimental: {
    serverActions: true,
    serverComponents: 'inline' as true,
  },
};

export default nextConfig;
