import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Medal, AlertCircle, UserCircle, Crown } from 'lucide-react';
import { getLevel } from '../utils/levels';
import { cn } from '../lib/utils';
import { isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { getAvatarUrl } from '../utils/effects';

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type TopNFilter = '1' | '5' | '10' | 'all';
type SortOrder = 'high' | 'low';

export const Leaderboard = () => {
  const { classes, students, records } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [topNFilter, setTopNFilter] = useState<TopNFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('high');

  const filteredStudents = students.filter((s) => s.classId === selectedClassId);

  const leaderboardData = useMemo(() => {
    const pointsMap: Record<string, number> = {};
    
    filteredStudents.forEach(s => {
      pointsMap[s.id] = 0;
    });

    const relevantRecords = records.filter(r => {
      if (r.classId !== selectedClassId) return false;
      
      switch (timeFilter) {
        case 'today': return isToday(r.timestamp);
        case 'week': return isThisWeek(r.timestamp);
        case 'month': return isThisMonth(r.timestamp);
        case 'year': return isThisYear(r.timestamp);
        case 'all': return true;
      }
    });

    relevantRecords.forEach((r) => {
      if (pointsMap[r.studentId] !== undefined) {
        pointsMap[r.studentId] += r.points;
      }
    });

    return filteredStudents
      .map(s => ({
        ...s,
        points: pointsMap[s.id],
        level: getLevel(pointsMap[s.id])
      }))
      .sort((a, b) => sortOrder === 'high' ? b.points - a.points : a.points - b.points);

  }, [filteredStudents, records, selectedClassId, timeFilter, sortOrder]);

  const displayedLeaderboard = useMemo(() => {
    if (topNFilter === 'all') return leaderboardData;
    return leaderboardData.slice(0, parseInt(topNFilter, 10));
  }, [leaderboardData, topNFilter]);

  const topStudents = [...leaderboardData].sort((a, b) => b.points - a.points).slice(0, 3).filter(s => s.points > 0);
  const bottomStudents = [...leaderboardData].sort((a, b) => a.points - b.points).slice(0, 3).filter(s => s.points < 0);

  if (classes.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center mt-20">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-indigo-100">
          <h2 className="text-4xl font-black text-indigo-900 mb-6">Bảng xếp hạng</h2>
          <p className="text-xl text-gray-500">Vui lòng tạo lớp học trước nhé!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
        <div>
          <h2 className="text-3xl font-black text-indigo-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Bảng xếp hạng
          </h2>
          <p className="text-lg text-indigo-600/70 mt-2 font-medium">Vinh danh học sinh xuất sắc và theo dõi nề nếp.</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0 justify-end">
          <div className="w-full sm:w-32">
            <label className="block text-sm font-bold text-indigo-900 mb-2">Top:</label>
            <select
              value={topNFilter}
              onChange={(e) => setTopNFilter(e.target.value as TopNFilter)}
              className="w-full px-4 py-3 text-base font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="1">Top 1</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-sm font-bold text-indigo-900 mb-2">Sắp xếp:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full px-4 py-3 text-base font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="high">Cao điểm nhất</option>
              <option value="low">Thấp điểm nhất</option>
            </select>
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-sm font-bold text-indigo-900 mb-2">Thời gian:</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="w-full px-4 py-3 text-base font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-bold text-indigo-900 mb-2">Đang chọn lớp:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-3 text-base font-bold text-indigo-900 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
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
        </div>
      ) : (
        <div className="space-y-8">
          {/* Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Students */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl p-8 border-2 border-yellow-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Crown className="w-32 h-32 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3 relative z-10">
                <Trophy className="w-8 h-8 text-yellow-600" /> Học sinh nổi bật
              </h3>
              {topStudents.length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {topStudents.map((student, idx) => (
                    <div key={student.id} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner",
                        idx === 0 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900" : 
                        idx === 1 ? "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800" : 
                        "bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 font-bold text-xl text-gray-900">{student.name}</div>
                      <div className="font-black text-2xl text-amber-600">+{student.points}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-amber-700/70 font-medium italic relative z-10">Chưa có học sinh nào có điểm cộng.</p>
              )}
            </div>

            {/* Needs Reminder */}
            <div className="bg-gradient-to-br from-rose-50 to-red-100 rounded-3xl p-8 border-2 border-rose-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <AlertCircle className="w-32 h-32 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-rose-900 mb-6 flex items-center gap-3 relative z-10">
                <AlertCircle className="w-8 h-8 text-rose-600" /> Cần nhắc nhở
              </h3>
              {bottomStudents.length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {bottomStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
                      <div className="w-12 h-12 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shadow-inner">
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <div className="flex-1 font-bold text-xl text-gray-900">{student.name}</div>
                      <div className="font-black text-2xl text-rose-600">{student.points}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-rose-700/70 font-medium italic relative z-10">Tuyệt vời! Không có học sinh nào bị điểm trừ.</p>
              )}
            </div>
          </div>

          {/* Full List */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b-2 border-gray-100 bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900">Bảng điểm chi tiết</h3>
            </div>
            <div className="divide-y-2 divide-gray-50">
              {displayedLeaderboard.map((student, idx) => (
                <div key={student.id} className="p-5 flex items-center gap-6 hover:bg-indigo-50/50 transition-colors">
                  <div className="w-12 text-center font-black text-2xl text-gray-300">
                    #{sortOrder === 'high' ? idx + 1 : leaderboardData.length - idx}
                  </div>
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0 shadow-inner overflow-hidden">
                    <img src={getAvatarUrl(student.name, student.avatarUrl)} alt={student.name} className="w-14 h-14 rounded-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-gray-900">{student.name}</h4>
                    <span className={cn("text-sm px-3 py-1 rounded-full font-bold border-2 mt-2 inline-block", student.level.bg, student.level.color, student.level.border)}>
                      {student.level.name}
                    </span>
                  </div>
                  <div className={cn(
                    "text-3xl font-black w-24 text-right",
                    student.points > 0 ? "text-emerald-600" : student.points < 0 ? "text-rose-600" : "text-gray-400"
                  )}>
                    {student.points > 0 ? `+${student.points}` : student.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
