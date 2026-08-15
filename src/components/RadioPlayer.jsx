import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const DEFAULT_URL = 'https://qurango.net/radio/mix';
const FM_MARKS = [88,90,92,94,96,98,100,102,104,106,108];

export default function RadioPlayer() {
  const { t } = useTranslation();
  const h = t.radioPlayer || {};
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [tunerVal] = useState(91.5);
  const audioRef = useRef(null);
  const vizBarsRef = useRef([]);
  const vizIntervalRef = useRef(null);

  const startViz = useCallback(() => {
    if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
    vizIntervalRef.current = setInterval(() => {
      vizBarsRef.current.forEach(b => {
        if (b) b.style.height = (Math.random() * 40 + 4) + 'px';
      });
    }, 120);
  }, []);

  const stopViz = useCallback(() => {
    if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
    vizBarsRef.current.forEach(b => { if (b) b.style.height = '3px'; });
  }, []);

  const handleToggle = useCallback(() => {
    if (playing) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlaying(false);
      stopViz();
    } else {
      const audio = new Audio();
      audio.src = DEFAULT_URL;
      audio.volume = volume / 100;
      audio.play().then(() => { startViz(); }).catch(() => {});
      audio.onended = () => { setPlaying(false); stopViz(); };
      audio.onerror = () => { setPlaying(false); stopViz(); };
      audioRef.current = audio;
      setPlaying(true);
    }
  }, [playing, volume, startViz, stopViz]);

  const handleStop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    stopViz();
  }, [stopViz]);

  const handleVolume = useCallback((e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
    };
  }, []);

  const tunerPct = ((tunerVal - 88) / (108 - 88)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3"
    >
      <div style={{
        background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
        borderRadius: '20px', padding: '16px 20px',
        color: '#fff', position: 'relative', overflow: 'hidden',
        border: playing ? '1px solid rgba(0,200,150,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(0,200,150,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="inline-flex items-center gap-1.5 mb-3" style={{
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: '#f87171',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'livepulse 1.5s infinite' }} />
          ON AIR
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.4)', borderRadius: '14px', padding: '12px',
          marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#00c896', letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>
                {tunerVal.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>MHz FM</div>
            </div>
            <div>
              <div className="flex gap-1.5 mb-2">
                <button style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #00c896', background: 'rgba(0,200,150,0.15)', color: '#00c896', fontSize: '10px', fontWeight: 700 }}>FM</button>
                <button style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700 }}>AM</button>
              </div>
              <div className="flex items-end gap-0.5 h-5">
                {[6,9,12,15,18,14,10].map((sh, i) => (
                  <div key={i} style={{ width: '4px', borderRadius: '2px', height: sh + 'px', background: i < 5 ? '#00c896' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
            {h.defaultStation || 'إذاعة القرآن الكريم'}
          </div>
          <div style={{ fontSize: '10px', color: playing ? '#00c896' : 'rgba(255,255,255,0.4)' }}>
            {playing ? (h.live || 'بث مباشر') : (h.pressToPlay || 'اضغط للاستماع')}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div className="flex justify-between" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', padding: '0 2px' }}>
            {FM_MARKS.map(m => <span key={m}>{m}</span>)}
          </div>
          <div style={{ position: 'relative', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', margin: '10px 0 6px' }}>
            <div style={{ height: '100%', width: tunerPct + '%', background: 'linear-gradient(90deg, #00c896, #3b82f6)', borderRadius: '5px' }} />
            <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', width: '14px', height: '14px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', left: tunerPct + '%' }} />
          </div>
        </div>

        <div className="flex items-end justify-center" style={{ gap: '2px', height: '36px', marginBottom: '16px' }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} ref={el => vizBarsRef.current[i] = el}
              style={{ width: '4px', borderRadius: '2px 2px 0 0', minHeight: '3px', background: 'linear-gradient(to top, #00c896, #3b82f6)', transition: 'height 0.1s ease' }} />
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <button style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button onClick={handleToggle}
            style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: playing ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00c896, #059669)',
              border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: playing ? '0 4px 16px rgba(239,68,68,0.35)' : '0 4px 16px rgba(0,200,150,0.35)',
            }}>
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          <button onClick={handleStop}
            style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>
        </div>

        <div className="flex items-center" style={{ gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ width: '16px' }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', position: 'relative', cursor: 'pointer' }}>
            <div style={{ height: '100%', width: volume + '%', background: '#00c896', borderRadius: '3px', transition: 'width 0.1s' }} />
            <input type="range" min="0" max="100" value={volume} onChange={handleVolume}
              style={{ width: '100%', height: '3px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', margin: 0 }} />
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ width: '16px' }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes livepulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </motion.div>
  );
}
