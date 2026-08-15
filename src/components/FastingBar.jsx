import React, { useState, useEffect, useMemo } from 'react';
import { getPrayerTimesSync, parseTime } from '../utils/prayer-times';

export default function FastingBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const data = useMemo(() => {
    const pt = getPrayerTimesSync();
    const srH = parseTime(pt.Sunrise)?.totalMinutes;
    const ssH = parseTime(pt.Maghrib)?.totalMinutes;
    if (srH == null || ssH == null) return null;
    const dur = ssH - srH;
    const cm = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    let sec, label, isF;
    if (cm >= srH && cm < ssH) {
      sec = Math.max(0, (ssH - cm) * 60);
      label = '⏱ متبقي على الإفطار';
      isF = true;
    } else if (cm >= ssH) {
      sec = dur * 60;
      label = '☀️ مدة الصيام اليوم';
      isF = false;
    } else {
      sec = dur * 60;
      label = '☀️ مدة الصيام اليوم';
      isF = false;
    }

    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);

    const fmt = (t) => {
      if (!t) return '--:--';
      const [hh, mm] = t.split(':').map(Number);
      const p = hh >= 12 ? 'م' : 'ص';
      const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
      return `${h12}:${String(mm).padStart(2, '0')} ${p}`;
    };

    return {
      sunrise: fmt(pt.Sunrise),
      sunset: fmt(pt.Maghrib),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
      label,
      isF,
    };
  }, [now]);

  if (!data) return null;

  return (
    <div style={styles.bar}>
      {/* ── الشروق ── */}
      <div style={styles.section}>
        <span style={styles.ico}>🌅</span>
        <div>
          <div style={{ ...styles.val, color: '#ffa832' }}>{data.sunrise}</div>
          <div style={styles.lbl}>الشروق</div>
        </div>
      </div>

      {/* ── فاصل ── */}
      <div style={styles.divider} />

      {/* ── العداد ── */}
      <div style={styles.timerSection}>
        <div style={styles.timerLabel}>{data.label}</div>
        <div style={styles.timerDigits}>
          <div style={styles.tGroup}>
            <span style={styles.tVal}>{data.h}</span>
            <span style={styles.tLbl}>سا</span>
          </div>
          <span style={styles.tSep}>:</span>
          <div style={styles.tGroup}>
            <span style={styles.tVal}>{data.m}</span>
            <span style={styles.tLbl}>دق</span>
          </div>
          <span style={styles.tSep}>:</span>
          <div style={styles.tGroup}>
            <span style={styles.tVal}>{data.s}</span>
            <span style={styles.tLbl}>ثا</span>
          </div>
        </div>
      </div>

      {/* ── نقطة الحالة ── */}
      <div style={{ ...styles.statusDot, ...(data.isF ? styles.dotOn : styles.dotOff) }} />

      {/* ── فاصل ── */}
      <div style={styles.divider} />

      {/* ── الغروب ── */}
      <div style={styles.section}>
        <span style={styles.ico}>🌇</span>
        <div>
          <div style={{ ...styles.val, color: '#00c896' }}>{data.sunset}</div>
          <div style={{ ...styles.lbl, color: '#3a5548' }}>الغروب</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    margin: '0 16px 10px',
    padding: '12px 18px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(18,14,28,.95), rgba(10,8,18,.98))',
    border: '1px solid rgba(255,168,50,.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    zIndex: 2,
    whiteSpace: 'nowrap',
  },
  divider: {
    width: 1,
    height: 32,
    margin: '0 12px',
    background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.08), transparent)',
    flexShrink: 0,
    position: 'relative',
    zIndex: 2,
  },
  timerSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    zIndex: 2,
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'rgba(255,168,50,.5)',
    letterSpacing: 0.5,
  },
  timerDigits: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    direction: 'ltr',
  },
  tGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  tVal: {
    fontSize: 34,
    fontWeight: 900,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    background: 'linear-gradient(180deg, #ffd280, #ffa832, #c77a10)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 1px 6px rgba(255,168,50,.12))',
  },
  tSep: {
    fontSize: 22,
    fontWeight: 800,
    color: 'rgba(255,168,50,.12)',
    lineHeight: 1,
  },
  tLbl: {
    fontSize: 8,
    fontWeight: 700,
    color: '#5a5040',
    marginTop: 1,
  },
  ico: {
    fontSize: 18,
  },
  val: {
    fontSize: 14,
    fontWeight: 900,
    fontVariantNumeric: 'tabular-nums',
    direction: 'ltr',
    textAlign: 'right',
  },
  lbl: {
    fontSize: 9,
    fontWeight: 600,
    color: '#5a5040',
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    marginLeft: 4,
  },
  dotOn: {
    background: '#ffa832',
    boxShadow: '0 0 6px rgba(255,168,50,.5)',
  },
  dotOff: {
    background: '#00c896',
    boxShadow: '0 0 6px rgba(0,200,150,.4)',
  },
};
