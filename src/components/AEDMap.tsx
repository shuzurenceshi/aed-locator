'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 Leaflet 组件，禁用 SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);
const useMap = dynamic(
  () => import('react-leaflet').then(mod => mod.useMap),
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';
import { AEDLocation } from '@/types/aed';

// Mock AED 数据
const MOCK_AEDS: AEDLocation[] = [
  { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, distance: 0 },
  { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, distance: 0 },
  { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, distance: 0 },
  { id: '4', name: '东单体育中心 AED', address: '北京市东城区东单', lat: 39.9168, lng: 116.4195, available: false, distance: 0 },
  { id: '5', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, distance: 0 },
];

// 计算距离
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface AEDMapProps {
  userLocation: { lat: number; lng: number };
}

// 地图内部组件（需要 Leaflet context）
function MapContent({ 
  userLocation, 
  aedList, 
  selectedAed, 
  setSelectedAed 
}: { 
  userLocation: { lat: number; lng: number };
  aedList: AEDLocation[];
  selectedAed: AEDLocation | null;
  setSelectedAed: (aed: AEDLocation | null) => void;
}) {
  const [L, setL] = useState<any>(null);
  const [icons, setIcons] = useState<any>(null);
  const map = useMap();

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

      // 用户图标
      const userIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 40px; height: 40px;
          background: #3B82F6; border: 3px solid white;
          border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 20px;
        ">📍</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // AED 图标生成器
      const createAEDIcon = (available: boolean) => leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${available ? '#EF4444' : '#9CA3AF'};
          border: 2px solid white; border-radius: 6px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 10px;
        ">AED</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      setIcons({ userIcon, createAEDIcon });
    });
  }, []);

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [map, userLocation]);

  if (!L || !icons) return null;

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.userIcon}>
        <Popup>您的位置</Popup>
      </Marker>
      
      {aedList.map(aed => (
        <Marker
          key={aed.id}
          position={[aed.lat, aed.lng]}
          icon={icons.createAEDIcon(aed.available)}
          eventHandlers={{ click: () => setSelectedAed(aed) }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{aed.name}</strong><br />
              {aed.address}<br />
              <span className={aed.available ? 'text-green-600' : 'text-gray-500'}>
                {aed.available ? '✅ 可用' : '❌ 不可用'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function AEDMap({ userLocation }: AEDMapProps) {
  const [selectedAed, setSelectedAed] = useState<AEDLocation | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const aedList = useMemo(() => 
    MOCK_AEDS.map(aed => ({
      ...aed,
      distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng),
    })).sort((a, b) => a.distance - b.distance),
    [userLocation]
  );

  const handleNavigate = (aed: AEDLocation) => {
    const url = `https://uri.amap.com/marker?position=${aed.lng},${aed.lat}&name=${encodeURIComponent(aed.name)}&coordinate=wgs84`;
    window.open(url, '_blank');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载地图中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 地图区域 */}
      <div className="flex-1 relative">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={15}
          className="w-full h-full z-0"
        >
          <MapContent 
            userLocation={userLocation}
            aedList={aedList}
            selectedAed={selectedAed}
            setSelectedAed={setSelectedAed}
          />
        </MapContainer>
      </div>

      {/* 侧边栏 AED 列表 */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto z-10">
        <div className="p-4 bg-gray-50 border-b sticky top-0">
          <h2 className="font-bold text-lg">附近 AED</h2>
          <p className="text-sm text-gray-500">按距离排序 · 共 {aedList.length} 个</p>
        </div>
        <div className="divide-y">
          {aedList.map((aed, idx) => (
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
                    <span className="text-xs bg-red-100 text-red-700 w-5 h-5 rounded-full flex items-center justify-center font-bold">{idx + 1}</span>
                    <span className="font-semibold">{aed.name}</span>
                    {aed.available ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">可用</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">不可用</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-7">{aed.address}</p>
                </div>
                <span className="text-sm font-medium text-red-600 whitespace-nowrap">{aed.distance.toFixed(2)} km</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleNavigate(aed); }}
                className="mt-3 ml-7 w-[calc(100%-28px)] bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                🧭 导航前往
              </button>
            </div>
          ))}
        </div>
        
        {/* 使用提示 */}
        <div className="p-4 bg-blue-50 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 使用提示</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>点击 AED 标记查看详情</li>
            <li>点击"导航"按钮跳转地图导航</li>
            <li>AED 位置为示例数据</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
