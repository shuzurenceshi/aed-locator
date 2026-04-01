import { NextResponse } from 'next/server';
import { connectDB, getArticles, createArticle, updateArticle, deleteArticle } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET - 获取所有文章（管理端）
export async function GET() {
  try {
    const db = await connectDB();
    const articles = await getArticles(db, false); // 获取所有文章
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST - 创建文章
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await connectDB();
    const result = await createArticle(db, data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
