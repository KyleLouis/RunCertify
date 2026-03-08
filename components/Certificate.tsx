
import React from 'react';
import { FinisherData, CertificateStyle } from '../types';

interface CertificateProps {
  data: FinisherData;
  style: CertificateStyle;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

const Certificate: React.FC<CertificateProps> = ({ data, style, innerRef }) => {
  const isZh = style.language === 'zh';
  const isPortrait = style.orientation === 'portrait';
  
  const containerStyle = isPortrait 
    ? { width: '450px', height: '800px' } 
    : { width: '800px', height: '450px' };

  const t = {
    title: isZh ? '完赛证书' : 'OFFICIAL FINISHER CERTIFICATE',
    subtitle: isZh ? '兹证明' : 'This is to certify that',
    completion: isZh ? '成功完成了' : 'Successfully completed the',
    bib: isZh ? '参赛号码' : 'Bib Number',
    gunTime: isZh ? '枪声成绩' : 'Gun Time',
    netTime: isZh ? '净计时成绩' : 'Net Time',
    rank: isZh ? '综合排名' : 'Overall Rank',
    genderRank: isZh ? '性别排名' : 'Gender Rank',
    director: isZh ? '总教练' : 'Head Coach',
    dateLabel: isZh ? '日期' : 'Date',
    completionClassic: isZh ? '已圆满完成' : 'Has successfully completed',
    congrats: isZh ? '祝贺你！' : 'CONGRATULATIONS'
  };

  const renderTemplate = () => {
    switch (style.template) {
      case 'minimal':
        return (
          <div ref={innerRef} className="relative bg-white shadow-2xl overflow-hidden flex flex-col p-12 text-slate-900 border border-slate-100" style={containerStyle}>
            <div className="flex flex-col h-full border-t border-b border-slate-900 py-8 relative">
               <div className="absolute top-4 right-0">
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30">{t.title}</span>
               </div>
               
               <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[12px] font-bold uppercase tracking-widest mb-2 opacity-50">{t.subtitle}</p>
                  <h2 className={`font-playfair font-black mb-6 ${isPortrait ? 'text-5xl' : 'text-7xl'}`}>{data.name}</h2>
                  <div className="h-0.5 w-12 bg-slate-900 mb-6"></div>
                  <p className="text-lg font-medium leading-relaxed">
                    {t.completion} <span className="font-black italic">{data.raceName} - {data.category}</span>
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-y-6 mt-8">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">{t.bib}</p>
                    <p className="text-xl font-mono font-bold tracking-tighter">{data.bibNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">{t.netTime}</p>
                    <p className="text-xl font-mono font-bold tracking-tighter">{data.finishTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">{t.rank}</p>
                    <p className="text-xl font-mono font-bold tracking-tighter">{data.overallRank}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">{t.dateLabel}</p>
                    <p className="text-xl font-mono font-bold tracking-tighter">{data.date}</p>
                  </div>
               </div>

               <div className="mt-auto pt-10 flex justify-between items-end">
                  <div className="max-w-[300px]">
                    {data.inspirationalQuote && (
                      <p className="text-xs italic font-serif leading-relaxed opacity-70">
                        "{data.inspirationalQuote}"
                      </p>
                    )}
                  </div>
                  {data.badgeImageUrl && (
                    <img src={data.badgeImageUrl} className="w-16 h-16 grayscale object-contain" alt="Seal" />
                  )}
               </div>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div ref={innerRef} className={`relative bg-white shadow-2xl overflow-hidden border-[14px] flex flex-col transition-all`} style={{ ...containerStyle, borderColor: style.primaryColor }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 transform rotate-45 translate-x-32 -translate-y-32"></div>
            
            <div className={`relative p-8 h-full flex flex-col items-center justify-between text-center z-10`}>
              <div className="flex flex-col items-center w-full mt-4">
                <p className={`uppercase tracking-[0.5em] font-black text-slate-400 ${isPortrait ? 'text-[14px]' : 'text-[16px]'}`}>{t.title}</p>
                <div className="w-16 h-1 bg-slate-200 my-3 rounded-full"></div>
                {data.logoUrl && <img src={data.logoUrl} className="h-10 object-contain mb-3" alt="Race Logo" />}
                <h1 className={`${isPortrait ? 'text-xl' : 'text-2xl'} font-black font-montserrat uppercase tracking-tight leading-tight px-4`} style={{ color: style.primaryColor }}>{data.raceName}</h1>
              </div>

              <div className="flex flex-col items-center gap-0 my-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.subtitle}</p>
                <h2 className={`font-playfair font-black text-slate-900 border-b-4 pb-1 px-14 min-w-[280px] ${isPortrait ? 'text-4xl' : 'text-5xl'}`} style={{ borderBottomColor: style.secondaryColor }}>{data.name}</h2>
                <p className="text-xs text-slate-600 font-bold mt-2">{t.completion} <span className="font-black text-indigo-600">{data.category}</span></p>
              </div>

              <div className="flex-1 w-full flex flex-col justify-center items-center py-2 min-h-0">
                {data.themeImageUrl ? (
                   <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-inner border border-slate-100">
                      <img src={data.themeImageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent"></div>
                   </div>
                ) : (
                  <div className="w-full h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Event Theme Visual</span>
                  </div>
                )}
              </div>

              <div className={`grid ${isPortrait ? 'grid-cols-2' : 'grid-cols-4'} w-full gap-2 mt-2`}>
                {[
                  { label: t.bib, value: data.bibNumber },
                  { label: t.gunTime, value: data.finishTime },
                  { label: t.netTime, value: data.finishTime }, 
                  { label: t.rank, value: data.overallRank }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[8px] uppercase font-bold text-slate-400 mb-0.5">{item.label}</span>
                    <span className="text-sm font-black text-slate-800 tracking-tight">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="w-full flex items-center gap-4 mt-4 px-4 py-2 bg-indigo-50/30 rounded-2xl">
                {data.runnerImageUrl && (
                  <img src={data.runnerImageUrl} className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-[10px] italic font-serif font-black text-indigo-900 leading-tight">
                    {data.inspirationalQuote || (isZh ? "奔跑不止是脚步的交替，更是灵魂的远行。" : "Running is not just an exchange of footsteps, but a journey of the soul.")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full mt-4 pt-3 border-t-2 border-slate-50">
                <div className="flex flex-col items-start">
                  <div className="w-20 h-px bg-slate-300 mb-1"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{t.director}</span>
                </div>
                {data.badgeImageUrl && (
                  <img src={data.badgeImageUrl} className="w-12 h-12 object-contain" alt="Badge" />
                )}
                <div className="flex flex-col items-end">
                  <div className="w-20 h-px bg-slate-300 mb-1"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{t.dateLabel}: {data.date}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'energetic':
        return (
          <div ref={innerRef} className={`relative bg-slate-900 shadow-2xl overflow-hidden text-white border-[10px] border-white/20 flex flex-col`} style={containerStyle}>
            {data.themeImageUrl ? (
               <img src={data.themeImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
            ) : (
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)` }}></div>
            )}
            
            <div className="absolute top-0 left-0 w-full h-2 shadow-lg" style={{ backgroundColor: style.primaryColor }}></div>
            
            <div className="relative p-10 h-full flex flex-col justify-between z-10">
              <div className="flex flex-col gap-1 pt-2">
                <p className="text-indigo-400 font-black tracking-[0.6em] text-[14px] uppercase">{t.title}</p>
                <div className="flex items-center gap-3">
                  {data.logoUrl && <img src={data.logoUrl} className="h-10 w-10 object-contain bg-white/30 rounded-xl p-2 shadow-xl" />}
                  <h1 className={`${isPortrait ? 'text-3xl' : 'text-4xl'} font-black italic tracking-tighter uppercase leading-none`}>{data.raceName}</h1>
                </div>
                <p className="text-xl font-black mt-2" style={{ color: style.secondaryColor }}>#{data.bibNumber}</p>
              </div>

              <div className="my-2">
                <p className="text-[14px] font-black text-slate-300 mb-1 uppercase tracking-widest">{t.congrats}</p>
                <h2 className={`font-black uppercase tracking-tight leading-tight ${isPortrait ? 'text-5xl' : 'text-7xl'}`}>{data.name}</h2>
                <div className="h-2 w-32 mt-3" style={{ backgroundColor: style.primaryColor }}></div>
              </div>

              <div className={`grid ${isPortrait ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-10'}`}>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{isZh ? '项目' : 'Category'}</p>
                    <p className="text-lg font-black italic">{data.category}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{t.netTime}</p>
                    <p className="text-4xl font-black italic" style={{ color: style.primaryColor }}>{data.finishTime}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-end space-y-4">
                  {data.runnerImageUrl && (
                    <img src={data.runnerImageUrl} className="w-20 h-20 object-cover rounded-2xl border-4 border-white/20 ml-auto" />
                  )}
                  {data.inspirationalQuote && (
                    <p className={`italic text-white font-black text-sm leading-relaxed max-w-[300px] ${isPortrait ? '' : 'ml-auto'} bg-black/40 p-3 rounded-xl border-r-4`} style={{ borderRightColor: style.secondaryColor }}>
                      "{data.inspirationalQuote}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/30 pt-6 mt-auto">
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.rank}</p>
                    <p className="text-lg font-black">{data.overallRank}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isZh ? '性别排名' : 'Gender Rank'}</p>
                    <p className="text-lg font-black">{data.genderRank}</p>
                  </div>
                </div>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{data.date}</p>
              </div>
            </div>
          </div>
        );

      case 'pku':
        return (
          <div ref={innerRef} className="relative bg-[#fffcf5] shadow-2xl overflow-hidden flex flex-col p-2 text-slate-900 border-[16px]" style={{ ...containerStyle, borderColor: style.primaryColor }}>
            {data.themeImageUrl && (
              <img src={data.themeImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale pointer-events-none" />
            )}
            <div className="w-full h-full border-2 border-slate-200 flex flex-col items-center justify-between p-8 relative">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4" style={{ borderColor: style.primaryColor }}></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4" style={{ borderColor: style.primaryColor }}></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4" style={{ borderColor: style.primaryColor }}></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4" style={{ borderColor: style.primaryColor }}></div>

              <div className="text-center relative z-10 w-full">
                <div className="flex flex-col items-center justify-center mb-4">
                  {data.logoUrl ? (
                    <img src={data.logoUrl} className="h-16 object-contain" alt="Race Logo" />
                  ) : (
                    <div className="h-16 flex items-center justify-center">
                       <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20">OFFICIAL LOGO</span>
                    </div>
                  )}
                </div>
                <div className="w-full h-px bg-slate-200 mb-4"></div>
                <p className="text-sm font-bold tracking-[0.4em] uppercase opacity-50 mb-2" style={{ color: style.primaryColor }}>{t.title}</p>
                <h2 className="text-xl font-black font-serif uppercase tracking-tight leading-tight lining-nums">
                  {data.raceName.split(/(\d+)/).map((part, i) => 
                    i % 2 === 1 ? <span key={i} className="font-sans">{part}</span> : part
                  )}
                </h2>
              </div>

              <div className="flex flex-col items-center text-center relative z-10 my-4 w-full">
                <p className="text-xs font-bold mb-2 uppercase tracking-widest opacity-60">{t.subtitle}</p>
                <h2 className={`font-serif font-black text-slate-900 border-b-2 px-12 pb-1 mb-4 ${isPortrait ? 'text-4xl' : 'text-6xl'}`} style={{ borderBottomColor: style.primaryColor }}>{data.name}</h2>
                <p className="text-base leading-relaxed font-medium">
                  {t.completion} <br/> 
                  <span className="font-black text-lg mt-1 block" style={{ color: style.primaryColor }}>{data.category}</span>
                </p>
              </div>

              <div className={`w-full grid ${isPortrait ? 'grid-cols-2' : 'grid-cols-4'} gap-4 my-2 py-4 relative z-10`}>
                {[
                  { label: t.bib, value: data.bibNumber },
                  { label: t.netTime, value: data.finishTime },
                  { label: t.rank, value: data.overallRank },
                  { label: t.genderRank, value: data.genderRank }
                ].map((item, idx) => (
                  <div key={idx} className="text-center border-r last:border-r-0 border-slate-200">
                    <p className="text-[9px] uppercase font-black text-slate-400 mb-1">{item.label}</p>
                    <p className="text-lg font-mono font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-center items-center gap-6 py-2 relative z-10">
                 {data.runnerImageUrl && (
                   <div className="w-14 h-14 border-2 p-1 shadow-md bg-white rounded-lg" style={{ borderColor: style.primaryColor }}>
                     <img src={data.runnerImageUrl} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="flex-1 max-w-[400px]">
                    <p className="text-xs font-serif italic font-bold text-center leading-relaxed">
                      "{data.inspirationalQuote || (isZh ? "博学之，审问之，慎思之，明辨之，笃行之。" : "Study extensively, inquire accurately, think carefully, sift clearly, and practice earnestly.")}"
                    </p>
                 </div>
              </div>

              <div className="w-full flex justify-between items-end mt-auto relative z-10 pb-2">
                 <div className="text-center relative">
                   {data.signatureUrl && (
                     <img src={data.signatureUrl} className="absolute -top-12 left-1/2 -translate-x-1/2 h-16 object-contain pointer-events-none" alt="Signature" />
                   )}
                   <div className="w-20 h-px bg-slate-300 mb-1 mx-auto"></div>
                   <p className="text-[8px] uppercase font-black text-slate-400">{t.director}</p>
                 </div>
                 {data.badgeImageUrl ? (
                   <img src={data.badgeImageUrl} className="w-16 h-16 object-contain" />
                 ) : (
                   <div className="w-16 h-16 rounded-full border-4 border-double flex items-center justify-center text-sm font-black opacity-40" style={{ borderColor: style.primaryColor, color: style.primaryColor }}>
                     戈21
                   </div>
                 )}
                 <div className="text-center">
                   <p className="text-[10px] font-black mb-1" style={{ color: style.primaryColor }}>{data.date}</p>
                   <div className="w-20 h-px bg-slate-300 mb-1 mx-auto"></div>
                   <p className="text-[8px] uppercase font-black text-slate-400">{isZh ? '北大汇丰MBA戈21组委会' : 'PHBS MBA G21 Committee'}</p>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div ref={innerRef} className={`relative bg-[#fcf9f2] shadow-2xl border-[20px] border-[#d4af37] p-4 flex flex-col transition-all`} style={containerStyle}>
            <div className="w-full h-full border-2 border-[#d4af37] flex flex-col items-center justify-between p-8 text-[#4a4a4a] relative overflow-hidden">
              {data.themeImageUrl && (
                <img src={data.themeImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-15 grayscale pointer-events-none" />
              )}
              
              <div className="text-center relative z-10 pt-4">
                <p className="font-playfair text-xl tracking-[0.5em] uppercase font-bold mb-3">{isZh ? '完赛荣誉证书' : 'Certificate of Completion'}</p>
                <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-4"></div>
                {data.logoUrl && <img src={data.logoUrl} className="h-10 grayscale opacity-90 mb-4 mx-auto" />}
                <h1 className="text-2xl font-black font-serif uppercase tracking-tight leading-tight">
                  {data.raceName.split(/(\d+)/).map((part, i) => 
                    i % 2 === 1 ? <span key={i} className="font-sans">{part}</span> : part
                  )}
                </h1>
              </div>

              <div className="flex flex-col items-center text-center relative z-10 my-4">
                <p className="italic text-sm font-bold mb-2 uppercase tracking-widest">{t.subtitle}</p>
                <h2 className={`font-playfair font-black text-[#1a1a1a] border-b-4 border-[#d4af37] px-16 pb-2 mb-4 ${isPortrait ? 'text-4xl' : 'text-6xl'}`}>{data.name}</h2>
                <p className="text-lg leading-relaxed font-serif">
                  {t.completionClassic} <br/> 
                  <span className="font-black text-[#b8860b] text-xl mt-1 block">{data.category}</span>
                </p>
              </div>

              <div className={`w-full grid grid-cols-3 gap-6 my-2 border-y-2 border-[#d4af37]/40 py-4 relative z-10 bg-white/40`}>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-[#6b6b6b] mb-1">{t.gunTime}</p>
                  <p className="text-xl font-serif font-black">{data.finishTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-[#6b6b6b] mb-1">{t.bib}</p>
                  <p className="text-xl font-serif font-black">{data.bibNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-[#6b6b6b] mb-1">{t.rank}</p>
                  <p className="text-xl font-serif font-black">{data.overallRank}</p>
                </div>
              </div>

              <div className="w-full flex justify-center items-center gap-6 py-2 relative z-10">
                 {data.runnerImageUrl && (
                   <div className="w-12 h-12 border border-[#d4af37] p-1 rotate-3 shadow-sm bg-white">
                     <img src={data.runnerImageUrl} className="w-full h-full object-cover grayscale" />
                   </div>
                 )}
                 <p className="text-xs font-serif italic font-bold max-w-[280px] text-center border-l-2 border-[#d4af37] pl-4">
                   {data.inspirationalQuote || "不忘初心，方得始终。跑者的道路没有终点，只有不断前行的自己。"}
                 </p>
              </div>

              <div className="w-full flex justify-between items-end mt-auto relative z-10 pb-4">
                 <div className="text-center">
                   <div className="w-24 h-px bg-[#4a4a4a] mb-2 mx-auto"></div>
                   <p className="text-[9px] uppercase font-black">{isZh ? '认证公章' : 'Seal'}</p>
                 </div>
                 {data.badgeImageUrl && <img src={data.badgeImageUrl} className="w-16 h-16 grayscale opacity-80" />}
                 <div className="text-center">
                   <p className="font-serif text-sm font-black mb-1">{data.date}</p>
                   <p className="text-[9px] uppercase font-black">{isZh ? '举办日期' : 'Date'}</p>
                 </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="print-area flex justify-center items-center overflow-hidden bg-white">
      {renderTemplate()}
    </div>
  );
};

export default Certificate;
