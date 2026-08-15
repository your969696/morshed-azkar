import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAzan, stopAzan, toggleAzan, isAzanPlaying, getAdhanAudio } from '../utils/sound';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AdhanPlayer() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const a = getAdhanAudio();
      if (a) {
        setPlaying(!a.paused);
        setCurrentTime(a.currentTime);
        setDuration(a.duration || 0);
        if (a.volume !== volume) a.volume = volume;
      }
    }, 300);
    return () => clearInterval(iv);
  }, [volume]);

  const handleToggle = () => {
    if (isAzanPlaying()) toggleAzan();
    else playAzan();
  };

  const handleStop = () => {
    stopAzan();
    setPlaying(false);
    setCurrentTime(0);
  };

  const handleVolume = (dir) => {
    let v = volume + dir;
    v = Math.max(0, Math.min(1, v));
    setVolume(v);
  };

  const handleSeek = (e) => {
    const a = getAdhanAudio();
    if (!a) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    a.currentTime = pct * (a.duration || 0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3"
    >
      <div style={{
        background: playing
          ? 'linear-gradient(135deg, #1a1040 0%, #2d1b69 40%, #1a1040 100%)'
          : 'var(--bg-card)',
        border: playing ? '1px solid rgba(139,92,246,0.25)' : '1px solid var(--border-card)',
        borderRadius: '20px',
        padding: '20px',
        transition: 'all 0.4s ease',
      }}>

        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>
            <span style={{ display: 'inline-block', animation: playing ? 'spin 4s linear infinite' : 'none' }}>🕌</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>الأذان</div>
          <div style={{ fontSize: '12px', color: playing ? '#a78bfa' : 'var(--text-muted)', marginTop: '2px' }}>
            {playing ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'اضغط للاستماع'}
          </div>
        </div>

        <div
          style={{ cursor: 'pointer', marginBottom: '16px' }}
          onClick={handleSeek}
        >
          <div style={{
            width: '100%', height: '4px', borderRadius: '4px',
            background: 'var(--border-color)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => handleVolume(-0.2)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >🔉</button>

          <button
            onClick={handleStop}
            style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              transition: 'all 0.2s',
            }}
          >⏹</button>

          <button
            onClick={handleToggle}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              boxShadow: playing ? '0 4px 24px rgba(139,92,246,0.4)' : '0 4px 16px rgba(139,92,246,0.25)',
              transition: 'all 0.2s',
            }}
          >{playing ? '⏸' : '▶'}</button>

          <button
            onClick={() => handleVolume(0.2)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >🔊</button>
        </div>
      </div>
    </motion.div>
  );
}
