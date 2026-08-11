import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClientLog } from '../types.ts';
import axiosClient from '../api/axiosClient.ts';

interface LoggerContextType {
  logs: ClientLog[];
  logAction: (category: ClientLog['category'], action: string, details?: string) => void;
  clearLogs: () => void;
  exportLogs: () => void;
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

const LOCAL_STORAGE_LOGS_KEY = 'fitbrilliance_interaction_logs';

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ClientLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading interaction logs:', e);
    }
    return [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString('ar-EG'),
        category: 'SYSTEM',
        action: 'بدء تشغيل الجلسة والنظام التفاعلي',
        details: 'تم بدء التوثيق ومراقبة أحداث النظام بنجاح',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Error saving interaction logs:', e);
    }
  }, [logs]);

  const logAction = useCallback((category: ClientLog['category'], action: string, details?: string) => {
    const userJwt = localStorage.getItem('fitbrilliance_jwt_token');
    const userEmail = userJwt ? 'مستخدم موثق' : 'زائر عام';

    const newLog: ClientLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString('ar-EG'),
      category,
      action,
      details,
      userEmail,
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 100));

    // Async sync to server ledger
    axiosClient
      .post('/api/ledger', {
        eventType: `${category}: ${action}`,
        name: userEmail,
        details: details || action,
        role: category,
      })
      .catch(() => {
        // Silent catch for ledger sync
      });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(LOCAL_STORAGE_LOGS_KEY);
  }, []);

  const exportLogs = useCallback(() => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitbrilliance_audit_debug_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return (
    <LoggerContext.Provider value={{ logs, logAction, clearLogs, exportLogs }}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = () => {
  const context = useContext(LoggerContext);
  if (!context) throw new Error('useLogger must be used within LoggerProvider');
  return context;
};
