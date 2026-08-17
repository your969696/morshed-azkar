import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAudio, pauseAudio, stopAudio, seekAudio, getReciters, getSurahAudioUrl } from '../utils/audio.js';
import { useTranslation } from '../i18n.jsx';

export default function AudioPlayer({ surahNum, surahName, reciterId: initialReciter, onClose }) {
  const { t } = useTranslation();
  const h = t.audioPlayer || {};
  const [reciterId, setReciterId] = useState(initialReciter || 'refaat');
  const [playing, setPlaying] = useState(false);
  const [timeInfo, setTimeInfo] = useState({ currentTime: 0, duration: 0, formatted: '00:00', durationFormatted: '00:00', progress: 0 });

  const loadAndPlay = useCallback(() => {
    const url = getSurahAudioUrl(reciterId, surahNum);
    const result = playAudio(
      url,
      (info) => setTimeInfo(info),
      () => setPlaying(false),
      () => setPlaying(false)
    );
    setPlaying(result.playing);
  }, [reciterId, surahNum]);

  useEffect(() => {
    loadAndPlay();
    return () => { stopAudio(); };
  }, [loadAndPlay]);

  const togglePlay = () => {
    if (playing) {
      pauseAudio();
      setPlaying(false);
    } else {
      loadAndPlay();
    }
  };

  const handleReciterChange = (e) => {
    setReciterId(e.target.value);
    const url = getSurahAudioUrl(e.target.value, surahNum);
    const result = playAudio(
      url,
      (info) => setTimeInfo(info),
      () => setPlaying(false),
      () => setPlaying(false)
    );
    setPlaying(result.playing);
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (timeInfo.duration) {
      seekAudio(pct * timeInfo.duration);
    }
  };

  const handleClose = () => {
    stopAudio();
    setPlaying(false);
    if (onClose) onClose();
  };

  const reciters = getReciters();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] bg-bg-card border border-border rounded-2xl p-3.5 z-[90] shadow-xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text-primary truncate">{surahName || `${h.surah || 'سورة'} ${surahNum}`}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{reciters.find(r => r.id === reciterId)?.name || ''}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer border-none bg-transparent text-text-primary hover:bg-bg-primary transition-all" onClick={() => seekAudio(Math.max(0, timeInfo.currentTime - 10))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 3C17.15 3 21.08 6.03 22.45 10.22L21 11C19.87 7.67 16.41 5.25 12.5 5.25C9.62 5.25 7.03 6.73 5.46 9L7 10.5C8.23 8.23 10.23 6.75 12.5 6.75C15.6 6.75 18.12 9.12 18.58 12.17L20 11.5C19.43 7.44 16.28 4.5 12.5 4.5V3Z"/><path d="M11 7V12.25L15.75 15.07L15 16.33L9.5 13V7H11Z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none bg-accent-green text-white hover:opacity-90 transition-all" onClick={togglePlay}>
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21" /></svg>
              )}
            </button>
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer border-none bg-transparent text-text-primary hover:bg-bg-primary transition-all" onClick={() => seekAudio(Math.min(timeInfo.duration, timeInfo.currentTime + 10))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 3C6.85 3 2.92 6.03 1.55 10.22L3 11C4.13 7.67 7.59 5.25 11.5 5.25C14.38 5.25 16.97 6.73 18.54 9L17 10.5C15.77 8.23 13.77 6.75 11.5 6.75C8.4 6.75 5.88 9.12 5.42 12.17L4 11.5C4.57 7.44 7.72 4.5 11.5 4.5V3Z"/><path d="M13 7V12.25L8.25 15.07L9 16.33L14.5 13V7H13Z"/></svg>
            </button>
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer border-none bg-transparent text-text-muted hover:bg-bg-primary transition-all" onClick={handleClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-border rounded cursor-pointer relative" onClick={handleProgressClick}>
          <div className="h-full rounded transition-all" style={{ width: `${timeInfo.progress}%`, background: 'linear-gradient(90deg, var(--accent-green), #10b981)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-muted font-semibold">{timeInfo.formatted}</span>
          <span className="text-[10px] text-text-muted font-semibold">{timeInfo.durationFormatted}</span>
        </div>
        <select className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-bg-primary text-text-primary border border-border cursor-pointer mt-1.5 appearance-none text-center" value={reciterId} onChange={handleReciterChange}>
          {reciters.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </motion.div>
    </AnimatePresence>
  );
}
