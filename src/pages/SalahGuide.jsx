import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { speakArabic, stopSpeaking } from '../utils/sound';

const PRAYERS_DATA = {
  fajr: {
    name: 'صلاة الفجر', icon: '🌅', color: '#f0b040',
    rakaat: 2, time: 'من الفجر الصادق إلى شروق الشمس',
    type: 'فرض عين',
    fadl: 'قال رسول الله ﷺ: «من صلى الفجر في جماعة فكأنما قام الليل كله» — رواه مسلم\n\nوصلاة الفجر شاهدة — أي يشهدها ملائكة الليل وملائكة النهار.',
    arkan: ['النية', 'تكبيرة الإحرام', 'قراءة الفاتحة', 'الركوع', 'الرفع من الركوع', 'السجدتان', 'الجلسة بين السجدتين', 'التشهد الأخير', 'الصلاة على النبي ﷺ', 'التسليم'],
    steps: [
      { num: 1, name: 'النية والاستعداد', type: 'فرض', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'قف مستقبلاً القبلة، منتصب القامة، وانوِ في قلبك أداء صلاة الفجر ركعتين فرضاً لله تعالى. النية في القلب ولا يلزم التلفظ بها.', arabic: 'أُصَلِّي فَرْضَ الفَجْرِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى', trans: 'النية في القلب — مستقبل القبلة', tip: 'تأكد من طهارتك (الوضوء) وستر العورة واستقبال القبلة قبل البدء.', audio: 'استقبل القبلة وانوِ صلاة الفجر ركعتين فرضاً لله تعالى' },
      { num: 2, name: 'تكبيرة الإحرام', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'ارفع يديك حذو منكبيك أو أذنيك، وقل "اللَّهُ أَكْبَرُ" بنية الدخول في الصلاة. ثم ضع يدك اليمنى على اليسرى على صدرك.', arabic: 'اللَّهُ أَكْبَرُ', trans: 'الله أكبر — ورفع اليدين حذو المنكبين', tip: 'هذه التكبيرة ركن من أركان الصلاة — لا تصح الصلاة بدونها.', audio: 'ارفع يديك وقل: اللَّهُ أَكْبَرُ' },
      { num: 3, name: 'دعاء الاستفتاح', type: 'سنة', typeColor: '#a78bfa', typeBg: 'rgba(139,92,246,.12)', desc: 'بعد تكبيرة الإحرام قل دعاء الاستفتاح سراً، ثم قل أعوذ بالله من الشيطان الرجيم، ثم البسملة.', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ', trans: 'يقال سراً بعد تكبيرة الإحرام', tip: 'دعاء الاستفتاح سنة مستحبة وليس فرضاً — يقال مرة واحدة في أول الصلاة فقط.', audio: 'قل سراً: سبحانك اللهم وبحمدك، وتبارك اسمك، وتعالى جدك، ولا إله غيرك' },
      { num: 4, name: 'قراءة الفاتحة', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'اقرأ سورة الفاتحة في كل ركعة — وهي ركن لا تصح الصلاة بدونها. وبعدها قل "آمين" بصوت خفيف.', arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\nالرَّحْمَنِ الرَّحِيمِ\nمَالِكِ يَوْمِ الدِّينِ\nإِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\nاهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ\nصِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', trans: 'آمين — رواه البخاري ومسلم', tip: 'تُقرأ الفاتحة في كل ركعة، وفي الفجر يُجهر بها في الركعتين.', audio: 'اقرأ سورة الفاتحة: بسم الله الرحمن الرحيم، الحمد لله رب العالمين' },
      { num: 5, name: 'قراءة سورة بعد الفاتحة', type: 'سنة', typeColor: '#a78bfa', typeBg: 'rgba(139,92,246,.12)', desc: 'اقرأ ما تيسّر من القرآن — يستحب في صلاة الفجر إطالة القراءة.', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', trans: 'سورة الإخلاص — مثال للقراءة في الركعة الثانية', tip: 'في الركعة الأولى اقرأ سورة أطول من الثانية.', audio: 'اقرأ ما تيسر من القرآن بعد الفاتحة' },
      { num: 6, name: 'الركوع', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'كبّر "اللَّهُ أَكْبَرُ" وانحنِ حتى تكون يداك على ركبتيك، وظهرك مستقيماً أفقياً. سبّح ثلاثاً.', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', trans: 'يقال ثلاث مرات — والأفضل خمساً أو سبعاً', tip: 'الطمأنينة في الركوع واجبة — امكث مطمئناً حتى تستقر جوارحك.', audio: 'كبّر وانحنِ وقل: سبحان ربي العظيم' },
      { num: 7, name: 'الرفع من الركوع', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'ارفع رأسك وقل "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ"، وعند الاستواء قل "رَبَّنَا وَلَكَ الْحَمْدُ".', arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا وَلَكَ الْحَمْدُ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ', trans: 'يقال عند الرفع ثم عند الاستواء', tip: 'الاعتدال التام بعد الركوع ركن من أركان الصلاة.', audio: 'ارفع رأسك وقل: سمع الله لمن حمده، ربنا ولك الحمد' },
      { num: 8, name: 'السجود الأول', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'كبّر وانزل ساجداً على سبعة أعظم: الجبهة والأنف، والكفّان، والركبتان، وأصابع القدمين. سبّح ثلاثاً.', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', trans: 'يقال ثلاث مرات — والأفضل أكثر', tip: 'السجود على سبعة أعظم شرط.', audio: 'كبّر واسجد وقل: سبحان ربي الأعلى' },
      { num: 9, name: 'الجلسة بين السجدتين', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'ارفع رأسك مكبّراً، واجلس على قدمك اليسرى وانصب اليمنى، وقل دعاء الجلسة.', arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي', trans: 'يقال مرة أو أكثر — اطلب المغفرة', tip: 'الطمأنينة في الجلسة بين السجدتين واجبة.', audio: 'ارفع رأسك وقل: رب اغفر لي' },
      { num: 10, name: 'السجود الثاني', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'كبّر وانزل ساجداً مرة أخرى نفس هيئة السجود الأول. سبّح ثلاثاً.', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', trans: 'يقال ثلاث مرات كالسجدة الأولى', tip: 'هذه السجدة تُكمل الركعة الأولى.', audio: 'اسجد مرة أخرى وقل: سبحان ربي الأعلى' },
      { num: 11, name: 'الركعة الثانية', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'قم للركعة الثانية مكبّراً، واقرأ الفاتحة وسورة، ثم اركع واسجد كما فعلت في الأولى.', arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ...', trans: 'الركعة الثانية مثل الأولى تماماً', tip: 'في الفجر يجهر الإمام بالقراءة في الركعتين.', audio: 'قم للركعة الثانية مكبراً، واقرأ الفاتحة وسورة' },
      { num: 12, name: 'التشهد الأخير', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'بعد السجدة الثانية اجلس متورّكاً واقرأ التشهد.', arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', trans: 'يقال في الجلسة الأخيرة مع رفع السبابة اليمنى', tip: 'أثناء التشهد ارفع سبابتك اليمنى عند قول "إلا الله".', audio: 'اجلس وقل: التحيات لله والصلوات والطيبات' },
      { num: 13, name: 'الصلاة الإبراهيمية', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'بعد التشهد صلّ على النبي ﷺ بالصلاة الإبراهيمية.', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ\nاللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', trans: 'الصلاة الإبراهيمية — ركن من أركان الصلاة', tip: 'هذا الدعاء يقال في التشهد الأخير فقط.', audio: 'قل: اللهم صل على محمد وعلى آل محمد' },
      { num: 14, name: 'التسليم', type: 'ركن', typeColor: '#f87171', typeBg: 'rgba(239,68,68,.12)', desc: 'سلّم يميناً وشمالاً، قائلاً "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ" في كل جهة.', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ\nالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', trans: 'تسليمة يمنى وتسليمة يسرى — وبها تنتهي الصلاة', tip: 'يستحب بعد الصلاة الاستغفار ثلاثاً.', audio: 'سلّم يميناً ويساراً: السلام عليكم ورحمة الله' },
    ]
  }
};

['dhuhr', 'asr', 'isha'].forEach(key => {
  const names = { dhuhr: 'صلاة الظهر', asr: 'صلاة العصر', isha: 'صلاة العشاء' };
  const icons = { dhuhr: '☀️', asr: '🌤️', isha: '🌙' };
  const colors = { dhuhr: '#00c896', asr: '#60a5fa', isha: '#a78bfa' };
  const times = { dhuhr: 'من زوال الشمس إلى العصر', asr: 'من العصر إلى الغروب', isha: 'من المغرب إلى منتصف الليل' };
  const fadls = {
    dhuhr: 'قال ﷺ: «من حافظ على أربع ركعات قبل الظهر وأربع بعدها حرّمه الله على النار» — رواه أبو داود',
    asr: 'قال ﷺ: «من ترك صلاة العصر فقد حبط عمله» — رواه البخاري',
    isha: 'قال ﷺ: «لو يعلم الناس ما في النداء والصف الأول ثم لم يجدوا إلا أن يستهموا عليه لاستهموا» — متفق عليه'
  };
  PRAYERS_DATA[key] = {
    ...PRAYERS_DATA.fajr,
    name: names[key], icon: icons[key], color: colors[key],
    rakaat: 4, time: times[key], fadl: fadls[key],
    steps: PRAYERS_DATA.fajr.steps.map(s => ({
      ...s,
      arabic: s.arabic.replace('الفَجْرِ رَكْعَتَيْنِ', key === 'dhuhr' ? 'الظُّهْرِ أَرْبَعَ رَكَعَاتٍ' : key === 'asr' ? 'الْعَصْرِ أَرْبَعَ رَكَعَاتٍ' : 'الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ')
    }))
  };
});
PRAYERS_DATA.maghrib = { ...PRAYERS_DATA.fajr, name: 'صلاة المغرب', icon: '🌇', color: '#fb923c', rakaat: 3, time: 'من غروب الشمس إلى اختفاء الشفق', fadl: 'صلاة المغرب أولى الصلوات الجهرية الليلية.' };

const STEPS_IMG_MAP = {
  'النية والاستعداد': '/salah-fajr/01-qibla.png',
  'تكبيرة الإحرام': '/salah-fajr/03-takbeer-hands.png',
  'دعاء الاستفتاح': '/salah-fajr/13-hands-chest.png',
  'قراءة الفاتحة': '/salah-fajr/15-reading.png',
  'قراءة سورة بعد الفاتحة': '/salah-fajr/17-reading-chest.png',
  'الركوع': '/salah-fajr/06-rukoo-full.png',
  'الرفع من الركوع': '/salah-fajr/step-rising-from-rukoo.png',
  'السجود الأول': '/salah-fajr/08-sujood-1.png',
  'الجلسة بين السجدتين': '/salah-fajr/05-sitting-tashahhud.png',
  'السجود الثاني': '/salah-fajr/09-sujood-2.png',
  'الركعة الثانية': '/salah-fajr/12-standing-close.png',
  'التشهد الأخير': '/salah-fajr/05-sitting-tashahhud.png',
  'الصلاة الإبراهيمية': '/salah-fajr/05-sitting-tashahhud.png',
  'التسليم': '/salah-fajr/overview-4steps.png',
};

export default function SalahGuide() {
  const [screen, setScreen] = useState('home');
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState('theory');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { stopSpeaking(); setIsSpeaking(false); }, [screen, currentStep, mode]);

  const openPrayer = (key) => { setCurrentPrayer(key); setCurrentStep(0); setMode('theory'); setScreen('detail'); };
  const goBack = () => { setScreen('home'); stopSpeaking(); setIsSpeaking(false); };

  const renderStep = useCallback(() => {
    const data = PRAYERS_DATA[currentPrayer];
    if (!data) return null;
    const s = data.steps[currentStep];
    const total = data.steps.length;
    const pct = ((currentStep + 1) / total) * 100;

    return (
      <>
        <div ref={scrollRef} style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
          <div style={{ background: '#151030', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.typeBg, color: s.typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
              <div style={{ flex: 1, marginRight: 10, marginLeft: 10, fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.name}</div>
              <div style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.typeBg, color: s.typeColor, border: `1px solid ${s.typeColor}44` }}>{s.type}</div>
            </div>

            <div style={{ margin: '14px 16px', background: 'linear-gradient(135deg,rgba(139,92,246,.08),rgba(0,200,150,.05))', border: '1.5px dashed rgba(255,255,255,.12)', borderRadius: 14, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,.5)', overflow: 'hidden' }}>
              {STEPS_IMG_MAP[s.name] && STEPS_IMG_MAP[s.name].endsWith('.png') ? (
                <img src={STEPS_IMG_MAP[s.name]} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
              ) : (
                <>
                  <span style={{ fontSize: 48 }}>{STEPS_IMG_MAP[s.name] || '📸'}</span>
                  <span style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>{s.name}</span>
                </>
              )}
            </div>

            <div style={{ padding: '0 16px 14px' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', lineHeight: 1.75, marginBottom: 10 }}>{s.desc}</div>
              <div style={{ fontSize: 18, color: '#fff', lineHeight: 2.2, textAlign: 'center', padding: 12, background: 'rgba(255,255,255,.03)', borderRadius: 12, marginBottom: 6, fontFamily: "'Amiri Quran',serif", whiteSpace: 'pre-line' }}>{s.arabic}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textAlign: 'center', lineHeight: 1.5 }}>{s.trans}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(240,176,64,.06)', border: '1px solid rgba(240,176,64,.15)', borderRadius: 10, padding: '10px 12px', marginTop: 10 }}>
                <span style={{ fontSize: 15, color: '#f0b040', flexShrink: 0, marginTop: 1 }}>💡</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>{s.tip}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#151030', borderTop: '1px solid rgba(255,255,255,.06)', padding: '14px 16px', flexShrink: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{s.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>{currentStep + 1} / {total}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#00c896)', borderRadius: 4, transition: 'width .4s ease', width: `${pct}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setCurrentStep(p => Math.max(0, p - 1)); if (scrollRef.current) scrollRef.current.scrollTop = 0; }} disabled={currentStep === 0} style={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: 'rgba(255,255,255,.07)', color: currentStep === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: currentStep === 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}>‹ السابق</button>
            <button onClick={() => {
              if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return; }
              const d = PRAYERS_DATA[currentPrayer];
              if (!d) return;
              const step = d.steps[currentStep];
              speakArabic(step.audio, () => setIsSpeaking(false));
              setIsSpeaking(true);
            }} style={{ width: 44, height: 44, borderRadius: 12, background: isSpeaking ? '#00c896' : 'rgba(0,200,150,.1)', border: `1px solid ${isSpeaking ? '#00c896' : 'rgba(0,200,150,.2)'}`, color: isSpeaking ? '#fff' : '#00c896', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all .2s' }}>{isSpeaking ? '⏸' : '🔊'}</button>
            <button onClick={() => {
              if (currentStep < total - 1) { setCurrentStep(p => p + 1); if (scrollRef.current) scrollRef.current.scrollTop = 0; }
              else { setScreen('done'); }
            }} style={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(139,92,246,.3)' }}>
              {currentStep === total - 1 ? 'إنهاء ✓' : 'التالي ›'}
            </button>
          </div>
        </div>
      </>
    );
  }, [currentPrayer, currentStep, isSpeaking]);

  if (screen === 'done') {
    const data = PRAYERS_DATA[currentPrayer];
    return (
      <div style={{ minHeight: '100vh', background: '#0c0818', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>أحسنت! اكتملت {data?.name}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 24 }}>تقبّل الله صلاتك وجزاك خيراً</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', fontFamily: "'Amiri Quran',serif", lineHeight: 2, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16, marginBottom: 20 }}>«الصَّلَاةُ نُورٌ» — رواه مسلم</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 300 }}>
          <Link to="/" style={{ width: '100%', padding: 13, borderRadius: 14, background: '#8b5cf6', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>🏠 العودة للرئيسية</Link>
          <button onClick={() => { setCurrentStep(0); setMode('practical'); setScreen('detail'); }} style={{ width: '100%', padding: 13, borderRadius: 14, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>🔄 إعادة الصلاة</button>
        </div>
      </div>
    );
  }

  if (screen === 'detail' && currentPrayer) {
    const data = PRAYERS_DATA[currentPrayer];
    return (
      <div style={{ minHeight: '100vh', background: '#0c0818', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#151030', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>‹</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', flex: 1 }}>{data.name}</div>
          <div style={{ display: 'flex', background: '#0c0818', borderRadius: 10, padding: 3, gap: 2 }}>
            <button onClick={() => setMode('theory')} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: mode === 'theory' ? '#fff' : 'rgba(255,255,255,.4)', background: mode === 'theory' ? '#8b5cf6' : 'transparent', fontFamily: 'inherit' }}>نظري</button>
            <button onClick={() => { setMode('practical'); setCurrentStep(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: mode === 'practical' ? '#fff' : 'rgba(255,255,255,.4)', background: mode === 'practical' ? '#8b5cf6' : 'transparent', fontFamily: 'inherit' }}>عملي</button>
          </div>
        </div>

        {mode === 'theory' ? (
          <div ref={scrollRef} style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TheoryCard icon="📋" title="معلومات عامة"><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}><Badge type="فرض" /><Badge icon="⏰" text={`${data.rakaat} ركعات`} /><Badge icon="🕐" text={data.time} /></div><div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.8 }}>عدد الركعات: {data.rakaat} ركعات</div></TheoryCard>
              <TheoryCard icon="📜" title="فضل الصلاة"><div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{data.fadl}</div></TheoryCard>
              <TheoryCard icon="✅" title="شروط الصلاة"><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{['الوضوء', 'طهارة البدن والثوب', 'ستر العورة', 'استقبال القبلة', 'دخول الوقت', 'النية'].map((item, i) => <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}><span style={{ color: '#8b5cf6', fontSize: 16, flexShrink: 0 }}>•</span>{item}</li>)}</ul></TheoryCard>
              <TheoryCard icon="🔴" title="أركان الصلاة"><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{data.arkan.map((item, i) => <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}><span style={{ color: '#f87171', fontSize: 16, flexShrink: 0 }}>•</span>{item}</li>)}</ul></TheoryCard>
              <TheoryCard icon="🟣" title="سنن الصلاة"><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{['رفع اليدين عند تكبيرة الإحرام', 'وضع اليد اليمنى على اليسرى', 'دعاء الاستفتاح', 'قول آمين بعد الفاتحة', 'التسبيح في الركوع والسجود', 'التشهد الأول'].map((item, i) => <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}><span style={{ color: '#a78bfa', fontSize: 16, flexShrink: 0 }}>•</span>{item}</li>)}</ul></TheoryCard>
              <TheoryCard icon="🚫" title="مبطلات الصلاة"><ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>{['الحدث', 'الكلام العمد', 'الضحك القهقهة', 'الأكل والشرب', 'الانحراف عن القبلة', 'ترك ركن'].map((item, i) => <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}><span style={{ color: '#f87171', fontSize: 16, flexShrink: 0 }}>•</span>{item}</li>)}</ul></TheoryCard>
              <button onClick={() => { setMode('practical'); setCurrentStep(0); }} style={{ width: '100%', padding: 13, borderRadius: 14, background: '#8b5cf6', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>▶ ابدأ التطبيق العملي</button>
            </div>
          </div>
        ) : renderStep()}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c0818' }}>
      <div style={{ background: 'linear-gradient(165deg,#1c1040,#2d1b69 50%,#0c0818)', padding: '28px 20px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'radial-gradient(circle,rgba(139,92,246,.18),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 48, marginBottom: 12 }}>🕌</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>كيف تصلي</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>نظري وعملي · مع الصوت والخطوات التفصيلية</div>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(PRAYERS_DATA).map(([key, data]) => (
          <button key={key} onClick={() => openPrayer(key)} style={{ background: '#151030', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .2s', textAlign: 'right', width: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: `${data.color}18` }}>{data.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{data.name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{data.time}</div></div>
            <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0, background: `${data.color}18`, color: data.color, border: `1px solid ${data.color}33` }}>{data.rakaat} ركعات</div>
            <span style={{ color: 'rgba(255,255,255,.25)', fontSize: 18, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TheoryCard({ icon, title, children }) {
  return (
    <div style={{ background: '#151030', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><span>{icon}</span>{title}</div>
      {children}
    </div>
  );
}

function Badge({ type, icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171' }}>
      {icon && <span>{icon}</span>}{text || type}
    </span>
  );
}
