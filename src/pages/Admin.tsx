import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ShieldCheck, UserCog, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '../types';

export const Admin = () => {
  const { userProfiles, currentUserProfile, updateUserRole } = useAppStore();

  const handleRoleChange = (uid: string, newRole: 'admin' | 'teacher' | 'viewer') => {
    updateUserRole(uid, newRole);
  };

  const roleColors = {
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    teacher: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    viewer: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const roleLabels = {
    admin: 'Quản trị viên (Admin)',
    teacher: 'Giáo viên',
    viewer: 'Người xem',
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Quản trị viên & Phân quyền
          </h1>
          <p className="text-gray-500 mt-2">Quản lý tài khoản và quyền truy cập vào hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCog className="w-4 h-4 text-indigo-500" />
            Tổng số tài khoản: <strong className="text-gray-900">{userProfiles.length}</strong>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Người dùng</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Email</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Ngày tham gia</th>
                <th className="py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider w-48">Quyền hiện tại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userProfiles.sort((a, b) => b.createdAt - a.createdAt).map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'User')}`} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{profile.displayName || 'Người dùng ẩn danh'}</div>
                        {currentUserProfile?.id === profile.id && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Bạn</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {profile.email || 'Không có email'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {profile.createdAt ? format(profile.createdAt, 'dd/MM/yyyy HH:mm') : '---'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value as any)}
                      className={`w-full appearance-none outline-none font-semibold text-sm px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer ${roleColors[profile.role]}`}
                    >
                      <option value="admin">{roleLabels['admin']}</option>
                      <option value="teacher">{roleLabels['teacher']}</option>
                      <option value="viewer">{roleLabels['viewer']}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
