import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { isThisWeek, isThisMonth, format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';

type TimeFilter = 'week' | 'month' | 'all';

export const Statistics = () => {
  const { classes, students, records } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (record.classId !== selectedClassId) return false;
      
      const recordDate = new Date(record.timestamp);
      if (timeFilter === 'week') return isThisWeek(recordDate, { weekStartsOn: 1 });
      if (timeFilter === 'month') return isThisMonth(recordDate);
      return true;
    });
  }, [records, selectedClassId, timeFilter]);

  // Summary Stats
  const stats = useMemo(() => {
    let totalPlus = 0;
    let totalMinus = 0;
    
    filteredRecords.forEach(r => {
      if (r.points > 0) totalPlus += r.points;
      else totalMinus += Math.abs(r.points);
    });

    return {
      totalPlus,
      totalMinus,
      netPoints: totalPlus - totalMinus,
      totalActions: filteredRecords.length
    };
  }, [filteredRecords]);

  // Data for Trend Chart (Points per day)
  const trendData = useMemo(() => {
    const dailyData: Record<string, { date: string, plus: number, minus: number }> = {};
    
    filteredRecords.forEach(r => {
      const dateStr = format(new Date(r.timestamp), 'dd/MM', { locale: vi });
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, plus: 0, minus: 0 };
      }
      if (r.points > 0) dailyData[dateStr].plus += r.points;
      else dailyData[dateStr].minus += Math.abs(r.points);
    });

    return Object.values(dailyData).sort((a, b) => {
      // Simple sort by date string assuming same year/month for short periods
      // For better sorting, we should parse it back, but this is fine for display
      return a.date.localeCompare(b.date);
    });
  }, [filteredRecords]);

  // Data for Reasons Pie Chart
  const reasonsData = useMemo(() => {
    const reasons: Record<string, { name: string, value: number, type: 'plus' | 'minus' }> = {};
    
    filteredRecords.forEach(r => {
      if (!reasons[r.reason]) {
        reasons[r.reason] = { name: r.reason, value: 0, type: r.points > 0 ? 'plus' : 'minus' };
      }
      reasons[r.reason].value += Math.abs(r.points);
    });

    return Object.values(reasons).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 reasons
  }, [filteredRecords]);

  const COLORS_PLUS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'];
  const COLORS_MINUS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48'];

  if (classes.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center mt-20">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-indigo-100">
          <h2 className="text-4xl font-black text-indigo-900 mb-6">Thống kê</h2>
          <p className="text-xl text-gray-600 font-medium">Vui lòng tạo lớp học trước khi xem thống kê.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Thống kê điểm số
          </h2>
          <p className="text-gray-500 font-medium mt-1">Phân tích tình hình học tập của lớp</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>Lớp {c.name}</option>
            ))}
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tổng lượt</p>
            <p className="text-3xl font-black text-gray-900">{stats.totalActions}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Điểm cộng</p>
            <p className="text-3xl font-black text-emerald-600">+{stats.totalPlus}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Điểm trừ</p>
            <p className="text-3xl font-black text-rose-600">-{stats.totalMinus}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Điểm thực</p>
            <p className={`text-3xl font-black ${stats.netPoints > 0 ? 'text-emerald-600' : stats.netPoints < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
              {stats.netPoints > 0 ? '+' : ''}{stats.netPoints}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-6">Biểu đồ điểm số theo ngày</h3>
          {trendData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                  <Bar dataKey="plus" name="Điểm cộng" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="minus" name="Điểm trừ" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-2xl">
              Chưa có dữ liệu trong thời gian này
            </div>
          )}
        </div>

        {/* Reasons Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-6">Lý do phổ biến</h3>
          {reasonsData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reasonsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.type === 'plus' ? COLORS_PLUS[index % COLORS_PLUS.length] : COLORS_MINUS[index % COLORS_MINUS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value} điểm`, 'Tổng']}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontWeight: 600, fontSize: '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-2xl">
              Chưa có dữ liệu trong thời gian này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
