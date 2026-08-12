import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Lock, Key, Server, FileCode, CheckCircle2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { ApiEndpointDoc } from '../types.ts';

export const ApiDocsView: React.FC = () => {
  const [docs, setDocs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await axiosClient.get('/api/docs/endpoints');
      setDocs(res.data);
    } catch (e) {
      console.warn('API Docs fetch fallback');
    } finally {
      setLoading(false);
    }
  };

  const runLiveTest = async (ep: ApiEndpointDoc) => {
    setTestResult(prev => ({ ...prev, [ep.path]: 'جاري الاختبار...' }));
    try {
      let res;
      if (ep.method === 'GET') {
        res = await axiosClient.get(ep.path);
      } else if (ep.method === 'POST') {
        res = await axiosClient.post(ep.path, ep.requestBodyExample || {});
      }
      setTestResult(prev => ({ ...prev, [ep.path]: res?.data }));
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [ep.path]: err.response?.data || 'حدث خطأ أثناء الاختبار' }));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#d99c43] font-mono text-xs">
        جاري تحميل وثيقة واجهة البرمجة والأنظمة التفاعلية (API Docs)...
      </div>
    );
  }

  const endpoints: ApiEndpointDoc[] = docs?.endpoints || [];

  return (
    <div className="flex flex-col gap-6 py-6 text-right">
      
      {/* Header Banner */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Terminal className="w-7 h-7 text-[#d99c43]" />
          <div>
            <h1 className="text-base font-bold text-[#f4f0e7]">وثيقة واجهة البرمجة ومعايير الأمان (API Documentation)</h1>
            <p className="text-xs text-[#a4aaa7] font-mono">دليل فني شامل لربط واختبار واجهات البرمجة الآمنة للأنظمة والخوادم</p>
          </div>
        </div>

        <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 text-xs font-mono font-bold px-3 py-1 rounded-full">
          v{docs?.version || '1.0.0'} OpenAPI Standard
        </span>
      </div>

      {/* Security Architecture Grid */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-bold text-[#45f3ff] flex items-center gap-2 border-b border-[#222d2b] pb-3">
          <ShieldCheck className="w-4 h-4 text-[#00e676]" />
          معايير الأمان والحماية المشددة المطبقة بالنظام
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[#d99c43] font-bold">نظام التوثيق:</span>
            <span className="text-[#f4f0e7] font-mono">{docs?.securityStandards?.authType}</span>
          </div>

          <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[#00e676] font-bold">تشفير كلمة السر:</span>
            <span className="text-[#f4f0e7] font-mono">{docs?.securityStandards?.hashAlgorithm}</span>
          </div>

          <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[#45f3ff] font-bold">تشفير قاعدة البيانات:</span>
            <span className="text-[#f4f0e7] font-mono">{docs?.securityStandards?.encryption}</span>
          </div>

          <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-purple-400 font-bold">رؤوس الحماية:</span>
            <span className="text-[#f4f0e7] font-mono">{docs?.securityStandards?.headerSecurity}</span>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-[#f4f0e7]">مسارات وواجهات البرمجة المتاحة (API Endpoints)</h3>

        <div className="flex flex-col gap-3">
          {endpoints.map((ep, i) => {
            const isExpanded = activeEndpoint === ep.path;
            const methodColor = ep.method === 'GET' ? 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/30' :
                              ep.method === 'POST' ? 'bg-[#d99c43]/15 text-[#d99c43] border-[#d99c43]/30' :
                              ep.method === 'PUT' ? 'bg-[#45f3ff]/15 text-[#45f3ff] border-[#45f3ff]/30' :
                              'bg-rose-500/15 text-rose-400 border-rose-500/30';

            return (
              <div key={i} className="bg-[#121819] border border-[#222d2b] rounded-2xl overflow-hidden transition-all shadow-md">
                
                {/* Header Row */}
                <div
                  onClick={() => setActiveEndpoint(isExpanded ? null : ep.path)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2325] transition-colors gap-4"
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${methodColor}`}>
                      {ep.method}
                    </span>
                    <span className="min-w-0 break-all font-mono text-xs text-[#f4f0e7] font-bold">{ep.path}</span>
                    <span className="text-xs text-[#a4aaa7] hidden md:inline">— {ep.summary}</span>
                  </div>

                  <div className="hidden sm:flex shrink-0 items-center gap-3">
                    {ep.protected ? (
                      <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> محمي بـ JWT
                      </span>
                    ) : (
                      <span className="bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg">
                        متاح عام
                      </span>
                    )}

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#d99c43]" /> : <ChevronDown className="w-4 h-4 text-[#a4aaa7]" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#222d2b] bg-[#090d0e]/80 flex flex-col gap-4 text-xs">
                    <p className="text-[#a4aaa7]">{ep.description}</p>
                    <p className="text-[#d99c43] font-mono font-bold">معدل الطلبات المسموح: <span className="text-[#f4f0e7]">{ep.rateLimit}</span></p>

                    {ep.requestBodyExample && (
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#f4f0e7]">نموذج جسم الطلب (Request Body):</span>
                        <pre className="bg-[#090d0e] p-3 rounded-xl text-[11px] font-mono text-[#45f3ff] overflow-x-auto border border-[#222d2b]">
                          {JSON.stringify(ep.requestBodyExample, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#f4f0e7]">نموذج الاستجابة (Response Schema):</span>
                      <pre className="bg-[#090d0e] p-3 rounded-xl text-[11px] font-mono text-[#00e676] overflow-x-auto border border-[#222d2b]">
                        {JSON.stringify(ep.responseExample, null, 2)}
                      </pre>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => runLiveTest(ep)}
                        className="bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        اختبار الواجهة مباشرة (Live Test)
                      </button>
                    </div>

                    {testResult[ep.path] && (
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="font-bold text-[#00e676]">نتيجة اختبار الواجهة المباشر:</span>
                        <pre className="bg-[#090d0e] p-3 rounded-xl text-[11px] font-mono text-[#f4f0e7] overflow-x-auto border border-[#00e676]/30">
                          {typeof testResult[ep.path] === 'object' ? JSON.stringify(testResult[ep.path], null, 2) : String(testResult[ep.path])}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
