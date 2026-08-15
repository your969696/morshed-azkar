import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { playAzan, stopAzan, isAzanPlaying } from '../utils/sound';
import { speakArabic, stopSpeaking } from '../utils/sound';

const pageCss = `
@keyframes adhanPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.4)}50%{box-shadow:0 0 0 20px rgba(139,92,246,0)}}
@keyframes adhanSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes adhanWave{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.at-page{background:#0c0818;min-height:100vh;padding:16px 16px 100px;font-family:'Segoe UI',Tahoma,sans-serif;color:#fff;direction:rtl}
.at-hero{background:linear-gradient(170deg,#1c1040 0%,#0c0818 100%);border-radius:20px;padding:24px 20px;margin-bottom:20px;position:relative;overflow:hidden}
.at-hero::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.15),transparent 70%);pointer-events:none}
.at-hero-icon{font-size:48px;margin-bottom:12px;animation:adhanWave 2s ease infinite}
.at-hero-title{font-size:22px;font-weight:800;color:#fff;margin-bottom:4px}
.at-hero-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.6}
.at-section{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:20px;margin-bottom:16px}
.at-section-title{font-size:14px;font-weight:800;color:#f0b040;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.at-btn{padding:14px 28px;border-radius:14px;border:none;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:10px;width:100%}
.at-btn-play{background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:#fff;box-shadow:0 4px 20px rgba(139,92,246,.3)}
.at-btn-play:hover{box-shadow:0 4px 28px rgba(139,92,246,.5);transform:scale(1.02)}
.at-btn-play:active{transform:scale(.98)}
.at-btn-play.playing{animation:adhanPulse 2s ease infinite;background:linear-gradient(135deg,#6d28d9,#7c3aed)}
.at-btn-stop{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.2);color:#ef4444}
.at-btn-stop:hover{background:rgba(239,68,68,.2)}
.at-btn-speak{background:rgba(0,200,150,.12);border:1px solid rgba(0,200,150,.2);color:#00c896}
.at-btn-speak:hover{background:rgba(0,200,150,.2)}
.at-btn-speak.speaking{animation:adhanWave 1s ease infinite;background:rgba(0,200,150,.2)}
.at-vis{height:80px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);display:flex;align-items:flex-end;justify-content:center;gap:3px;padding:0 20px;overflow:hidden;margin-top:16px}
.at-vis-bar{width:6px;border-radius:3px;background:linear-gradient(180deg,#8b5cf6,#a78bfa);transition:height .15s ease;min-height:4px}
.at-mosque{font-size:64px;text-align:center;margin:20px 0;transition:all .3s}
.at-mosque.playing{animation:adhanSpin 8s linear infinite}
.at-status{text-align:center;padding:10px;border-radius:10px;font-size:12px;font-weight:700;margin-top:12px}
.at-status.playing{background:rgba(139,92,246,.12);color:#a78bfa}
.at-status.idle{background:rgba(255,255,255,.04);color:rgba(255,255,255,.3)}
.at-divider{height:1px;background:rgba(255,255,255,.06);margin:12px 0}
.at-event-log{max-height:200px;overflow-y:auto;direction:ltr;text-align:left}
.at-log-item{padding:6px 10px;border-radius:8px;font-size:11px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px;animation:cdFadeIn .3s ease}
.at-log-item.prayer{background:rgba(139,92,246,.08);color:#a78bfa}
.at-log-item.wudu{background:rgba(0,200,150,.08);color:#00c896}
.at-log-item.oneMin{background:rgba(239,68,68,.08);color:#ef4444}
.at-log-item.khushu{background:rgba(240,176,64,.08);color:#f0b040}
.at-log-time{color:rgba(255,255,255,.2);font-size:10px;margin-left:auto}
.at-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.at-chip{padding:8px 16px;border-radius:10px;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);cursor:pointer;font-family:inherit;transition:all .2s}
.at-chip.on{background:rgba(139,92,246,.12);border-color:rgba(139,92,246,.25);color:#a78bfa}
.at-slider{width:100%;appearance:none;height:6px;border-radius:3px;background:rgba(255,255,255,.1);outline:none;margin:8px 0}
.at-slider::-webkit-slider-thumb{appearance:none;width:20px;height:20px;border-radius:50%;background:#8b5cf6;cursor:pointer}
`;

