import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { sleepAzkar } from '../data/sleep-azkar';
import { istighfarAzkar } from '../data/istighfar-azkar';
import { salawatAzkar } from '../data/salawat-azkar';
import { ruqyahAzkar } from '../data/ruqyah-azkar';
import { adhanAzkar } from '../data/adhan-azkar';

const fmt = (arr) => arr.map(a => ({
  text: a.text,
  count: a.count || 1,
  source: a.source,
  ref: a.reference,
  isnad: a.isnad,
  narrator: a.narrator,
  grade: a.grade,
}));

const GRID_SECTIONS = [
  {
    id: 'sleep',
    emoji: '😴',
    title: 'أذكار النوم',
    color: '#8b5cf6',
    items: fmt(sleepAzkar),
  },
  {
    id: 'waking',
    emoji: '☀️',
    title: 'أذكار الاستيقاظ',
    color: '#f0b040',
    items: [
      {
        text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        count: 1, source: 'صحيح البخاري', ref: 'كتاب الدعوات، رقم 6314',
        isnad: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَلَا نَعْبُدُ إِلَّا إِيَّاهُ لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ لَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 6309 ومسلم 2697',
        isnad: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أنس بن مالك رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
        count: 4, source: 'سنن أبي داود والترمذي', ref: 'أبو داود 5089، والترمذي 3529. وصححه الألباني',
        isnad: 'عَنْ عَبْدِ الرَّحْمَنِ بْنِ أَبِي بَكْرٍ رَضِيَ اللَّهُ عَنْهُمَا', narrator: 'عبد الرحمن بن أبي بكر رضي الله عنهما', grade: 'صحيح',
      },
    ],
  },
  {
    id: 'before-prayer',
    emoji: '🕌',
    title: 'أذكار قبل الصلاة',
    color: '#00c896',
    items: [
      {
        text: 'اللَّهُمَّ ابْعَدْ عَنِّي الشَّيْطَانَ وَاقْرَبْنِي إِلَيْكَ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 142، ومسلم 376',
        narrator: 'عمر بن الخطاب رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'أَسْتَغْفِرُ اللَّهَ (3 مرات)',
        count: 3, source: 'صحيح مسلم', ref: 'كتاب الطهارة، رقم 223',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُ أَكْبَرُ (تكبير الافتتاح)',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 740، ومسلم 394',
        narrator: 'عثمان بن عفان رضي الله عنه', grade: 'صحيح',
      },
    ],
  },
  {
    id: 'after-prayer',
    emoji: '🤲',
    title: 'أذكار بعد الصلاة',
    color: '#3b82f6',
    items: [
      {
        text: 'أَسْتَغْفِرُ اللَّهَ (3 مرات)',
        count: 3, source: 'صحيح مسلم', ref: 'كتاب التوبة، رقم 2702',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        count: 1, source: 'صحيح مسلم', ref: 'كتاب السلام، رقم 591',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'سُبْحَانَ اللَّهِ (33) + الْحَمْدُ لِلَّهِ (33) + اللَّهُ أَكْبَرُ (33)',
        count: 1, source: 'صحيح مسلم', ref: 'كتاب صلاة المسافرين، رقم 596',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 844، ومسلم 595',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 844، ومسلم 595',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
        count: 1, source: 'سنن أبي داود والنسائي', ref: 'أبو داود 1522، والنسائي 1303. وصححه الألباني',
        narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
    ],
  },
  {
    id: 'istighfar',
    emoji: '🙏',
    title: 'الاستغفار والتوبة',
    color: '#06b6d4',
    items: fmt(istighfarAzkar),
  },
  {
    id: 'ruqyah',
    emoji: '📖',
    title: 'الرقية الشرعية',
    color: '#22c55e',
    items: fmt(ruqyahAzkar),
  },
  {
    id: 'adhan',
    emoji: '📢',
    title: 'أذكار الآذان',
    color: '#f97316',
    items: fmt(adhanAzkar),
  },
];

const FULL_WIDTH_SECTIONS = [
  {
    id: 'salawat',
    emoji: '💫',
    title: 'الصلاة على النبي ﷺ',
    color: '#d946ef',
    items: fmt(salawatAzkar),
  },
  {
    id: 'duas',
    emoji: '🤲',
    title: 'أدعية مسنونة',
    color: '#e879f9',
    items: [
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
        count: 1, source: 'صحيح مسلم', ref: 'كتاب الزهد والرقائق، رقم 1020',
        isnad: 'عَنْ عِمْرَانَ بْنِ حُصَيْنٍ رَضِيَ اللَّهُ عَنْهُ', narrator: 'عمان بن حصين رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 6325، ومسلم 2690',
        isnad: 'عَنْ أَبِي الدَّرْدَاءِ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أبو الداء رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي الدُّنْيَا الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
        count: 1, source: 'صحيح مسلم', ref: 'كتاب الصلاة، رقم 2708',
        isnad: 'عَنْ عُمَرَ رَضِيَ اللَّهُ عَنْهُ', narrator: 'عمر بن الخطاب رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
        count: 1, source: 'سنن أبي داود والترمذي', ref: 'أبو داود 5090، والترمذي 3529. وصححه الألباني',
        isnad: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ مُصَرِّفَ الْقُلُوبِ صَرِّفْ قُلُوبَنَا عَلَى طَاعَتِكَ',
        count: 1, source: 'صحيح مسلم', ref: 'كتاب الذكر والدعاء، رقم 2654',
        isnad: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أبو هريرة رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 6340، ومسلم 2697',
        isnad: 'عَنْ عُمَرَ رَضِيَ اللَّهُ عَنْهُ', narrator: 'عمر بن الخطاب رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لَا إِلَهَ إِلَّا أَنْتَ الْمَنَّانُ بَدِيعُ السَّمَوَاتِ وَالْأَرْضِ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        count: 1, source: 'سنن أبي داود والترمذي', ref: 'أبو داود 1494، والترمذي 463. وصححه الألباني',
        isnad: 'عَنْ أَبِي بَكْرٍ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أبو بكر الصديق رضي الله عنه', grade: 'صحيح',
      },
      {
        text: 'اللَّهُمَّ رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
        count: 1, source: 'صحيح البخاري', ref: 'كتاب الدعوات، رقم 6331',
        isnad: 'عَنْ إِبْرَاهِيمَ النَّبِيِّ ﷺ وَبِنِيهِ إِسْمَاعِيلَ وَإِسْحَقَ رُسُلِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِمْ', narrator: 'إبراهيم الخليل عليه السلام', grade: 'صحيح',
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ لَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ',
        count: 1, source: 'صحيح البخاري ومسلم', ref: 'البخاري 6309، ومسلم 2697',
        isnad: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ', narrator: 'أنس بن مالك رضي الله عنه', grade: 'صحيح',
      },
    ],
  },
];

