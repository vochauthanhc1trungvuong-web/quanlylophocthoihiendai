import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, Edit2, UserCircle, Upload, ClipboardPaste, Camera, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAvatarUrl } from '../utils/effects';

export const Students = () => {
  const { classes, students, addStudent, bulkAddStudents, updateStudent, deleteStudent } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [newStudentName, setNewStudentName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  const showMessage = (text: string, type: 'success'|'error' = 'success') => {
    setMessage({text, type});
    setTimeout(() => setMessage(null), 3000);
  };
  
  // Import states
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar upload states
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatarFor, setUploadingAvatarFor] = useState<string | null>(null);
  const [showOnlyMissingAvatar, setShowOnlyMissingAvatar] = useState(false);

  const filteredStudents = students.filter((s) => s.classId === selectedClassId);
  const studentsWithoutAvatar = filteredStudents.filter((s) => !s.avatarUrl).length;

  const displayedStudents = (showOnlyMissingAvatar && studentsWithoutAvatar > 0)
    ? filteredStudents.filter(s => !s.avatarUrl)
    : filteredStudents;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && selectedClassId) {
      addStudent({ name: newStudentName.trim(), classId: selectedClassId });
      setNewStudentName('');
    }
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      const student = students.find(s => s.id === id);
      updateStudent(id, editName.trim(), student?.avatarUrl);
      setEditingId(null);
    }
  };

  const handleTextImport = () => {
    const names = importText.split('\n').map(n => n.trim()).filter(n => n);
    if (names.length > 0 && selectedClassId) {
      bulkAddStudents(names.map(name => ({ name, classId: selectedClassId })));
      setImportText('');
      setShowImport(false);
      showMessage(`Đã thêm thành công ${names.length} học sinh!`, 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClassId) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        const names = data.map(row => {
          return row['Họ và tên'] || row['Họ tên'] || row['Tên'] || row['Name'] || Object.values(row)[0];
        }).filter(Boolean) as string[];

        if (names.length > 0) {
          bulkAddStudents(names.map(name => ({ name: String(name).trim(), classId: selectedClassId })));
          setShowImport(false);
          showMessage(`Đã thêm thành công ${names.length} học sinh từ file Excel!`, 'success');
        } else {
          showMessage('Không tìm thấy dữ liệu tên học sinh trong file.', 'error');
        }
      } catch (error) {
        showMessage('Có lỗi xảy ra khi đọc file Excel.', 'error');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarClick = (studentId: string) => {
    setUploadingAvatarFor(studentId);
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingAvatarFor) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to save localStorage space (max 150x150)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        const student = students.find(s => s.id === uploadingAvatarFor);
        if (student) {
          updateStudent(student.id, student.name, dataUrl);
        }
        setUploadingAvatarFor(null);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  if (classes.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center mt-20">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-indigo-100">
          <h2 className="text-4xl font-black text-indigo-900 mb-6">Quản lý Học sinh</h2>
          <p className="text-xl text-gray-500">Vui lòng tạo lớp học trước khi thêm học sinh nhé!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-6 py-4 rounded-2xl shadow-xl animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        accept="image/*"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        className="hidden"
      />

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
        <div>
          <h2 className="text-3xl font-black text-indigo-900">Danh sách Học sinh</h2>
          <p className="text-lg text-indigo-600/70 mt-2 font-medium">Thêm và quản lý học sinh trong lớp</p>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-base font-bold text-indigo-900 mb-2">Đang chọn lớp:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 text-lg font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Add Student Forms */}
        <div className="lg:col-span-1 space-y-6">
          {/* Single Add */}
          <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-emerald-600" />
                Thêm 1 học sinh
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-5 py-4 text-lg border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newStudentName.trim() || !selectedClassId}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Thêm ngay
                </button>
              </form>
            </div>
          </div>

          {/* Bulk Add Toggle */}
          <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
            <div 
              className="p-6 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
              onClick={() => setShowImport(!showImport)}
            >
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ClipboardPaste className="w-6 h-6 text-blue-600" />
                Thêm nhiều học sinh
              </h3>
              <div className={`transform transition-transform ${showImport ? 'rotate-45' : ''}`}>
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            {showImport && (
              <div className="p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                {/* Paste Text */}
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Dán danh sách (mỗi dòng 1 tên):</label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={5}
                    placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."
                    className="w-full px-4 py-3 text-base border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                  <button
                    onClick={handleTextImport}
                    disabled={!importText.trim()}
                    className="mt-3 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Nhập danh sách
                  </button>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 font-medium text-sm">HOẶC</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Upload Excel */}
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-2">Tải lên file Excel (.xlsx, .xls):</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="w-full py-4 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all text-blue-700 font-medium"
                  >
                    <Upload className="w-8 h-8 text-blue-500" />
                    <span>Chọn file Excel</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Student List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl font-black text-gray-800">
                Sĩ số: <span className="text-indigo-600">{filteredStudents.length}</span> học sinh
              </h3>
              {studentsWithoutAvatar > 0 && (
                <button
                  onClick={() => setShowOnlyMissingAvatar(!showOnlyMissingAvatar)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    showOnlyMissingAvatar 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {showOnlyMissingAvatar ? 'Hiện tất cả' : `Lọc ${studentsWithoutAvatar} HS thiếu ảnh`}
                </button>
              )}
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {filteredStudents.length > 0 && studentsWithoutAvatar > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 animate-in fade-in duration-500">
                  <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-lg">Nhắc nhở cập nhật ảnh đại diện</p>
                    <p className="text-base mt-1">
                      Lớp hiện có <strong className="text-amber-600">{studentsWithoutAvatar}</strong> học sinh chưa có ảnh. 
                      Hãy bấm vào biểu tượng hình tròn bên cạnh tên các em để tải ảnh lên, giúp việc chấm điểm dễ dàng và sinh động hơn nhé!
                    </p>
                  </div>
                </div>
              )}

              {filteredStudents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                  <UserCircle className="w-24 h-24 mb-4 opacity-20" />
                  <p className="text-xl font-medium">Lớp này chưa có học sinh nào.</p>
                  <p className="text-base mt-2">Hãy thêm học sinh ở cột bên trái nhé!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedStudents.map((student) => (
                    <div key={student.id} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar with Upload Overlay */}
                        <div 
                          className="relative w-14 h-14 rounded-full cursor-pointer group/avatar shrink-0"
                          onClick={() => handleAvatarClick(student.id)}
                          title="Nhấn để đổi ảnh đại diện"
                        >
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-500 shadow-inner overflow-hidden">
                            <img src={getAvatarUrl(student.name, student.avatarUrl)} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          {!student.avatarUrl && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                          )}
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {editingId === student.id ? (
                          <div className="flex-1 flex items-center gap-2 mr-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-2 text-lg font-bold border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(student.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveEdit(student.id)}
                              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-sm"
                            >
                              Lưu
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-bold text-lg text-gray-800 truncate" title={student.name}>{student.name}</h3>
                        )}
                      </div>
                      
                      {editingId !== student.id && (
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {confirmDeleteId === student.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200 bg-rose-50 px-2 py-1 rounded-xl">
                              <span className="text-xs font-bold text-rose-500">Xóa?</span>
                              <button
                                onClick={() => deleteStudent(student.id)}
                                className="px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600"
                              >
                                Có
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(student.id);
                                  setEditName(student.name);
                                }}
                                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="Sửa tên"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(student.id)}
                                className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