const AZAN_TEXTS = [
  'الله أكبر الله أكبر',
  'الله أكبر الله أكبر',
  'أشهد أن لا إله إلا الله',
  'أشهد أن لا إله إلا الله',
  'أشهد أن محمدًا رسول الله',
  'أشهد أن محمدًا رسول الله',
  'حي على الصلاة',
  'حي على الصلاة',
  'حي على الفلاح',
  'حي على الفلاح',
  'الله أكبر الله أكبر',
  'لا إله إلا الله',
];

const TEST_SCENARIOS = [
  { key: 'adhan', emoji: '🕌', label: 'الأذان', desc: 'تشغيل الأذان الكامل', color: '#8b5cf6' },
  { key: 'wudu', emoji: '💧', label: 'تنبيه الوضوء', desc: 'تذكير قبل الصلاة بدقيقة', color: '#00c896' },
  { key: 'oneMin', emoji: '🔴', label: 'الدقيقة الأخيرة', desc: 'تنبيه قبل الصلاة بدقيقة', color: '#ef4444' },
  { key: 'khushu', emoji: '🤲', label: 'الخشوع', desc: 'تذكير بالخشوع أثناء الصلاة', color: '#f0b040' },
];

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AdhanTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visBars, setVisBars] = useState(Array(30).fill(4));
  const [eventLog, setEventLog] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [countdownValue, setCountdownValue] = useState(60);
  const visRef = useRef(null);
  const logRef = useRef(null);

  const addLog = (type, text) => {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLog(prev => [{ type, text, time }, ...prev].slice(0, 50));
  };

  const handlePlayAzan = () => {
    if (isPlaying) {
      stopAzan();
      setIsPlaying(false);
      setActiveScenario(null);
      addLog('prayer', '⏹ تم إيقاف الأذان');
    } else {
      playAzan();
      setIsPlaying(true);
      setActiveScenario('adhan');
      addLog('prayer', '🕌 تشغيل الأذان');
    }
  };

  const handleStop = () => {
    stopAzan();
    stopSpeaking();
    setIsPlaying(false);
    setIsSpeaking(false);
    setActiveScenario(null);
    addLog('prayer', '⏹ تم الإيقاف');
  };

  const handleTestScenario = (scenario) => {
    handleStop();
    setTimeout(() => {
      if (scenario.key === 'adhan') {
        playAzan();
        setIsPlaying(true);
        setActiveScenario('adhan');
        addLog('prayer', '🕌 اختبار الأذان');
      } else if (scenario.key === 'wudu') {
        setActiveScenario('wudu');
        setIsSpeaking(true);
        addLog('wudu', '💧 اختبار تنبيه الوضوء');
        speakArabic('توضأ الآن، الصلاة بعد خمس دقائق', () => setIsSpeaking(false));
      } else if (scenario.key === 'oneMin') {
        setActiveScenario('oneMin');
        setIsSpeaking(true);
        addLog('oneMin', '🔴 اختبار التنبيه العاجل');
        speakArabic('الصلاة بعد دقيقة واحدة! استعد للصلاة', () => setIsSpeaking(false));
      } else if (scenario.key === 'khushu') {
        setActiveScenario('khushu');
        setIsSpeaking(true);
        addLog('khushu', '🤲 اختبار تنبيه الخشوع');
        speakArabic('أخضع لله وaciّه في صلاتك. اقرأ بخشوع', () => setIsSpeaking(false));
      }
    }, 200);
  };

  const handleSimulateCountdown = () => {
    handleStop();
    let sec = countdownValue;
    addLog('prayer', `⏰ محاكاة العد التنازلي من ${sec} ثانية`);
    const iv = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(iv);
        addLog('prayer', '🕌 حان وقت الصلاة!');
        playAzan();
        setIsPlaying(true);
        setActiveScenario('adhan');
        return;
      }
      if (sec === 60) {
        addLog('oneMin', '🔴 تبقت دقيقة واحدة!');
        speakArabic('الصلاة بعد دقيقة واحدة!');
      }
      if (sec === 300) {
        addLog('wudu', '💧 تبقت 5 دقائق - توضأ الآن');
        speakArabic('توضأ الآن، الصلاة بعد خمس دقائق');
      }
    }, 1000);
  };

  // Visualizer
  useEffect(() => {
    if (!isPlaying) {
      setVisBars(Array(30).fill(4));
      return;
    }
    const iv = setInterval(() => {
      setVisBars(prev => prev.map(() => Math.random() * 60 + 4));
    }, 150);
    return () => clearInterval(iv);
  }, [isPlaying]);

  // Progress tracking
  useEffect(() => {
    const iv = setInterval(() => {
      const a = document.querySelector('audio');
      if (a && !a.paused) {
        setCurrentTime(a.currentTime);
        setDuration(a.duration || 0);
      }
    }, 300);
    return () => clearInterval(iv);
  }, []);

  // Auto scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [eventLog]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <style>{pageCss}</style>
      <div className="at-page">
        <motion.div className="at-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="at-hero-icon">🕌</div>
          <h1 className="at-hero-title">تجربة الأذان</h1>
          <p className="at-hero-sub">اختبر الأذان والتنبيهات كما ستظهر في التطبيق</p>
        </motion.div>

        {/* Main Player */}
        <motion.div className="at-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="at-section-title">🕌 مشغل الأذان</div>

          <div className={`at-mosque ${isPlaying ? 'playing' : ''}`}>🕌</div>

          {/* Visualizer */}
          <div className="at-vis">
            {visBars.map((h, i) => (
              <div key={i} className="at-vis-bar" style={{ height: `${h}px` }} />
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 12, cursor: 'pointer' }} onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            const a = document.querySelector('audio');
            if (a) a.currentTime = pct * (a.duration || 0);
          }}>
            <div style={{ width: '100%', height: 4, borderRadius: 4, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', transition: 'width .3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{formatTime(currentTime)}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{formatTime(duration)}</span>
            </div>
          </div>

          <div className={`at-status ${isPlaying ? 'playing' : 'idle'}`}>
            {isPlaying ? '🎵 يتم تشغيل الأذان...' : '⏸ في الانتظار'}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className={`at-btn at-btn-play ${isPlaying ? 'playing' : ''}`} onClick={handlePlayAzan}>
              {isPlaying ? '⏸ إيقاف مؤقت' : '▶ تشغيل الأذان'}
            </button>
            <button className="at-btn at-btn-stop" onClick={handleStop} style={{ width: 56, flexShrink: 0 }}>
              ⏹
            </button>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 16 }}>🔈</span>
            <input type="range" className="at-slider" min="0" max="1" step="0.1" value={volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); const a = document.querySelector('audio'); if (a) a.volume = parseFloat(e.target.value); }} />
            <span style={{ fontSize: 16 }}>🔊</span>
          </div>
        </motion.div>

        {/* Test Scenarios */}
        <motion.div className="at-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="at-section-title">🧪 اختبار السيناريوهات</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TEST_SCENARIOS.map(s => (
              <button key={s.key} className="at-btn" onClick={() => handleTestScenario(s)}
                style={{ background: activeScenario === s.key ? `${s.color}20` : 'rgba(255,255,255,.04)',
                  border: `1px solid ${activeScenario === s.key ? `${s.color}40` : 'rgba(255,255,255,.06)'}`,
                  color: activeScenario === s.key ? s.color : '#fff',
                  justifyContent: 'flex-start', padding: '12px 16px', gap: 12 }}>
                <span style={{ fontSize: 24, width: 40, height: 40, borderRadius: 10, background: `${s.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.emoji}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{s.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Countdown Simulator */}
        <motion.div className="at-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="at-section-title">⏰ محاكاة العد التنازلي</div>
          <div className="at-chips">
            {[30, 60, 120, 300, 600].map(v => (
              <button key={v} onClick={() => setCountdownValue(v)} className={`at-chip ${countdownValue === v ? 'on' : ''}`}>
                {v < 60 ? `${v} ث` : `${v / 60} د`}
              </button>
            ))}
          </div>
          <button className="at-btn at-btn-speak" onClick={handleSimulateCountdown} style={{ marginTop: 12 }}>
            ⏱ محاكاة من {countdownValue < 60 ? `${countdownValue} ثانية` : `${countdownValue / 60} دقائق`}
          </button>
        </motion.div>

        {/* Event Log */}
        <motion.div className="at-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="at-section-title">📋 سجل الأحداث</div>
          {eventLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,.2)', fontSize: 12 }}>لا توجد أحداث بعد</div>
          ) : (
            <div className="at-event-log" ref={logRef}>
              {eventLog.map((log, i) => (
                <div key={i} className={`at-log-item ${log.type}`}>
                  <span>{log.text}</span>
                  <span className="at-log-time">{log.time}</span>
                </div>
              ))}
            </div>
          )}
          {eventLog.length > 0 && (
            <button onClick={() => setEventLog([])} style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              🗑 مسح السجل
            </button>
          )}
        </motion.div>
      </div>
    </>
  );
}
