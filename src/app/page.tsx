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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
        <div style={{ textAlign: 'center' }}>
          <DotLoading color='#1677ff' style={{ transform: 'scale(1.5)' }} />
          <p style={{ marginTop: 16, color: '#999', fontSize: 14 }}>定位中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8fa' }}>
      {/* 简洁头部 */}
      <header style={{ 
        background: '#fff', 
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 32, height: 32, 
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)', 
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🏥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>AED 急救定位</div>
            <div style={{ fontSize: 11, color: '#999' }}>守护生命 · 从心开始</div>
          </div>
        </div>
        <a href="/admin" style={{ fontSize: 13, color: '#666', padding: '4px 8px' }}>管理</a>
      </header>

      {/* 内容区 */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'map' ? (
          <div>
            {/* 位置提示 */}
            {userLocation && (
              <div style={{ 
                padding: '10px 16px', 
                background: 'linear-gradient(90deg, #e6f7ff, #f0f5ff)', 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#1890ff'
              }}>
                <EnvironmentOutline fontSize={16} />
                <span>已获取您的位置</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#52c41a' }}>● 在线</span>
              </div>
            )}

            {/* AED 列表 */}
            <div style={{ padding: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12 
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>附近 AED</span>
                <span style={{ fontSize: 13, color: '#999' }}>{sortedAeds.length} 个</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedAeds.map((aed, idx) => (
                  <div 
                    key={aed.id}
                    onClick={() => navigate(aed)}
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      {/* 排名 */}
                      <div style={{ 
                        width: 36, height: 36, 
                        borderRadius: '50%',
                        background: idx === 0 ? 'linear-gradient(135deg, #ff6b6b, #ee5a5a)' : 
                                   idx === 1 ? 'linear-gradient(135deg, #ffa940, #fa8c16)' :
                                   idx === 2 ? 'linear-gradient(135deg, #52c41a, #389e0d)' : '#f5f5f5',
                        color: idx < 3 ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 14,
                        flexShrink: 0
                      }}>{idx + 1}</div>
                      
                      {/* 内容 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>{aed.name}</span>
                          <Tag color={aed.available ? 'success' : 'default'} style={{ fontSize: 10, padding: '0 6px' }}>
                            {aed.available ? '可用' : '维修'}
                          </Tag>
                        </div>
                        <div style={{ fontSize: 13, color: '#999', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {aed.address}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14, color: '#1890ff', fontWeight: 500 }}>
                            📍 {formatDistance(aed.distance || 0)}
                          </span>
                          <span style={{ fontSize: 12, color: '#1890ff' }}>
                            导航 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'knowledge' ? (
          <div style={{ padding: 16 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              color: '#fff'
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>急救科普</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>学习急救知识，关键时刻能救命</div>
            </div>
            
            {[
              { title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备，可以自动分析心律并给予电击除颤，被誉为"救命神器"。', tag: '知识', icon: '💡' },
              { title: '如何使用 AED', content: '1. 打开电源\n2. 贴电极片\n3. 等待分析\n4. 按除颤键', tag: '教程', icon: '📖' },
              { title: '心肺复苏步骤', content: 'C-按压：5-6cm深，100-120次/分\nA-开放气道\nB-人工呼吸：2次', tag: '教程', icon: '❤️' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <Tag color={item.tag === '教程' ? 'primary' : 'success'} style={{ fontSize: 10 }}>
                    {item.tag}
                  </Tag>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#666', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f7f8fa' }}>
            {/* 聊天区 */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: msg.role === 'user' ? '#1677ff' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 快捷问题 */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, overflowX: 'auto', background: '#fff' }}>
              {['如何使用AED', '心肺复苏方法', '拨打120技巧'].map(q => (
                <button 
                  key={q} 
                  onClick={() => setAiInput(q)}
                  style={{
                    padding: '6px 14px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 16,
                    background: '#fafafa',
                    fontSize: 12,
                    color: '#666',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >{q}</button>
              ))}
            </div>
            
            {/* 输入区 */}
            <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAi()}
                  placeholder="输入急救问题..."
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 24,
                    fontSize: 14,
                    outline: 'none',
                    background: '#fafafa'
                  }}
                />
                <button
                  onClick={sendAi}
                  style={{
                    width: 44,
                    height: 44,
                    background: aiInput.trim() ? '#1677ff' : '#e8e8e8',
                    color: aiInput.trim() ? '#fff' : '#999',
                    border: 'none',
                    borderRadius: '50%',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >➤</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer style={{ 
        background: '#fff', 
        borderTop: '1px solid #f0f0f0',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* 紧急电话 */}
        <div style={{ 
          display: 'flex',
          padding: '10px 16px',
          gap: 12,
          borderBottom: '1px solid #f5f5f5'
        }}>
          <a 
            href="tel:120"
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
              color: '#fff',
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(238,90,90,0.3)'
            }}
          >
            🚑 拨打 120
          </a>
          <a 
            href="tel:119"
            style={{
              flex: 1,
              padding: '14px 0',
              background: 'linear-gradient(135deg, #ffa940 0%, #fa8c16 100%)',
              color: '#fff',
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(250,140,22,0.3)'
            }}
          >
            🚒 拨打 119
          </a>
        </div>
        
        {/* Tab 导航 */}
        <div style={{ 
          display: 'flex', 
          padding: '6px 0'
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
                padding: '8px 0',
                fontSize: 12,
                color: activeTab === tab.key ? '#1677ff' : '#999',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
