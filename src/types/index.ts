// 数据库 schema
export interface AED {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: boolean;
  status: 'active' | 'maintenance' | 'expired';
  contact?: string;
  hours?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// API 娡块
export interface AEDApi {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: boolean;
  status: string;
  distance?: number;
  contact?: string;
  hours?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// 文章接口
export interface ArticleApi {
  id: string;
  title: string;
  content: string;
  category: 'tutorial' | 'knowledge' | 'video';
  image_url?: string;
  video_url?: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// 管理员接口
export interface AdminApi {
  id: string;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'editor';
  created_at: string;
}
