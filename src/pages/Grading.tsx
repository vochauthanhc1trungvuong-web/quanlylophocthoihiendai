import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { UserCircle, History, Star, PlusCircle, MinusCircle, Search } from 'lucide-react';
import { getLevel } from '../utils/levels';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { getAvatarUrl, playSuccessEffect, playErrorEffect } from '../utils/effects';

const QUICK_ACTIONS = [
  { points: 1, reason: 'Phát biểu tốt', color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-400 hover:text-white border-emerald-300 shadow-emerald-200' },
  { points: 2, reason: 'Làm bài tốt', color: 'bg-teal-100 text-teal-800 hover:bg-teal-500 hover:text-white border-teal-300 shadow-teal-200' },
  { points: 3, reason: 'Xuất sắc', color: 'bg-blue-100 text-blue-800 hover:bg-blue-500 hover:text-white border-blue-300 shadow-blue-200' },
  { points: -1, reason: 'Nói chuyện', color: 'bg-orange-100 text-orange-800 hover:bg-orange-500 hover:text-white border-orange-300 shadow-orange-200' },
  { points: -2, reason: 'Không làm bài', color: 'bg-rose-100 text-rose-800 hover:bg-rose-500 hover:text-white border-rose-300 shadow-rose-200' },
  { points: -3, reason: 'Mất trật tự', color: 'bg-red-100 text-red-800 hover:bg-red-600 hover:text-white border-red-300 shadow-red-200' },
];

export const Grading = () => {
  const { classes, students, records, addRecord } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom point states
  const [plusPoints, setPlusPoints] = useState<number>(1);
  const [plusReason, setPlusReason] = useState<string>('');
  
  const [minusPoints, setMinusPoints] = useState<number>(1);
  const [minusReason, setMinusReason] = useState<string>('');

  const filteredStudents = students.filter((s) => s.classId === selectedClassId);
  const searchedStudents = filteredStudents.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const studentsWithoutAvatar = filteredStudents.filter((s) => !s.avatarUrl).length;

  // Calculate total points for each student
  const studentPoints = useMemo(() => {
    const pointsMap: Record<string, number> = {};
    records.forEach((r) => {
      pointsMap[r.studentId] = (pointsMap[r.studentId] || 0) + r.points;
    });
    return pointsMap;
  }, [records]);

  const handleQuickAction = (studentId: string, points: number, reason: string) => {
    addRecord({
      studentId,
      classId: selectedClassId,
      points,
      reason,
    });
    if (points > 0) playSuccessEffect();
    else if (points < 0) playErrorEffect();
  };

  const handleCustomPlus = (studentId: string) => {
    if (plusReason.trim() && plusPoints > 0) {
      addRecord({
        studentId,
        classId: selectedClassId,
        points: plusPoints,
        reason: plusReason.trim(),
      });
      playSuccessEffect();
      setPlusReason('');
      setPlusPoints(1);
    }
  };

  const handleCustomMinus = (studentId: string) => {
    if (minusReason.trim() && minusPoints > 0) {
      addRecord({
        studentId,
        classId: selectedClassId,
        points: -minusPoints,
        reason: minusReason.trim(),
      });
      playErrorEffect();
      setMinusReason('');
      setMinusPoints(1);
    }
  };

  if (classes.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center mt-20">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-indigo-100">
          <h2 className="text-4xl font-black text-indigo-900 mb-6">Cộng / Trừ điểm</h2>
          <p className="text-xl text-gray-500">Vui lòng tạo lớp học và thêm học sinh trước nhé!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
        <div>
          <h2 className="text-3xl font-black text-indigo-900 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            Chấm điểm Nề nếp
          </h2>
          <p className="text-lg text-indigo-600/70 mt-2 font-medium">Đánh giá nhanh thái độ học tập trong tiết học.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <label className="block text-base font-bold text-indigo-900 mb-2">Tìm học sinh:</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                placeholder="Nhập tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-indigo-300 placeholder:font-medium"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
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
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-gray-500 border-2 border-dashed border-gray-200">
          <p className="text-2xl font-bold">Lớp này chưa có học sinh nào.</p>
          <p className="text-lg mt-2">Hãy vào mục "Học sinh" để thêm danh sách nhé!</p>
        </div>
      ) : (
        <>
          {studentsWithoutAvatar > 0 && (
            <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-start gap-4 text-amber-800 shadow-sm animate-in fade-in duration-500">
              <div className="p-3 bg-amber-100 rounded-2xl shrink-0">
                <UserCircle className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-xl text-amber-900">Mẹo nhỏ: Cập nhật ảnh đại diện</h3>
                <p className="text-lg mt-1 font-medium text-amber-800/80">
                  Lớp hiện có <strong className="text-amber-700">{studentsWithoutAvatar}</strong> học sinh chưa có ảnh. 
                  Hãy sang mục <strong>Học sinh</strong> để tải ảnh lên, giúp việc chấm điểm sinh động và dễ nhận diện hơn nhé!
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {searchedStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <p className="text-xl font-bold">Không tìm thấy học sinh nào phù hợp.</p>
            </div>
          ) : (
            searchedStudents.map((student) => {
              const totalPoints = studentPoints[student.id] || 0;
              const level = getLevel(totalPoints);
              const isSelected = selectedStudentId === student.id;

            return (
              <div
                key={student.id}
                className={cn(
                  "bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300",
                  isSelected 
                    ? "border-indigo-500 shadow-xl shadow-indigo-200 ring-4 ring-indigo-500/20 scale-[1.02] z-10 relative" 
                    : "border-gray-100 hover:border-indigo-300 hover:shadow-md"
                )}
              >
                <div 
                  className="p-5 flex items-center gap-5 cursor-pointer"
                  onClick={() => {
                    setSelectedStudentId(isSelected ? null : student.id);
                    setPlusReason('');
                    setPlusPoints(1);
                    setMinusReason('');
                    setMinusPoints(1);
                  }}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner transition-colors overflow-hidden",
                    isSelected ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <img src={getAvatarUrl(student.name, student.avatarUrl)} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl text-gray-900 truncate" title={student.name}>{student.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn("text-sm px-3 py-1 rounded-full font-bold border-2", level.bg, level.color, level.border)}>
                        {level.name}
                      </span>
                      <span className={cn(
                        "text-lg font-black",
                        totalPoints > 0 ? "text-emerald-600" : totalPoints < 0 ? "text-rose-600" : "text-gray-500"
                      )}>
                        {totalPoints > 0 ? `+${totalPoints}` : totalPoints} đ
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="px-5 pb-5 pt-3 border-t-2 border-indigo-50 bg-indigo-50/30 animate-in slide-in-from-top-2">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(student.id, action.points, action.reason);
                          }}
                          className={cn(
                            "py-3 px-2 rounded-2xl border-2 font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0",
                            action.color
                          )}
                          title={action.reason}
                        >
                          <span className="text-2xl leading-none">{action.points > 0 ? `+${action.points}` : action.points}</span>
                          <span className="text-[11px] leading-tight text-center px-1 opacity-90 line-clamp-1 uppercase tracking-wider mt-1">{action.reason}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Actions: Plus and Minus separated */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cộng điểm */}
                      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 shadow-inner">
                        <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <PlusCircle className="w-4 h-4" /> Điểm cộng khác
                        </h4>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-emerald-600 text-xl">+</span>
                            <input 
                              type="number" 
                              min="1"
                              value={plusPoints} 
                              onChange={e => setPlusPoints(Math.max(1, Number(e.target.value)))}
                              className="w-full h-12 border-2 border-emerald-200 rounded-xl font-black text-center text-xl focus:border-emerald-500 outline-none text-emerald-700 bg-white"
                            />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Lý do cộng..." 
                            value={plusReason}
                            onChange={e => setPlusReason(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 outline-none font-medium text-emerald-900 placeholder:text-emerald-400 bg-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomPlus(student.id);
                            }}
                          />
                          <button 
                            onClick={() => handleCustomPlus(student.id)}
                            disabled={!plusReason.trim() || plusPoints <= 0}
                            className="w-full py-3 mt-1 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            Lưu điểm cộng
                          </button>
                        </div>
                      </div>

                      {/* Trừ điểm */}
                      <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 shadow-inner">
                        <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MinusCircle className="w-4 h-4" /> Điểm trừ khác
                        </h4>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-rose-600 text-xl">-</span>
                            <input 
                              type="number" 
                              min="1"
                              value={minusPoints} 
                              onChange={e => setMinusPoints(Math.max(1, Number(e.target.value)))}
                              className="w-full h-12 border-2 border-rose-200 rounded-xl font-black text-center text-xl focus:border-rose-500 outline-none text-rose-700 bg-white"
                            />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Lý do trừ..." 
                            value={minusReason}
                            onChange={e => setMinusReason(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 outline-none font-medium text-rose-900 placeholder:text-rose-400 bg-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomMinus(student.id);
                            }}
                          />
                          <button 
                            onClick={() => handleCustomMinus(student.id)}
                            disabled={!minusReason.trim() || minusPoints <= 0}
                            className="w-full py-3 mt-1 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            Lưu điểm trừ
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent History for this student */}
                    <div className="mt-4 bg-white rounded-2xl p-4 border border-indigo-100 shadow-inner">
                      <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" /> Lịch sử hôm nay
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {records
                          .filter(r => r.studentId === student.id)
                          .sort((a, b) => b.timestamp - a.timestamp)
                          .slice(0, 4)
                          .map(record => (
                            <div key={record.id} className="flex items-center justify-between text-sm bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <span className="text-gray-500 font-medium">{format(record.timestamp, 'HH:mm')}</span>
                              <span className="text-gray-800 font-bold truncate mx-3 flex-1">{record.reason}</span>
                              <span className={cn("font-black text-base", record.points > 0 ? "text-emerald-600" : "text-rose-600")}>
                                {record.points > 0 ? `+${record.points}` : record.points}
                              </span>
                            </div>
                          ))}
                        {records.filter(r => r.studentId === student.id).length === 0 && (
                          <div className="text-sm text-gray-400 italic text-center py-4">Chưa có ghi nhận nào</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
        </>
      )}
    </div>
  );
};
