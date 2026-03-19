
import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import Header from './components/Header';
import Certificate from './components/Certificate';
import VolunteerCertificate from './components/VolunteerCertificate';
import { AppView, FinisherData, VolunteerData, CertificateStyle, Language, Orientation, CertificateType } from './types';
import { generateInspirationalQuote, generateCustomBadge, generateBatchInspirationalQuotes } from './geminiService';
import { api } from './src/api';

const INITIAL_DATA: FinisherData[] = [
  {
    id: '1',
    name: '张杰瑞',
    bibNumber: 'A2045',
    raceName: '2024 城市马拉松',
    category: '全程马拉松 (42.195km)',
    finishTime: '03:45:21',
    netTime: '03:45:21',
    genderRank: '142 / 1200',
    overallRank: '312 / 4500',
    date: '2024年10月24日',
    inspirationalQuote: '亲爱的张杰瑞：奔跑是不设限的自由，脚步丈量的是勇气的疆域。',
  },
  {
    id: '2',
    name: '李安娜',
    bibNumber: 'B1088',
    raceName: '2024 城市马拉松',
    category: '半程马拉松 (21.0975km)',
    finishTime: '01:52:10',
    netTime: '01:51:45',
    genderRank: '85 / 800',
    overallRank: '520 / 3000',
    date: '2024年10月24日',
    inspirationalQuote: '亲爱的李安娜：每一次起跑，都是对平凡生活的一次超越。',
  }
];

const INITIAL_STYLE: CertificateStyle = {
  type: 'finisher',
  template: 'pku',
  primaryColor: '#9c1a1a',
  secondaryColor: '#f59e0b',
  language: 'zh',
  orientation: 'portrait'
};

const INITIAL_VOLUNTEER_DATA: VolunteerData[] = [
  {
    id: 'v1',
    name: '陈小明',
    raceName: '2026 戈赛',
    role: '医疗志愿者',
    serviceHours: '',
    date: '2026年03月08日',
    certificateNumber: 'PHBS-VOL-2026-S1-001'
  }
];

const DEFAULT_MOTTOS_ZH = [
  "每一步都是对自我的超越，终点只是新旅程的起点。",
  "不畏路长，唯见心远。你的坚持，终将闪耀。",
  "奔跑不在于速度，而在于永不言弃的灵魂。",
  "用脚步丈量大地，用汗水致敬平凡生活中的英雄梦。"
];

const DEFAULT_MOTTOS_EN = [
  "Every step is a victory over yourself. The finish line is just the beginning.",
  "Your limit exists only in your imagination. Keep moving forward.",
  "Running is about the soul that never gives up, not just the speed.",
  "Measure the world with your feet and honor your dreams with sweat."
];

