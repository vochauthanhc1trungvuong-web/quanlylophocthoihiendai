import React from 'react';
import { Users, GraduationCap, Star, Trophy, FileSpreadsheet, Activity, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { students } = useAppStore();
  const studentsWithoutAvatar = students.filter(s => !s.avatarUrl).length;

  const menuItems = [
    { id: 'classes', label: 'Lớp học', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500' },
    { id: 'students', label: 'Học sinh', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { id: 'grading', label: 'Chấm điểm', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500' },
    { id: 'leaderboard', label: 'Xếp hạng', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500' },
    { id: 'links', label: 'Liên kết', icon: LinkIcon, color: 'text-cyan-500', bg: 'bg-cyan-500' },
    { id: 'statistics', label: 'Thống kê', icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500' },
    { id: 'export', label: 'Xuất dữ liệu', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-600' },
  ];

  return (
    <div className="w-72 bg-indigo-900 border-r border-indigo-800 h-screen flex flex-col shrink-0 text-white shadow-2xl z-20 relative">
      <div className="p-8 border-b border-indigo-800/50 bg-indigo-950/50">
        <h1 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="leading-tight">Quản lý lớp học</span>
        </h1>
        <p className="text-sm text-indigo-300 mt-2 font-medium uppercase tracking-widest">Thân yêu</p>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold transition-all duration-300 relative overflow-hidden group',
                isActive
                  ? 'bg-white/10 text-white shadow-lg border border-white/10'
                  : 'text-indigo-200 hover:bg-white/5 hover:text-white'
              )}
            >
              {isActive && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", item.bg)} />
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                isActive ? item.bg : "bg-indigo-800/50",
                isActive ? "text-white" : item.color
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'students' && studentsWithoutAvatar > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-sm animate-pulse">
                  {studentsWithoutAvatar}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
