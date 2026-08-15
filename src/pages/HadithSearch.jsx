import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLLECTIONS = [
  { id: 'bukhari', name: 'صحيح البخاري', en: 'Bukhari', color: '#00c896', count: 7589 },
  { id: 'muslim', name: 'صحيح مسلم', en: 'Muslim', color: '#3b82f6', count: 7500 },
  { id: 'abudawud', name: 'سنن أبي داود', en: 'Abu Dawud', color: '#f0b040', count: 5274 },
  { id: 'tirmidhi', name: 'سنن الترمذي', en: 'Tirmidhi', color: '#ec4899', count: 3956 },
  { id: 'nasai', name: 'سنن النسائي', en: 'Nasai', color: '#8b5cf6', count: 5758 },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', en: 'Ibn Majah', color: '#00c896', count: 4341 },
];

const FEATURED_HADITHS = [
  { collection: 'bukhari', number: 1, text: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه', en: 'Actions are but by intentions, and every person shall have only what he intended.' },
  { collection: 'muslim', number: 8, text: 'لا يُؤمِنُ أحدُكم حتّى يُحبَّ لأخيهِ ما يُحبُّ لنفسِهِ', en: 'None of you truly believes until he loves for his brother what he loves for himself.' },
  { collection: 'bukhari', number: 15, text: 'من لم تنهه صلاته عن الفحشاء والمنكر فلا صلاة له', en: 'He whose prayer does not prevent him from immorality and wrongdoing, his prayer is not improved by it.' },
  { collection: 'tirmidhi', number: 2564, text: 'كان رسول الله صلى الله عليه وسلم لا يُسبُّ لا أحداً من الناس، ولا الخَرفَش، ولا التَّرْجُل، ولا صِغَارَ الكِبَر، وقال: كُنُوا عِبَادَ اللهِ إخواناً', en: 'The Messenger of Allah (ﷺ) used not to abuse any person, nor use bad words, nor use bad language.' },
];

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const DiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
  </svg>
);

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f0b040' : 'none'} stroke="#f0b040" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7a6f96" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

function toArabicNumber(num) {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNums[parseInt(d)]).join('');
}

