'use client';

import { useState, useEffect } from 'react';
import AEDMap from '@/components/AEDMap';

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          // 默认北京天安门
          setUserLocation({ lat: 39.9042, lng: 116.4074 });
          setLoading(false);
          setError('无法获取位置，已使用默认位置');
        }
      );
    } else {
      setUserLocation({ lat: 39.9042, lng: 116.4074 });
      setLoading(false);
      setError('浏览器不支持定位，已使用默认位置');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏥 AED 急救定位
          </h1>
          <p className="text-sm opacity-90">快速找到最近的自动体外除颤器</p>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在获取您的位置...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {!loading && userLocation && (
        <div className="h-[calc(100vh-80px)]">
          <AEDMap userLocation={userLocation} />
        </div>
      )}
    </main>
  );
}
