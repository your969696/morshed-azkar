import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';

const SALAWAT = [
  {
    id: 'istikhara',
    emoji: '🤲',
    title: 'صلاة الاستخارة',
    color: '#8b5cf6',
    howTo: [
      'تتوضأ',
      'تصلّي ركعتين من غير الفريضة (سنة مؤكدة)',
      'بعد السلام، تدعو بدعاء الاستخارة',
    ],
    dua: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الشَّرُّ فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي',
    source: 'صحيح البخاري',
    isnad: 'عن جابر بن عبد الله رضي الله عنهما',
    narrator: 'جابر بن عبد الله رضي الله عنهما',
    ref: 'البخاري 1162',
    grade: 'صحيح',
  },
  {
    id: 'janazah',
    emoji: '⚰️',
    title: 'صلاة الجنازة',
    color: '#6b7280',
    howTo: [
      'تكبيرة الإحرام + قراءة الفاتحة',
      'التكبيرة الثانية + الصلاة على النبي ﷺ',
      'التكبيرة الثالثة + الدعاء للميت',
      'التكبيرة الرابعة + دعاء عام للمسلمين',
      'ثم التسليم مرة واحدة',
    ],
    note: 'بلا ركوع ولا سجود — أربع تكبيرات فقط',
    source: 'صحيح البخاري ومسلم',
    isnad: 'عن أبي هريرة رضي الله عنه',
    narrator: 'أبو هريرة رضي الله عنه',
    ref: 'البخاري 1293، ومسلم 959',
    grade: 'صحيح',
  },
  {
    id: 'eid',
    emoji: '🎉',
    title: 'صلاة العيد',
    color: '#00c896',
    howTo: [
      'ركعتان',
      'الركعة الأولى: تكبير الإحرام + 7 تكبيرات + قراءة الفاتحة وسورة',
      'الركعة الثانية: تكبير القيام + 5 تكبيرات + قراءة الفاتحة وسورة',
      'ثم الخطبة بعد الصلاة',
    ],
    source: 'سنن أبي داود والترمذي',
    isnad: 'عن عائشة رضي الله عنها',
    narrator: 'عائشة رضي الله عنها',
    ref: 'أبو داود 1153، والترمذي 357. وصححه الألباني',
    grade: 'صحيح',
  },
  {
    id: 'hajah',
    emoji: '💡',
    title: 'صلاة الحاجة',
    color: '#f0b040',
    howTo: [
      'تتوضأ',
      'تصلّي ركعتين (غير الفريضة)',
      'ثم تدعاء بالدعاء الوارد',
    ],
    dua: 'لَا إِلَهَ إِلَّا اللَّهُ الْحَلِيمُ الْكَرِيمُ، سُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ الْعَظِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ لَا تَدَعْ لَنَا ذَنْبًا إِلَّا غَفَرْتَهُ وَلَا هَمًّا إِلَّا فَرَّجْتَهُ وَلَا حَاجَةً هِيَ لَكَ رِضًا إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ',
    source: 'سنن أبي داود والترمذي',
    isnad: 'عن عبد الله بن زيد رضي الله عنه',
    narrator: 'عبد الله بن زيد رضي الله عنه',
    ref: 'أبو داود 1525، والترمذي 479',
    grade: 'حسن',
  },
  {
    id: 'tawbah',
    emoji: '💝',
    title: 'صلاة التوبة',
    color: '#ec4899',
    howTo: [
      'تتوضأ',
      'تصلّي ركعتين بنية التوبة',
      'تستغفر بعدها (70) مرة',
    ],
    source: 'سنن أبي داود',
    isnad: 'عن عبد الله بن عمر رضي الله عنهما',
    narrator: 'عبد الله بن عمر رضي الله عنهما',
    ref: 'أبو داود 1521. وصححه الألباني',
    grade: 'صحيح',
  },
  {
    id: 'duha',
    emoji: '🌅',
    title: 'صلاة الضحى',
    color: '#f0b040',
    howTo: [
      'من ارتفاع الشمس قدر رمح (بعد الشروق بحوالي 15 دقيقة)',
      'وينتهي عند وقوف الشمس قبل الزوال (قبل دخول وقت الظهر)',
      'ركعتان فأربعا حتى ثمانيًا',
    ],
    hadith: [
      'أَوْصَانِي خَلِيلِي بِثَلَاثٍ: صِيَامِ ثَلَاثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ، وَرَكْعَتَيِ الضُّحَى، وَأَنْ أُوتِرَ قَبْلَ أَنْ أَنَامَ.',
      'يُصْبِحُ عَلَى كُلِّ سَلامَى مِنْ أَحَدِكُمْ صَدَقَةٌ، وَيُجْزِئُ مِنْ ذَلِكَ رَكْعَتَانِ يَرْكَعُهُمَا مِنَ الضُّحَى.',
      'كَانَ رَسُولُ اللَّهِ ﷺ يُصَلِّي الضُّحَى أَرْبَعًا وَيَزِيدُ مَا شَاءَ اللَّهُ.',
      'صَلَاةُ الأَوَّابِينَ حِينَ تَرْمَضُ الْفِصَالُ.',
      'دَخَلَ عَلَيَّ رَسُولُ اللَّهِ ﷺ يَوْمَ فَتْحِ مَكَّةَ فَاغْتَسَلَ ثُمَّ صَلَّى ثَمَانَ رَكَعَاتٍ.',
    ],
    source: 'صحيح البخاري ومسلم',
    isnad: 'حديث أبي هريرة وأبي ذر وعائشة وزيد بن أرقم وأم هانئ رضي الله عنهم',
    narrator: 'أبو هريرة وأبو ذر وعائشة وزيد بن أرقم وأم هانئ رضي الله عنهم',
    ref: 'البخاري 1178، ومسلم 720 و719 و748 و336، والبخاري 1176',
    grade: 'صحيح متفق عليه',
  },
  {
    id: 'witr',
    emoji: '🌙',
    title: 'صلاة الوتر',
    color: '#3b82f6',
    howTo: [
      'ركعة واحدة، أو ثلاث، أو خمس، أو سبع',
      'الأفضل: ركعة واحدة بعد قيام الليل',
      'يقرأ فيها الفاتحة وسورة',
      'يقول في آخرها: سُبْحَانَ الْمَلِكِ الْقُدُّوسِ (3 مرات)',
    ],
    source: 'سنن أبي داود',
    isnad: 'عن عبد الله بن عمرو بن العاص رضي الله عنهما',
    narrator: 'عبد الله بن عمرو بن العاص رضي الله عنهما',
    ref: 'أبو داود 1416. وصححه الألباني',
    grade: 'صحيح',
  },
];

