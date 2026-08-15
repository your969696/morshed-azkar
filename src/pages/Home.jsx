import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { speakArabic, stopSpeaking, playTakbeer, stopTakbeer, isTakbeerPlaying } from '../utils/sound';
import { getPrayerTimesSync, PRAYER_KEYS, PRAYER_KEYS_ONLY, PRAYER_NAMES_AR, formatTime12h, calcFastingInfo, isRamadan, isEid, getDaysUntilRamadan, parseTime, isInProhibitionTime, getCurrentProhibitionPeriod } from '../utils/prayer-times';
import { quizQuestions } from '../data/quiz-questions';
import { getUpcomingIslamicDays } from '../data/islamic-days';
import AzkarSection from '../components/AzkarSection';
import SalawatWaAdiaa from '../components/SalawatWaAdiaa';
import AzkarAudioPlayer from '../components/AzkarAudioPlayer';
import PrayerCalendar from '../components/PrayerCalendar';
import IslamicHolidays from '../components/IslamicHolidays';
import QuranPlayer from '../components/QuranPlayer';
import { Icons } from '../components/HomeIcons';
import FastingBar from '../components/FastingBar';
import PrayerTimesBar from '../components/PrayerTimesBar';

const SECTIONS = [
  { path: '/morning', icon: Icons.morningAdhkar, titleAr: 'أذكار الصباح', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', category: 'prayer', badge: null },
  { path: '/evening', icon: Icons.eveningAdhkar, titleAr: 'أذكار المساء', color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)', category: 'prayer', badge: null },
  { path: '/quran', icon: Icons.quran, titleAr: 'القرآن الكريم', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'quran', badge: 'محدث' },
  { path: '/prayer', icon: Icons.prayerTimes, titleAr: 'أوقات الصلاة', color: '#F0B040', bg: 'rgba(240,176,64,0.06)', category: 'prayer', badge: null },
  { path: '/tasbih', icon: Icons.tasbih, titleAr: 'التسبيح', color: '#E8A0FF', bg: 'rgba(232,160,255,0.06)', category: 'quran', badge: null },
  { path: '/qibla', icon: Icons.qibla, titleAr: 'اتجاه القبلة', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'prayer', badge: null },
  { path: '/quiz', icon: Icons.quiz, titleAr: 'اختبر نفسك', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', category: 'quran', badge: 'جديد' },
  { path: '/hajj', icon: Icons.hajj, titleAr: 'الحج والعمرة', color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)', category: 'more', badge: null },
  { path: '/prophets', icon: Icons.stories, titleAr: 'قصص الرسل', color: '#60A5FA', bg: 'rgba(96,165,250,0.06)', category: 'quran', badge: null },
  { path: '/hijri-age', icon: Icons.hijriCal, titleAr: 'العمر الهجري', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'more', badge: null },
  { path: '/voice-recordings', icon: Icons.audio, titleAr: 'التسجيلات الصوتية', color: '#FF6B8A', bg: 'rgba(255,107,138,0.06)', category: 'more', badge: null },
  { path: '/adhan-test', icon: Icons.adhan, titleAr: 'تجربة الأذان', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', category: 'prayer', badge: null },
  { path: '/salah-guide', icon: Icons.prayGuide, titleAr: 'كيف تصلي', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'prayer', badge: null },
  { path: '/reminders', icon: Icons.notifications, titleAr: 'التنبيهات', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', category: 'more', badge: null },
  { path: '/didnt-find-answer', icon: Icons.faq, titleAr: 'لم أجد إجابة', color: '#C8A2FF', bg: 'rgba(200,162,255,0.06)', category: 'more', badge: null },
  { path: '/halal', icon: Icons.halalFood, titleAr: 'المطاعم الحلال', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'halal', badge: null },
  { path: '/halal-products', icon: Icons.scanner, titleAr: 'حلال سكانر', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'halal', badge: 'مميز' },
  { path: '/kindred', icon: Icons.kindred, titleAr: 'صلة الرحم', color: '#00C896', bg: 'rgba(0,200,150,0.06)', category: 'more', badge: 'جديد' },
];

const QUICK_AZKAR = [
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', total: 100 },
  { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', total: 100 },
  { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', total: 10 },
];

const HADITHS = [
  { text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', source: 'متفق عليه' },
  { text: 'المسلم من سلم المسلمون من لسانه ويده', source: 'البخاري ومسلم' },
  { text: 'أحب الأعمال إلى الله أداومها وإن قلّ', source: 'البخاري ومسلم' },
  { text: 'من لم تنهه صلاته عن الفحشاء والمنكر فلا صلاة له', source: 'البخاري' },
  { text: 'إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: من صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له', source: 'مسلم' },
  { text: 'اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن', source: 'الترمذي' },
  { text: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى', source: 'البخاري ومسلم' },
  { text: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت', source: 'البخاري ومسلم' },
  { text: 'المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً', source: 'البخاري ومسلم' },
  { text: 'خيركم من تعلم القرآن وعلمه', source: 'البخاري' },
  { text: 'اطلبوا العلم ولو في الصين', source: 'ابن ماجه' },
  { text: 'أكمل المؤمنين إيماناً أحسنهم خُلُقاً', source: 'أبو داود' },
  { text: 'لا ضرر ولا ضرار', source: 'ابن ماجه' },
  { text: 'الدين النصيحة. قلنا: لمن؟ قال: لله ولكتابه ولرسوله ولأئمة المسلمين وعامتهم', source: 'مسلم' },
  { text: 'لا يشبع المؤمن من الخير حتى يكون ترابه', source: 'الترمذي' },
];

const PROHIBITION_HADITHS = [
  { text: 'ثلاث لا تُرتفع ولا تُرفع: الصلاة على وقتها، وبر الوالدين، وصلة الرحم', source: 'أبو داود والترمذي', ref: 'سنن أبي داود 4866' },
  { text: 'أفضل الصلاة المكتوبة صلاة في وقتها إلا صلاة الفجر إلا صلاة الفجر', source: 'البخاري ومسلم', ref: 'صحيح البخاري 527' },
  { text: 'لا تُصلَّى صلاة بعد الفجر إلا صلاة مكتوبة، حتى تطلع الشمس، ثم ترتفع قليلاً، ثم تصلي ركعتين، ثم لا تكون لك صلاة حتى ترتفع الشمس', source: 'البخاري ومسلم', ref: 'صحيح البخاري 528' },
  { text: 'لا تُصلَّى صلاة بعد العصر إلا صلاة مكتوبة، ثم لا تكون لك صلاة حتى تغرب الشمس', source: 'البخاري ومسلم', ref: 'صحيح البخاري 528' },
  { text: 'إذا أقيمت الصلاة فلا صلاة إلا المكتوبة', source: 'البخاري ومسلم', ref: 'صحيح البخاري 657' },
  { text: 'إذا نويتم الصلاة فأتموها، ثم أقيمت الصلاة فلا صلاة إلا المكتوبة', source: 'أبو داود والترمذي', ref: 'سنن أبي داود 1155' },
  { text: 'أفضل الأعمال إلى الله أدومها وإن قلّ', source: 'البخاري ومسلم', ref: 'صحيح البخاري 6464' },
  { text: 'الصلاة نور، والصدقة برهان، والصبر ضياء', source: 'الترمذي', ref: 'سنن الترمذي 2557' },
];

const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const GREG_MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function hijriToGregorian(hYear, hMonth, hDay) {
  try {
    const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const lr = l - Math.floor((146097 * n + 3) / 4);
    const y = Math.floor((4000 * (lr + 1)) / 1461001);
    const lr2 = lr - Math.floor((1461 * y) / 4) + 31;
    const m = Math.floor((80 * lr2) / 2447);
    const d = lr2 - Math.floor((2447 * m) / 80);
    const lr3 = Math.floor(m / 11);
    const gMonth = m + 2 - 12 * lr3;
    const gYear = y - 4716 + Math.floor((4 + n) / 1461) - Math.floor((1 + lr3) / 11);
    return { year: gYear, month: gMonth, day: d };
  } catch {
    return null;
  }
}

const WISDOMS = [
  { text: 'العلم نور، والجهل ظلام، فالطالب النور حديثه كما كان', source: 'الإمام الشافعي' },
  { text: 'من عرف نفسه فقد عرف ربه', source: 'حكمة عربية' },
];

const DAILY_QUESTIONS = [
  { q: 'لماذا يوجد الكون بدلًا من أن لا يوجد شيء؟', a: 'لأن الوجود يحتاج سببًا أوليًا، والعدم لا يخلق وجودًا.' },
  { q: 'من وضع قوانين الفيزياء الدقيقة؟', a: 'وجود قوانين ثابتة يدل على واضع حكيم لا يخطئ.' },
  { q: 'لماذا الكون قابل للفهم؟', a: 'لأن العقل صُمّم ليتوافق مع نظام خلقه خالق واحد.' },
  { q: 'لماذا كل شيء في الكون يعمل وفق نظام؟', a: 'النظام يدل على قصد، والقصد يدل على فاعل.' },
  { q: 'كيف نشأت الطاقة الأولى؟', a: 'الطاقة لا تُخلق من العدم إلا بفاعل قادر.' },
  { q: 'من صمّم الذرة بهذا التعقيد؟', a: 'التعقيد المنظم لا يأتي من فوضى.' },
  { q: 'لماذا الكون قابل للحياة؟', a: 'لأن الخالق أراد وجود حياة.' },
  { q: 'من جعل الماء أساس الحياة؟', a: 'اختيار عنصر واحد يناسب كل الكائنات يدل على حكمة.' },
  { q: 'لماذا تبدأ الحياة من خلية واحدة؟', a: 'لأن الخالق جعل البداية بسيطة لتنتج تعقيدًا.' },
  { q: 'من جعل القلب ينبض؟', a: 'النبض ليس صدفة، بل نظام حياة.' },
  { q: 'لماذا نحتاج النوم؟', a: 'لأن الخالق جعل الراحة جزءًا من الحياة.' },
  { q: 'لماذا يوجد الخير؟', a: 'لأنه انعكاس لرحمة الخالق.' },
  { q: 'لماذا يوجد الشر؟', a: 'ليُختبر الإنسان ويُظهر اختياره.' },
  { q: 'من جعل الضمير؟', a: 'الضمير صوت الفطرة.' },
  { q: 'لماذا لدينا وعي؟', a: 'الوعي لا ينشأ من مادة بلا قصد.' },
  { q: 'من أعطى العقل القدرة على التفكير؟', a: 'التفكير هبة إلهية.' },
  { q: 'لماذا نطرح أسئلة عن الوجود؟', a: 'لأن الروح تبحث عن خالقها.' },
  { q: 'لماذا تختلف الكائنات رغم أنها تتغذى من نفس الشمس؟', a: 'لأن الخالق أعطى كل كائن وظيفة مختلفة.' },
  { q: 'من جعل الطيور تطير؟', a: 'الطيران تصميم لا يحدث صدفة.' },
  { q: 'لماذا يدعو الإسلام للمساواة بين الألوان؟', a: 'لأن اللون ليس معيارًا للقيمة، فالله خلق البشر من نفس الأصل.' },
  { q: 'لماذا أعطى الله الإنسان القدرة على اختيار الخير والشر؟', a: 'لأن الاختيار هو جوهر التكليف، وميزان الحساب.' },
  { q: 'لماذا يطلب القرآن من الإنسان أن يعمل، رغم أن النتائج بيد الله؟', a: 'لأن العمل هو امتحان الإرادة، والنتيجة امتحان الإيمان.' },
  { q: 'لماذا جعل الله الدنيا دار أسباب؟', a: 'ليُختبر الإنسان في السعي، وفي الصبر، وفي التوكل.' },
  { q: 'لماذا لا تعمل الأسباب الظاهرة إلا بإذن الله؟', a: 'لأن الله هو الذي يربط السبب بالنتيجة.' },
  { q: 'إذا وجدت منزلًا قائمًا في صحراء خالية، لماذا يولد السؤال: من بناه؟', a: 'لأن العقل لا يقبل أن يكون النظام ابن الصدفة.' },
  { q: 'لماذا يشبه الكون هذا المنزل في الصحراء؟', a: 'لأن الكون مهيّأ قبل وجود الإنسان، بكل ما يحتاجه ليعيش ويتفكر.' },
  { q: 'هل يمكن أن تكون حياتك مجرد دورة بيولوجية؟', a: 'الإنجاز ليس وظيفة الجسد، بل وظيفة الروح التي خُلقت لتتجاوز حدود المادة.' },
  { q: 'لماذا وُضعت بين يديك قدرات لا يمتلكها أي مخلوق آخر؟', a: 'لأنك لست مجرد كائن حي… أنت كائن مُكلّف.' },
  { q: 'إذا كان الليل والنهار يتعاقبان بدقة لا تخطئ، فهل يعقل أن يكون هذا التوازن بلا صانع؟', a: 'الليل ليس صدفة، والنهار ليس صدفة… كلاهما جزء من هندسة كونية مقصودة.' },
  { q: 'لماذا خُلقت الأشياء على زوجين: خير وشر، قوة وضعف، نور وظلام؟', a: 'لأن الروح لا تُختبر إلا حين تختار بينهما.' },
];

const RADIO_URL = 'https://qurango.net/radio/mix';

const OCCASIONS_DETAILS = {
  1: { virtue: 'بداية عام هجري جديد — معاني الهجرة', source: 'اعتمدت الهجرة بداية للتقويم في عهد عمر بن الخطاب', ref: 'السنة الهجرية' },
  2: { virtue: 'تاسوعاء — يستحب صيامه مع عاشوراء', source: 'إِذَا كَانَ الْغَدُ مِنْ أَشْرُرِ الْأَيَّامِ فَلَا يُصَامَ غَدُكُمْ هَذَا', ref: 'البخاري ومسلم' },
  3: { virtue: 'يوم عاشوراء — يكفر ذنوب السنة الماضية', source: 'صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللهِ أَنْ يُكَفِّرَ السَّنَةَ الْمَاضِيَةَ', ref: 'البخاري ومسلم' },
  4: { virtue: 'المولد النبوي — ذكرى ميلاد سيدنا محمد ﷺ', source: 'خَيْرُ النَّاسِ قَرْنِي ثُمَّ الَّذِينَ يَلُونَهُمْ', ref: 'البخاري ومسلم' },
  5: { virtue: 'ليلة الإسراء والمعراج — رُفع النبي ﷺ إلى السماوات', source: 'سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا', ref: 'الإسراء: 1' },
  6: { virtue: 'ليلة النصف من شعبان — ليلة الدعاء والاستغفار', source: 'إِذَا كَانَتْ لَيْلَةُ النِّصْفِ مِنْ شَعْبَانَ فَقُومُوا لَيْلَهَا', ref: 'أبو داود والترمذي' },
  7: { virtue: 'بداية رمضان — شهر الصيام المبارك', source: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ', ref: 'البقرة: 185' },
  8: { virtue: 'ليلة القدر — خير من ألف شهر', source: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ', ref: 'القدر: 3' },
  10: { virtue: 'يوم عرفة — أفضل يوم في السنة', source: 'خَيْرُ يَوْمِ شَهِدَتْهُ الشَّمْسُ يَوْمُ عَرَفَةَ', ref: 'مسلم' },
  11: { virtue: 'عيد الأضحى — عيد النحر وذبح الأضاحي', source: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', ref: 'الكوثر: 2' },
  12: { virtue: 'أيام التشريق — أيام ذكر لله بعد الأضحى', source: 'أَيَّامُ التَّشْرِيقِ أَيَّامُ أَكْلٍ وَشُرْبٍ', ref: 'مسلم' },
};

function OccasionsSection() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const occasions = useMemo(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric', month: 'numeric', numberingSystem: 'latn'
    });
    const parts = formatter.formatToParts(today);
    const hijriMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const hijriDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    return getUpcomingIslamicDays(hijriMonth, hijriDay);
  }, [now]);

  return (
    <div style={{ marginBottom: 22 }}>
      <div className="sec-label">{t.occasions.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {occasions.map((occ) => {
          const isExpanded = expanded === occ.id;
          const details = OCCASIONS_DETAILS[occ.id];
          const isNext = occ.daysUntil <= 7;

          let countdownText;
           if (occ.daysUntil === 0) countdownText = t.occasions.today;
           else if (occ.daysUntil === 1) countdownText = t.occasions.tomorrow;
           else countdownText = `${occ.daysUntil} ${t.occasions.days}`;

          return (
            <motion.div
              key={occ.id}
              layout
              style={{
                background: isNext ? 'rgba(0,200,150,.04)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${isNext ? 'rgba(0,200,150,.12)' : 'rgba(255,255,255,.05)'}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => setExpanded(isExpanded ? null : occ.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{occ.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{occ.nameAr}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{occ.hijriDate}</div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  color: isNext ? '#00c896' : 'rgba(255,255,255,.4)',
                  flexShrink: 0, textAlign: 'left',
                }}>
                  {countdownText}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 12px 10px',
                      borderTop: '1px solid rgba(255,255,255,.05)',
                    }}>
                      <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
                        {details.virtue}
                      </div>
                      <div style={{
                        marginTop: 6, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '7px 10px',
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>
                          {details.source}
                        </div>
                        <div style={{ fontSize: 10, color: '#f0b040', fontWeight: 700, marginTop: 3 }}>
                          📖 {details.ref}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const homeCss = `
@keyframes bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
.h-wrap{width:100%;background:#0c0818;min-height:100vh;position:relative;overflow-x:hidden;padding-bottom:100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}

.hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);padding:24px 20px 20px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.15),transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-20px;left:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(0,200,150,.08),transparent 70%);pointer-events:none}
.hero-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;position:relative;z-index:1}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge-gold{background:rgba(240,176,64,.1);border:1px solid rgba(240,176,64,.22);color:#f0b040}
.badge-purple{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.22);color:#a78bfa}
.b-dot{width:5px;height:5px;border-radius:50%;animation:bpulse 2s infinite}
.b-dot-gold{background:#f0b040;box-shadow:0 0 6px rgba(240,176,64,.5)}
.b-dot-purple{background:#a78bfa}
.h-date{font-size:26px;font-weight:700;color:#fff;line-height:1.25}
.h-sub{font-size:12px;color:rgba(255,255,255,.38);margin-top:3px;font-weight:500}
.settings-btn{width:38px;height:38px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-decoration:none}

.prayer-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:14px 16px;position:relative;z-index:1}
.prayer-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.next-label{font-size:10px;color:rgba(255,255,255,.35);font-weight:600;text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px}
.next-name{font-size:20px;font-weight:700;color:#00c896}
.countdown{font-size:26px;font-weight:700;color:#fff;line-height:1;text-align:left;font-variant-numeric:tabular-nums}
.prayer-time-small{font-size:11px;color:rgba(255,255,255,.35);text-align:left;margin-top:2px}
.progress-track{height:3px;background:rgba(255,255,255,.07);border-radius:3px;margin-bottom:14px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#00c896,#3b82f6);border-radius:3px;transition:width 1s linear}
.times-row{display:flex;justify-content:space-between}
.t-item{text-align:center;flex:1;position:relative;padding-bottom:8px}
.t-name{font-size:9px;color:rgba(255,255,255,.32);margin-bottom:3px;font-weight:600}
.t-time{font-size:11px;color:rgba(255,255,255,.55);font-weight:600;font-variant-numeric:tabular-nums}
.t-item.on .t-name{color:#00c896}
.t-item.on .t-time{color:#fff;font-weight:700;font-size:12px}
.t-item.on::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#00c896;border-radius:50%;box-shadow:0 0 8px rgba(0,200,150,.6)}

.hero-hadith{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px 14px;margin-top:12px;position:relative;overflow:hidden;min-height:52px;display:flex;align-items:center;transition:all .5s ease}
.hero-hadith.prohibition{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2)}
.hero-hadith-text{font-family:'Amiri Quran',serif;font-size:13px;color:rgba(255,255,255,.75);line-height:1.8;text-align:center;direction:rtl;width:100%}
.hero-hadith.prohibition .hero-hadith-text{color:rgba(255,200,200,.85)}
.hero-hadith-source{display:block;font-family:'Segoe UI',Tahoma,sans-serif;font-size:10px;color:#f0b040;font-weight:700;margin-top:4px;text-align:center}
.hero-hadith.prohibition .hero-hadith-source{color:#ef4444}
.hero-hadith-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;font-size:9px;font-weight:700;margin-bottom:6px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
.hero-countdown{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35);font-weight:600}
.hero-countdown-num{font-size:22px;font-weight:700;color:#00c896;font-variant-numeric:tabular-nums;line-height:1}
.hero-hadith.prohibition .hero-countdown-num{color:#ef4444}
.hero-countdown-label{font-size:10px;color:rgba(255,255,255,.3);font-weight:500}
.hero-hadith.prohibition .hero-countdown-label{color:rgba(239,68,68,.4)}

.wc{width:100%;padding:0 16px;box-sizing:border-box}
.wc-card{border-radius:20px;overflow:hidden;position:relative;background:linear-gradient(145deg,#1a3a5c,#0d2137);box-shadow:0 8px 32px rgba(0,0,0,.35);transition:background .6s}
.wc-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.wc-sun{position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(255,200,60,.18),transparent 70%);border-radius:50%}
.wc-cloud1{position:absolute;bottom:20px;left:-20px;width:120px;height:60px;background:rgba(255,255,255,.03);border-radius:50%}
.wc-top{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 20px 0}
.wc-city{font-size:13px;color:rgba(255,255,255,.5);font-weight:500;margin-bottom:2px;display:flex;align-items:center;gap:5px}
.wc-icon-big{font-size:56px;line-height:1;margin:8px 0 4px}
.wc-temp-main{font-size:52px;font-weight:200;color:#fff;line-height:1;letter-spacing:-2px}
.wc-desc{font-size:13px;color:rgba(255,255,255,.55);margin-top:4px}
.wc-right{text-align:right;padding-top:4px}
.wc-unit-toggle{display:flex;gap:4px;margin-bottom:10px;justify-content:flex-end}
.wc-unit-btn{padding:4px 9px;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit}
.wc-unit-btn.on{background:rgba(255,255,255,.18);color:#fff}
.wc-unit-btn.off{background:rgba(255,255,255,.06);color:rgba(255,255,255,.35)}
.wc-minmax{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:4px}
.wc-minmax span{color:rgba(255,255,255,.9);font-weight:600}
.wc-updated{font-size:10px;color:rgba(255,255,255,.25)}
.wc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06);margin:16px 0 0}
.wc-stat{padding:12px 8px;text-align:center;background:#0d2137}
.wc-stat:first-child{border-radius:0 0 0 0}
.wc-stat-icon{font-size:16px;margin-bottom:4px}
.wc-stat-val{font-size:13px;font-weight:600;color:#fff}
.wc-stat-label{font-size:9px;color:rgba(255,255,255,.35);margin-top:2px;text-transform:uppercase;letter-spacing:.4px}
.wc-hourly{padding:14px 16px;border-top:1px solid rgba(255,255,255,.06)}
.wc-hourly-label{font-size:10px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.wc-hourly-scroll{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.wc-hourly-scroll::-webkit-scrollbar{display:none}
.wc-hourly-row{display:flex;gap:6px;width:max-content;padding-bottom:2px}
.wc-hitem{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 10px;text-align:center;min-width:52px;transition:background .2s;cursor:default}
.wc-hitem.now{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.2)}
.wc-htime{font-size:9px;color:rgba(255,255,255,.4);margin-bottom:5px;font-weight:500}
.wc-hitem.now .wc-htime{color:rgba(255,255,255,.8)}
.wc-hicon{font-size:18px;margin-bottom:5px;line-height:1}
.wc-htemp{font-size:12px;font-weight:700;color:rgba(255,255,255,.85)}
.wc-chart{padding:0 16px 14px}
.wc-chart-label{font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;font-weight:600}
.wc-chart-wrap{position:relative;height:48px}
canvas.wc-canvas{border-radius:6px}
.wc-extras{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 16px}
.wc-extra{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 14px}
.wc-extra-title{font-size:10px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;font-weight:600}
.wc-extra-val{font-size:20px;font-weight:600;color:#fff;margin-bottom:2px}
.wc-extra-sub{font-size:11px;color:rgba(255,255,255,.4)}
.wc-bar-track{height:4px;background:rgba(255,255,255,.1);border-radius:4px;margin-top:8px;overflow:hidden}
.wc-bar-fill{height:100%;border-radius:4px;transition:width .8s ease}
.wc-bottom{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 16px}
.wc-bitem{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px}
.wc-bitem-icon{font-size:22px}
.wc-bitem-label{font-size:10px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.wc-bitem-val{font-size:15px;font-weight:600;color:#fff}
.wc-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:40px;color:rgba(255,255,255,.4);font-size:13px}
.wc-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.15);border-top-color:rgba(255,255,255,.6);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.content{padding:0 16px 100px}
.sec-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:1px;margin:22px 0 12px;padding:0 2px}

.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.card{background:#151030;border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:16px 8px 14px;text-align:center;cursor:pointer;position:relative;overflow:hidden;transition:all .2s;text-decoration:none;display:block}
.card:hover{background:#1a1340;transform:translateY(-1px)}
.card:active{transform:scale(.95)}
.card-bar{position:absolute;top:0;left:0;right:0;height:2px;border-radius:16px 16px 0 0}
.card-icon{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 9px;font-size:22px}
.card-title{font-size:10px;font-weight:700;color:rgba(255,255,255,.65);line-height:1.35}

@keyframes spin{to{transform:rotate(360deg)}}

.hijri-birth{background:linear-gradient(135deg,rgba(240,176,64,.06),rgba(139,92,246,.04));border:1px solid rgba(240,176,64,.12);border-radius:16px;padding:16px}
.hijri-birth-title{font-size:13px;font-weight:700;color:#f0b040;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.hijri-birth-row{display:flex;gap:6px;align-items:center}
.hijri-birth-input{width:100%;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-weight:600;text-align:center;font-family:inherit;outline:none;transition:border-color .2s}
.hijri-birth-input:focus{border-color:rgba(240,176,64,.4)}
.hijri-birth-input::placeholder{color:rgba(255,255,255,.2)}
.hijri-birth-select{width:100%;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-weight:600;font-family:inherit;outline:none;appearance:none;cursor:pointer}
.hijri-birth-select option{background:#1a1340;color:#fff}
.hijri-birth-btn{width:100%;padding:9px;border-radius:10px;border:none;background:linear-gradient(135deg,#f0b040,#f59e0b);color:#1a1a1a;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:8px}
.hijri-birth-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(240,176,64,.3)}
.hijri-birth-result{margin-top:12px;padding:12px;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.12);border-radius:12px;text-align:center}
.hijri-birth-result-day{font-size:11px;color:rgba(255,255,255,.5);margin-bottom:4px}
.hijri-birth-result-date{font-size:20px;font-weight:700;color:#00c896;margin-bottom:2px}
.hijri-birth-result-sub{font-size:11px;color:rgba(255,255,255,.4)}
.hijri-birth-age{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.hijri-birth-age-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px 10px;text-align:center}
.hijri-birth-age-label{font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:4px}
.hijri-birth-age-val{font-size:18px;font-weight:700;color:#fff}
.hijri-birth-age-detail{font-size:10px;color:rgba(255,255,255,.4);margin-top:2px}
.hijri-birth-diff{margin-top:10px;padding:10px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.12);border-radius:12px;text-align:center}
.hijri-birth-diff-title{font-size:10px;color:#a78bfa;font-weight:700;margin-bottom:4px}
.hijri-birth-diff-val{font-size:14px;font-weight:700;color:#fff}
.hijri-birth-diff-note{font-size:10px;color:rgba(255,255,255,.4);margin-top:6px;line-height:1.6}
.hijri-birth-name{width:100%;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-weight:600;text-align:right;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:6px}
.hijri-birth-name:focus{border-color:rgba(240,176,64,.4)}
.hijri-birth-name::placeholder{color:rgba(255,255,255,.2)}
.hijri-saved{margin-top:14px}
.hijri-saved-title{font-size:11px;color:rgba(255,255,255,.4);font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:5px}
.hijri-saved-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:6px}
.hijri-saved-info{flex:1}
.hijri-saved-name{font-size:13px;font-weight:700;color:#fff}
.hijri-saved-date{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
.hijri-saved-age{font-size:11px;color:#f0b040;font-weight:600;margin-top:2px}
.hijri-saved-del{width:28px;height:28px;border-radius:8px;border:none;background:rgba(239,68,68,.1);color:#ef4444;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.hijri-saved-del:hover{background:rgba(239,68,68,.2)}
.hijri-bday-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(240,176,64,.95),rgba(245,158,11,.95));color:#1a1a1a;padding:14px 20px;border-radius:14px;font-weight:700;font-size:14px;z-index:9999;box-shadow:0 8px 32px rgba(240,176,64,.4);text-align:center;max-width:90%;animation:bdaySlide 0.4s ease}
@keyframes bdaySlide{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.hijri-birth-link{display:block;text-align:center;margin-top:10px;font-size:11px;color:#8b5cf6;font-weight:600;text-decoration:none;transition:color .2s}
.hijri-birth-link:hover{color:#a78bfa}

.radio-strip{margin:16px 0;background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(59,130,246,.05));border:1px solid rgba(139,92,246,.15);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px}
.radio-icon{width:44px;height:44px;background:rgba(139,92,246,.12);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.radio-info{flex:1}
.radio-name{font-size:13px;font-weight:700;color:#fff}
.radio-freq{font-size:11px;color:rgba(255,255,255,.38);margin-top:2px}
.radio-live{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#ef4444}
.live-dot{width:5px;height:5px;border-radius:50%;background:#ef4444;animation:bpulse 1.5s infinite;display:inline-block}
.radio-play{width:40px;height:40px;background:#8b5cf6;border-radius:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0;border:none;color:#fff}
.radio-play:hover{background:#7c3aed;transform:scale(1.05)}

.daily{background:#151030;border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:18px}
.daily-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.daily-title{font-size:15px;font-weight:700;color:#fff}
.tabs{display:flex;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:3px;gap:2px}
.tab{padding:5px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;color:rgba(255,255,255,.3);border:none;background:transparent;font-family:inherit;transition:all .2s}
.tab.on-h{background:#8b5cf6;color:#fff}
.tab.on-w{background:#f0b040;color:#1a1a1a}
.quote-box{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:14px 14px 14px 10px;margin-bottom:12px;position:relative}
.quote-mark{position:absolute;top:4px;right:12px;font-size:42px;color:rgba(139,92,246,.15);font-family:Georgia,serif;line-height:1;pointer-events:none}
.quote-text{font-size:14px;color:rgba(255,255,255,.85);line-height:1.75;padding-right:6px}
.quote-src{font-size:11px;color:#f0b040;font-weight:700;margin-top:8px}
.btns{display:flex;gap:8px}
.btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;transition:all .2s}
.btn-listen{background:rgba(139,92,246,.12);color:#a78bfa;border:1px solid rgba(139,92,246,.18)}
.btn-listen.on{background:rgba(0,200,150,.15);color:#00c896;border-color:rgba(0,200,150,.25);box-shadow:0 0 16px rgba(0,200,150,.15)}
.btn-det{background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.07)}

.azkar-list{display:flex;flex-direction:column;gap:8px}
.az-item{background:#151030;border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .2s}
.az-item:hover{background:#1a1340}
.az-item.done{background:rgba(0,200,150,.06);border-color:rgba(0,200,150,.15)}
.az-text{font-size:13px;color:rgba(255,255,255,.85);flex:1;line-height:1.6}
.az-prog{height:3px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:8px;overflow:hidden}
.az-fill{height:100%;background:linear-gradient(90deg,#f0b040,#f59e0b);border-radius:3px;transition:width .4s}
.az-item.done .az-fill{background:linear-gradient(90deg,#00c896,#10b981)}
.az-count{min-width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;flex-shrink:0;transition:all .25s}
.az-count.pend{background:rgba(240,176,64,.08);border:1px solid rgba(240,176,64,.16);color:#f0b040}
.az-count.done{background:#00c896;color:#fff}

.navbar{position:fixed;bottom:0;left:0;right:0;background:rgba(10,7,20,.97);border-top:1px solid rgba(255,255,255,.07);padding:8px 6px 16px;display:flex;justify-content:space-around;z-index:50;backdrop-filter:blur(12px)}
.ni{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 10px;border-radius:12px;cursor:pointer;min-height:44px;justify-content:center;text-decoration:none}
.ni.on{background:rgba(0,200,150,.08)}
.ni-icon{font-size:20px}
.ni-label{font-size:9px;font-weight:700;color:rgba(255,255,255,.28)}
.ni.on .ni-label{color:#00c896}
.ni-dot{width:3px;height:3px;border-radius:50%;background:#00c896;margin-top:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
`;

function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'center',
      flex: 1, gap: 6,
    }}>
      <div style={{
        fontFamily: "'Segoe UI', sans-serif", fontSize: 34, fontWeight: 700,
        color: '#fff', direction: 'ltr', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
      }}>
        {String(h12).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 700, color: '#00c896',
      }}>
        {period}
      </div>
    </div>
  );
}

function toArabicNum(n) {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function HijriDate() {
  const { t } = useTranslation();
  const today = new Date();
  const hijriMonths = t.hijriMonths;
  const [daysLeft, setDaysLeft] = useState(0);
  const [inRamadan, setInRamadan] = useState(false);
  const [eid, setEid] = useState(false);
  const [hijriInfo, setHijriInfo] = useState({ day: 1, month: 1, year: 1446 });

  useEffect(() => {
    const update = () => {
      try {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric', month: 'numeric', year: 'numeric', numberingSystem: 'latn'
        });
        const parts = formatter.formatToParts(new Date());
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
        const year = parseInt(parts.find(p => p.type === 'year')?.value || '1446');
        setHijriInfo({ day, month, year });
      } catch {}
      setInRamadan(isRamadan());
      setEid(isEid());
      setDaysLeft(getDaysUntilRamadan());
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div>
      <div className="badges">
        <div className="badge badge-gold"><div className="b-dot b-dot-gold" />{hijriInfo.year} {t.home.hijriYearSuffix}</div>
        {inRamadan && <div className="badge badge-gold">🌙 {t.ramadan.title}</div>}
        {eid && <div className="badge badge-purple">🎉 {t.home.eidBadge}</div>}
        {!inRamadan && !eid && daysLeft > 0 && <div className="badge badge-purple">🕌 {t.home.daysUntilRamadan.replace('{days}', daysLeft)}</div>}
      </div>
      <div className="h-date">{hijriInfo.day} {hijriMonths[hijriInfo.month - 1] || hijriMonths[0]}</div>
      <div className="h-sub">{t.days[today.getDay()]} · {t.months[today.getMonth()]} {today.getFullYear()}</div>
    </div>
  );
}

function PrayerWidget() {
  const { t } = useTranslation();
  const [data, setData] = useState({});

  useEffect(() => {
    const id = 'prayer-widget-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes glow{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes oceanShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes sunriseShift{0%,100%{opacity:.8}50%{opacity:1}}
        @keyframes starShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes sunsetShift{0%,100%{opacity:.8}50%{opacity:1}}
        @keyframes blink{50%{opacity:.15}}
        @keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes seaBubble{
          0%{transform:translateY(0) translateX(0) scale(1);opacity:0}
          10%{opacity:.9}
          50%{transform:translateY(-50%) translateX(10px) scale(1.1);opacity:.6}
          100%{transform:translateY(-110%) translateX(-5px) scale(.5);opacity:0}
        }
        @keyframes lightRay{0%,100%{opacity:.3}50%{opacity:.8}}
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const times = getPrayerTimesSync();
      const now = new Date();
      const ns = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const p = (s) => { const [h, m] = (s || '0:0').split(':').map(Number); return (h * 60 + m) * 60; };
      const fmt = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return { h, m, s, str: h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}` }; };

      let ni = -1;
      const prKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (let i = 0; i < prKeys.length; i++) { if (p(times[prKeys[i]]) > ns) { ni = i; break; } }
      const nextDay = ni === -1; if (nextDay) ni = 0;
      const np = prKeys[ni], nSec = p(times[np]);
      const rem = nextDay ? (86400 - ns) + nSec : nSec - ns;
      const cd = fmt(rem);

      const pi = ni === 0 ? prKeys.length - 1 : ni - 1;
      const pSec = p(times[prKeys[pi]]);
      let dur = nSec - pSec; if (dur <= 0) dur += 86400;
      let el = ns - pSec; if (el < 0) el += 86400;
      const prog = Math.min((el / dur) * 360, 360);
      const pct = Math.round((el / dur) * 100);

      const srSec = p(times.Sunrise);
      const srDone = ns >= srSec, srRem = srDone ? 0 : srSec - ns, srCd = srDone ? null : fmt(srRem);

      const ssSec = p(times.Maghrib);
      const ssDone = ns >= ssSec, ssRem = ssDone ? 0 : ssSec - ns, ssCd = ssDone ? null : fmt(ssRem);

      const prayerRow = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(k => {
        const ks = p(times[k]);
        let c = ''; if (ks <= ns) c = 'done'; if (k === np && !nextDay) c = 'active';
        return { key: k, name: PRAYER_NAMES_AR[k], time: formatTime12h(times[k]), cls: c };
      });

      const fasting = calcFastingInfo(times.Sunrise, times.Maghrib);

      setData({ np: PRAYER_NAMES_AR[np], npTime: formatTime12h(times[np]), cd, prog, pct, srDone, srCd, srTime: formatTime12h(times.Sunrise), ssDone, ssCd, ssTime: formatTime12h(times.Maghrib), prayerRow, fasting });
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!data.cd) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      {/* Top Row: Main Countdown */}
      <div style={{ display: 'flex', gap: 14 }}>
        {/* Main Countdown */}
        <div style={{ flex: 1, borderRadius: 18, padding: '24px 28px', background: 'linear-gradient(155deg, rgba(0,200,150,.06), rgba(139,92,246,.04), rgba(240,176,64,.03))', border: '1px solid rgba(0,200,150,.08)', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Sea Background */}
          <video autoPlay muted loop playsInline preload="metadata" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18, pointerEvents: 'none', opacity: 0.35 }}>
            <source src="sea-bg-optimized.webm" type="video/webm" />
            <source src="sea-bg.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(180deg, rgba(12,8,24,.55) 0%, rgba(12,8,24,.45) 50%, rgba(12,8,24,.6) 100%)' }} />
          {/* Ring */}
          <div style={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,150,.04), transparent 70%)', pointerEvents: 'none', animation: 'glow 4s ease infinite' }} />
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(#00c896 0deg, #00c896 ${data.prog}deg, rgba(255,255,255,.03) ${data.prog}deg)`, padding: 4 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0c0818', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', background: 'linear-gradient(180deg, #f0ece4, rgba(0,200,150,.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 10px rgba(0,0,0,.3)' }}>
                  {data.cd.str.split(':').map((v, i) => <span key={i}>{i > 0 && <span style={{ animation: 'blink 1s step-end infinite', margin: '0 1px' }}>:</span>}{v}</span>)}
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8a82a0', marginTop: 4, letterSpacing: 1 }}>ساعة : دقيقة : ثانية</div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 800, color: '#00c896', background: 'rgba(0,200,150,.12)', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(0,200,150,.15)', textShadow: '0 1px 3px rgba(0,0,0,.3)' }}>{data.pct}% مضى</div>
          </div>
          {/* Info */}
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00c896', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00c896', boxShadow: '0 0 10px rgba(0,200,150,.5)', animation: 'pulse 2s ease infinite' }} />
              {data.np}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e0d8f0', marginBottom: 16, textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>{data.npTime} — الصلاة القادمة</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {data.prayerRow?.map(r => (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: r.cls === 'active' ? '#00c896' : r.cls === 'done' ? '#8a82a0' : '#c0b8d8', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.cls === 'done' ? 'rgba(0,200,150,.35)' : r.cls === 'active' ? '#f0b040' : 'rgba(255,255,255,.1)', boxShadow: r.cls === 'active' ? '0 0 6px rgba(240,176,64,.4)' : 'none', animation: r.cls === 'active' ? 'pulse 2s ease infinite' : 'none' }} />
                  {r.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Times Bar */}
      <PrayerTimesBar />

      {/* Fasting Bar */}
      <FastingBar />
    </div>
  );
}

function HeroHadithBar() {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [nextPrayerName, setNextPrayerName] = useState('');
  const [isProhibition, setIsProhibition] = useState(false);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => {
        const inProhib = isInProhibitionTime();
        const pool = inProhib ? PROHIBITION_HADITHS : HADITHS;
        return (prev + 1) % pool.length;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const update = () => {
      const inProhib = isInProhibitionTime();
      setIsProhibition(inProhib);
      const period = getCurrentProhibitionPeriod();
      setPeriodLabel(period ? period.label : '');
      const times = getPrayerTimesSync();
      const now = new Date();
      const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      for (let i = 0; i < PRAYER_KEYS_ONLY.length; i++) {
        const parts = (times[PRAYER_KEYS_ONLY[i]] || '').split(':').map(Number);
        const pSec = ((parts[0] || 0) * 60 + (parts[1] || 0)) * 60;
        if (pSec > nowSec) {
          const diffSec = pSec - nowSec;
          const h = Math.floor(diffSec / 3600);
          const m = Math.floor((diffSec % 3600) / 60);
          const s = diffSec % 60;
          setCountdown(h > 0 ? `${h} س ${m} د ${s} ث` : m > 0 ? `${m} د ${s} ث` : `${s} ث`);
          setNextPrayerName(PRAYER_NAMES_AR[PRAYER_KEYS_ONLY[i]]);
          return;
        }
      }
      const firstParts = (times[PRAYER_KEYS_ONLY[0]] || '').split(':').map(Number);
      const firstSec = ((firstParts[0] || 0) * 60 + (firstParts[1] || 0)) * 60;
      const diffSec = (24 * 3600 - nowSec) + firstSec;
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      setCountdown(h > 0 ? `${h} س ${m} د ${s} ث` : m > 0 ? `${m} د ${s} ث` : `${s} ث`);
      setNextPrayerName(PRAYER_NAMES_AR[PRAYER_KEYS_ONLY[0]]);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const pool = isProhibition ? PROHIBITION_HADITHS : HADITHS;
  const hadith = pool[idx % pool.length];

  return (
    <div className={`hero-hadith${isProhibition ? ' prohibition' : ''}`} key={`${isProhibition ? 'p' : 'n'}-${idx}`}>
      <div>
        {isProhibition && <div className="hero-hadith-badge">⛔ {t.heroHadith.prohibitionPrefix}{periodLabel}</div>}
        <div className="hero-hadith-text">
          {hadith.text}
          <span className="hero-hadith-source">— {hadith.source}</span>
        </div>
        <div className="hero-countdown">
          <span className="hero-countdown-label">{isProhibition ? t.heroHadith.endsAt : t.heroHadith.countdownTo} {nextPrayerName}</span>
          <span className="hero-countdown-num">{countdown}</span>
        </div>
      </div>
    </div>
  );
}

function HijriBirthDate() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [gDay, setGDay] = useState('');
  const [gMonth, setGMonth] = useState(new Date().getMonth() + 1);
  const [gYear, setGYear] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hijriBirthdays') || '[]'); } catch { return []; }
  });
  const [bdayToast, setBdayToast] = useState(null);

  const toHijri = (y, m, d) => {
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 1524.5;
    const l = Math.floor(jd - 1948439.5 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const lr = l - 10631 * n + 354;
    const j = Math.floor((10985 - lr) / 5316) * Math.floor((50 * lr) / 17719) + Math.floor(lr / 5670) * Math.floor((43 * lr) / 15238);
    const ld = lr - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hMonth = Math.floor((24 * ld) / 709);
    const hDay = ld - Math.floor((709 * hMonth) / 24);
    const hYear = 30 * n + j - 30;
    return { year: hYear, month: hMonth, day: hDay };
  };

  const calcAge = (birthY, birthM, birthD, nowY, nowM, nowD) => {
    let years = nowY - birthY;
    let months = nowM - birthM;
    let days = nowD - birthD;
    if (days < 0) { months--; days += 29; }
    if (months < 0) { years--; months += 12; }
    return { years, months, days };
  };

  useEffect(() => {
    const todayHijri = toHijri(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    const toastList = [];
    saved.forEach(p => {
      if (p.hMonth === todayHijri.month && p.hDay === todayHijri.day) {
        toastList.push(p.name);
      }
    });
    if (toastList.length > 0) {
      setBdayToast(toastList.join('، '));
      setTimeout(() => setBdayToast(null), 8000);
    }
  }, []);

  const convert = () => {
    const day = parseInt(gDay);
    const year = parseInt(gYear);
    if (!day || !year || day < 1 || day > 31 || year < 1 || year > 2100) return;
    const hijri = toHijri(year, gMonth, day);
    const now = new Date();
    const dayName = DAYS_AR[new Date(year, gMonth - 1, day).getDay()];
    const hMonthName = HIJRI_MONTHS_AR[hijri.month - 1] || '';
    const todayHijri = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const gAge = calcAge(year, gMonth, day, now.getFullYear(), now.getMonth() + 1, now.getDate());
    const hAge = calcAge(hijri.year, hijri.month, hijri.day, todayHijri.year, todayHijri.month, todayHijri.day);
    const todayGName = GREG_MONTHS_AR[now.getMonth()];
    const yearDiff = gAge.years - hAge.years;
    setResult({
      dayName, hDay: hijri.day, hMonthName, hYear: hijri.year,
      gAge, hAge, yearDiff,
      todayGDay: now.getDate(), todayGMonth: todayGName, todayGYear: now.getFullYear(),
      todayHDay: todayHijri.day, todayHMonth: HIJRI_MONTHS_AR[todayHijri.month - 1], todayHYear: todayHijri.year,
    });
  };

  const save = () => {
    if (!result) return;
    const personName = name.trim() || 'بدون اسم';
    const entry = {
      id: Date.now(),
      name: personName,
      gDay: parseInt(gDay), gMonth, gYear: parseInt(gYear),
      hDay: result.hDay, hMonth: result.hMonthName, hYear: result.hYear,
    };
    const updated = [...saved, entry];
    setSaved(updated);
    localStorage.setItem('hijriBirthdays', JSON.stringify(updated));
    setName('');
  };

  const remove = (id) => {
    const updated = saved.filter(p => p.id !== id);
    setSaved(updated);
    localStorage.setItem('hijriBirthdays', JSON.stringify(updated));
  };

  return (
    <div className="hijri-birth" id="hijri-birth">
      {bdayToast && <div className="hijri-bday-toast">{t.hijriBirth?.bdayToast || '🎉 عيد ميلاد سعيد'} {bdayToast}!</div>}
      <div className="hijri-birth-title">{t.hijriBirth?.title || '🔄 تحويل تاريخ ميلاد ميلادي إلى هجري'}</div>
      <input className="hijri-birth-name" type="text" placeholder={t.hijriBirth?.namePlaceholder || 'اسم الشخص (اختياري)'} value={name} onChange={(e) => setName(e.target.value)} />
      <div className="hijri-birth-row">
        <input className="hijri-birth-input" type="number" min="1" max="31" placeholder={t.hijriBirth?.day || 'اليوم'} value={gDay} onChange={(e) => setGDay(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && convert()} />
        <select className="hijri-birth-select" value={gMonth} onChange={(e) => setGMonth(parseInt(e.target.value))}>
          {GREG_MONTHS_AR.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
        </select>
        <input className="hijri-birth-input" type="number" min="1" max="2100" placeholder={t.hijriBirth?.year || 'السنة'} value={gYear} onChange={(e) => setGYear(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && convert()} />
      </div>
      <button className="hijri-birth-btn" onClick={convert}>{t.hijriBirth?.convert || 'تحويل'}</button>
      {result && (
        <>
          <div className="hijri-birth-result">
            <div className="hijri-birth-result-day">{result.dayName}</div>
            <div className="hijri-birth-result-date">{result.hDay} {result.hMonthName} {result.hYear}</div>
            <div className="hijri-birth-result-sub">{t.hijriBirth?.hijri || 'هجري'}</div>
          </div>
          <div className="hijri-birth-age">
            <div className="hijri-birth-age-box">
              <div className="hijri-birth-age-label">{t.hijriBirth?.myAge || 'عمرك الميلادي'}</div>
              <div className="hijri-birth-age-val" style={{ color: '#f0b040' }}>{result.gAge.years} {t.hijriBirth?.year2 || 'سنة'}</div>
              <div className="hijri-birth-age-detail">{result.gAge.months} {t.hijriBirth?.month || 'شهر'} · {result.gAge.days} {t.hijriBirth?.day2 || 'يوم'}</div>
              <div className="hijri-birth-age-detail" style={{ marginTop: 4 }}>{result.todayGDay} {result.todayGMonth} {result.todayGYear}</div>
            </div>
            <div className="hijri-birth-age-box">
              <div className="hijri-birth-age-label">{t.hijriBirth?.hijriAge || 'عمرك الهجري'}</div>
              <div className="hijri-birth-age-val" style={{ color: '#00c896' }}>{result.hAge.years} {t.hijriBirth?.year2 || 'سنة'}</div>
              <div className="hijri-birth-age-detail">{result.hAge.months} {t.hijriBirth?.month || 'شهر'} · {result.hAge.days} {t.hijriBirth?.day2 || 'يوم'}</div>
              <div className="hijri-birth-age-detail" style={{ marginTop: 4 }}>{result.todayHDay} {result.todayHMonth} {result.todayHYear}</div>
            </div>
          </div>
          <div className="hijri-birth-diff">
            <div className="hijri-birth-diff-title">{t.hijriBirth?.diffTitle || 'الفرق بين العمر الميلادي والهجري'}</div>
            <div className="hijri-birth-diff-val">{result.yearDiff} {result.yearDiff === 1 ? (t.hijriBirth?.year2 || 'سنة') : (t.hijriBirth?.years || 'سنوات')} {t.hijriBirth?.less || 'أقل'}</div>
            <div className="hijri-birth-diff-note">{t.hijriBirth?.diffNote || 'السنة الهجري قصيرة لأنها 354 يومًا فقط (أقصر من الميلادي بـ 11 يومًا). لذلك العمر الهجري يقل تدريجيًا كل سنة ميلادية.'}</div>
          </div>
          <button className="hijri-birth-btn" onClick={save} style={{ background: 'linear-gradient(135deg,#00c896,#10b981)' }}>{t.hijriBirth?.save || '💾 حفظ تاريخ الميلاد'}</button>
        </>
      )}
      {saved.length > 0 && (
        <div className="hijri-saved">
          <div className="hijri-saved-title">{t.hijriBirth?.savedTitle || '📋 تواريخ الميلاد المحفوظة'} ({saved.length})</div>
          {saved.map(p => {
            const now = new Date();
            const todayH = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
            const isToday = p.hMonth === todayH.month && p.hDay === todayH.day;
            const age = calcAge(p.gYear, p.gMonth, p.gDay, now.getFullYear(), now.getMonth() + 1, now.getDate());
            return (
              <div key={p.id} className="hijri-saved-item" style={isToday ? { background: 'rgba(240,176,64,.08)', borderColor: 'rgba(240,176,64,.2)' } : {}}>
                <div className="hijri-saved-info">
                  <div className="hijri-saved-name">{isToday ? '🎂 ' : ''}{p.name}</div>
                  <div className="hijri-saved-date">{p.hDay} {p.hMonth} {p.hYear} هجري · {p.gDay}/{p.gMonth}/{p.gYear} ميلادي</div>
                  <div className="hijri-saved-age">{age.years} سنة · {age.months} شهر · {age.days} يوم</div>
                </div>
                <button className="hijri-saved-del" onClick={() => remove(p.id)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
      <Link to="/hijri-age" className="hijri-birth-link">{t.hijriBirth?.link || 'فتح محول التاريخ الكامل ←'}</Link>
    </div>
  );
}

const WMO = {
  0:{d:'صافٍ تماماً',i:'☀️',ni:'🌙'},
  1:{d:'صافٍ غالباً',i:'🌤️',ni:'🌙'},
  2:{d:'غائم جزئياً',i:'⛅',ni:'☁️'},
  3:{d:'غائم',i:'☁️',ni:'☁️'},
  45:{d:'ضباب',i:'🌫️',ni:'🌫️'},
  48:{d:'ضباب صقيعي',i:'🌫️',ni:'🌫️'},
  51:{d:'رذاذ خفيف',i:'🌦️',ni:'🌧️'},
  53:{d:'رذاذ معتدل',i:'🌦️',ni:'🌧️'},
  55:{d:'رذاذ كثيف',i:'🌧️',ni:'🌧️'},
  61:{d:'مطر خفيف',i:'🌧️',ni:'🌧️'},
  63:{d:'مطر معتدل',i:'🌧️',ni:'🌧️'},
  65:{d:'مطر غزير',i:'🌧️',ni:'🌧️'},
  71:{d:'ثلج خفيف',i:'🌨️',ni:'🌨️'},
  73:{d:'ثلج معتدل',i:'❄️',ni:'❄️'},
  75:{d:'ثلج كثيف',i:'❄️',ni:'❄️'},
  77:{d:'حبات ثلج',i:'🌨️',ni:'🌨️'},
  80:{d:'زخات مطر',i:'🌦️',ni:'🌧️'},
  81:{d:'زخات كثيفة',i:'🌧️',ni:'🌧️'},
  82:{d:'زخات عنيفة',i:'⛈️',ni:'⛈️'},
  85:{d:'زخات ثلج',i:'🌨️',ni:'🌨️'},
  86:{d:'زخات ثلج كثيفة',i:'❄️',ni:'❄️'},
  95:{d:'عاصفة رعدية',i:'⛈️',ni:'⛈️'},
  96:{d:'عاصفة مع برَد',i:'⛈️',ni:'⛈️'},
  99:{d:'عاصفة شديدة',i:'🌩️',ni:'🌩️'},
};
function getWmoIcon(code, isDay) { const w = WMO[code] || { i: '🌡️', ni: '🌡️' }; return isDay !== false ? w.i : w.ni; }
function getWmoDesc(code) { return (WMO[code] || { d: 'غير معروف' }).d; }

function WeatherStrip() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [cityName, setCityName] = useState('');
  const [useFahrenheit, setUseFahrenheit] = useState(() => localStorage.getItem('weatherUnit') === 'F');
  const canvasRef = useRef(null);

  const toF = (c) => Math.round(c * 9/5 + 32);
  const fmt = (c) => useFahrenheit ? `${toF(c)}°F` : `${Math.round(c)}°C`;
  const fmtH = (c) => useFahrenheit ? `${toF(c)}°` : `${Math.round(c)}°`;
  const fmtTime = (str) => { const h = parseInt(str); const ap = h >= 12 ? t.weatherStrip.pm : t.weatherStrip.am; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${h12} ${ap}`; };
  const timeAgo = (ms) => { const m = Math.floor((Date.now() - ms) / 60000); return m < 1 ? t.weatherStrip.justNow : m < 60 ? `${t.weatherStrip.ago} ${m} ${t.weatherStrip.minAgo}` : `${t.weatherStrip.ago} ${Math.floor(m / 60)} ${t.weatherStrip.hourAgo}`; };
  const uvLevel = (uv) => { if (uv < 3) return { l: t.weatherStrip.uvLevels[0], c: '#00c896' }; if (uv < 6) return { l: t.weatherStrip.uvLevels[1], c: '#f0b040' }; if (uv < 8) return { l: t.weatherStrip.uvLevels[2], c: '#f97316' }; return { l: t.weatherStrip.uvLevels[3], c: '#ef4444' }; };
  const windDir = (deg) => { return t.weatherStrip.windDirs[Math.round(deg / 45) % 8]; };

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('weatherCache');
      if (saved) { try { setWeather(JSON.parse(saved)); } catch {} }
    };
    load();
    const handler = (e) => { if (e.key === 'weatherCache') load(); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const loc = JSON.parse(localStorage.getItem('prayerLocation') || '{}');
        if (!loc.lat || !loc.lng) return;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,precipitation_probability,visibility,is_day&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=2`;
        const res = await fetch(url);
        const data = await res.json();
        const cur = data.current;
        const now = new Date();
        const hourlyForecast = [];
        if (data.hourly?.time) {
          const tom = new Date(now.getTime() + 86400000);
          data.hourly.time.forEach((t, i) => {
            const h = new Date(t);
            if (h >= now && h <= tom) {
              hourlyForecast.push({
                time: String(h.getHours()).padStart(2, '0') + ':00',
                temp: Math.round(data.hourly.temperature_2m[i]),
                code: data.hourly.weather_code[i],
                precip: data.hourly.precipitation_probability?.[i] || 0,
              });
            }
          });
        }
        const fmtSun = (s) => { if (!s) return ''; const p = s.split('T')[1] || s; return p.substring(0, 5); };
        const weatherData = {
          temp: Math.round(cur.temperature_2m),
          feelsLike: Math.round(cur.apparent_temperature),
          humidity: cur.relative_humidity_2m,
          windSpeed: Math.round(cur.wind_speed_10m),
          windDir: cur.wind_direction_10m || 0,
          code: cur.weather_code,
          isDay: cur.is_day === 1,
          maxTemp: Math.round(data.daily?.temperature_2m_max?.[0] || 0),
          minTemp: Math.round(data.daily?.temperature_2m_min?.[0] || 0),
          uv: Math.round(data.daily?.uv_index_max?.[0] || 3),
          precip: cur.precipitation_probability || 0,
          visibility: Math.round((cur.visibility || 10000) / 1000),
          sunrise: fmtSun(data.daily?.sunrise?.[0] || ''),
          sunset: fmtSun(data.daily?.sunset?.[0] || ''),
          hourly: hourlyForecast,
          ts: Date.now(),
        };
        localStorage.setItem('weatherCache', JSON.stringify(weatherData));
        setWeather(weatherData);
        reverseGeocode(loc.lat, loc.lng);
      } catch {}
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const d = await r.json();
      setCityName(d.address?.city || d.address?.town || d.address?.village || d.address?.county || '');
    } catch {}
  };

  useEffect(() => {
    if (!weather) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (wrap) { canvas.width = wrap.clientWidth; }
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const temps = (weather.hourly || []).slice(0, 12).map(h => h.temp);
    if (!temps.length) return;
    const mn = Math.min(...temps) - 2, mx = Math.max(...temps) + 2;
    const points = temps.map((t, i) => ({ x: (i / (temps.length - 1)) * W, y: H - ((t - mn) / (mx - mn)) * (H - 8) - 4 }));
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(59,130,246,.35)');
    grad.addColorStop(1, 'rgba(59,130,246,.0)');
    ctx.beginPath(); ctx.moveTo(points[0].x, H);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(99,160,255,.8)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    points.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); });
  }, [weather]);

  useEffect(() => {
    if (!weather) return;
    const card = document.getElementById('wcCard');
    const sun = card?.querySelector('.wc-sun');
    if (!card) return;
    if (!weather.isDay) {
      card.style.background = 'linear-gradient(145deg,#0d1b2a,#050e16)';
      if (sun) sun.style.background = 'radial-gradient(circle,rgba(139,92,246,.12),transparent 70%)';
    } else if (weather.code === 0 || weather.code === 1) {
      card.style.background = 'linear-gradient(145deg,#1a4a7a,#0d2a4a)';
    } else if (weather.code >= 61 && weather.code <= 82) {
      card.style.background = 'linear-gradient(145deg,#1a2a3a,#0d1a2a)';
    } else {
      card.style.background = 'linear-gradient(145deg,#1a3a5c,#0d2137)';
    }
  }, [weather]);

  const setUnit = (u) => { setUseFahrenheit(u === 'F'); localStorage.setItem('weatherUnit', u); };

  if (!weather) {
    return (
      <div className="wc">
        <div className="wc-card">
          <div className="wc-bg"><div className="wc-sun"></div><div className="wc-cloud1"></div></div>
          <div className="wc-loading"><div className="wc-spinner"></div> {t.weatherStrip.loading}</div>
        </div>
      </div>
    );
  }

  const w = weather;
  const nowH = new Date().getHours();
  const uvInfo = uvLevel(w.uv || 3);
  const icon = getWmoIcon(w.code, w.isDay);
  const desc = getWmoDesc(w.code);

  return (
    <div className="wc">
      <div className="wc-card" id="wcCard">
        <div className="wc-bg"><div className="wc-sun"></div><div className="wc-cloud1"></div></div>
        <div className="wc-top">
          <div>
            {cityName && <div className="wc-city">📍 {cityName}</div>}
            <div className="wc-icon-big">{icon}</div>
            <div className="wc-temp-main">{fmt(w.temp)}</div>
            <div className="wc-desc">{desc}</div>
          </div>
          <div className="wc-right">
            <div className="wc-unit-toggle">
              <button className={`wc-unit-btn ${!useFahrenheit ? 'on' : 'off'}`} onClick={() => setUnit('C')}>°C</button>
              <button className={`wc-unit-btn ${useFahrenheit ? 'on' : 'off'}`} onClick={() => setUnit('F')}>°F</button>
            </div>
            <div className="wc-minmax">↑ <span>{fmt(w.maxTemp)}</span></div>
            <div className="wc-minmax">↓ <span>{fmt(w.minTemp)}</span></div>
            <div className="wc-updated">{timeAgo(w.ts)}</div>
          </div>
        </div>

        <div className="wc-stats">
          <div className="wc-stat"><div className="wc-stat-icon">💧</div><div className="wc-stat-val">{w.humidity}%</div><div className="wc-stat-label">{t.weatherStrip.humidity}</div></div>
          <div className="wc-stat"><div className="wc-stat-icon">💨</div><div className="wc-stat-val">{w.windSpeed}</div><div className="wc-stat-label">{t.weatherStrip.windUnit}</div></div>
          <div className="wc-stat"><div className="wc-stat-icon">☔</div><div className="wc-stat-val">{w.precip || 0}%</div><div className="wc-stat-label">{t.weatherStrip.rain}</div></div>
          <div className="wc-stat"><div className="wc-stat-icon">👁️</div><div className="wc-stat-val">{w.visibility || 10}</div><div className="wc-stat-label">{t.weatherStrip.visibility}</div></div>
        </div>

        {w.hourly && w.hourly.length > 0 && (
          <div className="wc-hourly">
            <div className="wc-hourly-label">{t.weatherStrip.forecast}</div>
            <div className="wc-hourly-scroll">
              <div className="wc-hourly-row">
                {w.hourly.slice(0, 16).map((h, i) => {
                  const isNow = parseInt(h.time) === nowH;
                  return (
                    <div key={i} className={`wc-hitem${isNow ? ' now' : ''}`}>
                      <div className="wc-htime">{isNow ? t.weatherStrip.now : fmtTime(h.time)}</div>
                      <div className="wc-hicon">{getWmoIcon(h.code, parseInt(h.time) >= 6 && parseInt(h.time) < 20)}</div>
                      <div className="wc-htemp">{fmtH(h.temp)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {w.hourly && w.hourly.length > 0 && (
          <div className="wc-chart">
            <div className="wc-chart-label">{t.weatherStrip.tempChart}</div>
            <div className="wc-chart-wrap">
              <canvas ref={canvasRef} height={48} className="wc-canvas" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        <div className="wc-extras">
          <div className="wc-extra">
            <div className="wc-extra-title">☀️ {t.weatherStrip.uvTitle}</div>
            <div className="wc-extra-val" style={{ color: uvInfo.c }}>{w.uv || 3}</div>
            <div className="wc-extra-sub">{uvInfo.l}</div>
            <div className="wc-bar-track"><div className="wc-bar-fill" style={{ width: `${Math.min(100, (w.uv || 3) / 11 * 100)}%`, background: uvInfo.c }}></div></div>
          </div>
          <div className="wc-extra">
            <div className="wc-extra-title">💨 {t.weatherStrip.windTitle}</div>
            <div className="wc-extra-val">{w.windSpeed}</div>
            <div className="wc-extra-sub">{windDir(w.windDir || 0)} · كم/س</div>
            <div className="wc-bar-track"><div className="wc-bar-fill" style={{ width: `${Math.min(100, w.windSpeed / 100 * 100)}%`, background: '#3b82f6' }}></div></div>
          </div>
        </div>

        <div className="wc-bottom">
          <div className="wc-bitem">
            <div className="wc-bitem-icon">🌡️</div>
            <div>
              <div className="wc-bitem-label">{t.weatherStrip.feelsLike}</div>
              <div className="wc-bitem-val">{fmt(w.feelsLike || w.temp)}</div>
            </div>
          </div>
          <div className="wc-bitem">
            <div className="wc-bitem-icon">🌅</div>
            <div>
              <div className="wc-bitem-label">{t.weatherStrip.sunTimes}</div>
              <div className="wc-bitem-val" style={{ fontSize: 12 }}>{w.sunrise || '5:45'} · {w.sunset || '18:52'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherAlerts() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('weatherAlertsDismissed') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('weatherCache');
      if (saved) {
        try { setWeather(JSON.parse(saved)); } catch {}
      }
    };
    load();
    const handler = (e) => { if (e.key === 'weatherCache') load(); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!weather) return null;

  const alerts = [];
  const temp = weather.temp;
  const humidity = weather.humidity;
  const wind = weather.windSpeed;
  const code = weather.code;

  if (temp >= 45) {
    alerts.push({ id: 'extreme-heat', icon: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)',
      title: t.weatherAlerts.extremeHeat,
      text: t.weatherAlerts.extremeHeatText });
  } else if (temp >= 38) {
    alerts.push({ id: 'high-heat', icon: '🌡️', color: '#f97316', bg: 'rgba(249,115,22,.08)', border: 'rgba(249,115,22,.2)',
      title: t.weatherAlerts.highHeat,
      text: t.weatherAlerts.highHeatText });
  } else if (temp >= 30) {
    alerts.push({ id: 'warm', icon: '☀️', color: '#f0b040', bg: 'rgba(240,176,64,.08)', border: 'rgba(240,176,64,.2)',
      title: t.weatherAlerts.warm,
      text: t.weatherAlerts.warmText });
  } else if (temp <= 0) {
    alerts.push({ id: 'freezing', icon: '🥶', color: '#3b82f6', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.2)',
      title: t.weatherAlerts.freezing,
      text: t.weatherAlerts.freezingText });
  } else if (temp <= 10) {
    alerts.push({ id: 'cold', icon: '❄️', color: '#06b6d4', bg: 'rgba(6,182,212,.08)', border: 'rgba(6,182,212,.2)',
      title: t.weatherAlerts.cold,
      text: t.weatherAlerts.coldText });
  }

  if (humidity >= 80) {
    alerts.push({ id: 'high-humidity', icon: '💧', color: '#8b5cf6', bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.2)',
      title: t.weatherAlerts.highHumidity,
      text: t.weatherAlerts.highHumidityText });
  } else if (humidity <= 25) {
    alerts.push({ id: 'low-humidity', icon: '🏜️', color: '#d97706', bg: 'rgba(217,119,6,.08)', border: 'rgba(217,119,6,.2)',
      title: t.weatherAlerts.lowHumidity,
      text: t.weatherAlerts.lowHumidityText });
  }

  if (wind >= 50) {
    alerts.push({ id: 'storm-wind', icon: '🌪️', color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)',
      title: t.weatherAlerts.stormWind,
      text: t.weatherAlerts.stormWindText });
  } else if (wind >= 30) {
    alerts.push({ id: 'strong-wind', icon: '💨', color: '#f97316', bg: 'rgba(249,115,22,.08)', border: 'rgba(249,115,22,.2)',
      title: t.weatherAlerts.strongWind,
      text: t.weatherAlerts.strongWindText });
  }

  if ([61, 63, 65, 80, 81, 82, 95, 96].includes(code)) {
    alerts.push({ id: 'rain', icon: '🌧️', color: '#3b82f6', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.2)',
      title: t.weatherAlerts.rain,
      text: t.weatherAlerts.rainText });
  }

  if ([95, 96].includes(code)) {
    alerts.push({ id: 'thunder', icon: '⛈️', color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)',
      title: t.weatherAlerts.thunder,
      text: t.weatherAlerts.thunderText });
  }

  if ([71, 73, 75].includes(code)) {
    alerts.push({ id: 'snow', icon: '❄️', color: '#06b6d4', bg: 'rgba(6,182,212,.08)', border: 'rgba(6,182,212,.2)',
      title: t.weatherAlerts.snow,
      text: t.weatherAlerts.snowText });
  }

  if (temp >= 20 && temp <= 28 && humidity >= 40 && humidity <= 60 && wind < 20 && [0, 1, 2].includes(code)) {
    alerts.push({ id: 'nice-weather', icon: '🌤️', color: '#22c55e', bg: 'rgba(34,197,94,.08)', border: 'rgba(34,197,94,.2)',
      title: t.weatherAlerts.niceWeather,
      text: t.weatherAlerts.niceWeatherText });
  }

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  const dismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('weatherAlertsDismissed', JSON.stringify(newDismissed));
  };

  return (
    <div style={{ padding: '0 16px', marginBottom: 12 }}>
      {visibleAlerts.map(alert => (
        <div key={alert.id} style={{
          background: alert.bg, border: `1px solid ${alert.border}`,
          borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{alert.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: alert.color, marginBottom: 3 }}>{alert.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{alert.text}</div>
          </div>
          <button onClick={() => dismiss(alert.id)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer',
            fontSize: 14, padding: 2, flexShrink: 0,
          }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function RadioStrip() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleToggle = useCallback(() => {
    if (playing) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src'); audioRef.current.load(); audioRef.current = null; }
      setPlaying(false);
    } else {
      const audio = new Audio();
      audio.type = 'audio/mpeg';
      audio.src = RADIO_URL;
      audio.volume = 0.8;
      audio.oncanplay = () => { audio.play().catch(() => {}); };
      audio.onplay = () => setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => { setPlaying(false); audioRef.current = null; };
      audioRef.current = audio;
      audio.load();
      setPlaying(true);
    }
  }, [playing]);

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  return (
    <div className="radio-strip">
      <div className="radio-icon">📻</div>
      <div className="radio-info">
        <div className="radio-name">{playing ? t.radio.live : t.radio.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
          <span className="radio-freq">91.5 MHz</span>
          {playing && <span className="radio-live"><span className="live-dot" />{t.radio.liveLabel}</span>}
        </div>
      </div>
      <button className="radio-play" onClick={handleToggle} aria-label={playing ? t.radio.stop : t.radio.play}>
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
    </div>
  );
}

function DailyCard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('hadith');
  const [speaking, setSpeaking] = useState(false);
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const hadith = HADITHS[dayIdx % HADITHS.length];
  const wisdom = WISDOMS[dayIdx % WISDOMS.length];
  const item = tab === 'hadith' ? hadith : wisdom;

  const handleSpeak = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    speakArabic(item.text + '. ' + item.source, () => setSpeaking(false));
  };

  return (
    <div className="daily">
      <div className="daily-head">
        <div className="daily-title">{t.dailyCard?.hadithTitle || 'حديث اليوم'}</div>
        <div className="tabs">
          <button className={`tab${tab === 'hadith' ? ' on-h' : ''}`} onClick={() => setTab('hadith')}>{t.home.hadithTab}</button>
          <button className={`tab${tab === 'wisdom' ? ' on-w' : ''}`} onClick={() => setTab('wisdom')}>{t.home.wisdomTab}</button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          <div className="quote-box">
            <div className="quote-mark">{'\u201C'}</div>
            <div className="quote-text">{item.text}</div>
            <div className="quote-src">{item.source}</div>
          </div>
          <div className="btns">
            <button className={`btn btn-listen${speaking ? ' on' : ''}`} onClick={handleSpeak}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />{speaking && <><path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" /></>}</svg>
              {speaking ? t.home.speakingBtn : t.home.listenBtn}
            </button>
            <Link to="/daily" className="btn btn-det">
              {t.home.detailsBtn}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DailyQuiz() {
  const { t } = useTranslation();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyQuestions = useMemo(() => {
    const shuffled = [...quizQuestions];
    let seed = dayOfYear;
    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  }, [dayOfYear]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = dailyQuestions[currentIdx];

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct_index) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < dailyQuestions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  const diffColor = q?.difficulty === 'easy' ? 'rgba(0,200,150,.15)' : q?.difficulty === 'medium' ? 'rgba(240,176,64,.15)' : 'rgba(239,68,68,.15)';
  const diffLabel = q?.difficulty === 'easy' ? t.dailyQuiz.easy : q?.difficulty === 'medium' ? t.dailyQuiz.medium : t.dailyQuiz.hard;
  const diffText = q?.difficulty === 'easy' ? '#00c896' : q?.difficulty === 'medium' ? '#f0b040' : '#ef4444';

  return (
    <div className="daily">
      <div className="daily-head">
        <div className="daily-title">{t.dailyQuiz.title}</div>
        <Link to="/quiz" className="btn btn-det" style={{ fontSize: 11, padding: '6px 12px' }}>
          {t.dailyQuiz.fullTest}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
      </div>

      {finished ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{score === dailyQuestions.length ? '🏆' : score >= 2 ? '🌟' : '📖'}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{score}/{dailyQuestions.length}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
            {score === dailyQuestions.length ? (t.dailyQuiz?.perfect || 'ممتاز! إجابة صحيحة على جميع الأسئلة!') : score >= 2 ? (t.dailyQuiz?.great || 'أحسنت! أداء رائع!') : (t.dailyQuiz?.keepGoing || 'واصل التعلم!')}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={restart} className="btn btn-listen" style={{ fontSize: 12 }}>{t.dailyQuiz?.retry || 'أعد المحاولة'}</button>
            <Link to="/quiz" className="btn btn-det" style={{ fontSize: 12 }}>{t.dailyQuiz?.fullTestLink || 'اختبار كامل ←'}</Link>
          </div>
        </div>
      ) : q ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: diffText, background: diffColor, padding: '3px 10px', borderRadius: 8, border: `1px solid ${diffText}30` }}>{diffLabel}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{currentIdx + 1} {t.dailyQuiz?.of || 'من'} {dailyQuestions.length}</span>
          </div>

          <div style={{ fontFamily: "var(--font-amiri)", fontSize: '1.05rem', lineHeight: 2, color: '#fff', textAlign: 'right', marginBottom: 14, fontWeight: 600 }}>
            {q.question_ar}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options_ar.map((opt, idx) => {
              let bg = 'rgba(255,255,255,.04)';
              let border = 'rgba(255,255,255,.1)';
              let textColor = 'rgba(255,255,255,.85)';
              if (answered) {
                if (idx === q.correct_index) { bg = 'rgba(0,200,150,.12)'; border = '#00c896'; textColor = '#00c896'; }
                else if (idx === selected && idx !== q.correct_index) { bg = 'rgba(239,68,68,.12)'; border = '#ef4444'; textColor = '#ef4444'; }
                else { bg = 'rgba(255,255,255,.02)'; border = 'rgba(255,255,255,.05)'; textColor = 'rgba(255,255,255,.25)'; }
              }
              return (
                <motion.button key={idx} whileTap={!answered ? { scale: 0.97 } : {}} onClick={() => handleAnswer(idx)}
                  style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, textAlign: 'right', padding: '12px 14px', borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
              {selected === q.correct_index ? (
                <div style={{ background: 'rgba(0,200,150,.08)', border: '1px solid rgba(0,200,150,.2)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#00c896', fontWeight: 600, marginBottom: 10 }}>
                  ✅ {t.dailyQuiz?.correctAnswer || 'إجابة صحيحة!'}
                </div>
              ) : (
                <div style={{ background: 'rgba(240,176,64,.08)', border: '1px solid rgba(240,176,64,.2)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f0b040', fontWeight: 600, marginBottom: 10 }}>
                  💡 {q.explanation_ar}
                </div>
              )}
              <button onClick={handleNext} className="btn btn-listen" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13 }}>
                {currentIdx < dailyQuestions.length - 1 ? (t.dailyQuiz?.nextQuestion || 'السؤال التالي') : (t.dailyQuiz?.showResult || 'عرض النتيجة')}
              </button>
            </motion.div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function QuickAzkarItem({ azkar }) {
  const [count, setCount] = useState(0);
  const done = count >= azkar.total;
  const pct = Math.min((count / azkar.total) * 100, 100);

  const tap = () => {
    if (done) return;
    setCount(c => c + 1);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  return (
    <motion.div className={`az-item${done ? ' done' : ''}`} onClick={tap} whileTap={{ scale: 0.97 }} layout>
      <div style={{ flex: 1 }}>
        <div className="az-text">{azkar.text}</div>
        <div className="az-prog"><div className="az-fill" style={{ width: `${pct}%` }} /></div>
      </div>
      <motion.div
        className={`az-count${done ? ' done' : ' pend'}`}
        key={done ? 'done' : count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {done ? '✓' : toArabicNum(azkar.total - count)}
      </motion.div>
    </motion.div>
  );
}

function ReminderBanner() {
  const { t } = useTranslation();
  const [nextReminder, setNextReminder] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const REMINDER_TYPES = [
      { key: 'dhikr', emoji: '📿', label: t.reminder?.dhikr || 'ذكر', color: '#00c896' },
      { key: 'hadith', emoji: '📖', label: t.reminder?.hadith || 'حديث', color: '#8b5cf6' },
      { key: 'history', emoji: '📅', label: t.reminder?.history || 'مثل هذا اليوم', color: '#3b82f6' },
      { key: 'deed', emoji: '⭐', label: t.reminder?.deed || 'أفضل الأعمال', color: '#f0b040' },
      { key: 'behavior', emoji: '🕌', label: t.reminder?.behavior || 'سلوك المسلم', color: '#ec4899' },
    ];

    const enabled = localStorage.getItem('hourlyOverlayEnabled') !== 'false';
    if (!enabled) return;

    const intervalMin = parseInt(localStorage.getItem('hourlyOverlayInterval') || '30');
    let nextTime = Date.now() + intervalMin * 60 * 1000;

    const update = () => {
      const remaining = Math.max(0, nextTime - Date.now());
      if (remaining <= 0) {
        nextTime = Date.now() + intervalMin * 60 * 1000;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);

      const pl = JSON.parse(localStorage.getItem('reminderPlaylist') || '["dhikr","hadith","history","deed","behavior"]');
      const typeKey = pl[Math.floor(Math.random() * pl.length)] || 'dhikr';
      const type = REMINDER_TYPES.find(t => t.key === typeKey) || REMINDER_TYPES[0];
      setNextReminder(type);
      setPlaylist(pl.map(k => REMINDER_TYPES.find(t => t.key === k)).filter(Boolean));
    };

    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!nextReminder) return null;

  return (
    <div style={{
      margin: '16px 0',
      background: 'linear-gradient(135deg, rgba(139,92,246,.08), rgba(59,130,246,.05))',
      border: '1px solid rgba(139,92,246,.15)',
      borderRadius: 16,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${nextReminder.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}>
          {nextReminder.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.reminder?.nextIn || 'التالي خلال'} {countdown}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{t.reminder?.alert || 'تنبيه:'} {nextReminder.label}</div>
        </div>
        <Link to="/reminders" style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,.06)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', textDecoration: 'none', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </div>
      {playlist.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {playlist.map((item, i) => (
            <div key={i} style={{
              padding: '4px 10px', borderRadius: 8,
              background: `${item.color}12`, border: `1px solid ${item.color}25`,
              fontSize: 10, fontWeight: 700, color: item.color,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {item.emoji} {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [notificationsPaused, setNotificationsPaused] = useState(() => localStorage.getItem('notificationsPaused') === 'true');
  const [takbeerActive, setTakbeerActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSections = useMemo(() => {
    return SECTIONS.filter(s => {
      const matchSearch = !searchQuery || s.titleAr.includes(searchQuery);
      if (activeFilter === 'all') return matchSearch;
      return matchSearch && s.category === activeFilter;
    });
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    const handler = (e) => setNotificationsPaused(e.detail.paused);
    window.addEventListener('notificationsPausedChanged', handler);
    return () => window.removeEventListener('notificationsPausedChanged', handler);
  }, []);

  const toggleNotifications = () => {
    const newVal = !notificationsPaused;
    setNotificationsPaused(newVal);
    localStorage.setItem('notificationsPaused', newVal.toString());
    window.dispatchEvent(new CustomEvent('notificationsPausedChanged', { detail: { paused: newVal } }));
  };

  const toggleTakbeer = () => {
    if (takbeerActive) {
      stopTakbeer();
      setTakbeerActive(false);
    } else {
      playTakbeer(true);
      setTakbeerActive(true);
    }
  };

  useEffect(() => {
    return () => { stopTakbeer(); };
  }, []);

  return (
    <>
      <style>{homeCss}</style>
      <div className="h-wrap">
        <div className="hero">
          <div className="hero-top">
            <HijriDate />
            <AnalogClock />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={toggleTakbeer} title={takbeerActive ? 'إيقاف تكبيرات العيد' : 'تشغيل تكبيرات العيد'}
                style={{ width: 38, height: 38, background: takbeerActive ? 'rgba(240,176,64,.15)' : 'rgba(240,176,64,.08)', border: `1px solid ${takbeerActive ? 'rgba(240,176,64,.3)' : 'rgba(240,176,64,.15)'}`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all .3s', animation: takbeerActive ? 'pulse 2s ease infinite' : 'none' }}>
                <span style={{ fontSize: 18 }}>🕌</span>
              </button>
              <button onClick={toggleNotifications} title={notificationsPaused ? 'تفعيل التنبيهات' : 'إيقاف التنبيهات'}
                style={{ width: 38, height: 38, background: notificationsPaused ? 'rgba(239,68,68,.12)' : 'rgba(0,200,150,.12)', border: `1px solid ${notificationsPaused ? 'rgba(239,68,68,.2)' : 'rgba(0,200,150,.2)'}`, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all .3s' }}>
                {notificationsPaused ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              </button>
              <Link to="/settings" className="settings-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </Link>
            </div>
          </div>
          <PrayerWidget />
          <QuranPlayer />
          <HeroHadithBar />
        </div>

        <WeatherStrip />

        <WeatherAlerts />

        <ReminderBanner />

        <div className="content">
          <OccasionsSection />

          <HijriBirthDate />

          <div className="sec-label">{t.homeSections?.azkarVoice || 'أذكار بالصوت'}</div>
          <AzkarAudioPlayer />

          <div className="sec-label">{t.homeSections?.sections || 'الأقسام'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="ابحث عن ميزة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
            {[{ key: 'all', label: 'الكل' }, { key: 'prayer', label: 'عبادات' }, { key: 'quran', label: 'قرآن' }, { key: 'halal', label: 'حلال' }, { key: 'more', label: 'المزيد' }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${activeFilter === tab.key ? 'rgba(0,200,150,.15)' : 'rgba(255,255,255,.06)'}`, background: activeFilter === tab.key ? 'rgba(0,200,150,.08)' : 'rgba(255,255,255,.04)', color: activeFilter === tab.key ? '#00c896' : 'rgba(255,255,255,.35)', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid">
            {filteredSections.map((s) => (
              <Link key={s.path} to={s.path} className="card">
                <div className="card-bar" style={{ background: s.color }} />
                <div className="card-icon" style={{ background: s.bg, width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 9px' }}>
                  <div style={{ width: 26, height: 26 }}>{s.icon}</div>
                </div>
                <div className="card-title">{s.titleAr}</div>
                {s.badge && (
                  <span style={{ position: 'absolute', top: 6, left: 6, padding: '2px 7px', borderRadius: 10, fontSize: 8, fontWeight: 800,
                    background: s.badge === 'جديد' ? 'rgba(0,200,150,.15)' : s.badge === 'محدث' ? 'rgba(96,165,250,.15)' : 'rgba(255,107,138,.15)',
                    color: s.badge === 'جديد' ? '#00c896' : s.badge === 'محدث' ? '#60a5fa' : '#ff6b8a' }}>
                    {s.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <RadioStrip />

          <div className="sec-label">{t.homeSections?.dailyKnowledge || 'كل يوم معلومة'}</div>
          <DailyCard />

          <div className="sec-label">{t.homeSections?.quizYourself || 'اختبر نفسك'}</div>
          <DailyQuiz />

          <div className="sec-label">{t.homeSections?.quickAzkar || 'أذكار سريعة'}</div>
          <div className="azkar-list">
            {QUICK_AZKAR.map((a, i) => (
              <QuickAzkarItem key={i} azkar={a} />
            ))}
          </div>

          <AzkarSection />

          <SalawatWaAdiaa />

          <Link to="/wudu" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'linear-gradient(135deg, rgba(0,200,150,.08), rgba(59,130,246,.06))', border: '1px solid rgba(0,200,150,.15)', borderRadius: 16, marginBottom: 16, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,200,150,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💧</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.wuduGuide?.title || 'دليل الوضوء'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.wuduGuide?.subtitle || 'خطوات الوضوء الصحي بالصور والشرح'}</div>
            </div>
            <svg style={{ marginInlineStart: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </Link>

          <div className="sec-label">🕌 التقويم والأعياد</div>
          <PrayerCalendar />
          <IslamicHolidays />
        </div>
      </div>

      <div className="navbar">
        <Link to="/" className="ni on">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="#00c896"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg>
          <span className="ni-label" style={{ color: '#00c896' }}>{t.nav?.home || 'الرئيسية'}</span>
          <div className="ni-dot" />
        </Link>
        <Link to="/morning" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="rgba(255,255,255,.3)" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          <span className="ni-label">{t.nav?.morning || 'الصباح'}</span>
        </Link>
        <Link to="/evening" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          <span className="ni-label">{t.nav?.evening || 'المساء'}</span>
        </Link>
        <Link to="/quran" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><path d="M6 2v20l6-4 6 4V2z" /><path d="M12 2v16" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" fill="none" /></svg>
          <span className="ni-label">{t.nav?.quran || 'القرآن'}</span>
        </Link>
        <Link to="/tasbih" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><circle cx="12" cy="4" r="3" /><circle cx="12" cy="12" r="3" /><circle cx="12" cy="20" r="3" /><circle cx="6" cy="8" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="6" cy="16" r="2.5" /><circle cx="18" cy="16" r="2.5" /></svg>
          <span className="ni-label">{t.nav?.tasbih || 'التسبيح'}</span>
        </Link>
        <Link to="/radio" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="13" r="2.5"/><path d="M7 6V4.5A1.5 1.5 0 018.5 3h7A1.5 1.5 0 0117 4.5V6" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" fill="none"/></svg>
          <span className="ni-label">الراديو</span>
        </Link>
        <Link to="/settings" className="ni">
          <svg className="ni-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          <span className="ni-label">الإعدادات</span>
        </Link>
      </div>
    </>
  );
}
