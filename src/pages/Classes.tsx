import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, Users, School, AlertTriangle } from 'lucide-react';

export const Classes = () => {
  const { classes, addClass, deleteClass, students } = useAppStore();
  const [newClassName, setNewClassName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName.trim()) {
      addClass(newClassName.trim());
      setNewClassName('');
    }
  };

  const colors = [
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-rose-500',
    'from-purple-400 to-fuchsia-500',
    'from-cyan-400 to-blue-500',
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-indigo-900 flex items-center justify-center md:justify-start gap-3">
          <School className="w-10 h-10 text-indigo-600" />
          Quản lý Lớp học
        </h2>
        <p className="text-xl text-gray-500 mt-2">Thêm và quản lý danh sách các lớp bạn đang dạy.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 overflow-hidden mb-10">
        <div className="p-8 bg-gradient-to-r from-indigo-50 to-blue-50">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Nhập tên lớp (VD: 3A, 4B...)"
              className="flex-1 px-6 py-4 text-xl font-bold text-indigo-900 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal"
            />
            <button
              type="submit"
              disabled={!newClassName.trim()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xl font-bold rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-7 h-7" />
              Thêm lớp
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <School className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-500">Chưa có lớp học nào</h3>
            <p className="text-lg text-gray-400 mt-2">Hãy thêm lớp học đầu tiên của bạn ở phía trên.</p>
          </div>
        ) : (
          classes.map((cls, index) => {
            const studentCount = students.filter((s) => s.classId === cls.id).length;
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={cls.id} className="group relative bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all hover:-translate-y-1">
                <div className={`h-24 bg-gradient-to-r ${colorClass} p-6 flex items-end`}>
                  <h3 className="text-3xl font-black text-white drop-shadow-md">Lớp {cls.name}</h3>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Sĩ số</p>
                      <p className="text-2xl font-bold text-gray-800">{studentCount} <span className="text-base font-normal text-gray-500">HS</span></p>
                    </div>
                  </div>
                  {confirmDeleteId === cls.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                      <span className="text-sm font-bold text-rose-500 mr-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Xóa?
                      </span>
                      <button
                        onClick={() => deleteClass(cls.id)}
                        className="px-3 py-2 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                      >
                        Có
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(cls.id)}
                      className="w-12 h-12 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-colors"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
