'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, List, Button, Tag, Tabs, SearchBar, Avatar, DotLoading, Empty } from 'antd-mobile';
import { EnvironmentOutline, PhoneFill, HeartOutline, TeamOutline } from 'antd-mobile-icons';

// 类型
interface AED {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: boolean;
  status: string;
  distance?: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

// 计算距离
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<'map' | 'knowledge' | 'ai'>('map');
  const [selectedAed, setSelectedAed] = useState<AED | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([]);
  
  const [aeds, setAeds] = useState<AED[]>([]);
  const mounted = useState(false);

  // 初始化
  useEffect(() => {
    const saved = localStorage.getItem('aed_data');
    if (saved) {
      setAeds(JSON.parse(saved));
    } else {
      setAeds([
        { id: '1', name: '北京站', address: '北京市东城区北京站候车大厅', lat: 39.9029, lng: 116.4272, available: true, status: 'active' },
        { id: '2', name: '王府井百货', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active' },
        { id: '3', name: '协和医院', address: '北京市东城区帅府园1号', lat: 39.9134, lng: 116.4179, available: true, status: 'active' },
        { id: '4', name: '朝阳门地铁站', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, status: 'active' },
      ]);
    }
    
    setAiMessages([{ role: 'assistant', content: '您好！我是 AI 急救助手，请问有什么可以帮助您？' }]);
  }, []);

  // 定位
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); },
        () => { setUserLocation({ lat: 39.9042, lng: 116.4074 }); setLoading(false); }
      );
    } else {
      setUserLocation({ lat: 39.9042, lng: 116.4074 });
      setLoading(false);
    }
  }, []);

  // 排序
  const sortedAeds = useMemo(() => {
    if (!userLocation) return aeds;
    return aeds.map(a => ({ ...a, distance: calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, aeds]);

  // 导航
  const navigate = (aed: AED) => {
    if (!userLocation) return;
    window.open(`https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat}&to=${aed.lng},${aed.lat}&mode=walk&coordinate=wgs84`);
  };

  // AI 发送
  const sendAi = () => {
    if (!aiInput.trim()) return;
    setAiMessages(p => [...p, { role: 'user', content: aiInput }]);
    setAiInput('');
    setTimeout(() => {
      const msg = aiInput.toLowerCase();
      let reply = '建议您立即拨打 120 急救电话。';
      if (msg.includes('aed')) reply = 'AED 使用：1.开电源 2.贴电极片 3.等分析 4.按除颤';
      else if (msg.includes('心')) reply = '心肺复苏：按压深度5-6cm，频率100-120次/分，比例30:2';
      setAiMessages(p => [...p, { role: 'assistant', content: reply }]);
    }, 800);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <DotLoading color='#1677ff' />
          <p style={{ marginTop: 12, color: '#999' }}>定位中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 顶部栏 */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '16px 16px 8px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ 
            width: 44, height: 44, background: 'rgba(255,255,255,0.2)', 
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24
          }}>🏥</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>AED 急救定位</h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>快速找到最近的 AED</p>
          </div>
        </div>
        
        {/* Tab */}
        <Tabs
          activeKey={activeKey}
          onChange={k => setActiveKey(k as any)}
          style={{ '--title-font-size': '14px', '--active-title-color': '#fff', '--active-line-color': '#fff' }}
        >
          <Tabs.Tab key='map' title='📍 定位' />
          <Tabs.Tab key='knowledge' title='📖 科普' />
          <Tabs.Tab key='ai' title='🤖 助手' />
        </Tabs>
      </header>

      {/* 内容区 */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeKey === 'map' ? (
          <div style={{ padding: 12 }}>
            {/* 地图卡片 */}
            <Card style={{ marginBottom: 12, borderRadius: 8 }}>
              <div style={{ 
                height: 200, background: '#e8e8e8', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#999'
              }}>
                {userLocation ? (
                  <div style={{ textAlign: 'center' }}>
                    <EnvironmentOutline style={{ fontSize: 32, color: '#1677ff' }} />
                    <p style={{ margin: '8px 0 0', fontSize: 14 }}>您的位置</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                  </div>
                ) : '定位中...'}
              </div>
            </Card>

            {/* 紧急按钮 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Button 
                color='danger' 
                block 
                style={{ borderRadius: 8 }}
                onClick={() => { window.location.href = 'tel:120'; }}
              >
                <PhoneFill /> 拨打 120
              </Button>
              <Button 
                color='warning' 
                block 
                style={{ borderRadius: 8 }}
                onClick={() => { window.location.href = 'tel:119'; }}
              >
                <PhoneFill /> 拨打 119
              </Button>
            </div>

            {/* AED 列表 */}
            <Card title={`附近 AED (${sortedAeds.length})`} style={{ borderRadius: 8 }}>
              <List>
                {sortedAeds.map((aed, idx) => (
                  <List.Item
                    key={aed.id}
                    prefix={
                      <div style={{ 
                        width: 36, height: 36, borderRadius: '50%',
                        background: idx === 0 ? '#1677ff' : '#f0f0f0',
                        color: idx === 0 ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: 14
                      }}>{idx + 1}</div>
                    }
                    description={aed.address}
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#1677ff', fontWeight: 500 }}>
                          {formatDistance(aed.distance || 0)}
                        </div>
                        <Tag color={aed.available ? 'success' : 'default'} style={{ marginTop: 4 }}>
                          {aed.available ? '可用' : '维修'}
                        </Tag>
                      </div>
                    }
                    onClick={() => navigate(aed)}
                    arrow
                  >
                    {aed.name}
                  </List.Item>
                ))}
              </List>
            </Card>
          </div>
        ) : activeKey === 'knowledge' ? (
          <div style={{ padding: 12 }}>
            {[
              { title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备，可以自动分析心律并给予电击除颤，被誉为"救命神器"。', tag: '知识' },
              { title: '如何使用 AED', content: '1. 打开电源\n2. 贴电极片\n3. 等待分析\n4. 按除颤键', tag: '教程' },
              { title: '心肺复苏步骤', content: 'C-按压：5-6cm深，100-120次/分\nA-开放气道\nB-人工呼吸：2次', tag: '教程' },
            ].map((item, idx) => (
              <Card key={idx} style={{ marginBottom: 12, borderRadius: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={item.tag === '教程' ? 'primary' : 'success'}>{item.tag}</Tag>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: '#666', whiteSpace: 'pre-line' }}>{item.content}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 聊天区 */}
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? '#1677ff' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 快捷问题 */}
            <div style={{ padding: '8px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
              {['如何使用AED', '心肺复苏', '拨打120'].map(q => (
                <Button 
                  key={q} 
                  size='small' 
                  fill='outline'
                  onClick={() => setAiInput(q)}
                >{q}</Button>
              ))}
            </div>
            
            {/* 输入区 */}
            <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              <SearchBar
                placeholder='输入急救问题...'
                value={aiInput}
                onChange={setAiInput}
                onSearch={sendAi}
                style={{ '--background': '#f5f5f5' }}
              />
            </div>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer style={{ 
        padding: '8px 16px', 
        background: '#fff', 
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center',
        fontSize: 12,
        color: '#999'
      }}>
        AED 急救定位 · 守护生命
      </footer>
    </div>
  );
}
