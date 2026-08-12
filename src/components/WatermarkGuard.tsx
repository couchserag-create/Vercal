import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Lock, AlertOctagon, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';

interface WatermarkGuardProps {
  visitor: { name: string; email: string; company: string };
  enableWatermark?: boolean;
  enableProtection?: boolean;
}

export const WatermarkGuard: React.FC<WatermarkGuardProps> = ({
  visitor,
  enableWatermark = true,
  enableProtection = true,
}) => {
  const { showError, showWarning } = useToast();
  const { logAction } = useLogger();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [securityBadge, setSecurityBadge] = useState(true);
  const [captureWarning, setCaptureWarning] = useState(false);
  const sessionId = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase()
  );

  // Live Timestamp Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }) +
          ' ' +
          now.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts & Anti-DevTools Protection
  useEffect(() => {
    if (!enableProtection) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showError('تم حظر فتح أدوات المطورين (F12) لحماية التقارير والخطة الفنية من الهندسة العكسية.', 'أمان الخطة محمي');
        logAction('SYSTEM', 'محاولة فتح DevTools عبر F12', `الاسم: ${visitor.name}`);
        return false;
      }

      // The operating system ultimately controls screenshots. This does not
      // block them, but immediately records the attempt and makes the dynamic
      // identity watermark prominent in any subsequent capture.
      if (e.key === 'PrintScreen') {
        setCaptureWarning(true);
        window.setTimeout(() => setCaptureWarning(false), 4000);
        showWarning('تم رصد اختصار التقاط الشاشة. هذه الوثيقة تحمل ختم هوية وتوقيت متغيرين.', 'تنبيه حماية المحتوى');
        logAction('SYSTEM', 'محاولة التقاط شاشة عبر Print Screen', `المستخدم: ${visitor.name}`);
        return;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showError('تم حظر اختصار أدوات فحص العناصر لحماية الملكية الفكرية للمستند.', 'اختصار محظور');
        logAction('SYSTEM', 'محاولة فتح أدوات الفحص المتقدمة', `المفتاح: ${e.key}`);
        return false;
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        showError('عرض المصدر الأساسي محظور أمنياً ببروتوكولات التشفير.', 'مصدر الصفحة محمي');
        logAction('SYSTEM', 'محاولة عرض كود المصدر Ctrl+U');
        return false;
      }

      // Block Ctrl+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        showWarning('حفظ الصفحة محظور أمنياً. يرجى طلب النسخة المعنية عبر القنوات الرسمية.', 'حظر حفظ المستند');
        logAction('SYSTEM', 'محاولة حفظ المستند Ctrl+S');
        return false;
      }

      // Block Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        showWarning('طباعة المستند غير مسموحة بدون توثيق خطي مسبق.', 'حظر الطباعة المباشرة');
        logAction('SYSTEM', 'محاولة طباعة المستند Ctrl+P');
        return false;
      }

      // Block Ctrl+C / Ctrl+A / Ctrl+X (Copy/Cut/Select All)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 'x' || e.key === 'X')
      ) {
        // Allow copy inside input fields or textareas
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return true;
        }

        e.preventDefault();
        e.stopPropagation();
        showWarning('نسخ أو تحديد نصوص التقرير والاستراتيجية محظور لمنع التسريب وتداول المحتوى.', 'حظر النسخ والتحديد');
        logAction('SYSTEM', `محاولة نسخ/تحديد المحتوى (${e.key})`, `المستخدم: ${visitor.name}`);
        return false;
      }
    };

    // Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return true;
      }

      e.preventDefault();
      showWarning('القائمة اليمنى معطلة أمنياً ببروتوكولات الأمان لمنع نسخ وحفظ التقارير.', 'قفل القائمة اليمنى');
      logAction('SYSTEM', 'محاولة فتح القائمة اليمنى (Right-Click)', `المستخدم: ${visitor.name}`);
      return false;
    };

    // Block Clipboard Copy Events
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return true;
      }
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
      showWarning('النسخ محظور أمنياً لحماية أمان المحتوى والملكية الفكرية.', 'محاولة نسخ ملغاة');
      logAction('SYSTEM', 'إحباط عملية النسخ ومسح الحافظة');
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      logAction('SYSTEM', 'محاولة سحب محتوى من المستند', `المستخدم: ${visitor.name}`);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('cut', handleCopy, true);
    window.addEventListener('dragstart', handleDragStart, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('cut', handleCopy, true);
      window.removeEventListener('dragstart', handleDragStart, true);
    };
  }, [enableProtection, showError, showWarning, logAction, visitor.name]);

  const watermarkText = `🔒 وثيقة محمية | العارض: ${visitor.name || 'زائر موثق'} (${visitor.company || 'مؤسسة معتمدة'}) | ${visitor.email || ''} | جلسة: ${sessionId.current} | ${currentTime} | يمنع التصوير والتداول`;

  return (
    <>
      {/* CSS Rule to Disable Window Printing & PDF Export */}
      <style>{`
        @media print {
          html, body {
            display: none !important;
            visibility: hidden !important;
          }

          #anti-leak-watermark-overlay {
            display: flex !important;
            opacity: 0.55 !important;
          }
        }
      `}</style>

      {/* Dynamic Anti-Leak Watermark Overlay */}
      {enableWatermark && (
        <div
          id="anti-leak-watermark-overlay"
          className="fixed inset-0 z-[60] pointer-events-none select-none overflow-hidden opacity-[0.09] dark:opacity-[0.11] flex flex-wrap content-start justify-around p-4 gap-x-12 gap-y-16 dir-ltr"
          style={{
            transform: 'rotate(-12deg) scale(1.15)',
            transformOrigin: 'center center',
          }}
          aria-hidden="true"
        >
          {Array.from({ length: 28 }).map((_, idx) => (
            <div
              key={idx}
              className="text-[11px] sm:text-xs font-mono font-bold text-[#f4f0e7] bg-[#00e676]/20 border border-[#00e676]/30 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}

      {captureWarning && (
        <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center bg-[#090d0e]/85 backdrop-blur-md p-6 text-center">
          <div className="max-w-md rounded-2xl border border-[#00e676]/50 bg-[#090d0e] p-6 shadow-2xl">
            <AlertOctagon className="mx-auto mb-3 h-9 w-9 text-[#00e676]" />
            <p className="text-sm font-bold text-[#f4f0e7]">المحتوى موثق بختم هوية وتوقيت مباشر</p>
            <p className="mt-2 text-xs leading-relaxed text-[#a4aaa7]">لا توجد وسيلة ويب تمنع لقطة نظام التشغيل، لكن كل نسخة معروضة تحمل بيانات جلسة المستعرض لردع التداول غير المصرح.</p>
          </div>
        </div>
      )}

      {/* Floating Active Security Indicator Badge */}
      {securityBadge && (
        <div className="fixed top-20 left-4 z-[55] hidden lg:flex items-center gap-2 bg-[#090d0e]/90 border border-[#00e676]/40 text-[#00e676] text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md transition-all">
          <ShieldCheck className="w-4 h-4 text-[#00e676] animate-pulse" />
          <span>حماية منع التسريب والتصوير تُمكّن العلامة المائية المباشرة</span>
          <button
            onClick={() => setSecurityBadge(false)}
            className="text-[#a4aaa7] hover:text-[#f4f0e7] mr-1"
            title="إخفاء شارة الأمان"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};
