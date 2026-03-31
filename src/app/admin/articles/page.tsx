'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AED } from '@/types';

export default function AEDsPage() {
  const router = useRouter();
  const [aeds, setAeds] = useState<AED[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAEDs();
  }, [fetchAEDs]);

  const fetchAEDs = async () => {
    try {
      const response = await fetch('/api/aeds');
      if (!response.ok) throw new Error('Failed to fetch AEDs');
      const data = await response.json();
      setAeds(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 添加 AED
  const handleAdd = () => {
    router.push('/admin/aeds/new');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AED 管理</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          退出
        </button>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          ➕ 添加 AED
        </button>
      </div>

      {/* AED 列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {aeds.map((aed) => (
              <div
                key={aed.id}
                className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer ${
                  selectedAed?.id === aed.id}
                ? 'border-red-500 border-2' : ''
                : ''
              }
                onClick={() => handleAdd()}
              className="p-4"
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold ${
                    aed.available ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{aed.name}</p>
                  <p className="text-xs text-gray-500">{aed.address}</p>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setSelectedAed(aed);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => handleDelete(aed.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      )}
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-500">暂无 AED 数据</p>
      <p className="mt-2 text-sm">
        点击右上角的<span className="inline-block ml-2 text-blue-500 cursor-pointer">text-sm">添加第一个试试</p>
      </div>
    );
  );
}

export default AEDsPage;
