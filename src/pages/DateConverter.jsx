// src/pages/DateConverter.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function gregorianToHijri(gYear, gMonth, gDay) {
  try {
    const jd = Math.floor(365.25 * (gYear + 4716)) + Math.floor(30.6001 * (gMonth + 1)) + gDay - 1524.5;
    const l = Math.floor(jd - 1948439.5 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const lr = l - 10631 * n + 354;
    const j = Math.floor((10985 - lr) / 5316) * Math.floor((50 * lr) / 17719) + Math.floor(lr / 5670) * Math.floor((43 * lr) / 15238);
    const ld = lr - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hm = Math.floor((24 * ld) / 709);
    const hd = ld - Math.floor((709 * hm) / 24);
    const hy = 30 * n + j - 30;
    return { year: hy, month: hm, day: hd };
  } catch { return { year: 1447, month: 1, day: 1 }; }
}

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
    return { year: y - 4716 + (4 + n) / 1461 - (1 + lr3) / 11, month: m + 2 - 12 * lr3, day: d };
  } catch { return { year: 2026, month: 7, day: 1 }; }
}

const HIJRI_MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const GREG_MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const MONTH_PERSONALITIES = [
  { month: 1, name: 'الإمام أبو حنيفة', title: 'مؤسس المذهب الحنفي', desc: 'أحد أئمة الفقهاء السبعة، ولد سنة 80 هـ', icon: '📚' },
  { month: 2, name: 'الإمام مالك', title: 'مؤسس المذهب المالكي', desc: 'إمام دار الهجرة، ولد سنة 93 هـ', icon: '📖' },
  { month: 3, name: 'الإمام الشافعي', title: 'مؤسس المذهب الشافعي', desc: 'أبو محمد، ولد سنة 150 هـ', icon: '📝' },
  { month: 4, name: 'الإمام أحمد بن حنبل', title: 'مؤسس المذهب الحنبلي', desc: 'إمام أهل السنة، ولد سنة 164 هـ', icon: '📕' },
  { month: 5, name: 'ابن تيمية', title: 'شيخ الإسلام', desc: 'أحمد بن عبد الحليم، ولد سنة 661 هـ', icon: '🕌' },
  { month: 6, name: 'ابن القيم', title: 'شارح كتاب الله', desc: 'محمد بن أبي بكر، ولد سنة 691 هـ', icon: '✍️' },
  { month: 7, name: 'الإمام النووي', title: 'شارح صحيح مسلم', desc: 'يحيى بن شرف، ولد سنة 631 هـ', icon: '📚' },
  { month: 8, name: 'ابن رشد', title: 'الفيلسوف المسلم', desc: 'محمد بن أحمد، ولد سنة 520 هـ', icon: '🔬' },
  { month: 9, name: 'الإمام البخاري', title: 'صاحب أصح كتاب بعد القرآن', desc: 'محمد بن إسماعيل، ولد سنة 194 هـ', icon: '📖' },
  { month: 10, name: 'الإمام مسلم', title: 'صاحب صحيح مسلم', desc: 'مسلم بن الحجاج، ولد سنة 206 هـ', icon: '📘' },
  { month: 11, name: 'الإمام الترمذي', title: 'صاحب الجامع', desc: 'محمد بن عيسى، ولد سنة 209 هـ', icon: '📗' },
  { month: 12, name: 'ابن كثير', title: 'مفسر القرآن', desc: 'إسماعيل بن عمر، ولد سنة 701 هـ', icon: '📕' },
];

const MONTH_FACTS = [
  { month: 1, fact: 'أول الشهور الهجرية، فُتحت خيبر في هذا الشهر' },
  { month: 2, fact: 'شُهر غزوة بدر الكبرى (2 هـ)' },
  { month: 3, fact: 'شُهر غزوة أحد، وأُنزلت فيها آية الصبر' },
  { month: 4, fact: 'شُهر صلح الحديبية (6 هـ)' },
  { month: 5, fact: 'شُهر غزوة خيبر (7 هـ)' },
  { month: 6, fact: 'شُهر غزوة تبوك (9 هـ)' },
  { month: 7, fact: 'شُهر الإسراء والمعراج (27 رجب)' },
  { month: 8, fact: 'شُهر ميلاد النبي ﷺ وليلة النصف من شعبان' },
  { month: 9, fact: 'شهر رمضان، نزول القرآن، والليلة القدر فيه' },
  { month: 10, fact: 'عيد الفطر، وفتح مكة (8 هـ)' },
  { month: 11, fact: 'شُهر حجة الوداع (10 هـ)' },
  { month: 12, fact: 'شهر الحج، يوم عرفة، وعيد الأضحى' },
];

