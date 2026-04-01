'use client';

import { useState, useEffect, useMemo } from 'react';

// 类型定义
interface AED {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  distance?: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// 计算距离
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'knowledge' | 'ai'>('map');

  // Mock AED 数据（从 localStorage 读取或使用默认值）
  const [aeds, setAeds] = useState<AED[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [mounted, setMounted] = useState(false);

  // 初始化数据
  useEffect(() => {
    setMounted(true);
    
    // 从 localStorage 读取 AED 数据
    const savedAEDs = localStorage.getItem('aed_data');
    if (savedAEDs) {
      setAeds(JSON.parse(savedAEDs));
    } else {
      // 默认数据
      const defaultAEDs: AED[] = [
        { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '4', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, status: 'active', created_at: '', updated_at: '' },
      ];
      setAeds(defaultAEDs);
      localStorage.setItem('aed_data', JSON.stringify(defaultAEDs));
    }
    
    // 文章数据
    const defaultArticles: Article[] = [
      { id: '1', title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备，可以自动分析心律并给予电击除颤，用于抢救心源性猝死患者。它是抢救心源性猝死最有效的急救设备。', category: 'knowledge', sort_order: 1, published: true, created_at: '', updated_at: '' },
      { id: '2', title: '如何使用 AED', content: '1. 打开电源\n2. 按图示贴好电极片\n3. 等待分析心律\n4. 如建议除颤，确保无人接触患者后按下除颤键\n5. 继续心肺复苏直到急救人员到达', category: 'tutorial', sort_order: 2, published: true, created_at: '', updated_at: '' },
      { id: '3', title: '心肺复苏步骤', content: '1. 确认现场安全\n2. 判断意识和呼吸\n3. 呼叫急救（120）\n4. 开始胸外按压：深度5-6cm，频率100-120次/分\n5. 开放气道，人工呼吸：2次\n6. 重复30:2循环', category: 'tutorial', sort_order: 3, published: true, created_at: '', updated_at: '' },
    ];
    setArticles(defaultArticles);
  }, []);

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoading(false);
        },
        () => {
          setUserLocation({ lat: 39.9042, lng: 116.4074 }); // 默认北京
          setLoading(false);
          setError('无法获取位置，已使用默认位置');
        }
      );
    } else {
      setUserLocation({ lat: 39.9042, lng: 116.4074 });
      setLoading(false);
      setError('浏览器不支持定位');
    }
  }, []);

  // 计算距离并排序
  const sortedAeds = useMemo(() => {
    if (!userLocation || !mounted) return aeds;
    return aeds.map(aed => ({
      ...aed,
      distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, aeds, mounted]);

  // 导航
  const navigateToAed = (aed: AED) => {
    if (!userLocation) return;
    const url = `https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat}&to=${aed.lng},${aed.lat}&mode=walk&coordinate=wgs84`;
    window.open(url, '_blank');
  };

  // 生成地图 URL
  const mapUrl = userLocation 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.03}%2C${userLocation.lat - 0.03}%2C${userLocation.lng + 0.03}%2C${userLocation.lat + 0.03}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`
    : '';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">🏥 AED 急救定位</h1>
          <nav className="flex gap-2">
            <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'map' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'}`}>📍 定位</button>
            <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'knowledge' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'}`}>📚 科普</button>
            <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'ai' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'}`}>🤖 AI 助手</button>
          </nav>
        </div>
      </header>

      {/* 错误提示 */}
      {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3"><p className="text-yellow-700 text-sm">{error}</p></div>}

      {/* 主内容 */}
      <main className="flex-1 flex">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          <div className="flex-1 flex">
            {/* 地图 */}
            <div className="flex-1 relative">
              <iframe src={mapUrl} className="w-full h-full border-0" title="地图" loading="lazy" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-700">您的位置</span>
                </div>
              </div>
            </div>
            
            {/* AED 列表 */}
            <div className="w-80 bg-white shadow-lg overflow-y-auto">
              <div className="p-4 bg-gray-50 border-b sticky top-0">
                <h2 className="font-bold text-lg">附近 AED</h2>
                <p className="text-sm text-gray-500">共 {sortedAeds.length} 个</p>
              </div>
              <div className="divide-y">
                {sortedAeds.map((aed, idx) => (
                  <div key={aed.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <span className="font-semibold">{aed.name}</span>
                          {aed.available && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">可用</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-7">{aed.address}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">{(aed as any).distance?.toFixed(2)} km</span>
                    </div>
                    <button onClick={() => navigateToAed(aed)} className="mt-3 ml-7 w-[calc(100%-28px)] bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">🧭 导航</button>
                  </div>
                ))}
              </div>
              
              {/* 紧急求助 */}
              <div className="p-4 bg-red-50 border-t">
                <p className="text-red-700 font-semibold text-sm mb-2">🚨 紧急情况</p>
                <div className="flex gap-2">
                  <a href="tel:120" className="flex-1 bg-red-600 text-white py-2 rounded text-center font-bold hover:bg-red-700">120 急救</a>
                  <a href="tel:119" className="flex-1 bg-orange-600 text-white py-2 rounded text-center font-bold hover:bg-orange-700">119 消防</a>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'knowledge' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">急救科普</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {articles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
                    <span className={`text-xs px-2 py-1 rounded-full ${article.category === 'tutorial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {article.category === 'tutorial' ? '教程' : '知识'}
                    </span>
                    <h3 className="font-semibold text-lg mt-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">{article.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">🤖 AI 急救助手</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="min-h-[300px] mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600 text-center">👋 您好！我是 AI 急救助手。<br />可以回答您关于 AED 使用、急救知识等问题。<br /><br /><span className="text-sm text-gray-400">（功能开发中，敬请期待）</span></p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="输入您的问题..." className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" disabled />
                  <button className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">发送</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p>AED 急救定位系统 v2.0 | 保卫生命，从 "心" 开始 | <a href="/admin" className="text-red-400 hover:underline">管理后台</a></p>
      </footer>
    </div>
  );
}
