import React, { useState } from 'react';
import { ShieldCheck, Lock, ShieldAlert, Key, User as UserIcon, LogOut, Terminal, Database, PhoneCall, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
  open2FAModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal, open2FAModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#090d0e]/95 backdrop-blur-md border-b border-[#222d2b] px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="flex items-center gap-3">
            <img
              src="/work/LOGO.png"
              alt="FitBrilliance Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(217,156,67,0.3)]"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-[#f4f0e7] tracking-tight leading-none">
                FitBrilliance
              </span>
              <span className="text-[10px] font-mono text-[#d99c43] mt-0.5">
                منظومة التحول والريادة
              </span>
            </div>
            <span className="hidden sm:flex px-2.5 py-0.5 rounded-full bg-[#00e676]/10 text-[#00e676] text-[11px] font-mono border border-[#00e676]/30 items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#00e676]" /> SECURED
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#a4aaa7]">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'home' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            الرئيسية
          </button>
          
          <button
            onClick={() => setActiveTab('viewer')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'viewer' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            استعراض التقرير والمشروع
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'coach' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            كتاب التحليل المستقل (12 فصل)
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            <Lock className="w-3.5 h-3.5 text-[#d99c43]" />
            لوحة الإدارة والأمان
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'backup' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            <Database className="w-3.5 h-3.5 text-[#00e676]" />
            النسخ الاحتياطي
          </button>

          <button
            onClick={() => setActiveTab('apidocs')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'apidocs' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40' : 'hover:bg-[#121819] hover:text-[#f4f0e7]'}`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#45f3ff]" />
            توثيق API
          </button>
        </div>

        {/* Auth & Security Status */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-[#121819] border border-[#222d2b] p-1.5 px-3 rounded-xl">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#f4f0e7]">{user?.name}</span>
                <span className="text-[10px] text-[#a4aaa7] flex items-center gap-1 font-mono">
                  {user?.is2FAEnabled ? (
                    <span className="text-[#00e676] flex items-center gap-0.5"><ShieldCheck className="w-2.5 h-2.5" /> 2FA ACTIVE</span>
                  ) : (
                    <span className="text-[#d99c43] flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" /> 2FA OFF</span>
                  )}
                </span>
              </div>

              <button
                onClick={open2FAModal}
                title="إعداد التحقق الثنائي 2FA"
                className="p-1.5 bg-[#d99c43]/10 hover:bg-[#d99c43]/20 border border-[#d99c43]/30 rounded text-[#d99c43] transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={logout}
                title="تسجيل الخروج"
                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-[#d99c43]/20 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              تسجيل الدخول / حماية
            </button>
          )}

          <a
            href="https://wa.me/201274879442"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-[#00e676]/15 hover:bg-[#00e676]/25 border border-[#00e676]/40 text-[#00e676] text-xs font-mono font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            واتساب مباشر
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#f4f0e7] border border-[#222d2b] rounded-lg bg-[#121819]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#222d2b] flex flex-col gap-1.5 pb-2 text-xs">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'home' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => { setActiveTab('viewer'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'viewer' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            استعراض التقرير والمشروع
          </button>
          <button
            onClick={() => { setActiveTab('coach'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'coach' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            كتاب التحليل المستقل (12 فصل)
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'admin' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            لوحة الإدارة والأمان
          </button>
          <button
            onClick={() => { setActiveTab('backup'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'backup' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            النسخ الاحتياطي المشفر
          </button>
          <button
            onClick={() => { setActiveTab('apidocs'); setMobileMenuOpen(false); }}
            className={`text-right px-4 py-2 rounded-lg ${activeTab === 'apidocs' ? 'bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 font-bold' : 'text-[#a4aaa7]'}`}
          >
            توثيق API
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
              className="mt-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-lg text-xs"
            >
              تسجيل الدخول / حماية الحساب
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
