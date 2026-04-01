'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, List, Tag, DotLoading } from 'antd-mobile';
import { EnvironmentOutline } from 'antd-mobile-icons';

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
  const [activeTab, setActiveTab] = useState<'map' | 'knowledge' | 'ai'>('map');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([]);
  const [aeds, setAeds] = useState<AED[]>([]);

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
    setAiMessages([{ role: 'assistant', content: '您好！可以问我：\n• AED 怎么用\n• 心肺复苏方法\n• 如何拨打120' }]);
  }, []);

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

  const sortedAeds = useMemo(() => {
    if (!userLocation) return aeds;
    return aeds.map(a => ({ ...a, distance: calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, aeds]);

  const navigate = (aed: AED) => {
    if (!userLocation) return;
    window.open(`https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat}&to=${aed.lng},${aed.lat}&mode=walk&coordinate=wgs84`);
  };

  const sendAi = () => {
    if (!aiInput.trim()) return;
    setAiMessages(p => [...p, { role: 'user', content: aiInput }]);
    const input = aiInput;
    setAiInput('');
    setTimeout(() => {
      let reply = '建议立即拨打 120';
      if (input.includes('AED') || input.includes('除颤')) reply = 'AED 使用：开电源 → 贴电极 → 等分析 → 按除颤';
      else if (input.includes('心') || input.includes('复苏')) reply = '心肺复苏：按压5-6cm深，100-120次/分';
      setAiMessages(p => [...p, { role: 'assistant', content: reply }]);
    }, 800);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <DotLoading color='#1677ff' style={{ transform: 'scale(1.5)' }} />
          <p style={{ marginTop: 16, color: '#999', fontSize: 14 }}>定位中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 轻量头部 */}
      <header style={{ 
        background: '#fff', 
        padding: '10px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>AED 急救定位</span>
        </div>
        <a href="/admin" style={{ fontSize: 13, color: '#999' }}>管理</a>
      </header>

      {/* 内容区 */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'map' ? (
          <div>
            {/* 位置提示 */}
            {userLocation && (
              <div style={{ 
                padding: '8px 16px', 
                background: '#e6f7ff', 
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#1890ff'
              }}>
                <EnvironmentOutline fontSize={14} />
                <span>已定位您的位置</span>
              </div>
            )}

            {/* AED 列表 */}
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                附近 {sortedAeds.length} 个 AED
              </div>
              <List style={{ '--border-inner': 'none' }}>
                {sortedAeds.map((aed, idx) => (
                  <List.Item
                    key={aed.id}
                    prefix={
                      <div style={{ 
                        width: 28, height: 28, 
                        borderRadius: '50%',
                        background: idx === 0 ? '#ff4d4f' : idx === 1 ? '#ff7a45' : '#f0f0f0',
                        color: idx < 2 ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 12
                      }}>{idx + 1}</div>
                    }
                    description={aed.address}
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#1890ff', fontWeight: 500, fontSize: 13 }}>
                          {formatDistance(aed.distance || 0)}
                        </div>
                        <Tag color={aed.available ? 'success' : 'default'} style={{ marginTop: 2, fontSize: 10 }}>
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
            </div>
          </div>
        ) : activeTab === 'knowledge' ? (
          <div style={{ padding: 12 }}>
            {[
              { title: 'AED 是什么？', content: '自动体外除颤器，可以自动分析心律并给予电击除颤，被誉为"救命神器"。', tag: '知识' },
              { title: '如何使用 AED', content: '1. 打开电源\n2. 贴电极片\n3. 等待分析\n4. 按除颤键', tag: '教程' },
              { title: '心肺复苏步骤', content: 'C-按压：5-6cm深\nA-开放气道\nB-人工呼吸：2次', tag: '教程' },
            ].map((item, idx) => (
              <Card key={idx} style={{ marginBottom: 10, borderRadius: 8 }}>
                <Tag color={item.tag === '教程' ? 'primary' : 'success'} style={{ marginBottom: 8, fontSize: 10 }}>{item.tag}</Tag>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#666', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{item.content}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: msg.role === 'user' ? '#1890ff' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6, overflowX: 'auto', background: '#fafafa' }}>
              {['如何使用AED', '心肺复苏', '拨打120'].map(q => (
                <button 
                  key={q} 
                  onClick={() => setAiInput(q)}
                  style={{
                    padding: '5px 10px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 14,
                    background: '#fff',
                    fontSize: 12,
                    color: '#666',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >{q}</button>
              ))}
            </div>
            
            <div style={{ padding: 10, background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAi()}
                  placeholder="输入问题..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 20,
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
                <button
                  onClick={sendAi}
                  style={{
                    padding: '8px 16px',
                    background: '#1890ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >发送</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部导航 + 紧急电话 */}
      <footer style={{ 
        background: '#fff', 
        borderTop: '1px solid #f0f0f0',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* 紧急电话栏 */}
        <div style={{ 
          display: 'flex',
          padding: '8px 16px',
          gap: 10,
          borderBottom: '1px solid #f5f5f5'
        }}>
          <a 
            href="tel:120"
            style={{
              flex: 1,
              padding: '12px 0',
              background: '#ff4d4f',
              color: '#fff',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            🚑 拨打 120
          </a>
          <a 
            href="tel:119"
            style={{
              flex: 1,
              padding: '12px 0',
              background: '#fa8c16',
              color: '#fff',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            🚒 拨打 119
          </a>
        </div>
        
        {/* Tab 导航 */}
        <div style={{ 
          display: 'flex', 
          padding: '8px 0'
        }}>
          {[
            { key: 'map', label: '定位', icon: '📍' },
            { key: 'knowledge', label: '科普', icon: '📖' },
            { key: 'ai', label: '助手', icon: '💬' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                padding: '6px 0',
                fontSize: 12,
                color: activeTab === tab.key ? '#1890ff' : '#999',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
