import { NextResponse } from 'next/server';
import { connectDB, getAEDs } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectDB();
    const aeds = await getAEDs(db);
    return NextResponse.json({ success: true, data: aeds });
  } catch (error) {
    console.error('Failed to fetch AEDs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AEDs' },
      { status: 500 }
    );
  }
}
