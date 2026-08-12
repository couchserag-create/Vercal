import React, { useState } from 'react';
import { ShieldCheck, Key, X, QrCode, Check } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<'initial' | 'setup' | 'enabled'>('initial');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const startSetup = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await axiosClient.post('/api/auth/2fa/setup');
      setQrCodeUrl(res.data.qrCodeUrl);
      setSecret(res.data.secret);
      setStep('setup');
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'فشل التمهيد لإعداد 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await axiosClient.post('/api/auth/2fa/confirm', { code });
      setMsg(res.data.message);
      setStep('enabled');
      refreshUser();
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'رمز 2FA غير صحيح.');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('هل أنت تأكد من تعطيل حماية التحقق الثنائي (2FA)؟')) return;
    setLoading(true);
    try {
      await axiosClient.post('/api/auth/2fa/disable');
      refreshUser();
      onClose();
    } catch (e) {
      setMsg('فشل تعطيل 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d0e]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121819] border border-[#222d2b] w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 relative shadow-2xl text-right">
        
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-[#a4aaa7] hover:text-[#f4f0e7] p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-[#222d2b] pb-4 mb-6">
          <Key className="w-5 h-5 text-[#d99c43]" />
          <h2 className="text-base font-bold text-[#f4f0e7]">إعداد نظام التحقق الثنائي (2FA)</h2>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-[#d99c43]/15 border border-[#d99c43]/30 text-[#d99c43] text-xs font-mono rounded-xl font-bold">
            {msg}
          </div>
        )}

        {user?.is2FAEnabled || step === 'enabled' ? (
          <div className="flex flex-col gap-4 text-center items-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#f4f0e7]">حماية 2FA مفعّلة بنجاح!</h3>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              حسابك محمي بالكامل برمز TOTP المتغير كل 30 ثانية عبر تطبيق Google Authenticator.
            </p>

            <button
              onClick={disable2FA}
              disabled={loading}
              className="mt-2 text-xs text-rose-400 hover:text-rose-300 underline font-mono"
            >
              تعطيل حماية 2FA للحساب
            </button>
          </div>
        ) : step === 'initial' ? (
          <div className="flex flex-col gap-4 text-center items-center py-2">
            <QrCode className="w-10 h-10 text-[#d99c43]" />
            <h3 className="text-sm font-bold text-[#f4f0e7]">تأمين الحساب برمز QR وتطبيق Authenticator</h3>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              قم بمسح رمز QR باستخدام تطبيق Google Authenticator أو Authy للحصول على رمز الدخول الثنائي المكون من 6 أرقام.
            </p>

            <button
              onClick={startSetup}
              disabled={loading}
              className="mt-2 w-full bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-[#d99c43]/20"
            >
              {loading ? 'جاري التمهيد...' : 'البدء في مسح QR Code'}
            </button>
          </div>
        ) : (
          <form onSubmit={confirmCode} className="flex flex-col gap-4 items-center">
            {qrCodeUrl && (
              <div className="bg-white p-3 rounded-xl border border-[#222d2b]">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain" />
              </div>
            )}

            {secret && (
              <div className="text-[11px] font-mono text-[#45f3ff] bg-[#090d0e] p-2 rounded-xl border border-[#222d2b] w-full text-center">
                المفتاح السري: {secret}
              </div>
            )}

            <label className="text-xs font-bold text-[#f4f0e7] flex flex-col gap-1.5 w-full">
              أدخل الرمز المكون من 6 أرقام للتأكيد
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="bg-[#090d0e] border border-[#222d2b] focus:border-[#d99c43] rounded-xl px-4 py-2.5 text-center text-base font-mono text-[#f4f0e7] tracking-widest outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-[#d99c43]/20"
            >
              {loading ? 'جاري التأكيد...' : 'تأكيد وتفعيل 2FA'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
