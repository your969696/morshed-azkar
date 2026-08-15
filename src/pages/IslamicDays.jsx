import { motion } from 'framer-motion';
import { islamicDays } from '../data/islamic-days';
import { useTranslation } from '../i18n.jsx';

function getHijriNow() {
  try {
    const now = new Date();
    const jd = Math.floor(365.25 * (now.getFullYear() + 4716)) + Math.floor(30.6001 * (now.getMonth() + 1)) + now.getDate() - 1524.5;
    const l = Math.floor(jd - 1948439.5 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const lr = l - 10631 * n + 354;
    const j = Math.floor((10985 - lr) / 5316) * Math.floor((50 * lr) / 17719) + Math.floor(lr / 5670) * Math.floor((43 * lr) / 15238);
    const ld = lr - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hm = Math.floor((24 * ld) / 709);
    const hd = ld - Math.floor((709 * hm) / 24);
    const hy = 30 * n + j - 30;
    return { year: hy, month: hm, day: hd };
  } catch {
    return { year: 1447, month: 7, day: 1 };
  }
}

const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];

const COLORS = [
  { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #10b981, #059669)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #ec4899, #db2777)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #14b8a6, #0d9488)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #f97316, #ea580c)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #a855f7, #9333ea)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #84cc16, #65a30d)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #e11d48, #be123c)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', text: '#fff' },
];

export default function IslamicDays() {
  const { t } = useTranslation();
  const h = t.islamicDays || {};
  const hijri = getHijriNow();

  const daysUntil = (event) => {
    let d = event.month * 30 + event.day - (hijri.month * 30 + hijri.day);
    if (d < 0) d += 365;
    return d;
  };

  const events = islamicDays.map((e, i) => ({
    ...e,
    daysLeft: daysUntil(e),
    color: COLORS[i % COLORS.length],
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  const todayEvent = events.find(e => e.daysLeft === 0);

  return (
    <div className="page-wrap pb-24 px-3 pt-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📅</span>
          <h1 className="text-xl font-bold text-text-primary">{h.title || 'الأيام الإسلامية'}</h1>
        </div>
        <p className="text-text-secondary text-xs">{h.subtitle || 'المناسبات الإسلامية والعد التنازلي'}</p>
      </motion.div>

      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <div className="text-[#f0b040] text-sm font-bold">{hijri.day} {HIJRI_MONTHS_AR[hijri.month - 1]}</div>
          <div className="text-text-muted text-[10px]">{hijri.year} هـ</div>
        </div>
        <div className="text-right">
          <div className="text-[#00c896] text-sm font-bold">{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</div>
          <div className="text-text-muted text-[10px]">{new Date().getFullYear()} م</div>
        </div>
      </div>

      {todayEvent && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 rounded-2xl p-4 text-center"
          style={{ background: todayEvent.color.bg }}
        >
          <div className="text-3xl mb-1">{todayEvent.icon}</div>
          <div className="text-white font-bold text-sm mb-0.5">{todayEvent.nameAr}</div>
          <div className="text-white/80 text-[11px]">✨ {h.celebrate || 'مبروك! اليوم يوم مميز'}</div>
        </motion.div>
      )}

      <div className="mb-3">
        <div className="text-text-secondary text-[10px] font-bold mb-2 px-1">
          ({events.length})
        </div>
        <div className="grid grid-cols-2 gap-2">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl overflow-hidden"
              style={{ background: event.color.bg }}
            >
              <div className="p-2.5 text-center">
                <div className="text-xl mb-1">{event.icon}</div>
                <div className="text-white font-bold text-[11px] leading-tight mb-1" style={{ lineHeight: 1.3 }}>
                  {event.nameAr}
                </div>
                <div className="text-white/60 text-[9px] mb-1.5">
                  {HIJRI_MONTHS_AR[event.month - 1]} {event.day}
                </div>
                <div style={{
                  background: event.daysLeft === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  display: 'inline-block',
                }}>
                  <span className="text-white font-extrabold text-sm">
                    {event.daysLeft === 0 ? '🎉' : event.daysLeft}
                  </span>
                  <span className="text-white/70 text-[8px] mr-1">
                    {event.daysLeft === 0 ? (h.todayLabel || 'اليوم') : (h.days || 'يوم')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