const HIJRI_EVENTS = [
  { month: 1, day: 1, label: 'رأس السنة الهجرية', icon: '🌙' },
  { month: 1, day: 10, label: 'يوم عاشوراء', icon: '🤲' },
  { month: 3, day: 12, label: 'المولد النبوي (تقريبي)', icon: '🕌' },
  { month: 7, day: 27, label: 'الإسراء والمعراج (تقريبي)', icon: '✨' },
  { month: 8, day: 15, label: 'ليلة النصف من شعبان', icon: '🌟' },
  { month: 9, day: 1, label: 'بداية رمضان', icon: '🌙' },
  { month: 9, day: 27, label: 'ليلة القدر (تقريبي)', icon: '⭐' },
  { month: 10, day: 1, label: 'عيد الفطر', icon: '🎉' },
  { month: 12, day: 9, label: 'يوم عرفة', icon: '🕋' },
  { month: 12, day: 10, label: 'عيد الأضحى', icon: '🐑' },
];

function toArabicNum(n) { return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }
function getDayName(y, m, d) { return DAYS_AR[new Date(y, m - 1, d).getDay()]; }
function isToday(y, m, d) {
  const n = new Date();
  return n.getFullYear() === y && n.getMonth() + 1 === m && n.getDate() === d;
}

function calculateAge(bY, bM, bD, isHijri) {
  const now = new Date();
  const t = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  let ty, tm, td;
  if (isHijri) {
    const h = gregorianToHijri(t.year, t.month, t.day);
    ty = h.year; tm = h.month; td = h.day;
  } else { ty = t.year; tm = t.month; td = t.day; }
  let years = ty - bY, months = tm - bM, days = td - bD;
  if (days < 0) { months--; days += 30; }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

function getNextEvent(hijri) {
  for (const ev of HIJRI_EVENTS) {
    if (ev.month > hijri.month || (ev.month === hijri.month && ev.day >= hijri.day)) return ev;
  }
  return HIJRI_EVENTS[0];
}

function getDaysUntilEvent(hijri, event) {
  const toD = (m, d) => (m - 1) * 30 + d;
  const diff = toD(event.month, event.day) - toD(hijri.month, hijri.day);
  return diff > 0 ? diff : diff + 360;
}

function getMoonPhase(day) {
  const p = day % 30;
  if (p === 0 || p === 29) return { icon: '🌑', name: 'محاق' };
  if (p <= 3) return { icon: '🌒', name: 'هلال أول الشهر' };
  if (p <= 7) return { icon: '🌓', name: 'تربيع أول' };
  if (p <= 12) return { icon: '🌔', name: 'أحدب متزايد' };
  if (p === 13 || p === 14) return { icon: '🌕', name: 'بدر تام' };
  if (p <= 18) return { icon: '🌖', name: 'أحدب متناقص' };
  if (p <= 23) return { icon: '🌗', name: 'تربيع آخر' };
  return { icon: '🌘', name: 'هلال آخر الشهر' };
}

const C = {
  gold: '#f0b040', green: '#00c896', purple: '#8b5cf6', pink: '#ec4899',
  bg: '#0c0818', card: '#13102a', cardBorder: 'rgba(255,255,255,0.04)',
};

export default function DateConverter() {
  const now = new Date();
  const todayHijri = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const [mode, setMode] = useState('toHijri');
  const [gYear, setGYear] = useState(now.getFullYear());
  const [gMonth, setGMonth] = useState(now.getMonth() + 1);
  const [gDay, setGDay] = useState(now.getDate());
  const [hYear, setHYear] = useState(todayHijri.year);
  const [hMonth, setHMonth] = useState(todayHijri.month);
  const [hDay, setHDay] = useState(todayHijri.day);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('date_conv_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setResult({ hijri: todayHijri, gregorian: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() } });
  }, []);

  const moonPhase = useMemo(() => getMoonPhase(result?.hijri?.day || todayHijri.day), [result]);
  const nextEvent = useMemo(() => getNextEvent(result?.hijri || todayHijri), [result]);
  const daysUntil = useMemo(() => getDaysUntilEvent(result?.hijri || todayHijri, nextEvent), [result, nextEvent]);

  const convert = () => {
    let r;
    if (mode === 'toHijri') {
      const h = gregorianToHijri(gYear, gMonth, gDay);
      r = { hijri: h, gregorian: { year: gYear, month: gMonth, day: gDay } };
    } else {
      const g = hijriToGregorian(hYear, hMonth, hDay);
      r = { hijri: { year: hYear, month: hMonth, day: hDay }, gregorian: g };
    }
    setResult(r);
    const entry = {
      id: Date.now(),
      hijri: `${r.hijri.day}/${r.hijri.month}/${r.hijri.year}`,
      greg: `${r.gregorian.day}/${r.gregorian.month}/${Math.round(r.gregorian.year)}`,
      mode,
    };
    setHistory(prev => {
      const next = [entry, ...prev.filter(h => h.hijri !== entry.hijri || h.greg !== entry.greg)].slice(0, 10);
      localStorage.setItem('date_conv_history', JSON.stringify(next));
      return next;
    });
  };

  const quickDate = (gd, gm, gy) => {
    setGDay(gd); setGMonth(gm); setGYear(gy);
    setMode('toHijri');
    setResult({ hijri: gregorianToHijri(gy, gm, gd), gregorian: { year: gy, month: gm, day: gd } });
  };

  const age = result ? calculateAge(
    mode === 'toHijri' ? gYear : result.hijri.year,
    mode === 'toHijri' ? gMonth : result.hijri.month,
    mode === 'toHijri' ? gDay : result.hijri.day,
    mode === 'toGregorian'
  ) : null;

  const hijriAge = result ? calculateAge(result.hijri.year, result.hijri.month, result.hijri.day, true) : null;
  const gregAge = result ? calculateAge(Math.round(result.gregorian.year), result.gregorian.month, result.gregorian.day, false) : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="absolute inset-0" style={{ background: C.bg }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(240,176,64,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='%23fff' stroke-width='.2'/%3E%3C/svg%3E")`, backgroundSize: '40px' }} />
      <style>{`
        .dc::-webkit-scrollbar{display:none}.dc{scrollbar-width:none}
        select option{background:#1a1230;color:rgba(255,255,255,0.8);padding:8px 10px}
        .dc-card{background:${C.card};border:1px solid ${C.cardBorder};border-radius:14px;position:relative;overflow:hidden}
        .dc-accent{position:absolute;top:0;right:0;left:0;height:2px;background:linear-gradient(90deg,transparent,var(--ac) 50%,transparent);opacity:0.5}
      `}</style>

      {/* ════════ HEADER ════════ */}
      <header className="relative flex-shrink-0 z-10" style={{ height: 65 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg, #1c1040 0%, #0c0818 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="absolute" style={{ top: -20, right: -15, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,176,64,0.08), transparent 70%)' }} />
        </div>
        <div className="relative h-full flex items-center justify-between px-5">
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(240,176,64,0.15), rgba(240,176,64,0.03))', border: '1px solid rgba(240,176,64,0.12)', fontSize: 18 }}>📅</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: '22px', margin: 0, fontFamily: '"Cairo", sans-serif' }}>محوّل التاريخ</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: '"Cairo", sans-serif' }}>
                {DAYS_AR[now.getDay()]} · {toArabicNum(now.getDate())} {GREG_MONTHS_AR[now.getMonth()]} {toArabicNum(now.getFullYear())}
              </p>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 6 }}>
            <span style={{ fontSize: 20 }}>{moonPhase.icon}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: '"Cairo", sans-serif' }}>{moonPhase.name}</span>
          </div>
        </div>
      </header>

      {/* ════════ CONTENT ════════ */}
      <div className="dc relative z-10 flex-1" style={{ overflowY: 'auto', padding: '8px 12px 12px' }}>

        {/* ── Today's date ── */}
        <div className="dc-card" style={{ padding: '12px 14px', marginBottom: 10, '--ac': C.gold }}>
          <div className="dc-accent" />
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(240,176,64,0.05)', border: '1px solid rgba(240,176,64,0.08)' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>الهجري</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.gold, lineHeight: '24px', fontFamily: '"Amiri Quran", "Amiri", serif' }}>{toArabicNum(todayHijri.day)}</p>
              <p style={{ fontSize: 13, color: C.gold, fontWeight: 600, marginTop: 3 }}>{HIJRI_MONTHS[todayHijri.month - 1]}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>{toArabicNum(todayHijri.year)} هـ</p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
            <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.08)' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>الميلادي</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.green, lineHeight: '24px' }}>{toArabicNum(now.getDate())}</p>
              <p style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 3 }}>{GREG_MONTHS_AR[now.getMonth()]}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>{toArabicNum(now.getFullYear())} م</p>
            </div>
          </div>
        </div>

        {/* ── Mode toggle ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[{ key: 'toHijri', label: 'ميلادي → هجري', color: C.green, icon: '📅' },
            { key: 'toGregorian', label: 'هجري → ميلادي', color: C.purple, icon: '📆' }].map(m => {
            const active = mode === m.key;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 500,
                background: active ? `${m.color}15` : 'rgba(255,255,255,0.015)',
                border: `1.5px solid ${active ? `${m.color}35` : 'rgba(255,255,255,0.03)'}`,
                color: active ? m.color : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: '"Cairo", sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 15 }}>{m.icon}</span> {m.label}
              </button>
            );
          })}
        </div>

        {/* ── Input section ── */}
        <div className="dc-card" style={{ padding: '14px 14px', marginBottom: 10, '--ac': mode === 'toHijri' ? C.green : C.purple }}>
          <div className="dc-accent" />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>
            {mode === 'toHijri' ? 'حول تاريخ ميلادك من ميلادي إلى هجري' : 'حول التاريخ الهجري إلى ميلادي'}
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>اليوم</label>
              <input type="number" min="1" max={mode === 'toHijri' ? 31 : 30}
                value={mode === 'toHijri' ? gDay : hDay}
                onChange={e => mode === 'toHijri' ? setGDay(+e.target.value) : setHDay(+e.target.value)}
                style={{ width: '100%', padding: '10px 8px', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.06)', outline: 'none', textAlign: 'center', fontFamily: '"Cairo", sans-serif' }} />
            </div>
            <div style={{ flex: 1.5 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>الشهر</label>
              {mode === 'toHijri' ? (
                <select value={gMonth} onChange={e => setGMonth(+e.target.value)} style={{ width: '100%', padding: '10px 8px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#1a1230', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.06)', outline: 'none', textAlign: 'center', fontFamily: '"Cairo", sans-serif', cursor: 'pointer', direction: 'rtl', appearance: 'none' }}>
                  {GREG_MONTHS_AR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              ) : (
                <select value={hMonth} onChange={e => setHMonth(+e.target.value)} style={{ width: '100%', padding: '10px 8px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#1a1230', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.06)', outline: 'none', textAlign: 'center', fontFamily: '"Cairo", sans-serif', cursor: 'pointer', direction: 'rtl', appearance: 'none' }}>
                  {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>السنة</label>
              <input type="number" min="1" max={mode === 'toHijri' ? 3000 : 2000}
                value={mode === 'toHijri' ? gYear : hYear}
                onChange={e => mode === 'toHijri' ? setGYear(+e.target.value) : setHYear(+e.target.value)}
                style={{ width: '100%', padding: '10px 8px', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.06)', outline: 'none', textAlign: 'center', fontFamily: '"Cairo", sans-serif' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={convert} style={{
              width: '40%', padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: mode === 'toHijri' ? `linear-gradient(135deg, ${C.green}, #00a87d)` : `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
              color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: '"Cairo", sans-serif',
              boxShadow: `0 4px 15px ${mode === 'toHijri' ? 'rgba(0,200,150,0.2)' : 'rgba(139,92,246,0.2)'}`,
            }}>تحويل</button>
          </div>
        </div>

        {/* ── Result ── */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key={JSON.stringify(result)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }} className="dc-card" style={{ padding: '14px', marginBottom: 10, '--ac': C.gold }}>
              <div className="dc-accent" />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>النتيجة</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'rgba(240,176,64,0.05)', border: '1px solid rgba(240,176,64,0.08)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 5 }}>📆 الهجري</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: C.gold, lineHeight: '28px', fontFamily: '"Amiri Quran", "Amiri", serif' }}>{toArabicNum(result.hijri.day)}</p>
                  <p style={{ fontSize: 14, color: C.gold, fontWeight: 600, marginTop: 3 }}>{HIJRI_MONTHS[result.hijri.month - 1]}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 2 }}>{toArabicNum(result.hijri.year)} هـ</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.08)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 5 }}>📅 الميلادي</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: C.green, lineHeight: '28px' }}>{toArabicNum(result.gregorian.day)}</p>
                  <p style={{ fontSize: 14, color: C.green, fontWeight: 600, marginTop: 3 }}>{GREG_MONTHS_AR[result.gregorian.month - 1]}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 2 }}>{toArabicNum(Math.round(result.gregorian.year))} م</p>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 10, fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>
                {getDayName(result.gregorian.year, result.gregorian.month, result.gregorian.day)}
                {isToday(result.gregorian.year, result.gregorian.month, result.gregorian.day) && (
                  <span style={{ fontSize: 11, color: C.green, marginRight: 4 }}> · اليوم</span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Age Calculation ── */}
        {gregAge && hijriAge && (
          <div className="dc-card" style={{ padding: '14px', marginBottom: 10, '--ac': C.green }}>
            <div className="dc-accent" />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>🎂 حساب العمر</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 10, background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.08)', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>📅</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>العمر بالميلادي</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: '"Cairo", sans-serif' }}>
                  {toArabicNum(gregAge.years)} سنة و{toArabicNum(gregAge.months)} شهر و{toArabicNum(gregAge.days)} يوم
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 10, background: 'rgba(240,176,64,0.05)', border: '1px solid rgba(240,176,64,0.08)', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>📆</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>العمر بالهجري</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.gold, fontFamily: '"Cairo", sans-serif' }}>
                  {toArabicNum(hijriAge.years)} سنة و{toArabicNum(hijriAge.months)} شهر و{toArabicNum(hijriAge.days)} يوم
                </p>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.08)' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>📊 الفرق بين التاريخين</p>
              <p style={{ fontSize: 13, color: C.purple, fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>
                العمر الهجري {hijriAge.years > gregAge.years ? 'أكبر' : hijriAge.years < gregAge.years ? 'أصغر' : 'مساوي'} بـ {toArabicNum(Math.abs(hijriAge.years - gregAge.years))} سنة
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontFamily: '"Cairo", sans-serif' }}>
                ≈ {toArabicNum(355)} يوم هجري = {toArabicNum(354.37)} يوم ميلادي (الفرق ≈ {toArabicNum(11)} يوم سنوياً)
              </p>
            </div>
          </div>
        )}

        {/* ── Personality ── */}
        {result && MONTH_PERSONALITIES[result.hijri.month - 1] && (
          <div className="dc-card" style={{ padding: '14px', marginBottom: 10, '--ac': C.pink }}>
            <div className="dc-accent" />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>👤 أشهر شخصية في شهر ميلادك الهجري</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.08)' }}>
              <span style={{ fontSize: 30 }}>{MONTH_PERSONALITIES[result.hijri.month - 1].icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.pink, fontFamily: '"Cairo", sans-serif' }}>{MONTH_PERSONALITIES[result.hijri.month - 1].name}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: '"Cairo", sans-serif' }}>{MONTH_PERSONALITIES[result.hijri.month - 1].title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2, fontFamily: '"Cairo", sans-serif' }}>{MONTH_PERSONALITIES[result.hijri.month - 1].desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Month Fact ── */}
        {result && MONTH_FACTS[result.hijri.month - 1] && (
          <div className="dc-card" style={{ padding: '14px', marginBottom: 10, '--ac': C.gold }}>
            <div className="dc-accent" />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>💡 هل تعلم عن شهر {HIJRI_MONTHS[result.hijri.month - 1]}؟</p>
            <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(240,176,64,0.05)', border: '1px solid rgba(240,176,64,0.08)' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, fontFamily: '"Cairo", sans-serif' }}>
                {MONTH_FACTS[result.hijri.month - 1].fact}
              </p>
            </div>
          </div>
        )}

        {/* ── Next event ── */}
        <div className="dc-card" style={{ padding: '12px 14px', marginBottom: 10, '--ac': C.pink }}>
          <div className="dc-accent" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{nextEvent.icon}</span>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>الحدث القادم</p>
                <p style={{ fontSize: 15, color: C.pink, fontWeight: 700, fontFamily: '"Cairo", sans-serif' }}>{nextEvent.label}</p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.pink, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>{toArabicNum(daysUntil)}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>يوم</p>
            </div>
          </div>
        </div>

        {/* ── Quick dates ── */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 8, fontFamily: '"Cairo", sans-serif' }}>تواريخ سريعة</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: 'اليوم', gd: now.getDate(), gm: now.getMonth() + 1, gy: now.getFullYear() },
              { label: '١ محرم', gd: 1, gm: 1, gy: 2025, isHijri: true },
              { label: '١ رمضان', gd: 1, gm: 9, gy: 2025, isHijri: true },
              { label: '١٠ ذو الحجة', gd: 10, gm: 12, gy: 2025, isHijri: true },
            ].map((q, i) => (
              <button key={i} onClick={() => {
                if (q.isHijri) {
                  setMode('toGregorian'); setHDay(q.gd); setHMonth(q.gm); setHYear(q.gy);
                  setResult({ hijri: { year: q.gy, month: q.gm, day: q.gd }, gregorian: hijriToGregorian(q.gy, q.gm, q.gd) });
                } else { quickDate(q.gd, q.gm, q.gy); }
              }} style={{
                padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: '"Cairo", sans-serif',
              }}>{q.label}</button>
            ))}
          </div>
        </div>

        {/* ── Hijri events ── */}
        <div className="dc-card" style={{ padding: '14px', marginBottom: 10, '--ac': C.gold }}>
          <div className="dc-accent" />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>📅 المناسبات الهجرية</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {HIJRI_EVENTS.map((ev, i) => {
              const hn = result?.hijri || todayHijri;
              const isPast = ev.month < hn.month || (ev.month === hn.month && ev.day < hn.day);
              const isCurrent = ev.month === hn.month && ev.day === hn.day;
              const daysD = getDaysUntilEvent(hn, ev);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                  background: isCurrent ? 'rgba(240,176,64,0.06)' : 'rgba(255,255,255,0.008)',
                  border: `1px solid ${isCurrent ? 'rgba(240,176,64,0.12)' : 'rgba(255,255,255,0.025)'}`,
                  opacity: isPast ? 0.4 : 1,
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{ev.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: isPast ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: '"Cairo", sans-serif', textDecoration: isPast ? 'line-through' : 'none' }}>{ev.label}</span>
                  <span style={{ fontSize: 12, color: isCurrent ? C.gold : 'rgba(255,255,255,0.12)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {toArabicNum(ev.day)} {HIJRI_MONTHS[ev.month - 1]}
                  </span>
                  {!isPast && !isCurrent && (
                    <span style={{ fontSize: 11, color: 'rgba(236,72,153,0.6)', fontWeight: 600, flexShrink: 0, padding: '4px 10px', borderRadius: 6, background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.1)' }}>
                      +{toArabicNum(daysD)} يوم
                    </span>
                  )}
                  {isCurrent && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, flexShrink: 0 }}>اليوم!</span>}
                  {isPast && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── History ── */}
        {history.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 8, fontFamily: '"Cairo", sans-serif' }}>🕐 سجل التحويلات</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {history.slice(0, 5).map((h, i) => (
                <div key={h.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.008)', border: '1px solid rgba(255,255,255,0.025)',
                }}>
                  <span style={{ fontSize: 14, color: h.mode === 'toHijri' ? C.green : C.purple }}>{h.mode === 'toHijri' ? '📅' : '📆'}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums', flex: 1 }}>{h.greg}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.12)' }}>→</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums', direction: 'ltr' }}>{h.hijri}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ayah ── */}
        <div style={{ padding: '10px 14px', textAlign: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 14, lineHeight: 2.1, direction: 'rtl', color: 'rgba(255,255,255,0.22)', fontFamily: '"Amiri Quran", "Amiri", serif' }}>
            ﴿ إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ ﴾
          </p>
        </div>
      </div>
    </div>
  );
}