const HomeView = ({ onSearch, goToLogin, searchError, races }: { onSearch: (name: string, race: string) => void, goToLogin: () => void, searchError: string | null, races: string[] }) => {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState(races[0] || '');

  useEffect(() => {
    if (races.length > 0 && !selectedRace) {
      setSelectedRace(races[0]);
    }
  }, [races]);
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Marathon Runner"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/60 to-slate-900"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-6 text-center">
          <div className="inline-block bg-indigo-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 animate-pulse">
            RunCertify Official Platform
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
            记录你的<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">荣耀时刻</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-medium">
            专业马拉松完赛证书查询系统。选择赛事并输入您的姓名，即刻获取您的专属完赛勋章与高清证书。
          </p>
          
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 p-2 rounded-2xl sm:rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="relative w-full sm:w-auto shrink-0">
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  className="w-full sm:w-48 bg-white/10 hover:bg-white/20 transition-colors border-none px-6 py-4 pr-10 text-white font-bold focus:ring-0 outline-none text-sm rounded-xl sm:rounded-full appearance-none cursor-pointer"
                >
                  {races.map(race => (
                    <option key={race} value={race} className="bg-slate-800 text-white">{race}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-white/20 shrink-0"></div>
              
              <input 
                type="text" 
                placeholder="请输入参赛选手姓名" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(name, selectedRace)}
                className="flex-1 w-full bg-transparent border-none px-4 py-4 text-white font-bold placeholder:text-white/40 focus:ring-0 outline-none text-base sm:text-lg min-w-0"
              />
              
              <button 
                onClick={() => onSearch(name, selectedRace)}
                className="w-full sm:w-auto shrink-0 bg-indigo-500 hover:bg-indigo-400 text-white font-black px-8 py-4 rounded-xl sm:rounded-full transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                查询成绩
              </button>
            </div>
            {searchError && (
              <div className="mt-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-sm font-bold animate-bounce">
                ⚠️ {searchError}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 flex-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-20">
            <div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">官方认证</h3>
              <p className="text-slate-500 font-medium">所有数据均同步自计时芯片，真实有效，永久可查。</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">AI 智能勋章</h3>
              <p className="text-slate-500 font-medium">采用最新 Gemini 技术，为每位完赛选手生成专属格言与勋章。</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-orange-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">高清导出</h3>
              <p className="text-slate-500 font-medium">支持 4K 级别高清图片下载与打印，满足社交分享与收藏需求。</p>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-200 text-center">
            <button 
              onClick={goToLogin}
              className="text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
            >
              管理端入口
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const LoginView = ({ onLogin, onBack }: { onLogin: (token: string) => void, onBack: () => void }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await api.login(account, password);
      localStorage.setItem('token', token);
      onLogin(token);
    } catch {
      setError('账号或密码错误，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <button onClick={onBack} className="text-white/50 hover:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          返回首页
        </button>
      </div>
      <div className="w-full max-w-md bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl p-6 sm:p-10 relative z-10">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4 sm:mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">RunCertify 登录</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">赛事管理员管理后台</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div>
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase block mb-1 sm:mb-2 tracking-widest">账号</label>
            <input 
              type="text" 
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase block mb-1 sm:mb-2 tracking-widest">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
              placeholder="请输入密码"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-black text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full py-3.5 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black shadow-lg sm:shadow-xl shadow-indigo-100 sm:shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-sm sm:text-base"
          >
            立即登录
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardView = ({ 
  finishers, 
  setView, 
  setSelectedFinisher, 
  selectedIds, 
  toggleSelection, 
  toggleAll, 
  onBatchDownload,
  onBatchDelete,
  isDownloadingZip,
  races,
  onDeleteFinisher,
  style,
  setStyle
}: { 
  finishers: FinisherData[], 
  setView: (v: AppView) => void,
  setSelectedFinisher: (f: FinisherData) => void,
  selectedIds: Set<string>,
  toggleSelection: (id: string) => void,
  toggleAll: (ids: string[]) => void, 
  onBatchDownload: () => void,
  onBatchDelete: () => void,
  isDownloadingZip: boolean,
  races: string[],
  onDeleteFinisher: (id: string) => void,
  style: CertificateStyle,
  setStyle: (s: CertificateStyle) => void
}) => {
  const [raceFilter, setRaceFilter] = useState('all');
  
  const filteredFinishers = raceFilter === 'all' 
    ? finishers 
    : finishers.filter(f => f.raceName === raceFilter);

  const selectedInView = filteredFinishers.filter(f => selectedIds.has(f.id));
  const isAllSelected = filteredFinishers.length > 0 && filteredFinishers.every(f => selectedIds.has(f.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">参赛选手成绩管理</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">管理赛事成绩并为选手生成个性化证书。</p>
          
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">赛事筛选:</span>
            <select 
              value={raceFilter}
              onChange={(e) => setRaceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部赛事</option>
              {races.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {selectedInView.length > 0 ? (
            <>
              <button 
                onClick={onBatchDelete}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                删除选中 ({selectedInView.length})
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
              </button>
              <button 
                onClick={onBatchDownload}
                disabled={isDownloadingZip}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {isDownloadingZip ? '正在打包...' : `导出选中的证书 (${selectedInView.length})`}
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </button>
            </>
          ) : null}
          <button 
            onClick={() => {
              setStyle({ ...style, type: 'finisher' });
              setView('batch_import');
            }}
            className="flex-1 sm:flex-none border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl transition-all text-sm sm:text-base"
          >
            批量录入
          </button>
          <button 
            onClick={() => {
              setSelectedFinisher({...INITIAL_DATA[0], id: Math.random().toString(36).substr(2, 9), name: '', inspirationalQuote: '', logoUrl: undefined, themeImageUrl: undefined, runnerImageUrl: undefined});
              setView('editor');
            }}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
          >
            录入单人
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-x-auto border border-slate-100">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 sm:py-4 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded accent-indigo-600"
                  checked={isAllSelected}
                  onChange={() => toggleAll(filteredFinishers.map(f => f.id))}
                />
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">选手</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">参赛号</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">项目</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">成绩</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFinishers.length > 0 ? filteredFinishers.map((f) => (
              <tr key={f.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.has(f.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-4 py-3 sm:py-4">
                   <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded accent-indigo-600"
                    checked={selectedIds.has(f.id)}
                    onChange={() => toggleSelection(f.id)}
                  />
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">{f.name || '未录入姓名'}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{f.raceName}</div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-indigo-600 font-bold text-sm sm:text-base">{f.bibNumber}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{f.category}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-700 text-sm sm:text-base">{f.finishTime}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <button 
                    onClick={async () => {
                      try {
                        const fullData = await api.getFinisherById(f.id);
                        setSelectedFinisher(fullData);
                        setStyle({ ...style, type: 'finisher' });
                        setView('preview');
                      } catch (e) {
                        console.error('Failed to fetch finisher details', e);
                      }
                    }}
                    className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    预览证书
                  </button>
                  <button onClick={() => onDeleteFinisher(f.id)} className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-700 ml-3">删除</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">暂无符合条件的选手记录。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BatchImportView = ({ 
  onSave, 
  onCancel,
  logoInputRef,
  themeInputRef,
  signatureInputRef,
  initialStyle,
  isProcessing,
  volunteers
}: { 
  onSave: (common: any, rows: any[], style: CertificateStyle) => void, 
  onCancel: () => void,
  logoInputRef: React.RefObject<HTMLInputElement | null>,
  themeInputRef: React.RefObject<HTMLInputElement | null>,
  signatureInputRef: React.RefObject<HTMLInputElement | null>,
  initialStyle: CertificateStyle,
  isProcessing: { current: number, total: number } | null,
  volunteers: VolunteerData[]
}) => {
  const isVolunteer = initialStyle.type === 'volunteer';
  const [common, setCommon] = useState({
    raceName: isVolunteer ? '2026 戈赛' : '2025 城市马拉松',
    date: isVolunteer ? '2026年03月08日' : '2025年10月24日',
    logoUrl: '',
    themeImageUrl: '',
    signatureUrl: '',
    year: '2026',
    session: 'S1'
  });
  const [batchStyle, setBatchStyle] = useState<CertificateStyle>({ ...initialStyle });
  const [rawData, setRawData] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  useEffect(() => {
    const lines = rawData.split('\n').filter(l => l.trim() !== '');
    const rows = lines.map(line => {
      const parts = line.split(/[\t,，\s]+/).map(p => p.trim());
      if (isVolunteer) {
        return {
          name: parts[0] || '',
          role: parts[1] || '赛事志愿者'
        };
      }
      return {
        name: parts[0] || '',
        bibNumber: parts[1] || '',
        finishTime: parts[2] || '',
        overallRank: parts[3] || '',
        genderRank: parts[4] || '',
        category: parts[5] || '全程马拉松'
      };
    }).filter(r => r.name !== '');
    setParsedRows(rows);
  }, [rawData, isVolunteer]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCommon({...common, logoUrl: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const handleThemeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCommon({...common, themeImageUrl: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCommon({...common, signatureUrl: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative">
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center">
           <div className="bg-white rounded-[40px] p-10 max-sm w-full shadow-2xl">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">AI 智能处理中</h2>
              <p className="text-slate-500 font-medium mb-6">正在批量生成选手的个性化名言<br/>({isProcessing.current} / {isProcessing.total})</p>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(isProcessing.current / isProcessing.total) * 100}%` }}></div>
              </div>
           </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isVolunteer ? '批量导入志愿者' : '批量导入选手成绩'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isVolunteer ? '一次性为大规模志愿者配置证书信息与视觉风格。' : '一次性为大规模参赛选手配置证书信息与视觉风格。'}
          </p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-900 font-black text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-slate-900 transition-all">取消导入</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-100">01</span>
              通用赛事信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">赛事全称</label>
                <input 
                  type="text" 
                  value={common.raceName}
                  onChange={e => setCommon({...common, raceName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">举办日期</label>
                <input 
                  type="text" 
                  value={common.date}
                  onChange={e => setCommon({...common, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              {isVolunteer && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">年份</label>
                    <input 
                      type="text" 
                      value={common.year}
                      onChange={e => setCommon({...common, year: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">期数</label>
                    <input 
                      type="text" 
                      value={common.session}
                      onChange={e => setCommon({...common, session: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button onClick={() => logoInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all">
                  <div className="h-10 flex items-center justify-center">
                    {common.logoUrl ? <img src={common.logoUrl} className="h-full object-contain" /> : <svg width="24" height="24" fill="currentColor" className="text-indigo-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6V6h12v13zM11 14l-2-2.5L6 16h12l-4.5-6z"/></svg>}
                  </div>
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">上传 Logo</span>
                </button>
                <button onClick={() => themeInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-orange-50/50 p-4 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-all">
                  <div className="h-10 flex items-center justify-center">
                    {common.themeImageUrl ? <img src={common.themeImageUrl} className="h-full object-contain" /> : <svg width="24" height="24" fill="currentColor" className="text-orange-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>}
                  </div>
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-tighter">上传背景图</span>
                </button>
                <button onClick={() => signatureInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all">
                  <div className="h-10 flex items-center justify-center">
                    {common.signatureUrl ? <img src={common.signatureUrl} className="h-full object-contain" /> : <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M4 20h16M7 14l3-3 8-8a2.121 2.121 0 0 1 3 3l-8 8-3 3z"/></svg>}
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">上传签名</span>
                </button>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <input ref={themeInputRef} type="file" accept="image/*" onChange={handleThemeUpload} className="hidden" />
              <input ref={signatureInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-100">02</span>
              证书视觉设置
            </h2>
            <div className="space-y-6">
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">模板选择</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pku', 'classic', 'modern', 'minimal', 'energetic'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => {
                        const newStyle: CertificateStyle = {...batchStyle, template: t};
                        if (t === 'pku') {
                          newStyle.primaryColor = '#9c1a1a';
                          newStyle.secondaryColor = '#f59e0b';
                        }
                        setBatchStyle(newStyle);
                      }}
                      className={`py-2 px-3 rounded-xl border-2 text-[10px] font-black transition-all ${batchStyle.template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}
                    >
                      {t === 'classic' ? '经典' : t === 'modern' ? '现代' : t === 'minimal' ? '极简' : t === 'energetic' ? '动感' : '北大'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">语言</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {(['zh', 'en'] as Language[]).map(l => (
                        <button key={l} onClick={() => setBatchStyle({...batchStyle, language: l})} className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${batchStyle.language === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                          {l === 'zh' ? '中文' : 'ENG'}
                        </button>
                      ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">版式</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {(['landscape', 'portrait'] as Orientation[]).map(o => (
                        <button key={o} onClick={() => setBatchStyle({...batchStyle, orientation: o})} className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${batchStyle.orientation === o ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                          {o === 'landscape' ? '横版' : '竖版'}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-100">03</span>
                  数据录入
                </h2>
                <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">录入格式示例 (每行一人):</p>
                  <code className="text-[11px] font-mono font-bold text-indigo-600 block">
                    {isVolunteer ? (
                      <>
                        张杰瑞 赛事志愿者<br/>
                        李安娜 医疗志愿者
                      </>
                    ) : (
                      <>
                        张杰瑞 A2045 03:45:21 312 300 全程马拉松<br/>
                        李安娜 B1088 01:52:10 520 200 半程马拉松
                      </>
                    )}
                  </code>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest shrink-0">
                Ready: {parsedRows.length} 名{isVolunteer ? '志愿者' : '选手'}
              </span>
            </div>
            
            <textarea 
              value={rawData}
              onChange={e => setRawData(e.target.value)}
              placeholder={isVolunteer ? "请输入志愿者数据，字段间用空格或制表符分隔 (姓名 岗位)" : "请输入选手数据，字段间用空格或制表符分隔"}
              className="flex-1 w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 font-mono text-sm focus:border-indigo-500 outline-none transition-all resize-none shadow-inner mb-6"
            ></textarea>

            <button 
              disabled={parsedRows.length === 0 || isProcessing !== null}
              onClick={() => onSave(common, parsedRows, batchStyle)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black px-12 py-4 rounded-2xl shadow-2xl transition-all"
            >
              {isVolunteer ? '确认导入志愿者' : '确认导入并自动生成名言'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorView = ({ 
  selectedFinisher, 
  setSelectedFinisher, 
  style, 
  setStyle, 
  badgeTheme, 
  setBadgeTheme, 
  isGenerating, 
  handleGenerateAI, 
  handleLogoUpload, 
  handleThemeImageUpload,
  handleRunnerImageUpload,
  handleSignatureUpload,
  logoInputRef, 
  themeInputRef,
  runnerInputRef,
  signatureInputRef,
  setView, 
  setFinishers,
  finishers,
  certificateRef,
  onDeleteFinisher
}: {
  selectedFinisher: FinisherData,
  setSelectedFinisher: (f: FinisherData) => void,
  style: CertificateStyle,
  setStyle: (s: CertificateStyle) => void,
  badgeTheme: string,
  setBadgeTheme: (t: string) => void,
  isGenerating: boolean,
  handleGenerateAI: () => void,
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleThemeImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleRunnerImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  logoInputRef: React.RefObject<HTMLInputElement | null>,
  themeInputRef: React.RefObject<HTMLInputElement | null>,
  runnerInputRef: React.RefObject<HTMLInputElement | null>,
  signatureInputRef: React.RefObject<HTMLInputElement | null>,
  setView: (v: AppView) => void,
  setFinishers: React.Dispatch<React.SetStateAction<FinisherData[]>>,
  finishers: FinisherData[],
  certificateRef: React.RefObject<HTMLDivElement | null>,
  onDeleteFinisher: (id: string) => void
}) => {
  const getPrefix = (lang: Language) => lang === 'zh' ? '亲爱的' : 'Dear ';
  const getSuffix = (lang: Language) => lang === 'zh' ? '：' : ': ';

  useEffect(() => {
    if (selectedFinisher.styleJson) {
      try { setStyle(JSON.parse(selectedFinisher.styleJson)); } catch(e) {}
    }
  }, [selectedFinisher.id]);

  const handleNameChange = (newName: string) => {
    const lang = style.language;
    const prefix = getPrefix(lang);
    const suffix = getSuffix(lang);
    const currentQuote = selectedFinisher.inspirationalQuote || '';
    
    // Pick a default motto to cycle through if needed
    const defaultMottos = lang === 'zh' ? DEFAULT_MOTTOS_ZH : DEFAULT_MOTTOS_EN;
    const defaultMotto = defaultMottos[0]; 

    const oldGreeting = `${prefix}${selectedFinisher.name}${suffix}`;
    const newGreeting = `${prefix}${newName}${suffix}`;

    let updatedQuote = currentQuote;

    if (!currentQuote || currentQuote.trim() === '' || currentQuote === oldGreeting) {
      // If quote is empty or was just the previous greeting, set it to the new full quote
      updatedQuote = `${newGreeting}${defaultMotto}`;
    } else if (currentQuote.startsWith(oldGreeting)) {
      // If it starts with the old greeting, just replace the greeting part
      updatedQuote = currentQuote.replace(oldGreeting, newGreeting);
    } else if (!currentQuote.includes(prefix) && !currentQuote.includes(suffix)) {
      // If there's no greeting at all, prepend the new one
      updatedQuote = `${newGreeting}${currentQuote}`;
    }

    setSelectedFinisher({
      ...selectedFinisher,
      name: newName,
      inspirationalQuote: updatedQuote
    });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)] overflow-hidden">
      {/* Scrollable Form Panel */}
      <div className="w-full lg:w-[450px] shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
        
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px]">01</span>
            选手成绩录入
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">选手姓名</label>
              <input 
                type="text" 
                value={selectedFinisher.name} 
                onChange={e => handleNameChange(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="输入选手姓名..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">参赛号码</label>
                <input type="text" value={selectedFinisher.bibNumber} onChange={e => setSelectedFinisher({...selectedFinisher, bibNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">项目类别</label>
                <input type="text" value={selectedFinisher.category} onChange={e => setSelectedFinisher({...selectedFinisher, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">枪声成绩</label>
                <input type="text" value={selectedFinisher.finishTime} onChange={e => setSelectedFinisher({...selectedFinisher, finishTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">净计时成绩</label>
                <input type="text" value={selectedFinisher.netTime} onChange={e => setSelectedFinisher({...selectedFinisher, netTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">综合排名</label>
                <input type="text" value={selectedFinisher.overallRank} onChange={e => setSelectedFinisher({...selectedFinisher, overallRank: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">性别排名</label>
                <input type="text" value={selectedFinisher.genderRank} onChange={e => setSelectedFinisher({...selectedFinisher, genderRank: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Race Identity */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px]">02</span>
            赛事背景信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">赛事全称</label>
              <input type="text" value={selectedFinisher.raceName} onChange={e => setSelectedFinisher({...selectedFinisher, raceName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">举办日期</label>
              <input type="text" value={selectedFinisher.date} onChange={e => setSelectedFinisher({...selectedFinisher, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            
            <div className="grid grid-cols-4 gap-3 pt-2">
              <button onClick={() => logoInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedFinisher.logoUrl ? <img src={selectedFinisher.logoUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM11 14l-2-2.5L6 16h12l-4.5-6z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">赛事Logo</span>
              </button>
              <button onClick={() => themeInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-orange-50 hover:border-orange-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedFinisher.themeImageUrl ? <img src={selectedFinisher.themeImageUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">活动底图</span>
              </button>
              <button onClick={() => runnerInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedFinisher.runnerImageUrl ? <img src={selectedFinisher.runnerImageUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">选手风采照</span>
              </button>
              <button onClick={() => signatureInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedFinisher.signatureUrl ? <img src={selectedFinisher.signatureUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" viewBox="0 0 24 24"><path d="M4 20h16M7 14l3-3 8-8a2.121 2.121 0 0 1 3 3l-8 8-3 3z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">手写签名</span>
              </button>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <input ref={themeInputRef} type="file" accept="image/*" onChange={handleThemeImageUpload} className="hidden" />
            <input ref={runnerInputRef} type="file" accept="image/*" onChange={handleRunnerImageUpload} className="hidden" />
            <input ref={signatureInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
          </div>
        </div>

        {/* Section 3: Visual Settings */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px]">03</span>
            证书样式定制
          </h2>
          <div className="space-y-5">
             <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">设计模板</label>
              <div className="grid grid-cols-5 gap-2">
                {(['pku', 'classic', 'modern', 'minimal', 'energetic'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => {
                      const newStyle: CertificateStyle = {...style, template: t};
                      if (t === 'pku') {
                        newStyle.primaryColor = '#9c1a1a';
                        newStyle.secondaryColor = '#f59e0b';
                      }
                      setStyle(newStyle);
                    }}
                    className={`py-2 rounded-xl border-2 text-[10px] font-black transition-all ${style.template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}
                  >
                    {t === 'classic' ? '经典' : t === 'modern' ? '现代' : t === 'minimal' ? '极简' : t === 'energetic' ? '动感' : '北大'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">主色调</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={style.primaryColor} onChange={e => setStyle({...style, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden" />
                    <span className="text-xs font-mono font-bold text-slate-400">{style.primaryColor}</span>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">辅助色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={style.secondaryColor} onChange={e => setStyle({...style, secondaryColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden" />
                    <span className="text-xs font-mono font-bold text-slate-400">{style.secondaryColor}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">语言</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['zh', 'en'] as Language[]).map(l => (
                      <button key={l} onClick={() => setStyle({...style, language: l})} className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${style.language === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                        {l === 'zh' ? '中文' : 'ENG'}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">版式</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['landscape', 'portrait'] as Orientation[]).map(o => (
                      <button key={o} onClick={() => setStyle({...style, orientation: o})} className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${style.orientation === o ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                        {o === 'landscape' ? '横版' : '竖版'}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Section 4: AI Power */}
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/></svg>
            AI 智慧增强
          </h2>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
               <label className="text-[10px] font-black uppercase mb-1.5 block opacity-60 tracking-widest">个性化勋章主题</label>
               <input 
                type="text" 
                value={badgeTheme}
                onChange={e => setBadgeTheme(e.target.value)}
                placeholder="描述勋章风格，如：复古、科技感..."
                className="w-full bg-transparent border-none p-0 font-bold placeholder:text-white/30 outline-none"
              />
            </div>
            <button 
              disabled={isGenerating || !selectedFinisher.name}
              onClick={handleGenerateAI}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${isGenerating ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-indigo-600 hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  AI 正在思考...
                </>
              ) : '一键生成名言 & 勋章'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Panel */}
      <div className="flex-1 flex flex-col bg-slate-100/50 rounded-[40px] border border-slate-200 shadow-inner overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center p-8 min-h-full">
          <div className="w-full py-10 flex items-start justify-center">
            <div className="certificate-preview-container origin-top transition-all duration-500 transform scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100">
              <Certificate data={selectedFinisher} style={style} innerRef={certificateRef} />
            </div>
          </div>
          
          <div className="mt-8 mb-20 flex gap-4 w-full max-w-lg shrink-0">
            <button 
              onClick={() => setView('preview')} 
              className="flex-1 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              全屏预览
            </button>
            <button 
              onClick={async () => {
                const finisherToSave = { ...selectedFinisher, styleJson: JSON.stringify(style) };
                const existingIndex = finishers.findIndex(f => f.id === finisherToSave.id);
                let savedData = finisherToSave;
                try {
                  if (existingIndex !== -1) {
                    savedData = await api.updateFinisher(finisherToSave.id, finisherToSave);
                  } else {
                    savedData = await api.addFinisher(finisherToSave);
                  }
                } catch (e) { console.error('save finisher API failed', e); }
                setFinishers(prev => {
                  const idx = prev.findIndex(f => f.id === savedData.id);
                  if (idx !== -1) { const u = [...prev]; u[idx] = savedData; return u; }
                  return [...prev, savedData];
                });
                setView('dashboard');
              }}
              className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>
              保存并返回
            </button>
            {finishers.findIndex(f => f.id === selectedFinisher.id) !== -1 && (
              <button
                onClick={() => { onDeleteFinisher(selectedFinisher.id); setView('dashboard'); }}
                className="flex-1 px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VolunteerDashboardView = ({ 
  volunteers, 
  setView, 
  setSelectedVolunteer,
  setStyle,
  style,
  selectedIds,
  toggleSelection,
  toggleAll,
  onBatchDownload,
  onBatchDelete,
  isDownloadingZip,
  races,
  onDeleteVolunteer
}: { 
  volunteers: VolunteerData[], 
  setView: (v: AppView) => void,
  setSelectedVolunteer: (v: VolunteerData) => void,
  setStyle: (s: CertificateStyle) => void,
  style: CertificateStyle,
  selectedIds: Set<string>,
  toggleSelection: (id: string) => void,
  toggleAll: (ids: string[]) => void,
  onBatchDownload: () => void,
  onBatchDelete: () => void,
  isDownloadingZip: boolean,
  races: string[],
  onDeleteVolunteer: (id: string) => void
}) => {
  const [raceFilter, setRaceFilter] = useState('all');
  
  const filteredVolunteers = raceFilter === 'all' 
    ? volunteers 
    : volunteers.filter(v => v.raceName === raceFilter);

  const selectedInView = filteredVolunteers.filter(v => selectedIds.has(v.id));
  const isAllSelected = filteredVolunteers.length > 0 && filteredVolunteers.every(v => selectedIds.has(v.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">志愿者证书管理</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">管理志愿者信息并生成专属服务证书。</p>
          
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">赛事筛选:</span>
            <select 
              value={raceFilter}
              onChange={(e) => setRaceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部赛事</option>
              {races.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {selectedInView.length > 0 ? (
            <>
              <button 
                onClick={onBatchDelete}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                删除选中 ({selectedInView.length})
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
              </button>
              <button 
                onClick={onBatchDownload}
                disabled={isDownloadingZip}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {isDownloadingZip ? '正在打包...' : `导出选中的证书 (${selectedInView.length})`}
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </button>
            </>
          ) : null}
          <button 
            onClick={() => {
              setStyle({ ...style, type: 'volunteer' });
              setView('batch_import');
            }}
            className="flex-1 sm:flex-none bg-white border-2 border-slate-100 hover:border-indigo-600 text-slate-600 hover:text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-sm transition-all text-sm sm:text-base"
          >
            批量导入
          </button>
          <button 
            onClick={() => {
              setSelectedVolunteer({
                id: Math.random().toString(36).substr(2, 9),
                name: '',
                raceName: '2024 城市马拉松',
                role: '赛事志愿者',
                serviceHours: '',
                date: '2026年03月08日',
                certificateNumber: `PHBS-VOL-2026-S1-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
              });
              setStyle({ ...style, type: 'volunteer' });
              setView('volunteer_editor');
            }}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm sm:text-base"
          >
            录入单人
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-x-auto border border-slate-100">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 sm:py-4 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded accent-indigo-600"
                  checked={isAllSelected}
                  onChange={() => toggleAll(filteredVolunteers.map(v => v.id))}
                />
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">志愿者</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">岗位</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">证书编号</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVolunteers.length > 0 ? filteredVolunteers.map((v) => (
              <tr key={v.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.has(v.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-4 py-3 sm:py-4">
                   <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded accent-indigo-600"
                    checked={selectedIds.has(v.id)}
                    onChange={() => toggleSelection(v.id)}
                  />
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">{v.name || '未录入姓名'}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{v.raceName}</div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{v.role}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-indigo-600 font-bold text-sm sm:text-base">{v.certificateNumber}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <button 
                    onClick={async () => { 
                      try {
                        const fullData = await api.getVolunteerById(v.id);
                        setSelectedVolunteer(fullData); 
                        setStyle({ ...style, type: 'volunteer' });
                        setView('preview'); 
                      } catch (e) {
                        console.error('Failed to fetch volunteer details', e);
                      }
                    }}
                    className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    预览证书
                  </button>
                  <button onClick={() => onDeleteVolunteer(v.id)} className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-700 ml-3">删除</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">暂无符合条件的志愿者记录。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VolunteerEditorView = ({ 
  selectedVolunteer, 
  setSelectedVolunteer, 
  style, 
  setStyle, 
  setView, 
  setVolunteers,
  volunteers,
  certificateRef,
  handleLogoUpload,
  handleThemeImageUpload,
  handleRunnerImageUpload,
  handleSignatureUpload,
  logoInputRef,
  themeInputRef,
  runnerInputRef,
  signatureInputRef,
  onDeleteVolunteer
}: {
  selectedVolunteer: VolunteerData,
  setSelectedVolunteer: (v: VolunteerData) => void,
  style: CertificateStyle,
  setStyle: (s: CertificateStyle) => void,
  setView: (v: AppView) => void,
  setVolunteers: React.Dispatch<React.SetStateAction<VolunteerData[]>>,
  volunteers: VolunteerData[],
  certificateRef: React.RefObject<HTMLDivElement | null>,
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleThemeImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleRunnerImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  logoInputRef: React.RefObject<HTMLInputElement | null>,
  themeInputRef: React.RefObject<HTMLInputElement | null>,
  runnerInputRef: React.RefObject<HTMLInputElement | null>,
  signatureInputRef: React.RefObject<HTMLInputElement | null>,
  onDeleteVolunteer: (id: string) => void
}) => {
  useEffect(() => {
    if (selectedVolunteer.styleJson) {
      try { setStyle(JSON.parse(selectedVolunteer.styleJson)); } catch(e) {}
    }
  }, [selectedVolunteer.id]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-full lg:w-[450px] shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px]">01</span>
            志愿者信息录入
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">姓名</label>
              <input 
                type="text" 
                value={selectedVolunteer.name} 
                onChange={e => setSelectedVolunteer({...selectedVolunteer, name: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">服务岗位</label>
              <input type="text" value={selectedVolunteer.role} onChange={e => setSelectedVolunteer({...selectedVolunteer, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">证书编号</label>
              <input type="text" value={selectedVolunteer.certificateNumber} onChange={e => setSelectedVolunteer({...selectedVolunteer, certificateNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">赛事名称</label>
              <input type="text" value={selectedVolunteer.raceName} onChange={e => setSelectedVolunteer({...selectedVolunteer, raceName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">日期</label>
              <input type="text" value={selectedVolunteer.date} onChange={e => setSelectedVolunteer({...selectedVolunteer, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-2">
              <button onClick={() => logoInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedVolunteer.logoUrl ? <img src={selectedVolunteer.logoUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM11 14l-2-2.5L6 16h12l-4.5-6z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">赛事Logo</span>
              </button>
              <button onClick={() => themeInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-orange-50 hover:border-orange-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedVolunteer.themeImageUrl ? <img src={selectedVolunteer.themeImageUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">活动底图</span>
              </button>
              <button onClick={() => runnerInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedVolunteer.runnerImageUrl ? <img src={selectedVolunteer.runnerImageUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="currentColor" className="text-slate-300" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">志愿者照片</span>
              </button>
              <button onClick={() => signatureInputRef.current?.click()} className="group flex flex-col items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <div className="h-10 flex items-center justify-center">
                  {selectedVolunteer.signatureUrl ? <img src={selectedVolunteer.signatureUrl} className="h-full object-contain" /> : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" viewBox="0 0 24 24"><path d="M4 20h16M7 14l3-3 8-8a2.121 2.121 0 0 1 3 3l-8 8-3 3z"/></svg>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase">手写签名</span>
              </button>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <input ref={themeInputRef} type="file" accept="image/*" onChange={handleThemeImageUpload} className="hidden" />
            <input ref={runnerInputRef} type="file" accept="image/*" onChange={handleRunnerImageUpload} className="hidden" />
            <input ref={signatureInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px]">02</span>
            样式定制
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">主色调</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={style.primaryColor} onChange={e => setStyle({...style, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden" />
                    <span className="text-xs font-mono font-bold text-slate-400">{style.primaryColor}</span>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">语言</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['zh', 'en'] as Language[]).map(l => (
                      <button key={l} onClick={() => setStyle({...style, language: l})} className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${style.language === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                        {l === 'zh' ? '中文' : 'ENG'}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-100/50 rounded-[40px] border border-slate-200 shadow-inner overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center p-8 min-h-full">
          <div className="w-full py-10 flex items-start justify-center">
            <div className="certificate-preview-container origin-top transition-all duration-500 transform scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100">
              <VolunteerCertificate data={selectedVolunteer} style={style} innerRef={certificateRef} />
            </div>
          </div>
          
          <div className="mt-8 mb-20 flex gap-4 w-full max-w-lg shrink-0">
            <button 
              onClick={() => setView('preview')} 
              className="flex-1 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              全屏预览
            </button>
            <button 
              onClick={async () => {
                const volunteerToSave = { ...selectedVolunteer, styleJson: JSON.stringify(style) };
                const existingIndex = volunteers.findIndex(v => v.id === volunteerToSave.id);
                let savedData = volunteerToSave;
                try {
                  if (existingIndex !== -1) {
                    savedData = await api.updateVolunteer(volunteerToSave.id, volunteerToSave);
                  } else {
                    savedData = await api.addVolunteer(volunteerToSave);
                  }
                } catch (e) { console.error('save volunteer API failed', e); }
                setVolunteers(prev => {
                  const idx = prev.findIndex(v => v.id === savedData.id);
                  if (idx !== -1) { const u = [...prev]; u[idx] = savedData; return u; }
                  return [...prev, savedData];
                });
                setView('volunteer_dashboard');
              }}
              className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              保存并返回
            </button>
            {volunteers.findIndex(v => v.id === selectedVolunteer.id) !== -1 && (
              <button
                onClick={() => { onDeleteVolunteer(selectedVolunteer.id); setView('volunteer_dashboard'); }}
                className="flex-1 px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('token'));
  const [view, setView] = useState<AppView>('home');
  const [finishers, setFinishers] = useState<FinisherData[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [selectedFinisher, setSelectedFinisher] = useState<FinisherData>(INITIAL_DATA[0]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerData>(INITIAL_VOLUNTEER_DATA[0]);

  const fetchAllData = () => {
    api.getFinishers().then(setFinishers).catch(() => setFinishers([]));
    api.getVolunteers().then(setVolunteers).catch(() => setVolunteers([]));
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  const [style, setStyle] = useState<CertificateStyle>(INITIAL_STYLE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState('马拉松胜利者勋章');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);
  const [batchRunnerToRender, setBatchRunnerToRender] = useState<any | null>(null);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [view]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);
  const runnerInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const volunteerLogoInputRef = useRef<HTMLInputElement>(null);
  const volunteerThemeInputRef = useRef<HTMLInputElement>(null);
  const volunteerRunnerInputRef = useRef<HTMLInputElement>(null);
  const volunteerSignatureInputRef = useRef<HTMLInputElement>(null);

  const certificateRef = useRef<HTMLDivElement>(null);
  const previewCertificateRef = useRef<HTMLDivElement>(null);
  const hiddenCaptureRef = useRef<HTMLDivElement>(null);

  const uniqueRaces = Array.from(new Set([
    ...finishers.map(f => f.raceName),
    ...volunteers.map(v => v.raceName)
  ])).filter(Boolean) as string[];

  const handleDeleteFinisher = async (id: string) => {
    try { await api.deleteFinisher(id); } catch (e) { console.error('delete finisher failed', e); }
    setFinishers(prev => prev.filter(f => f.id !== id));
  };

  const handleDeleteVolunteer = async (id: string) => {
    try { await api.deleteVolunteer(id); } catch (e) { console.error('delete volunteer failed', e); }
    setVolunteers(prev => prev.filter(v => v.id !== id));
  };

  const handleBatchDeleteFinishers = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) return;
    const ids = Array.from(selectedIds);
    try {
      await api.batchDeleteFinishers(ids);
      setFinishers(prev => prev.filter(f => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
    } catch (e) {
      console.error('batch delete finishers failed', e);
    }
  };

  const handleBatchDeleteVolunteers = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) return;
    const ids = Array.from(selectedIds);
    try {
      await api.batchDeleteVolunteers(ids);
      setVolunteers(prev => prev.filter(v => !selectedIds.has(v.id)));
      setSelectedIds(new Set());
    } catch (e) {
      console.error('batch delete volunteers failed', e);
    }
  };

  const handleSearch = async (name: string, race: string) => {
    setSearchError(null);
    
    try {
      const foundFinisher = await api.searchFinisher(name.trim(), race);
      setSelectedFinisher(foundFinisher);
      if (foundFinisher.styleJson) {
        try { setStyle(JSON.parse(foundFinisher.styleJson)); } catch(e) {}
      } else {
        setStyle(prev => ({ ...prev, type: 'finisher' }));
      }
      setView('search_result');
      return;
    } catch (e) {
      // Not found in finishers, try volunteers
    }

    try {
      const foundVolunteer = await api.searchVolunteer(name.trim(), race);
      setSelectedVolunteer(foundVolunteer);
      if (foundVolunteer.styleJson) {
        try { setStyle(JSON.parse(foundVolunteer.styleJson)); } catch(e) {}
      } else {
        setStyle(prev => ({ ...prev, type: 'volunteer' }));
      }
      setView('search_result');
      return;
    } catch (e) {
      // Not found in volunteers either
    }

    setSearchError('未找到该记录，请检查姓名或赛事选择。');
  };

  const handleBatchSave = async (common: any, rows: any[], newStyle: CertificateStyle) => {
    setBatchProgress({ current: 0, total: rows.length });
    
    if (newStyle.type === 'volunteer') {
      const newVolunteers: VolunteerData[] = [];
      
      // Calculate starting index based on existing volunteers
      let maxIndex = 0;
      volunteers.forEach(v => {
        // Match the last part of the certificate number (the XXX part)
        const parts = v.certificateNumber.split('-');
        const lastPart = parts[parts.length - 1];
        if (lastPart && /^\d+$/.test(lastPart)) {
          const idx = parseInt(lastPart);
          if (idx > maxIndex) maxIndex = idx;
        }
      });

      rows.forEach((row, idx) => {
        const currentIndex = maxIndex + idx + 1;
        const certNo = `PHBS-VOL-${common.year}-${common.session}-${currentIndex.toString().padStart(3, '0')}`;
        
        newVolunteers.push({
          ...row,
          id: Math.random().toString(36).substr(2, 9),
          raceName: common.raceName,
          date: common.date,
          logoUrl: common.logoUrl,
          themeImageUrl: common.themeImageUrl,
          signatureUrl: common.signatureUrl,
          certificateNumber: certNo,
          styleJson: JSON.stringify(newStyle)
        });
      });

      try { 
        await api.batchVolunteers(newVolunteers); 
        setVolunteers(prev => [...prev, ...newVolunteers]);
        setStyle(newStyle);
        setBatchProgress(null);
        setView('volunteer_dashboard');
      } catch (e) { 
        console.error('batch volunteers API failed', e); 
        alert('批量导入失败：' + (e as Error).message);
        setBatchProgress(null);
      }
      return;
    }

    const newFinishers: FinisherData[] = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const chunkRunners = chunk.map(r => ({
        name: r.name,
        category: r.category || '马拉松项目',
        finishTime: r.finishTime
      }));

      let batchQuotes: {name: string, quote: string}[] = [];
      try {
        batchQuotes = await generateBatchInspirationalQuotes(chunkRunners, newStyle.language);
      } catch (err) {
        console.error("Batch AI call failed", err);
      }

      chunk.forEach((row, idx) => {
        const aiMatch = batchQuotes.find(q => q.name === row.name);
        const quote = aiMatch ? aiMatch.quote : `${newStyle.language === 'zh' ? '亲爱的' : 'Dear '}${row.name}${newStyle.language === 'zh' ? '：' : ': '}每一步都是对自我的超越。`;

        newFinishers.push({
          ...row,
          ...common,
          id: Math.random().toString(36).substr(2, 9),
          netTime: row.finishTime,
          genderRank: row.genderRank || 'N/A',
          overallRank: row.overallRank || 'N/A',
          inspirationalQuote: quote,
          date: common.date || '2025年01月01日',
          styleJson: JSON.stringify(newStyle)
        });
      });

      setBatchProgress(prev => prev ? { ...prev, current: Math.min(i + CHUNK_SIZE, rows.length) } : null);
    }

    try { 
      await api.batchFinishers(newFinishers); 
      setFinishers(prev => [...prev, ...newFinishers]);
      setStyle(newStyle);
      setBatchProgress(null);
      setView('dashboard');
    } catch (e) { 
      console.error('batch finishers API failed', e); 
      alert('批量导入失败：' + (e as Error).message);
      setBatchProgress(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = ids.length > 0 && ids.every(id => next.has(id));
      if (allSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleBatchDownload = async () => {
    if (selectedIds.size === 0) return;
    setIsDownloadingZip(true);
    const zip = new JSZip();
    const folder = zip.folder("RunCertify_Batch_Certificates");
    
    const isVolunteer = view === 'volunteer_dashboard';
    const currentList = isVolunteer ? volunteers : finishers;
    const selectedItems = currentList.filter(item => selectedIds.has(item.id));
    
    for (const item of selectedItems) {
      let fullItem = item;
      try {
        fullItem = isVolunteer 
          ? await api.getVolunteerById(item.id) 
          : await api.getFinisherById(item.id);
      } catch (e) {
        console.error(`Failed to fetch details for ${item.name}`, e);
      }
      
      setBatchRunnerToRender(fullItem);
      await new Promise(resolve => setTimeout(resolve, 500)); // Give it a bit more time to render images
      const element = hiddenCaptureRef.current;
      if (element) {
        try {
          const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 2 });
          const base64Data = dataUrl.split(',')[1];
          const filename = isVolunteer 
            ? `${item.name}_${(item as VolunteerData).certificateNumber}.png`
            : `${item.name}_${(item as FinisherData).bibNumber}.png`;
          folder?.file(filename, base64Data, { base64: true });
        } catch (err) {
          console.error(`Failed to capture ${item.name}`, err);
        }
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RunCertify_Batch_${new Date().getTime()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    setBatchRunnerToRender(null);
    setIsDownloadingZip(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFinisher(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFinisher(prev => ({ ...prev, themeImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFinisher(prev => ({ ...prev, runnerImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFinisher(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolunteerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVolunteer(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolunteerThemeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVolunteer(prev => ({ ...prev, themeImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolunteerRunnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVolunteer(prev => ({ ...prev, runnerImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolunteerSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVolunteer(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedFinisher.name) return;
    setIsGenerating(true);
    try {
      const quote = await generateInspirationalQuote(selectedFinisher.name, selectedFinisher.category, selectedFinisher.finishTime, style.language);
      const badge = await generateCustomBadge(badgeTheme);
      setSelectedFinisher(prev => ({ ...prev, inspirationalQuote: quote, badgeImageUrl: badge || prev.badgeImageUrl }));
    } catch (err: any) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const ref = (view === 'editor' || view === 'search_result') ? certificateRef : previewCertificateRef;
    if (!ref.current) return;
    setIsDownloading(true);
    const name = style.type === 'volunteer' ? selectedVolunteer.name : selectedFinisher.name;
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${name}_Certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {view !== 'home' && view !== 'login' && view !== 'search_result' && (
        <Header currentView={view} setView={setView} onLogout={() => { localStorage.removeItem('token'); setIsAdmin(false); setView('home'); }} />
      )}
      <main className="flex-1 bg-slate-50/50">
        {view === 'home' && <HomeView onSearch={handleSearch} goToLogin={() => { if (localStorage.getItem('token')) { setIsAdmin(true); fetchAllData(); setView('dashboard'); } else { setView('login'); } }} searchError={searchError} races={uniqueRaces} />}
        {view === 'login' && <LoginView onLogin={(token) => { 
          setIsAdmin(true); 
          fetchAllData();
          setView('dashboard'); 
        }} onBack={() => setView('home')} />}
        {view === 'search_result' && (
          <div className="min-h-screen flex flex-col items-center bg-white p-6 sm:p-12">
            <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">查询成功！</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                  {style.type === 'volunteer' 
                    ? `感谢 ${selectedVolunteer.name} 的无私奉献` 
                    : `恭喜 ${selectedFinisher.name} 完成比赛`}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setView('home')} className="border-2 border-slate-100 px-6 py-3 rounded-2xl font-black text-slate-400">返回</button>
                <button disabled={isDownloading} onClick={handleDownload} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl">{isDownloading ? '生成中...' : '下载证书'}</button>
              </div>
            </div>
            <div className="certificate-display scale-[0.5] sm:scale-[0.8] md:scale-100 origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-100">
               {style.type === 'volunteer' ? (
                 <VolunteerCertificate data={selectedVolunteer} style={style} innerRef={certificateRef} />
               ) : (
                 <Certificate data={selectedFinisher} style={style} innerRef={certificateRef} />
               )}
            </div>
          </div>
        )}
        {isAdmin && view === 'dashboard' && (
          <DashboardView finishers={finishers} setView={setView} setSelectedFinisher={setSelectedFinisher} selectedIds={selectedIds} toggleSelection={toggleSelection} toggleAll={toggleAll} onBatchDownload={handleBatchDownload} onBatchDelete={handleBatchDeleteFinishers} isDownloadingZip={isDownloadingZip} races={uniqueRaces} onDeleteFinisher={handleDeleteFinisher} style={style} setStyle={setStyle} />
        )}
        {isAdmin && view === 'volunteer_dashboard' && (
          <VolunteerDashboardView 
            volunteers={volunteers} 
            setView={setView} 
            setSelectedVolunteer={setSelectedVolunteer} 
            setStyle={setStyle}
            style={style}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            toggleAll={toggleAll}
            onBatchDownload={handleBatchDownload}
            onBatchDelete={handleBatchDeleteVolunteers}
            isDownloadingZip={isDownloadingZip}
            races={uniqueRaces}
            onDeleteVolunteer={handleDeleteVolunteer}
          />
        )}
        {isAdmin && view === 'volunteer_editor' && (
          <VolunteerEditorView 
            selectedVolunteer={selectedVolunteer} 
            setSelectedVolunteer={setSelectedVolunteer} 
            style={style} 
            setStyle={setStyle} 
            setView={setView} 
            setVolunteers={setVolunteers}
            volunteers={volunteers}
            certificateRef={certificateRef}
            handleLogoUpload={handleVolunteerLogoUpload}
            handleThemeImageUpload={handleVolunteerThemeImageUpload}
            handleRunnerImageUpload={handleVolunteerRunnerImageUpload}
            handleSignatureUpload={handleVolunteerSignatureUpload}
            logoInputRef={volunteerLogoInputRef}
            themeInputRef={volunteerThemeInputRef}
            runnerInputRef={volunteerRunnerInputRef}
            signatureInputRef={volunteerSignatureInputRef}
            onDeleteVolunteer={handleDeleteVolunteer}
          />
        )}
        {isAdmin && view === 'batch_import' && (
          <BatchImportView 
            onSave={handleBatchSave} 
            onCancel={() => setView(style.type === 'volunteer' ? 'volunteer_dashboard' : 'dashboard')} 
            logoInputRef={logoInputRef} 
            themeInputRef={themeInputRef} 
            signatureInputRef={signatureInputRef}
            initialStyle={style} 
            isProcessing={batchProgress} 
            volunteers={volunteers}
          />
        )}
        {isAdmin && view === 'editor' && (
          <EditorView 
            selectedFinisher={selectedFinisher} setSelectedFinisher={setSelectedFinisher} style={style} setStyle={setStyle} 
            badgeTheme={badgeTheme} setBadgeTheme={setBadgeTheme} isGenerating={isGenerating} handleGenerateAI={handleGenerateAI}
            handleLogoUpload={handleLogoUpload} handleThemeImageUpload={handleThemeImageUpload} handleRunnerImageUpload={handleRunnerImageUpload}
            handleSignatureUpload={handleSignatureUpload}
            logoInputRef={logoInputRef} themeInputRef={themeInputRef} runnerInputRef={runnerInputRef} signatureInputRef={signatureInputRef}
            setView={setView} setFinishers={setFinishers} finishers={finishers} certificateRef={certificateRef}
            onDeleteFinisher={handleDeleteFinisher}
          />
        )}
        {isAdmin && view === 'preview' && (
          <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 no-print">
              <button onClick={() => setView(style.type === 'volunteer' ? 'volunteer_editor' : 'editor')} className="bg-white px-6 py-3 rounded-2xl font-black shadow-sm">返回编辑</button>
              <div className="flex gap-3">
                <button disabled={isDownloading} onClick={handleDownload} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl">{isDownloading ? '生成中...' : '下载图片'}</button>
                <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl">打印 PDF</button>
              </div>
            </div>
            <div className="bg-white p-1 rounded-2xl shadow-2xl overflow-hidden">
              <div className="scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top">
                {style.type === 'volunteer' ? (
                  <VolunteerCertificate data={selectedVolunteer} style={style} innerRef={previewCertificateRef} />
                ) : (
                  <Certificate data={selectedFinisher} style={style} innerRef={previewCertificateRef} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Hidden high-res capture container */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
          <div ref={hiddenCaptureRef}>
             {batchRunnerToRender && (
               view === 'volunteer_dashboard' ? (
                 <VolunteerCertificate 
                   data={batchRunnerToRender as VolunteerData} 
                   style={batchRunnerToRender.styleJson ? JSON.parse(batchRunnerToRender.styleJson) : style} 
                 />
               ) : (
                 <Certificate 
                   data={batchRunnerToRender as FinisherData} 
                   style={batchRunnerToRender.styleJson ? JSON.parse(batchRunnerToRender.styleJson) : style} 
                 />
               )
             )}
          </div>
      </div>
    </div>
  );
};

export default App;
