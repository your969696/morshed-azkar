import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAzan, stopAzan, speakArabic, stopSpeaking, getAdhanAudio } from '../utils/sound';

let _remCtx = null;
function getRemCtx() {
  if (!_remCtx) _remCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_remCtx.state === 'suspended') _remCtx.resume();
  return _remCtx;
}

const ALL_TYPES = [
  { key: 'dhikr', emoji: '📿', label: 'ذكر', desc: 'أذكار وأوراد إسلامية', color: '#00c896' },
  { key: 'hadith', emoji: '📖', label: 'حديث', desc: 'أحاديث نبوية شريفة', color: '#8b5cf6' },
  { key: 'history', emoji: '📅', label: 'مثل هذا اليوم', desc: 'أحداث تاريخية إسلامية', color: '#3b82f6' },
  { key: 'deed', emoji: '⭐', label: 'أفضل الأعمال', desc: '积分 وفضائل', color: '#f0b040' },
  { key: 'behavior', emoji: '🕌', label: 'سلوك المسلم', desc: 'آداب وسلوكيات إسلامية', color: '#ec4899' },
];

const INTERVAL_OPTIONS = [
  { v: 15, l: '15 دقيقة', icon: '⚡' },
  { v: 30, l: '30 دقيقة', icon: '🕐' },
  { v: 60, l: 'ساعة', icon: '⏰' },
  { v: 90, l: 'ساعة ونصف', icon: '🕰' },
  { v: 120, l: 'ساعتان', icon: '🕕' },
];