const INFO_CARDS = [
  {
    id: 'friday',
    emoji: '📅',
    title: 'سنن الجمعة',
    color: '#ec4899',
    items: [
      {
        text: 'الاغتسال يوم الجمعة',
        source: 'صحيح البخاري ومسلم',
        ref: 'البخاري 877، ومسلم 846',
        isnad: 'عن أبي هريرة رضي الله عنه',
        grade: 'صحيح',
      },
      {
        text: 'لبس أحسن الثياب والتطيب',
        source: 'صحيح البخاري ومسلم',
        ref: 'البخاري 877، ومسلم 846',
        grade: 'صحيح',
      },
      {
        text: 'قراءة سورة الكهف',
        source: 'صحيح البخاري',
        ref: 'كتاب بدء الخلق، رقم 818',
        isnad: 'عن أبي سعيد الخدري رضي الله عنه',
        grade: 'صحيح',
      },
      {
        text: 'الكثير من الصلاة على النبي ﷺ',
        source: 'صحيح مسلم',
        ref: 'كتاب الصلاة على النبي ﷺ، رقم 384',
        grade: 'صحيح',
      },
    ],
  },
  {
    id: 'duha',
    emoji: '🌅',
    title: 'صلاة الضحي',
    color: '#f0b040',
    items: [
      {
        text: 'ركعتين فأربعا من شروق الشمس حتى قبل العصر',
        source: 'صحيح البخاري ومسلم',
        ref: 'البخاري 1178، ومسلم 720',
        grade: 'صحيح',
      },
      {
        text: 'صَلَاةُ الْأَضْحَى فِي الْبَيْتِ لَهَا أَجْرُ الْحَجِّ وَالْعُمْرَةِ',
        source: 'سنن أبي داود والترمذي',
        ref: 'أبو داود 1286، والترمذي 475. وصححه الألباني',
        isnad: 'عن أبي ذر جندب بن جنادة رضي الله عنه',
        narrator: 'أبو ذر رضي الله عنه',
        grade: 'صحيح',
      },
    ],
  },
  {
    id: 'prohibition',
    emoji: '⛔',
    title: 'أوقات النهي',
    color: '#ef4444',
    items: [
      {
        text: 'لا تُصلَّى صلاة بعد الفجر حتى تطلع الشمس',
        source: 'صحيح البخاري ومسلم',
        ref: 'البخاري 528، ومسلم 826',
        isnad: 'عن أبي هريرة رضي الله عنه',
        grade: 'صحيح',
      },
      {
        text: 'لا تُصلَّى صلاة بعد العصر حتى تغرب الشمس',
        source: 'صحيح البخاري ومسلم',
        ref: 'البخاري 528، ومسلم 827',
        isnad: 'عن أبي بزرة الأسلمي رضي الله عنه',
        grade: 'صحيح',
      },
      {
        text: 'لا تُقْبَلُ صلاة بغير طهور ولا تُشْرَكُ فيها صدقة',
        source: 'صحيح مسلم',
        ref: 'كتاب الطهارة، رقم 224',
        grade: 'صحيح',
      },
    ],
  },
];

const sourceStyle = { fontSize: 10, color: '#f0b040', fontWeight: 700, marginTop: 6 };
const isnadStyle = { fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 3, fontStyle: 'italic' };
const refStyle = { fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2, lineHeight: 1.6 };

