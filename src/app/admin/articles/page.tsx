'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminArticles() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'knowledge',
    published: true,
  });

  // 检查登录
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) router.push('/admin');
  }, [router]);

  // 加载文章
  useEffect(() => {
    const saved = localStorage.getItem('article_data');
    if (saved) {
      setArticles(JSON.parse(saved));
    } else {
      const defaultArticles: Article[] = [
        { id: '1', title: 'AED 是什么？', content: '自动体外除颤器（AED）是一种便携式医疗设备...', category: 'knowledge', sort_order: 1, published: true, created_at: '', updated_at: '' },
        { id: '2', title: '如何使用 AED', content: '1. 打开电源\n2 按图示贴好电极片...', category: 'tutorial', sort_order: 2, published: true, created_at: '', updated_at: '' },
      ];
      setArticles(defaultArticles);
      localStorage.setItem('article_data', JSON.stringify(defaultArticles));
    }
  }, []);

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    localStorage.setItem('article_data', JSON.stringify(newArticles));
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('请填写完整信息');
      return;
    }

    if (editingId) {
      saveArticles(articles.map(a => 
        a.id === editingId 
          ? { ...a, ...formData, updated_at: new Date().toISOString() }
          : a
      ));
      setEditingId(null);
    } else {
      const newArticle: Article = {
        id: `article-${Date.now()}`,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveArticles([...articles, newArticle]);
    }

    setFormData({ title: '', content: '', category: 'knowledge', published: true });
    setShowForm(false);
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      published: article.published,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      saveArticles(articles.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">📚 文章管理</h1>
          <div className="flex gap-4">
            <a href="/admin/dashboard" className="text-white hover:underline">AED 管理</a>
            <a href="/" className="text-white hover:underline">前台首页</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">科普文章管理</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', content: '', category: 'knowledge', published: true });
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {showForm ? '取消' : '+ 新建文章'}
          </button>
        </div>

        {/* 表单 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? '编辑文章' : '新建文章'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="文章标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="knowledge">知识</option>
                  <option value="tutorial">教程</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg min-h-[200px]"
                  placeholder="文章内容"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <label htmlFor="published" className="text-sm">发布</label>
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* 文章列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{article.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.category === 'tutorial' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {article.category === 'tutorial' ? '教程' : '知识'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {article.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(article)}
                      className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
