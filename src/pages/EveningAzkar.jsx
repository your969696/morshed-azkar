// src/pages/EveningAzkar.jsx
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eveningAzkar } from '../data/evening-azkar';
import { speakArabic, stopSpeaking } from '../utils/sound';

/* ═══════════════ Helpers ═══════════════ */
function getHadithSourceUrl(reference) {
  if (!reference) return null;
  const r = reference;
  const num = r.match(/رقم\s*(\d+)/);
  const n = num ? num[1] : null;
  if (/البخاري|صحيح البخاري/.test(r)) return n ? `https://sunnah.com/bukhari/${n}` : 'https://sunnah.com/bukhari';
  if (/مسلم|صحيح مسلم/.test(r)) return n ? `https://sunnah.com/muslim/${n}` : 'https://sunnah.com/muslim';
  if (/أبو داود|سنن أبي داود/.test(r)) return n ? `https://sunnah.com/abudawud/${n}` : 'https://sunnah.com/abudawud';
  if (/الترمذي|سنن الترمذي/.test(r)) return n ? `https://sunnah.com/tirmidhi/${n}` : 'https://sunnah.com/tirmidhi';
  if (/النسائي|سنن النسائي/.test(r)) return n ? `https://sunnah.com/nasai/${n}` : 'https://sunnah.com/nasai';
  if (/ابن ماجه|سنن ابن ماجه/.test(r)) return n ? `https://sunnah.com/ibnmajah/${n}` : 'https://sunnah.com/ibnmajah';
  return 'https://sunnah.com';
}

function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function loadArr(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } }

