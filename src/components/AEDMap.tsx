'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AED } from '@/types';
import 'leaflet/dist/leaflet.css';

// 动态加载 Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false })

interface AEDMapProps {
  userLocation: { lat: number; lng: number };
  aeds: AED[];
  onAedSelect: (aed: AED) => void;
}

// 计算距离
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AEDMap({ userLocation, aeds, onAedSelect }: AEDMapProps) {
  const [selectedAed, setSelectedAed] = useState<AED | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [L, setL] = useState<any>(null);
  
  useEffect(() => {
    import('leaflet').then(leaflet => {
      setL(leaflet.default);
      // 修复默认图标
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    });
  }, []);
  
  // 地图初始化
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current || !L) return;
    
    const mapInstance = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 15,
    });
    
    setMap(mapInstance);
    
    return () => {
      mapInstance?.remove();
    };
  }, [userLocation, L]);
  
  // 添加用户位置
  useEffect(() => {
    if (!map || !L) return;
    
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="background:#3B82F6;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('您的位置');
  }, [map, userLocation, L]);
  
  // 添加 AED 标记
  useEffect(() => {
    if (!map || !L || !aeds.length) return;
    
    const markers: L.Marker[] = [];
    
    aeds.forEach(aed => {
      const aedIcon = L.divIcon({
        className: 'aed-marker',
        html: `<div style="background:${aed.available ? '#EF4444' : '#9CA3AF'};width:32px;height:32px;border-radius:4px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">AED</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      
      const marker = L.marker([aed.lat, aed.lng], { icon: aedIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:150px;">
            <strong>${aed.name}</strong><br>
            <small>${aed.address}</small><br>
            <span style="color:${aed.available ? '#22c55e' : '#999'}">
              ${aed.available ? '✅ 可用' : '❌ 不可用'}
            </span>
          </div>
        `);
      
      marker.on('click', () => {
        setSelectedAed(aed);
        onAedSelect(aed);
      });
      
      markers.push(marker);
    });
    
    return () => {
      markers.forEach(m => m.remove());
    };
  }, [map, aeds, L, onAedSelect]);
  
  // 导航到 AED
  const navigateToAed = (aed: AED) => {
    // 使用高德地图导航
    const url = `https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat}&to=${aed.lng},${aed.lat}&mode=walk&coordinate=wgs84`;
    window.open(url, '_blank');
  };
  
  if (typeof window === 'undefined') {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }
  
  return (
    <div className="flex h-full">
      {/* 地图 */}
      <div ref={mapRef} className="flex-1 z-0" />
      
      {/* 侧边栏 */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto z-10">
        <div className="p-4 bg-gray-50 border-b sticky top-0">
          <h2 className="font-bold text-lg">附近 AED</h2>
          <p className="text-sm text-gray-500">共 {aeds.length} 个</p>
        </div>
        
        <div className="divide-y">
          {aeds.sort((a, b) => 
            calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) - 
            calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
          ).map((aed, idx) => (
            <div
              key={aed.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedAed?.id === aed.id ? 'bg-red-50 border-l-4 border-red-500' : ''
              }`}
              onClick={() => {
                setSelectedAed(aed);
                onAedSelect(aed);
              }}
            >
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
                <span className="text-sm font-medium text-red-600">
                  {calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng).toFixed(2)} km
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToAed(aed);
                }}
                className="mt-3 ml-7 w-[calc(100%-28px)] bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                🧭 导航
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