const DUAS = [
  {
    id: 'travel',
    emoji: '✈️',
    title: 'دعاء السفر',
    dua: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ وَكَآبَةِ الْمَنْظَرِ وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ',
    source: 'صحيح مسلم', isnad: 'عن جابر بن عبد الله رضي الله عنهما', narrator: 'جابر بن عبد الله رضي الله عنهما', ref: 'مسلم 1342', grade: 'صحيح',
  },
  {
    id: 'riding',
    emoji: '🐪',
    title: 'دعاء الركوب',
    dua: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
    source: 'صحيح مسلم', isnad: 'عن ابن عباس رضي الله عنهما', narrator: 'ابن عباس رضي الله عنهما', ref: 'مسلم 1342', grade: 'صحيح',
  },
  {
    id: 'enter-home',
    emoji: '🏠',
    title: 'دعاء دخول المنزل',
    dua: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    source: 'سنن أبي داود والترمذي', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'أبو داود 5095، والترمذي 335. وصححه الألباني', grade: 'صحيح',
  },
  {
    id: 'leave-home',
    emoji: '🚪',
    title: 'دعاء الخروج من المنزل',
    dua: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    source: 'سنن أبي داود والترمذي', isnad: 'عن أم سلمة رضي الله عنها', narrator: 'أم سلمة رضي الله عنها', ref: 'أبو داود 5095، والترمذي 335. وصححه الألباني', grade: 'صحيح',
  },
  {
    id: 'enter-mosque',
    emoji: '🕌',
    title: 'دعاء دخول المسجد',
    dua: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    source: 'صحيح مسلم', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'مسلم 713', grade: 'صحيح',
  },
  {
    id: 'leave-mosque',
    emoji: '🚶',
    title: 'دعاء الخروج من المسجد',
    dua: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    source: 'صحيح مسلم', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'مسلم 713', grade: 'صحيح',
  },
  {
    id: 'food',
    emoji: '🍽️',
    title: 'دعاء الطعام',
    dua_before: 'بِسْمِ اللَّهِ',
    dua_after: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    source: 'سنن أبي داود والترمذي', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'أبو داود 3850، والترمذي 3457. وصححه الألباني', grade: 'صحيح',
  },
  {
    id: 'sleep',
    emoji: '😴',
    title: 'دعاء النوم',
    dua: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'صحيح البخاري', isnad: 'عن عائشة رضي الله عنها', narrator: 'عائشة رضي الله عنها', ref: 'البخاري 6324', grade: 'صحيح',
  },
  {
    id: 'waking',
    emoji: '☀️',
    title: 'دعاء الاستيقاظ',
    dua: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    source: 'صحيح البخاري', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'البخاري 6314', grade: 'صحيح',
  },
  {
    id: 'toilet',
    emoji: '🚻',
    title: 'دعاء دخول الخلاء',
    dua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    source: 'صحيح البخاري ومسلم', isnad: 'عن أنس بن مالك رضي الله عنه', narrator: 'أنس بن مالك رضي الله عنه', ref: 'البخاري 144، ومسلم 375', grade: 'صحيح',
  },
  {
    id: 'leave-toilet',
    emoji: '🤲',
    title: 'دعاء الخروج من الخلاء',
    dua: 'غُفْرَانَكَ',
    source: 'سنن أبي داود والترمذي', isnad: 'عن جابر بن عبد الله رضي الله عنهما', narrator: 'جابر بن عبد الله رضي الله عنهما', ref: 'أبو داود 34، والترمذي 34. وصححه الألباني', grade: 'صحيح',
  },
  {
    id: 'distress',
    emoji: '😢',
    title: 'دعاء الهم والحزن',
    dua: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، مَا أَنِي لَكَ بِحَاجَةِكَ، وَلَا غَنِيِّي عَنْ رَحْمَتِكَ، وَلَكِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ، إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ',
    source: 'صحيح البخاري', isnad: 'عن عبد الله بن عمر رضي الله عنهما', narrator: 'عبد الله بن عمر رضي الله عنهما', ref: 'البخاري 6346', grade: 'صحيح',
  },
  {
    id: 'korb',
    emoji: '🆘',
    title: 'دعاء الكرب',
    dua: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    source: 'سنن أبي داود', isnad: 'عن عبد الله بن قيس رضي الله عنه', narrator: 'عبد الله بن قيس رضي الله عنه', ref: 'أبو داود 1525', grade: 'صحيح',
  },
  {
    id: 'healing',
    emoji: '💊',
    title: 'دعاء الشفاء',
    dua: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِ وَأَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
    source: 'صحيح البخاري ومسلم', isnad: 'عن أبي هريرة رضي الله عنه', narrator: 'أبو هريرة رضي الله عنه', ref: 'البخاري 5352، ومسلم 2191', grade: 'صحيح',
  },
  {
    id: 'rain',
    emoji: '🌧️',
    title: 'دعاء المطر',
    dua: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    source: 'صحيح البخاري', isnad: 'عن زيد بن خالد رضي الله عنه', narrator: 'زيد بن خالد رضي الله عنه', ref: 'البخاري 1014', grade: 'صحيح',
  },
  {
    id: 'hilaal',
    emoji: '🌙',
    title: 'دعاء رؤية الهلال',
    dua: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ',
    source: 'سنن أبي داود والترمذي', isnad: 'عن عبد الله بن عمر رضي الله عنهما', narrator: 'عبد الله بن عمر رضي الله عنهما', ref: 'أبو داود 4993، والترمذي 3451. وصححه الألباني', grade: 'صحيح',
  },
];

