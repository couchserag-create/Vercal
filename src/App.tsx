import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { LoggerProvider, useLogger } from './context/LoggerContext.tsx';
import { AutoLogoutHandler } from './components/AutoLogoutHandler.tsx';
import { WatermarkGuard } from './components/WatermarkGuard.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProjectViewer } from './components/ProjectViewer.tsx';
import { CoachBooklet } from './components/CoachBooklet.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { BackupManager } from './components/BackupManager.tsx';
import { ApiDocsView } from './components/ApiDocsView.tsx';
import { ProjectSearchModal } from './components/ProjectSearchModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TwoFactorModal } from './components/TwoFactorModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Project } from './types.ts';
import { useAuth } from './context/AuthContext.tsx';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);

  const { logAction } = useLogger();
  const { user } = useAuth();

  // Selected Project for Viewer
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-101');
  const [projectAccessToken, setProjectAccessToken] = useState<string | null>(null);
  const [visitorInfo, setVisitorInfo] = useState<{ name: string; email: string; company: string }>({
    name: 'زائر مؤكد',
    email: 'client@company.com',
    company: 'FitBrilliance'
  });

  const [isObscured, setIsObscured] = useState(false);
  const watermarkVisitor = user
    ? { name: user.name, email: user.email, company: user.company || 'FitBrilliance' }
    : visitorInfo;

  // Clear clipboard immediately upon copy attempt
  useEffect(() => {
    const handleGlobalCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
      logAction('SYSTEM', 'محاولة نسخ ملغاة مع تفريغ الحافظة فورياً');
    };

    window.addEventListener('copy', handleGlobalCopy, true);
    return () => window.removeEventListener('copy', handleGlobalCopy, true);
  }, [logAction]);

  // Document Hidden & Window Blur Listener (Blur screen on tab switch or unfocus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
      } else {
        setIsObscured(false);
      }
    };

    const handleBlur = () => {
      setIsObscured(true);
    };

    const handleFocus = () => {
      setIsObscured(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const tabNames: Record<string, string> = {
      home: 'الرئيسية',
      viewer: 'استعراض التقرير',
      coach: 'كتاب التحليل المستقل',
      admin: 'لوحة التحكم الإدارية',
      backup: 'إدارة النسخ الاحتياطية',
      apidocs: 'توثيق API'
    };
    logAction('NAVIGATION', 'تنقل بين الصفحات', `الانتقال إلى تبويب: ${tabNames[tab] || tab}`);
  };

  const handleSelectProject = (project: Project, visitor: { name: string; email: string; company: string }, accessToken: string) => {
    setSelectedProjectId(project.id);
    setVisitorInfo(visitor);
    setProjectAccessToken(accessToken);
    setActiveTab('viewer');
    logAction('SEARCH', 'عرض مشروع محدد', `كود: ${project.id} | اسم: ${project.name}`);
  };

  const handleExploreProject = (projId: string) => {
    setSelectedProjectId(projId);
    setActiveTab('viewer');
    logAction('NAVIGATION', 'استكشاف مشروع سريع', `كود المشروع: ${projId}`);
  };

  return (
    <div className="min-h-screen bg-[#090d0e] text-[#f4f0e7] font-sans dir-rtl select-none">
      
      {/* Global Anti-DevTools, Anti-Copy & Anti-Leak Watermark Protection */}
      <WatermarkGuard
        visitor={watermarkVisitor}
        enableWatermark={activeTab === 'viewer' || activeTab === 'coach'}
        enableProtection={true}
      />

      {/* Auto Logout Security Handler */}
      <AutoLogoutHandler onAutoLogout={() => setActiveTab('home')} />

      {/* Document Hidden & Window Blur Security Obscure Screen */}
      {isObscured && (
        <div className="fixed inset-0 z-[100] bg-[#090d0e]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-4 text-center p-6 select-none border-4 border-[#00e676]/40">
          <div className="p-4 bg-[#00e676]/10 rounded-full border border-[#00e676]/40 animate-pulse">
            <Lock className="w-12 h-12 text-[#00e676]" />
          </div>
          <h2 className="text-xl font-black text-[#f4f0e7]">المحتوى محجب أمنياً (حماية الأمان المشدد)</h2>
          <p className="text-xs text-[#a4aaa7] max-w-md leading-relaxed">
            تم حجب الشاشة وتضبيبها تلقائياً عند مغادرة النافذة أو التنقل بين التبويبات لمنع التسريب والالتقاط.
          </p>
          <span className="text-[11px] font-mono text-[#00e676] bg-[#00e676]/10 px-3.5 py-1.5 rounded-lg border border-[#00e676]/30">
            الرجاء العودة للنافذة المباشرة لإلغاء الحجب
          </span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openAuthModal={() => {
          setAuthModalOpen(true);
          logAction('AUTH', 'فتح نافذة الدخول', 'النقر على زر دخول/تسجيل');
        }}
        open2FAModal={() => {
          setTwoFactorModalOpen(true);
          logAction('AUTH', 'فتح نافذة 2FA', 'النقر على إعدادات التحقق الثنائي');
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {activeTab === 'home' && (
          <HeroSection
            openSearchModal={() => {
              setSearchModalOpen(true);
              logAction('SEARCH', 'فتح نافذة البحث عن مشروع', 'النقر على البحث بالهيرو');
            }}
            openStrategyModal={() => {
              setSearchModalOpen(true);
              logAction('SEARCH', 'فتح نافذة الخطة الاستراتيجية', 'النقر على استعراض الاستراتيجية');
            }}
            openJoinModal={() => {
              setSearchModalOpen(true);
              logAction('SEARCH', 'فتح نافذة الانضمام', 'النقر على طلب انضمام');
            }}
            onExploreProject={handleExploreProject}
          />
        )}

        {activeTab === 'viewer' && (
          <ProjectViewer
            projectId={selectedProjectId}
            visitor={visitorInfo}
            accessToken={projectAccessToken}
            onBack={() => handleTabChange('home')}
          />
        )}

        {activeTab === 'coach' && <CoachBooklet />}

        {activeTab === 'admin' && <AdminPortal />}

        {activeTab === 'backup' && <BackupManager />}

        {activeTab === 'apidocs' && <ApiDocsView />}
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleTabChange} />

      {/* Modals */}
      <ProjectSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProject={handleSelectProject}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        open2FAModal={() => setTwoFactorModalOpen(true)}
      />

      <TwoFactorModal
        isOpen={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LoggerProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </LoggerProvider>
  );
}
