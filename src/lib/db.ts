// 数据库连接（本地开发用 better-sqlite3，生产用 D1）
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

export async function connectDB() {
  if (db) return db;
  
  // 本地开发：使用 SQLite
  if (process.env.NODE_ENV !== 'production') {
    db = new Database('./local.db');
    await initTables(db);
    return db;
  }
  
  // 生产：返回 null，使用 D1 绑定
  return null;
}

// 初始化表
async function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS aeds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      available INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      contact TEXT,
      hours TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      image_url TEXT,
      video_url TEXT,
      sort_order INTEGER DEFAULT 0,
      published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// AED 操作
export async function getAEDs(db: any) {
  const stmt = db.prepare('SELECT * FROM aeds ORDER BY created_at DESC');
  return stmt.all();
}

export async function getAEDById(db: any, id: string) {
  const stmt = db.prepare('SELECT * FROM aeds WHERE id = ?');
  return stmt.get(id);
}

export async function createAED(db: any, data: any) {
  const stmt = db.prepare(`
    INSERT INTO aeds (id, name, address, lat, lng, available, status, contact, hours, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.id || `aed-${Date.now()}`,
    data.name,
    data.address,
    data.lat,
    data.lng,
    data.available ? 1 : 0,
    data.status || 'active',
    data.contact,
    data.hours,
    data.image_url
  );
}

export async function updateAED(db: any, id: string, data: any) {
  const stmt = db.prepare(`
    UPDATE aeds 
    SET name = ?, address = ?, lat = ?, lng = ?, available = ?, status = ?, contact = ?, hours = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(
    data.name,
    data.address,
    data.lat,
    data.lng,
    data.available ? 1 : 0,
    data.status,
    data.contact,
    data.hours,
    data.image_url,
    id
  );
}

export async function deleteAED(db: any, id: string) {
  const stmt = db.prepare('DELETE FROM aeds WHERE id = ?');
  return stmt.run(id);
}

// 文章操作
export async function getArticles(db: any, publishedOnly = false) {
  const sql = publishedOnly 
    ? 'SELECT * FROM articles WHERE published = 1 ORDER BY sort_order ASC, created_at DESC'
    : 'SELECT * FROM articles ORDER BY sort_order ASC, created_at DESC';
  const stmt = db.prepare(sql);
  return stmt.all();
}

export async function getArticleById(db: any, id: string) {
  const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
  return stmt.get(id);
}

export async function createArticle(db: any, data: any) {
  const stmt = db.prepare(`
    INSERT INTO articles (id, title, content, category, image_url, video_url, sort_order, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.id || `article-${Date.now()}`,
    data.title,
    data.content,
    data.category || 'knowledge',
    data.image_url,
    data.video_url,
    data.sort_order || 0,
    data.published ? 1 : 0
  );
}

export async function updateArticle(db: any, id: string, data: any) {
  const stmt = db.prepare(`
    UPDATE articles 
    SET title = ?, content = ?, category = ?, image_url = ?, video_url = ?, sort_order = ?, published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(
    data.title,
    data.content,
    data.category,
    data.image_url,
    data.video_url,
    data.sort_order,
    data.published ? 1 : 0,
    id
  );
}

export async function deleteArticle(db: any, id: string) {
  const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
  return stmt.run(id);
}

// 管理员操作
export async function getAdminByUsername(db: any, username: string) {
  const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
  return stmt.get(username);
}

export async function createAdmin(db: any, data: { id: string; username: string; password_hash: string; role?: string }) {
  const stmt = db.prepare(`
    INSERT INTO admins (id, username, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(data.id, data.username, data.password_hash, data.role || 'admin');
}
