import { NextResponse } from 'next/server';
import { connectDB, getArticles } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectDB();
    const articles = await getArticles(db, true); // 只获取已发布的
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
