/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Classes } from './pages/Classes';
import { Students } from './pages/Students';
import { Grading } from './pages/Grading';
import { Leaderboard } from './pages/Leaderboard';
import { Export } from './pages/Export';
import { Statistics } from './pages/Statistics';
import { Links } from './pages/Links';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('classes');
  const { isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Đang tải dữ liệu...</h2>
          <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'classes' && <Classes />}
        {activeTab === 'students' && <Students />}
        {activeTab === 'grading' && <Grading />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'links' && <Links />}
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'export' && <Export />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
