import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';

// 获取所有文章
export async function GET() {
  try {
    const db = await connectDB();
    const results = await db.prepare('SELECT * FROM articles WHERE published = 1 ORDER BY sort_order ASC').all<Article>()
      return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch articles' }, { status: 500 }
  }
}
