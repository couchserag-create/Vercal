import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCcw, ShieldCheck, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { BackupMetadata } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { HostingExporter } from './HostingExporter.tsx';

export const BackupManager: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchBackups();
    }
  }, [isAuthenticated, user]);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/api/backup/list');
      setBackups(res.data.backups || []);
    } catch (e) {
      console.warn('Backup list fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await axiosClient.post('/api/backup/export');
      setMsg(res.data.message || 'تم توليد النسخة الاحتياطية بنجاح.');
      fetchBackups();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'فشل توليد النسخة الاحتياطية.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!window.confirm(`استعادة قاعدة البيانات بالكامل من النسخة (${backupId})؟`)) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await axiosClient.post('/api/backup/restore', { backupId });
      setMsg(res.data.message || 'تم استعادة قاعدة البيانات.');
      fetchBackups();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'فشل استعادة النسخة الاحتياطية.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="py-16 text-center text-[#d99c43] font-mono text-xs bg-[#121819] border border-[#222d2b] p-8 rounded-2xl max-w-md mx-auto my-8 shadow-xl">
        🔒 إدارة النسخ الاحتياطي الدورية مقتصرة حصرياً على مدير المنظومة.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6 text-right">
      
      {/* Header */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Database className="w-7 h-7 text-[#00e676]" />
          <div>
            <h1 className="text-base font-bold text-[#f4f0e7]">إدارة النسخ الاحتياطي الدوري والتشغيل المشفر</h1>
            <p className="text-xs text-[#a4aaa7] font-mono">نظام آلي يقوم بأرشفة وتشفير قاعدة البيانات ببروتوكول AES-256 كل 6 ساعات وعلى الطلب</p>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          disabled={loading}
          className="bg-[#00e676] hover:bg-[#00c853] text-[#0b0c10] font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors shadow-lg shadow-[#00e676]/20"
        >
          <Download className="w-4 h-4" />
          توليد نسخة احتياطية مشفرة الآن
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-xs font-mono rounded-xl flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Backup Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121819] border border-[#222d2b] p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <HardDrive className="w-7 h-7 text-[#d99c43]" />
          <div>
            <span className="text-xs text-[#a4aaa7] block">عدد النسخ المحفوظة:</span>
            <strong className="text-base text-[#f4f0e7] font-mono">{backups.length} أرشيف</strong>
          </div>
        </div>

        <div className="bg-[#121819] border border-[#222d2b] p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <ShieldCheck className="w-7 h-7 text-[#00e676]" />
          <div>
            <span className="text-xs text-[#a4aaa7] block">بروتوكول التشفير:</span>
            <strong className="text-xs text-[#00e676] font-mono">AES-256-CBC Encrypted</strong>
          </div>
        </div>

        <div className="bg-[#121819] border border-[#222d2b] p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <RefreshCcw className="w-7 h-7 text-[#45f3ff]" />
          <div>
            <span className="text-xs text-[#a4aaa7] block">الجدولة الآلية:</span>
            <strong className="text-xs text-[#45f3ff] font-mono">كل 6 ساعات أوتوماتيكياً</strong>
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-bold text-[#f4f0e7] border-b border-[#222d2b] pb-3">
          سجل النسخ الاحتياطية المتوفرة للاستعادة
        </h3>

        {backups.length === 0 ? (
          <p className="text-xs text-[#a4aaa7] text-center py-8">لا توجد نسخ احتياطية مسجلة بعد. اضغط على الزر أعلاه لتوليد أول نسخة.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {backups.map((b) => (
              <div key={b.id} className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#d99c43] font-mono">{b.filename}</strong>
                    <span className="bg-[#45f3ff]/15 text-[#45f3ff] border border-[#45f3ff]/30 text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold">
                      {(b.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <span className="text-[11px] text-[#a4aaa7] font-mono">
                    تاريخ التوليد: {new Date(b.timestamp).toLocaleString('ar-EG')} | مشاريع: {b.projectsCount} | سجلات: {b.auditLogsCount}
                  </span>
                </div>

                <button
                  onClick={() => handleRestoreBackup(b.id)}
                  disabled={loading}
                  className="bg-[#121819] hover:bg-[#1a2325] text-[#00e676] border border-[#00e676]/30 px-3.5 py-2 rounded-xl font-bold transition-colors text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  استعادة هذه النسخة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hosting Preparation & Package Exporter Section */}
      <HostingExporter />

    </div>
  );
};
