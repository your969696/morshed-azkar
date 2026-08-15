import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   Audio
   ═══════════════════════════════════════════════════════════ */
let _ac = null;
const ac = () => {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
};
const beep = (freq = 880, dur = 0.07, vol = 0.04) => {
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = vol;
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.stop(c.currentTime + dur + 0.01);
  } catch {}
};
const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.22, 0.06), i * 100));
const alertBeep = () => [784, 988, 784].forEach((f, i) => setTimeout(() => beep(f, 0.14, 0.05), i * 180));

/* ═══════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════ */
const ADHKAR = [
  { text: 'سُبْحَانَ اللَّه', target: 33, daily: true },
  { text: 'الْحَمْدُ لِلَّه', target: 33, daily: true },
  { text: 'اللَّهُ أَكْبَر', target: 34, daily: true },
  { text: 'لَا إِلَهَ إِلَّا اللَّه', target: 100 },
  { text: 'أَسْتَغْفِرُ اللَّه', target: 100 },
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 100 },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه', target: 100 },
  { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد', target: 100 },
];

const PRAYER_PRESETS = [
  { label: 'الفجر', time: '04:30', icon: '🌙' },
  { label: 'الشروق', time: '06:00', icon: '🌅' },
  { label: 'الظهر', time: '12:15', icon: '☀️' },
  { label: 'العصر', time: '15:30', icon: '🌤' },
  { label: 'المغرب', time: '18:15', icon: '🌇' },
  { label: 'العشاء', time: '20:00', icon: '🌑' },
];

const RS = 200, RR = 82, RC = 2 * Math.PI * RR;

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
const ld = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const fmtCountdown = m => {
  if (m <= 0) return 'الآن';
  const h = Math.floor(m / 60), mn = m % 60;
  return h > 0 ? (mn > 0 ? `${h} س ${mn} د` : `${h} ساعة`) : `${mn} دقيقة`;
};

