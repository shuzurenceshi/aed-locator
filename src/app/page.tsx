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

// 格式化距离
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'knowledge' | 'ai'>('map');
  const [selectedAed, setSelectedAed] = useState<AED | null>(null);
  const [showList, setShowList] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [aiTyping, setAiTyping] = useState(false);

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
        { id: '1', name: '北京站', address: '北京市东城区北京站候车大厅南侧服务台', lat: 39.9029, lng: 116.4272, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '2', name: '王府井百货大楼', address: '北京市东城区王府井大街255号1层顾客服务中心', lat: 39.9139, lng: 116.4103, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '3', name: '北京协和医院', address: '北京市东城区帅府园1号门诊大厅导医台', lat: 39.9134, lng: 116.4179, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '4', name: '朝阳门地铁站', address: '北京市东城区朝阳门地铁站B出口安检处', lat: 39.9245, lng: 116.4342, available: true, status: 'active', created_at: '', updated_at: '' },
        { id: '5', name: '东单体育中心', address: '北京市东城区崇文门东大街6号西门入口', lat: 39.9168, lng: 116.4195, available: false, status: 'maintenance', created_at: '', updated_at: '' },
        { id: '6', name: '建国门地铁站', address: '北京市东城区建国门地铁站C口客服中心', lat: 39.9054, lng: 116.4342, available: true, status: 'active', created_at: '', updated_at: '' },
      ];
      setAeds(defaultAEDs);
    }
    
    const defaultArticles: Article[] = [
      { 
        id: '1', 
        title: 'AED 是什么？', 
        content: `自动体外除颤器（AED）是一种便携式、易于操作的医疗急救设备。

它能够自动分析患者心律，识别心室颤动，并给予电击除颤。被誉为"救命神器"的 AED，即使没有医学背景的普通人也能安全使用。

AED 会通过语音提示指导操作者完成每一步骤。据统计，在心脏骤停发生后的"黄金4分钟"内使用 AED，抢救成功率可达 50% 以上。`, 
        category: 'knowledge', 
        sort_order: 1, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
      { 
        id: '2', 
        title: '四步使用 AED', 
        content: `【第一步】打开电源
按下电源按钮，AED 会自动开始语音提示

【第二步】贴好电极片
按照图示将电极片贴在患者胸部裸露皮肤上：
• 右侧电极片：右锁骨下方
• 左侧电极片：左乳头外侧腋下

【第三步】分析心律
AED 自动分析心律，此期间请勿触碰患者

【第四步】除颤（如需要）
如 AED 建议除颤，确认无人接触患者后按下除颤键
除颤后立即继续心肺复苏`, 
        category: 'tutorial', 
        sort_order: 2, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
      { 
        id: '3', 
        title: '心肺复苏 C-A-B', 
        content: `【C - 胸外按压】
• 位置：两乳头连线中点
• 深度：5-6 厘米
• 频率：100-120 次/分钟
• 要点：每次按压后让胸廓充分回弹

【A - 开放气道】
• 仰头提颏法
• 清除口腔异物
• 检查呼吸

【B - 人工呼吸】
• 捏住鼻子
• 完全包住患者口部
• 吹气 1 秒，见胸廓起伏
• 按压:呼吸 = 30:2`, 
        category: 'tutorial', 
        sort_order: 3, 
        published: true, 
        created_at: '', 
        updated_at: '' 
      },
    ];
    setArticles(defaultArticles);
    
    setAiMessages([
      { 
        role: 'assistant', 
        content: `您好！我是 AI 急救助手 🏥

我可以为您提供：
• AED 使用指导
• 心肺复苏方法
• 突发情况处理建议

请问有什么可以帮助您的？` 
      }
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
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setUserLocation({ lat: 39.9042, lng: 116.4074 });
      setLoading(false);
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
    if (!aiInput.trim() || aiTyping) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');
    setAiTyping(true);
    
    setTimeout(() => {
      let response = '感谢您的提问。我建议您立即拨打 120 急救电话，并在等待期间持续进行心肺复苏。';
      
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('aed') || lowerMsg.includes('除颤') || lowerMsg.includes('使用')) {
        response = `AED 使用非常简单，只需四步：

1️⃣ 打开电源
2️⃣ 按图示贴好电极片
3️⃣ 等待 AED 分析心律（勿触碰患者）
4️⃣ 如建议除颤，确认无人接触患者后按下除颤键

AED 会全程语音指导，请按照提示操作即可。`;
      } else if (lowerMsg.includes('心') || lowerMsg.includes('cpr') || lowerMsg.includes('按压') || lowerMsg.includes('复苏')) {
        response = `心肺复苏（CPR）操作要点：

📍 按压位置：两乳头连线中点
📏 按压深度：5-6 厘米
⏱️ 按压频率：100-120 次/分钟
🔄 按压与呼吸比：30:2

【重要提示】
• 每次按压后让胸廓充分回弹
• 尽量减少中断时间
• 坚持到急救人员到达`;
      } else if (lowerMsg.includes('120') || lowerMsg.includes('急救') || lowerMsg.includes('电话')) {
        response = `拨打 120 时请说清以下信息：

1. 准确地址
   区、街道、门牌号、标志性建筑

2. 患者情况
   年龄、性别、意识状态、呼吸情况

3. 已采取措施
   如：正在心肺复苏、使用 AED

4. 联系方式
   保持电话畅通，听从调度员指导`;
      } else if (lowerMsg.includes('哪里') || lowerMsg.includes('位置') || lowerMsg.includes('附近')) {
        response = `请在首页查看附近的 AED 位置：

1. 点击底部"定位"标签
2. 查看地图上的 AED 标记
3. 点击列表中的 AED 查看详情
4. 点击"导航"按钮前往

建议提前了解附近的 AED 位置，以备不时之需。`;
      }
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setAiTyping(false);
    }, 1000);
  };

  // 生成地图 URL
  const mapUrl = userLocation 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.02}%2C${userLocation.lat - 0.02}%2C${userLocation.lng + 0.02}%2C${userLocation.lat + 0.02}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`
    : '';

  return (
    <div className="h-screen flex flex-col bg-[#f7f8fa]">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#dc2626] to-[#ef4444] text-white flex-shrink-0">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">AED 急救定位</h1>
                <p className="text-[11px] text-white/70 tracking-wider">EMERGENCY LOCATOR</p>
              </div>
            </div>
            <a href="/admin" className="text-white/60 text-xs px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition">
              管理
            </a>
          </div>
        </div>
        
        {/* Tab 导航 */}
        <nav className="flex px-4 pb-4 gap-2">
          {[
            { id: 'map', icon: '📍', label: '定位' },
            { id: 'knowledge', icon: '📖', label: '科普' },
            { id: 'ai', icon: '💬', label: '助手' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 py-3 text-sm rounded-xl transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-white text-[#dc2626] font-semibold shadow-lg scale-[1.02]' 
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 主内容 */}
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-red-50/50 to-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-red-200 border-t-red-500"></div>
              </div>
              <p className="text-gray-700 font-medium text-lg">正在定位</p>
              <p className="text-gray-400 text-sm mt-1">请允许获取您的位置信息</p>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* 地图模式 */
          <div className="h-full flex flex-col">
            {/* 地图 */}
            <div className={`relative ${showList || selectedAed ? 'h-[45%]' : 'flex-1'}`}>
              <iframe src={mapUrl} className="w-full h-full border-0" title="地图" loading="lazy" />
              
              {/* 位置标记 */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">我的位置</span>
              </div>
              
              {/* 切换按钮 */}
              <button
                onClick={() => { setShowList(!showList); setSelectedAed(null); }}
                className="absolute bottom-4 left-4 bg-white text-gray-800 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform border border-gray-100"
              >
                {showList ? (
                  <>
                    <span>🗺️</span>
                    <span>查看地图</span>
                  </>
                ) : (
                  <>
                    <span className="bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold">
                      {sortedAeds.filter(a => a.available).length}
                    </span>
                    <span>附近 AED</span>
                  </>
                )}
              </button>
            </div>

            {/* 底部面板 */}
            {(showList || selectedAed) && (
              <div className="flex-1 bg-white rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative -mt-4 z-10 flex flex-col overflow-hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 flex-shrink-0"></div>
                
                {selectedAed ? (
                  /* AED 详情 */
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-5">
                      <button 
                        onClick={() => setSelectedAed(null)}
                        className="text-sm text-gray-500 mb-4 flex items-center gap-1 hover:text-gray-700 transition"
                      >
                        <span>←</span>
                        <span>返回列表</span>
                      </button>
                      
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 mb-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                            📍
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-800 leading-tight">{selectedAed.name}</h3>
                            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{selectedAed.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">距离</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatDistance((selectedAed as any).distance || 0)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-500 mb-1">状态</p>
                          <p className={`text-base font-bold ${selectedAed.available ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedAed.available ? '✓ 可用' : '× 维修中'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigateToAed(selectedAed)}
                        disabled={!selectedAed.available}
                        className={`w-full py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all ${
                          selectedAed.available 
                            ? 'bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        🧭 开始导航
                      </button>
                    </div>
                  </div>
                ) : (
                  /* AED 列表 */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-5 pt-3 pb-2 flex-shrink-0 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800">附近 AED</h3>
                      <p className="text-xs text-gray-500 mt-0.5">共 {sortedAeds.length} 个 · 按距离排序</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {sortedAeds.map((aed, idx) => (
                        <div 
                          key={aed.id} 
                          className="px-5 py-4 flex items-center gap-4 active:bg-gray-50 transition-colors border-b border-gray-50"
                          onClick={() => setSelectedAed(aed)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            idx === 0 ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md' : 
                            idx === 1 ? 'bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-md' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 truncate">{aed.name}</span>
                              {!aed.available && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">维修</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1">{aed.address}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-red-600 font-bold text-sm">
                              {formatDistance((aed as any).distance || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 紧急电话按钮 */}
            {!showList && !selectedAed && (
              <div className="bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex gap-3">
                  <a href="tel:120" className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl text-center font-bold shadow-lg active:scale-[0.98] transition-transform">
                    <span className="text-xl">🚑</span>
                    <p className="mt-1 text-sm">拨打 120</p>
                  </a>
                  <a href="tel:119" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl text-center font-bold shadow-lg active:scale-[0.98] transition-transform">
                    <span className="text-xl">🚒</span>
                    <p className="mt-1 text-sm">拨打 119</p>
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'knowledge' ? (
          /* 科普模式 */
          <div className="h-full overflow-y-auto bg-[#f7f8fa]">
            {/* Hero 卡片 */}
            <div className="bg-gradient-to-br from-[#dc2626] via-[#ef4444] to-[#f97316] text-white p-6 pb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">❤️</span>
                <span className="text-white/80 text-sm tracking-wider">LEARN TO SAVE LIVES</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">急救科普</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                学习急救知识，关键时刻能救命<br/>
                人人学急救，急救为人人
              </p>
            </div>
            
            <div className="px-4 -mt-6 pb-8 space-y-4">
              {articles.map((article, idx) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide ${
                        article.category === 'tutorial' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {article.category === 'tutorial' ? '📖 实用教程' : '💡 基础知识'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">NO.{idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{article.title}</h3>
                    <div className="text-gray-600 text-sm leading-[1.8] whitespace-pre-line">{article.content}</div>
                  </div>
                </div>
              ))}
              
              {/* 提示卡片 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex gap-3">
                  <div className="text-3xl flex-shrink-0">💡</div>
                  <div>
                    <p className="text-amber-800 font-bold text-sm mb-1">温馨提示</p>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      建议您定期复习急救知识，熟练掌握 AED 使用方法和心肺复苏技能。您的学习，可能挽救一条生命。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AI 助手模式 */
          <div className="h-full flex flex-col bg-[#f7f8fa]">
            {/* AI Header */}
            <div className="bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white p-6 pb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI 急救助手</h2>
                  <p className="text-white/70 text-xs">专业 · 可靠 · 24小时在线</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                有问题随时问我，我会尽力帮助您
              </p>
            </div>
            
            {/* 聊天区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 -mt-6 space-y-3">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {aiTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 快捷问题 */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
              {['如何使用AED', '心肺复苏方法', '拨打120技巧', '附近AED在哪'].map(q => (
                <button
                  key={q}
                  onClick={() => setAiInput(q)}
                  className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 whitespace-nowrap shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>
            
            {/* 输入区域 */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="输入急救问题..."
                  className="flex-1 px-4 py-3.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  disabled={aiTyping}
                />
                <button 
                  onClick={handleAiSend}
                  disabled={!aiInput.trim() || aiTyping}
                  className={`px-6 py-3.5 rounded-xl font-medium transition-all ${
                    aiInput.trim() && !aiTyping
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
