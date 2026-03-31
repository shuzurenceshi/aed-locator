'use client';

import { useState, useMemo } from 'react';
import { AEDLocation } from '@/types/aed';

// Mock AED 数据（实际项目可接入真实数据源）
const MOCK_AEDS: AEDLocation[] = [
  { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, distance: 0 },
  { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, distance: 0 },
  { id: '3', name: '协和医院 AED', address: '北京市东城区王府井大街', lat: 39.9134, lng: 116.4179, available: true, distance: 0 },
  { id: '4', name: '东单体育中心 AED', address: '北京市东城区东单', lat: 39.9168, lng: 116.4195, available: false, distance: 0 },
  { id: '5', name: '朝阳门地铁站 AED', address: '北京市东城区朝阳门', lat: 39.9245, lng: 116.4342, available: true, distance: 0 },
];

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

interface AEDMapProps {
  userLocation: { lat: number; lng: number };
}

export default function AEDMap({ userLocation }: AEDMapProps) {
  const [selectedAed, setSelectedAed] = useState<AEDLocation | null>(null);

  // 计算距离并排序
  const aedList = useMemo(() => {
    return MOCK_AEDS.map((aed) => ({
      ...aed,
      distance: calculateDistance(userLocation.lat, userLocation.lng, aed.lat, aed.lng),
    })).sort((a, b) => a.distance - b.distance);
  }, [userLocation]);

  // 生成 OpenStreetMap 嵌入链接
  const mapUrl = useMemo(() => {
    const markers = aedList
      .map((aed, idx) => `${aed.lat},${aed.lng}`)
      .join('|');
    
    // 使用 OpenStreetMap 的导出功能
    return `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.02}%2C${userLocation.lat - 0.02}%2C${userLocation.lng + 0.02}%2C${userLocation.lat + 0.02}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`;
  }, [userLocation, aedList]);

  // 生成带所有标记的静态地图图片（用 staticmap）
  const staticMapUrl = useMemo(() => {
    // 使用 OpenStreetMap 嵌入地图
    const bbox = `${userLocation.lng - 0.03},${userLocation.lat - 0.03},${userLocation.lng + 0.03},${userLocation.lat + 0.03}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
  }, [userLocation]);

  // 导航到 AED
  const handleNavigate = (aed: AEDLocation) => {
    // 使用高德地图导航（国内更友好）
    const url = `https://uri.amap.com/marker?position=${aed.lng},${aed.lat}&name=${encodeURIComponent(aed.name)}&coordinate=wgs84`;
    window.open(url, '_blank');
  };

  // 在地图中查看 AED
  const viewOnMap = (aed: AEDLocation) => {
    const url = `https://www.openstreetmap.org/?mlat=${aed.lat}&mlon=${aed.lng}#map=17/${aed.lat}/${aed.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex h-full">
      {/* 地图区域 - 使用 iframe 嵌入 OpenStreetMap */}
      <div className="flex-1 relative">
        <iframe
          src={staticMapUrl}
          className="w-full h-full border-0"
          title="AED 地图"
          loading="lazy"
        />
        
        {/* 地图叠加层显示用户位置 */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-gray-700">您的位置</span>
          </div>
        </div>
        
        {/* 图例 */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span>可用 AED</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-400 rounded"></span>
              <span>不可用</span>
            </div>
          </div>
        </div>
      </div>

      {/* 侧边栏 AED 列表 */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
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
                    <span className="text-xs bg-red-100 text-red-700 w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
                <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                  {aed.distance.toFixed(2)} km
                </span>
              </div>
              
              {/* 操作按钮 */}
              <div className="mt-3 ml-7 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewOnMap(aed);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-1 text-sm"
                >
                  🗺️ 查看地图
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(aed);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-1 text-sm"
                >
                  🧭 导航
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* 使用提示 */}
        <div className="p-4 bg-blue-50 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 使用提示</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>点击列表项选中 AED</li>
            <li>点击"导航"跳转高德地图导航</li>
            <li>点击"查看地图"在 OpenStreetMap 查看</li>
            <li className="text-orange-600">⚠️ 当前为示例数据</li>
          </ul>
        </div>
        
        {/* 紧急求助 */}
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-red-700 font-semibold text-sm mb-2">🚨 紧急情况</p>
          <p className="text-xs text-red-600 mb-2">
            如遇紧急情况，请立即拨打：
          </p>
          <div className="flex gap-2">
            <a
              href="tel:120"
              className="flex-1 bg-red-600 text-white py-2 rounded text-center font-bold hover:bg-red-700 transition"
            >
              120 急救
            </a>
            <a
              href="tel:119"
              className="flex-1 bg-orange-600 text-white py-2 rounded text-center font-bold hover:bg-orange-700 transition"
            >
              119 消防
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
