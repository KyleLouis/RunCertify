
import React from 'react';
import { VolunteerData, CertificateStyle } from '../types';

interface VolunteerCertificateProps {
  data: VolunteerData;
  style: CertificateStyle;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

const VolunteerCertificate: React.FC<VolunteerCertificateProps> = ({ data, style, innerRef }) => {
  const isZh = style.language === 'zh';
  const isPortrait = style.orientation === 'portrait';
  
  const containerStyle = isPortrait 
    ? { width: '450px', height: '800px' } 
    : { width: '800px', height: '450px' };

  const t = {
    title: isZh ? '志愿者服务证书' : 'VOLUNTEER SERVICE CERTIFICATE',
    subtitle: isZh ? '感谢' : 'This is to certify that',
    appreciation: isZh ? '在赛事中提供了卓越的志愿服务' : 'Provided outstanding volunteer service during the event',
    roleLabel: isZh ? '服务岗位' : 'Volunteer Role',
    certNoLabel: isZh ? '证书编号' : 'Certificate No.',
    director: isZh ? '总教练' : 'Head Coach',
    dateLabel: isZh ? '日期' : 'Date',
    thankYou: isZh ? '感谢您的无私奉献！' : 'Thank you for your selfless dedication!'
  };

  const renderTemplate = () => {
    // For now, we'll use a refined version of the PKU style for volunteers
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
            <div className="flex flex-col items-center mb-4">
              {data.runnerImageUrl && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                  <img src={data.runnerImageUrl} className="w-full h-full object-cover" alt="Volunteer Photo" />
                </div>
              )}
              <p className="text-xs font-bold mb-2 uppercase tracking-widest opacity-60">{t.subtitle}</p>
              <h2 className={`font-serif font-black text-slate-900 border-b-2 px-12 pb-1 mb-4 ${isPortrait ? 'text-4xl' : 'text-6xl'}`} style={{ borderBottomColor: style.primaryColor }}>{data.name}</h2>
            </div>
            <div className="max-w-[500px] mx-auto">
              <p className="text-base leading-relaxed font-medium">
                {t.appreciation}
              </p>
              <p className="text-sm italic mt-4 opacity-70">
                {t.thankYou}
              </p>
            </div>
          </div>

          <div className={`w-full grid ${isPortrait ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'} my-2 py-4 relative z-10`}>
            <div className="text-center border-r last:border-r-0 border-slate-200">
              <p className="text-[9px] uppercase font-black text-slate-400 mb-1">{t.roleLabel}</p>
              <p className="text-lg font-black">{data.role}</p>
            </div>
            <div className="text-center border-r last:border-r-0 border-slate-200">
              <p className="text-[9px] uppercase font-black text-slate-400 mb-1">{t.certNoLabel}</p>
              <p className="text-lg font-mono font-black">{data.certificateNumber}</p>
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
  };

  return (
    <div className="print-area flex justify-center items-center overflow-hidden bg-white">
      {renderTemplate()}
    </div>
  );
};

export default VolunteerCertificate;