const pageCss = `
@keyframes remFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes remSlide{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
.rem-page{background:#0c0818;min-height:100vh;padding:16px 16px 100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}
.rem-hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);border-radius:20px;padding:24px 20px;margin-bottom:20px;position:relative;overflow:hidden}
.rem-hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.15),transparent 70%);pointer-events:none}
.rem-hero-icon{font-size:48px;margin-bottom:12px}
.rem-hero-title{font-size:22px;font-weight:800;color:#fff;margin-bottom:4px}
.rem-hero-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.6}
.rem-section{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.rem-section-title{font-size:14px;font-weight:800;color:#f0b040;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.rem-toggle{width:44px;height:24px;border-radius:12px;border:none;position:relative;cursor:pointer;transition:all .3s;flex-shrink:0}
.rem-toggle.on{background:#00c896;box-shadow:0 0 10px rgba(0,200,150,.3)}
.rem-toggle.off{background:rgba(255,255,255,.1)}
.rem-toggle-dot{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:all .3s;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.rem-toggle.on .rem-toggle-dot{right:3px}
.rem-toggle.off .rem-toggle-dot{right:23px}
.rem-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.4);margin-bottom:8px;display:block}
.rem-chips{display:flex;gap:6px;flex-wrap:wrap}
.rem-chip{padding:6px 14px;border-radius:10px;font-size:11px;font-weight:700;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);cursor:pointer;font-family:inherit;transition:all .2s}
.rem-chip.on{background:rgba(0,200,150,.12);border-color:rgba(0,200,150,.25);color:#00c896}
.rem-divider{height:1px;background:rgba(255,255,255,.06);margin:8px 0}
.rem-note{font-size:10px;color:rgba(255,255,255,.3);line-height:1.6;padding:8px 12px;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.04);margin-top:8px}

/* Playlist */
.rem-playlist{display:flex;flex-direction:column;gap:6px}
.rem-pl-item{display:flex;align-items:center;gap:10px;padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;animation:remSlide .3s ease;transition:all .2s}
.rem-pl-item:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1)}
.rem-pl-item.active{border-color:rgba(0,200,150,.2);background:rgba(0,200,150,.04)}
.rem-pl-num{width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:rgba(255,255,255,.3);flex-shrink:0}
.rem-pl-item.active .rem-pl-num{background:rgba(0,200,150,.15);color:#00c896}
.rem-pl-icon{font-size:24px;flex-shrink:0;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.rem-pl-info{flex:1;min-width:0}
.rem-pl-name{font-size:13px;font-weight:700;color:#fff}
.rem-pl-desc{font-size:10px;color:rgba(255,255,255,.35);margin-top:1px}
.rem-pl-actions{display:flex;gap:4px;flex-shrink:0}
.rem-pl-btn{width:32px;height:32px;border-radius:8px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:all .2s;background:rgba(255,255,255,.05);color:rgba(255,255,255,.4)}
.rem-pl-btn:hover{background:rgba(255,255,255,.1);color:#fff}
.rem-pl-btn.up:hover{background:rgba(0,200,150,.15);color:#00c896}
.rem-pl-btn.down:hover{background:rgba(0,200,150,.15);color:#00c896}
.rem-pl-btn.remove:hover{background:rgba(239,68,68,.15);color:#ef4444}
.rem-pl-btn.restore{background:rgba(0,200,150,.1);color:#00c896}

/* Removed items */
.rem-removed{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.rem-removed-item{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.1);cursor:pointer;transition:all .2s}
.rem-removed-item:hover{border-color:rgba(0,200,150,.3);background:rgba(0,200,150,.06)}
.rem-removed-item span{font-size:11px;color:rgba(255,255,255,.4)}
.rem-removed-item:hover span{color:#00c896}
.rem-add-icon{width:24px;height:24px;border-radius:6px;background:rgba(0,200,150,.1);display:flex;align-items:center;justify-content:center;color:#00c896;font-size:14px;font-weight:700}

/* Preview */
.rem-preview{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px;margin-top:12px}
.rem-preview-title{font-size:12px;font-weight:800;color:#f0b040;margin-bottom:8px}
.rem-preview-text{font-size:11px;color:rgba(255,255,255,.5);line-height:1.8}
.rem-preview-item{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.rem-preview-item:last-child{border-bottom:none}
.rem-preview-emoji{font-size:16px;flex-shrink:0}
.rem-empty{text-align:center;padding:20px;color:rgba(255,255,255,.25);font-size:12px}
.rem-test-btn{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);cursor:pointer;font-family:inherit;transition:all .2s;width:100%}
.rem-test-btn:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1)}
.rem-test-btn:active{transform:scale(.97)}
.rem-test-btn.testing{animation:remPulse 1s ease infinite}
@keyframes remPulse{0%,100%{opacity:1}50%{opacity:.6}}
.rem-test-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.rem-test-info{flex:1;text-align:right}
.rem-test-name{font-size:13px;font-weight:700;color:#fff}
.rem-test-desc{font-size:10px;color:rgba(255,255,255,.35);margin-top:2px}
.rem-test-play{padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .2s}
.rem-test-play.start{background:rgba(0,200,150,.12);color:#00c896;border:1px solid rgba(0,200,150,.2)}
.rem-test-play.start:hover{background:rgba(0,200,150,.2)}
.rem-test-play.stop{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
.rem-test-play.stop:hover{background:rgba(239,68,68,.2)}
@keyframes remCountPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
`;

