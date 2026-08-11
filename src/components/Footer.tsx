import React from 'react';
import { ShieldCheck, PhoneCall } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-[#222d2b] py-8 mt-16 bg-[#090d0e] text-[#a4aaa7] text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
        
        <div className="flex items-center gap-3">
          <img
            src="/work/LOGO.png"
            alt="FitBrilliance Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-[#f4f0e7] font-extrabold text-xs">
              منظومة FitBrilliance ToDo4U — Coach Serag © 2026
            </p>
            <p className="text-[11px] text-[#a4aaa7]">
              نرى ما لا يراه الآخرون... لنصنع ما لا يستطيع الآخرون صنعه | جميع الحقوق والمستندات محمية وموثقة.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[#d99c43] font-bold text-xs">
          <button onClick={() => setActiveTab('home')} className="hover:text-[#f4f0e7] transition-colors cursor-pointer">الرئيسية</button>
          <button onClick={() => setActiveTab('viewer')} className="hover:text-[#f4f0e7] transition-colors cursor-pointer">المستندات والمشروع</button>
          <button onClick={() => setActiveTab('coach')} className="hover:text-[#f4f0e7] transition-colors cursor-pointer">كتاب التحليل المستقل</button>
          <button onClick={() => setActiveTab('admin')} className="hover:text-[#f4f0e7] transition-colors cursor-pointer">لوحة التحكم</button>
          <a
            href="https://wa.me/201274879442"
            target="_blank"
            rel="noreferrer"
            className="text-[#00e676] flex items-center gap-1 hover:underline"
          >
            <PhoneCall className="w-3.5 h-3.5" /> +201274879442
          </a>
        </div>
      </div>
    </footer>
  );
};