function getGradeBadgeStyle(text) {
  if (!text) return { label: '—', color: '#7a6f96', bg: 'rgba(122,111,150,0.15)' };
  const lower = text.toLowerCase();
  if (lower.includes('sahih') || lower.includes('صحيح')) return { label: 'صحيح', color: '#00c896', bg: 'rgba(0,200,150,0.15)' };
  if (lower.includes('hasan') || lower.includes('حسن')) return { label: 'حسن', color: '#f0b040', bg: 'rgba(240,176,64,0.15)' };
  if (lower.includes('daif') || lower.includes('ضعيف')) return { label: 'ضعيف', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  return { label: text, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
}

export default function HadithSearch() {
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('ara-bukhari');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [featuredHadiths, setFeaturedHadiths] = useState(FEATURED_HADITHS);
  const [randomLoading, setRandomLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [selectedHadith, setSelectedHadith] = useState(null);
  const searchInputRef = useRef(null);
  const _abortRef = useRef(null);
  const cacheRef = useRef({});

  useEffect(() => {
    const loadFeatured = async () => {
      setFeaturedLoading(true);
      try {
        const promises = FEATURED_HADITHS.map(async (h) => {
          try {
            const res = await fetch(`./data/hadith/${h.collection}.json`);
            if (!res.ok) throw new Error('not ok');
            const data = await res.json();
            const hadiths = data.hadiths || [];
            const found = hadiths.find(hh => hh.hadithNumber === h.number || hh.number === h.number);
            return {
              collection: h.collection,
              number: h.number,
              text: found?.text || h.text,
              en: found?.englishHadith || h.en,
              grade: found?.grades?.[0]?.grade || '',
            };
          } catch {
            return { collection: h.collection, number: h.number, text: h.text, en: h.en, grade: 'Sahih' };
          }
        });
        const loaded = await Promise.all(promises);
        setFeaturedHadiths(loaded);
      } catch {
        // keep defaults
      }
      setFeaturedLoading(false);
    };
    loadFeatured();
  }, []);

  const loadCollectionData = async (collectionId) => {
    if (cacheRef.current[collectionId]) return cacheRef.current[collectionId];
    setLoading(true);
    try {
      const res = await fetch(`./data/hadith/${collectionId}.json`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      cacheRef.current[collectionId] = data.hadiths || [];
      return data.hadiths || [];
    } catch {
      setError('فشل تحميل البيانات.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, collection) => {
    const q = query || search;
    const c = collection || selectedCollection;
    if (!q.trim()) {
      searchInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setSearched(true);
    setError('');
    setResults([]);
    setSelectedHadith(null);

    try {
      const hadiths = await loadCollectionData(c);
      if (!hadiths.length) {
        setError('لا توجد نتائج.');
        setLoading(false);
        return;
      }
      const queryLower = q.trim().toLowerCase();
      const matched = [];
      for (const h of hadiths) {
        if (h.text && h.text.toLowerCase().includes(queryLower)) {
          matched.push(h);
          if (matched.length >= 50) break;
        }
      }
      setResults(matched);
      setTotalResults(matched.length);
      if (matched.length === 0) setError('لا توجد نتائج لهذا البحث.');
    } catch {
      setError('حدث خطأ أثناء البحث.');
    }
    setLoading(false);
  };

  const handleRandom = async () => {
    setRandomLoading(true);
    setError('');
    try {
      const hadiths = await loadCollectionData(selectedCollection);
      if (hadiths.length > 0) {
        const randomIdx = Math.floor(Math.random() * hadiths.length);
        setResults([hadiths[randomIdx]]);
        setTotalResults(1);
        setSearched(true);
        setSelectedHadith(null);
      }
    } catch {
      setError('حدث خطأ أثناء جلب الحديث العشوائي.');
    }
    setRandomLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const getCollectionInfo = (id) => {
    if (!id) return COLLECTIONS[0];
    const found = COLLECTIONS.find(c => id.includes(c.id.replace('ara-', '')) || c.id === id);
    return found || COLLECTIONS[0];
  };

  const renderHadithCard = (hadith, idx) => {
    const coll = getCollectionInfo(hadith.collection || selectedCollection);
    const gradeInfo = getGradeBadgeStyle(hadith.grades?.[0]?.grade);
    const isExpanded = selectedHadith === idx;

    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
        onClick={() => setSelectedHadith(isExpanded ? null : idx)}
        style={{
          background: '#151030',
          borderRadius: '1rem',
          border: `1px solid ${isExpanded ? coll.color + '40' : 'rgba(255,255,255,0.06)'}`,
          padding: '1.25rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: coll.color,
              background: coll.color + '15',
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              border: `1px solid ${coll.color}25`,
            }}>
              {coll.name}
            </span>
          </div>
          <span style={{ color: '#7a6f96', fontSize: '0.75rem' }}>
            حديث رقم {toArabicNumber(hadith.hadithnumber || hadith.hadithNumber || hadith.number || idx + 1)}
          </span>
        </div>

        <p style={{
          fontFamily: "var(--font-amiri, 'Amiri Quran', serif)",
          fontSize: '1.1rem',
          lineHeight: '2',
          color: '#fff',
          textAlign: 'right',
          marginBottom: '0.75rem',
          direction: 'rtl',
        }}>
          {hadith.text}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: '#0f0a1a',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ color: '#c4b5d4', fontSize: '0.9rem', lineHeight: '1.8', textAlign: 'left', direction: 'ltr' }}>
                  {hadith.englishHadith || hadith.en}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: gradeInfo.color,
            background: gradeInfo.bg,
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
          }}>
            {gradeInfo.label}
          </span>
          <span style={{ color: '#7a6f96', fontSize: '0.7rem' }}>
            {isExpanded ? 'اضغط للإخفاء' : 'اضغط للتفاصيل'}
          </span>
        </div>
      </motion.div>
    );
  };

  const renderSkeleton = () => (
    <div style={{ space: '1rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: '#151030',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="animate-pulse" style={{ height: '1.25rem', width: '5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '999px' }} />
            <div className="animate-pulse" style={{ height: '1.25rem', width: '3rem', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', marginLeft: 'auto' }} />
          </div>
          <div className="animate-pulse" style={{ height: '4rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', marginBottom: '0.75rem' }} />
          <div className="animate-pulse" style={{ height: '1rem', width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: '999px' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-wrap pb-24">
      <style>{`
        .hadith-search-input {
          width: 100%;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: 1rem;
          padding: 1rem 1.25rem 1rem 3.5rem;
          color: var(--text-primary);
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Cairo', sans-serif;
        }
        .hadith-search-input::placeholder { color: var(--text-muted); }
        .hadith-search-input:focus { border-color: var(--accent-green); }
        .hadith-collection-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.25rem 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .hadith-collection-scroll::-webkit-scrollbar { display: none; }
        .hadith-collection-pill {
          flex-shrink: 0;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          font-family: 'Cairo', sans-serif;
        }
        .hadith-collection-pill.active {
          background: var(--accent-green);
          color: var(--text-primary);
          border-color: var(--accent-green);
        }
        .hadith-collection-pill:not(.active):hover {
          border-color: var(--border-color);
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
        .hadith-random-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.1);
          color: var(--accent-purple);
          font-family: 'Cairo', sans-serif;
        }
        .hadith-random-btn:hover { background: rgba(139,92,246,0.2); }
        .hadith-random-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1a1030 0%, #2d1b69 40%, #1e1545 70%, #0f0a1a 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="hadithGlow" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#00c896" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#00c896" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="200" cy="60" r="100" fill="url(#hadithGlow)"/>
            </svg>
          </div>
          <svg viewBox="0 0 400 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,60 L0,50 L20,50 L25,35 L30,50 L45,50 L50,25 L55,50 L70,50 L75,40 L80,50 L120,50 L130,20 L140,50 L180,50 L185,42 L190,50 L220,50 L225,30 L230,50 L260,50 L270,22 L280,50 L310,50 L315,38 L320,50 L350,50 L360,15 L370,50 L400,50 L400,60 Z" fill="#0f0a1a" opacity="0.6"/>
          </svg>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00c896]/15 flex items-center justify-center">
              <BookIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">البحث في الأحاديث</h1>
              <p className="text-white/50 text-xs mt-0.5">أحاديث نبوية شريفة من الكتب الستة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 -mt-4 relative z-20 space-y-4">
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#7a6f96', pointerEvents: 'none' }}>
            <SearchIcon />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="hadith-search-input"
            placeholder="ابحث عن حديث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Collection filter */}
        <div className="hadith-collection-scroll">
          {COLLECTIONS.map(c => (
            <button
              key={c.id}
              className={`hadith-collection-pill ${selectedCollection === c.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCollection(c.id);
                if (searched) handleSearch(search, c.id);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search & Random buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSearch()}
            disabled={loading || !search.trim()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading || !search.trim() ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #00c896, #00a87d)',
              color: '#fff',
              border: 'none',
              opacity: loading || !search.trim() ? 0.5 : 1,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {loading ? <LoaderIcon /> : <SearchIcon />}
            <span>بحث</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRandom}
            disabled={randomLoading}
            className="hadith-random-btn"
            style={{ flex: '0 0 auto', width: 'auto', padding: '0.875rem 1.25rem' }}
          >
            {randomLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : <DiceIcon />}
            <span>عشوائي</span>
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#ef4444',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && renderSkeleton()}

        {/* Results count */}
        {!loading && searched && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: '#7a6f96', fontSize: '0.8rem', textAlign: 'center' }}
          >
            عُثر على {toArabicNumber(totalResults)} نتيجة
          </motion.div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((hadith, i) => renderHadithCard(hadith, i))}
          </div>
        )}

        {/* Empty state after search */}
        {!loading && searched && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <BookOpenIcon />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              لم يتم العثور على نتائج
            </h3>
            <p style={{ color: '#7a6f96', fontSize: '0.85rem' }}>
              جرّب كلمات مختلفة أو غيّر المجموعة
            </p>
          </motion.div>
        )}

        {/* Featured hadiths */}
        {!searched && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <StarIcon filled />
              <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>أحاديث مميزة</h2>
            </div>
            {featuredLoading ? (
              renderSkeleton()
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {featuredHadiths.map((hadith, i) => renderHadithCard(hadith, i))}
              </div>
            )}
          </div>
        )}

        {/* Initial state */}
        {!searched && !featuredLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              textAlign: 'center',
              padding: '1.5rem 1rem 0',
            }}
          >
            <p style={{ color: '#7a6f96', fontSize: '0.8rem', lineHeight: '1.6' }}>
              ابحث في كتب الحديث الستة: البخاري، مسلم، أبي داود، الترمذي، النسائي، وابن ماجه
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
