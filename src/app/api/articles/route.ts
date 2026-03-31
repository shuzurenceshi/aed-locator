import { NextRequest, NextResponse } from 'next/server';
import { AED } from '@/types';
import { getAEDs, initDB } from '@/db';

// 获取所有 AED
export async function GET() {
  try {
    await initDB();
    const aeds = await getAEDs();
    return NextResponse.json({ success: true, data: aeds });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch AEDs' }, { status: 500 }
  }
}