const sourceStyle = { fontSize: 10, color: '#f0b040', fontWeight: 700, marginTop: 6 };
const isnadStyle = { fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 3, fontStyle: 'italic' };
const refStyle = { fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2, lineHeight: 1.6 };

export default function SalawatWaAdiaa() {
  const [expanded, setExpanded] = useState(null);
  const { t } = useTranslation();

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, padding: '0 2px' }}>
        {t.salawatPage?.title || 'الصلوات والأدعية'}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.2)', marginBottom: 8, padding: '0 2px' }}>
        {t.salawatPage?.prayers || '🕌 الصلوات'}
      </div>

      {SALAWAT.map((prayer) => (
        <div key={prayer.id} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setExpanded(expanded === prayer.id ? null : prayer.id)}
            style={{
              background: expanded === prayer.id ? `${prayer.color}15` : '#151030',
              border: `1px solid ${expanded === prayer.id ? prayer.color + '40' : 'rgba(255,255,255,.05)'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: 18 }}>{prayer.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: expanded === prayer.id ? prayer.color : 'rgba(255,255,255,.6)' }}>{prayer.title}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: prayer.grade === 'صحيح' ? 'rgba(0,200,150,.1)' : 'rgba(240,176,64,.1)', color: prayer.grade === 'صحيح' ? '#00c896' : '#f0b040', marginRight: 'auto' }}>{prayer.grade}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', transform: expanded === prayer.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>▼</span>
          </div>

          <AnimatePresence>
            {expanded === prayer.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#151030', border: `1px solid ${prayer.color}20`, borderRadius: 16, padding: 14, marginTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{t.salawatPage?.howTo || 'كيف تُصلّى:'}</div>
                  {prayer.howTo.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: prayer.color, minWidth: 16, textAlign: 'center', background: `${prayer.color}15`, borderRadius: 4, padding: '1px 4px' }}>{i + 1}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                  {prayer.note && <div style={{ fontSize: 11, color: '#f0b040', marginTop: 6, padding: '6px 8px', background: 'rgba(240,176,64,.06)', borderRadius: 8, border: '1px solid rgba(240,176,64,.15)' }}>⚠️ {prayer.note}</div>}
                  {prayer.dua && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{t.salawatPage?.dua || 'الدعاء:'}</div>
                      <div onClick={(e) => { e.stopPropagation(); speakArabic(prayer.dua); }} style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', padding: 10, background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)', cursor: 'pointer' }}>
                        {prayer.dua}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,.05)' }}>
                    <div style={sourceStyle}>📖 {prayer.source}</div>
                    {prayer.isnad && <div style={isnadStyle}>{prayer.isnad}</div>}
                    {prayer.narrator && <div style={isnadStyle}>{t.salawatPage?.narrator || 'الراوي:'} {prayer.narrator}</div>}
                    <div style={refStyle}>{prayer.ref}</div>
                  </div>
                  {prayer.hadith && Array.isArray(prayer.hadith) && (
                    <div style={{ marginTop: 10, padding: 10, background: 'rgba(139,92,246,.05)', borderRadius: 10, border: '1px solid rgba(139,92,246,.15)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>{t.salawatPage?.hadiths || 'الأحاديث النبوية:'}</div>
                      {prayer.hadith.map((h, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', marginBottom: i < prayer.hadith.length - 1 ? 8 : 0, padding: '6px 8px', background: 'rgba(255,255,255,.02)', borderRadius: 8, borderRight: '2px solid rgba(139,92,246,.3)' }}>
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.2)', marginTop: 16, marginBottom: 8, padding: '0 2px' }}>
        {t.salawatPage?.supplications || '🤲 الأدعية'}
      </div>

      {DUAS.map((dua) => (
        <div key={dua.id} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setExpanded(expanded === dua.id ? null : dua.id)}
            style={{
              background: expanded === dua.id ? 'rgba(0,200,150,.1)' : '#151030',
              border: `1px solid ${expanded === dua.id ? 'rgba(0,200,150,.3)' : 'rgba(255,255,255,.05)'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: 18 }}>{dua.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: expanded === dua.id ? '#00c896' : 'rgba(255,255,255,.6)' }}>{dua.title}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,200,150,.1)', color: '#00c896', marginRight: 'auto' }}>{dua.grade}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', transform: expanded === dua.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>▼</span>
          </div>

          <AnimatePresence>
            {expanded === dua.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#151030', border: '1px solid rgba(0,200,150,.15)', borderRadius: 16, padding: 14, marginTop: 6 }}>
                  {dua.dua_before && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{t.salawatPage?.beforeEating || 'قبل الأكل:'}</div>
                      <div onClick={(e) => { e.stopPropagation(); speakArabic(dua.dua_before); }} style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', cursor: 'pointer' }}>
                        {dua.dua_before}
                      </div>
                    </div>
                  )}
                  {dua.dua_after && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{t.salawatPage?.afterEating || 'بعد الأكل:'}</div>
                      <div onClick={(e) => { e.stopPropagation(); speakArabic(dua.dua_after); }} style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', cursor: 'pointer' }}>
                        {dua.dua_after}
                      </div>
                    </div>
                  )}
                  {!dua.dua_before && !dua.dua_after && (
                    <div onClick={(e) => { e.stopPropagation(); speakArabic(dua.dua); }} style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontFamily: 'var(--font-naskh)', fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>
                      {dua.dua}
                    </div>
                  )}
                  <div style={{ padding: 10, background: 'rgba(255,255,255,.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,.05)' }}>
                    <div style={sourceStyle}>📖 {dua.source}</div>
                    {dua.isnad && <div style={isnadStyle}>{dua.isnad}</div>}
                    {dua.narrator && <div style={isnadStyle}>{t.salawatPage?.narrator || 'الراوي:'} {dua.narrator}</div>}
                    <div style={refStyle}>{dua.ref}</div>
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
