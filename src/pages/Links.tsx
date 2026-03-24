import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link as LinkIcon, Plus, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

export const Links = () => {
  const { classes, links, addLink, deleteLink } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const classLinks = links.filter(l => l.classId === selectedClassId).sort((a, b) => b.createdAt - a.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !title.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    addLink({
      classId: selectedClassId,
      title: title.trim(),
      url: finalUrl,
    });
    setTitle('');
    setUrl('');
  };

  const handleCopy = (linkUrl: string, id: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có lớp học</h2>
          <p className="text-gray-500">Vui lòng tạo lớp học trước khi thêm liên kết.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Liên kết & Tài liệu</h1>
          <p className="text-gray-500 mt-2">Chia sẻ đường dẫn cho học sinh truy cập</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm"
          >
            <option value="" disabled>Chọn lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Thêm liên kết mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài tập về nhà tuần 1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (URL)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="VD: https://docs.google.com/..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!selectedClassId || !title.trim() || !url.trim()}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm liên kết
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {classLinks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có liên kết nào</h3>
              <p className="text-gray-500">Thêm liên kết đầu tiên cho lớp học này</p>
            </div>
          ) : (
            classLinks.map(link => (
              <div key={link.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{link.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline truncate flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-xs text-gray-400 shrink-0">
                      • {format(link.createdAt, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="w-10 h-10 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-colors"
                    title="Sao chép liên kết"
                  >
                    {copiedId === link.id ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="w-10 h-10 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa liên kết"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
