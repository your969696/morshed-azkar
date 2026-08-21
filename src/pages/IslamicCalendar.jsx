import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { ISLAMIC_OCCASIONS } from '../data/islamic-occasions';

const HIJRI_MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const HIJRI_MONTHS_EN = ['Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani', 'Jumada al-Ula', 'Jumada al-Akhira', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijja'];
const GREG_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const GREG_MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

function getHijriForDate(date) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448');
    return { day, month, year };
  } catch {
    return { day: 1, month: 1, year: 1448 };
  }
}

function getOccasionsForHijri(month, day) {
  return ISLAMIC_OCCASIONS.filter(o => o.month === month && o.day === day);
}

function getDaysInGregorianMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

const calCss = `
@keyframes calIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cal-page{padding:0 16px 120px;background:var(--bg-primary);min-height:100vh}
.cal-header{text-align:center;padding:24px 0 16px}
.cal-title{font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:4px}
.cal-sub{font-size:12px;color:var(--text-muted);font-weight:600}
.cal-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px}
.cal-nav-btn{width:36px;height:36px;border-radius:10px;border:1px solid var(--border-card);background:var(--bg-card);color:var(--text-primary);font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
.cal-nav-btn:hover{background:var(--bg-card-hover);border-color:var(--border-color)}
.cal-nav-btn:active{transform:scale(.92)}
.cal-month-label{font-size:18px;font-weight:800;color:var(--text-primary);min-width:180px;text-align:center}
.cal-weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px}
.cal-weekday{text-align:center;font-size:10px;font-weight:700;color:var(--text-muted);padding:6px 0}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-day{aspect-ratio:1;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;transition:all .2s;position:relative;border:1px solid transparent;animation:calIn .3s ease backwards}
.cal-day:empty{cursor:default}
.cal-day:hover:not(:empty){background:var(--bg-card-hover);border-color:var(--border-color)}
.cal-day.today{border-color:var(--accent-green);background:rgba(0,200,150,.08)}
.cal-day.occ{border-color:var(--accent-gold);background:rgba(240,176,64,.08)}
.cal-day.occ:hover{background:rgba(240,176,64,.15)}
.cal-greg{font-size:12px;font-weight:700;color:var(--text-primary);line-height:1}
.cal-hijri{font-size:9px;font-weight:600;color:var(--text-muted);line-height:1}
.cal-day.today .cal-hijri{color:var(--accent-green)}
.cal-day.occ .cal-hijri{color:var(--accent-gold)}
.cal-occ-dot{width:4px;height:4px;border-radius:50%;position:absolute;bottom:4px}
.cal-occ-list{margin-top:20px}
.cal-occ-title{font-size:14px;font-weight:800;color:var(--text-primary);margin-bottom:12px;padding:0 4px}
.cal-occ-card{background:var(--bg-card);border:1px solid var(--border-card);border-radius:16px;padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;animation:calIn .3s ease backwards}
.cal-occ-emoji{font-size:28px;flex-shrink:0;width:40px;text-align:center}
.cal-occ-info{flex:1;min-width:0}
.cal-occ-name{font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:2px}
.cal-occ-desc{font-size:11px;color:var(--text-muted);font-weight:500}
.cal-occ-hijri{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;background:rgba(240,176,64,.1);color:var(--accent-gold);white-space:nowrap;flex-shrink:0}
.cal-empty{grid-column:span 7;height:0}
.cal-today-btn{padding:6px 14px;border-radius:8px;border:1px solid var(--accent-green);background:rgba(0,200,150,.1);color:var(--accent-green);font-size:11px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;transition:all .2s}
.cal-today-btn:hover{background:rgba(0,200,150,.2)}
`;

export default function IslamicCalendar() {
  const { t, lang } = useTranslation();
  const isRTL = lang === 'ar';
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    const occs = [];
    const daysInMonth = getDaysInGregorianMonth(year, month);
    for (let d = 1; d <= daysInMonth; d++) {
      const hijri = getHijriForDate(new Date(year, month, d));
      const found = getOccasionsForHijri(hijri.month, hijri.day);
      if (found.length > 0) {
        found.forEach(o => {
          if (!occs.find(x => x.nameAr === o.nameAr && x.hijriDay === hijri.day)) {
            occs.push({ ...o, hijriDay: hijri.day, hijriMonth: hijri.month, hijriYear: hijri.year, gregDay: d });
          }
        });
      }
    }
    setOccasions(occs);
  }, [year, month]);

  const daysInMonth = getDaysInGregorianMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(null);
  };

  const getOccForDay = (d) => {
    const hijri = getHijriForDate(new Date(year, month, d));
    return getOccasionsForHijri(hijri.month, hijri.day);
  };

  const selectedOccasions = selectedDay ? getOccForDay(selectedDay) : [];

  return (
    <>
      <style>{calCss}</style>
      <div className="cal-page" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <div className="cal-header">
          <div className="cal-title">📅 {t.calendar?.title || 'التقويم الهجري'}</div>
          <div className="cal-sub">{t.calendar?.subtitle || 'المناسبات والأحداث الإسلامية'}</div>
        </div>

        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <div className="cal-month-label">
            {isRTL ? `${GREG_MONTHS[month]} ${year}م` : `${GREG_MONTHS_EN[month]} ${year}`}
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          {!isCurrentMonth && <button className="cal-today-btn" onClick={goToday}>{t.calendar?.today || 'اليوم'}</button>}
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
        </div>

        <div className="cal-grid">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="cal-empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const hijri = getHijriForDate(new Date(year, month, d));
            const hasOcc = getOccasionsForHijri(hijri.month, hijri.day).length > 0;
            const isToday = isCurrentMonth && d === today.getDate();
            const isSelected = d === selectedDay;
            const occ = hasOcc ? getOccasionsForHijri(hijri.month, hijri.day)[0] : null;

            return (
              <motion.div
                key={d}
                className={`cal-day${isToday ? ' today' : ''}${hasOcc ? ' occ' : ''}${isSelected ? ' today' : ''}`}
                onClick={() => setSelectedDay(d === selectedDay ? null : d)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.008, duration: 0.15 }}
                style={isSelected ? { borderColor: 'var(--accent-gold)', background: 'rgba(240,176,64,.12)' } : undefined}
              >
                <div className="cal-greg">{d}</div>
                <div className="cal-hijri">{hijri.day}</div>
                {occ && <div className="cal-occ-dot" style={{ background: occ.color }} />}
              </motion.div>
            );
          })}
        </div>

        <div className="cal-occ-list">
          <div className="cal-occ-title">{t.calendar?.monthEvents || '✨ المناسبات في هذا الشهر'}</div>
          {occasions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {t.calendar?.noEvents || 'لا توجد مناسبات في هذا الشهر'}
            </div>
          ) : (
            occasions.map((o, i) => (
              <motion.div key={i} className="cal-occ-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="cal-occ-emoji">{o.emoji}</div>
                <div className="cal-occ-info">
                  <div className="cal-occ-name">{o.nameAr}</div>
                  <div className="cal-occ-desc">{o.desc}</div>
                </div>
                <div className="cal-occ-hijri">{o.hijriDay} {HIJRI_MONTHS[o.hijriMonth - 1]}</div>
              </motion.div>
            ))
          )}
        </div>

        {selectedDay && selectedOccasions.length > 0 && (
          <AnimatePresence>
            <motion.div
              style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, padding: '12px 18px', zIndex: 200, maxWidth: '90%', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20 }}
            >
              {selectedOccasions.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < selectedOccasions.length - 1 ? 8 : 0 }}>
                  <span style={{ fontSize: 22 }}>{o.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{o.nameAr}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
