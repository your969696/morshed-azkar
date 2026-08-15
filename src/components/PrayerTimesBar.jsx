import React, { useState, useEffect, useMemo } from 'react';
import { getPrayerTimesSync, parseTime, PRAYER_NAMES_AR } from '../utils/prayer-times';

const PRAYERS = [
  { key: 'Fajr', icon: '🕌', label: 'الفجر' },
  { key: 'Sunrise', icon: '🌅', label: 'الشروق' },
  { key: 'Dhuhr', icon: '☀️', label: 'الظهر' },
  { key: 'Asr', icon: '🕋', label: 'العصر' },
  { key: 'Maghrib', icon: '🌇', label: 'المغرب' },
  { key: 'Isha', icon: '🌙', label: 'العشاء' },
];

const DAYS = [
  { key: 1, short: 'الإثنين', full: 'الإثنين' },
  { key: 2, short: 'الثلاثاء', full: 'الثلاثاء' },
  { key: 3, short: 'الأربعاء', full: 'الأربعاء' },
  { key: 4, short: 'الخميس', full: 'الخميس' },
  { key: 5, short: 'الجمعة', full: 'الجمعة' },
  { key: 6, short: 'السبت', full: 'السبت' },
  { key: 0, short: 'الأحد', full: 'الأحد' },
];