function AzkarSubSection({ items, sectionColor }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(() => items.map(() => 0));
  const [speaking, setSpeaking] = useState(null);

  const handleTap = (idx) => {
    if (progress[idx] >= items[idx].count) return;
    const newProg = [...progress];
    newProg[idx]++;
    setProgress(newProg);
    setSpeaking(idx);
    speakArabic(items[idx].text, () => setSpeaking(null));
  };

  const handleSpeakAll = () => {
    const allText = items.map(i => i.text).join('. ');
    setSpeaking('all');
    speakArabic(allText, () => setSpeaking(null));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={() => { stopSpeaking(); setSpeaking(null); }} style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>⏹️ {t.azkarSection.stop}</button>
        <button onClick={handleSpeakAll} style={{ padding: '4px 10px', borderRadius: 8, background: `${sectionColor}15`, border: `1px solid ${sectionColor}30`, color: sectionColor, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>🔊 {t.azkarSection.listenAll}</button>
      </div>
      {items.map((item, idx) => {
        const done = progress[idx] >= item.count;
        return (
          <div key={idx} onClick={() => handleTap(idx)}
            style={{
              background: done ? `${sectionColor}08` : 'rgba(255,255,255,.03)',
              border: `1px solid ${done ? sectionColor + '30' : 'rgba(255,255,255,.06)'}`,
              borderRadius: 12, padding: '10px 12px', cursor: 'pointer', transition: 'all .2s',
            }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', fontWeight: 600 }}>
              {item.text}
            </div>
            {item.source && <div style={sourceStyle}>📖 {item.source}</div>}
            {item.isnad && <div style={isnadStyle}>{item.isnad}</div>}
            {item.narrator && <div style={isnadStyle}>{t.azkarSection.narrator}: {item.narrator}</div>}
            {item.ref && <div style={refStyle}>{item.ref}</div>}
            {item.grade && (
              <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,200,150,.1)', color: '#00c896', marginTop: 4, border: '1px solid rgba(0,200,150,.2)' }}>
                {item.grade}
              </span>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <div style={{ fontSize: 10, color: done ? sectionColor : 'rgba(255,255,255,.3)', fontWeight: 700 }}>
                {done ? `✅ ${t.azkarSection.completed}` : `${progress[idx]}/${item.count}`}
              </div>
              <div style={{ height: 3, flex: 1, margin: '0 8px', background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(progress[idx] / item.count) * 100}%`, background: sectionColor, borderRadius: 3, transition: 'width .3s' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AzkarSection() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(null);

  const ALL_SECTIONS = [...GRID_SECTIONS, ...FULL_WIDTH_SECTIONS];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, padding: '0 2px' }}>
        {t.azkarSection.sectionHeader}
      </div>

      {ALL_SECTIONS.map((section) => (
        <div key={section.id} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
            style={{
              background: expanded === section.id ? `${section.color}15` : '#151030',
              border: `1px solid ${expanded === section.id ? section.color + '40' : 'rgba(255,255,255,.05)'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: 18 }}>{section.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: expanded === section.id ? section.color : 'rgba(255,255,255,.6)' }}>{section.title}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginRight: 'auto' }}>{section.items.length} {t.azkarSection.dhikrCount}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', transform: expanded === section.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>▼</span>
          </div>

          <AnimatePresence>
            {expanded === section.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#151030', border: `1px solid ${section.color}20`, borderRadius: 16, padding: 14, marginTop: 6 }}>
                  <AzkarSubSection items={section.items} sectionColor={section.color} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 12, padding: '0 2px' }}>
        {t.azkarSection.infoHeader}
      </div>

      {INFO_CARDS.map((c) => (
        <div key={c.id} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setExpanded(expanded === `info-${c.id}` ? null : `info-${c.id}`)}
            style={{
              background: expanded === `info-${c.id}` ? `${c.color}15` : '#151030',
              border: `1px solid ${expanded === `info-${c.id}` ? c.color + '40' : 'rgba(255,255,255,.05)'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: 18 }}>{c.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: expanded === `info-${c.id}` ? c.color : 'rgba(255,255,255,.6)' }}>{c.title}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginRight: 'auto' }}>{c.items.length} {t.azkarSection.pointCount}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', transform: expanded === `info-${c.id}` ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>▼</span>
          </div>

          <AnimatePresence>
            {expanded === `info-${c.id}` && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#151030', border: `1px solid ${c.color}20`, borderRadius: 16, padding: 14, marginTop: 6 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.items.map((item, idx) => (
                      <div key={idx} style={{ padding: 10, background: 'rgba(255,255,255,.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,.05)' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', fontWeight: 600 }}>
                          {item.text}
                        </div>
                        {item.source && <div style={sourceStyle}>📖 {item.source}</div>}
                        {item.isnad && <div style={isnadStyle}>{item.isnad}</div>}
                        {item.narrator && <div style={isnadStyle}>{t.azkarSection.narrator}: {item.narrator}</div>}
                        {item.ref && <div style={refStyle}>{item.ref}</div>}
                        {item.grade && (
                          <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,200,150,.1)', color: '#00c896', marginTop: 4, border: '1px solid rgba(0,200,150,.2)' }}>
                            {item.grade}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
