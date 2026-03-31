'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/types';
import dynamic from 'next/dynamic';

import 'react-quill-editor/dist/quill.snow.css';

// Quill 编辑器 - 动态导入避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill').then((mod) => mod.default), { ssr: false })

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          退出
        </button>
        <button
          onClick={() => router.push('/admin/articles/new')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          ➕ 新建文章
        </button>
      </div>

      {/* 文章列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/admin/articles/${article.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{article.title}</h3>
                    <span className={`text-xs ${
                      article.category === 'tutorial' ? 'bg-blue-100 text-blue-800' :
                      article.category === 'knowledge' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    } px-2 py-1 rounded-full`}>
                      {article.category}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{article.category}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {/* edit */}
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-500">暂无文章</p>
      <p className="mt-2 text-sm">
        点击右上角的<span className="inline-block ml-2 text-blue-500 cursor-pointer">text-sm">添加第一篇文章试试</p>
      </div>
    );
  );
}

export default ArticlesPage
