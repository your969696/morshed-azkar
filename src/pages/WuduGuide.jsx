import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const WUDU_STEPS = [
  {
    num: 1,
    titleAr: 'النية والاستعاذة',
    subAr: 'البداية بالنية',
    type: 'fard',
    times: null,
    memberAr: 'قال العلماء',
    memberTextAr: 'النية شرط لصحة الوضوء',
    descAr: 'يبدأ المسلم بالنية في قلبه أن يتوضأ لإزالة النجاسة والاستعداد للصلاة. ويستعيذ بالله من الشيطان الرجيم.',
    duaAr: 'بسم الله الرحمن الرحيم',
    duaTrans: 'In the name of Allah, the Most Gracious, the Most Merciful',
    highlight: 'heart',
    bgColor: '#8b5cf6',
  },
  {
    num: 2,
    titleAr: 'غسل الكفين',
    subAr: 'ثلاث مرات',
    type: 'sunnah',
    times: 3,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'إذا استيقظ أحدكم من نومه فلا يغمس يده في الإناء',
    descAr: 'يغسل المسلم كفيه بالماء ثلاث مرات مع التكبير، ويتأكد من وصول الماء بين أصابعه وأظافره.',
    duaAr: null,
    highlight: 'hands',
    bgColor: '#3b82f6',
  },
  {
    num: 3,
    titleAr: 'المضمضة والاستنشاق',
    subAr: 'ثلاث مرات',
    type: 'sunnah',
    times: 3,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'إذا توضأ أحدكم فليجع في أنفه ماء ثم ليستنشق',
    descAr: 'يأخذ المسلم الماء في يده ويضعه في فمه ويمضمض (يمضمض)، ثم يستنشق الماء من أنفه ويطرده. يكرر ثلاث مرات.',
    duaAr: null,
    highlight: 'face_mouth',
    bgColor: '#ec4899',
  },
  {
    num: 4,
    titleAr: 'غسل الوجه',
    subAr: 'ثلاث مرات',
    type: 'fard',
    times: 3,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'اغسلوا وجوهكم عند غسلها',
    descAr: 'يغسل المسلم وجهه بالماء من مقدمة الرأس إلى الذقن ومن أذن إلى أذن. ويتأكد من وصول الماء للبشرة بالكامل.',
    duaAr: null,
    highlight: 'face',
    bgColor: '#f0b040',
  },
  {
    num: 5,
    titleAr: 'غسل اليدين إلى المرفقين',
    subAr: 'ثلاث مرات',
    type: 'fard',
    times: 3,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'أتموا الوضوء وأحسنوه',
    descAr: 'يغسل المسلم ذراعيه من أطراف الأصابع إلى المرفقين مراراً ثلاثاً. ويتأكد من وصول الماء للمرفقين.',
    duaAr: null,
    highlight: 'arms',
    bgColor: '#00c896',
  },
  {
    num: 6,
    titleAr: 'مسح الرأس',
    subAr: 'مرة واحدة',
    type: 'fard',
    times: 1,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'يجزئ من الرأس ما تغطيه',
    descAr: 'يمسح المسلم رأسه بالماء من مقدمة الرأس إلىمؤخرته ثم يعدها إلى المقدمة. ويجزئ مسح ثلث الرأس.',
    duaAr: null,
    highlight: 'head',
    bgColor: '#8b5cf6',
  },
  {
    num: 7,
    titleAr: 'غسل الرجلين',
    subAr: 'ثلاث مرات',
    type: 'fard',
    times: 3,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'خالصت لهما نصيبي',
    descAr: 'يغسل المسلم قدميه مع الكعبينثلاث مرات. ويتأكد من وصول الماء بين أصابع قدميه.',
    duaAr: 'اللهم اجعلني من التوابين واجعلني من المتطهرين',
    duaTrans: 'O Allah, make me among those who repent and those who purify themselves',
    highlight: 'feet',
    bgColor: '#f97316',
  },
  {
    num: 8,
    titleAr: 'الدعاء بعد الوضوء',
    subAr: 'الختم بالدعاء',
    type: 'sunnah',
    times: null,
    memberAr: 'قال النبي ﷺ',
    memberTextAr: 'ما منكم من يتوضأ فيحسن وضوءه',
    descAr: 'بعد انتهاء الوضوء، يرفع المسلم يديه ويدعي الله بدعاء الوضوء الشهير. ثم يشهد أن لا إله إلا الله وحده لا شريك له.',
    duaAr: 'أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله',
    duaTrans: 'I bear witness that there is no god but Allah alone, and I bear witness that Muhammad is His servant and Messenger',
    highlight: 'full',
    bgColor: '#00c896',
  },
];

