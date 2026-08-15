import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { playAzkarVoice, pauseAzkarVoice, resumeAzkarVoice, stopAzkarVoice, getAzkarAudio } from '../utils/sound';

function formatTime(s) {
  if (!s || !isFinite(s)) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const BG_MODES = [
  'rgba(0,0,0,.8)',
  'rgba(30,0,60,.85)',
  'rgba(0,40,20,.85)',
  'rgba(180,120,0,.85)',
];

const PLAYLIST = [
  { id: 'morning', title: 'أذكار الصباح', accent: '#f0b040', icon: 'sun' },
  { id: 'evening', title: 'أذكار المساء', accent: '#8b5cf6', icon: 'moon' },
];

export default function AzkarAudioPlayer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = PLAYLIST[activeIdx];
  const accent = current.accent;

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [subsOn, setSubsOn] = useState(true);
  const [fontSize, setFontSize] = useState(20);
  const [bgMode, setBgMode] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const intervalRef = useRef(null);
  const speeds = [1, 1.25, 1.5, 0.75];
  const speedLabels = ['1x', '1.25x', '1.5x', '0.75x'];

  useEffect(() => {
    const url = current.id === 'morning' ? 'morning-words.json' : 'evening-words.json';
    fetch(url).then(r => r.json()).then(data => setWords(data)).catch(() => {});
    setCurrentWordIdx(-1);
    setCurrentTime(0);
    setDuration(0);
  }, [activeIdx]);

  useEffect(() => {
    if (!words.length || !duration) return;
    let lo = 0, hi = words.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (words[mid].s <= currentTime) lo = mid + 1;
      else hi = mid - 1;
    }
    const idx = lo - 1;
    if (idx >= 0 && idx < words.length && currentTime >= words[idx].s && currentTime < words[idx].e) {
      setCurrentWordIdx(idx);
    }
  }, [currentTime, words, duration]);

  const switchTrack = useCallback((idx) => {
    stopAzkarVoice();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentWordIdx(-1);
    setActiveIdx(idx);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      pauseAzkarVoice();
      setPlaying(false);
    } else {
      const audio = getAzkarAudio();
      if (!audio) { setLoading(true); playAzkarVoice(current.id); }
      else resumeAzkarVoice();
      setPlaying(true);
    }
  }, [playing, current.id]);

  useEffect(() => {
    const audio = getAzkarAudio();
    if (audio) {
      const onReady = () => { setLoading(false); setDuration(audio.duration || 0); };
      if (audio.readyState >= 2) setDuration(audio.duration || 0);
      else audio.addEventListener('loadedmetadata', onReady, { once: true });
    }
  }, [playing, activeIdx]);

  useEffect(() => () => { stopAzkarVoice(); setPlaying(false); }, []);

  useEffect(() => {
    if (!playing) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const audio = getAzkarAudio();
      if (audio) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
        if (audio.ended) setPlaying(false);
      }
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const audio = getAzkarAudio();
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = x * duration;
    setCurrentTime(x * duration);
  };

  const skip = (sec) => {
    const audio = getAzkarAudio();
    if (audio) { const t = Math.max(0, Math.min(duration || 0, audio.currentTime + sec)); audio.currentTime = t; setCurrentTime(t); }
  };

  const getWordsAround = () => {
    if (currentWordIdx < 0) return [];
    const start = Math.max(0, currentWordIdx - 8);
    const end = Math.min(words.length, currentWordIdx + 12);
    return words.slice(start, end).map((w, i) => ({
      ...w,
      isCurrent: start + i === currentWordIdx,
      isPast: start + i < currentWordIdx,
    }));
  };

  const nearbyWords = getWordsAround();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        background: 'linear-gradient(160deg, rgba(20,20,30,.98), rgba(12,12,20,.95))',
        border: `1px solid ${accent}20`,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Subtitle Screen */}
      <div style={{
        background: '#000',
        minHeight: 160,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{
          position: 'absolute', top: 10, right: 12,
          background: 'rgba(255,255,255,.12)', borderRadius: 20,
          padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,.7)',
          display: playing ? 'block' : 'none',
        }}>
          {current.title}
        </div>

        {currentWordIdx >= 0 && subsOn ? (
          <div style={{
            background: BG_MODES[bgMode],
            borderRadius: 8,
            padding: '10px 20px',
            maxWidth: '90%',
            textAlign: 'center',
          }}>
            <div style={{ color: '#fff', fontSize, fontWeight: 500, lineHeight: 1.6, direction: 'rtl' }}>
              {nearbyWords.map((w, i) => (
                <span key={`${currentWordIdx - 8 + i}`}
                  style={{
                    color: w.isCurrent ? '#fff' : w.isPast ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.6)',
                    fontSize: w.isCurrent ? fontSize + 2 : fontSize,
                    fontWeight: w.isCurrent ? 700 : 400,
                    transition: 'all 0.12s',
                    textShadow: w.isCurrent ? `0 0 16px ${accent}88` : 'none',
                  }}>
                  {w.w}{' '}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 13, width: '100%', textAlign: 'center' }}>
            {playing ? '' : 'اضغط تشغيل لظهور النص'}
          </div>
        )}
      </div>

      {/* Playlist */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        {PLAYLIST.map((item, i) => {
          const isActive = i === activeIdx;
          return (
            <button key={item.id}
              onClick={() => switchTrack(i)}
              style={{
                flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
                background: isActive ? `${item.accent}15` : 'transparent',
                borderBottom: isActive ? `2px solid ${item.accent}` : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
              }}>
              {item.icon === 'sun' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill={isActive ? item.accent : 'rgba(255,255,255,.3)'} />
                  <g stroke={isActive ? item.accent : 'rgba(255,255,255,.3)'} strokeWidth="1.5" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="3.5" /><line x1="12" y1="20.5" x2="12" y2="23" />
                    <line x1="1" y1="12" x2="3.5" y2="12" /><line x1="20.5" y1="12" x2="23" y2="12" />
                  </g>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive ? item.accent : 'rgba(255,255,255,.3)'}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span style={{
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? item.accent : 'rgba(255,255,255,.4)',
              }}>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{formatTime(currentTime)}</span>
          <div onClick={handleSeek} style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: accent, transition: 'width 0.1s' }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, width: 12, height: 12, borderRadius: 6, background: accent, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => skip(-10)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600 }}>10-</button>
          <button onClick={togglePlay} style={{
            width: 52, height: 52, borderRadius: 14, border: 'none',
            background: accent, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20,
          }}>
            {loading ? '...' : playing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21" /></svg>
            )}
          </button>
          <button onClick={() => skip(10)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600 }}>10+</button>
        </div>

        {/* Subtitle toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: subsOn ? accent : 'rgba(255,255,255,.3)' }} />
            <span>{subsOn ? 'ترجمة نصية مفعّلة' : 'ترجمة نصية مغلقة'}</span>
          </div>
          <div onClick={() => setSubsOn(!subsOn)} style={{
            width: 32, height: 18, borderRadius: 9, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.15)',
            background: subsOn ? accent : 'rgba(255,255,255,.1)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2,
              left: subsOn ? 16 : 2,
              width: 13, height: 13, borderRadius: 7, background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => setFontSize(s => Math.max(14, s - 2))} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>
          <span style={{ fontWeight: 700 }}>A</span>-
        </div>
        <div onClick={() => setFontSize(s => Math.min(30, s + 2))} style={{ fontSize: 16, color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>
          <span style={{ fontWeight: 700 }}>A</span>+
        </div>
        <div onClick={() => setBgMode(b => (b + 1) % BG_MODES.length)} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>الخلفية</div>
        <div onClick={() => setSpeedIdx(s => (s + 1) % speeds.length)} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>{speedLabels[speedIdx]}</div>
      </div>
    </motion.div>
  );
}
