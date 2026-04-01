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
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);

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
        { id: '1', name: '北京站 AED', address: '北京市东城区北京站候车大厅', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号1F服务台', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '3', name: '北京协和医院 AED', address: '北京市东城区帅府园1号门诊大厅', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '4', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门地铁站B口', lat: 39.9245, lng: 116.4342, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '5', name: '东单体育中心 AED', address: '北京市东城区崇文门东大街', lat: 39.9168, lng: 116.4195, available: false, status: 'maintenance', created_at: '', updated_at: '' },
      ];
      setAeds(defaultAEDs);
    }
    
    const defaultArticles: Article[] = [
      { 
        id: '1', 
        title: 'AED 是什么？', 
        content: '自动体外除颤器（Automated External Defibrillator，简称AED）是一种便携式医疗设备。\n\n它可以自动分析心律，识别心室颤动，并给予电击除颤，被誉为"救命神器"。', 
        category: 'knowledge', 
        sort_order: 1, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
      { 
        id: '2', 
        title: 'AED 使用四步法', 
        content: '第一步：打开电源\n按下电源按钮，AED 会发出语音提示\n\n第二步：贴电极片\n按图示位置贴好电极片（右上胸、左下侧）\n\n第三步：分析心律\nAED 自动分析，期间勿触碰患者\n\n第四步：除颤（如需要）\n确认无人接触患者，按下除颤键', 
        category: 'tutorial', 
        sort_order: 2, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
      { 
        id: '3', 
        title: '心肺复苏 C-A-B', 
        content: 'C - 胸外按压\n• 位置：两乳头连线中点\n• 深度：5-6厘米\n• 频率：100-120次/分钟\n• 比例：30次按压\n\nA - 开放气道\n仰头提颏法\n\nB - 人工呼吸\n• 捏鼻、包口、吹气\n• 每次1秒，见胸廓起伏\n• 比例：2次呼吸\n\n循环 30:2 直到 AED 到达', 
        category: 'tutorial', 
        sort_order: 3, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
    ];
    setArticles(defaultArticles);
    
    // AI 欢迎消息
    setAiMessages([
      { role: 'assistant', content: '您好！我是 AI 急救助手 💊\n\n我可以帮您解答：\n• AED 使用方法\n• 心肺复苏步骤\n• 突发情况处理\n\n请问有什么可以帮助您的？' }
    ]);
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
          setError('定位失败，已显示默认位置');
        },
        { timeout: 10000 }
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

  // AI 发送消息
  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');
    
    // 模拟 AI 回复
    setTimeout(() => {
      let response = '感谢您的提问！';
      
      if (userMessage.includes('AED') || userMessage.includes('除颤')) {
        response = 'AED 使用非常简单：\n\n1️⃣ 打开电源\n2️⃣ 按图示贴电极片\n3️⃣ 等待分析\n4️⃣ 按提示除颤\n\n记住：AED 会语音指导您每一步，不用害怕！';
      } else if (userMessage.includes('心') || userMessage.includes('CPR') || userMessage.includes('按压')) {
        response = '心肺复苏要点：\n\n📍 按压位置：两乳头连线中点\n📏 按压深度：5-6厘米\n⏱️ 按压频率：100-120次/分\n🔄 按压:呼吸 = 30:2\n\n坚持按压直到急救人员到达！';
      } else if (userMessage.includes('120') || userMessage.includes('急救')) {
        response = '拨打 120 时请说清：\n\n1. 准确地址（区、街道、门牌号）\n2. 患者情况（意识、呼吸）\n3. 已采取的措施\n4. 保持电话畅通\n\n🚑 急救人员到达前持续心肺复苏';
      }
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  // 生成地图 URL
  const mapUrl = userLocation 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.025}%2C${userLocation.lat - 0.025}%2C${userLocation.lng + 0.025}%2C${userLocation.lat + 0.025}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`
    : '';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-500 to-red-600 text-white flex-shrink-0 shadow-lg">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                🏥
              </div>
              <div>
                <h1 className="text-lg font-bold">AED 急救定位</h1>
                <p className="text-xs text-white/80">守护生命 · 从心开始</p>
              </div>
            </div>
            <a href="/admin" className="text-white/70 text-xs px-3 py-1.5 bg-white/10 rounded-full">
              管理
            </a>
          </div>
        </div>
        
        {/* Tab 导航 */}
        <nav className="flex px-3 pb-3 gap-2">
          {[
            { id: 'map', icon: '📍', label: '定位' },
            { id: 'knowledge', icon: '📚', label: '科普' },
            { id: 'ai', icon: '🤖', label: '助手' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-red-600 font-semibold shadow-md' 
                  : 'bg-white/10 text-white/90'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-red-200 border-t-red-600"></div>
              </div>
              <p className="text-gray-600 font-medium">正在定位...</p>
              <p className="text-gray-400 text-xs mt-1">请允许获取您的位置</p>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* 地图模式 */
          <div className="h-full flex flex-col">
            {/* 地图 */}
            <div className="flex-1 relative bg-gray-200">
              <iframe src={mapUrl} className="w-full h-full border-0" title="地图" loading="lazy" />
              
              {/* 位置标记 */}
              <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">我的位置</span>
              </div>
              
              {/* 切换按钮 */}
              <button
                onClick={() => { setShowList(!showList); setSelectedAed(null); }}
                className="absolute bottom-4 left-4 bg-white text-red-600 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform"
              >
                {showList ? '🗺️ 查看地图' : (
                  <>
                    <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {sortedAeds.filter(a => a.available).length}
                    </span>
                    附近 AED
                  </>
                )}
              </button>
            </div>

            {/* 底部面板 */}
            {showList || selectedAed ? (
              <div className="bg-white rounded-t-3xl shadow-2xl -mt-6 relative z-10 max-h-[55vh] overflow-hidden flex flex-col">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 flex-shrink-0"></div>
                
                {selectedAed ? (
                  /* AED 详情 */
                  <div className="p-5 overflow-y-auto">
                    <button 
                      onClick={() => setSelectedAed(null)}
                      className="text-sm text-gray-500 mb-4 flex items-center gap-1"
                    >
                      ← 返回列表
                    </button>
                    
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        📍
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{selectedAed.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{selectedAed.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">距离</p>
                        <p className="text-xl font-bold text-red-600">
                          {'distance' in selectedAed ? (selectedAed.distance as number).toFixed(2) : '--'} 
                          <span className="text-sm font-normal ml-1">km</span>
                        </p>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">状态</p>
                        <p className={`text-sm font-bold ${selectedAed.available ? 'text-green-600' : 'text-gray-400'}`}>
                          {selectedAed.available ? '✅ 可用' : '🔧 维修中'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigateToAed(selectedAed)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-98 transition-transform"
                    >
                      🧭 开始导航
                    </button>
                  </div>
                ) : (
                  /* AED 列表 */
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-5 pt-2 pb-3">
                      <h3 className="font-bold text-gray-800">附近 {sortedAeds.length} 个 AED</h3>
                      <p className="text-xs text-gray-500">按距离排序</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {sortedAeds.map((aed, idx) => (
                        <div 
                          key={aed.id} 
                          className="px-5 py-4 flex items-center gap-3 active:bg-gray-50 transition-colors"
                          onClick={() => setSelectedAed(aed)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                            idx === 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 truncate">{aed.name}</span>
                              {aed.available ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">可用</span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">维修</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{aed.address}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-red-600 font-bold">
                              {(aed as any).distance?.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">公里</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 底部紧急求助 */
              <div className="bg-white p-4 shadow-inner">
                <div className="flex gap-3">
                  <a href="tel:120" className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl text-center font-bold shadow-md active:scale-98 transition-transform">
                    <span className="text-lg">🚑</span>
                    <p className="mt-1">120 急救</p>
                  </a>
                  <a href="tel:119" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl text-center font-bold shadow-md active:scale-98 transition-transform">
                    <span className="text-lg">🚒</span>
                    <p className="mt-1">119 消防</p>
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'knowledge' ? (
          /* 科普模式 */
          <div className="h-full overflow-y-auto bg-gray-50">
            {/* 顶部卡片 */}
            <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-6 pb-8">
              <h2 className="text-2xl font-bold mb-2">急救科普</h2>
              <p className="text-white/80 text-sm">学习急救知识，关键时刻能救命</p>
            </div>
            
            <div className="px-4 -mt-4 pb-6 space-y-4">
              {articles.map((article, idx) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.category === 'tutorial' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {article.category === 'tutorial' ? '📖 教程' : '💡 知识'}
                      </span>
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{article.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{article.content}</p>
                  </div>
                </div>
              ))}
              
              {/* 提示卡片 */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-amber-800 font-medium text-sm">小贴士</p>
                    <p className="text-amber-700 text-xs mt-1">学习急救知识，关键时刻可以挽救生命。建议定期复习这些技能。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AI 助手模式 */
          <div className="h-full flex flex-col bg-gray-50">
            {/* AI Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI 急救助手</h2>
                  <p className="text-white/80 text-xs">24小时在线 · 专业急救指导</p>
                </div>
              </div>
            </div>
            
            {/* 聊天区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 -mt-4 space-y-3">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 快捷问题 */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {['如何使用AED?', '心肺复苏步骤', '拨打120技巧'].map(q => (
                <button
                  key={q}
                  onClick={() => { setAiInput(q); }}
                  className="px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 whitespace-nowrap shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
            
            {/* 输入区域 */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="输入急救问题..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleAiSend}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 定位错误提示 */}
      {error && activeTab === 'map' && (
        <div className="fixed top-20 left-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-xl shadow-lg text-sm z-50">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-amber-600">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
