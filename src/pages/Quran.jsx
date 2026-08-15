// src/pages/Quran.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { surahsData, fetchSurahText, fetchTafseer, getAyahAudioUrl, reciters } from '../utils/quran';
import { surahDetails } from '../data/surah-details';

/* ═══════════════ Helpers ═══════════════ */
function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function loadJSON(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function getJuz(ayahNum) {
  const juzStarts = [1,22,42,62,82,102,122,142,162,182,202,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582,602];
  for (let i = juzStarts.length - 1; i >= 0; i--) { if (ayahNum >= juzStarts[i]) return i + 1; }
  return 1;
}

/* ═══════════════ Constants ═══════════════ */
const FILTER_OPTS = [
  { id: 'all', label: 'الكل', count: 114 },
  { id: 'makiya', label: 'مكية', count: surahsData.filter(s => s.type === 'مكية').length },
  { id: 'madaniya', label: 'مدنية', count: surahsData.filter(s => s.type === 'مدنية').length },
];

/* ═══════════════ Shared inline styles ═══════════════ */
const S = {
  card: { borderRadius: 10, background: '#151030', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' },
  cardAccent: { position: 'absolute', top: 0, right: 0, left: 0, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(240,176,64,0.2), transparent)' },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.15)', fontWeight: 600 },
  input: {
    width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 13,
    background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(255,255,255,0.04)', outline: 'none',
    fontFamily: '"Cairo", sans-serif', direction: 'rtl',
  },
  select: {
    width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 13,
    background: '#151030', color: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(255,255,255,0.04)', outline: 'none',
    fontFamily: '"Cairo", sans-serif', direction: 'rtl', cursor: 'pointer',
  },
  pill: (active, color = '#f0b040') => ({
    padding: '4px 12px', borderRadius: 5, fontSize: 11, fontWeight: active ? 700 : 500,
    background: active ? `${color}12` : 'transparent',
    border: `1px solid ${active ? `${color}25` : 'transparent'}`,
    color: active ? color : 'rgba(255,255,255,0.16)',
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"Cairo", sans-serif',
  }),
  iconBtn: (active = false, bg = 'rgba(255,255,255,0.03)') => ({
    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', background: active ? 'rgba(240,176,64,0.1)' : bg, transition: 'all 0.15s',
  }),
  sectionTitle: { fontSize: 12, color: 'rgba(255,255,255,0.18)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 4 },
};

/* ═══════════════ Surah List Item ═══════════════ */
function SurahRow({ surah, index, isBookmarked, onBookmark, lastRead }) {
  const isActive = lastRead;
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.15) }}
      style={{
        width: '100%', textAlign: 'right', display: 'block', padding: 0, border: 'none', cursor: 'pointer',
        borderRadius: 10, position: 'relative', overflow: 'hidden',
        background: isActive ? 'rgba(0,200,150,0.03)' : '#151030',
        border: `1px solid ${isActive ? 'rgba(0,200,150,0.1)' : 'rgba(255,255,255,0.035)'}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, left: 0, height: 1.5,
        background: isActive
          ? 'linear-gradient(90deg, transparent, #00c896, transparent)'
          : surah.type === 'مكية'
            ? 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(240,176,64,0.15), transparent)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px' }}>
        {/* number badge */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive ? 'rgba(0,200,150,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isActive ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.04)'}`,
          fontSize: 13, fontWeight: 700, color: isActive ? '#00c896' : '#f0b040',
          flexShrink: 0, fontVariantNumeric: 'tabular-nums',
        }}>
          {surah.number}
        </div>

        {/* name + info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              fontSize: 15, fontWeight: 700, color: '#fff', direction: 'rtl',
              fontFamily: '"Amiri Quran", "Amiri", serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{surah.name}</span>
            {isActive && (
              <span style={{ fontSize: 8, color: '#00c896', flexShrink: 0, padding: '2px 5px', borderRadius: 4, background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.1)' }}>
                أخيرة
              </span>
            )}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '2px 0 0', direction: 'ltr', fontFamily: '"Cairo", sans-serif' }}>
            {surah.englishName}
          </p>
        </div>

        {/* right: type + ayahs + bookmark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 5, fontWeight: 700,
              background: surah.type === 'مكية' ? 'rgba(139,92,246,0.08)' : 'rgba(240,176,64,0.08)',
              color: surah.type === 'مكية' ? '#8b5cf6' : '#f0b040',
              border: `1px solid ${surah.type === 'مكية' ? 'rgba(139,92,246,0.12)' : 'rgba(240,176,64,0.12)'}`,
            }}>{surah.type}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', fontVariantNumeric: 'tabular-nums' }}>
              {toArabicNum(surah.verses)} آية
            </span>
          </div>
        </div>

        {/* bookmark */}
        <button
          onClick={e => { e.stopPropagation(); onBookmark(); }}
          style={{ ...S.iconBtn(isBookmarked), flexShrink: 0, width: 26, height: 26 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={isBookmarked ? '#f0b040' : 'none'} stroke={isBookmarked ? '#f0b040' : 'rgba(255,255,255,0.12)'} strokeWidth="2" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    </motion.button>
  );
}