function Toggle({ enabled, onToggle }) {
  return (
    <button className={`rem-toggle ${enabled ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="rem-toggle-dot" />
    </button>
  );
}

export default function Reminders() {
  const [hourlyEnabled, setHourlyEnabled] = useState(() => {
    const v = localStorage.getItem('hourlyOverlayEnabled');
    if (v === null) { localStorage.setItem('hourlyOverlayEnabled', 'true'); return true; }
    return v !== 'false';
  });
  const [hourlyInterval, setHourlyInterval] = useState(() => parseInt(localStorage.getItem('hourlyOverlayInterval') || '30'));
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const v = localStorage.getItem('hourlyOverlayAutoSpeak');
    if (v === null) { localStorage.setItem('hourlyOverlayAutoSpeak', 'true'); return true; }
    return v !== 'false';
  });
  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    const v = localStorage.getItem('adhanEnabled');
    if (v === null) { localStorage.setItem('adhanEnabled', 'true'); return true; }
    return v !== 'false';
  });
  const [wuduReminder, setWuduReminder] = useState(() => {
    const v = localStorage.getItem('wuduReminderEnabled');
    if (v === null) { localStorage.setItem('wuduReminderEnabled', 'true'); return true; }
    return v !== 'false';
  });
  const [wuduMinutes, setWuduMinutes] = useState(() => parseInt(localStorage.getItem('wuduReminderMinutes') || '5'));
  const [countdownEnabled, setCountdownEnabled] = useState(() => {
    const v = localStorage.getItem('prayerCountdownEnabled');
    if (v === null) { localStorage.setItem('prayerCountdownEnabled', 'true'); return true; }
    return v !== 'false';
  });
  const [oneMinReminder, setOneMinReminder] = useState(() => {
    const v = localStorage.getItem('oneMinReminderEnabled');
    if (v === null) { localStorage.setItem('oneMinReminderEnabled', 'true'); return true; }
    return v !== 'false';
  });
  const [sleepMode, setSleepMode] = useState(() => {
    return localStorage.getItem('sleepMode') === 'true';
  });
  const [autoSleep, setAutoSleep] = useState(() => {
    const v = localStorage.getItem('autoSleepMode');
    if (v === null) { localStorage.setItem('autoSleepMode', 'true'); return true; }
    return v !== 'false';
  });
  const [qiyamEnabled, setQiyamEnabled] = useState(() => {
    const v = localStorage.getItem('qiyamEnabled');
    if (v === null) { localStorage.setItem('qiyamEnabled', 'true'); return true; }
    return v !== 'false';
  });

  // Auto sleep mode: 10 PM to 10 AM
  useEffect(() => {
    if (!autoSleep) return;
    const check = () => {
      const h = new Date().getHours();
      const inSleep = h >= 22 || h < 10;
      if (inSleep !== sleepMode) setSleepMode(inSleep);
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [autoSleep]);

  // Playlist state
  const [playlist, setPlaylist] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem('reminderPlaylist'));
      if (v && v.length > 0) return v;
    } catch {}
    return ALL_TYPES.map(t => t.key);
  });
  const [removedItems, setRemovedItems] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem('reminderRemoved'));
      return v || [];
    } catch { return []; }
  });

  // Save to localStorage
  useEffect(() => { localStorage.setItem('hourlyOverlayEnabled', hourlyEnabled.toString()); }, [hourlyEnabled]);
  useEffect(() => { localStorage.setItem('hourlyOverlayInterval', hourlyInterval.toString()); }, [hourlyInterval]);
  useEffect(() => { localStorage.setItem('hourlyOverlayAutoSpeak', autoSpeak.toString()); }, [autoSpeak]);
  useEffect(() => { localStorage.setItem('adhanEnabled', adhanEnabled.toString()); }, [adhanEnabled]);
  useEffect(() => { localStorage.setItem('wuduReminderEnabled', wuduReminder.toString()); }, [wuduReminder]);
  useEffect(() => { localStorage.setItem('wuduReminderMinutes', wuduMinutes.toString()); }, [wuduMinutes]);
  useEffect(() => { localStorage.setItem('prayerCountdownEnabled', countdownEnabled.toString()); }, [countdownEnabled]);
  useEffect(() => { localStorage.setItem('oneMinReminderEnabled', oneMinReminder.toString()); }, [oneMinReminder]);
  useEffect(() => { localStorage.setItem('sleepMode', sleepMode.toString()); }, [sleepMode]);
  useEffect(() => { localStorage.setItem('autoSleepMode', autoSleep.toString()); }, [autoSleep]);
  useEffect(() => { localStorage.setItem('qiyamEnabled', qiyamEnabled.toString()); }, [qiyamEnabled]);
  useEffect(() => { localStorage.setItem('reminderPlaylist', JSON.stringify(playlist)); }, [playlist]);
  useEffect(() => { localStorage.setItem('reminderRemoved', JSON.stringify(removedItems)); }, [removedItems]);

  // Sync with Electron
  useEffect(() => {
    if (window.electronAPI?.isElectron) {
      const INTERVAL_MAP = { 15: 900000, 30: 1800000, 60: 3600000, 90: 5400000, 120: 7200000 };
      const ms = INTERVAL_MAP[hourlyInterval] || INTERVAL_MAP[30];
      window.electronAPI.setReminderInterval('hourly', ms, hourlyEnabled);
    }
  }, [hourlyEnabled, hourlyInterval]);

  // Playlist actions
  const moveUp = (idx) => {
    if (idx === 0) return;
    setPlaylist(prev => { const next = [...prev]; [next[idx-1], next[idx]] = [next[idx], next[idx-1]]; return next; });
  };
  const moveDown = (idx) => {
    if (idx === playlist.length - 1) return;
    setPlaylist(prev => { const next = [...prev]; [next[idx], next[idx+1]] = [next[idx+1], next[idx]]; return next; });
  };
  const removeFromPlaylist = (key) => {
    setPlaylist(prev => prev.filter(k => k !== key));
    setRemovedItems(prev => prev.includes(key) ? prev : [...prev, key]);
  };
  const restoreToPlaylist = (key) => {
    setRemovedItems(prev => prev.filter(k => k !== key));
    setPlaylist(prev => [...prev, key]);
  };
  const getTypeInfo = (key) => ALL_TYPES.find(t => t.key === key);

  // Test state
  const [testing, setTesting] = useState(null);
  const testTimerRef = useRef(null);
  const testAudioRef = useRef(null);
  const [adhanProgress, setAdhanProgress] = useState(0);
  const [adhanDuration, setAdhanDuration] = useState(0);
  const adhanTrackRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  const playTestBeep = () => {
    try {
      const ctx = getRemCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { console.error('Beep error:', e); }
  };

  const playCountdownBeep = (num) => {
    try {
      const ctx = getRemCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = num === 0 ? 1000 : 600;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const stopTest = () => {
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current = null;
    }
    stopAzan();
    stopSpeaking();
    setTesting(null);
    setCountdown(0);
    setAdhanProgress(0);
    setAdhanDuration(0);
    if (testTimerRef.current) clearTimeout(testTimerRef.current);
    if (adhanTrackRef.current) clearInterval(adhanTrackRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startAdhanPlay = () => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1;
    testAudioRef.current = audio;
    audio.oncanplaythrough = () => {
      audio.oncanplaythrough = null;
      audio.play().catch(e => console.error('Adhan test error:', e));
    };
    audio.onended = () => {
      setTesting(null);
      setAdhanProgress(0);
      setAdhanDuration(0);
    };
    audio.src = 'adhan1.mp3';
    audio.load();
    setTesting('adhan');
    adhanTrackRef.current = setInterval(() => {
      if (audio && !audio.paused) {
        setAdhanProgress(audio.currentTime);
        setAdhanDuration(audio.duration || 0);
      } else if (!audio || audio.ended) {
        clearInterval(adhanTrackRef.current);
        setAdhanProgress(0);
        setAdhanDuration(0);
      }
    }, 500);
  };

  const testNotification = (type) => {
    stopTest();
    if (type === 'adhan') {
      setTesting('countdown');
      let count = 10;
      setCountdown(count);
      playCountdownBeep(count);
      countdownRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        playCountdownBeep(count);
        if (count <= 0) {
          clearInterval(countdownRef.current);
          setCountdown(0);
          startAdhanPlay();
        }
      }, 1000);
    } else if (type === 'wudu') {
      setTesting('wudu');
      speakArabic('توضأ الآن، الصلاة بعد خمس دقائق', () => stopTest());
    } else if (type === 'oneMin') {
      setTesting('oneMin');
      speakArabic('الصلاة بعد دقيقة واحدة! استعد للصلاة', () => stopTest());
    } else if (type === 'khushu') {
      setTesting('khushu');
      speakArabic('أخضع لله وaciّه في صلاتك. اقرأ بخشوع', () => stopTest());
    } else if (type === 'dhikr') {
      setTesting('dhikr');
      speakArabic('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللّهِ الْعَظِيمِ', () => stopTest());
    } else if (type === 'hadith') {
      setTesting('hadith');
      speakArabic('إنّما الأعمال بالنيات، وإنّما لكل امرئ ما نوى', () => stopTest());
    } else if (type === 'history') {
      speakArabic('في هذا اليوم من التاريخ، فتح المسلمون مدينة قرطبة', () => stopTest());
    } else if (type === 'deed') {
      speakArabic('أحب الأعمال إلى الله أدومها وإن قلّ', () => stopTest());
    } else if (type === 'behavior') {
      speakArabic('اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها', () => stopTest());
    } else if (type === 'beep') {
      playTestBeep();
      testTimerRef.current = setTimeout(() => stopTest(), 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (adhanTrackRef.current) clearInterval(adhanTrackRef.current);
      if (testAudioRef.current) { testAudioRef.current.pause(); testAudioRef.current = null; }
    };
  }, []);

  return (
    <>
      <style>{pageCss}</style>
      <div className="rem-page">
        <motion.div className="rem-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rem-hero-icon">🔔</div>
          <h1 className="rem-hero-title">إعدادات التنبيهات</h1>
          <p className="rem-hero-sub">تحكم في التنبيهات ورتب البلاي لست كما تحب</p>
        </motion.div>

        {/* Sleep Mode */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={sleepMode ? { border: '1px solid rgba(139,92,246,.3)', background: 'linear-gradient(135deg,rgba(139,92,246,.08),rgba(15,10,30,.95))' } : {}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: sleepMode ? 'rgba(139,92,246,.2)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, transition: 'all .3s' }}>
                {sleepMode ? '🌙' : '☀️'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: sleepMode ? '#a78bfa' : '#fff' }}>مود النوم</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                  {sleepMode ? 'التذكيرات متوقفة — مواقيت الصلاة فقط' : 'جميع التنبيهات تعمل بشكل طبيعي'}
                </div>
              </div>
            </div>
            <Toggle enabled={sleepMode} onToggle={() => { setSleepMode(!sleepMode); setAutoSleep(false); }} />
          </div>

          <div className="rem-divider" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>⏰ تلقائي (10م - 10ص)</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تشغيل/إيقاف تلقائيًا كل يوم</div>
            </div>
            <Toggle enabled={autoSleep} onToggle={() => setAutoSleep(!autoSleep)} />
          </div>

          {sleepMode && (
            <div className="rem-note" style={{ marginTop: 12, borderColor: 'rgba(139,92,246,.2)', background: 'rgba(139,92,246,.05)' }}>
              <span style={{ color: '#a78bfa' }}>🌙</span> التنبيهات الدورية (أحاديث، أذكار، سلوكيات) متوقفة. مواقيت الصلاة والأذان تعمل بشكل طبيعي.
            </div>
          )}
        </motion.div>

        {/* Playlist Section */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rem-section-title">📋 بلاي لست التنبيهات</div>
          <div className="rem-label">ترتيب التنبيهات — اضغط ⬆⬇ للتحريك، ✕ للحذف</div>

          {playlist.length === 0 ? (
            <div className="rem-empty">لا توجد تنبيهات في البلاي لست</div>
          ) : (
            <div className="rem-playlist">
              <AnimatePresence>
                {playlist.map((key, idx) => {
                  const t = getTypeInfo(key);
                  if (!t) return null;
                  return (
                    <motion.div key={key} className="rem-pl-item active" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      <div className="rem-pl-num">{idx + 1}</div>
                      <div className="rem-pl-icon" style={{ background: `${t.color}15` }}>{t.emoji}</div>
                      <div className="rem-pl-info">
                        <div className="rem-pl-name" style={{ color: t.color }}>{t.label}</div>
                        <div className="rem-pl-desc">{t.desc}</div>
                      </div>
                      <div className="rem-pl-actions">
                        <button className="rem-pl-btn up" onClick={() => moveUp(idx)} disabled={idx === 0}>⬆</button>
                        <button className="rem-pl-btn down" onClick={() => moveDown(idx)} disabled={idx === playlist.length - 1}>⬇</button>
                        <button className="rem-pl-btn remove" onClick={() => removeFromPlaylist(key)}>✕</button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {removedItems.length > 0 && (
            <>
              <div className="rem-divider" />
              <div className="rem-label">🗑️ محذوفات — اضغط لإعادتها</div>
              <div className="rem-removed">
                {removedItems.map(key => {
                  const t = getTypeInfo(key);
                  if (!t) return null;
                  return (
                    <div key={key} className="rem-removed-item" onClick={() => restoreToPlaylist(key)}>
                      <div className="rem-add-icon">+</div>
                      <span>{t.emoji} {t.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Hourly Settings */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="rem-section-title">⏰ إعدادات التكرار</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>التنبيهات الدورية</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تذكيرات إسلامية تلقائية</div>
            </div>
            <Toggle enabled={hourlyEnabled} onToggle={() => setHourlyEnabled(!hourlyEnabled)} />
          </div>

          {hourlyEnabled && (
            <>
              <div className="rem-divider" />
              <div style={{ padding: '8px 0' }}>
                <div className="rem-label">⏰ كل كم مرة</div>
                <div className="rem-chips">
                  {INTERVAL_OPTIONS.map(o => (
                    <button key={o.v} onClick={() => setHourlyInterval(o.v)} className={`rem-chip ${hourlyInterval === o.v ? 'on' : ''}`}>
                      {o.icon} {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rem-divider" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🔊 الصوت التلقائي</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تشغيل الصوت مع التنبيه</div>
                </div>
                <Toggle enabled={autoSpeak} onToggle={() => setAutoSpeak(!autoSpeak)} />
              </div>
            </>
          )}
        </motion.div>

        {/* Adhan */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rem-section-title">🕌 الأذان والوضوء</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🕌 تشغيل الأذان</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>أذان كامل عند دخول الوقت</div>
            </div>
            <Toggle enabled={adhanEnabled} onToggle={() => setAdhanEnabled(!adhanEnabled)} />
          </div>

          <div className="rem-divider" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>💧 تنبيه الوضوء</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تذكير قبل الصلاة بالتوضؤ</div>
            </div>
            <Toggle enabled={wuduReminder} onToggle={() => setWuduReminder(!wuduReminder)} />
          </div>

          {wuduReminder && (
            <div style={{ padding: '4px 0 8px' }}>
              <div className="rem-label">⏰ قبل الصلاة بـ</div>
              <div className="rem-chips">
                {[3, 5, 10, 15].map(m => (
                  <button key={m} onClick={() => setWuduMinutes(m)} className={`rem-chip ${wuduMinutes === m ? 'on' : ''}`}>{m} دقائق</button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Qiyam al-Layl */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          style={qiyamEnabled ? { border: '1px solid rgba(139,92,246,.2)', background: 'linear-gradient(135deg,rgba(139,92,246,.05),rgba(15,10,30,.95))' } : {}}>
          <div className="rem-section-title">🌙 قيام الليل</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: qiyamEnabled ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, transition: 'all .3s' }}>
                🌙
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>تنبيه قيام الليل</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تذكير في آخر ثلث الليل بالقيام</div>
              </div>
            </div>
            <Toggle enabled={qiyamEnabled} onToggle={() => setQiyamEnabled(!qiyamEnabled)} />
          </div>

          {qiyamEnabled && (
            <div className="rem-note" style={{ marginTop: 12, borderColor: 'rgba(139,92,246,.2)', background: 'rgba(139,92,246,.05)' }}>
              <span style={{ color: '#a78bfa' }}>🌙</span> يظهر تنبيه في آخر ثلث الليل (قبل الفجر) مع حديث نبوي.
            </div>
          )}
        </motion.div>

        {/* Countdown */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="rem-section-title">⏰ العد التنازلي</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>📈 العد التنازلي</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>شريط في أعلى الشاشة</div>
            </div>
            <Toggle enabled={countdownEnabled} onToggle={() => setCountdownEnabled(!countdownEnabled)} />
          </div>

          <div className="rem-divider" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🔴 تنبيه الدقيقة الأخيرة</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>تنبيه صوتي قبل الصلاة بدقيقة</div>
            </div>
            <Toggle enabled={oneMinReminder} onToggle={() => setOneMinReminder(!oneMinReminder)} />
          </div>
        </motion.div>

        {/* Test Section */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div className="rem-section-title">🧪 اختبار التنبيهات</div>
          <div className="rem-label">اضغط على أي زرار عشان تسمع التنبيه كما سيظهر</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="rem-test-btn" style={testing === 'beep' ? { borderColor: 'rgba(59,130,246,.3)', background: 'rgba(59,130,246,.06)' } : {}}>
              <div className="rem-test-icon" style={{ background: 'rgba(59,130,246,.12)' }}>🔊</div>
              <div className="rem-test-info">
                <div className="rem-test-name">فحص الصوت</div>
                <div className="rem-test-desc">صوت اختبار عشان تتأكد السماعة شغالة</div>
              </div>
              <button className={`rem-test-play ${testing === 'beep' ? 'stop' : 'start'}`}
                onClick={() => testing === 'beep' ? stopTest() : testNotification('beep')}>
                {testing === 'beep' ? '⏹' : '▶ فحص'}
              </button>
            </div>
            <div className="rem-test-btn" style={testing === 'adhan' || testing === 'countdown' ? { borderColor: 'rgba(139,92,246,.3)', background: 'rgba(139,92,246,.06)' } : {}}>
              <div className="rem-test-icon" style={{ background: 'rgba(139,92,246,.12)', fontSize: countdown > 0 ? 28 : 24 }}>
                {countdown > 0 ? <span style={{ color: '#a78bfa', fontWeight: 900, fontSize: 28 }}>{countdown}</span> : '🕌'}
              </div>
              <div className="rem-test-info">
                <div className="rem-test-name">
                  {countdown > 0 ? `جاري العد... ${countdown}` : 'الأذان'}
                </div>
                <div className="rem-test-desc">
                  {testing === 'countdown' && countdown > 0
                    ? 'استعد... الأذان بعد ثواني'
                    : testing === 'adhan' && adhanDuration > 0
                    ? `${Math.floor(adhanProgress / 60)}:${String(Math.floor(adhanProgress % 60)).padStart(2, '0')} / ${Math.floor(adhanDuration / 60)}:${String(Math.floor(adhanDuration % 60)).padStart(2, '0')}`
                    : 'عد تنازلي 3 ثواني ثم الأذان الكامل'}
                </div>
                {testing === 'adhan' && adhanDuration > 0 && (
                  <div style={{ height: 3, borderRadius: 3, background: 'rgba(139,92,246,.15)', marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${(adhanProgress / adhanDuration) * 100}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', transition: 'width .5s linear' }} />
                  </div>
                )}
              </div>
              <button className={`rem-test-play ${(testing === 'adhan' || testing === 'countdown') ? 'stop' : 'start'}`}
                onClick={() => (testing === 'adhan' || testing === 'countdown') ? stopTest() : testNotification('adhan')}>
                {(testing === 'adhan' || testing === 'countdown') ? '⏹ إيقاف' : '▶ اختبار'}
              </button>
            </div>

            <div className="rem-test-btn" style={testing === 'wudu' ? { borderColor: 'rgba(0,200,150,.3)', background: 'rgba(0,200,150,.06)' } : {}}>
              <div className="rem-test-icon" style={{ background: 'rgba(0,200,150,.12)' }}>💧</div>
              <div className="rem-test-info">
                <div className="rem-test-name">تنبيه الوضوء</div>
                <div className="rem-test-desc">تذكير قبل الصلاة بالتوضؤ</div>
              </div>
              <button className={`rem-test-play ${testing === 'wudu' ? 'stop' : 'start'}`}
                onClick={() => testing === 'wudu' ? stopTest() : testNotification('wudu')}>
                {testing === 'wudu' ? '⏹ إيقاف' : '▶ تشغيل'}
              </button>
            </div>

            <div className="rem-test-btn" style={testing === 'oneMin' ? { borderColor: 'rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)' } : {}}>
              <div className="rem-test-icon" style={{ background: 'rgba(239,68,68,.12)' }}>🔴</div>
              <div className="rem-test-info">
                <div className="rem-test-name">الدقيقة الأخيرة</div>
                <div className="rem-test-desc">تنبيه صوتي قبل الصلاة بدقيقة</div>
              </div>
              <button className={`rem-test-play ${testing === 'oneMin' ? 'stop' : 'start'}`}
                onClick={() => testing === 'oneMin' ? stopTest() : testNotification('oneMin')}>
                {testing === 'oneMin' ? '⏹ إيقاف' : '▶ تشغيل'}
              </button>
            </div>

            <div className="rem-test-btn" style={testing === 'khushu' ? { borderColor: 'rgba(240,176,64,.3)', background: 'rgba(240,176,64,.06)' } : {}}>
              <div className="rem-test-icon" style={{ background: 'rgba(240,176,64,.12)' }}>🤲</div>
              <div className="rem-test-info">
                <div className="rem-test-name">الخشوع</div>
                <div className="rem-test-desc">تذكير بالخشوع أثناء الصلاة</div>
              </div>
              <button className={`rem-test-play ${testing === 'khushu' ? 'stop' : 'start'}`}
                onClick={() => testing === 'khushu' ? stopTest() : testNotification('khushu')}>
                {testing === 'khushu' ? '⏹ إيقاف' : '▶ تشغيل'}
              </button>
            </div>

            {playlist.map((key, idx) => {
              const t = getTypeInfo(key);
              if (!t) return null;
              return (
                <div key={key} className="rem-test-btn" style={testing === key ? { borderColor: `${t.color}40`, background: `${t.color}08` } : {}}>
                  <div className="rem-test-icon" style={{ background: `${t.color}15` }}>{t.emoji}</div>
                  <div className="rem-test-info">
                    <div className="rem-test-name" style={{ color: t.color }}>{t.label}</div>
                    <div className="rem-test-desc">{t.desc}</div>
                  </div>
                  <button className={`rem-test-play ${testing === key ? 'stop' : 'start'}`}
                    onClick={() => testing === key ? stopTest() : testNotification(key)}>
                    {testing === key ? '⏹ إيقاف' : '▶ اختبار'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div className="rem-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ border: '1px solid rgba(240,176,64,.15)', background: 'rgba(240,176,64,.04)' }}>
          <div className="rem-section-title" style={{ color: '#f0b040' }}>💡 كيف تعمل البلاي لست</div>
          <div className="rem-preview-text" style={{ lineHeight: 2.2 }}>
            • البلاي لست تحدد أي نوع تنبيه يظهر أولاً<br/>
            • التنبيهات تظهر بالترتيب من أعلى لأسفل<br/>
            • اضغط ⬆⬇ عشان تغير الترتيب<br/>
            • اضغط ✕ عشان تشيل تنبيه من البلاي لست<br/>
            • المحذوفات تظهر تحت — اضغط لإضافتها تاني<br/>
            • يمكنك تفعيل/إيقاف كل تنبيه على حدة
          </div>
        </motion.div>
      </div>
    </>
  );
}
