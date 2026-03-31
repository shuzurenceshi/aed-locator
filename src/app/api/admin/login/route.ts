import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import bcrypt from 'bcryptjs';

// 获取所有 AED
export async function GET() {
  try {
    const db = await connectDB();
    const results = await db.prepare('SELECT * FROM aeds ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch AEDs' }, { status: 500 }
  }
}

