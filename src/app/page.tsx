'use client';

import { useState, useEffect } from 'react';
import AEDMap from '@/components/AEDMap';
import { AED, Article } from '@/types';

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
  const [aeds, setAeds] = useState<AED[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'knowledge' | 'ai'>('map');

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

  // 获取 AED 数据
  useEffect(() => {
    fetch('/api/aeds')
      .then(res => res.json())
      .then(data => setAeds(data.data || []))
      .catch(() => {
        // Mock 数据
        setAeds([
          { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: '', updated_at: '' },
          { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: '', updated_at: '' },
          { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: '', updated_at: '' },
        ]);
      });
  }, []);

  // 获取科普文章
  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data.data || []))
      .catch(() => {
        // Mock 文章
        setArticles([
          { id: '1', title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备...', category: 'knowledge', sort_order: 1, published: true, created_at: '', updated_at: '' },
          { id: '2', title: '如何使用 AED', content: '1. 打开电源 2. 贴电极片 3. 分析心律 4. 除颤...', category: 'tutorial', sort_order: 2, published: true, created_at: '', updated_at: '' },
        ]);
      });
  }, []);

  // 计算距离并排序
  const sortedAeds = userLocation 
    ? aeds.map(aed => ({
        ...aed,
        distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng)
      })).sort((a, b) => a.distance - b.distance)
    : aeds;

  // 导航
  const navigateToAed = (aed: AED) => {
    if (!userLocation) return;
    const url = `https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat}&to=${aed.lng},${aed.lat}&mode=walk&coordinate=wgs84`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏥 AED 急救定位
          </h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'map' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'
              }`}
            >
              📍 定位
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'knowledge' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'
              }`}
            >
              📚 科普
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'ai' ? 'bg-white text-red-600' : 'bg-red-500 hover:bg-red-400'
              }`}
            >
              🤖 AI 助手
            </button>
          </nav>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3">
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      )}

      {/* 主内容区 */}
      <main className="flex-1 flex">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* 地图模式 */
          <div className="flex-1 flex">
            {/* 地图 */}
            <div className="flex-1 bg-gray-200 flex items-center justify-center">
              {userLocation && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600">地图区域</p>
                  <p className="text-sm text-gray-500 mt-2">
                    您的位置: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            {/* 侧边栏 AED 列表 */}
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
                          <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{aed.name}</span>
                          {aed.available ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">可用</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">不可用</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-7">{aed.address}</p>
                      </div>
                      {'distance' in aed && (
                        <span className="text-sm font-medium text-red-600">
                          {(aed.distance as number).toFixed(2)} km
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigateToAed(aed)}
                      className="mt-3 ml-7 w-[calc(100%-28px)] bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      🧭 导航
                    </button>
                  </div>
                ))}
              </div>

              {/* 紧急求助 */}
              <div className="p-4 bg-red-50 border-t">
                <p className="text-red-700 font-semibold text-sm mb-2">🚨 紧急情况</p>
                <div className="flex gap-2">
                  <a href="tel:120" className="flex-1 bg-red-600 text-white py-2 rounded text-center font-bold hover:bg-red-700">
                    120 急救
                  </a>
                  <a href="tel:119" className="flex-1 bg-orange-600 text-white py-2 rounded text-center font-bold hover:bg-orange-700">
                    119 消防
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'knowledge' ? (
          /* 科普模式 */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">急救科普</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {articles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      article.category === 'tutorial' ? 'bg-blue-100 text-blue-700' :
                      article.category === 'knowledge' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {article.category === 'tutorial' ? '教程' : article.category === 'knowledge' ? '知识' : '视频'}
                    </span>
                    <h3 className="font-semibold text-lg mt-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">{article.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* AI 助手模式 */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">🤖 AI 急救助手</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="min-h-[300px] mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">
                    👋 您好！我是 AI 急救助手，可以回答您关于 AED 使用、急救知识等问题。
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p>AED 急救定位系统 | 管理后台: <a href="/admin" className="text-red-400 hover:underline">/admin</a></p>
      </footer>
    </div>
  );
}
