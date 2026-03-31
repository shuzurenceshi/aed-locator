import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AED 急救定位 - 快速找到最近的除颤器",
  description: "紧急情况下快速定位附近的自动体外除颤器（AED），提供导航指引，挽救生命",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
