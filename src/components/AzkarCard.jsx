import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTapSound, playCompleteSound } from '../utils/sound';

function getHadithSourceUrl(reference) {
  if (!reference) return null;
  const ref = reference.toLowerCase();
  if (ref.includes('البخاري') || ref.includes('صحيح البخاري')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/bukhari/${num[1]}` : 'https://sunnah.com/bukhari';
  }
  if (ref.includes('مسلم') || ref.includes('صحيح مسلم')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/muslim/${num[1]}` : 'https://sunnah.com/muslim';
  }
  if (ref.includes('أبو داود') || ref.includes('سنن أبي داود')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/abudawud/${num[1]}` : 'https://sunnah.com/abudawud';
  }
  if (ref.includes('الترمذي') || ref.includes('سنن الترمذي')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/tirmidhi/${num[1]}` : 'https://sunnah.com/tirmidhi';
  }
  if (ref.includes('النسائي') || ref.includes('سنن النسائي')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/nasai/${num[1]}` : 'https://sunnah.com/nasai';
  }
  if (ref.includes('ابن ماجه') || ref.includes('سنن ابن ماجه')) {
    const num = reference.match(/رقم\s*(\d+)/);
    return num ? `https://sunnah.com/ibnmajah/${num[1]}` : 'https://sunnah.com/ibnmajah';
  }
  if (ref.includes('مالك') || ref.includes('موطأ')) {
    return 'https://sunnah.com/umalqura';
  }
  if (ref.includes(' Ahmad') || ref.includes('أحمد')) {
    return 'https://sunnah.com/ahmad';
  }
  if (ref.includes('الدارمي')) {
    return 'https://sunnah.com/darimi';
  }
  return 'https://sunnah.com';
}

