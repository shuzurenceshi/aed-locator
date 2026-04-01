import { NextResponse } from 'next/server';
import { connectDB, getAEDs, createAED, updateAED, deleteAED } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET - 获取所有 AED（管理端）
export async function GET() {
  try {
    const db = await connectDB();
    const aeds = await getAEDs(db);
    return NextResponse.json({ success: true, data: aeds });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AEDs' },
      { status: 500 }
    );
  }
}

// POST - 创建 AED
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await connectDB();
    const result = await createAED(db, data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create AED' },
      { status: 500 }
    );
  }
}
