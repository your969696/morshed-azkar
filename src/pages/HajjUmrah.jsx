import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const hajjSteps = [
  {
    title: 'الإحرام',
    icon: ' Ihram ',
    description: 'النية والاغتسال ولبس الإحرام من الميقات المحدد',
    details: 'يبدأ الإحرام من الميقات المحدد لكل من يأتي من طريقه. للحاج من القاهرة: الميقات هو قرن المنازل. ياغتسل ويتطهر ويلبس ثوبي الإحرام (الإزار والرداء للرجال، وثوب محتشم للنساء) وينوي الإحرام بقوله: "لبيك الله لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك، لا شريك لك".',
    tips: ['اغتسل قبل الإحرام', ' البس ثياب الإحرام', 'تطهر وتطيب إن أردت', 'لا تحلق الشعر أو تقطع الأظافر']
  },
  {
    title: 'الطواف',
    icon: '🔄',
    description: 'طواف الإحرام 7 أشواط حول الكعبة المشرفة',
    details: 'يبدأ الطواف من الحجر الأسود وينتهي عنده. يستحب أن يقبل الحجر الأسود أو يلمسه إن أمكن، وإلا فيشار إليه. يستحب الدعاء في كل شوط، ويرفع اليدين عند أول شوط ثم لا يرفعهما بعد ذلك. ولا يقول إلا ما يسره الله.',
    tips: ['ابدأ من الحجر الأسود', '7 أشواط عكس عقارب الساعة', 'استقبل الكعبة في كل شوط', 'ادع في كل شوط']
  },
  {
    title: 'السعي',
    icon: '🚶',
    description: 'السعي بين الصفا والمروة 7 أشواط',
    details: 'يبدأ السعي من الصفا وينتهي عند المروة. يصعد على الصفا ويستقبل الكعبة ويدعي الله، ثم يمشي نحو المروة حثيثاً (مشياً سريعاً للرجال) بين العلمين الأخضرين، ثم يصعد على المروة ويستقبل الكعبة ويدعي الله، ثم ينزل ويعود إلى الصفا، وهكذا 7 أشواط.',
    tips: ['ابدأ من الصفا وانتهِ عند المروة', '7 أشواط', 'سرع المشي بين العلمين الأخضرين للرجال', 'ادع الله في كل صعود']
  },
  {
    title: 'الوقوف بعرفة',
    icon: '🏔️',
    description: 'الوقوف بعرفة هو ركن الأعظم من أركان الحج',
    details: 'يجب الوقوف بعرفة من زوال الشمس حتى طلوع الفجر من يوم النحر. أفضل الوقوف في عرفة عند جبل الرحمة. يكثر الدعاء والذكر والاستغفار. النبي ﷺ قال: "خير الدعاء دعاء يوم عرفة".',
    tips: ['من زوال الشمس حتى طلوع الفجر', 'أفضل الدعاء: لا إله إلا الله وحده لا شريك له', 'استقبل القبلة', 'لا تنسَ من الإحرام']
  },
  {
    title: 'المزدلفة',
    icon: '⛰️',
    description: 'المبيت في المزدلفة جمع الحصى لرمي الجمرات',
    details: 'يبيت الحجاج في المزدلفة من ليلة النحر حتى الفجر. ويجمعون الحصى لرمي الجمرات. ويستحب أن يقف عند المزدلفة ويصلي المغرب والعشاء جمعاً وقصراً.',
    tips: ['يجمع حصى صغير للرمي', 'يصلي المغرب والعشاء جمعاً وقصراً', 'يبيت حتى الفجر', 'يسقط عن النساء والضعفاء']
  },
  {
    title: 'رمي الجمرات',
    icon: ' throwing ',
    description: 'رمي الجمرات الثلاث من جمرة العقبة',
    details: 'يرمي جمرة العقبة (الكبرى) بسبع حصيات يوم النحر. ويرمي الجمرات الثلاث (الصغرى والمتوسطة والكبرى) في أيام التشريق. كل جمرة بسبع حصيات. يستحب أن يقرأ التكبير عند كل حصاة.',
    tips: ['يوم النحر: رمي جمرة العقبة فقط', 'أيام التشريف: رمي الجمرات الثلاث', 'سبع حصيات لكل جمرة', 'ارمِ من بعيد ولا تزاحم']
  },
  {
    title: 'الذبح/النحر',
    icon: '🐑',
    description: 'ذبح الهدي أو الأضحية يوم النحر',
    details: 'يذبح الحاج هديه يوم النحر بعد رمي جمرة العقبة. ويستحب أن يكون الذبح في المكان المحدد. ويأكل من لحم الهدي ويهدي وتصدق.',
    tips: ['يوم النحر فقط', 'يأكل ثلثه ويهدى ثلثه ويتصدق ثلثه', 'يذبح في المكان المحدد', 'البدلاء من ذهاب الحلق']
  },
  {
    title: 'الحلق',
    icon: '✂️',
    description: 'حلق الرأس أو تقصيره للنساء',
    details: 'يحلق الرجل رأسه كاملاً أو يقصر، والمرأة تقصر شعرها قدر أنملة. ويكون ذلك بعد رمي جمرة العقبة والذبح.',
    tips: ['الرجال: حلق أو تقصير', 'النساء: تقصير فقط', 'بعد رمي جمرة العقبة والذبح', 'يكون الحلق في المكان المحدد']
  },
  {
    title: 'الطواف الإفاضة',
    icon: '🔄',
    description: 'طواف الإفاضة بعد انتهاء أيام التشريق',
    details: 'يكون طواف الإفاضة بعد أيام التشريق وهو من أركان الحج. يطوف حول الكعبة 7 أشواط كما في طواف الإحرام.',
    tips: ['يكون بعد أيام التشريق', '7 أشواط', 'من أركان الحج', 'لا يجوز تركه']
  },
  {
    title: 'الطواف الوداع',
    icon: '👋',
    description: 'طواف الوداع وهو آخر ما يفعله الحاج قبل مغادرة مكة',
    details: 'طواف الوداع هو آخر ما يفعله الحاج قبل مغادرة مكة. يطوف حول الكعبة 7 أشواط ويشرب من ماء Zamzem ويستقبل الحجر الأسود.',
    tips: ['آخر ما يفعله الحاج', '7 أشواط', 'يشرب من ماء Zamzem', 'يستقبل الحجر الأسود']
  }
];