/* ═══════════════ Card Component ═══════════════ */
function AzkarCard({
  azkar, index, isFavorited, onFavorite,
  soundEnabled, isSpeaking, onSpeak,
  isCompleted, onToggleComplete,
  isExpanded, onToggleExpand,
}) {
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const total = azkar.repeat || azkar.count || 1;
  const remaining = Math.max(0, total - count);
  const pct = total > 0 ? Math.min((count / total) * 100, 100) : 0;
  const isDone = count >= total;
  const sourceUrl = getHadithSourceUrl(azkar.reference);
  const hasHadith = azkar.hadithFull || azkar.isnad || azkar.narrator || azkar.reference;

  const gradeStyles = {
    'صحيح': { color: '#00c896', bg: 'rgba(0,200,150,0.08)', border: 'rgba(0,200,150,0.15)' },
    'حسن':  { color: '#f0b040', bg: 'rgba(240,176,64,0.08)', border: 'rgba(240,176,64,0.15)' },
  };
  const gs = gradeStyles[azkar.grade] || { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' };

  const handleTap = useCallback(() => {
    if (isDone) return;
    setCount(c => c + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 200);
    if (soundEnabled) try { const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='); a.volume = 0.15; a.play().catch(() => {}); } catch {}
    if (navigator.vibrate) navigator.vibrate(12);
  }, [isDone, soundEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
      style={{
        background: isDone ? 'rgba(139,92,246,0.03)' : '#151030',
        border: `1px solid ${isDone ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* top accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, left: 0, height: 1.5,
        background: isDone
          ? 'linear-gradient(90deg, transparent, #8b5cf6, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)',
      }} />

      {/* ── header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button onClick={e => { e.stopPropagation(); onToggleComplete(); }}
            style={{
              width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
              border: `1.5px solid ${isCompleted ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
              background: isCompleted ? '#8b5cf6' : 'transparent',
            }}>
            {isCompleted && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.1)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 14, textAlign: 'center' }}>
            {toArabicNum(index + 1)}
          </span>
          {azkar.grade && (
            <span style={{
              fontSize: 7, padding: '1px 5px', borderRadius: 6, fontWeight: 700,
              background: gs.bg, color: gs.color, border: `1px solid ${gs.border}`,
            }}>{azkar.grade}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={e => { e.stopPropagation(); onSpeak(); }}
            style={{
              width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: isSpeaking ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isSpeaking ? '#8b5cf6' : '#7a6f96'} strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              {isSpeaking ? <><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></> : <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); onFavorite(); }}
            style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill={isFavorited ? '#f0b040' : 'none'} stroke={isFavorited ? '#f0b040' : '#7a6f96'} strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── text ── */}
      <p style={{
        fontFamily: '"Amiri Quran", "Amiri", serif',
        fontSize: 17, lineHeight: 2.1, textAlign: 'right',
        color: '#fff', margin: '6px 10px', direction: 'rtl', wordSpacing: 1,
      }}>{azkar.text}</p>

      {/* ── progress ── */}
      {total > 1 && (
        <div style={{ padding: '0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 7.5, color: isDone ? '#8b5cf6' : 'rgba(255,255,255,0.18)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {toArabicNum(count)}/{toArabicNum(total)}
            </span>
            <span style={{ fontSize: 7.5, color: isDone ? '#8b5cf6' : 'rgba(255,255,255,0.18)', fontWeight: 600 }}>
              {Math.round(pct)}%
            </span>
          </div>
          <div style={{ height: 2.5, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 2, background: isDone ? '#8b5cf6' : 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* ── hadith toggle ── */}
      {hasHadith && (
        <div style={{ padding: '4px 8px 0' }}>
          <button onClick={e => { e.stopPropagation(); onToggleExpand(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              width: '100%', padding: '4px 0',
              background: isExpanded ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isExpanded ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 7, cursor: 'pointer', color: '#8b5cf6', fontSize: 8.5, fontWeight: 600,
              transition: 'all 0.2s', fontFamily: '"Cairo", sans-serif',
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{isExpanded ? 'إخفاء الحديث' : 'عرض الحديث والسند'}</span>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
              style={{ transform: isExpanded ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: 4, padding: '6px 8px', borderRadius: 8, background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>التكرار: {toArabicNum(total)}</span>
                    {azkar.source && <span style={{ fontSize: 7.5, color: '#8b5cf6', fontWeight: 700 }}>{azkar.source}</span>}
                  </div>
                  {azkar.isnad && <p style={{ fontSize: 9, color: '#8b5cf6', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 5, textAlign: 'center' }}>{azkar.isnad}</p>}
                  <p style={{ fontFamily: '"Amiri Quran", "Amiri", serif', fontSize: 14, lineHeight: 2, textAlign: 'right', color: 'rgba(255,255,255,0.65)', direction: 'rtl' }}>{azkar.hadithFull || azkar.text}</p>
                  {azkar.narrator && <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 5, textAlign: 'center' }}>رواه <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{azkar.narrator}</span></p>}
                  {azkar.reference && (
                    <div style={{ marginTop: 5, padding: '4px 7px', background: 'rgba(139,92,246,0.04)', borderRadius: 5, border: '1px solid rgba(139,92,246,0.08)' }}>
                      <p style={{ fontSize: 8, color: '#8b5cf6', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {azkar.reference}
                      </p>
                      {sourceUrl && (
                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 3, fontSize: 7.5, color: '#3b82f6', textDecoration: 'none', fontWeight: 600, padding: '2px 5px', borderRadius: 4, background: 'rgba(59,130,246,0.05)' }}>
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          رابط المصدر
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── bottom action ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {total > 1 ? (
            <motion.button onClick={handleTap} whileTap={{ scale: 0.92 }}
              animate={pulse ? { scale: [1, 1.05, 1] } : {}}
              style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', color: '#fff', transition: 'all 0.15s',
                background: isDone ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(139,92,246,0.04))',
                boxShadow: isDone ? '0 2px 12px rgba(139,92,246,0.2)' : 'none',
              }}>
              {isDone
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : toArabicNum(remaining)}
            </motion.button>
          ) : (
            <button onClick={handleTap}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', color: '#fff',
                background: isDone ? '#8b5cf6' : 'rgba(139,92,246,0.1)',
              }}>
              {isDone ? '✓ تم' : 'اضغط للتسبيح'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isDone && (
            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              style={{ fontSize: 9, color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              تم
            </motion.span>
          )}
          {count > 0 && (
            <button onClick={() => setCount(0)}
              style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: 'rgba(255,255,255,0.18)', fontSize: 8, fontWeight: 600, cursor: 'pointer', padding: '2px 5px', borderRadius: 5, fontFamily: '"Cairo", sans-serif' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              إعادة
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Main Page ═══════════════ */
export default function EveningAzkar() {
  const [favorites, setFavorites] = useState(() => loadArr('favorites'));
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [speakingId, setSpeakingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [completedIds, setCompletedIds] = useState(() => {
    const today = new Date().toDateString();
    try {
      const raw = localStorage.getItem('eveningAzkarCompleted');
      if (raw) { const d = JSON.parse(raw); if (d.date === today) return d.ids || []; }
    } catch {}
    return [];
  });
  const [filter, setFilter] = useState('all');
  const scrollRef = useRef(null);

  const totalAzkar = eveningAzkar.length;
  const completedCount = eveningAzkar.filter(a => completedIds.includes(a.id)).length;
  const pendingCount = totalAzkar - completedCount;
  const progress = totalAzkar > 0 ? (completedCount / totalAzkar) * 100 : 0;
  const allDone = completedCount === totalAzkar && totalAzkar > 0;

  const toggleFavorite = id => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleSpeak = (text, id) => {
    if (speakingId === id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(id);
    speakArabic(text, () => setSpeakingId(null));
  };

  const toggleCompleted = id => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('eveningAzkarCompleted', JSON.stringify({ date: new Date().toDateString(), ids: next }));
      return next;
    });
  };

  const filtered = eveningAzkar.filter(a => {
    if (filter === 'done') return completedIds.includes(a.id);
    if (filter === 'pending') return !completedIds.includes(a.id);
    if (filter === 'fav') return favorites.includes(a.id);
    return true;
  });

  const filterTabs = [
    { key: 'all', label: 'الكل', count: totalAzkar },
    { key: 'pending', label: 'متبقية', count: pendingCount },
    { key: 'done', label: 'مكتملة', count: completedCount },
    { key: 'fav', label: 'المفضلة', count: favorites.length },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* BG layers */}
      <div className="absolute inset-0" style={{ background: '#0c0818' }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.03) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23fff' stroke-width='.3'/%3E%3C/svg%3E")`,
        backgroundSize: '60px',
      }} />
      <style>{`.mls::-webkit-scrollbar{display:none}.mls{scrollbar-width:none;-ms-overflow-style:none}`}</style>

      {/* ════════ HEADER 62px ════════ */}
      <header className="relative flex-shrink-0 z-10" style={{ height: 62 }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(170deg, #1c1040 0%, #0c0818 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}>
          <div className="absolute" style={{ top: -20, right: -15, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent 70%)', pointerEvents: 'none' }} />
          <div className="absolute" style={{ bottom: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.04), transparent 70%)', pointerEvents: 'none' }} />
        </div>

        <div className="relative h-full flex items-center justify-between px-3.5">
          <div className="flex items-center" style={{ gap: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.06))',
              border: '1px solid rgba(139,92,246,0.12)', fontSize: 16, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(139,92,246,0.08)',
            }}>🌙</div>
            <div>
              <h1 style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: '15px', margin: 0, fontFamily: '"Cairo", sans-serif' }}>أذكار المساء</h1>
              <p style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.18)', margin: '1px 0 0', fontFamily: '"Cairo", sans-serif' }}>
                {toArabicNum(totalAzkar)} أذكار · {toArabicNum(completedCount)} مكتملة
              </p>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: 5 }}>
            {completedCount > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: '"Cairo", sans-serif',
                color: allDone ? '#8b5cf6' : '#a78bfa', padding: '2px 7px', borderRadius: 7,
                background: allDone ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
                border: `1px solid ${allDone ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)'}`,
              }}>
                {toArabicNum(completedCount)}/{toArabicNum(totalAzkar)}
              </span>
            )}
            <button onClick={() => { const n = !soundEnabled; setSoundEnabled(n); localStorage.setItem('soundEnabled', String(n)); }}
              style={{
                width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
                background: soundEnabled ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${soundEnabled ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)'}`,
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={soundEnabled ? '#8b5cf6' : '#7a6f96'} strokeWidth="2" strokeLinecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                {soundEnabled ? <><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></> : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}
              </svg>
            </button>
          </div>
        </div>

        {/* global progress */}
        {completedCount > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.03)' }}>
            <motion.div
              style={{ height: '100%', background: allDone ? '#8b5cf6' : 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }}
            />
          </div>
        )}
      </header>

      {/* ════════ FILTER ════════ */}
      <div className="relative z-10 flex-shrink-0" style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 5, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        {filterTabs.map(f => {
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: active ? 700 : 500,
                background: active ? 'rgba(139,92,246,0.08)' : 'transparent',
                border: `1px solid ${active ? 'rgba(139,92,246,0.14)' : 'transparent'}`,
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"Cairo", sans-serif', display: 'flex', alignItems: 'center', gap: 4,
              }}>
              {f.label}
              <span style={{ fontSize: 9, opacity: 0.5 }}>{toArabicNum(f.count)}</span>
            </button>
          );
        })}
      </div>

      {/* ════════ LIST ════════ */}
      <div ref={scrollRef} className="mls relative z-10 flex-1" style={{ overflowY: 'auto', padding: '6px 8px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {filtered.map((azkar, i) => (
            <AzkarCard
              key={azkar.id}
              azkar={azkar}
              index={i}
              isFavorited={favorites.includes(azkar.id)}
              onFavorite={() => toggleFavorite(azkar.id)}
              soundEnabled={soundEnabled}
              isSpeaking={speakingId === azkar.id}
              onSpeak={() => handleSpeak(azkar.text, azkar.id)}
              isCompleted={completedIds.includes(azkar.id)}
              onToggleComplete={() => toggleCompleted(azkar.id)}
              isExpanded={expandedId === azkar.id}
              onToggleExpand={() => setExpandedId(expandedId === azkar.id ? null : azkar.id)}
            />
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 16px' }}>
              <p style={{ fontSize: 24, marginBottom: 6 }}>{filter === 'fav' ? '⭐' : filter === 'done' ? '🎉' : '📭'}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>
                {filter === 'fav' ? 'لم تضف أي ذكر للمفضلة بعد' : filter === 'done' ? 'لم تكمل أي ذكر بعد' : 'لا توجد أذكار متبقية'}
              </p>
            </div>
          )}
        </div>

        {/* all done banner */}
        <AnimatePresence>
          {allDone && filter === 'all' && (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                margin: '8px 0 12px', padding: '12px', borderRadius: 12, textAlign: 'center',
                background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)',
              }}>
              <div style={{ fontSize: 24, marginBottom: 3 }}>🌙</div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 12, margin: '0 0 2px', fontFamily: '"Cairo", sans-serif' }}>ما شاء الله! أكملت أذكار المساء</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, margin: 0, fontFamily: '"Cairo", sans-serif' }}>بارك الله فيك وحفظك</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}