function WuduFigure({ highlight, bgColor, stepNum }) {
  const activeColor = bgColor;
  const clothColor = '#2a1f5a';
  const clothLight = '#3a2f7a';

  const highlights = {
    heart: `<ellipse cx="80" cy="80" rx="18" ry="18" fill="${activeColor}33" stroke="${activeColor}" stroke-width="1.5" opacity=".9"><animate attributeName="r" values="16;20;16" dur="1.5s" repeatCount="indefinite"/></ellipse>`,
    hands: `
      <ellipse cx="28" cy="155" rx="16" ry="20" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>
      <ellipse cx="132" cy="155" rx="16" ry="20" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>`,
    face_mouth: `
      <ellipse cx="80" cy="42" rx="22" ry="12" fill="${activeColor}33" stroke="${activeColor}" stroke-width="1.5"/>`,
    face: `
      <ellipse cx="80" cy="42" rx="26" ry="28" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>`,
    arms: `
      <rect x="10" y="90" width="28" height="75" rx="12" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>
      <rect x="122" y="90" width="28" height="75" rx="12" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>`,
    head: `
      <ellipse cx="80" cy="25" rx="28" ry="20" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>
      <ellipse cx="52" cy="42" rx="8" ry="10" fill="${activeColor}22" stroke="${activeColor}" stroke-width="1.5"/>
      <ellipse cx="108" cy="42" rx="8" ry="10" fill="${activeColor}22" stroke="${activeColor}" stroke-width="1.5"/>`,
    feet: `
      <ellipse cx="62" cy="188" rx="18" ry="10" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>
      <ellipse cx="98" cy="188" rx="18" ry="10" fill="${activeColor}33" stroke="${activeColor}" stroke-width="2"/>`,
    full: `
      <ellipse cx="80" cy="100" rx="70" ry="95" fill="${activeColor}15" stroke="${activeColor}" stroke-width="1.5" stroke-dasharray="6,4"/>`,
  };

  return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" style={{ width: 160, height: 200 }}>
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e8c49a"/>
          <stop offset="100%" stopColor="#c8956a"/>
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={activeColor} stopOpacity=".15"/>
          <stop offset="100%" stopColor={activeColor} stopOpacity="0"/>
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="100" rx="75" ry="95" fill="url(#glowGrad)"/>

      <path d="M45 78 Q30 82 22 95 L18 170 Q18 178 28 180 L132 180 Q142 178 142 170 L138 95 Q130 82 115 78 Z" fill={clothColor}/>
      <path d="M80 78 L70 180 L90 180 Z" fill={clothLight} opacity=".3"/>
      <path d="M65 78 Q80 88 95 78" fill="none" stroke={clothLight} strokeWidth="1.5" opacity=".5"/>

      <path d="M45 82 Q28 90 22 110 Q18 130 24 155 Q26 162 34 160 Q38 158 36 150 Q32 128 36 110 Q40 96 52 90 Z" fill="url(#bodyGrad)"/>
      <path d="M115 82 Q132 90 138 110 Q142 130 136 155 Q134 162 126 160 Q122 158 124 150 Q128 128 124 110 Q120 96 108 90 Z" fill="url(#bodyGrad)"/>

      <ellipse cx="29" cy="160" rx="10" ry="14" fill="url(#bodyGrad)"/>
      <path d="M20 155 Q18 148 22 145 Q25 143 27 148" fill="url(#bodyGrad)" stroke="#c8956a" strokeWidth=".5"/>
      <ellipse cx="131" cy="160" rx="10" ry="14" fill="url(#bodyGrad)"/>
      <path d="M140 155 Q142 148 138 145 Q135 143 133 148" fill="url(#bodyGrad)" stroke="#c8956a" strokeWidth=".5"/>

      <path d="M55 170 L50 195 L70 195 L72 175 Z" fill={clothColor}/>
      <path d="M105 170 L110 195 L90 195 L88 175 Z" fill={clothColor}/>

      <ellipse cx="60" cy="193" rx="15" ry="6" fill="url(#bodyGrad)"/>
      <ellipse cx="100" cy="193" rx="15" ry="6" fill="url(#bodyGrad)"/>

      <rect x="72" y="58" width="16" height="24" rx="8" fill="url(#bodyGrad)"/>
      <ellipse cx="80" cy="38" rx="26" ry="28" fill="url(#bodyGrad)"/>

      <ellipse cx="70" cy="34" rx="4" ry="4.5" fill="#2d1b0e"/>
      <ellipse cx="90" cy="34" rx="4" ry="4.5" fill="#2d1b0e"/>
      <ellipse cx="71" cy="33" rx="1.5" ry="1.5" fill="#fff" opacity=".6"/>
      <ellipse cx="91" cy="33" rx="1.5" ry="1.5" fill="#fff" opacity=".6"/>
      <path d="M65 27 Q70 24 75 26" fill="none" stroke="#3d2010" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M85 26 Q90 24 95 27" fill="none" stroke="#3d2010" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M78 36 Q80 42 82 36" fill="none" stroke="#b07040" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M73 46 Q80 51 87 46" fill="none" stroke="#a06030" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="54" cy="38" rx="5" ry="8" fill="url(#bodyGrad)"/>
      <ellipse cx="106" cy="38" rx="5" ry="8" fill="url(#bodyGrad)"/>
      <path d="M58 52 Q80 65 102 52 Q98 70 80 72 Q62 70 58 52 Z" fill="#3d2010" opacity=".5"/>

      <ellipse cx="80" cy="16" rx="27" ry="14" fill="#f5f0e8"/>
      <path d="M53 16 Q80 4 107 16 Q107 22 80 24 Q53 22 53 16 Z" fill="#f5f0e8"/>
      <path d="M53 16 Q70 20 80 19 Q90 20 107 16" fill="none" stroke="#e0d8cc" strokeWidth="1"/>
      <ellipse cx="80" cy="20" rx="27" ry="7" fill="none" stroke="#222" strokeWidth="3"/>

      {highlight !== 'heart' && highlight !== 'full' && (
        <>
          <circle cx={highlight==='hands'?42:highlight==='feet'?65:highlight==='arms'?15:75} cy={highlight==='hands'?140:highlight==='feet'?170:highlight==='arms'?100:60} r="2" fill={activeColor} opacity=".6">
            <animate attributeName="cy" values={highlight==='hands'?'130;150':highlight==='feet'?'160;180':highlight==='arms'?'90;120':'50;70'} dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx={highlight==='hands'?118:highlight==='feet'?95:highlight==='arms'?145:85} cy={highlight==='hands'?135:highlight==='feet'?165:highlight==='arms'?105:55} r="1.5" fill={activeColor} opacity=".5">
            <animate attributeName="cy" values={highlight==='hands'?'125;145':highlight==='feet'?'155;175':highlight==='arms'?'95;125':'45;65'} dur="1.2s" repeatCount="indefinite" begin=".3s"/>
            <animate attributeName="opacity" values="0.6;0" dur="1.2s" repeatCount="indefinite" begin=".3s"/>
          </circle>
        </>
      )}

      <g dangerouslySetInnerHTML={{ __html: highlights[highlight] || '' }} />

      <circle cx="148" cy="12" r="10" fill={activeColor}/>
      <text x="148" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="sans-serif">{stepNum}</text>
    </svg>
  );
}

