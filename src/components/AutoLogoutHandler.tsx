import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useLogger } from '../context/LoggerContext.tsx';
import { ShieldAlert, Clock } from 'lucide-react';

interface AutoLogoutHandlerProps {
  onAutoLogout: () => void;
}

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 14 * 60 * 1000; // Warning at 14 minutes (1 min remaining)

export const AutoLogoutHandler: React.FC<AutoLogoutHandlerProps> = ({ onAutoLogout }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { showWarning, showInfo } = useToast();
  const { logAction } = useLogger();

  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarningBanner) {
      setShowWarningBanner(false);
      showInfo('تم تجديد جلسة العمل بنجاح نتيجة استئناف النشاط.');
    }
  }, [showWarningBanner, showInfo]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarningBanner(false);
      return;
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      // Throttle reset to once every 2 seconds to avoid unnecessary state updates
      if (Date.now() - lastActivityRef.current > 2000) {
        resetTimer();
      }
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Check interval every 10 seconds
    timerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;

      if (inactiveTime >= INACTIVITY_LIMIT_MS) {
        // Auto-Logout Triggered!
        logAction('AUTH', 'تسجيل خروج آلي أمني', `انقضت 15 دقيقة دون تفاعل للمستخدم: ${user?.email}`);
        logout();
        onAutoLogout();
        showWarning('تم تسجيل الخروج تلقائياً لعدم النشاط لمدة 15 دقيقة لحماية بياناتك الأهم.', 'تأمين الجلسة الآلي');
        setShowWarningBanner(false);
      } else if (inactiveTime >= WARNING_THRESHOLD_MS && !showWarningBanner) {
        setShowWarningBanner(true);
        setSecondsLeft(Math.ceil((INACTIVITY_LIMIT_MS - inactiveTime) / 1000));
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, logout, onAutoLogout, resetTimer, showWarning, logAction, user?.email, showWarningBanner]);

  // Countdown timer when warning banner is visible
  useEffect(() => {
    if (showWarningBanner) {
      countdownRef.current = setInterval(() => {
        const remaining = Math.ceil((INACTIVITY_LIMIT_MS - (Date.now() - lastActivityRef.current)) / 1000);
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
        } else {
          setSecondsLeft(remaining);
        }
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarningBanner]);

  if (!isAuthenticated || !showWarningBanner) return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:bottom-6 sm:right-6 sm:left-auto z-[90] bg-[#1a120c] border border-[#d99c43]/60 rounded-2xl p-4 shadow-2xl max-w-md w-auto sm:w-full text-right flex items-start gap-3 backdrop-blur-md animate-bounce-short">
      <Clock className="w-6 h-6 text-[#d99c43] shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 flex flex-col gap-1">
        <h4 className="text-xs font-bold text-[#f4f0e7] flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          تحذير انتهاء مهلة الجلسة
        </h4>
        <p className="text-xs text-[#a4aaa7] leading-relaxed">
          سيتم تسجيل الخروج تلقائياً خلال <strong className="text-[#d99c43] font-mono text-sm">{secondsLeft}</strong> ثانية بسبب عدم النشاط. حرّك الفأرة أو انقر لتأكيد تواجدك.
        </p>
        <button
          onClick={resetTimer}
          className="mt-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black text-xs py-1.5 px-3 rounded-lg self-start transition-colors"
        >
          البقاء في الحساب
        </button>
      </div>
    </div>
  );
};