export default function PrayerTimesBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const data = useMemo(() => {
    try {
      const pt = getPrayerTimesSync();
      const cm = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      const fmt12 = (t) => {
        if (!t) return '--:--';
        const [hh, mm] = t.split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) return '--:--';
        const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
        return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      };

      const fmtAmPm = (t) => {
        if (!t) return '';
        const [hh] = t.split(':').map(Number);
        return hh >= 12 ? 'م' : 'ص';
      };

      let activeIdx = -1;
      const items = PRAYERS.map((p, i) => {
        const raw = pt[p.key];
        const parsed = parseTime(raw);
        const mins = parsed?.totalMinutes ?? 0;
        return { ...p, raw, time: fmt12(raw), ampm: fmtAmPm(raw), mins };
      });

      for (let i = items.length - 1; i >= 0; i--) {
        if (cm >= items[i].mins && items[i].mins > 0) {
          activeIdx = i;
          break;
        }
      }

      const nextIdx = (activeIdx + 1) % items.length;
      const next = items[nextIdx];

      let countdown = '00 : 00 : 00';
      if (next) {
        let diff = next.mins - cm;
        if (diff < 0) diff += 24 * 60;
        const rh = Math.floor(diff / 60);
        const rm = Math.floor(diff % 60);
        const rs = Math.round((diff - Math.floor(diff)) * 60);
        countdown = `${String(rh).padStart(2, '0')} : ${String(rm).padStart(2, '0')} : ${String(rs).padStart(2, '0')}`;
      }

      return { items, activeIdx, next, countdown };
    } catch {
      return null;
    }
  }, [now]);

  if (!data) return null;

  return (
    <div style={styles.wrap}>
      <style>{`
        @keyframes prayerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,232,160,0.15), inset 0 0 0 0 rgba(0,232,160,0.06); }
          50% { box-shadow: 0 0 12px 2px rgba(0,232,160,0.25), inset 0 0 8px 0 rgba(0,232,160,0.1); }
        }
        .prayer-active-cell { animation: prayerPulse 2s ease-in-out infinite !important; }
        @keyframes dayGlow {
          0%, 100% { box-shadow: 0 0 6px 1px rgba(0,232,160,0.25), 0 0 12px 2px rgba(0,232,160,0.1); }
          50% { box-shadow: 0 0 14px 4px rgba(0,232,160,0.45), 0 0 24px 6px rgba(0,232,160,0.15); }
        }
        .day-active-glow { animation: dayGlow 2s ease-in-out infinite !important; border-color: rgba(0,232,160,0.4) !important; background: rgba(0,232,160,0.1) !important; }
      `}</style>
      {/* ── صف الأيام ── */}
      <div style={styles.daysBar}>
        {DAYS.map((d) => {
          const isToday = d.key === now.getDay();
          return (
            <div key={d.key} style={{ ...styles.dayCell, ...(isToday ? styles.dayCellActive : {}) }} className={isToday ? 'day-active-glow' : ''}>
              <span style={{ ...styles.dayText, color: isToday ? '#00e8a0' : '#5a5270', fontWeight: isToday ? 900 : 600 }}>{d.short}</span>
            </div>
          );
        })}
      </div>
      {/* ── شريط الأوقات ── */}
      <div style={styles.bar}>
        {data.items.map((p, i) => {
          const isActive = i === data.activeIdx;
          return (
            <div key={p.key} style={{ ...styles.cell, ...(isActive ? styles.cellActive : {}) }} className={isActive ? 'prayer-active-cell' : ''}>
              <span style={{ ...styles.cellIcon, ...(isActive ? styles.cellIconActive : {}) }}>{p.icon}</span>
              <span style={{ ...styles.cellName, color: isActive ? '#fff' : '#7a7290' }}>{p.label}</span>
              <span style={{ ...styles.cellTime, color: isActive ? '#00e8a0' : '#e0d8f0' }}>{p.time}</span>
              <span style={{ ...styles.cellAm, color: isActive ? '#00e8a0' : '#4a4260' }}>{p.ampm}</span>
            </div>
          );
        })}
      </div>

      {/* ── صف المعلومات ── */}
      <div style={styles.infoRow}>
        <div style={styles.nextInfo}>
          <div style={styles.greenDot} />
          <span style={styles.nextText}>الصلاة القادمة: </span>
          <span style={styles.nextName}>{data.next?.label || '--'}</span>
        </div>
        <div style={styles.locInfo}>
          <span style={{ fontSize: 10 }}>📍</span>
          <span style={styles.locText}>مكة المكرمة (الافتراضي)</span>
        </div>
      </div>

      {/* ── العد التنازلي ── */}
      <div style={styles.cdBar}>
        <span style={styles.cdTextRight}>متبقي على {data.next?.label || '--'}</span>
        <div style={styles.cdDigitsWrap}>
          {data.countdown.split(':').map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={styles.cdColon}> : </span>}
              <span style={styles.cdDigit}>{v.trim()}</span>
            </React.Fragment>
          ))}
        </div>
        <span style={styles.cdLabelsLeft}>ساعة : دقيقة : ثانية ⏳</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    margin: '0 16px 10px',
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(18,14,28,.95), rgba(10,8,18,.98))',
    border: '1px solid rgba(255,168,50,.06)',
    overflow: 'hidden',
  },
  daysBar: {
    display: 'flex',
    direction: 'rtl',
    padding: '10px 8px 6px',
    gap: 4,
    justifyContent: 'center',
  },
  dayCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 0',
    borderRadius: 8,
    border: '1px solid transparent',
    transition: 'all .3s',
    maxWidth: 48,
  },
  dayCellActive: {
    background: 'rgba(0,232,160,.1)',
    border: '1px solid rgba(0,232,160,.3)',
  },
  dayText: {
    fontSize: 10,
    fontWeight: 700,
    transition: 'all .3s',
  },
  bar: {
    display: 'flex',
    direction: 'rtl',
    padding: '12px 8px 10px',
  },
  cell: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '8px 2px',
    borderRadius: 12,
    margin: '0 3px',
    transition: 'all .3s',
  },
  cellActive: {
    background: 'rgba(0,232,160,.08)',
    border: '1px solid rgba(0,232,160,.12)',
  },
  cellIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  cellIconActive: {
    opacity: 1,
    filter: 'drop-shadow(0 0 6px rgba(0,232,160,.3))',
  },
  cellName: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  cellTime: {
    fontSize: 18,
    fontWeight: 900,
    fontVariantNumeric: 'tabular-nums',
    direction: 'ltr',
    lineHeight: 1.1,
  },
  cellAm: {
    fontSize: 9,
    fontWeight: 700,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderTop: '1px solid rgba(255,255,255,.04)',
  },
  nextInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#00e8a0',
    boxShadow: '0 0 6px rgba(0,232,160,.4)',
  },
  nextText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#00e8a0',
  },
  nextName: {
    fontSize: 12,
    fontWeight: 800,
    color: '#00e8a0',
  },
  locInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#7a7290',
  },
  cdBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    margin: '0 8px 8px',
    borderRadius: 12,
    background: 'rgba(255,255,255,.02)',
    border: '1px solid rgba(255,255,255,.04)',
    direction: 'rtl',
  },
  cdTextRight: {
    fontSize: 12,
    fontWeight: 700,
    color: '#00e8a0',
    whiteSpace: 'nowrap',
  },
  cdDigitsWrap: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    direction: 'ltr',
  },
  cdDigit: {
    fontSize: 30,
    fontWeight: 900,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    background: 'linear-gradient(180deg, #00e8a0, #00c880)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 1px 6px rgba(0,232,160,.15))',
  },
  cdColon: {
    fontSize: 22,
    fontWeight: 800,
    color: 'rgba(0,232,160,.25)',
    lineHeight: 1,
  },
  cdLabelsLeft: {
    fontSize: 9,
    fontWeight: 600,
    color: '#4a4260',
    whiteSpace: 'nowrap',
  },
};
