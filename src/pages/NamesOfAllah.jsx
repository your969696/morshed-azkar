import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { namesOfAllah as allNamesOfAllah } from '../data/names-of-allah';
import { speakArabic as speakText, stopSpeaking, stopAllAudio } from '../utils/sound';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const namesOfAllah = allNamesOfAllah.filter(n => !getDeletedIds('deletedNamesIds').includes(n.id));

let currentNameAudio = null;
function playNameAudio(id) {
  return new Promise(resolve => {
    stopSpeaking();
    if (currentNameAudio) { currentNameAudio.pause(); currentNameAudio = null; }
    const audio = new Audio(`names-voices/${id}.mp3`);
    currentNameAudio = audio;
    audio.onended = () => { currentNameAudio = null; resolve(); };
    audio.play().catch(() => { currentNameAudio = null; resolve(); });
  });
}

export default function NamesOfAllah() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimer = useRef(null);
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('namesAudioEnabled') === 'true';
    const mode = localStorage.getItem('namesAudioMode') || 'all';
    const duration = parseInt(localStorage.getItem('namesAudioDuration') || '10');
    const interval = parseInt(localStorage.getItem('namesAudioInterval') || '30');
    const timeStart = localStorage.getItem('namesAudioTimeStart') || '06:00';
    const timeEnd = localStorage.getItem('namesAudioTimeEnd') || '22:00';
    let selected = [];
    try { selected = JSON.parse(localStorage.getItem('namesAudioSelected')) || []; } catch {}
    return { enabled: saved, mode, duration, interval, timeStart, timeEnd, selected };
  });

  const filteredNames = namesOfAllah.filter(
    (item) =>
      item.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_ar.includes(searchQuery) ||
      item.meaning_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning_ar.includes(searchQuery) ||
      (item.description && item.description.includes(searchQuery))
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) { clearTimeout(autoPlayTimer.current); autoPlayTimer.current = null; }
    stopAllAudio();
    setIsAutoPlaying(false);
  }, []);

  const playName = useCallback((name) => {
    return playNameAudio(name.id);
  }, []);

  const startAutoPlay = useCallback(() => {
    const namesToPlay = audioSettings.mode === 'custom' && audioSettings.selected.length > 0
      ? namesOfAllah.filter(n => audioSettings.selected.includes(n.id))
      : namesOfAllah;

    if (namesToPlay.length === 0) return;

    setIsAutoPlaying(true);
    let idx = 0;

    const playNext = () => {
      if (idx >= namesToPlay.length) { setIsAutoPlaying(false); return; }
      const name = namesToPlay[idx];
      const nameIdx = namesOfAllah.findIndex(n => n.id === name.id);
      setCurrentIndex(nameIdx);
      playName(name).then(() => {
        idx++;
        autoPlayTimer.current = setTimeout(playNext, 1000);
      });
    };

    playNext();
  }, [audioSettings, playName]);

  useEffect(() => {
    return () => { stopAutoPlay(); };
  }, [stopAutoPlay]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

  const goToPrev = useCallback(() => {
    if (filteredNames.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? filteredNames.length - 1 : prev - 1
    );
  }, [filteredNames.length]);

  const goToNext = useCallback(() => {
    if (filteredNames.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === filteredNames.length - 1 ? 0 : prev + 1
    );
  }, [filteredNames.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const handleTouchStart = (e) => {
    containerRef.current = { startX: e.touches[0].clientX };
  };

  const handleTouchEnd = (e) => {
    if (!containerRef.current) return;
    const diff = containerRef.current.startX - e.changedTouches[0].clientX;
    if (diff > 50) goToNext();
    else if (diff < -50) goToPrev();
    containerRef.current = null;
  };

  const currentName = filteredNames[currentIndex];

  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cairo:wght@400;600;700&display=swap');

        .names-of-allah-page {
          min-height: 100%;
          background-color: var(--bg-primary);
          padding: 20px 16px;
        }

        .names-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .names-header h1 {
          font-family: 'Cairo', sans-serif;
          color: var(--text-primary);
          font-size: 1.6rem;
          margin: 0;
        }

        .names-header p {
          font-family: 'Cairo', sans-serif;
          color: #8a7aa0;
          font-size: 0.85rem;
          margin: 0;
        }

        .names-search-wrapper {
          position: relative;
          margin-bottom: 20px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .names-search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          font-family: 'Cairo', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }

        .names-search-input::placeholder {
          color: #6a5a80;
        }

        .names-search-input:focus {
          border-color: var(--accent-green);
          box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.15);
        }

        .names-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6a5a80;
          pointer-events: none;
        }

        .names-carousel-wrapper {
          position: relative;
          max-width: 400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .names-nav-btn {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1.1rem;
        }

        .names-nav-btn:hover {
          background: rgba(0, 200, 150, 0.15);
          border-color: var(--accent-green);
        }

        .names-card-container {
          flex: 1;
          overflow: hidden;
          border-radius: 20px;
          min-height: 500px;
          position: relative;
        }

        .names-card {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(145deg, #1c1040 0%, #2d1b69 100%);
          border: 1px solid var(--border-color);
          box-shadow:
            0 0 30px rgba(0, 200, 150, 0.06),
            0 8px 32px rgba(0, 0, 0, 0.4);
          overflow-y: auto;
        }

        .names-card-top {
          width: 100%;
          padding: 20px 20px 14px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .names-card-huwa {
          font-family: 'Amiri Quran', serif;
          font-size: 1.5rem;
          color: #f0b040;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: 3px;
          text-shadow: 0 0 12px rgba(240, 176, 64, 0.3);
        }

        .names-card-number {
          font-family: 'Cairo', sans-serif;
          font-size: 0.7rem;
          color: var(--accent-green);
          background: rgba(0, 200, 150, 0.12);
          padding: 3px 14px;
          border-radius: 20px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .names-card-mid {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .names-card-arabic {
          font-family: 'Amiri Quran', serif;
          font-size: 3rem;
          color: var(--text-primary);
          text-align: center;
          line-height: 1.3;
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(0, 200, 150, 0.15);
        }

        .names-card-transliteration {
          font-family: 'Cairo', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-green);
          text-align: center;
          margin-bottom: 20px;
          text-transform: capitalize;
        }

        .names-card-separator {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f0b040, transparent);
          margin-bottom: 18px;
          opacity: 0.6;
        }

        .names-card-meaning-ar {
          font-family: 'Amiri Quran', serif;
          font-size: 1.25rem;
          color: #c9b8e8;
          text-align: center;
          direction: rtl;
          margin-bottom: 6px;
        }

        .names-card-meaning-en {
          font-family: 'Cairo', sans-serif;
          font-size: 0.9rem;
          color: #a99bc4;
          text-align: center;
          text-transform: capitalize;
        }

        .names-card-bottom {
          width: 100%;
          padding: 14px 20px 16px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .names-card-divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
          margin: 0 auto 10px;
          border-radius: 2px;
        }

        .names-card-description {
          font-family: 'Cairo', sans-serif;
          font-size: 0.78rem;
          color: #7a6a94;
          text-align: center;
          line-height: 1.7;
          margin-bottom: 8px;
          padding: 0 8px;
        }

        .names-card-ref {
          font-family: 'Cairo', sans-serif;
          font-size: 0.68rem;
          color: #5a4a74;
          text-align: center;
        }

        .names-card-ref strong {
          color: var(--text-muted);
        }

        .names-progress {
          text-align: center;
          margin-top: 18px;
          font-family: 'Cairo', sans-serif;
          font-size: 0.9rem;
          color: #6a5a80;
          letter-spacing: 0.5px;
        }

        .names-progress span {
          color: #00c896;
          font-weight: 700;
        }

        .names-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          flex-wrap: wrap;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .names-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--border-color);
          cursor: pointer;
          transition: all 0.3s;
        }

        .names-dot.active {
          background: var(--accent-green);
          box-shadow: 0 0 8px rgba(0, 200, 150, 0.5);
          transform: scale(1.3);
        }

        .names-empty {
          text-align: center;
          padding: 60px 20px;
          font-family: 'Cairo', sans-serif;
          color: #6a5a80;
        }

        .names-empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="page-wrap pb-24">
        <div className="names-of-allah-page">
          <div className="names-header">
            <h1>هو الله</h1>
          </div>

          <div className="names-search-wrapper">
            <svg
              className="names-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="names-search-input"
              placeholder="Search by name or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredNames.length === 0 ? (
            <div className="names-empty">
              <div className="names-empty-icon">🔍</div>
              <p>No names found matching your search.</p>
            </div>
          ) : (
            <>
              <div
                className="names-carousel-wrapper"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button className="names-nav-btn" onClick={goToPrev}>
                  &#9664;
                </button>

                <div className="names-card-container">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={currentName.id}
                      custom={direction}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="names-card"
                    >
                      <div className="names-card-top">
                        <div className="names-card-huwa">هُوَ اللَّهُ</div>
                        <div className="names-card-number">
                          {currentName.id} / {namesOfAllah.length}
                        </div>
                      </div>

                      <div className="names-card-mid">
                        <div className="names-card-arabic">
                          {currentName.name_ar}
                        </div>

                        <div className="names-card-transliteration">
                          {currentName.name_en}
                        </div>

                        <div className="names-card-separator" />

                        <div className="names-card-meaning-ar">
                          {currentName.meaning_ar}
                        </div>

                        <div className="names-card-meaning-en">
                          {currentName.meaning_en}
                        </div>
                      </div>

                      <div className="names-card-bottom">
                        <div className="names-card-divider" />

                        <div className="names-card-description">
                          {currentName.description}
                        </div>

                        {currentName.quran_ref && (
                          <div className="names-card-ref">
                            <strong>Quran:</strong> {currentName.quran_ref}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button className="names-nav-btn" onClick={goToNext}>
                  &#9654;
                </button>
              </div>

              <div className="names-progress">
                <span>{currentIndex + 1}</span> / {filteredNames.length}
              </div>

              <div className="names-dots">
                {filteredNames.map((_, i) => (
                  <div
                    key={i}
                    className={`names-dot ${i === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      setCurrentIndex(i);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