function getTimes(mode, custom) {
  if (mode === '6h') return ['05:00', '11:00', '17:00', '23:00'];
  if (mode === '12h') return ['06:00', '18:00'];
  return custom || [];
}
function getNext(times) {
  if (!times.length) return null;
  const s = [...times].sort();
  const now = new Date(), cur = now.getHours() * 60 + now.getMinutes();
  for (const t of s) { const [h, m] = t.split(':').map(Number); const d = h * 60 + m - cur; if (d > 0) return { time: t, mins: d }; }
  const [h, m] = s[0].split(':').map(Number);
  return { time: s[0], mins: 1440 - cur + h * 60 + m };
}

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
export default function Tasbih() {
  /* ── state ── */
  const [sel, setSel] = useState(() => ld('ts_sel', 0));
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(() => ld('ts_total', 0));
  const [daily, setDaily] = useState(() => {
    const s = ld('ts_daily', {});
    if (s.date === today()) return s;
    let streak = s.streak || 0;
    if (s.lastComplete !== yesterday() && s.lastComplete !== today()) streak = 0;
    return { date: today(), count: 0, done: [], streak, lastComplete: s.lastComplete || '' };
  });
  const [soundOn, setSoundOn] = useState(() => ld('ts_snd', true));
  const [vibOn, setVibOn] = useState(() => ld('ts_vib', true));
  const [showDone, setShowDone] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState(false);
  const [speed, setSpeed] = useState(0);
  const tapsRef = useRef([]);

  /* ── reminder state ── */
  const [remOn, setRemOn] = useState(() => ld('ts_remOn', false));
  const [remMode, setRemMode] = useState(() => ld('ts_remMode', '6h'));
  const [remCustom, setRemCustom] = useState(() => ld('ts_remCustom', ['05:00', '12:00', '18:00', '21:00']));
  const [remExp, setRemExp] = useState(false);
  const [nextRem, setNextRem] = useState(null);
  const [remToast, setRemToast] = useState(false);
  const [lastFired, setLastFired] = useState('');
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [newTime, setNewTime] = useState('');

  const opt = ADHKAR[sel], target = opt.target;
  const pct = (count / target) * 100, done = count >= target;
  const remaining = Math.max(0, target - count);
  const offset = RC * (1 - Math.min(pct, 100) / 100);
  const nearEnd = count >= target - 5 && !done;
  const dailyDone = daily.done || [];
  const allDailyDone = [0, 1, 2].every(i => dailyDone.includes(i));
  const TICKS = target <= 40 ? target : 40;

  /* ── effects ── */
  useEffect(() => { const id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { sv('ts_sel', sel); }, [sel]);
  useEffect(() => { sv('ts_total', total); }, [total]);
  useEffect(() => { sv('ts_daily', daily); }, [daily]);
  useEffect(() => { sv('ts_snd', soundOn); }, [soundOn]);
  useEffect(() => { sv('ts_vib', vibOn); }, [vibOn]);
  useEffect(() => { sv('ts_remOn', remOn); }, [remOn]);
  useEffect(() => { sv('ts_remMode', remMode); }, [remMode]);
  useEffect(() => { sv('ts_remCustom', remCustom); }, [remCustom]);
  useEffect(() => { setCount(0); setShowDone(false); setSparks([]); }, [sel]);

  /* keyboard via ref */
  const doTapRef = useRef(), resetRef = useRef();
  useEffect(() => {
    const h = e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); doTapRef.current?.(); }
      if (e.code === 'Escape') resetRef.current?.();
      if (e.code === 'ArrowLeft') setSel(s => Math.min(ADHKAR.length - 1, s + 1));
      if (e.code === 'ArrowRight') setSel(s => Math.max(0, s - 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* reminder check every 30s */
  useEffect(() => {
    if (!remOn) { setNextRem(null); return; }
    const times = getTimes(remMode, remCustom);
    const tick = () => {
      setNextRem(getNext(times));
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (times.includes(hhmm) && lastFired !== hhmm) { setLastFired(hhmm); fireReminder(); }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [remOn, remMode, remCustom, lastFired]);

  /* ── callbacks ── */
  const fireReminder = () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification('📿 وقت التسبيح', { body: `حان وقت ذكر: ${ADHKAR[sel].text}`, tag: 'ts-rem' }); } catch {}
    }
    setRemToast(true);
    if (soundOn) alertBeep();
    if (vibOn && navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 120]);
    setTimeout(() => setRemToast(false), 6000);
  };

  const toggleRem = async () => {
    if (!remOn) {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        const p = await Notification.requestPermission(); setNotifPerm(p);
      }
      setRemOn(true);
    } else { setRemOn(false); }
  };

  const addTime = t => { if (t && !remCustom.includes(t)) setRemCustom(p => [...p, t].sort()); };
  const rmTime = t => setRemCustom(p => p.filter(x => x !== t));

  const markDone = useCallback(idx => {
    setDaily(prev => {
      const d = prev.done || [];
      if (d.includes(idx)) return prev;
      const nd = [...d, idx], all = [0, 1, 2].every(i => nd.includes(i));
      let streak = prev.streak || 0, lc = prev.lastComplete || '';
      if (all && prev.lastComplete !== today()) { streak++; lc = today(); }
      return { ...prev, done: nd, streak, lastComplete: lc };
    });
  }, []);

  const doTap = useCallback(() => {
    if (count >= target) return;
    const n = count + 1;
    setCount(n); setTotal(t => t + 1); setDaily(p => ({ ...p, count: p.count + 1 }));
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter(t => now - t < 30000), now];
    setSpeed(Math.round((tapsRef.current.length / 30) * 60));
    setFlash(true); setTimeout(() => setFlash(false), 70);
    setRipples(p => [...p, now]); setTimeout(() => setRipples(p => p.filter(r => r !== now)), 400);
    if (vibOn && navigator.vibrate) navigator.vibrate(10);
    if (soundOn) beep(720 + sel * 25);
    if (n >= target) {
      setShowDone(true);
      if (soundOn) setTimeout(fanfare, 120);
      if (vibOn && navigator.vibrate) navigator.vibrate([25, 15, 25, 15, 50]);
      setSparks(Array.from({ length: 24 }, (_, i) => ({
        id: `${now}-${i}`, angle: (i / 24) * 360 + (Math.random() - 0.5) * 20,
        dist: 45 + Math.random() * 55, size: 2 + Math.random() * 4,
        delay: Math.random() * 0.08, hue: 260 + Math.random() * 100,
      })));
      setTimeout(() => setSparks([]), 1000);
      if (opt.daily) markDone(sel);
    }
  }, [count, target, vibOn, soundOn, sel, opt, markDone]);

  doTapRef.current = doTap;
  const handleReset = () => { setCount(0); setShowDone(false); setSparks([]); };
  resetRef.current = handleReset;

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  const s = { /* inline style shortcuts */
    sec: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 5 },
    pill: (active, grad) => ({
      padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: active ? 700 : 500,
      background: active ? grad : 'rgba(255,255,255,0.012)',
      border: `1px solid ${active ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.02)'}`,
      color: active ? '#fff' : 'rgba(255,255,255,0.2)',
      transition: 'all 0.2s ease',
    }),
    card: { borderRadius: 10, padding: '8px 6px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* ── BG ── */}
      <div className="absolute inset-0" style={{ background: '#0c0818' }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 18% 28%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(ellipse at 82% 72%, rgba(219,39,119,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(217,119,6,0.025) 0%, transparent 40%)',
      }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23fff' stroke-width='.3'/%3E%3C/svg%3E")`,
        backgroundSize: '60px',
      }} />
      <style>{`.tsc::-webkit-scrollbar{display:none}.tsc{scrollbar-width:none}`}</style>

      {/* flash */}
      <AnimatePresence>{flash && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.06 }} className="fixed inset-0 z-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 50%, rgba(124,58,237,0.05) 0%, transparent 40%)' }} />}</AnimatePresence>

      {/* ════════════════ HEADER 60px ════════════════ */}
      <header className="relative flex-shrink-0 z-10" style={{ height: 60 }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, rgba(124,58,237,0.04) 0%, transparent 35%, transparent 65%, rgba(217,119,6,0.03) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.035)',
        }} />
        <div className="relative h-full flex items-center justify-between px-4">
          {/* brand */}
          <div className="flex items-center" style={{ gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 2px 10px rgba(124,58,237,0.3)' }}>
              <span style={{ fontSize: 16 }}>📿</span>
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: '18px' }}>المسبحة الرقمية</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>Space للعدّ · ←→ للتنقل · Esc إعادة</p>
            </div>
          </div>

          {/* stats + controls */}
          <div className="flex items-center" style={{ gap: 6 }}>
            {/* stat pills */}
            <span className="flex items-center" style={{ gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.035)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{total.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>كلي</span>
            </span>
            <span className="flex items-center" style={{ gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.08)' }}>
              <span style={{ fontSize: 13, color: 'rgba(16,185,129,0.8)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{daily.count}</span>
              <span style={{ fontSize: 11, color: 'rgba(16,185,129,0.3)' }}>اليوم</span>
            </span>
            {daily.streak > 0 && (
              <span className="flex items-center" style={{ gap: 3, padding: '5px 8px', borderRadius: 8, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.1)' }}>
                <span style={{ fontSize: 12 }}>🔥</span>
                <span style={{ fontSize: 13, color: 'rgba(245,158,11,0.8)', fontWeight: 700 }}>{daily.streak}</span>
              </span>
            )}
            {remOn && nextRem && (
              <span className="flex items-center" style={{ gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.08)' }}>
                <span style={{ fontSize: 11 }}>🔔</span>
                <span style={{ fontSize: 12, color: 'rgba(245,158,11,0.65)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtCountdown(nextRem.mins)}</span>
              </span>
            )}
            <div className="flex" style={{ gap: 4, marginLeft: 5 }}>
              <button onClick={() => setSoundOn(!soundOn)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: soundOn ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.035)', fontSize: 14 }}>
                {soundOn ? '🔊' : '🔇'}
              </button>
              <button onClick={() => setVibOn(!vibOn)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: vibOn ? 'rgba(219,39,119,0.08)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.035)', fontSize: 14 }}>
                📳
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════ MAIN ════════════════ */}
      <main className="relative z-10 flex-1 flex" style={{ minHeight: 0 }}>

        {/* ──────── LEFT 42% ──────── */}
        <div className="flex flex-col items-center justify-center" style={{ width: '42%', padding: '6px 12px' }}>

          {/* dhikr text */}
          <AnimatePresence mode="wait">
            <motion.p key={sel} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }} className="text-center"
              style={{ fontFamily: 'var(--font-naskh), "Amiri", serif', fontSize: 16, fontWeight: 700, lineHeight: 1.5, direction: 'rtl', marginBottom: 6,
                background: 'linear-gradient(135deg, #ddd0f5, #f0c8d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {opt.text}
            </motion.p>
          </AnimatePresence>

          {/* SVG Ring */}
          <div className="relative" style={{ width: RS, height: RS }}>
            <svg width={RS} height={RS} viewBox={`0 0 ${RS} ${RS}`} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="tG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#db2777" /></linearGradient>
                <linearGradient id="tGD" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                <filter id="tL"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <circle cx={RS / 2} cy={RS / 2} r={RR} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={6} />
              {Array.from({ length: TICKS }, (_, i) => {
                const a = (i / TICKS) * 2 * Math.PI, cx = RS / 2, cy = RS / 2, r1 = RR + 6, r2 = RR + 9;
                return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
                  stroke={i < count ? (done ? '#059669' : '#7c3aed') : 'rgba(255,255,255,0.02)'}
                  strokeWidth={i < count ? 2.2 : 0.7} strokeLinecap="round" transform={`rotate(90 ${cx} ${cy})`} style={{ transition: 'all 0.12s' }} />;
              })}
              <motion.circle cx={RS / 2} cy={RS / 2} r={RR} fill="none" strokeWidth={14} strokeLinecap="round" strokeDasharray={RC}
                stroke={done ? 'rgba(5,150,105,0.1)' : 'rgba(124,58,237,0.08)'} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.14 }} />
              <motion.circle cx={RS / 2} cy={RS / 2} r={RR} fill="none" strokeLinecap="round" strokeDasharray={RC}
                stroke={done ? 'url(#tGD)' : 'url(#tG)'} strokeWidth={nearEnd ? 8 : 6}
                filter={nearEnd || done ? 'url(#tL)' : undefined} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.14 }} />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button onClick={doTap} whileTap={{ scale: 0.94 }}
                className="relative rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
                style={{ width: RS - 32, height: RS - 32, background: done ? 'radial-gradient(circle,rgba(5,150,105,0.06),transparent 70%)' : 'radial-gradient(circle,rgba(124,58,237,0.04),transparent 70%)' }}>
                {ripples.map(id => <motion.div key={id} initial={{ width: 16, height: 16, opacity: 0.25 }} animate={{ width: 140, height: 140, opacity: 0 }} transition={{ duration: 0.38, ease: 'easeOut' }} className="absolute rounded-full pointer-events-none" style={{ border: `1.5px solid ${done ? '#059669' : '#7c3aed'}` }} />)}
                {sparks.map(p => <motion.div key={p.id} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(p.angle * Math.PI / 180) * p.dist, y: Math.sin(p.angle * Math.PI / 180) * p.dist, opacity: 0, scale: 0.2 }} transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }} className="absolute rounded-full pointer-events-none" style={{ width: p.size, height: p.size, background: `hsl(${p.hue},85%,68%)`, boxShadow: `0 0 4px hsl(${p.hue},85%,68%)` }} />)}
                <AnimatePresence mode="wait">
                  <motion.span key={done ? 'd' : count} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.1 }}
                    style={{ fontSize: done ? 34 : 40, fontWeight: 800, lineHeight: 1, color: done ? '#059669' : '#fff', fontFamily: 'var(--font-naskh), "Amiri", serif', textShadow: done ? '0 0 16px rgba(5,150,105,0.2)' : '0 0 10px rgba(124,58,237,0.08)', fontVariantNumeric: 'tabular-nums' }}>
                    {done ? '✓' : remaining}
                  </motion.span>
                </AnimatePresence>
                <span style={{ fontSize: 12, marginTop: 2, color: done ? 'rgba(5,150,105,0.5)' : 'rgba(255,255,255,0.18)' }}>{done ? 'تمّ بحمد الله' : 'متبقي'}</span>
                {nearEnd && <motion.div className="absolute inset-0 rounded-full pointer-events-none" animate={{ scale: [1, 1.04, 1], opacity: [0.06, 0.02, 0.06] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ border: '1.5px solid #7c3aed' }} />}
              </motion.button>
            </div>
          </div>

          {/* progress */}
          <div style={{ width: 170, marginTop: 6 }}>
            <div className="flex justify-between" style={{ marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>{count}/{target}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.025)' }}>
              <motion.div className="h-full rounded-full" style={{ background: done ? '#059669' : 'linear-gradient(90deg,#7c3aed,#db2777)' }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.14 }} />
            </div>
          </div>

          {/* nav */}
          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
            <button onClick={() => setSel(s => Math.max(0, s - 1))} disabled={sel === 0} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-20" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.035)', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>◀</button>
            <button onClick={handleReset} className="px-4 py-1.5 rounded-lg font-bold" style={{ fontSize: 13, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.035)', color: 'rgba(255,255,255,0.35)' }}>↺ إعادة</button>
            <button onClick={() => setSel(s => Math.min(ADHKAR.length - 1, s + 1))} disabled={sel === ADHKAR.length - 1} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-20" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.035)', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>▶</button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.12)', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>⚡ {speed}/د · ⏱ {fmtTime(elapsed)}</p>
        </div>

        {/* divider */}
        <div style={{ width: 1, flexShrink: 0, background: 'linear-gradient(to bottom,transparent 5%,rgba(255,255,255,0.035) 30%,rgba(255,255,255,0.035) 70%,transparent 95%)', margin: '10px 0' }} />

        {/* ──────── RIGHT 58% ──────── */}
        <div className="tsc flex flex-col" style={{ width: '58%', padding: '6px 12px 6px 14px', overflowY: 'auto' }}>

          {/* ── selector ── */}
          <div style={{ marginBottom: 10 }}>
            <p style={s.sec}>اختر الذكر</p>
            <div className="grid grid-cols-2" style={{ gap: 3 }}>
              {ADHKAR.map((a, i) => {
                const active = sel === i;
                return (
                  <motion.button key={i} onClick={() => setSel(i)} whileTap={{ scale: 0.97 }} className="relative rounded-lg text-right" style={{
                    padding: '8px 9px',
                    background: active ? 'linear-gradient(135deg,rgba(124,58,237,0.14),rgba(219,39,119,0.07))' : 'rgba(255,255,255,0.012)',
                    border: active ? '1px solid rgba(124,58,237,0.22)' : '1px solid rgba(255,255,255,0.02)',
                    boxShadow: active ? '0 2px 10px rgba(124,58,237,0.08)' : 'none', transition: 'all 0.2s',
                  }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, direction: 'rtl', color: active ? '#ddd0f5' : 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-naskh), "Amiri", serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78%' }}>{a.text}</span>
                      <span className="flex items-center" style={{ gap: 3 }}>
                        {dailyDone.includes(i) && a.daily && <span style={{ fontSize: 11, color: '#059669' }}>✓</span>}
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)' }}>{a.target}</span>
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── daily ── */}
          <div style={{ marginBottom: 10 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <p style={s.sec}>مهام اليوم</p>
              {allDailyDone && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ fontSize: 12, color: 'rgba(5,150,105,0.7)', fontWeight: 600 }}>✅ مكتملة</motion.span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map(i => {
                const c = dailyDone.includes(i);
                return (
                  <div key={i} className="flex items-center rounded-md" style={{ padding: '7px 9px', gap: 6, background: c ? 'rgba(5,150,105,0.025)' : 'rgba(255,255,255,0.008)', border: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.3s' }}>
                    <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: 4, background: c ? 'rgba(5,150,105,0.15)' : 'transparent', border: c ? '1px solid rgba(5,150,105,0.25)' : '1px solid rgba(255,255,255,0.05)' }}>
                      {c && <span style={{ fontSize: 10, color: '#059669', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, direction: 'rtl', color: c ? 'rgba(5,150,105,0.5)' : 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-naskh), "Amiri", serif', textDecoration: c ? 'line-through' : 'none' }}>{ADHKAR[i].text}</span>
                    <span style={{ fontSize: 11, marginRight: 'auto', color: 'rgba(255,255,255,0.08)' }}>({ADHKAR[i].target})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════ REMINDERS ══════ */}
          <div style={{ marginBottom: 10 }}>
            <button onClick={() => setRemExp(!remExp)} className="w-full flex items-center justify-between" style={{ padding: 0 }}>
              <p className="flex items-center" style={{ gap: 4 }}>
                <span style={{ fontSize: 12, color: remOn ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.06em' }}>التنبيهات</span>
                {remOn && nextRem && <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.4)', fontVariantNumeric: 'tabular-nums' }}>· التالي {nextRem.time} ({fmtCountdown(nextRem.mins)})</span>}
                {!remOn && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>· معطّلة</span>}
              </p>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', transition: 'transform 0.2s', transform: remExp ? 'rotate(180deg)' : '' }}>▼</span>
            </button>

            <AnimatePresence>
              {remExp && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div style={{ marginTop: 5, padding: '8px 9px', borderRadius: 10, background: 'linear-gradient(135deg,rgba(217,119,6,0.03),rgba(245,158,11,0.015))', border: '1px solid rgba(217,119,6,0.07)' }}>

                    {/* toggle */}
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <span className="flex items-center" style={{ gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>تفعيل التنبيهات</span>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5,
                          background: notifPerm === 'granted' ? 'rgba(5,150,105,0.08)' : notifPerm === 'denied' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                          color: notifPerm === 'granted' ? 'rgba(16,185,129,0.6)' : notifPerm === 'denied' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)',
                          border: `1px solid ${notifPerm === 'granted' ? 'rgba(5,150,105,0.12)' : notifPerm === 'denied' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}`,
                        }}>{notifPerm === 'granted' ? 'مسموح' : notifPerm === 'denied' ? 'مرفوض' : 'بانتظار'}</span>
                      </span>
                      <button onClick={toggleRem} className="relative" style={{ width: 40, height: 22, borderRadius: 11, transition: 'background 0.2s', background: remOn ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'rgba(255,255,255,0.06)', border: `1px solid ${remOn ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.04)'}` }}>
                        <motion.div style={{ width: 17, height: 17, borderRadius: 9, background: '#fff', position: 'absolute', top: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.35)' }} animate={{ left: remOn ? 19 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                      </button>
                    </div>

                    {remOn && (
                      <>
                        {/* mode selector */}
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginBottom: 5 }}>الفاصل الزمني</p>
                        <div className="flex" style={{ gap: 5, marginBottom: 8 }}>
                          {[{ k: '6h', l: 'كل 6 ساعات', icon: '🕕' }, { k: '12h', l: 'كل 12 ساعة', icon: '🕛' }, { k: 'custom', l: 'أوقات مخصصة', icon: '⏰' }].map(m => (
                            <button key={m.k} onClick={() => setRemMode(m.k)} className="flex-1 rounded-lg text-center font-bold" style={{
                              padding: '7px 5px', fontSize: 11,
                              background: remMode === m.k ? 'linear-gradient(135deg,rgba(217,119,6,0.14),rgba(245,158,11,0.06))' : 'rgba(255,255,255,0.012)',
                              border: remMode === m.k ? '1px solid rgba(217,119,6,0.25)' : '1px solid rgba(255,255,255,0.02)',
                              color: remMode === m.k ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.22)',
                            }}>{m.icon} {m.l}</button>
                          ))}
                        </div>

                        {/* custom times */}
                        {remMode === 'custom' && (
                          <>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.14)', marginBottom: 4 }}>إضافة مواقيت الصلاة (تقريبية)</p>
                            <div className="flex flex-wrap" style={{ gap: 3, marginBottom: 8 }}>
                              {PRAYER_PRESETS.map(pt => (
                                <button key={pt.time} onClick={() => addTime(pt.time)} disabled={remCustom.includes(pt.time)}
                                  className="rounded px-2 py-1 disabled:opacity-20"
                                  style={{ fontSize: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)' }}>
                                  {pt.icon} {pt.label} {pt.time}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center" style={{ gap: 6, marginBottom: 8 }}>
                              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                                style={{ flex: 1, padding: '5px 8px', borderRadius: 7, fontSize: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', outline: 'none', colorScheme: 'dark' }} />
                              <button onClick={() => { addTime(newTime); setNewTime(''); }} disabled={!newTime}
                                style={{ padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', border: 'none', opacity: newTime ? 1 : 0.3 }}>+ إضافة</button>
                            </div>
                          </>
                        )}

                        {/* display scheduled times */}
                        <div className="flex flex-wrap" style={{ gap: 4 }}>
                          {getTimes(remMode, remCustom).sort().map(t => (
                            <motion.span key={t} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center rounded-md" style={{ padding: '4px 9px', gap: 5, background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.12)' }}>
                              <span style={{ fontSize: 12, color: 'rgba(245,158,11,0.75)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{t}</span>
                              {remMode === 'custom' && <button onClick={() => rmTime(t)} style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>}
                            </motion.span>
                          ))}
                        </div>

                        {/* next reminder */}
                        {nextRem && (
                          <div className="flex items-center justify-center" style={{ marginTop: 8, padding: '6px', borderRadius: 8, background: 'rgba(217,119,6,0.03)', border: '1px solid rgba(217,119,6,0.05)' }}>
                            <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.5)' }}>⏰ التنبيه التالي: </span>
                            <span style={{ fontSize: 13, color: 'rgba(245,158,11,0.8)', fontWeight: 700, marginRight: 4, fontVariantNumeric: 'tabular-nums' }}>{nextRem.time}</span>
                            <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.35)' }}>({fmtCountdown(nextRem.mins)})</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── stats ── */}
          <div style={{ marginBottom: 10 }}>
            <p style={s.sec}>إحصائيات</p>
            <div className="grid grid-cols-4" style={{ gap: 4 }}>
              {[
                { l: 'الجلسة', v: fmtTime(elapsed), c: '#7c3aed' },
                { l: 'السرعة', v: speed, u: '/د', c: '#db2777' },
                { l: 'الهدف', v: target, c: '#a855f7' },
                { l: 'التقدم', v: Math.round(pct), u: '%', c: done ? '#059669' : '#6366f1' },
              ].map((st, i) => (
                <div key={i} className="rounded-md text-center" style={s.card}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.16)' }}>{st.l}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: st.c, lineHeight: '18px', fontVariantNumeric: 'tabular-nums' }}>{st.v}<span style={{ fontSize: 10, opacity: 0.5 }}>{st.u || ''}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* ── session bar ── */}
          <div style={{ marginBottom: 10 }}>
            <p style={s.sec}>تقدم الجلسة</p>
            <div className="flex" style={{ gap: 3 }}>
              {ADHKAR.map((_, i) => (
                <button key={i} onClick={() => setSel(i)} className="flex-1 rounded-sm" style={{
                  height: 6, transition: 'all 0.2s',
                  background: sel === i ? 'linear-gradient(90deg,#7c3aed,#db2777)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.015)',
                  boxShadow: sel === i ? '0 0 8px rgba(124,58,237,0.25)' : 'none',
                }} />
              ))}
            </div>
            <p className="text-center" style={{ fontSize: 10, color: 'rgba(255,255,255,0.12)', marginTop: 3 }}>{sel + 1}/{ADHKAR.length}</p>
          </div>

          {/* ── ayah ── */}
          <div className="mt-auto" style={{ paddingTop: 4 }}>
            <AnimatePresence mode="wait">
              <motion.div key={done ? 'd' : count > target * 0.5 ? 'm' : count > 0 ? 's' : 'z'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="rounded-lg text-center" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.006)', border: '1px solid rgba(255,255,255,0.015)' }}>
                <p style={{ fontSize: 13, lineHeight: 1.9, direction: 'rtl', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-naskh), "Amiri", serif' }}>
                  {count === 0 && '﴿ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا ﴾'}
                  {count > 0 && !done && count < target * 0.5 && '﴿ أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ ﴾'}
                  {count >= target * 0.5 && !done && '﴿ وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا ﴾'}
                  {done && '﴿ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيم ﴾'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ═══ completion toast ═══ */}
      <AnimatePresence>
        {showDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed z-40" style={{ bottom: 65, left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,5,16,0.97)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 12, padding: '8px 18px', boxShadow: '0 6px 28px rgba(0,0,0,0.5), 0 0 12px rgba(5,150,105,0.04)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>أحسنت! تم إتمام التسبيح</p>
                <p style={{ fontSize: 11, color: 'rgba(5,150,105,0.35)', marginTop: 1 }}>{opt.text} — بارك الله فيك</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ reminder toast ═══ */}
      <AnimatePresence>
        {remToast && (
          <motion.div initial={{ opacity: 0, y: -28, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -18, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed z-50" style={{ top: 56, left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,5,16,0.97)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 12, padding: '10px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(217,119,6,0.06)', backdropFilter: 'blur(16px)', minWidth: 250 }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(217,119,6,0.18),rgba(245,158,11,0.08))', border: '1px solid rgba(217,119,6,0.15)', fontSize: 16, flexShrink: 0 }}>🔔</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>حان وقت التسبيح</p>
                <p style={{ fontSize: 11, color: 'rgba(245,158,11,0.45)', direction: 'rtl', fontFamily: 'var(--font-naskh), "Amiri", serif' }}>{ADHKAR[sel].text}</p>
              </div>
              <button onClick={() => setRemToast(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', padding: '3px 5px' }}>✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
