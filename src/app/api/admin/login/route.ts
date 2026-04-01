import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getAdminByUsername } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const admin = await getAdminByUsername(db, username);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // 简单 token
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
    const response = NextResponse.json({ 
      success: true, 
      data: { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role 
      } 
    });
    
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