const umrahSteps = [
  {
    title: 'الإحرام من الميقات',
    icon: ' Ihram ',
    details: 'ينوي الإحرام من الميقات المحدد ويقول: "لبيك الله لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك، لا شريك لك". ويستحب الاغتسال ولبس الإحرام.'
  },
  {
    title: 'الطواف',
    icon: '🔄',
    details: 'يطوف حول الكعبة 7 أشواط ابتداءً من الحجر الأسود وانتهاءً به. يستقبل الكعبة في كل شوط ويديع الله.'
  },
  {
    title: 'السعي',
    icon: '🚶',
    details: 'يسعي بين الصفا والمروة 7 أشواط ابتداءً من الصفا وانتهاءً بالمروة. يستقبل الكعبة عند صعود كل جبل ويديع الله.'
  },
  {
    title: 'الحلق أو التقصير',
    icon: '✂️',
    details: 'حلق الرأس كاملاً أو تقصيره. للرجال الحلق أو التقصير، والنساء التقصير فقط.'
  }
];

export default function HajjUmrah() {
  const [activeTab, setActiveTab] = useState('hajj');
  const [expandedStep, setExpandedStep] = useState(null);
  const { t } = useTranslation();

  return (
    <div className="page-wrap pb-24">
      <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #1e1545 70%, #0f0a1a 100%)' }}>
          <svg viewBox="0 0 400 80" className="absolute top-0 w-full" preserveAspectRatio="none">
            <ellipse cx="80" cy="25" rx="50" ry="18" fill="white" opacity="0.85" />
            <ellipse cx="60" cy="25" rx="30" ry="14" fill="white" opacity="0.85" />
            <ellipse cx="100" cy="25" rx="25" ry="11" fill="white" opacity="0.85" />
            <ellipse cx="250" cy="20" rx="45" ry="16" fill="white" opacity="0.85" />
          </svg>
          <svg viewBox="0 0 400 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,60 L0,50 L20,50 L25,35 L30,50 L45,50 L50,25 L55,50 L70,50 L75,40 L80,50 L120,50 L130,20 L140,50 L180,50 L185,42 L190,50 L220,50 L225,30 L230,50 L260,50 L270,22 L280,50 L310,50 L315,38 L320,50 L350,50 L360,15 L370,50 L400,50 L400,60 Z" fill="#0f0a1a" opacity="0.6" />
          </svg>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🕋</span>
            <h1 className="text-2xl font-bold text-white">{t.hajj?.title || 'دليل الحج والعمرة'}</h1>
          </div>
          <p className="text-white/70 text-sm">{t.hajj?.subtitle || 'خطوات الحج والعمرة بالتفصيل مع الأدعية والأركان'}</p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setActiveTab('hajj'); setExpandedStep(null); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'hajj' ? 'bg-gradient-to-r from-[#00c896] to-[#00acc1] text-white' : 'bg-[#2d1b69] text-[#c4b5d4] border border-[#4a2d7a]'}`}>
            {t.hajj?.hajjTab || 'الحج (10 خطوات)'}
          </button>
          <button onClick={() => { setActiveTab('umrah'); setExpandedStep(null); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'umrah' ? 'bg-gradient-to-r from-[#00c896] to-[#00acc1] text-white' : 'bg-[#2d1b69] text-[#c4b5d4] border border-[#4a2d7a]'}`}>
            {t.hajj?.umrahTab || 'العمرة (4 خطوات)'}
          </button>
        </div>

        {activeTab === 'hajj' && (
          <div className="space-y-3">
            {hajjSteps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <div onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className={`rounded-2xl border-2 cursor-pointer transition-all ${expandedStep === index ? 'border-[#00c896] bg-[#00c896]/10' : 'border-[#4a2d7a] bg-gradient-to-br from-[#2d1b69] to-[#0f0a1a]'}`}>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00c896] to-[#00acc1] flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{step.title}</h3>
                      <p className="text-[#9580b0] text-sm">{step.description}</p>
                    </div>
                    <span className="text-[#9580b0] text-xl">{expandedStep === index ? '▲' : '▼'}</span>
                  </div>

                  <AnimatePresence>
                    {expandedStep === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#4a2d7a]">
                        <div className="p-4">
                          <p className="text-white/90 text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-naskh)' }}>{step.details}</p>
                          {step.tips && (
                            <div className="bg-[#0f0a1a]/50 rounded-xl p-3 border border-[#4a2d7a]">
                              <p className="text-[#00acc1] text-sm font-bold mb-2">{t.hajj?.tips || '💡 نصائح مهمة:'}</p>
                              <ul className="space-y-1">
                                {step.tips.map((tip, i) => (
                                  <li key={i} className="text-[#c4b5d4] text-sm flex items-start gap-2">
                                    <span className="text-[#00acc1]">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'umrah' && (
          <div className="space-y-3">
            {umrahSteps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <div onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className={`rounded-2xl border-2 cursor-pointer transition-all ${expandedStep === index ? 'border-[#00c896] bg-[#00c896]/10' : 'border-[#4a2d7a] bg-gradient-to-br from-[#2d1b69] to-[#0f0a1a]'}`}>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00c896] to-[#00acc1] flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{step.title}</h3>
                    </div>
                    <span className="text-[#9580b0] text-xl">{expandedStep === index ? '▲' : '▼'}</span>
                  </div>
                  <AnimatePresence>
                    {expandedStep === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#4a2d7a]">
                        <div className="p-4">
                          <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-naskh)' }}>{step.details}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
