'use client';

import { useState, useEffect } from 'react';
import { useRouter, from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-editor/dist/quill.snow.css';
import { Article } from '@/types';

const ReactQuill = dynamic(() => import('react-quill').then((mod) => mod.default), { ssr: false })

interface ArticleFormProps {
  article: Article;
  onSave: (article: Article) => void;
}

export default function EditArticlePage({ article, onSave }: ArticleFormProps) {
  const [form, setForm] = useState({
    title: article.title,
    content: article.content,
    category: article.category,
    published: article.published,
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to update article');

      router.push('/admin/articles');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">编辑文章</h1>
            <button
              onClick={() => router.push('/admin/articles')}
              className="px-4 text-gray-600 hover:text-gray-800"
            >
              返回列表
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="tutorial">教程</option>
                <option value="knowledge">知识</option>
                <option value="video">视频</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">发布</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                <span className="text-sm">发布文章</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                className="h-64"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

