import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../types.ts';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: Toast['type'], message: string, title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showError = useCallback(
    (message: string, title = 'تنبيه خطأ في المدخلات') => showToast('error', message, title, 5000),
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, title = 'تمت العملية بنجاح') => showToast('success', message, title, 4000),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = 'تحذير نظام الأمان') => showToast('warning', message, title, 5000),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = 'معلومات الجلسة') => showToast('info', message, title, 4000),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        removeToast,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div
        id="toast-container"
        className="fixed top-5 left-5 z-[100] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none dir-rtl"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          const bgClass = isError
            ? 'bg-[#181113] border-rose-500/40 text-rose-300'
            : isSuccess
            ? 'bg-[#0f1d16] border-[#00e676]/40 text-[#00e676]'
            : isWarning
            ? 'bg-[#1e170e] border-[#d99c43]/40 text-[#d99c43]'
            : 'bg-[#0f1a20] border-[#45f3ff]/40 text-[#45f3ff]';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bgClass}`}
            >
              <div className="shrink-0 mt-0.5">
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#00e676]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-[#d99c43]" />}
                {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-[#45f3ff]" />}
              </div>

              <div className="flex-1 flex flex-col gap-0.5 text-right">
                {toast.title && <strong className="text-xs font-bold text-[#f4f0e7]">{toast.title}</strong>}
                <p className="text-xs text-[#f4f0e7]/90 leading-relaxed font-sans">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-[#a4aaa7] hover:text-[#f4f0e7] transition-colors p-1"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
