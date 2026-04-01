'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AED {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: boolean;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [aeds, setAeds] = useState<AED[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    available: true,
  });

  // 检查登录状态
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  // 加载 AED 数据
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aed_data') : null;
    if (saved) {
      setAeds(JSON.parse(saved));
    } else {
      // 默认数据
      const defaultAEDs: AED[] = [
        { id: '1', name: '北京站 AED', address: '北京市东城区北京站', lat: 39.9029, lng: 116.4272, available: true, status: 'active' },
        { id: '2', name: '王府井百货 AED', address: '北京市东城区王府井大街255号', lat: 39.9139, lng: 116.4103, available: true, status: 'active' },
      ];
      setAeds(defaultAEDs);
      localStorage.setItem('aed_data', JSON.stringify(defaultAEDs));
    }
  }, []);

  // 保存数据
  const saveAEDs = (newAEDs: AED[]) => {
    setAeds(newAEDs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aed_data', JSON.stringify(newAEDs));
    }
  };

  // 添加 AED
  const handleAdd = () => {
    if (!formData.name || !formData.address || !formData.lat || !formData.lng) {
      alert('请填写完整信息');
      return;
    }
    
    const newAED: AED = {
      id: `aed-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      available: formData.available,
      status: 'active',
    };
    
    saveAEDs([...aeds, newAED]);
    setFormData({ name: '', address: '', lat: '', lng: '', available: true });
    setShowForm(false);
  };

  // 删除 AED
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个 AED 吗？')) {
      saveAEDs(aeds.filter(a => a.id !== id));
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">🏥 AED 管理后台</h1>
          <div className="flex gap-4">
            <a href="/" className="text-white hover:underline">前台首页</a>
            <button onClick={handleLogout} className="text-white hover:underline">退出</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">AED 管理</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {showForm ? '取消' : '+ 添加 AED'}
          </button>
        </div>

        {/* 添加表单 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">添加新 AED</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="如：北京站 AED"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="详细地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">纬度</label>
                <input
                  type="text"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="39.9042"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">经度</label>
                <input
                  type="text"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="116.4074"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              />
              <label htmlFor="available" className="text-sm">可用</label>
            </div>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              保存
            </button>
          </div>
        )}

        {/* AED 列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium">地址</th>
                <th className="px-4 py-3 text-left text-sm font-medium">坐标</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {aeds.map(aed => (
                <tr key={aed.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{aed.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{aed.address}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{aed.lat}, {aed.lng}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${aed.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {aed.available ? '可用' : '不可用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(aed.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {aeds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无 AED 数据，点击"添加 AED"添加
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          💡 提示：数据存储在浏览器本地，清除缓存会丢失数据
        </p>
      </main>
    </div>
  );
}
