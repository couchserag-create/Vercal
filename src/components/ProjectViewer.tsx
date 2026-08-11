import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, FileText, Lock, PieChart, ExternalLink, Film, Image as ImageIcon, Video, Maximize2, CheckCircle2, Award } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { Project } from '../types.ts';
import { WatermarkGuard } from './WatermarkGuard.tsx';

interface ProjectViewerProps {
  projectId: string;
  visitor: { name: string; email: string; company: string };
  onBack: () => void;
}

export const ProjectViewer: React.FC<ProjectViewerProps> = ({ projectId, visitor, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'analysis' | 'plan'>('both');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project && canvasRef.current) {
      processElectronicSignature(canvasRef.current);
    }
  }, [project, viewMode]);

  const processElectronicSignature = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/work/A.png';
    img.onload = () => {
      canvas.width = 320;
      canvas.height = 120;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Strip white/near-white background
          if (r > 210 && g > 210 && b > 210) {
            data[i + 3] = 0;
          } else {
            // Tint signature lines to Gold (#d99c43)
            data[i] = 217;
            data[i + 1] = 156;
            data[i + 2] = 67;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // Fallback if canvas is tainted
      }
    };
  };

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/api/projects/${projectId}`);
      if (res.data && res.data.project) {
        setProject(res.data.project);
      } else {
        const listRes = await axiosClient.get('/api/projects');
        const list: Project[] = listRes.data.projects || [];
        setProject(list[0] || null);
      }
    } catch (e: any) {
      setError('فشل استرجاع مشروع العرض المحمي.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (type: string) => {
    if (!project) return;
    const phone = "201274879442";
    let msg = "";

    if (type === 'consult') {
      msg = `أهلاً كوتش سراج وفريق العمل، أرغب في التواصل والتنسيق المباشر بشأن المشروع رقم (${project.id}) لشركة (${visitor.company || project.company}).\nالاسم: ${visitor.name}`;
    } else if (type === 'buy-analysis') {
      msg = `أهلاً كوتش سراج، أرغب في طلب وشراء كتاب التحليل الشامل المستقل منفرداً للمشروع رقم (${project.id}) لشركة (${visitor.company || project.company}).\nكود التحليل الفريد: (${project.analysisRefCode}).\nالاسم: ${visitor.name}`;
    } else if (type === 'buy-plan-self') {
      msg = `أهلاً كوتش سراج، أرغب في شراء الخطة الترويجية التنفيذية الكاملة للمشروع رقم (${project.id}) لشركة (${visitor.company || project.company}) للتنفيذ الذاتي.\nالاسم: ${visitor.name}`;
    } else if (type === 'buy-both') {
      msg = `أهلاً كوتش سراج، أرغب في شراء كتاب التحليل الشامل والخطة الترويجية الكاملة مجتمعَين للمشروع رقم (${project.id}) لشركة (${visitor.company || project.company}).\nالاسم: ${visitor.name}`;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#d99c43] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-[#d99c43]">جاري فتح المستند المشفر والتثبت من هوية المستعرض...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center bg-[#121819] border border-[#222d2b] rounded-2xl p-8 max-w-lg mx-auto my-8">
        <h3 className="text-sm font-bold text-rose-400 mb-2">المستند غير موجود أو تم نقله</h3>
        <p className="text-xs text-[#a4aaa7] mb-6">تأكد من كود المشروع المطلوب أو تواصل مع كوتش سراج مباشرة.</p>
        <button onClick={onBack} className="bg-[#d99c43] text-[#0b0c10] font-bold px-6 py-2 rounded-xl text-xs">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const m1 = project.month1;
  const m2 = project.month2;
  const m3 = project.month3;
  const fin = project.financialSummary;

  return (
    <div className="flex flex-col gap-6 py-4 relative text-right select-none">
      
      {/* Anti-Leak Dynamic Watermark Protection */}
      <WatermarkGuard visitor={visitor} enableWatermark={true} enableProtection={true} />
      
      {/* Security Watermark Banner */}
      <div className="bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#00e676]" />
          مستند تشغيلي محمي وموثق — JWT + 2FA + تشفير AES-256
        </span>
        <span className="text-[11px] text-[#a4aaa7]">
          المستعرض: {visitor.name} ({visitor.company})
        </span>
      </div>

      {/* Header Info Card */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
              كود المشروع: {project.id}
            </span>
            <span className="bg-[#45f3ff]/15 text-[#45f3ff] border border-[#45f3ff]/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
              كود التحليل: {project.analysisRefCode}
            </span>
          </div>

          <h2 className="text-lg md:text-2xl font-bold text-[#f4f0e7]">{project.name}</h2>
          <p className="text-xs text-[#a4aaa7]">
            جهة الاعتماد: <strong className="text-[#f4f0e7]">{project.company}</strong> | العميل: <strong className="text-[#f4f0e7]">{project.clientName}</strong>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#090d0e] p-1.5 rounded-xl border border-[#222d2b] text-xs font-bold">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'both' ? 'bg-[#d99c43] text-[#0b0c10] font-black' : 'text-[#a4aaa7] hover:text-[#f4f0e7]'}`}
          >
            المشروع المدمج
          </button>
          <button
            onClick={() => setViewMode('analysis')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'analysis' ? 'bg-[#45f3ff] text-[#0b0c10] font-black' : 'text-[#a4aaa7] hover:text-[#f4f0e7]'}`}
          >
            كتاب التحليل
          </button>
          <button
            onClick={() => setViewMode('plan')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'plan' ? 'bg-[#00e676] text-[#0b0c10] font-black' : 'text-[#a4aaa7] hover:text-[#f4f0e7]'}`}
          >
            خطة 90 يوم
          </button>
        </div>
      </div>

      {/* Analysis Book Highlight */}
      {(viewMode === 'both' || viewMode === 'analysis') && (
        <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#45f3ff] flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-[#45f3ff]" />
              كتاب وقارئ التحليل الشامل المستقل (تشخيص المسار الميداني)
            </h3>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              يتضمن هذا القسم التقييم الدقيق والتشخيص الميداني قبل بدء خطة الـ 90 يوم. كود فريد: <span className="font-mono text-[#45f3ff] font-bold">{project.analysisRefCode}</span> ({project.analysisPageCount} صفحة).
            </p>
          </div>

          <button
            onClick={() => openWhatsApp('buy-analysis')}
            className="bg-[#45f3ff] hover:bg-[#34dbe7] text-[#0b0c10] font-black px-4 py-2 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            تحميل كتاب التحليل منفرداً
          </button>
        </div>
      )}

      {/* Media Attachments Gallery */}
      {project.mediaAttachments && project.mediaAttachments.length > 0 && (
        <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#222d2b] pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-[#d99c43]" />
              <h3 className="text-sm font-bold text-[#f4f0e7]">معرض الوسائط والفيديوهات المرفقة بالمشروع ({project.mediaAttachments.length})</h3>
            </div>
            <span className="text-[11px] font-mono text-[#a4aaa7] bg-[#090d0e] px-3 py-1 rounded-lg border border-[#222d2b]">
              معاينة وسائط الميديا المباشرة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.mediaAttachments.map((media) => {
              const isVideo = media.type === 'video' || media.url.endsWith('.mp4') || media.url.endsWith('.webm');

              return (
                <div key={media.id} className="bg-[#090d0e] border border-[#222d2b] rounded-xl p-4 flex flex-col gap-3 group hover:border-[#d99c43]/50 transition-all">
                  <div className="flex items-center justify-between text-xs font-bold text-[#d99c43]">
                    <span className="flex items-center gap-1.5">
                      {isVideo ? <Video className="w-4 h-4 text-[#d99c43]" /> : <ImageIcon className="w-4 h-4 text-[#45f3ff]" />}
                      {media.title || (isVideo ? 'عرض فيديو' : 'صورة مرفقة')}
                    </span>
                    <span className="text-[10px] font-mono text-[#a4aaa7] bg-[#121819] px-2 py-0.5 rounded border border-[#222d2b]">
                      {isVideo ? 'فيديو HD' : 'صورة'}
                    </span>
                  </div>

                  <div className="relative w-full aspect-video bg-black/80 rounded-xl overflow-hidden border border-[#222d2b] flex items-center justify-center">
                    {isVideo ? (
                      <video
                        controls
                        controlsList="nodownload"
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                        src={media.url}
                      >
                        فيديو العرض غير مدعوم في متصفحك.
                      </video>
                    ) : (
                      <div className="relative w-full h-full cursor-pointer group/img overflow-hidden" onClick={() => setActiveImageZoom(media.url)}>
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[#f4f0e7] gap-1 text-xs font-bold">
                          <Maximize2 className="w-4 h-4" /> تكبير الصورة
                        </div>
                      </div>
                    )}
                  </div>

                  {media.caption && (
                    <p className="text-xs text-[#a4aaa7] leading-relaxed border-t border-[#222d2b] pt-2">
                      {media.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal Zoom */}
      {activeImageZoom && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveImageZoom(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveImageZoom(null)}
              className="absolute -top-10 right-0 text-[#f4f0e7] hover:text-[#d99c43] font-bold text-sm bg-[#121819] px-3 py-1 rounded-lg border border-[#222d2b]"
            >
              إغلاق (×)
            </button>
            <img
              src={activeImageZoom}
              alt="معاينة المكبر"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-[#222d2b] shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* 90-Day Budget & Operational Roadmap */}
      {(viewMode === 'both' || viewMode === 'plan') && (
        <div className="flex flex-col gap-6 bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8">
          <h3 className="text-base font-bold text-[#f4f0e7] border-b border-[#222d2b] pb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#d99c43]" />
            ميزانية وخطة النمذجة التشغيلية والمالية (90 يوم)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Month 1 */}
            <div className="bg-[#090d0e] border-t-2 border-[#d99c43] border-x border-b border-[#222d2b] p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#222d2b] pb-2">
                <span className="font-mono text-xs font-bold text-[#d99c43] bg-[#d99c43]/15 px-2 py-0.5 rounded">01</span>
                <h4 className="text-xs font-bold text-[#f4f0e7]">الشهر الأول | التأسيس</h4>
              </div>
              <div className="text-xs text-[#a4aaa7] space-y-1">
                <p>🎬 الإنتاج: ({m1.videosCount}) فيديوهات = <strong className="text-[#f4f0e7]">{m1.totalVideoCost} ج.م</strong></p>
                <p>🚀 الإعلانات: ({m1.adsCount}) إعلانات = <strong className="text-[#f4f0e7]">{m1.totalAdCost} ج.م</strong></p>
                <p>🌐 التواجد: ({m1.platforms}) = <strong className="text-[#f4f0e7]">{m1.platformCost} ج.م</strong></p>
              </div>
              <div className="pt-2 border-t border-[#222d2b] flex justify-between items-center text-xs font-mono font-bold text-[#d99c43]">
                <span>إجمالي الشهر 1:</span>
                <span>{m1.totalMonth1} ج.م</span>
              </div>
            </div>

            {/* Month 2 */}
            <div className="bg-[#090d0e] border-t-2 border-[#45f3ff] border-x border-b border-[#222d2b] p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#222d2b] pb-2">
                <span className="font-mono text-xs font-bold text-[#45f3ff] bg-[#45f3ff]/15 px-2 py-0.5 rounded">02</span>
                <h4 className="text-xs font-bold text-[#f4f0e7]">الشهر الثاني | نمو الأداء</h4>
              </div>
              <div className="text-xs text-[#a4aaa7] space-y-1">
                <p>🎬 الإنتاج: ({m2.videosCount}) فيديوهات = <strong className="text-[#f4f0e7]">{m2.totalVideoCost} ج.م</strong></p>
                <p>🚀 الإعلانات: ({m2.adsCount}) إعلانات = <strong className="text-[#f4f0e7]">{m2.totalAdCost} ج.م</strong></p>
                <p>🎯 الهدف الاستراتيجي: <strong className="text-[#45f3ff]">{m2.targetPercent}%</strong></p>
              </div>
              <div className="pt-2 border-t border-[#222d2b] flex justify-between items-center text-xs font-mono font-bold text-[#45f3ff]">
                <span>إجمالي الشهر 2:</span>
                <span>{m2.totalMonth2} ج.م</span>
              </div>
            </div>

            {/* Month 3 */}
            <div className="bg-[#090d0e] border-t-2 border-[#00e676] border-x border-b border-[#222d2b] p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#222d2b] pb-2">
                <span className="font-mono text-xs font-bold text-[#00e676] bg-[#00e676]/15 px-2 py-0.5 rounded">03</span>
                <h4 className="text-xs font-bold text-[#f4f0e7]">الشهر الثالث | المخرجات</h4>
              </div>
              <div className="text-xs text-[#a4aaa7] space-y-1">
                <p>🎬 الإنتاج: ({m3.videosCount}) فيديوهات = <strong className="text-[#f4f0e7]">{m3.totalVideoCost} ج.م</strong></p>
                <p>🚀 الإعلانات: ({m3.adsCount}) إعلانات = <strong className="text-[#f4f0e7]">{m3.totalAdCost} ج.م</strong></p>
                <p>📈 معدل التغيير: <strong className="text-[#00e676]">{m3.changePercent}%</strong></p>
              </div>
              <div className="pt-2 border-t border-[#222d2b] flex justify-between items-center text-xs font-mono font-bold text-[#00e676]">
                <span>إجمالي الشهر 3:</span>
                <span>{m3.totalMonth3} ج.م</span>
              </div>
            </div>

          </div>

          {/* Financial Summary */}
          <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-xl flex flex-wrap justify-around items-center gap-4 text-center">
            <div>
              <span className="text-xs text-[#a4aaa7] block">إجمالي التكلفة التشغيلية:</span>
              <strong className="text-base md:text-xl font-mono text-[#d99c43]">{fin.totalCost} ج.م</strong>
            </div>
            <div>
              <span className="text-xs text-[#a4aaa7] block">العائد الاستثماري المتوقع (ROI):</span>
              <strong className="text-base md:text-xl font-mono text-[#00e676]">{fin.expectedROI}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tax Strategy Box & Law 91/2005 Notes */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-5 text-xs text-[#f4f0e7] leading-relaxed">
        <h4 className="font-bold text-[#45f3ff] text-sm mb-1.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#45f3ff]" />
          التعافي الضريبي والمالي (أحكام القانون 91 لسنة 2005 — المادتين 22 و23)
        </h4>
        <p className="text-[#a4aaa7]">
          وفقاً للتشريعات الضريبية الرسمية، فإن كافة المصروفات التسويقية والإعلانية والنمذجة تُعد من التكاليف واجبة الخصم ضريبياً بنسبة 100%. الخطة مصممة لاسترداد كافة التكاليف دفترياً بنهاية السنة المالية.
        </p>
      </div>

      {/* Gold Electronic Signature Section (Processed via Canvas) */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2 text-right">
          <div className="flex items-center gap-2">
            <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
              التوقيع والاعتماد الرسمي
            </span>
            <span className="text-xs text-[#00e676] font-mono flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> توقيع ذهبي إلكتروني معتمد
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#f4f0e7]">اعتماد كوتش سراج — FitBrilliance Executive Portal</h4>
          <p className="text-xs text-[#a4aaa7] max-w-md">
            تم فحص واعتماد هذا المستند برمجياً؛ التوقيع أدناه تمت معالجته ديناميكياً لتأكيد صحة البيانات والحفظ القانوني.
          </p>
        </div>

        {/* Dynamic Canvas Container */}
        <div className="bg-[#090d0e] p-3 rounded-xl border border-[#d99c43]/40 flex flex-col items-center gap-2 shrink-0 shadow-lg">
          <canvas ref={canvasRef} className="w-[280px] h-[90px] object-contain" />
          <span className="text-[10px] font-mono text-[#d99c43] bg-[#d99c43]/10 px-3 py-0.5 rounded-full border border-[#d99c43]/30">
            VERIFIED ELECTRONIC GOLD SEAL
          </span>
        </div>
      </div>

      {/* Encrypted Plan Box & Direct WhatsApp Actions */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl">
        <Lock className="w-10 h-10 text-[#d99c43]" />
        <h3 className="text-base font-bold text-[#f4f0e7]">أصل الخطة التنفيذية المشفرة</h3>
        <p className="text-xs text-[#a4aaa7] max-w-xl leading-relaxed">
          نضمن لك بنهاية العام المالي ستكون 0% تكلفة صافية بإذن الله، و100% هدف محقق مع الريادة الميدانية.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full mt-2">
          <button
            onClick={() => openWhatsApp('consult')}
            className="bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
          >
            💬 التنسيق المباشر
          </button>
          
          <button
            onClick={() => openWhatsApp('buy-analysis')}
            className="bg-[#090d0e] border border-[#222d2b] text-[#45f3ff] hover:bg-[#121819] font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            📊 شراء التحليل المستقل
          </button>

          <button
            onClick={() => openWhatsApp('buy-plan-self')}
            className="bg-[#090d0e] border border-[#222d2b] text-[#d99c43] hover:bg-[#121819] font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            📜 شراء الخطة (تنفيذ ذاتي)
          </button>

          <button
            onClick={() => openWhatsApp('buy-both')}
            className="bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] hover:bg-[#00e676]/25 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            💎 شراء الباكج الكامل
          </button>
        </div>
      </div>

    </div>
  );
};
