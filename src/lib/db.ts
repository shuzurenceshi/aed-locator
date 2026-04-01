// 数据库连接
// 生产：Cloudflare D1（通过 env.DB）
// 本地：使用内存数据

import { AED, Article, Admin } from '@/types';

// 本地开发用的内存数据
const mockAEDs: AED[] = [
  { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockArticles: Article[] = [
  { id: '1', title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备，可以自动分析心律并给予电击除颤，用于抢救心源性猝死患者。', category: 'knowledge', sort_order: 1, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', title: '如何使用 AED', content: '1. 打开电源\n2. 按图示贴好电极片\n3. 等待分析心律\n4. 如建议除颤，确保无人接触患者后按下除颤键', category: 'tutorial', sort_order: 2, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', title: '心肺复苏（CPR）步骤', content: '1. 确认现场安全\n2. 判断意识和呼吸\n3. 呼叫急救（120）\n4. 开始胸外按压：30次\n5. 开放气道，人工呼吸：2次\n6. 重复30:2循环', category: 'tutorial', sort_order: 3, published: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockAdmins: Admin[] = [
  { id: 'admin-1', username: 'admin', password_hash: '$2a$10$dummy', role: 'superadmin', created_at: new Date().toISOString() },
];

// 判断是否生产环境
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// AED 操作
export async function getAEDs(env?: any): Promise<AED[]> {
  if (isProduction() && env?.DB) {
    const result = await env.DB.prepare('SELECT * FROM aeds').all();
    return result.results;
  }
  return mockAEDs;
}

export async function createAED(env: any, data: Partial<AED>): Promise<void> {
  if (isProduction() && env?.DB) {
    await env.DB.prepare(`
      INSERT INTO aeds (id, name, address, lat, lng, available, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(data.id || `aed-${Date.now()}`, data.name, data.address, data.lat, data.lng, data.available ? 1 : 0, data.status || 'active').run();
  } else {
    mockAEDs.push({
      id: data.id || `aed-${Date.now()}`,
      name: data.name || '',
      address: data.address || '',
      lat: data.lat || 0,
      lng: data.lng || 0,
      available: data.available ?? true,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

// 文章操作
export async function getArticles(env?: any, publishedOnly = false): Promise<Article[]> {
  if (isProduction() && env?.DB) {
    const sql = publishedOnly 
      ? 'SELECT * FROM articles WHERE published = 1 ORDER BY sort_order ASC'
      : 'SELECT * FROM articles ORDER BY sort_order ASC';
    const result = await env.DB.prepare(sql).all();
    return result.results;
  }
  return publishedOnly ? mockArticles.filter(a => a.published) : mockArticles;
}

export async function createArticle(env: any, data: Partial<Article>): Promise<void> {
  if (isProduction() && env?.DB) {
    await env.DB.prepare(`
      INSERT INTO articles (id, title, content, category, sort_order, published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(data.id || `article-${Date.now()}`, data.title, data.content, data.category || 'knowledge', data.sort_order || 0, data.published ? 1 : 0).run();
  } else {
    mockArticles.push({
      id: data.id || `article-${Date.now()}`,
      title: data.title || '',
      content: data.content || '',
      category: data.category || 'knowledge',
      sort_order: data.sort_order || 0,
      published: data.published ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

// 管理员操作
export async function getAdminByUsername(env: any, username: string): Promise<Admin | null> {
  if (isProduction() && env?.DB) {
    return await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
  }
  return mockAdmins.find(a => a.username === username) || null;
}
