import React, { useState, useEffect } from 'react';
import { BookOpen, Scale, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient.ts';
import { CoachInfo } from '../types.ts';
import { WatermarkGuard } from './WatermarkGuard.tsx';

export const CoachBooklet: React.FC = () => {
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoachInfo();
  }, []);

  const fetchCoachInfo = async () => {
    try {
      const res = await axiosClient.get('/api/coach-info');
      if (res.data && res.data.coachInfo) {
        setCoachInfo(res.data.coachInfo);
      }
    } catch (e) {
      console.warn('Coach info fetch fallback');
    } finally {
      setLoading(false);
    }
  };

  const constitutionArticles = [
    { num: 'المادة الأولى', title: 'الأخلاق فوق المال — دائماً', text: 'لا صفقة تساوي ثمن تنازل عن مبدأ. المال يُبنى ويُفقد، لكن السمعة والمبدأ هما الرصيد الذي لا يفنى.' },
    { num: 'المادة الثانية', title: 'نمنح — لا نخدع', text: 'التسويق عندنا ليس إيهاماً ولا تضخيماً. نعرض ما نملكه فعلاً، ونعِد بما نستطيع تحقيقه.' },
    { num: 'المادة الثالثة', title: 'القيمة أكبر من السعر', text: 'ما نقدمه لا يُقاس بالمال فقط. كل استراتيجية وكل خطة تحمل في طياتها تحولاً حقيقياً يمس حياة شخص فعلي.' },
    { num: 'المادة الرابعة', title: 'الشراكة لا العمالة', text: 'من يعمل معنا شريك في المسيرة، لا مورد خدمة. نجاح الفرد هو نجاح المنظومة الكاملة.' },
    { num: 'المادة الخامسة', title: 'الاحترام قبل العقد', text: 'نتعامل مع كل عميل كشخص ذي رؤية وكرامة — قبل أن نرى ميزانيته.' },
    { num: 'المادة السادسة', title: 'التميّز بالأثر لا بالضجيج', text: 'نقيس نجاحنا بما تغيّر في حياة من عملنا معهم — لا بعدد المنشورات أو الأرقام الزائفة.' },
    { num: 'المادة الثامنة', title: 'المساءلة الذاتية', text: 'نُحاسب أنفسنا قبل أن يُحاسبنا العميل أو السوق. الانتقاد الداخلي الصادق هو وقود التطور.' }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-[#d99c43] font-mono text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#d99c43] border-t-transparent rounded-full animate-spin"></div>
        جاري فتح كتيب الكوتش والدستور...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 py-6 text-right select-none">
      <WatermarkGuard
        visitor={{ name: 'كوتش سراج الدين', email: 'couch.serag@gmail.com', company: 'FitBrilliance 2026' }}
        enableWatermark={true}
        enableProtection={true}
      />
      
      {/* Header Banner */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="w-20 h-20 rounded-xl bg-[#d99c43]/15 border border-[#d99c43]/40 flex items-center justify-center text-[#d99c43] shrink-0 shadow-lg">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 text-xs font-mono font-bold px-3 py-0.5 rounded-full self-start">
              الطبعة المعتمدة 2026 — FitBrilliance
            </span>
            <span className="text-xs text-[#00e676] font-mono flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> توثيق الكوتش
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#f4f0e7]">
            كتاب التحليل المستقل ودستور الكوتش سراج (من الجذور للقمة)
          </h1>
          <p className="text-xs text-[#a4aaa7] leading-relaxed">
            ليست مجرد سيرة، بل خريطة واقعية لرحلة إنسان بنى نفسه من الميدان، ويشارك خبرته في هندسة المسار والتطوير المؤسسي بشفافية ودقة متناهية ودون تجميل.
          </p>
        </div>
      </div>

      {/* Official Manifesto Box */}
      <div className="bg-[#090d0e] border border-[#d99c43]/40 rounded-2xl p-6 flex flex-col gap-3 shadow-xl">
        <h3 className="text-sm font-extrabold text-[#d99c43] flex items-center gap-2">
          📜 بيان العقول واختصار الطريق — كوتش سراج
        </h3>
        <p className="text-xs md:text-sm text-[#f4f0e7] leading-relaxed italic font-medium">
          "لولا اختلاف العقول لقتل الإبداع ... نؤمن فنقبل فنشاهد فنحلل فندرك فنخطط. لنا الحق في أن نقول ما سنقول، ولكم الحرية أن تصدق ما تصدق وتطبق ما تطبق. أنت لست مجرد عميل؛ قبولنا العمل معك يعني تميزك عقلياً وفكرياً وصلاحك اجتماعياً وذو رؤية مستقبلية وطموح... جميع البشر متشابهون في التكوين ومختلفون في العقول والرزق، فالرزق يؤتى بقدر، والعقل بقدر ما تدربه تؤتِ فكراً أندر. نتميز أن نوفر لك سرعة التحول واختصار الطريق ورفع مكانتك درجة، فإن لم ترَ تميزك نحن نراه، ونرى انفرادك وموهبتك... وتعاوننا شرف لنا."
        </p>
        <span className="text-xs font-mono font-bold text-[#d99c43] self-end">— تحياتي ... سراج</span>
      </div>

      {/* Level I: Identity / Intro */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-[#222d2b] pb-2">
          <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-bold flex items-center justify-center">I</span>
          <h2 className="text-base font-bold text-[#f4f0e7]">الجذر — أصل الرؤية والرحلة</h2>
        </div>

        <div className="bg-[#121819] border border-[#222d2b] p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-[#d99c43]/40 shrink-0 bg-[#090d0e] shadow-2xl">
            <img
              src="/work/SeragO.png"
              alt="كوتش سراج"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            <h3 className="text-base font-bold text-[#f4f0e7]">كوتش سراج الدين (Coach Serag)</h3>
            <p className="text-xs text-[#45f3ff] font-mono font-bold">مؤسس FitBrilliance · خبير تحول استراتيجي ونمذجة مالية</p>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              {coachInfo?.introText || 'بدأت الرحلة من التساؤل والتعمق في فهم كيفية عمل العقول والمؤسسات. الرؤية الواضحة هي التي تصنع الفارق بين من يتحرك بعشوائية ومن يبني أصولاً ثابتة لا تهتز.'}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="bg-[#090d0e] border border-[#222d2b] p-3 rounded-xl text-center">
                <span className="text-base font-bold font-mono text-[#d99c43] block">{coachInfo?.statYears || '+15'}</span>
                <span className="text-[10px] text-[#a4aaa7]">سنوات خبرة ميدانية</span>
              </div>
              <div className="bg-[#090d0e] border border-[#222d2b] p-3 rounded-xl text-center">
                <span className="text-base font-bold font-mono text-[#d99c43] block">{coachInfo?.statClients || '+200'}</span>
                <span className="text-[10px] text-[#a4aaa7]">عميل وحالة تحول</span>
              </div>
              <div className="bg-[#090d0e] border border-[#222d2b] p-3 rounded-xl text-center">
                <span className="text-base font-bold font-mono text-[#d99c43] block">{coachInfo?.statProjects || '+50'}</span>
                <span className="text-[10px] text-[#a4aaa7]">مشروع ريادي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level II: Timeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-[#222d2b] pb-2">
          <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-bold flex items-center justify-center">II</span>
          <h2 className="text-base font-bold text-[#f4f0e7]">الرحلة — محطات التطور والنمذجة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coachInfo?.timeline?.map((node, i) => (
            <div key={i} className="bg-[#121819] border border-[#222d2b] hover:border-[#d99c43]/50 p-5 rounded-2xl flex flex-col gap-1.5 transition-all shadow-md">
              <span className="text-xs font-mono font-bold text-[#d99c43]">{node.era}</span>
              <h4 className="text-xs font-bold text-[#f4f0e7]">{node.heading}</h4>
              <p className="text-xs text-[#a4aaa7] leading-relaxed">{node.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level III: Experiences */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-[#222d2b] pb-2">
          <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-bold flex items-center justify-center">III</span>
          <h2 className="text-base font-bold text-[#f4f0e7]">الخبرة — ما تم بناؤه في الميدان</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coachInfo?.experiences?.map((exp, i) => (
            <div key={i} className="bg-[#121819] border border-[#222d2b] hover:border-[#d99c43]/50 p-6 rounded-2xl flex flex-col gap-2.5 transition-all shadow-md">
              <span className="text-2xl">{exp.icon}</span>
              <h4 className="text-sm font-bold text-[#f4f0e7]">{exp.title}</h4>
              <p className="text-xs text-[#a4aaa7] leading-relaxed">{exp.desc}</p>
              <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full self-start mt-1">
                {exp.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Level IV: Constitution */}
      <div className="flex flex-col gap-6 bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="text-center flex flex-col items-center gap-2 max-w-xl mx-auto mb-2">
          <Scale className="w-10 h-10 text-[#d99c43]" />
          <h2 className="text-lg font-bold text-[#f4f0e7]">دستور FitBrilliance — مبادئ التميز والمصداقية</h2>
          <p className="text-xs text-[#a4aaa7]">
            قواعد راسخة تحكم الأداء والتنفيذ العملي دون مساومة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {constitutionArticles.map((art, i) => (
            <div key={i} className="bg-[#090d0e] border-r-2 border-[#d99c43] border-y border-l border-[#222d2b] p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#d99c43] font-bold uppercase tracking-wider">{art.num}</span>
              <h4 className="text-xs font-bold text-[#f4f0e7]">{art.title}</h4>
              <p className="text-xs text-[#a4aaa7] leading-relaxed">{art.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#090d0e] border border-[#222d2b] p-4 rounded-xl text-center text-xs text-[#f4f0e7] italic mt-2">
          "نحن لا نجمع لنكتنز، ونعمل لنُنجز لا لنُبهر، وما نبنيه اليوم يجب أن يستحق أن يُبنى غداً من جديد."
          <span className="block text-[#d99c43] not-italic text-[11px] font-mono mt-1">— Coach Serag · FitBrilliance 2026</span>
        </div>
      </div>

    </div>
  );
};