export default function WuduGuide() {
  const { t, lang } = useTranslation();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (current < WUDU_STEPS.length) {
      setCurrent(c => c + 1);
      document.querySelector('[data-scroll-container]')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [current]);

  const prev = useCallback(() => {
    if (current > 0) {
      setCurrent(c => c - 1);
      document.querySelector('[data-scroll-container]')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [current]);

  const goTo = useCallback((i) => {
    setCurrent(i);
    document.querySelector('[data-scroll-container]')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const restart = useCallback(() => {
    setCurrent(0);
    document.querySelector('[data-scroll-container]')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAr = lang === 'ar';

  const getStepTitle = (step, lang) => {
    if (lang === 'ar') return step.titleAr;
    if (lang === 'en') {
      const enTitles = ['Intention & Seeking Refuge', 'Washing Hands', 'Rinsing Mouth & Nose', 'Washing Face', 'Washing Arms to Elbows', 'Wiping Head', 'Washing Feet', 'Supplication After Wudu'];
      return enTitles[step.num - 1] || step.titleAr;
    }
    if (lang === 'es') {
      const esTitles = ['Intención y Refugio', 'Lavado de Manos', 'Enjuague de Boca y Nariz', 'Lavado del Rostro', 'Lavado de Brazos hasta Codos', 'Limpiado de la Cabeza', 'Lavado de Pies', 'Suplicación después del Wudu'];
      return esTitles[step.num - 1] || step.titleAr;
    }
    return step.titleAr;
  };

  const getStepSub = (step, lang) => {
    if (lang === 'ar') return step.subAr;
    return step.times ? `× ${step.times}` : lang === 'en' ? 'Completion' : 'Finalización';
  };

  const getStepDesc = (step, lang) => {
    if (lang === 'ar') return step.descAr;
    if (lang === 'en') {
      const enDescs = [
        'The Muslim begins with intention in his heart to perform wudu for removing impurity and preparing for prayer. He seeks refuge in Allah from the accursed Satan.',
        'The Muslim washes his hands three times with water while saying Allahu Akbar, ensuring water reaches between his fingers and nails.',
        'The Muslim takes water in his hand, puts it in his mouth and rinses (madmada), thensniffs water into his nose and expels it. Repeats three times.',
        'The Muslim washes his face with water from the front of the head to the chin and from ear to ear. He ensures water reaches the entire skin.',
        'The Muslim washes his arms from the fingertips to the elbows three times. He ensures water reaches the elbows.',
        'The Muslim wipes his head with water from the front to the back then returns it to the front. Wiping a third of the head is sufficient.',
        'The Muslim washes his feet with water including the ankles three times. He ensures water reaches between his toes.',
        'After wudu, the Muslim raises his hands and supplicates with the famous wudu supplication. Then he bears witness that there is no god but Allah alone.',
      ];
      return enDescs[step.num - 1] || step.descAr;
    }
    if (lang === 'es') {
      const esDescs = [
        'El musulmán comienza con la intención en su corazón de realizar el wudu para eliminar la impureza y prepararse para la oración. Pide refugio en Allah de Satanás el Apedreado.',
        'El musulmán lava sus manos tres veces con agua mientras dice Allahu Akbar, asegurándose de que el agua llegue entre sus dedos y uñas.',
        'El musulmán toma agua en su mano, la pone en su boca y enjuaga (madmada), luego aspira agua por la nariz y la expulsa. Repite tres veces.',
        'El musulmán lava su rostro con agua desde la frente hasta la barbilla y de oreja a oreja. Se asegura de que el agua llegue a toda la piel.',
        'El musulmán lava sus brazos desde las puntas de los dedos hasta los codos tres veces. Se asegura de que el agua llegue a los codos.',
        'El musulmán pasa sus manos mojadas por su cabeza de adelante hacia atrás y luego vuelve hacia adelante. Limpiar un tercio de la cabeza es suficiente.',
        'El musulmán lava sus pies con agua incluyendo los tobillos tres veces. Se asegura de que el agua llegue entre sus dedos de los pies.',
        'Después del wudu, el musulmán levanta sus manos y suplica con la famosa supplicación del wulu. Luego da testimonio de que no hay dios sino Allah.',
      ];
      return esDescs[step.num - 1] || step.descAr;
    }
    return step.descAr;
  };

  const getMemberText = (step, lang) => {
    if (lang === 'ar') return step.memberTextAr;
    if (lang === 'en') {
      const enMembers = [
        'The scholars said: Intention is a condition for the validity of wudu',
        'The Prophet ﷺ said: When one of you wakes from sleep, let him not dip his hand in the vessel',
        'The Prophet ﷺ said: When one of you performs wudu, let him put water in his nose and sniff it',
        'The Prophet ﷺ said: Wash your face three times',
        'The Prophet ﷺ said: Complete the wudu and beautify it',
        'The Prophet ﷺ said: What covers the head is sufficient',
        'The Prophet ﷺ said: My ummah will come on the Day of Resurrection with bright faces, hands and feet from the traces of wudu',
        'The Prophet ﷺ said: Whoever performs wudu well and then says: I bear witness...',
      ];
      return enMembers[step.num - 1] || step.memberTextAr;
    }
    if (lang === 'es') {
      const esMembers = [
        'Los eruditos dijeron: La intención es una condición para la validez del wudu',
        'El Profeta ﷺ dijo: Cuando uno de ustedes despierte de su sueño, que no meta su mano en el recipiente',
        'El Profeta ﷺ dijo: Cuando uno de ustedes realice el wudu, que ponga agua en su nariz y la aspire',
        'El Profeta ﷺ dijo: Lava tu rostro tres veces',
        'El Profeta ﷺ dijo: Completa el wudu y embellecelo',
        'El Profeta ﷺ dijo: Lo que cubra la cabeza es suficiente',
        'El Profeta ﷺ dijo: Mi ummah vendrá el Día de la Resurrección con caras, manos y pies brillantes por las huellas del wudu',
        'El Profeta ﷺ dijo: Quien realice bien el wudu y luego diga: Doy testimonio...',
      ];
      return esMembers[step.num - 1] || step.memberTextAr;
    }
    return step.memberTextAr;
  };

  const getMemberLabel = (step, lang) => {
    if (lang === 'ar') return step.memberAr;
    if (lang === 'en') return 'The Prophet ﷺ said';
    if (lang === 'es') return 'El Profeta ﷺ dijo';
    return step.memberAr;
  };

  const getDuaTrans = (step, lang) => {
    if (lang === 'ar') return step.duaTrans;
    return step.duaTrans;
  };

  const typeLabel = (type, lang) => {
    if (lang === 'ar') return type === 'fard' ? 'فرض' : 'سنة';
    if (lang === 'en') return type === 'fard' ? 'Fard' : 'Sunnah';
    if (lang === 'es') return type === 'fard' ? 'Fard' : 'Sunnah';
    return type === 'fard' ? 'فرض' : 'سنة';
  };

  const tagClass = (type) => type === 'fard' ? 'tag-fard' : 'tag-sunnah';

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '16px 16px 100px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <style>{`
        .wudu-progress{display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:20px;flex-wrap:wrap}
        .wudu-pb-step{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;transition:all .3s;border:2px solid rgba(255,255,255,.1);color:rgba(255,255,255,.3);background:transparent}
        .wudu-pb-step.done{background:#00c896;border-color:#00c896;color:#fff}
        .wudu-pb-step.active{background:rgba(0,200,150,.15);border-color:#00c896;color:#00c896}
        .wudu-pb-line{width:16px;height:2px;background:rgba(255,255,255,.1);border-radius:2px}
        .wudu-pb-line.done{background:#00c896}
        .wudu-card{background:var(--bg-secondary,#151030);border:1px solid var(--border-color,rgba(255,255,255,.07));border-radius:24px;overflow:hidden;margin-bottom:16px}
        .wudu-card-num{background:linear-gradient(135deg,rgba(0,200,150,.15),rgba(59,130,246,.08));padding:12px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.06)}
        .wudu-num-badge{display:flex;align-items:center;gap:8px}
        .wudu-num-circle{width:32px;height:32px;border-radius:50%;background:#00c896;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
        .wudu-num-title{font-size:14px;font-weight:700;color:var(--text-primary,#fff)}
        .wudu-num-sub{font-size:11px;color:var(--text-muted,rgba(255,255,255,.4));margin-top:1px}
        .wudu-repeat{background:rgba(240,176,64,.12);border:1px solid rgba(240,176,64,.25);border-radius:8px;padding:3px 8px;font-size:10px;font-weight:700;color:#f0b040}
        .wudu-illust{position:relative;height:220px;background:linear-gradient(160deg,#1a1040,#0c0818);display:flex;align-items:center;justify-content:center;overflow:hidden}
        .wudu-glow{position:absolute;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(0,200,150,.06),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%)}
        .wudu-step-info{padding:14px 18px}
        .wudu-actions{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .wudu-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700}
        .tag-fard{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171}
        .tag-sunnah{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2);color:#a78bfa}
        .tag-times{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#60a5fa}
        .wudu-desc{font-size:14px;color:var(--text-secondary,rgba(255,255,255,.85));line-height:1.7;margin-bottom:10px}
        .wudu-dua{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px 14px}
        .wudu-dua-label{font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;font-weight:600}
        .wudu-dua-text{font-size:15px;color:var(--text-primary,rgba(255,255,255,.9));line-height:1.9;font-family:'Traditional Arabic','Amiri',serif;direction:rtl}
        .wudu-dua-trans{font-size:11px;color:var(--text-muted,rgba(255,255,255,.4));margin-top:6px;line-height:1.5}
        .wudu-member{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 12px;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.15);border-radius:10px}
        .wudu-member-icon{font-size:18px}
        .wudu-member-text{font-size:12px;color:#00c896;font-weight:600}
        .wudu-nav{display:flex;gap:10px;margin-top:4px}
        .wudu-nav-btn{flex:1;padding:12px;border-radius:14px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
        .wudu-nav-prev{background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.08)}
        .wudu-nav-prev:hover{background:rgba(255,255,255,.1)}
        .wudu-nav-next{background:#00c896;color:#fff;box-shadow:0 4px 16px rgba(0,200,150,.25)}
        .wudu-nav-next:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .wudu-nav-next:disabled{background:rgba(255,255,255,.08);color:rgba(255,255,255,.3);box-shadow:none;transform:none}
        .wudu-done{background:linear-gradient(135deg,rgba(0,200,150,.1),rgba(59,130,246,.06));border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:28px 20px;text-align:center;margin-bottom:16px}
        .wudu-done-icon{font-size:52px;margin-bottom:12px}
        .wudu-done-title{font-size:20px;font-weight:700;color:var(--text-primary,#fff);margin-bottom:6px}
        .wudu-done-sub{font-size:13px;color:var(--text-muted,rgba(255,255,255,.5));line-height:1.6}
        .wudu-done-hadith{background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin-top:16px;font-family:'Traditional Arabic','Amiri',serif;font-size:15px;color:var(--text-secondary,rgba(255,255,255,.7));line-height:1.8}
        .wudu-restart{width:100%;padding:13px;background:#00c896;border:none;border-radius:14px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit;margin-top:12px}
        .wudu-header{text-align:center;margin-bottom:20px}
        .wudu-header h1{font-size:22px;font-weight:700;color:var(--text-primary,#fff);margin-bottom:4px}
        .wudu-header p{font-size:12px;color:var(--text-muted,rgba(255,255,255,.4))}
      `}</style>

      <div className="wudu-header">
        <h1>{isAr ? 'دليل الوضوء' : lang === 'en' ? 'Wudu Guide' : 'Guía del Wudu'}</h1>
        <p>{isAr ? 'خطوات الوضوء الصحي بالصور' : lang === 'en' ? 'Proper wudu steps with illustrations' : 'Pasos correctos del wudu con ilustraciones'}</p>
      </div>

      <div className="wudu-progress">
        {WUDU_STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <div className={`wudu-pb-line${i <= current ? ' done' : ''}`} />}
            <div
              className={`wudu-pb-step ${i < current ? 'done' : i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            >
              {i < current ? '✓' : step.num}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {current >= WUDU_STEPS.length ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="wudu-done">
              <div className="wudu-done-icon">💧</div>
              <div className="wudu-done-title">
                {isAr ? 'تم الوضوء بنجاح' : lang === 'en' ? 'Wudu Complete!' : '¡Wudu Completo!'}
              </div>
              <div className="wudu-done-sub">
                {isAr ? 'بارك الله فيك - نور الله وجهك يوم القيامة' : lang === 'en' ? 'May Allah bless you - May Allah illuminate your face on the Day of Judgment' : 'Que Allah te bendiga - Que Allah ilumine tu rostro el Día del Juicio'}
              </div>
              <div className="wudu-done-hadith">
                {isAr
                  ? '"ألا أدلُّكم على ما يُمحُو الله به الخطايا ويرفع به الدرجات؟" "إسباغ الوضوء على المكاره، وكثرة الخطى إلى المساجن، وانتظار الصلاة بعد الصلاة، فذلكم الرباط، فذلكم الرباط"'
                  : lang === 'en'
                  ? '"Shall I not tell you of that by which Allah erases sins and raises ranks?" "Perfecting wudu despite difficulty, taking many steps to the mosques, and waiting for prayer after prayer. That is the guard, that is the guard."'
                  : '"¿No les diré lo que borra Allah los pecados y eleva los rangos?" "El wudu perfecto a pesar de la dificultad, dar muchos pasos hacia las mezquitas y esperar la oración tras la oración. Esa es la guardia, esa es la guardia."'}
              </div>
              <button className="wudu-restart" onClick={restart}>
                {isAr ? '🔄 إعادة من البداية' : lang === 'en' ? '🔄 Restart from Beginning' : '🔄 Reiniciar desde el Principio'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: current > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
          >
            <div className="wudu-card">
              <div className="wudu-card-num">
                <div className="wudu-num-badge">
                  <div className="wudu-num-circle">{WUDU_STEPS[current].num}</div>
                  <div>
                    <div className="wudu-num-title">{getStepTitle(WUDU_STEPS[current], lang)}</div>
                    <div className="wudu-num-sub">{getStepSub(WUDU_STEPS[current], lang)}</div>
                  </div>
                </div>
                {WUDU_STEPS[current].times && (
                  <div className="wudu-repeat">× {WUDU_STEPS[current].times}</div>
                )}
              </div>

              <div className="wudu-illust" style={{ background: `linear-gradient(160deg,${WUDU_STEPS[current].bgColor}18,#0c0818)` }}>
                <div className="wudu-glow" style={{ background: `radial-gradient(circle,${WUDU_STEPS[current].bgColor}12,transparent 70%)` }} />
                <WuduFigure highlight={WUDU_STEPS[current].highlight} bgColor={WUDU_STEPS[current].bgColor} stepNum={WUDU_STEPS[current].num} />
              </div>

              <div className="wudu-step-info">
                <div className="wudu-actions">
                  <div className={`wudu-tag ${tagClass(WUDU_STEPS[current].type)}`}>
                    {WUDU_STEPS[current].type === 'fard' ? '⬤' : '◯'} {typeLabel(WUDU_STEPS[current].type, lang)}
                  </div>
                  {WUDU_STEPS[current].times && (
                    <div className="wudu-tag tag-times">
                      {isAr ? 'عدد' : lang === 'en' ? 'Times' : 'Veces'} {WUDU_STEPS[current].times} {isAr ? 'مرات' : lang === 'en' ? 'times' : 'veces'}
                    </div>
                  )}
                </div>

                <div className="wudu-desc">{getStepDesc(WUDU_STEPS[current], lang)}</div>

                <div className="wudu-member">
                  <div className="wudu-member-icon">📖</div>
                  <div className="wudu-member-text">
                    <strong>{getMemberLabel(WUDU_STEPS[current], lang)}</strong><br/>
                    {getMemberText(WUDU_STEPS[current], lang)}
                  </div>
                </div>

                {WUDU_STEPS[current].duaAr && (
                  <div className="wudu-dua" style={{ marginTop: 10 }}>
                    <div className="wudu-dua-label">{isAr ? 'الدعاء' : lang === 'en' ? 'Supplication' : 'Súplica'}</div>
                    <div className="wudu-dua-text">{WUDU_STEPS[current].duaAr}</div>
                    {WUDU_STEPS[current].duaTrans && (
                      <div className="wudu-dua-trans">{getDuaTrans(WUDU_STEPS[current], lang)}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="wudu-nav">
              <button
                className="wudu-nav-btn wudu-nav-prev"
                onClick={prev}
                disabled={current === 0}
              >
                {isAr ? '→ السابق' : lang === 'en' ? '← Previous' : '← Anterior'}
              </button>
              <button className="wudu-nav-btn wudu-nav-next" onClick={next}>
                {current < WUDU_STEPS.length - 1
                  ? (isAr ? 'التالي ←' : lang === 'en' ? 'Next →' : 'Siguiente →')
                  : (isAr ? '✓ الانتهاء' : lang === 'en' ? '✓ Finish' : '✓ Finalizar')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
