import React, { useState } from 'react';
import { Search, ShieldAlert, X, CheckCircle, ArrowLeft, Lock, Building } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { Project } from '../types.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';

interface ProjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project, visitor: { name: string; email: string; company: string }, accessToken: string) => void;
}

export const ProjectSearchModal: React.FC<ProjectSearchModalProps> = ({ isOpen, onClose, onSelectProject }) => {
  const { showError, showSuccess } = useToast();
  const { logAction } = useLogger();

  const [step, setStep] = useState<'search' | 'auth'>('search');
  const [searchQuery, setSearchInput] = useState('');
  const [foundProject, setFoundProject] = useState<Project | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [accessCode, setAccessCode] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showError('يرجى إدخال اسم المشروع أو كود التقرير للبحث.', 'حقل البحث فارغ');
      logAction('VALIDATION', 'فشل البحث عشوائياً', 'حقل البحث فارغ');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    logAction('SEARCH', 'بحث عن مشروع', `استعلام: ${searchQuery}`);

    try {
      const query = searchQuery.trim().toLowerCase();
      const res = await axiosClient.get(`/api/projects/lookup/${encodeURIComponent(query)}`);
      const match = res.data.project as Project | undefined;
      if (!match) {
        const msg = 'لم يتم العثور على المشروع! يرجى التأكد من اسم المشروع أو الكود السري (مثال: PRJ-101).';
        setErrorMsg(msg);
        showError(msg, 'المشروع غير موجود');
        logAction('SEARCH', 'فشل العثور على مشروع', `استعلام مرفوض: ${searchQuery}`);
        setLoading(false);
        return;
      }

      setFoundProject(match);
      setStep('auth');
      showSuccess(`تم العثور على "${match.name}"، يرجى تأكيد هويتك المعتمدة.`, 'مشروع محمي');
      logAction('SEARCH', 'تم العثور على مشروع', `كود: ${match.id} | اسم: ${match.name}`);
    } catch (err: any) {
      const msg = 'فشل الاتصال بالخادم لمراجعة المشروعات المحمية.';
      setErrorMsg(msg);
      showError(msg, 'خطأ اتصال بالشبكة');
      logAction('SEARCH', 'خطأ في جلب المشاريع من الخادم', String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundProject) return;

    setErrorMsg(null);

    if (!fullName.trim()) {
      showError('يرجى إدخال الاسم الكامل كمالكه في الهوية المهنية.', 'الاسم مطلوب');
      logAction('VALIDATION', 'فشل توثيق الهوية', 'الاسم الكامل فارغ');
      return;
    }

    let finalEmail = email;
    let finalCompany = foundProject.company;

    if (foundProject.domain) {
      const requiredDomain = `@${foundProject.domain.toLowerCase()}`;
      if (!email.toLowerCase().endsWith(requiredDomain)) {
        const msg = `عذراً، هذا التقرير الفني محمي استراتيجياً. يتطلب استخدام البريد الإلكتروني المهني المنتهي بـ ${requiredDomain}`;
        setErrorMsg(msg);
        showError(msg, 'نطاق البريد غير مصرح');
        logAction('VALIDATION', 'فشل مطابقة نطاق البريد', `بريد غير مطابق: ${email} (مطلوب: ${requiredDomain})`);
        return;
      }
    } else {
      if (!whatsapp.trim() || whatsapp.trim().length < 8) {
        showError('يرجى إدخال رقم واتساب صحيح للتواصل وتأكيد الوصول.', 'رقم غير صالح');
        logAction('VALIDATION', 'فشل توثيق الواتساب', `رقم غير كافٍ: ${whatsapp}`);
        return;
      }
      finalEmail = `واتساب: ${whatsapp}`;
    }

    if (accessCode.trim().length < 32) {
      showError('أدخل رمز الدخول المرسل لك من الإدارة لفتح التقرير.', 'رمز الدخول مطلوب');
      return;
    }

    try {
      const accessResponse = await axiosClient.post(`/api/projects/${foundProject.id}/access`, { accessCode: accessCode.trim() });
      const accessToken = accessResponse.data.token as string | undefined;
      if (!accessToken) throw new Error('Missing access token');
      showSuccess(`تم تأكيد وصولك إلى التقرير (${foundProject.name}) بنجاح.`, 'دخول التقرير');
      logAction('SEARCH', 'عبور ناجح لتقرير محمي', `زائر: ${fullName} | مشروع: ${foundProject.name}`);
      onSelectProject(foundProject, { name: fullName || 'زائر مؤكد', email: finalEmail, company: finalCompany }, accessToken);
      onClose();
    } catch (e) {
      showError('رمز الدخول غير صحيح أو انتهت صلاحية المحاولة.', 'تعذر فتح التقرير');
      return;
    }
  };


  const resetModal = () => {
    setStep('search');
    setSearchInput('');
    setFoundProject(null);
    setErrorMsg(null);
    setFullName('');
    setEmail('');
    setRole('');
    setWhatsapp('');
    setAccessCode('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d0e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121819] border border-[#222d2b] w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 md:p-8 relative shadow-2xl animate-fade-in text-right">
        
        <button
          onClick={() => { resetModal(); onClose(); }}
          className="absolute left-4 top-4 text-[#a4aaa7] hover:text-[#f4f0e7] p-1 text-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-[#222d2b] pb-4 mb-6">
          <Lock className="w-5 h-5 text-[#d99c43]" />
          <h2 className="text-base font-bold text-[#f4f0e7]">البحث عن مشروع أو تقرير محمي</h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'search' ? (
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-2">
              اسم المشروع أو رقم التقرير السري
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="أدخل اسم المشروع أو رقم التقرير (مثال: PRJ-101)"
                className="w-full bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none transition-colors"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-md shadow-[#d99c43]/20"
            >
              {loading ? 'جاري التحقق...' : 'التحقق من وجود المشروع'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div className="bg-[#d99c43]/15 border border-[#d99c43]/40 p-3 rounded-xl text-xs text-[#d99c43] leading-relaxed font-mono font-bold">
              <strong>مشروع محمي:</strong> {foundProject?.name} ({foundProject?.company})
              {foundProject?.domain ? ` - يتطلب توثيق البريد المهني: @${foundProject.domain}` : ' - توثيق الواتساب المباشر'}
            </div>

            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              الاسم الكامل
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسمك الكامل كما بالهوية المهنية"
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            {foundProject?.domain ? (
              <>
                <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                  المسمى الوظيفي / المنصب
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="مثال: مدير الاستراتيجية / الرئيس التنفيذي"
                    className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                  />
                </label>

                <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                  البريد الإلكتروني المهني (@{foundProject.domain})
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`name@${foundProject.domain}`}
                    className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                  />
                </label>
              </>
            ) : (
              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                رقم الواتساب للتأكيد والتواصل
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="01xxxxxxxx"
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                />
              </label>
            )}

            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
              رمز الدخول الخاص بالتقرير
              <input
                type="password"
                required
                minLength={32}
                autoComplete="one-time-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="أدخله كما وصلك من الإدارة"
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
              />
            </label>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-[#d99c43]/20"
              >
                تأكيد الهوية والدخول للتقرير
              </button>
              
              <button
                type="button"
                onClick={() => setStep('search')}
                className="px-4 border border-[#222d2b] hover:bg-[#1a2325] text-[#a4aaa7] font-bold rounded-xl text-xs transition-colors"
              >
                رجوع
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
