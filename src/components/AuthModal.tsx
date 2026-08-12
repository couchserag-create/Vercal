import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Mail, Building, X, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  open2FAModal: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, open2FAModal }) => {
  const { login, register, verify2FACode, is2FARequired, error, clearError } = useAuth();
  const { showError, showSuccess } = useToast();
  const { logAction } = useLogger();

  const [mode, setMode] = useState<'login' | 'register' | '2fa'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 1. Validation for 2FA
    if (mode === '2fa' || is2FARequired) {
      if (!code2FA.trim() || code2FA.trim().length < 6) {
        showError('يرجى إدخال رمز التحقق الثنائي المكون من 6 أرقام بالكامل.', 'خطأ في إدخال الرمز');
        logAction('VALIDATION', 'فشل التحقق من رمز 2FA', 'الرمز فارغ أو غير مكتمل');
        return;
      }

      setLoading(true);
      logAction('AUTH', 'محاولة إدخال رمز 2FA', `رمز: ${code2FA}`);
      const ok = await verify2FACode(code2FA);
      setLoading(false);

      if (ok) {
        showSuccess('تمت المصادقة الثنائية وتأكيد الدخول بنجاح!', 'دخول آمن');
        logAction('AUTH', 'نجاح المصادقة الثنائية 2FA', 'تم الدخول للنظام بنجاح');
        onClose();
      } else {
        showError(error || 'رمز التحقق الثنائي غير صحيح، يرجى المحاولة مرة أخرى.');
        logAction('AUTH', 'فشل رمز التحقق الثنائي', `رمز مرفوض: ${code2FA}`);
      }
      return;
    }

    // 2. Validation for Login
    if (mode === 'login') {
      if (!email || !email.includes('@') || !email.includes('.')) {
        showError('يرجى إدخال بريد إلكتروني صحيح ومعتمد.', 'خطأ في البريد الإلكتروني');
        logAction('VALIDATION', 'فشل مدخل البريد الإلكتروني', `البريد غير صحيح: ${email}`);
        return;
      }

      if (!password || password.length < 6) {
        showError('كلمة السر يجب أن تحتوي على 6 أحرف أو أرقام على الأقل.', 'خطأ في كلمة السر');
        logAction('VALIDATION', 'فشل مدخل كلمة السر', 'كلمة السر قصيرة جداً');
        return;
      }

      setLoading(true);
      logAction('AUTH', 'محاولة تسجيل الدخول', `البريد: ${email}`);
      const ok = await login(email, password);
      setLoading(false);

      if (ok) {
        showSuccess(`مرحباً بك مجدداً! تم تسجيل الدخول بنجاح.`, 'تسجيل دخول ناجح');
        logAction('AUTH', 'نجاح تسجيل الدخول', `المستخدم: ${email}`);
        onClose();
      } else if (is2FARequired) {
        setMode('2fa');
        showSuccess('يرجى إدخال رمز التحقق الثنائي لإكمال الدخول.', '2FA مطلوب');
        logAction('AUTH', 'طلب التحقق الثنائي 2FA', `البريد: ${email}`);
      } else {
        showError('بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة السر.');
        logAction('AUTH', 'فشل تسجيل الدخول', `بيانات مرفوضة للبريد: ${email}`);
      }
      return;
    }

    // 3. Validation for Registration
    if (mode === 'register') {
      if (!name.trim()) {
        showError('يرجى كتابة الاسم الكامل المعتمد.', 'حقل الاسم مطلوب');
        logAction('VALIDATION', 'فشل مدخل الاسم', 'حقل الاسم فارغ');
        return;
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        showError('يرجى إدخال بريد إلكتروني صحيح لإنشاء الحساب.', 'بريد غير صالح');
        logAction('VALIDATION', 'فشل بريد التسجيل', `بريد غير صالح: ${email}`);
        return;
      }

      if (!password || password.length < 6) {
        showError('كلمة السر يجب أن لا تقل عن 6 أحرف لتوفير مستوى حماية كافٍ.', 'كلمة سر ضعيفة');
        logAction('VALIDATION', 'فشل كلمة سر التسجيل', 'كلمة السر أقل من 6 أحرف');
        return;
      }

      setLoading(true);
      logAction('AUTH', 'محاولة إنشاء حساب جديد', `الاسم: ${name} | البريد: ${email}`);
      const ok = await register(name, email, password, company);
      setLoading(false);

      if (ok) {
        showSuccess('تم إنشاء حسابك المشفر بنجاح وتسجيل دخولك تلقائياً!', 'حساب جديد');
        logAction('AUTH', 'نجاح إنشاء حساب جديد', `تم التسجيل بنجاح للبريد: ${email}`);
        onClose();
      } else {
        showError('تعذر إنشاء الحساب، قد يكون البريد الإلكتروني مستخدماً بالفعل.');
        logAction('AUTH', 'فشل إنشاء الحساب', `البريد: ${email}`);
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#090d0e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121819] border border-[#222d2b] w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 md:p-8 relative shadow-2xl text-right">
        
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-[#a4aaa7] hover:text-[#f4f0e7] p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-[#222d2b] pb-4 mb-6">
          <ShieldCheck className="w-5 h-5 text-[#d99c43]" />
          <h2 className="text-base font-bold text-[#f4f0e7]">
            {mode === '2fa' ? 'التحقق الثنائي (2FA)' : mode === 'login' ? 'تسجيل الدخول الآمن' : 'إنشاء حساب جديد مشفر'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {mode === '2fa' || is2FARequired ? (
            <div className="flex flex-col gap-3 text-center">
              <Key className="w-8 h-8 text-[#d99c43] mx-auto" />
              <p className="text-xs text-[#a4aaa7]">
                يرجى إدخال رمز التحقق المكون من 6 أرقام من تطبيق Authenticator الخاص بك.
              </p>

              <input
                type="text"
                required
                maxLength={6}
                value={code2FA}
                onChange={(e) => setCode2FA(e.target.value)}
                placeholder="123456"
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-center text-lg font-mono text-[#f4f0e7] tracking-widest outline-none"
              />
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                  الاسم الكامل
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                  />
                </label>
              )}

              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                البريد الإلكتروني
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                />
              </label>

              <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                كلمة السر
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                />
              </label>

              {mode === 'register' && (
                <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5">
                  اسم الشركة (اختياري)
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="اسم الجهة أو الشركة"
                    className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-xs text-[#f4f0e7] outline-none"
                  />
                </label>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-[#d99c43]/20"
          >
            {loading ? 'جاري المعالجة...' : mode === '2fa' ? 'تأكيد الرمز والدخول' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب المشفر'}
          </button>
        </form>

        {mode !== '2fa' && !is2FARequired && (
          <div className="mt-4 pt-4 border-t border-[#222d2b] text-center text-xs text-[#a4aaa7]">
            {mode === 'login' ? (
              <p>
                ليس لديك حساب؟{' '}
                <button onClick={() => setMode('register')} className="text-[#d99c43] font-bold hover:underline">
                  إنشاء حساب جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button onClick={() => setMode('login')} className="text-[#d99c43] font-bold hover:underline">
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
