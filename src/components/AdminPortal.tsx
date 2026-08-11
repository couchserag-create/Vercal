import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Plus, Trash2, Edit3, Save, Database, Key, AlertTriangle, RefreshCw, Download, Terminal, Eye, Film, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';
import { HostingExporter } from './HostingExporter.tsx';
import axiosClient from '../api/axiosClient.ts';
import { Project, AuditLog, MediaAttachment } from '../types.ts';

export const AdminPortal: React.FC = () => {
  const { user, isAuthenticated, login, error: authError } = useAuth();
  const { showError, showSuccess } = useToast();
  const { logs: clientLogs, logAction, clearLogs: clearClientLogs, exportLogs: exportClientLogs } = useLogger();

  const [email, setEmail] = useState('couch.serag@gmail.com');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logTab, setLogTab] = useState<'client' | 'server'>('client');
  const [loadingData, setLoadingLoadingData] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);


  // Form State for Project
  const [projId, setProjId] = useState('PRJ-2026');
  const [projName, setProjName] = useState('استراتيجية النمو 90 يوم');
  const [projCompany, setProjCompany] = useState('شركة النماذج المتقدمة');
  const [projClientName, setProjClientName] = useState('أ.د / محمد علي');
  const [projDomain, setProjDomain] = useState('company.com');
  const [projPageCount, setProjPageCount] = useState(12);
  const [projRoi, setProjRoi] = useState('320% خلال 6 أشهر');
  const [analysisContent, setAnalysisContent] = useState('## كتاب التحليل الشامل\nتشخيص الفجوة الميدانية وتفكيك المعتقدات الإخفاقية.');
  const [planContent, setPlanContent] = useState('## الخطة الترويجية 90 يوم\nجدول النشر اليومي وحملات التفاعل المباشر.');
  
  // Media Attachments State
  const [projMedia, setProjMedia] = useState<MediaAttachment[]>([
    { id: 'm1', type: 'video', title: 'الفيديو التعريفي بالخطة الاستراتيجية', url: '/media/intro-plan.mp4', caption: 'فيديو مدمج مباشر من الخادم بمسار /media' },
    { id: 'm2', type: 'image', title: 'مخطط الهيكل والتحول التشغيلي', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80', caption: 'صورة توضيحية خريطة الطريق والمخرجات' }
  ]);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaType, setNewMediaType] = useState<'video' | 'image'>('video');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) {
      alert('يرجى كتابة رابط أو مسار ملف الميديا (مثال: /media/video1.mp4 أو رابط خارجي)');
      return;
    }
    const newItem: MediaAttachment = {
      id: `m_${Date.now()}`,
      type: newMediaType,
      title: newMediaTitle.trim() || (newMediaType === 'video' ? 'فيديو مرفق' : 'صورة مرفقة'),
      url: newMediaUrl.trim(),
      caption: newMediaCaption.trim()
    };
    setProjMedia(prev => [...prev, newItem]);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaCaption('');
  };

  const handleRemoveMedia = (id: string) => {
    setProjMedia(prev => prev.filter(m => m.id !== id));
  };
  
  // Budget Months State
  const [m1Videos, setM1Videos] = useState(8);
  const [m1VideoCost, setM1VideoCost] = useState(2500);
  const [m1Ads, setM1Ads] = useState(4);
  const [m1AdCost, setM1AdCost] = useState(3000);
  const [m1Platforms, setM1Platforms] = useState('فيس بوك · انستغرام · تيك توك');
  const [m1PlatformCost, setM1PlatformCost] = useState(5000);

  const [m2Videos, setM2Videos] = useState(6);
  const [m2VideoCost, setM2VideoCost] = useState(2500);
  const [m2Ads, setM2Ads] = useState(4);
  const [m2AdCost, setM2AdCost] = useState(3500);
  const [m2Target, setM2Target] = useState(75);

  const [m3Videos, setM3Videos] = useState(4);
  const [m3VideoCost, setM3VideoCost] = useState(2500);
  const [m3Ads, setM3Ads] = useState(3);
  const [m3AdCost, setM3AdCost] = useState(3000);
  const [m3Change, setM3Change] = useState(85);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  const fetchAdminData = async () => {
    setLoadingLoadingData(true);
    try {
      const pRes = await axiosClient.get('/api/projects');
      setProjects(pRes.data.projects || []);

      const lRes = await axiosClient.get('/api/ledger');
      setAuditLogs(lRes.data.auditLogs || []);
    } catch (e) {
      console.warn('Admin fetch error');
    } finally {
      setLoadingLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    await login(email, password);
    setLoginLoading(false);
  };

  const calculateBudgetTotals = () => {
    const m1Tot = (m1Videos * m1VideoCost) + (m1Ads * m1AdCost) + m1PlatformCost;
    const m2Tot = (m2Videos * m2VideoCost) + (m2Ads * m2AdCost);
    const m3Tot = (m3Videos * m3VideoCost) + (m3Ads * m3AdCost);
    const totalCost = m1Tot + m2Tot + m3Tot;
    return { m1Tot, m2Tot, m3Tot, totalCost };
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const { m1Tot, m2Tot, m3Tot, totalCost } = calculateBudgetTotals();

    const payload = {
      id: projId.trim(),
      name: projName.trim(),
      company: projCompany.trim(),
      clientName: projClientName.trim(),
      domain: projDomain.trim(),
      analysisPageCount: projPageCount,
      analysisRefCode: `ANL-${projId.toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}-ONLY`,
      analysisContent,
      planContent,
      month1: {
        videosCount: m1Videos,
        videoCost: m1VideoCost,
        totalVideoCost: m1Videos * m1VideoCost,
        adsCount: m1Ads,
        adCost: m1AdCost,
        totalAdCost: m1Ads * m1AdCost,
        platforms: m1Platforms,
        platformCost: m1PlatformCost,
        totalMonth1: m1Tot
      },
      month2: {
        videosCount: m2Videos,
        videoCost: m2VideoCost,
        totalVideoCost: m2Videos * m2VideoCost,
        adsCount: m2Ads,
        adCost: m2AdCost,
        totalAdCost: m2Ads * m2AdCost,
        targetPercent: m2Target,
        totalMonth2: m2Tot
      },
      month3: {
        videosCount: m3Videos,
        videoCost: m3VideoCost,
        totalVideoCost: m3Videos * m3VideoCost,
        adsCount: m3Ads,
        adCost: m3AdCost,
        totalAdCost: m3Ads * m3AdCost,
        changePercent: m3Change,
        totalMonth3: m3Tot
      },
      financialSummary: {
        totalCost,
        expectedROI: projRoi
      },
      mediaAttachments: projMedia,
      content: planContent || analysisContent
    };

    try {
      await axiosClient.post('/api/projects', payload);
      setStatusMsg('✅ تم حفظ المشروع بنجاح ومزامنته بالنظام.');
      fetchAdminData();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'فشل حفظ المشروع.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm(`حذف المشروع (${id}) نهائياً؟`)) return;
    try {
      await axiosClient.delete(`/api/projects/${id}`);
      fetchAdminData();
    } catch (e) {
      alert('فشل حذف المشروع.');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="py-12 max-w-md mx-auto text-right">
        <div className="bg-[#121819] border border-[#222d2b] p-8 rounded-2xl shadow-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-[#222d2b] pb-4">
            <Lock className="w-6 h-6 text-[#d99c43]" />
            <div>
              <h2 className="text-base font-bold text-[#f4f0e7]">دخول لوحة التحكم الإدارية</h2>
              <p className="text-xs text-[#a4aaa7]">أدخل كلمة السر والمصادقة لإدارة المشروعات</p>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              بريد المدير المسجل
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              كلمة السر الإدارية
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة السر"
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-md shadow-[#d99c43]/20"
            >
              {loginLoading ? 'جاري التحقق...' : 'تأكيد ودخول لوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { m1Tot, m2Tot, m3Tot, totalCost } = calculateBudgetTotals();

  return (
    <div className="flex flex-col gap-6 py-6 text-right">
      
      {/* Admin Header Bar */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-[#00e676]" />
          <div>
            <h1 className="text-base font-bold text-[#f4f0e7]">لوحة التحكم والنمذجة التشغيلية 2026</h1>
            <p className="text-xs text-[#a4aaa7] font-mono">أهلاً كوتش سراج — الجلسة مؤمنة برمز JWT ببروتوكول Bcrypt</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="bg-[#090d0e] hover:bg-[#1a2325] text-[#45f3ff] border border-[#222d2b] text-xs font-mono px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-xs font-mono rounded-xl font-bold">
          {statusMsg}
        </div>
      )}

      {/* Main Grid: Form Left, Projects Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Project Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
          <h2 className="text-base font-bold text-[#f4f0e7] border-b border-[#222d2b] pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#d99c43]" />
            رفع مشروع أو خطة نمذجة جديدة
          </h2>

          <form onSubmit={handleSaveProject} className="flex flex-col gap-4">
            
            {/* Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                رقم / كود المشروع *
                <input
                  type="text"
                  required
                  value={projId}
                  onChange={(e) => setProjId(e.target.value)}
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>

              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                اسم المشروع *
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                اسم الشركة المعنية *
                <input
                  type="text"
                  required
                  value={projCompany}
                  onChange={(e) => setProjCompany(e.target.value)}
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>

              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                اسم العميل / رئيس مجلس الإدارة
                <input
                  type="text"
                  value={projClientName}
                  onChange={(e) => setProjClientName(e.target.value)}
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                دومين البريد المسموح (فارغ = توثيق واتساب)
                <input
                  type="text"
                  value={projDomain}
                  onChange={(e) => setProjDomain(e.target.value)}
                  placeholder="company.com"
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>

              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                العائد الاستثماري المتوقع (ROI)
                <input
                  type="text"
                  value={projRoi}
                  onChange={(e) => setProjRoi(e.target.value)}
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-3.5 py-2 text-xs text-[#f4f0e7] outline-none"
                />
              </label>
            </div>

            {/* Budget Month 1 */}
            <div className="p-4 bg-[#090d0e] border-r-2 border-[#d99c43] border-y border-l border-[#222d2b] rounded-xl flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[#d99c43]">الشهر الأول — التأسيس</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="فيديوهات"
                  value={m1Videos}
                  onChange={(e) => setM1Videos(Number(e.target.value))}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#f4f0e7]"
                />
                <input
                  type="number"
                  placeholder="تكلفة الفيديو"
                  value={m1VideoCost}
                  onChange={(e) => setM1VideoCost(Number(e.target.value))}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#f4f0e7]"
                />
                <input
                  type="number"
                  placeholder="إجمالي الإعلانات"
                  value={m1Ads * m1AdCost}
                  readOnly
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#d99c43] font-mono font-bold"
                />
              </div>
            </div>

            {/* Content Text Areas */}
            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              محتوى كتاب التحليل المستقل
              <textarea
                rows={3}
                value={analysisContent}
                onChange={(e) => setAnalysisContent(e.target.value)}
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl p-3 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              محتوى الخطة الترويجية 90 يوم
              <textarea
                rows={3}
                value={planContent}
                onChange={(e) => setPlanContent(e.target.value)}
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl p-3 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            {/* Media Attachments Manager Section */}
            <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#222d2b] pb-2">
                <span className="text-xs font-bold text-[#f4f0e7] flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[#d99c43]" />
                  مرفقات الوسائط المباشرة (فيديوهات وصور للعرض داخل التقرير)
                </span>
                <span className="text-[10px] text-[#a4aaa7] font-mono">
                  {projMedia.length} مرفق
                </span>
              </div>

              {/* Form to add new media item */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="عنوان المرفق (مثال: فيديو العرض التوضيحي)"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#f4f0e7] outline-none"
                />

                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as 'video' | 'image')}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#f4f0e7] outline-none"
                >
                  <option value="video">🎥 فيديو (.mp4 / .webm / يوتيوب)</option>
                  <option value="image">🖼️ صورة (.jpg / .png / .svg)</option>
                </select>

                <input
                  type="text"
                  placeholder="رابط الميديا أو مسار المجلد (مثال: /media/video1.mp4 أو رابط)"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#45f3ff] font-mono outline-none sm:col-span-2"
                />

                <input
                  type="text"
                  placeholder="وصف مختصر لمرفق الفيديو أو الصورة (اختياري)"
                  value={newMediaCaption}
                  onChange={(e) => setNewMediaCaption(e.target.value)}
                  className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg text-[#f4f0e7] outline-none sm:col-span-2"
                />

                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] hover:bg-[#00e676]/30 font-bold p-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:col-span-2"
                >
                  <Plus className="w-4 h-4" /> إدراج المرفق في قائمة المشروع
                </button>
              </div>

              {/* Current Attachments List */}
              {projMedia.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {projMedia.map((m) => (
                    <div key={m.id} className="bg-[#121819] border border-[#222d2b] p-2 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {m.type === 'video' ? <Video className="w-3.5 h-3.5 text-[#d99c43] shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 text-[#45f3ff] shrink-0" />}
                        <span className="text-[#f4f0e7] font-bold truncate">{m.title}</span>
                        <span className="text-[10px] text-[#a4aaa7] font-mono truncate">({m.url})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(m.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs mt-2 shadow-md shadow-[#d99c43]/20"
            >
              <Save className="w-4 h-4" />
              حفظ ورفع التحديثات في النظام المشفر
            </button>

          </form>
        </div>

        {/* Right Side: Projects List & Ledger Logs (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Projects List */}
          <div className="bg-[#121819] border border-[#222d2b] p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#f4f0e7] border-b border-[#222d2b] pb-2">
              المشاريع المحفوظة بالنظام ({projects.length})
            </h3>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {projects.map((p) => (
                <div key={p.id} className="bg-[#090d0e] border border-[#222d2b] p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#d99c43] font-mono block">{p.name}</strong>
                    <span className="text-[11px] text-[#a4aaa7]">{p.company} ({p.id})</span>
                  </div>

                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="حذف المشروع"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Ledger & Global State Interactions Tracker */}
          <div className="bg-[#121819] border border-[#222d2b] p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#222d2b] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#45f3ff]" />
                <h3 className="text-sm font-bold text-[#f4f0e7]">سجلات التوثيق والأحداث</h3>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-[#090d0e] p-1 rounded-xl border border-[#222d2b] text-[11px] font-bold">
                <button
                  onClick={() => setLogTab('client')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    logTab === 'client' ? 'bg-[#d99c43] text-[#0b0c10]' : 'text-[#a4aaa7] hover:text-[#f4f0e7]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  التفاعلات المباشرة ({clientLogs.length})
                </button>
                <button
                  onClick={() => setLogTab('server')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    logTab === 'server' ? 'bg-[#d99c43] text-[#0b0c10]' : 'text-[#a4aaa7] hover:text-[#f4f0e7]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  سجل الخادم ({auditLogs.length})
                </button>
              </div>
            </div>

            {logTab === 'client' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-[#a4aaa7]">
                  <span>تتبع حالة التطبيق والتفاعلات (Global State Logger)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportClientLogs}
                      className="text-[#45f3ff] hover:underline flex items-center gap-1"
                      title="تصدير السجل بتنسيق JSON"
                    >
                      <Download className="w-3 h-3" /> تصدير
                    </button>
                    <span>|</span>
                    <button
                      onClick={clearClientLogs}
                      className="text-rose-400 hover:underline flex items-center gap-1"
                      title="مسح السجل المؤقت"
                    >
                      <Trash2 className="w-3 h-3" /> مسح
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 text-xs">
                  {clientLogs.length === 0 ? (
                    <div className="p-4 text-center text-[#a4aaa7] text-xs">لا توجد تفاعلات مسجلة حالياً.</div>
                  ) : (
                    clientLogs.map((log) => {
                      const catColor =
                        log.category === 'VALIDATION'
                          ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          : log.category === 'AUTH'
                          ? 'text-[#d99c43] border-[#d99c43]/30 bg-[#d99c43]/10'
                          : log.category === 'SEARCH'
                          ? 'text-[#45f3ff] border-[#45f3ff]/30 bg-[#45f3ff]/10'
                          : 'text-[#00e676] border-[#00e676]/30 bg-[#00e676]/10';

                      return (
                        <div key={log.id} className="bg-[#090d0e] border border-[#222d2b] p-2.5 rounded-xl flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${catColor}`}>
                              {log.category}
                            </span>
                            <span className="text-[10px] font-mono text-[#a4aaa7]">{log.timestamp}</span>
                          </div>
                          <div className="font-bold text-[#f4f0e7] mt-0.5">{log.action}</div>
                          {log.details && <div className="text-[11px] text-[#a4aaa7] font-mono">{log.details}</div>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 text-xs">
                {auditLogs.length === 0 ? (
                  <div className="p-4 text-center text-[#a4aaa7] text-xs">لا توجد سجلات بالنظام الأمني بعد.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="bg-[#090d0e] border border-[#222d2b] p-2.5 rounded-xl flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[#d99c43]">
                        <span className="font-bold">{log.eventType}</span>
                        <span className="text-[10px] font-mono text-[#a4aaa7]">{log.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-[#a4aaa7]">
                        الاسم: {log.name} | الشركة: {log.company} {log.details ? `| ${log.details}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Direct Hosting Exporter Package Section */}
      <HostingExporter />

    </div>
  );
};
