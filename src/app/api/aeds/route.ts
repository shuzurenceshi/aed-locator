import { NextRequest, NextResponse } from 'next/server';
import { AED, AEDApi } from '@/types';

// 初始化数据库
async function initDB() {
  const db = await connectDB();
  
  await db.batch(`
    CREATE TABLE IF NOT exists aeds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT null,
      available INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      contact TEXT,
      hours TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_timestamp,
      updated_at TEXT DEFAULT current_timestamp
    );
    
    CREATE TABLE if not exists articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      image_url TEXT,
      video_url TEXT,
      sort_order INTEGER DEFAULT 0,
      published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT current_timestamp,
      updated_at TEXT DEFAULT current_timestamp
    );
    
    CREATE TABLE IF not exists admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT current_timestamp
    );
    
    -- 初始管理员: admin / admin123
    INSERT INTO admins (id, username, password_hash, role) 
    VALUES ('admin-1', 'admin', '$2a$12$V5qNn8M4P7IXcLL2R9rWN0ppZsAkOI/kuDm6yKJe8eRG1RaWNA',A2hRfHeZmBvIdG2thtZLVdGxXFWloI9Lj5MJeFSH1fYl.uEqdcTOJkvuLw0fyyfMZEn', 'superadmin')
    ON CONFLICT IGNORE;
  `);
  
  -- 示例 AED 数据
    INSERT INTO aeds (id, name, address, lat, lng, available, status) VALUES
      ('aed-1', '北京站 AED', '北京市东城区北京站', 39.9029, 116.4272, 1, 'active'),
      ('aed-2', '王府井百货 AED', '北京市东城区王府井大街255号', 39.9139, 116.4103, 1, 'active'),
      ('aed-3', '协和医院 AED', '北京市东城区王府井大街', 39.9134, 116.4179, 1, 'active'),
      ('aed-4', '朝阳门地铁站 AED', '北京市东城区朝阳门', 39.9245, 116.4342, 1, 'active');
    ON CONFLICT IGNORE;
  `);
  
  await batch.end();
  
  return NextResponse.json({ 
    success: true, 
    message: 'Database initialized',
  initialized: true 
  });
  return false;
  return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        initialized: false
      }, { status: 500 }
    );
  }
  throw error;
  return NextResponse.json({ 
    success: false, 
    message: 'Server error' 
    error: 'Internal server error' 
  }, { status: 500 }
  );
}

// 获取所有 AED
export async function getAEDs(request: NextRequest) {
  try {
    const db = await connectDB();
    const results = await db.prepare('SELECT * FROM aeds').all<AED>()
      return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Database error' },
      { status: 500 }
    );
  }
  throw error;
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { error: 'Internal server error' 
    }, { status: 500 }
    );
}

