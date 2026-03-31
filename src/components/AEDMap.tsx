'use client';

import { useEffect, useRef, useState } from 'react';
import { AEDLocation } from '@/types/aed';

// Mock AED 数据（实际项目可接入真实数据源）
const MOCK_AEDS: AEDLocation[] = [
  {
    id: '1',
    name: '北京站 AED',
    address: '北京市东城区北京站',
    lat: 39.9029,
    lng: 116.4272,
    available: true,
    distance: 0,
  },
  {
    id: '2',
    name: '王府井百货 AED',
    address: '北京市东城区王府井大街255号',
    lat: 39.9139,
    lng: 116.4103,
    available: true,
    distance: 0,
  },
  {
    id: '3',
    name: '协和医院 AED',
    address: '北京市东城区王府井大街',
    lat: 39.9134,
    lng: 116.4179,
    available: true,
    distance: 0,
  },
  {
    id: '4',
    name: '东单体育中心 AED',
    address: '北京市东城区东单',
    lat: 39.9168,
    lng: 116.4195,
    available: false,
    distance: 0,
  },
  {
    id: '5',
    name: '朝阳门地铁站 AED',
    address: '北京市东城区朝阳门',
    lat: 39.9245,
    lng: 116.4342,
    available: true,
    distance: 0,
  },
];

interface AEDMapProps {
  userLocation: { lat: number; lng: number };
}

export default function AEDMap({ userLocation }: AEDMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [aedList, setAedList] = useState<AEDLocation[]>([]);
  const [selectedAed, setSelectedAed] = useState<AEDLocation | null>(null);

  // 计算距离（Haversine 公式）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 地球半径（公里）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || !window.AMap) return;

    // 创建地图实例
    const map = new window.AMap.Map(mapRef.current, {
      zoom: 15,
      center: [userLocation.lng, userLocation.lat],
    });

    mapInstanceRef.current = map;

    // 添加用户位置标记
    new window.AMap.Marker({
      position: [userLocation.lng, userLocation.lat],
      map: map,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(40, 50),
        image: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <circle cx="20" cy="20" r="15" fill="#3B82F6" stroke="#fff" stroke-width="3"/>
            <circle cx="20" cy="20" r="5" fill="#fff"/>
            <path d="M20 35 L15 45 L20 40 L25 45 Z" fill="#3B82F6"/>
          </svg>
        `),
        imageSize: new window.AMap.Size(40, 50),
      }),
    });

    return () => {
      map.destroy();
    };
  }, [userLocation]);

  // 计算距离并排序
  useEffect(() => {
    const aedsWithDistance = MOCK_AEDS.map((aed) => ({
      ...aed,
      distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng),
    })).sort((a, b) => a.distance - b.distance);

    setAedList(aedsWithDistance);

    // 添加 AED 标记
    if (mapInstanceRef.current && window.AMap) {
      aedsWithDistance.forEach((aed) => {
        const marker = new window.AMap.Marker({
          position: [aed.lng, aed.lat],
          map: mapInstanceRef.current,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(32, 40),
            image: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <rect x="2" y="2" width="28" height="36" rx="4" fill="${aed.available ? '#EF4444' : '#9CA3AF'}" stroke="#fff" stroke-width="2"/>
                <text x="16" y="25" font-size="14" fill="#fff" text-anchor="middle" font-weight="bold">AED</text>
              </svg>
            `),
            imageSize: new window.AMap.Size(32, 40),
          }),
        });

        marker.on('click', () => setSelectedAed(aed));
      });
    }
  }, [userLocation]);

  // 导航
  const handleNavigate = (aed: AEDLocation) => {
    const url = `https://uri.amap.com/marker?position=${aed.lng},${aed.lat}&name=${encodeURIComponent(aed.name)}&coordinate=wgs84`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex h-full">
      {/* 地图区域 */}
      <div ref={mapRef} className="flex-1" />

      {/* 侧边栏 AED 列表 */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-bold text-lg">附近 AED</h2>
          <p className="text-sm text-gray-500">按距离排序</p>
        </div>
        <div className="divide-y">
          {aedList.map((aed) => (
            <div
              key={aed.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedAed?.id === aed.id ? 'bg-red-50 border-l-4 border-red-500' : ''
              }`}
              onClick={() => setSelectedAed(aed)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{aed.name}</span>
                    {aed.available ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">可用</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">不可用</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{aed.address}</p>
                </div>
                <span className="text-sm font-medium text-red-600">{aed.distance.toFixed(2)} km</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(aed);
                }}
                className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                🧭 导航前往
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
