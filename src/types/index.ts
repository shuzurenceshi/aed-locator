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

export interface Article {
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

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'editor';
  created_at: string;
}