export default function AzkarCard({ azkar, onFavorite, isFavorited, soundEnabled, isSpeaking, onSpeak, isCompleted, onToggleComplete }) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHadith, setShowHadith] = useState(false);

  const total = azkar.repeat || azkar.count || 1;
  const remaining = total - count;
  const progress = total > 0 ? (count / total) * 100 : 0;
  const isComplete = count >= total;
  const sourceUrl = getHadithSourceUrl(azkar.reference);

  const handleTap = useCallback(() => {
    if (count < total) {
      setCount(c => c + 1);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 250);
      if (soundEnabled !== false) playTapSound();
      if (navigator.vibrate) navigator.vibrate(30);
    }
  }, [count, total, soundEnabled]);

  const handleReset = useCallback(() => setCount(0), []);

  useEffect(() => {
    if (isComplete && soundEnabled !== false) {
      playCompleteSound();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }, [isComplete, soundEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: isComplete
          ? 'linear-gradient(135deg, rgba(0,200,150,0.10), rgba(0,200,150,0.03))'
          : '#151030',
        border: `1px solid ${isComplete ? 'rgba(0,200,150,0.35)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        padding: '16px 14px 14px',
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, right: 0, left: 0, height: 3,
        background: isComplete
          ? 'linear-gradient(90deg, transparent, #00c896, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(240,176,64,0.5), transparent)',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onToggleComplete && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
              style={{
                width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${isCompleted ? '#00c896' : 'rgba(255,255,255,0.12)'}`,
                background: isCompleted ? '#00c896' : 'transparent',
                cursor: 'pointer', transition: 'all 0.25s ease', flexShrink: 0,
              }}
            >
              {isCompleted && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          )}
          {azkar.grade && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 700,
              background: azkar.grade === 'صحيح' ? 'rgba(0,200,150,0.12)' : azkar.grade === 'حسن' ? 'rgba(240,176,64,0.12)' : 'rgba(239,68,68,0.12)',
              color: azkar.grade === 'صحيح' ? '#00c896' : azkar.grade === 'حسن' ? '#f0b040' : '#ef4444',
            }}>{azkar.grade}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onSpeak && (
            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(); }}
              style={{
                width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: isSpeaking ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.04)',
                cursor: 'pointer', color: isSpeaking ? '#00c896' : '#7a6f96',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                {isSpeaking ? <><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></> : <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite?.(azkar.id); }}
            style={{
              width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? '#f0b040' : 'none'} stroke={isFavorited ? '#f0b040' : '#7a6f96'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Zikr text */}
      <p style={{
        fontFamily: "'Amiri Quran', serif",
        fontSize: '17px',
        lineHeight: 2.2,
        textAlign: 'right',
        color: '#ffffff',
        margin: 0,
        padding: '0 2px',
        wordSpacing: 2,
        direction: 'rtl',
      }}>{azkar.text}</p>

      {/* Progress bar */}
      {total > 1 && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#7a6f96', fontWeight: 600 }}>{count}/{total}</span>
            <span style={{ fontSize: 11, color: isComplete ? '#00c896' : '#7a6f96', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: isComplete ? '#00c896' : 'linear-gradient(90deg, #8b5cf6, #00c896)', borderRadius: 4 }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>
      )}

      {/* Hadith expand button — prominent */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowHadith(!showHadith); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', padding: '8px 0', marginTop: 8,
          background: showHadith ? 'rgba(240,176,64,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${showHadith ? 'rgba(240,176,64,0.2)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 10, cursor: 'pointer',
          color: '#f0b040', fontSize: 12, fontWeight: 600,
          transition: 'all 0.2s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>{showHadith ? 'إخفاء الحديث' : 'عرض الحديث والסند'}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: showHadith ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded hadith section */}
      <AnimatePresence>
        {showHadith && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: 12, padding: 14, marginTop: 10,
            }}>
              {/* Source & repeat info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: '#7a6f96', fontWeight: 600 }}>التكرار: {total}</span>
                {azkar.source && <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>{azkar.source}</span>}
              </div>

              {/* Isnad */}
              {azkar.isnad && (
                <p style={{ fontSize: 12, color: '#8b5cf6', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 8, textAlign: 'center' }}>
                  {azkar.isnad}
                </p>
              )}

              {/* Full hadith text */}
              <p style={{
                fontFamily: "'Amiri Quran', serif", fontSize: 15, lineHeight: 2.2,
                textAlign: 'right', color: '#ffffff', margin: 0, direction: 'rtl',
              }}>
                {azkar.hadithFull || azkar.text}
              </p>

              {/* Narrator */}
              {azkar.narrator && (
                <p style={{ fontSize: 11, color: '#7a6f96', marginTop: 10, textAlign: 'center' }}>
                  رواه <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{azkar.narrator}</span>
                </p>
              )}

              {/* Reference & source link */}
              {azkar.reference && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(240,176,64,0.06)', borderRadius: 8, border: '1px solid rgba(240,176,64,0.1)' }}>
                  <p style={{ fontSize: 11, color: '#f0b040', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {azkar.reference}
                  </p>
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                        fontSize: 10, color: '#3b82f6', textDecoration: 'none', fontWeight: 600,
                        padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.08)',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      رابط المصدر على Sunnah.com
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom: counter / tap / reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {total > 1 && (
            <motion.button
              onClick={handleTap}
              whileTap={{ scale: 0.92 }}
              animate={isAnimating ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.2 }}
              style={{
                width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, border: 'none', cursor: 'pointer',
                background: isComplete
                  ? 'linear-gradient(135deg, #00c896, #00a87d)'
                  : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.08))',
                color: isComplete ? 'white' : '#ffffff',
                boxShadow: isComplete ? '0 4px 20px rgba(0,200,150,0.3)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {isComplete ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : remaining}
            </motion.button>
          )}
          {total === 1 && (
            <button
              onClick={handleTap}
              style={{
                padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: isComplete ? '#00c896' : 'rgba(139,92,246,0.15)',
                color: 'white',
              }}
            >
              {isComplete ? '✓ تم' : 'اضغط للتسبيح'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontSize: 12, color: '#00c896', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              تم
            </motion.span>
          )}
          {count > 0 && (
            <button
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none',
                color: '#7a6f96', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                padding: '4px 8px', borderRadius: 8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              إعادة
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
