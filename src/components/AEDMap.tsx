'use client';

import { useState, useEffect } from 'react';
import AEDMap from '@/components/AEDMap';
import dynamic from 'next/dynamic';

// 动态加载地图组件（避免 SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
      { ssr: false }
    ),
    { ssr: false }
  ),
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏥 AED 急救定位
          </h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-2 rounded-lg ${
                activeTab === 'map' ? 'bg-red-600 text-white' : 'bg-transparent'
              } :`}
              className={`px-3 py-2 rounded-lg ${
                activeTab === 'list' ? 'bg-gray-200 text-gray-700' : 'bg-red-50'
              } : ${tab === 'knowledge' ? (
                activeTab === 'list'
                  ? `bg-green-100 text-green-700`
                : 'bg-gray-200' : 'hover:bg-red-50'
              } }`}
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-2 rounded-lg ${
                activeTab === 'knowledge' ? 'bg-red-600 text-white' : 'bg-transparent'
              } : ${tab !== 'map' && (
                activeTab !== tab
              )}
            </div>
          </nav>

          {/* 地图区域 */}
          <div className="flex-1 h-[calc(100vh-80px)]">
            {loading && !userLocation ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">正在获取您的位置...</p>
              </div>
            ) : (
              <div className="flex-1 h-[calc(100vh-80px)]">
                <AEDMap 
                  userLocation={userLocation}
                  aeds={aeds}
                  activeTab={activeTab}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
