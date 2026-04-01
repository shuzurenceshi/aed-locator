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
  const [selectedAed, setSelectedAed] = useState<AED | null>(null);
  const [showList, setShowList] = useState(false);

  const [aeds, setAeds] = useState<AED[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [mounted, setMounted] = useState(false);

  // 初始化数据
  useEffect(() => {
    setMounted(true);
    
    const savedAEDs = typeof window !== 'undefined' ? localStorage.getItem('aed_data') : null;
    if (savedAEDs) {
      setAeds(JSON.parse(savedAEDs));
    } else {
      const defaultAEDs: AED[] = [
        { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '4', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, status: 'active', created_at: '', updated_at: '' },
      ];
      setAeds(defaultAEDs);
    }
    
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
          setUserLocation({ lat: 39.9042, lng: 116.4074 });
          setLoading(false);
          setError('无法获取位置');
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header - 固定在顶部 */}
      <header className="bg-red-600 text-white flex-shrink-0 shadow-lg z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold flex items-center gap-2">
              🏥 AED 急救定位
            </h1>
            <a href="/admin" className="text-white/80 text-sm">管理</a>
          </div>
        </div>
        
        {/* Tab 导航 */}
        <nav className="flex px-2 pb-2 gap-1">
          <button 
            onClick={() => setActiveTab('map')} 
            className={`flex-1 py-2 text-sm rounded-lg transition ${
              activeTab === 'map' ? 'bg-white text-red-600 font-medium' : 'bg-red-500 text-white/90'
            }`}
          >
            📍 定位
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')} 
            className={`flex-1 py-2 text-sm rounded-lg transition ${
              activeTab === 'knowledge' ? 'bg-white text-red-600 font-medium' : 'bg-red-500 text-white/90'
            }`}
          >
            📚 科普
          </button>
          <button 
            onClick={() => setActiveTab('ai')} 
            className={`flex-1 py-2 text-sm rounded-lg transition ${
              activeTab === 'ai' ? 'bg-white text-red-600 font-medium' : 'bg-red-500 text-white/90'
            }`}
          >
            🤖 AI
          </button>
        </nav>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="bg-yellow-100 px-3 py-2 text-sm text-yellow-700">
          ⚠️ {error}
        </div>
      )}

      {/* 主内容 - 填满剩余空间 */}
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">定位中...</p>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* 地图模式 - 移动端优化 */
          <div className="h-full flex flex-col">
            {/* 地图区域 */}
            <div className="flex-1 relative bg-gray-200">
              <iframe src={mapUrl} className="w-full h-full border-0" title="地图" loading="lazy" />
              
              {/* 位置标记 */}
              <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-full shadow-md text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-gray-700">我的位置</span>
              </div>
              
              {/* 切换列表按钮 */}
              <button
                onClick={() => setShowList(!showList)}
                className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
              >
                {showList ? '🗺️ 地图' : `📋 ${sortedAeds.length} 个 AED`}
              </button>
            </div>

            {/* 底部 AED 列表/详情 */}
            {showList || selectedAed ? (
              <div className="bg-white shadow-inner max-h-[50vh] overflow-y-auto">
                {selectedAed ? (
                  /* AED 详情 */
                  <div className="p-4">
                    <button 
                      onClick={() => setSelectedAed(null)}
                      className="text-sm text-gray-500 mb-3"
                    >
                      ← 返回列表
                    </button>
                    <h3 className="text-lg font-bold mb-2">{selectedAed.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{selectedAed.address}</p>
                    <p className="text-red-600 font-medium mb-4">
                      距离：{'distance' in selectedAed ? (selectedAed.distance as number).toFixed(2) : '--'} km
                    </p>
                    <button
                      onClick={() => navigateToAed(selectedAed)}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-medium text-base"
                    >
                      🧭 导航前往
                    </button>
                  </div>
                ) : (
                  /* AED 列表 */
                  <div className="divide-y">
                    {sortedAeds.slice(0, 5).map((aed, idx) => (
                      <div 
                        key={aed.id} 
                        className="p-3 flex items-center gap-3 active:bg-gray-50"
                        onClick={() => setSelectedAed(aed)}
                      >
                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{aed.name}</span>
                            {aed.available && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">可用</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{aed.address}</p>
                        </div>
                        <span className="text-sm font-medium text-red-600 flex-shrink-0">
                          {(aed as any).distance?.toFixed(2)}km
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* 底部紧急求助栏 */
              <div className="bg-white p-3 shadow-inner">
                <div className="flex gap-2">
                  <a href="tel:120" className="flex-1 bg-red-600 text-white py-3 rounded-lg text-center font-bold text-base">
                    📞 120 急救
                  </a>
                  <a href="tel:119" className="flex-1 bg-orange-600 text-white py-3 rounded-lg text-center font-bold text-base">
                    📞 119 消防
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'knowledge' ? (
          /* 科普模式 - 移动端优化 */
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-xl font-bold mb-4">急救科普</h2>
            <div className="space-y-3">
              {articles.map(article => (
                <div key={article.id} className="bg-white rounded-lg shadow p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    article.category === 'tutorial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {article.category === 'tutorial' ? '教程' : '知识'}
                  </span>
                  <h3 className="font-semibold mt-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 whitespace-pre-line leading-relaxed">{article.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* AI 助手模式 - 移动端优化 */
          <div className="h-full flex flex-col p-4">
            <h2 className="text-xl font-bold mb-4">🤖 AI 急救助手</h2>
            <div className="flex-1 bg-white rounded-lg shadow p-4 mb-4 overflow-y-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-600 text-sm">
                    您好！我是 AI 急救助手
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    可以回答急救相关问题
                  </p>
                  <p className="text-gray-400 text-xs mt-4">
                    （功能开发中）
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入问题..."
                className="flex-1 px-4 py-3 border rounded-lg text-base"
                disabled
              />
              <button 
                className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg"
                disabled
              >
                发送
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
