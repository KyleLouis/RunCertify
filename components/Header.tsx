
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m9.01 13.52-1.52-1.52a4 4 0 1 0 1.01-1.01l1.52 1.52"/><path d="m9.62 12.13 4.75 4.75"/><circle cx="12" cy="12" r="10"/><path d="M12 21a9 9 0 0 0 9-9h-1"/></svg>
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight hidden sm:block">RunCertify 证书系统</span>
        </div>
        
        <nav className="flex items-center gap-4 sm:gap-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${currentView === 'dashboard' || currentView === 'editor' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              参赛证书
            </button>
            <button 
              onClick={() => setView('volunteer_dashboard')}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${currentView === 'volunteer_dashboard' || currentView === 'volunteer_editor' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              志愿者证书
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="text-xs sm:text-sm font-black text-slate-400 hover:text-red-500 transition-colors"
          >
            退出
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
