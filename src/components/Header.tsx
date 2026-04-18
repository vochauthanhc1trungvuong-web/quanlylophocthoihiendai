import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LogIn, LogOut } from 'lucide-react';

export const Header = () => {
  const { user, login, logout } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-end shrink-0 z-10 sticky top-0 shadow-sm">
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-gray-200 bg-white"
              referrerPolicy="no-referrer"
            />
            <span className="font-medium text-sm text-gray-700 max-w-[150px] truncate pr-2">
              {user.displayName || 'Người dùng'}
            </span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      ) : (
        <button 
          onClick={login}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          Đăng nhập bằng Google
        </button>
      )}
    </header>
  );
};
