import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking } from '../utils/sound';

const kahfUrl = 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/18.mp3';

export default function AlKahfReminder() {
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleReminder = () => {
      setVisible(true);
      speakArabic('حان وقت قراءة سورة الكهف، جمعة مباركة. اقرأ سورة الكهف واغسل رأسك وشمّ الطيب.', () => {});
    };

    if (window.electronAPI?.isElectron) {
      window.electronAPI.onFridayKahf?.(handleReminder);
    }

    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('friday-kahf-reminder');
      }
    };
  }, []);

  const startAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(kahfUrl);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().then(() => setPlaying(true)).catch(() => {});
    audio.onended = () => { setPlaying(false); audioRef.current = null; };
    audio.onerror = () => { setPlaying(false); audioRef.current = null; };
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    setPlaying(false);
  };

  const handleClose = () => {
    stopAudio();
    stopSpeaking();
    setVisible(false);
  };

  useEffect(() => {
    return () => { stopAudio(); stopSpeaking(); };
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '92%', maxWidth: 380, padding: '32px 24px',
                background: 'linear-gradient(160deg, #0a0520, #1a0a3a, #0d1b2a)',
                border: '1px solid rgba(139,92,246,.3)',
                borderRadius: 28, textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 30%, rgba(139,92,246,.12), transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ fontSize: 56, marginBottom: 12 }}>📖</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginBottom: 6, position: 'relative' }}>
                سورة الكهف
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 16, lineHeight: 1.7, position: 'relative' }}>
                جمعة مباركة
              </div>

              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 2,
                padding: 12, background: 'rgba(255,255,255,.03)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,.06)', textAlign: 'right',
                fontFamily: 'var(--font-naskh)', marginBottom: 16, position: 'relative',
              }}>
                مَن قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ
                <div style={{ fontSize: 10, color: '#f0b040', marginTop: 6 }}>📖 حديث نبوي</div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', position: 'relative' }}>
                <button
                  onClick={() => { if (playing) stopAudio(); else startAudio(); }}
                  style={{
                    padding: '12px 24px', borderRadius: 14, border: 'none',
                    background: playing ? 'rgba(239,68,68,.15)' : 'rgba(139,92,246,.15)',
                    color: playing ? '#ef4444' : '#a78bfa',
                    border: `1px solid ${playing ? 'rgba(239,68,68,.3)' : 'rgba(139,92,246,.3)'}`,
                    fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all .2s',
                  }}
                >
                  {playing ? '⏹️' : '🔊'} {playing ? 'إيقاف' : 'تشغيل السورة'}
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px', borderRadius: 14, border: 'none',
                    background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)',
                    border: '1px solid rgba(255,255,255,.08)',
                    fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  ✕ إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
