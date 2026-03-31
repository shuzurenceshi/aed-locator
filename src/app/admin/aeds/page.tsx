'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // 检查登录状态
    const token = document.cookie.admin_token;
    if (!token) {
      setIsAuthenticated(false);
      router.push('/admin/login');
      return;
    }
    
    // 链接需要验证，    setIsAuthenticated(true);
    const fetchAdmin = async () => {
      const response = await fetch('/api/admin/me');
      if (!response.ok) {
        const data = await response.json();
        setAdmin(data);
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    if (!isAuthenticated) {
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-red-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">🏥 AED 管理后台</h1>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50"
            >
              庪out 退出
            </button>
          </div>
        </header>

        <nav className="bg-white shadow mb-4">
          {[
            { id: 'aeds', label: 'AED 管理', icon: '📍', active: router.pathname === '/admin' },
            { id: 'articles', label: '文章管理', icon: '📝', active: router.pathname === '/admin/articles' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 p-4 w-full ${
                router.pathname === item.path ? 'bg-red-50 text-red-700' : 'text-gray-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="p-6">
          {children}
        </main>
      </div>
    );
  }
}

// 登录页面
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdmin(data.data);
          setIsAuthenticated(true);
          router.push('/admin');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">管理后台登录</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