/* ═══════════════ Main Component ═══════════════ */
export default function Quran() {
  const [view, setView] = useState('list'); // 'list' | 'info' | 'reading'
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahText, setSurahText] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fontSize, setFontSize] = useState(1.4);
  const [selectedReciter, setSelectedReciter] = useState(() => localStorage.getItem('quran_reciter') || 'ar.alafasy');
  const [playingAyah, setPlayingAyah] = useState(null);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [tafseerText, setTafseerText] = useState('');
  const [tafseerLoading, setTafseerLoading] = useState(false);
  const [tafseerFontSize, setTafseerFontSize] = useState(1.0);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  // persisted state
  const [bookmarks, setBookmarks] = useState(() => loadJSON('quran_bm', []));
  const [lastRead, setLastRead] = useState(() => loadJSON('quran_last', null));
  const [readHistory, setReadHistory] = useState(() => loadJSON('quran_history', []));

  // save reciter
  useEffect(() => { localStorage.setItem('quran_reciter', selectedReciter); }, [selectedReciter]);
  useEffect(() => { saveJSON('quran_bm', bookmarks); }, [bookmarks]);
  useEffect(() => { saveJSON('quran_last', lastRead); }, [lastRead]);
  useEffect(() => { saveJSON('quran_history', readHistory); }, [readHistory]);

  // cleanup audio on unmount
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  // load surah when entering reading view
  useEffect(() => {
    if (view === 'reading' && selectedSurah) loadSurah(selectedSurah.number);
  }, [view, selectedSurah]);

  /* ── Filter + search ── */
  const filteredSurahs = surahsData.filter(s => {
    const matchSearch = !search || s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || s.number.toString() === search;
    const matchFilter = filter === 'all' || (filter === 'makiya' && s.type === 'مكية') || (filter === 'madaniya' && s.type === 'مدنية');
    return matchSearch && matchFilter;
  });

  /* ── Data loading ── */
  const loadSurah = async (num) => {
    setLoading(true); setSurahText([]); setSelectedAyah(null); setTafseerText('');
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingAyah(null);
    const data = await fetchSurahText(num);
    if (data?.ayahs) setSurahText(data.ayahs);
    setLoading(false);
    // save last read
    const surah = surahsData.find(s => s.number === num);
    if (surah) {
      setLastRead({ number: num, name: surah.name, time: Date.now() });
      setReadHistory(prev => {
        const filtered = prev.filter(h => h.number !== num);
        return [{ number: num, name: surah.name, time: Date.now() }, ...filtered].slice(0, 20);
      });
    }
  };

  const handleAyahClick = async (verse) => {
    if (selectedAyah === verse.number) { setSelectedAyah(null); setTafseerText(''); return; }
    setSelectedAyah(verse.number); setTafseerLoading(true); setTafseerText('');
    const t = await fetchTafseer(selectedSurah.number, verse.numberInSurah);
    setTafseerText(t || 'التفسير غير متاح حالياً'); setTafseerLoading(false);
  };

  const playAyahAudio = (ayah) => {
    if (audioRef.current) { audioRef.current.pause(); if (playingAyah === ayah.number) { setPlayingAyah(null); return; } }
    const audio = new Audio(getAyahAudioUrl(ayah.number, selectedReciter));
    audioRef.current = audio; setPlayingAyah(ayah.number);
    audio.play().catch(() => setPlayingAyah(null));
    audio.onended = () => setPlayingAyah(null);
    audio.onerror = () => setPlayingAyah(null);
  };

  const playAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingAyah(null); return; }
    if (!surahText.length) return;
    let idx = 0;
    const next = () => {
      if (idx >= surahText.length) { setPlayingAyah(null); return; }
      const ayah = surahText[idx];
      const audio = new Audio(getAyahAudioUrl(ayah.number, selectedReciter));
      audioRef.current = audio; setPlayingAyah(ayah.number);
      audio.play().catch(() => setPlayingAyah(null));
      audio.onended = () => { idx++; next(); };
      audio.onerror = () => setPlayingAyah(null);
    };
    next();
  };

  const stopAudio = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setPlayingAyah(null); };

  const toggleBookmark = (num) => {
    setBookmarks(prev => prev.includes(num) ? prev.filter(b => b !== num) : [...prev, num]);
  };

  const openSurah = (surah, info = false) => {
    setSelectedSurah(surah);
    setView(info ? 'info' : 'reading');
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const goBack = () => {
    stopAudio(); setSelectedAyah(null); setTafseerText('');
    setView('list');
  };

  /* ═══════════════════════════════════
     RENDER — Reading View
     ═══════════════════════════════════ */
  if (view === 'reading' && selectedSurah) {
    const nextSurah = selectedSurah.number < 114 ? surahsData.find(s => s.number === selectedSurah.number + 1) : null;
    const prevSurah = selectedSurah.number > 1 ? surahsData.find(s => s.number === selectedSurah.number - 1) : null;
    const isBm = bookmarks.includes(selectedSurah.number);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div className="absolute inset-0" style={{ background: '#0c0818' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(240,176,64,0.02) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23fff' stroke-width='.3'/%3E%3C/svg%3E")`, backgroundSize: '60px' }} />
        <style>{`.qrs::-webkit-scrollbar{display:none}.qrs{scrollbar-width:none}`}</style>

        {/* Header 62px */}
        <header className="relative flex-shrink-0 z-10" style={{ height: 62 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, #1c1040 0%, #0c0818 100%)', borderBottom: '1px solid rgba(255,255,255,0.03)' }} />
          <div className="relative h-full flex items-center justify-between px-4">
            <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"Cairo", sans-serif' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              الفهرس
            </button>
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: '"Amiri Quran", "Amiri", serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedSurah.name}</h1>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', margin: '2px 0 0' }}>{selectedSurah.type} · {toArabicNum(selectedSurah.verses)} آية</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => toggleBookmark(selectedSurah.number)} style={S.iconBtn(isBm)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={isBm ? '#f0b040' : 'none'} stroke={isBm ? '#f0b040' : 'rgba(255,255,255,0.15)'} strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
              <button onClick={() => openSurah(selectedSurah, true)} style={S.iconBtn(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Controls bar 38px */}
        <div className="relative z-10 flex-shrink-0" style={{ height: 38, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          {/* reciter select */}
          <select value={selectedReciter} onChange={e => setSelectedReciter(e.target.value)}
            style={{ ...S.select, width: 'auto', flex: 1, minWidth: 0, fontSize: 11, padding: '4px 8px', borderRadius: 6 }}>
            {reciters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          {/* font size */}
          <button onClick={() => setFontSize(f => Math.min(f + 0.15, 2.5))} style={{ ...S.iconBtn(), width: 28, height: 28 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>+</span>
          </button>
          <button onClick={() => setFontSize(f => Math.max(f - 0.15, 0.9))} style={{ ...S.iconBtn(), width: 28, height: 28 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>−</span>
          </button>

          {/* play/stop */}
          <button onClick={playingAyah ? stopAudio : playAll}
            style={{
              ...S.iconBtn(!!playingAyah, playingAyah ? 'rgba(239,68,68,0.08)' : 'rgba(0,200,150,0.08)'),
              width: 'auto', padding: '0 10px', gap: 4, borderRadius: 7,
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={playingAyah ? '#ef4444' : '#00c896'} strokeWidth="2.5" strokeLinecap="round">
              {playingAyah ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></> : <polygon points="5 3 19 12 5 21 5 3"/>}
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: playingAyah ? '#ef4444' : '#00c896' }}>{playingAyah ? 'إيقاف' : 'استماع'}</span>
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="qrs relative z-10 flex-1" style={{ overflowY: 'auto', padding: '8px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', fontSize: 24, marginBottom: 8 }}>📖</motion.div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>جاري تحميل السورة...</p>
            </div>
          )}

          {!loading && surahText.length > 0 && (
            <div style={{ ...S.card, padding: '12px 10px', marginBottom: 8 }}>
              {/* bismillah */}
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <p style={{ textAlign: 'center', fontSize: 14, color: '#f0b040', fontWeight: 700, marginBottom: 10, fontFamily: '"Amiri Quran", "Amiri", serif', lineHeight: 2 }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              )}

              {/* ayahs */}
              <div style={{ lineHeight: 2.4, textAlign: 'center', fontSize: `${fontSize}rem`, direction: 'rtl' }}>
                {surahText.map((verse, i) => (
                  <span key={i} style={{ display: 'inline' }}>
                    <button onClick={() => handleAyahClick(verse)}
                      style={{
                        background: selectedAyah === verse.number ? 'rgba(240,176,64,0.12)' : 'transparent',
                        border: 'none', cursor: 'pointer', padding: '0 2px',
                        color: playingAyah === verse.number ? '#00c896' : selectedAyah === verse.number ? '#f0b040' : '#fff',
                        fontFamily: '"Amiri Quran", "Amiri", serif', fontSize: 'inherit', lineHeight: 'inherit',
                        transition: 'color 0.2s, background 0.2s', borderRadius: 3,
                      }}>
                      {verse.text}
                    </button>
                    <button onClick={e => { e.stopPropagation(); playAyahAudio(verse); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: playingAyah === verse.number ? 'rgba(0,200,150,0.12)' : 'rgba(240,176,64,0.06)',
                        color: playingAyah === verse.number ? '#00c896' : '#f0b040',
                        fontSize: 7, fontWeight: 700, margin: '0 1px', verticalAlign: 'middle',
                        transition: 'all 0.15s', fontVariantNumeric: 'tabular-nums',
                      }}>
                      {toArabicNum(verse.numberInSurah)}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tafseer popup */}
          <AnimatePresence>
            {selectedAyah && !loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                style={{ ...S.card, padding: '10px 12px', marginBottom: 10, borderColor: 'rgba(240,176,64,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#f0b040', fontWeight: 700 }}>📖 التفسير</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button onClick={() => setTafseerFontSize(f => Math.min(f + 0.1, 1.8))} style={{ ...S.iconBtn(), width: 22, height: 22 }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>+</span></button>
                    <button onClick={() => setTafseerFontSize(f => Math.max(f - 0.1, 0.7))} style={{ ...S.iconBtn(), width: 22, height: 22 }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>−</span></button>
                    <button onClick={() => { setSelectedAyah(null); setTafseerText(''); }} style={{ ...S.iconBtn(), width: 22, height: 22 }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>✕</span></button>
                  </div>
                </div>
                {tafseerLoading ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: 10 }}>جاري تحميل التفسير...</div>
                ) : (
                  <p style={{ fontFamily: '"Amiri", "Noto Naskh Arabic", serif', fontSize: `${tafseerFontSize}rem`, lineHeight: 2.1, textAlign: 'right', color: 'rgba(255,255,255,0.55)', direction: 'rtl' }}>
                    {tafseerText}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {prevSurah && (
              <button onClick={() => openSurah(prevSurah)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, fontFamily: '"Cairo", sans-serif', textAlign: 'center' }}>
                ← {prevSurah.name}
              </button>
            )}
            {nextSurah && (
              <button onClick={() => openSurah(nextSurah)}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00c896, #00a87d)', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: '"Cairo", sans-serif', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,200,150,0.15)' }}>
                {nextSurah.name} ←
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.06)', marginBottom: 18 }}>التفسير — spa5k/tafsir_api</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════
     RENDER — Surah Info View
     ═══════════════════════════════════ */
  if (view === 'info' && selectedSurah) {
    const detail = surahDetails[selectedSurah.number] || {};

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div className="absolute inset-0" style={{ background: '#0c0818' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.04) 0%, transparent 50%)' }} />
        <style>{`.qis::-webkit-scrollbar{display:none}.qis{scrollbar-width:none}`}</style>

        {/* Header 62px */}
        <header className="relative flex-shrink-0 z-10" style={{ height: 62 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, #1c1040 0%, #0c0818 100%)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div className="absolute" style={{ top: -15, right: -10, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,176,64,0.06), transparent 70%)', pointerEvents: 'none' }} />
          </div>
          <div className="relative h-full flex items-center justify-between px-4">
            <button onClick={() => setView('reading')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"Cairo", sans-serif' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              القراءة
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: '"Amiri Quran", "Amiri", serif' }}>{selectedSurah.name}</h1>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', margin: '2px 0 0' }}>معلومات السورة</p>
            </div>
            <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"Cairo", sans-serif' }}>
              الفهرس
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="qis relative z-10 flex-1" style={{ overflowY: 'auto', padding: '8px' }}>
          {/* surah badge */}
          <div style={{ textAlign: 'center', padding: '12px 0 14px' }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 8px', fontSize: 20, fontWeight: 800, border: '2px solid',
              background: selectedSurah.type === 'مكية' ? 'rgba(139,92,246,0.1)' : 'rgba(240,176,64,0.1)',
              borderColor: selectedSurah.type === 'مكية' ? 'rgba(139,92,246,0.2)' : 'rgba(240,176,64,0.2)',
              color: selectedSurah.type === 'مكية' ? '#8b5cf6' : '#f0b040',
              fontFamily: '"Amiri Quran", "Amiri", serif',
            }}>
              {toArabicNum(selectedSurah.number)}
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: '"Amiri Quran", "Amiri", serif', margin: 0 }}>{selectedSurah.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>{selectedSurah.englishName}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5 }}>
              <span style={{
                fontSize: 9, padding: '2px 8px', borderRadius: 5, fontWeight: 700,
                background: selectedSurah.type === 'مكية' ? 'rgba(139,92,246,0.08)' : 'rgba(240,176,64,0.08)',
                color: selectedSurah.type === 'مكية' ? '#8b5cf6' : '#f0b040',
                border: `1px solid ${selectedSurah.type === 'مكية' ? 'rgba(139,92,246,0.12)' : 'rgba(240,176,64,0.12)'}`,
              }}>{selectedSurah.type}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>{toArabicNum(selectedSurah.verses)} آية</span>
            </div>
          </div>

          {/* info sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.description && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px' }}>
                <div style={S.cardAccent} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>📖</span>
                  <span style={{ ...S.sectionTitle, marginBottom: 0 }}>معلومات السورة</span>
                </div>
                <p style={{ fontFamily: '"Amiri", "Noto Naskh Arabic", serif', fontSize: 13, lineHeight: 2, textAlign: 'right', color: 'rgba(255,255,255,0.5)', direction: 'rtl' }}>{detail.description}</p>
              </div>
            )}

            {detail.meaning && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px' }}>
                <div style={S.cardAccent} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>💎</span>
                  <span style={{ ...S.sectionTitle, marginBottom: 0 }}>معنى الاسم</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.9, textAlign: 'right', color: 'rgba(255,255,255,0.5)', direction: 'rtl' }}>{detail.meaning}</p>
              </div>
            )}

            {detail.reason && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px' }}>
                <div style={S.cardAccent} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>📜</span>
                  <span style={{ ...S.sectionTitle, marginBottom: 0 }}>سبب النزول</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.9, textAlign: 'right', color: 'rgba(255,255,255,0.5)', direction: 'rtl' }}>{detail.reason}</p>
              </div>
            )}

            {detail.virtues?.length > 0 && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px' }}>
                <div style={S.cardAccent} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>⭐</span>
                  <span style={{ ...S.sectionTitle, marginBottom: 0 }}>فضائل السورة</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {detail.virtues.map((v, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p style={{ fontFamily: '"Amiri", "Noto Naskh Arabic", serif', fontSize: 12, lineHeight: 1.9, textAlign: 'right', color: 'rgba(255,255,255,0.5)', direction: 'rtl', margin: 0 }}>{v.text}</p>
                      {v.source && <p style={{ fontSize: 10, color: '#f0b040', marginTop: 4, fontWeight: 600 }}>📚 {v.source}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.topics?.length > 0 && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px' }}>
                <div style={S.cardAccent} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>📑</span>
                  <span style={{ ...S.sectionTitle, marginBottom: 0 }}>محاور السورة</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {detail.topics.map((t, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 600, background: 'rgba(0,200,150,0.06)', color: '#00c896', border: '1px solid rgba(0,200,150,0.1)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {detail.hasAyatAlKursi && (
              <div style={{ ...S.card, position: 'relative', padding: '10px 12px', borderColor: 'rgba(240,176,64,0.15)', background: 'rgba(240,176,64,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <span style={{ fontSize: 13 }}>🏆</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f0b040' }}>آية الكرسي</span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>تحتوي السورة على آية الكرسي · الآية: {toArabicNum(detail.ayatAlKursiAyah)}</p>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10, marginBottom: 18 }}>
            <button onClick={() => setView('reading')}
              style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #00c896, #00a87d)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: '"Cairo", sans-serif', boxShadow: '0 3px 14px rgba(0,200,150,0.15)' }}>
              📖 فتح السورة للقراءة
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════
     RENDER — Main List View
     ═══════════════════════════════════ */
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="absolute inset-0" style={{ background: '#0c0818' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(240,176,64,0.02) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23fff' stroke-width='.3'/%3E%3C/svg%3E")`, backgroundSize: '60px' }} />
      <style>{`.qls::-webkit-scrollbar{display:none}.qls{scrollbar-width:none}`}</style>

      {/* ════════ HEADER 70px ════════ */}
      <header className="relative flex-shrink-0 z-10" style={{ height: 70 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, #1c1040 0%, #0c0818 100%)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="absolute" style={{ top: -20, right: -15, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,176,64,0.06), transparent 70%)', pointerEvents: 'none' }} />
        </div>
        <div className="relative h-full flex items-center justify-between px-4">
          <div className="flex items-center" style={{ gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(240,176,64,0.14), rgba(240,176,64,0.03))', border: '1px solid rgba(240,176,64,0.1)', fontSize: 18, flexShrink: 0, boxShadow: '0 2px 8px rgba(240,176,64,0.06)' }}>📖</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: '18px', margin: 0, fontFamily: '"Cairo", sans-serif' }}>القرآن الكريم</h1>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', margin: '2px 0 0', fontFamily: '"Cairo", sans-serif' }}>١١٤ سورة · قراءة واستماع وتفسير</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {lastRead && (
              <button onClick={() => { const s = surahsData.find(s => s.number === lastRead.number); if (s) openSurah(s); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.1)', cursor: 'pointer', color: '#00c896', fontSize: 11, fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {lastRead.name}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ════════ SEARCH + FILTER 60px ════════ */}
      <div className="relative z-10 flex-shrink-0" style={{ padding: '8px 12px 7px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input type="text" placeholder="ابحث عن سورة..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...S.input, flex: 1, padding: '8px 12px', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {FILTER_OPTS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={S.pill(filter === f.id)}>
              {f.label}
              <span style={{ fontSize: 9, opacity: 0.45, marginRight: 2 }}>{toArabicNum(f.count)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════ LIST ════════ */}
      <div className="qls relative z-10 flex-1" style={{ overflowY: 'auto', padding: '6px 8px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredSurahs.map((surah, i) => (
            <div key={surah.number} onClick={() => openSurah(surah)}>
              <SurahRow
                surah={surah}
                index={i}
                isBookmarked={bookmarks.includes(surah.number)}
                onBookmark={() => toggleBookmark(surah.number)}
                lastRead={lastRead?.number === surah.number}
              />
            </div>
          ))}
        </div>

        {filteredSurahs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontWeight: 600, fontFamily: '"Cairo", sans-serif' }}>لا توجد نتائج</p>
          </div>
        )}

        {/* reading history */}
        {!search && filter === 'all' && readHistory.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 10 }}>
            <p style={S.sectionTitle}>📖 سجل القراءة</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {readHistory.slice(0, 5).map(h => {
                const s = surahsData.find(s => s.number === h.number);
                if (!s) return null;
                const ago = Math.round((Date.now() - h.time) / 60000);
                const agoText = ago < 60 ? `منذ ${toArabicNum(ago)} دقيقة` : ago < 1440 ? `منذ ${toArabicNum(Math.round(ago / 60))} ساعة` : `منذ ${toArabicNum(Math.round(ago / 1440))} يوم`;
                return (
                  <button key={h.number} onClick={() => openSurah(s)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.025)',
                    cursor: 'pointer', width: '100%', textAlign: 'right',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f0b040', width: 24, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{h.number}</span>
                    <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: '"Amiri Quran", "Amiri", serif' }}>{h.name}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.08)' }}>{agoText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}