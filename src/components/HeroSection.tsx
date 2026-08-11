import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ShieldCheck, Play, Pause, Volume2, VolumeX, ArrowUpRight, Award, Flame, Quote, CheckCircle2, PhoneCall, HeartHandshake } from 'lucide-react';

interface HeroSectionProps {
  openSearchModal: () => void;
  openStrategyModal: () => void;
  openJoinModal: () => void;
  onExploreProject: (projId: string) => void;
}

const INSPIRATIONAL_QUOTES = [
  { text: "لولا اختلاف العقول لقتل الإبداع ... نؤمن فنقبل فنشاهد فنحلل فندرك فنخطط.", author: "— كوتش سراج" },
  { text: "أنت لست مجرد عميل ... قبولنا العمل معك يعني تميزك عقلياً وفكرياً وصلاحك اجتماعياً وذو رؤية مستقبلية وطموح.", author: "— كوتش سراج" },
  { text: "جميع البشر متشابهون في التكوين ومختلفون في العقول والرزق، والعقل بقدر ما تدربه تؤتِ فكراً أندر.", author: "— كوتش سراج" },
  { text: "إن لم ترَ تميزك نحن نراه ونرى انفرادك وموهبتك ... وتعاوننا شرف لنا.", author: "— كوتش سراج" }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  openSearchModal,
  openStrategyModal,
  openJoinModal,
  onExploreProject
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const switchVideo = (vid: 1 | 2) => {
    setActiveVideo(vid);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.src = vid === 1 ? '/work/portofilo (1).mp4' : '/work/portofilo (2).mp4';
      videoRef.current.load();
    }
  };

  return (
    <div className="flex flex-col gap-10 py-6">
      
      {/* Top Hero Headline Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#222d2b] pb-8">
        <div className="flex flex-col gap-3 max-w-3xl text-right">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] text-xs font-mono font-bold px-3 py-1 rounded-full">
              منظومة 2026 — FitBrilliance Mapped & Secured
            </span>
            <span className="text-xs text-[#00e676] font-mono flex items-center gap-1 font-bold bg-[#00e676]/10 px-2.5 py-0.5 rounded-full border border-[#00e676]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> مشفر بالكامل JWT + 2FA
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#f4f0e7] leading-tight tracking-tight">
            نرى ما لا يراه الآخرون .... <br />
            <span className="text-[#d99c43] underline decoration-[#d99c43]/40 underline-offset-8">
              لنصنع ما لا يستطيع الآخرون صنعه
            </span>
          </h1>
          
          <p className="text-xs md:text-sm text-[#a4aaa7] leading-relaxed">
            أنت لست مجرد عميل؛ قبولنا العمل معك يعني تميزك عقلياً وفكرياً وطموحك المستقبلي... نتميز أن نوفر لك سرعة التحول واختصار الطريق ورفع مكانتك درجة، فإن لم ترَ تميزك ونبوغك نحن نراه، وتعاوننا شرف لنا.
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[240px] w-full md:w-auto">
          <button
            onClick={openSearchModal}
            className="flex items-center justify-center gap-2 bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] font-black px-5 py-3 rounded-xl shadow-lg shadow-[#d99c43]/20 transition-all text-xs md:text-sm cursor-pointer"
          >
            <Search className="w-4 h-4" />
            البحث عن تقريرك أو مشروعك المحمي
          </button>
          
          <button
            onClick={openStrategyModal}
            className="flex items-center justify-center gap-2 bg-[#121819] hover:bg-[#1a2325] border border-[#222d2b] text-[#f4f0e7] font-bold px-5 py-2.5 rounded-xl transition-all text-xs md:text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#45f3ff]" />
            طلب استراتيجية تحول (90 يوم)
          </button>
        </div>
      </div>

      {/* Coach Serag Official Manifesto Card */}
      <div className="bg-gradient-to-r from-[#121819] via-[#090d0e] to-[#121819] border border-[#d99c43]/40 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 bg-[#d99c43]/15 text-[#d99c43] border-b border-r border-[#d99c43]/40 px-4 py-1 rounded-br-2xl text-[11px] font-mono font-bold flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5" /> بيان العقول والشراكة — كوتش سراج
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center pt-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#d99c43]/60 shrink-0 shadow-xl bg-black">
            <img src="/work/SeragO.png" alt="كوتش سراج" className="w-full h-full object-cover object-top" />
          </div>

          <div className="flex-1 flex flex-col gap-3 text-right">
            <h3 className="text-base font-extrabold text-[#d99c43] flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#d99c43] rotate-180" />
              "لولا اختلاف العقول لقتل الإبداع ..."
            </h3>
            
            <p className="text-xs md:text-sm text-[#f4f0e7] leading-relaxed italic font-medium">
              "نؤمن فنقبل فنشاهد فنحلل فندرك فنخطط... لنا الحق في أن نقول ما سنقول، ولكم الحرية أن تصدق ما تصدق وتطبق ما تطبق. أنت لست مجرد عميل؛ قبولنا العمل معك يعني تميزك عقلياً وفكرياً وصلاحك اجتماعياً وذو رؤية مستقبلية وطموح. جميع البشر متشابهون في التكوين ومختلفون في العقول والرزق، فالرزق يؤتى بقدر، والعقل بقدر ما تدربه تؤتِ فكراً أندر... نتميز أن نوفر لك سرعة التحول واختصار الطريق ورفع مكانتك درجة، فإن لم ترَ تميزك نحن نراه، ونرى انفرادك وموهبتك... وتعاوننا شرف لنا."
            </p>

            <span className="text-xs font-mono font-extrabold text-[#d99c43] self-end bg-[#d99c43]/10 px-3 py-1 rounded-full border border-[#d99c43]/30">
              تحياتي ... كوتش سراج الدين
            </span>
          </div>
        </div>
      </div>

      {/* Video Showcase & Direct Gates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Video Showcase */}
        <div className="lg:col-span-7 bg-[#121819] border border-[#222d2b] rounded-2xl overflow-hidden shadow-2xl relative min-h-[420px] flex flex-col justify-between">
          <div className="p-4 bg-[#090d0e]/90 border-b border-[#222d2b] flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-ping"></span>
              <span className="text-xs font-bold text-[#d99c43] font-mono">
                سابقة الأعمال والمرئيات الميدانية
              </span>
            </div>
            
            {/* Video selector buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchVideo(1)}
                className={`text-xs px-3 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                  activeVideo === 1
                    ? 'bg-[#d99c43] text-[#0b0c10]'
                    : 'bg-[#090d0e] text-[#a4aaa7] border border-[#222d2b]'
                }`}
              >
                عرض 01
              </button>
              <button
                onClick={() => switchVideo(2)}
                className={`text-xs px-3 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                  activeVideo === 2
                    ? 'bg-[#d99c43] text-[#0b0c10]'
                    : 'bg-[#090d0e] text-[#a4aaa7] border border-[#222d2b]'
                }`}
              >
                عرض 02
              </button>
            </div>
          </div>

          {/* HTML5 Player */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={activeVideo === 1 ? '/work/portofilo (1).mp4' : '/work/portofilo (2).mp4'}
              poster="/work/Us.png"
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />

            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-[#d99c43] text-[#0b0c10] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </button>
                <span className="text-xs font-bold text-[#f4f0e7] bg-[#090d0e]/80 px-3 py-1 rounded-full border border-[#222d2b]">
                  اضغط لتشغيل فيديو سابقة الأعمال HD ({activeVideo === 1 ? 'الجزء 1' : 'الجزء 2'})
                </span>
              </div>
            )}

            {isPlaying && (
              <div className="absolute bottom-3 right-3 left-3 bg-[#090d0e]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[#222d2b] flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-[#d99c43] hover:text-white cursor-pointer">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button onClick={toggleMute} className="text-[#a4aaa7] hover:text-white cursor-pointer">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span className="text-[11px] font-mono text-[#a4aaa7]">
                    جاري عرض سابقة الأعمال {activeVideo}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00e676]">HD FitBrilliance Live</span>
              </div>
            )}
          </div>

          {/* Inspirational Quote Overlay */}
          <div className="m-3 p-4 bg-[#090d0e]/90 border border-[#222d2b] rounded-xl text-right">
            <div className="flex items-start gap-2.5">
              <Quote className="w-4 h-4 text-[#d99c43] shrink-0 rotate-180 mt-0.5" />
              <div>
                <p className="text-xs text-[#f4f0e7] italic font-medium leading-relaxed">
                  "{INSPIRATIONAL_QUOTES[quoteIndex].text}"
                </p>
                <span className="text-[11px] font-mono text-[#d99c43] block mt-1">
                  {INSPIRATIONAL_QUOTES[quoteIndex].author}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Direct Access Gates */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          
          <button
            onClick={openSearchModal}
            className="group w-full p-4 bg-[#121819] hover:bg-[#1a2325] border border-[#222d2b] hover:border-[#d99c43]/50 rounded-2xl text-right transition-all flex items-center gap-4 shadow-md hover:-translate-x-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-[#d99c43] group-hover:text-[#0b0c10] transition-all">
              01
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#f4f0e7] group-hover:text-[#d99c43] transition-colors">
                البحث السريع عن مستندك أو تقريرك
              </h4>
              <p className="text-xs text-[#a4aaa7] mt-0.5 leading-snug">
                اكتب كود المشروع أو اطلب تقريرك الخاص فوراً بأمان تام
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#d99c43] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={openStrategyModal}
            className="group w-full p-4 bg-[#121819] hover:bg-[#1a2325] border border-[#222d2b] hover:border-[#d99c43]/50 rounded-2xl text-right transition-all flex items-center gap-4 shadow-md hover:-translate-x-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-[#d99c43] group-hover:text-[#0b0c10] transition-all">
              02
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#f4f0e7] group-hover:text-[#d99c43] transition-colors">
                خطة التحول والـ 90 يوم
              </h4>
              <p className="text-xs text-[#a4aaa7] mt-0.5 leading-snug">
                منظومة عمل متكاملة: أفراد · شركات · مؤسسات · رياضيون
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#d99c43] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={openJoinModal}
            className="group w-full p-4 bg-[#121819] hover:bg-[#1a2325] border border-[#222d2b] hover:border-[#d99c43]/50 rounded-2xl text-right transition-all flex items-center gap-4 shadow-md hover:-translate-x-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-[#d99c43] group-hover:text-[#0b0c10] transition-all">
              03
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#f4f0e7] group-hover:text-[#d99c43] transition-colors">
                الانضمام إلى مجتمع النخبة والمبدعين
              </h4>
              <p className="text-xs text-[#a4aaa7] mt-0.5 leading-snug">
                صنّاع المحتوى · مصورين · كُتّاب · خبراء التسويق الميداني
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#d99c43] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>
      </div>

      {/* About Coach Serag & FitBrilliance */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
        <div className="relative w-full md:w-56 h-48 rounded-xl overflow-hidden border border-[#d99c43]/40 shrink-0 bg-[#090d0e]">
          <img
            src="/work/SeragO.png"
            alt="كوتش سراج — FitBrilliance"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
            <span className="text-xs font-bold text-[#d99c43]">كوتش سراج (Coach Serag)</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-right flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#d99c43]/15 text-[#d99c43] border border-[#d99c43]/40 px-3 py-0.5 rounded-full text-xs font-mono font-bold">
              عن المنظومة والرؤية
            </span>
            <span className="text-xs font-mono text-[#00e676] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> توثيق مباشر
            </span>
          </div>

          <h3 className="text-base md:text-xl font-extrabold text-[#f4f0e7]">
            منظومة التحول الاستراتيجي والريادة الميدانية المطلقة
          </h3>
          <p className="text-xs text-[#a4aaa7] leading-relaxed">
            تحت قيادة <strong className="text-[#d99c43]">كوتش سراج</strong>، بنقدّم منهجية متكاملة بتبدأ من دراسة الواقع بدقة هندسية وتنتهي بريادة حقيقية في السوق. مفيش قوالب جاهزة؛ كل خطة بيتم تصميمها وتفصيلها على مقاس أهدافك بالدقة التشغيلية والمالية.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <a
              href="https://wa.me/201274879442"
              target="_blank"
              rel="noreferrer"
              className="bg-[#00e676] hover:bg-[#00c853] text-[#0b0c10] text-xs font-extrabold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#00e676]/20"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              تواصل واتساب مباشر (+201274879442)
            </a>
            <button
              onClick={openStrategyModal}
              className="bg-[#d99c43] hover:bg-[#b88232] text-[#0b0c10] text-xs font-black px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              طلب استراتيجية 90 يوم
            </button>
            <button
              onClick={() => onExploreProject('PRJ-101')}
              className="bg-[#090d0e] hover:bg-[#121819] border border-[#222d2b] text-[#f4f0e7] text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              استعراض نموذج تقرير محمي
            </button>
          </div>
        </div>
      </div>

      {/* Marketing Charter Section */}
      <div className="bg-[#121819] border border-[#222d2b] rounded-2xl p-6 md:p-8">
        <h3 className="text-base font-bold text-[#f4f0e7] border-b border-[#222d2b] pb-3 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#d99c43]" />
          ميثاق التميز والتنفيذ الذكي
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-xl flex flex-col gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono flex items-center justify-center text-xs font-bold">01</span>
            <h4 className="text-xs font-bold text-[#f4f0e7]">الفكرة والتنفيذ الصح</h4>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              الأفكار موجودة مالية الدنيا، بس اللي بيعمل الفارق الحقيقي هو عبقرية التنفيذ والتوجيه الصح اللي بيضاعف عائد الاستثمار.
            </p>
          </div>

          <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-xl flex flex-col gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono flex items-center justify-center text-xs font-bold">02</span>
            <h4 className="text-xs font-bold text-[#f4f0e7]">تأصيل الفرادة والتميز</h4>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              بنصمم حلول مفصلة خصيصاً لهويتك المشروعة؛ مفيش استنساب ولا تكرار عشان تضمن السيطرة الهادئة على مجالك.
            </p>
          </div>

          <div className="bg-[#090d0e] border border-[#222d2b] p-5 rounded-xl flex flex-col gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#d99c43]/15 border border-[#d99c43]/40 text-[#d99c43] font-mono flex items-center justify-center text-xs font-bold">03</span>
            <h4 className="text-xs font-bold text-[#f4f0e7]">الحماية والالتزام الحقيقي</h4>
            <p className="text-xs text-[#a4aaa7] leading-relaxed">
              كل التقرير والمستندات محمية بأنظمة أمان مشددة وشفافة، بتمنع التسريب وتسجيل الوصول لحظة بلحظة.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
