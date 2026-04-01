'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, List, Button, Tag, SearchBar, DotLoading } from 'antd-mobile';
import { EnvironmentOutline, PhoneFill } from 'antd-mobile-icons';

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
  const [activeTab, setActiveTab] = useState<'map' | 'knowledge' | 'ai'>('map');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: string; content: string}[]>([]);
  
  const [aeds, setAeds] = useState<AED[]>([]);

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
    setAiMessages([{ role: 'assistant', content: '您好！我是 AI 急救助手 🏥\n\n可以回答：\n• AED 使用方法\n• 心肺复苏步骤\n• 拨打 120 技巧' }]);
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
    const input = aiInput;
    setAiInput('');
    setTimeout(() => {
      let reply = '建议立即拨打 120';
      if (input.includes('AED') || input.includes('除颤')) reply = 'AED 使用：开电源 → 贴电极 → 等分析 → 按除颤';
      else if (input.includes('心') || input.includes('复苏')) reply = '心肺复苏：按压5-6cm深，100-120次/分，比例30:2';
      setAiMessages(p => [...p, { role: 'assistant', content: reply }]);
    }, 800);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <DotLoading color='#1677ff' style={{ '--size': '48px' }} />
          <p style={{ marginTop: 16, color: '#999', fontSize: 14 }}>定位中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* 简洁头部 */}
      <header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* 顶部标题栏 */}
        <div style={{ 
          padding: '16px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, height: 36, 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)', 
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(238,90,90,0.3)'
            }}>🏥</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#1a1a1a' }}>AED 急救定位</h1>
              <p style={{ margin: 0, fontSize: 11, color: '#999' }}>守护生命 · 从心开始</p>
            </div>
          </div>
          <a href="/admin" style={{ fontSize: 13, color: '#666' }}>管理</a>
        </div>
        
        {/* Tab 切换 */}
        <div style={{ 
          display: 'flex', 
          padding: '0 16px 12px',
          gap: 8
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
                padding: '10px 0',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                background: activeTab === tab.key ? '#1677ff' : '#f5f5f5',
                color: activeTab === tab.key ? '#fff' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: 4 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* 内容区 */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'map' ? (
          <div style={{ padding: 12 }}>
            {/* 紧急电话 */}
            <div style={{ 
              display: 'flex', 
              gap: 10, 
              marginBottom: 12,
            }}>
              <button
                onClick={() => { window.location.href = 'tel:120'; }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  border: 'none',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 2px 12px rgba(238,90,90,0.3)',
                  cursor: 'pointer'
                }}
              >
                🚑 拨打 120
              </button>
              <button
                onClick={() => { window.location.href = 'tel:119'; }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  border: 'none',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ffa940 0%, #fa8c16 100%)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 2px 12px rgba(250,140,22,0.3)',
                  cursor: 'pointer'
                }}
              >
                🚒 拨打 119
              </button>
            </div>

            {/* 位置信息 */}
            {userLocation && (
              <div style={{ 
                padding: '10px 14px', 
                background: '#e6f7ff', 
                borderRadius: 8, 
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#0050b3'
              }}>
                <EnvironmentOutline fontSize={16} />
                <span>已获取您的位置</span>
              </div>
            )}

            {/* AED 列表 */}
            <Card 
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>附近 AED</span>} 
              extra={<span style={{ fontSize: 13, color: '#999' }}>{sortedAeds.length} 个</span>}
              style={{ borderRadius: 10 }}
            >
              <List>
                {sortedAeds.map((aed, idx) => (
                  <List.Item
                    key={aed.id}
                    prefix={
                      <div style={{ 
                        width: 32, height: 32, 
                        borderRadius: '50%',
                        background: idx === 0 ? '#1677ff' : idx === 1 ? '#52c41a' : '#f0f0f0',
                        color: idx < 2 ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 13
                      }}>{idx + 1}</div>
                    }
                    description={<span style={{ fontSize: 12 }}>{aed.address}</span>}
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 14 }}>
                          {formatDistance(aed.distance || 0)}
                        </div>
                        <Tag color={aed.available ? 'success' : 'default'} style={{ marginTop: 4, fontSize: 10 }}>
                          {aed.available ? '可用' : '维修'}
                        </Tag>
                      </div>
                    }
                    onClick={() => navigate(aed)}
                    arrow
                    style={{ padding: '12px 0' }}
                  >
                    <span style={{ fontWeight: 500 }}>{aed.name}</span>
                  </List.Item>
                ))}
              </List>
            </Card>
          </div>
        ) : activeTab === 'knowledge' ? (
          <div style={{ padding: 12 }}>
            {[
              { title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备，可以自动分析心律并给予电击除颤，被誉为"救命神器"。', tag: '知识', color: 'success' },
              { title: '如何使用 AED', content: '1. 打开电源\n2. 贴电极片\n3. 等待分析\n4. 按除颤键', tag: '教程', color: 'primary' },
              { title: '心肺复苏步骤', content: 'C-按压：5-6cm深，100-120次/分\nA-开放气道\nB-人工呼吸：2次', tag: '教程', color: 'primary' },
            ].map((item, idx) => (
              <Card key={idx} style={{ marginBottom: 10, borderRadius: 10 }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={item.color}>{item.tag}</Tag>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#666', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{item.content}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 聊天 */}
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? '#1677ff' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 快捷问题 */}
            <div style={{ padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto', background: '#fff' }}>
              {['如何使用AED', '心肺复苏', '拨打120'].map(q => (
                <button 
                  key={q} 
                  onClick={() => setAiInput(q)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 16,
                    background: '#fff',
                    fontSize: 12,
                    color: '#666',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >{q}</button>
              ))}
            </div>
            
            {/* 输入 */}
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
    </div>
  );
}
