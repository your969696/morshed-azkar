// src/pages/PuzzlePage.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  { id: 'img-1', src: './puzzle-images/img-1.jpg', label: 'مسجد' },
  { id: 'img-2', src: './puzzle-images/img-2.jpg', label: 'جبال' },
  { id: 'img-3', src: './puzzle-images/img-3.jpg', label: 'طبيعة' },
  { id: 'img-4', src: './puzzle-images/img-4.jpg', label: 'بحر' },
  { id: 'img-5', src: './puzzle-images/img-5.jpg', label: 'شروق' },
  { id: 'img-6', src: './puzzle-images/img-6.jpg', label: 'صحراء' },
  { id: 'img-7', src: './puzzle-images/img-7.jpg', label: 'مدينة' },
  { id: 'img-8', src: './puzzle-images/img-8.jpg', label: 'غابة' },
  { id: 'img-9', src: './puzzle-images/img-9.jpg', label: 'زهور' },
  { id: 'img-10', src: './puzzle-images/img-10.jpg', label: 'ليل' },
  { id: 'img-11', src: './puzzle-images/img-11.jpg', label: 'قبة' },
  { id: 'img-12', src: './puzzle-images/img-12.jpg', label: 'ورد' },
  { id: 'img-13', src: './puzzle-images/img-13.jpg', label: 'وادٍ' },
  { id: 'img-14', src: './puzzle-images/img-14.jpg', label: 'شاطئ' },
  { id: 'img-15', src: './puzzle-images/img-15.jpg', label: 'ناطحات' },
  { id: 'img-16', src: './puzzle-images/img-16.jpg', label: 'بستان' },
  { id: 'img-17', src: './puzzle-images/img-17.jpg', label: 'أزهار' },
  { id: 'img-18', src: './puzzle-images/img-18.jpg', label: 'قمة' },
  { id: 'img-19', src: './puzzle-images/img-19.jpg', label: 'مئذنة' },
  { id: 'img-20', src: './puzzle-images/img-20.jpg', label: 'ليلاً' },
  { id: 'img-21', src: './puzzle-images/img-21.jpg', label: 'حديقة' },
  { id: 'img-22', src: './puzzle-images/img-22.jpg', label: 'غروب' },
  { id: 'img-23', src: './puzzle-images/img-23.jpg', label: 'رمال' },
  { id: 'img-24', src: './puzzle-images/img-24.jpg', label: 'جامع' },
  { id: 'img-25', src: './puzzle-images/img-25.jpg', label: 'محيط' },
  { id: 'img-26', src: './puzzle-images/img-26.jpg', label: 'مسجد داخلي' },
  { id: 'img-27', src: './puzzle-images/img-27.jpg', label: 'عمارة إسلامية' },
  { id: 'img-28', src: './puzzle-images/img-28.jpg', label: 'مسجد ليلي' },
  { id: 'img-29', src: './puzzle-images/img-29.jpg', label: 'جامع كبير' },
  { id: 'img-30', src: './puzzle-images/img-30.jpg', label: 'قبة مسجد' },
  { id: 'img-31', src: './puzzle-images/img-31.jpg', label: 'الجامع الأزرق' },
  { id: 'img-32', src: './puzzle-images/img-32.jpg', label: 'مئذنة' },
  { id: 'img-33', src: './puzzle-images/img-33.jpg', label: 'قصر الحمراء' },
  { id: 'img-34', src: './puzzle-images/img-34.jpg', label: 'جبال' },
  { id: 'img-35', src: './puzzle-images/img-35.jpg', label: 'شروق جبلي' },
  { id: 'img-36', src: './puzzle-images/img-36.jpg', label: 'جبل ثلجي' },
  { id: 'img-37', src: './puzzle-images/img-37.jpg', label: 'بحيرة جبلية' },
  { id: 'img-38', src: './puzzle-images/img-38.jpg', label: 'صحراء' },
  { id: 'img-39', src: './puzzle-images/img-39.jpg', label: 'كثبان رملية' },
  { id: 'img-40', src: './puzzle-images/img-40.jpg', label: 'غروب بحري' },
  { id: 'img-41', src: './puzzle-images/img-41.jpg', label: 'أمواج بحرية' },
  { id: 'img-42', src: './puzzle-images/img-42.jpg', label: 'شلال' },
  { id: 'img-43', src: './puzzle-images/img-43.jpg', label: 'غابة خضراء' },
  { id: 'img-44', src: './puzzle-images/img-44.jpg', label: 'شاطئ استوائي' },
  { id: 'img-45', src: './puzzle-images/img-45.jpg', label: 'قمر هلال' },
  { id: 'img-46', src: './puzzle-images/img-46.jpg', label: 'مجرة درب التبانة' },
  { id: 'img-47', src: './puzzle-images/img-47.jpg', label: 'أزهار كرز' },
  { id: 'img-48', src: './puzzle-images/img-48.jpg', label: 'غابة خريفية' },
  { id: 'img-49', src: './puzzle-images/img-49.jpg', label: 'حقل لافندر' },
  { id: 'img-50', src: './puzzle-images/img-50.jpg', label: 'حدائق زهور' },
  { id: 'img-51', src: './puzzle-images/img-51.jpg', label: 'أرز مدرج' },
  { id: 'img-52', src: './puzzle-images/img-52.jpg', label: 'انعكاس بحيرة' },
  { id: 'img-53', src: './puzzle-images/img-53.jpg', label: 'وادي' },
  { id: 'img-54', src: './puzzle-images/img-54.jpg', label: 'شفق قطبي' },
  { id: 'img-55', src: './puzzle-images/img-55.jpg', label: 'صخور ساحلية' },
  { id: 'img-56', src: './puzzle-images/img-56.jpg', label: 'مسجد أبيض' },
  { id: 'img-57', src: './puzzle-images/img-57.jpg', label: 'نقوش إسلامية' },
  { id: 'img-58', src: './puzzle-images/img-58.jpg', label: 'صحراء ذهبية' },
  { id: 'img-59', src: './puzzle-images/img-59.jpg', label: 'غروب صحراوي' },
  { id: 'img-60', src: './puzzle-images/img-60.jpg', label: 'جبال وردية' },
  { id: 'img-61', src: './puzzle-images/img-61.jpg', label: 'بحيرة صافية' },
  { id: 'img-62', src: './puzzle-images/img-62.jpg', label: 'غابة ضبابية' },
  { id: 'img-63', src: './puzzle-images/img-63.jpg', label: 'شمس مشرقة' },
  { id: 'img-64', src: './puzzle-images/img-64.jpg', label: 'نهر هادئ' },
  { id: 'img-65', src: './puzzle-images/img-65.jpg', label: 'شاطئ صخري' },
  { id: 'img-66', src: './puzzle-images/img-66.jpg', label: 'قرية جبلية' },
  { id: 'img-67', src: './puzzle-images/img-67.jpg', label: 'أقحوان' },
  { id: 'img-68', src: './puzzle-images/img-68.jpg', label: 'سماء صافية' },
  { id: 'img-69', src: './puzzle-images/img-69.jpg', label: 'بركان' },
  { id: 'img-70', src: './puzzle-images/img-70.jpg', label: 'جسر طبيعي' },
  { id: 'img-71', src: './puzzle-images/img-71.jpg', label: 'واحة' },
  { id: 'img-72', src: './puzzle-images/img-72.jpg', label: 'غابة أوركيد' },
  { id: 'img-73', src: './puzzle-images/img-73.jpg', label: 'أمواج' },
  { id: 'img-74', src: './puzzle-images/img-74.jpg', label: 'زهرة برتقالية' },
  { id: 'img-75', src: './puzzle-images/img-75.jpg', label: 'تلال خضراء' },
  { id: 'img-76', src: './puzzle-images/img-76.jpg', label: 'صخور متحجرة' },
  { id: 'img-77', src: './puzzle-images/img-77.jpg', label: 'شلال صغير' },
  { id: 'img-78', src: './puzzle-images/img-78.jpg', label: 'غروب بنفسجي' },
  { id: 'img-79', src: './puzzle-images/img-79.jpg', label: 'حديقة يابانية' },
  { id: 'img-80', src: './puzzle-images/img-80.jpg', label: 'نجم لامع' },
  { id: 'img-81', src: './puzzle-images/img-81.jpg', label: 'بحيرة وردية' },
  { id: 'img-82', src: './puzzle-images/img-82.jpg', label: 'جبال زرقاء' },
  { id: 'img-83', src: './puzzle-images/img-83.jpg', label: 'صحراء بيضاء' },
  { id: 'img-84', src: './puzzle-images/img-84.jpg', label: 'محيط أزرق' },
  { id: 'img-85', src: './puzzle-images/img-85.jpg', label: 'غابة بينيس' },
  { id: 'img-86', src: './puzzle-images/img-86.jpg', label: 'زهرة حمراء' },
  { id: 'img-87', src: './puzzle-images/img-87.jpg', label: 'قمر كامل' },
  { id: 'img-88', src: './puzzle-images/img-88.jpg', label: 'جبال مغبقة' },
  { id: 'img-89', src: './puzzle-images/img-89.jpg', label: 'صخور بحرية' },
  { id: 'img-90', src: './puzzle-images/img-90.jpg', label: 'حقل أصفر' },
  { id: 'img-91', src: './puzzle-images/img-91.jpg', label: 'شمس الغروب' },
  { id: 'img-92', src: './puzzle-images/img-92.jpg', label: 'نهر جبلي' },
  { id: 'img-93', src: './puzzle-images/img-93.jpg', label: 'بحيرة ساحرة' },
  { id: 'img-94', src: './puzzle-images/img-94.jpg', label: 'غابة معشقة' },
  { id: 'img-95', src: './puzzle-images/img-95.jpg', label: 'زهرة بنفسجية' },
  { id: 'img-96', src: './puzzle-images/img-96.jpg', label: 'جبال مشمسة' },
  { id: 'img-97', src: './puzzle-images/img-97.jpg', label: 'صحراء مغربية' },
  { id: 'img-98', src: './puzzle-images/img-98.jpg', label: 'شاطئ رملي' },
  { id: 'img-99', src: './puzzle-images/img-99.jpg', label: 'غابة مطيرة' },
  { id: 'img-100', src: './puzzle-images/img-100.jpg', label: 'سماء صافية' },
];

const LEVELS = [
  { id: 'easy', grid: 2, label: 'سهل', color: '#00c896', pieces: 4 },
  { id: 'medium', grid: 3, label: 'متوسط', color: '#f0b040', pieces: 9 },
  { id: 'hard', grid: 4, label: 'صعب', color: '#ef4444', pieces: 16 },
];

function toArabicNum(n) { return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitImage(img, grid) {
  const pieces = [];
  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const cell = size / grid;
  const canvas = document.createElement('canvas');
  canvas.width = cell; canvas.height = cell;
  const ctx = canvas.getContext('2d');
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      ctx.clearRect(0, 0, cell, cell);
      ctx.drawImage(img, c * cell, r * cell, cell, cell, 0, 0, cell, cell);
      pieces.push({ id: r * grid + c, dataUrl: canvas.toDataURL('image/jpeg', 0.75) });
    }
  }
  return pieces;
}

function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

function getStarRating(moves, grid) {
  const optimal = grid * grid;
  if (moves <= optimal * 1.5) return 3;
  if (moves <= optimal * 3) return 2;
  return 1;
}

function loadJSON(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const btnBase = { borderRadius: 12, cursor: 'pointer', fontFamily: '"Cairo", sans-serif', border: 'none', fontWeight: 700, transition: 'all 0.15s' };

export default function PuzzlePage() {
  const [phase, setPhase] = useState('select');
  const [selImg, setSelImg] = useState(null);
  const [selLevel, setSelLevel] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [hintCount, setHintCount] = useState(3);
  const timerRef = useRef(null);

  const [saves, setSaves] = useState(() => loadJSON('pz_saves', []));
  const [stats, setStats] = useState(() => loadJSON('pz_stats', { totalGames: 0, totalMoves: 0, totalTime: 0, bestTimes: {} }));
  const [bestTimes, setBestTimes] = useState(() => loadJSON('pz_best', {}));

  const imgIdxRef = useRef(null);
  const levelRef = useRef(null);
  const movesRef = useRef(0);
  const timeRef = useRef(0);
  const wonHandledRef = useRef(false);

  const boardSize = Math.min(400, window.innerWidth - 40);
  const grid = selLevel?.grid || 3;

  useEffect(() => { movesRef.current = moves; }, [moves]);
  useEffect(() => { timeRef.current = time; }, [time]);

  useEffect(() => {
    if (phase === 'playing' && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, won]);

  useEffect(() => { saveJSON('pz_saves', saves); }, [saves]);
  useEffect(() => { saveJSON('pz_stats', stats); }, [stats]);
  useEffect(() => { saveJSON('pz_best', bestTimes); }, [bestTimes]);

  const checkWin = useCallback((arr) => arr.every((p, i) => p && p.id === i), []);

  useEffect(() => {
    if (phase === 'playing' && pieces.length > 0 && !wonHandledRef.current && checkWin(pieces)) {
      wonHandledRef.current = true;
      const currentImgIdx = imgIdxRef.current;
      const currentLevel = levelRef.current;
      const currentTime = timeRef.current;
      const currentMoves = movesRef.current;
      setTimeout(() => {
        setWon(true);
        setPhase('won');
        if (currentImgIdx !== null && currentLevel) {
          const key = `${IMAGES[currentImgIdx].id}_${currentLevel.grid}`;
          setStats(prev => ({
            totalGames: prev.totalGames + 1,
            totalMoves: prev.totalMoves + currentMoves,
            totalTime: prev.totalTime + currentTime,
            bestTimes: { ...prev.bestTimes, [key]: Math.min(prev.bestTimes[key] || Infinity, currentTime) },
          }));
        }
      }, 300);
    }
  }, [pieces, phase, checkWin]);

  const startGame = useCallback(async (imgIdx, level, savedOrder = null, savedMoves = 0, savedTime = 0) => {
    imgIdxRef.current = imgIdx;
    levelRef.current = level;
    setSelImg(imgIdx);
    setSelLevel(level);
    setPhase('loading');
    setHintCount(3);
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const p = splitImage(img, level.grid);
          let final;
          if (savedOrder) {
            final = savedOrder.map(id => p.find(pc => pc.id === id)).filter(Boolean);
            if (final.length !== p.length) {
              final = shuffleArray(p);
            }
          } else {
            final = shuffleArray(p);
            let attempts = 0;
            while (checkWin(final) && attempts < 50) {
              final = shuffleArray(p);
              attempts++;
            }
          }
          setPieces(final);
          setMoves(savedMoves);
          movesRef.current = savedMoves;
          setTime(savedTime);
          timeRef.current = savedTime;
          setWon(false);
          wonHandledRef.current = false;
          setDragIdx(null);
          setPhase('playing');
        } catch { setPhase('select'); }
      };
      img.onerror = () => { setPhase('select'); };
      img.src = IMAGES[imgIdx].src;
    } catch { setPhase('select'); }
  }, []);

  const handleSwap = useCallback((idx) => {
    if (won || phase !== 'playing') return;
    if (dragIdx === null) {
      setDragIdx(idx);
    } else {
      const prevDragIdx = dragIdx;
      setDragIdx(null);
      setPieces(prev => {
        const next = [...prev];
        [next[prevDragIdx], next[idx]] = [next[idx], next[prevDragIdx]];
        const newMoves = movesRef.current + 1;
        movesRef.current = newMoves;
        setMoves(newMoves);
        return next;
      });
    }
  }, [dragIdx, won, phase]);

  const useHint = () => {
    if (hintCount <= 0 || won) return;
    setHintActive(true);
    setHintCount(h => h - 1);
    setTimeout(() => setHintActive(false), 1500);
  };

  const saveCurrentGame = (name) => {
    const save = {
      id: Date.now(),
      name: name || `لعبة ${toArabicNum(saves.length + 1)}`,
      imageIdx: imgIdxRef.current ?? 0,
      levelId: levelRef.current?.id || 'medium',
      grid: levelRef.current?.grid || 3,
      piecesOrder: pieces.map(p => p.id),
      moves, time,
      date: new Date().toLocaleDateString('ar'),
    };
    setSaves(prev => [save, ...prev].slice(0, 10));
    setShowSaveDialog(false);
    setSaveName('');
  };

  const loadSave = (save) => {
    const level = LEVELS.find(l => l.id === save.levelId);
    if (!level) return;
    startGame(save.imageIdx, level, save.piecesOrder, save.moves, save.time);
  };

  const deleteSave = (id) => {
    setSaves(prev => prev.filter(s => s.id !== id));
  };

  const resetGame = () => {
    imgIdxRef.current = null;
    levelRef.current = null;
    setPhase('select');
    setSelImg(null);
    setSelLevel(null);
    setPieces([]);
    setMoves(0);
    setTime(0);
    setWon(false);
    wonHandledRef.current = false;
    setDragIdx(null);
  };

  if (phase === 'select') {
    return (
      <div className="page-wrap pb-24 px-4 pt-4" style={{ background: '#0c0818', minHeight: '100%' }}>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.15)', fontSize: 26 }}>🧩</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, fontFamily: '"Cairo", sans-serif' }}>أحجية الصور</h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                {toArabicNum(stats.totalGames)} لعبة
              </p>
            </div>
          </div>
          {stats.totalGames > 0 && (
            <span style={{ fontSize: 15, padding: '6px 14px', borderRadius: 10, fontWeight: 600, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)' }}>
              🏆 {toArabicNum(stats.totalGames)} فوز
            </span>
          )}
        </div>

        {saves.length > 0 && (
          <div className="mb-4">
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>💾 الألعاب المحفوظة</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {saves.map(save => {
                const img = IMAGES[save.imageIdx];
                const level = LEVELS.find(l => l.id === save.levelId);
                return (
                  <div key={save.id} style={{ borderRadius: 14, background: '#151030', border: '1px solid rgba(255,255,255,0.04)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <img src={img?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 18, color: '#fff', fontWeight: 700, fontFamily: '"Cairo", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{save.name}</p>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: '4px 0 0' }}>{level?.grid}×{level?.grid} · {toArabicNum(save.moves)} خطوة · {fmtTime(save.time)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => loadSave(save)} style={{ ...btnBase, padding: '10px 18px', fontSize: 16, background: 'linear-gradient(135deg, #00c896, #00a87d)', color: '#fff' }}>استكمال</button>
                        <button onClick={() => deleteSave(save.id)} style={{ ...btnBase, padding: '10px 14px', fontSize: 16, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>✕</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>🖼 اختر صورة</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {IMAGES.map((img, i) => {
              const active = selImg === i;
              return (
                <motion.button key={img.id} whileTap={{ scale: 0.92 }}
                  onClick={() => setSelImg(i)}
                  style={{
                    ...btnBase, padding: 0, overflow: 'hidden',
                    border: `2.5px solid ${active ? '#00c896' : 'rgba(255,255,255,0.04)'}`,
                    boxShadow: active ? '0 0 12px rgba(0,200,150,0.3)' : 'none',
                  }}>
                  <img src={img.src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {stats.totalGames > 0 && (
          <div style={{ borderRadius: 14, background: '#151030', border: '1px solid rgba(255,255,255,0.04)', padding: '14px 16px', marginBottom: 8 }}>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 10, fontFamily: '"Cairo", sans-serif' }}>📊 إحصائياتك</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'الألعاب', value: toArabicNum(stats.totalGames), color: '#8b5cf6' },
                { label: 'الخطوات', value: toArabicNum(stats.totalMoves), color: '#f0b040' },
                { label: 'الوقت الكلي', value: fmtTime(stats.totalTime), color: '#00c896' },
              ].map((st, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.01)' }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: 0 }}>{st.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: st.color, lineHeight: '28px', margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' }}>{st.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {selImg !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
              onClick={() => setSelImg(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 380, borderRadius: 18, background: '#151030', border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <img src={IMAGES[selImg]?.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: '"Cairo", sans-serif', margin: 0 }}>{IMAGES[selImg]?.label}</p>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>اختر مستوى الصعوبة</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {LEVELS.map(level => (
                    <button key={level.id} onClick={() => startGame(selImg, level)}
                      style={{
                        ...btnBase, flex: 1, padding: '16px 8px', textAlign: 'center',
                        background: `${level.color}10`, border: `2px solid ${level.color}30`,
                      }}>
                      <p style={{ fontSize: 26, fontWeight: 800, color: level.color, lineHeight: '30px', margin: 0 }}>{level.grid}×{level.grid}</p>
                      <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: '"Cairo", sans-serif', margin: '6px 0 0' }}>{level.label}</p>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.15)', margin: '4px 0 0' }}>{toArabicNum(level.pieces)} قطعة</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelImg(null)}
                  style={{ ...btnBase, width: '100%', marginTop: 12, padding: '12px', fontSize: 17, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  إلغاء
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0818' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', fontSize: 48, marginBottom: 16 }}>🧩</motion.div>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', fontFamily: '"Cairo", sans-serif' }}>جاري تجهيز الصورة...</p>
        </div>
      </div>
    );
  }

  const stars = won ? getStarRating(moves, grid) : 0;
  const currentImgIdx = imgIdxRef.current ?? selImg;
  const levelKey = currentImgIdx !== null ? `${IMAGES[currentImgIdx]?.id}_${grid}` : '';
  const bestTime = bestTimes[levelKey];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#0c0818' }}>

      <header className="relative flex-shrink-0 z-10" style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="relative h-full flex items-center justify-between px-4">
          <button onClick={resetGame} style={{ ...btnBase, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 17 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            رجوع
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: '"Cairo", sans-serif', margin: 0 }}>{currentImgIdx !== null ? IMAGES[currentImgIdx]?.label : ''}</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.2)', margin: '2px 0 0' }}>{grid}×{grid} · {toArabicNum(grid * grid)} قطعة</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 17, color: '#f0b040', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>⏱ {fmtTime(time)}</span>
            <span style={{ fontSize: 17, color: '#8b5cf6', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>🔢 {toArabicNum(moves)}</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-shrink-0" style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <button onClick={() => setShowPreview(!showPreview)}
          style={{ ...btnBase, padding: '10px 18px', fontSize: 16, background: showPreview ? 'rgba(240,176,64,0.12)' : 'rgba(255,255,255,0.04)', color: showPreview ? '#f0b040' : 'rgba(255,255,255,0.4)', border: `1px solid ${showPreview ? 'rgba(240,176,64,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
          👁 معاينة
        </button>
        <button onClick={useHint} disabled={hintCount <= 0}
          style={{ ...btnBase, padding: '10px 18px', fontSize: 16, background: 'rgba(139,92,246,0.08)', color: hintCount > 0 ? '#a78bfa' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(139,92,246,0.12)', opacity: hintCount > 0 ? 1 : 0.4 }}>
          💡 تلميح ({toArabicNum(hintCount)})
        </button>
        <button onClick={() => setShowSaveDialog(true)}
          style={{ ...btnBase, padding: '10px 18px', fontSize: 16, background: 'rgba(0,200,150,0.08)', color: '#00c896', border: '1px solid rgba(0,200,150,0.12)' }}>
          💾 حفظ
        </button>
        <button onClick={() => { setPieces(prev => shuffleArray(prev)); setDragIdx(null); }}
          style={{ ...btnBase, padding: '10px 18px', fontSize: 16, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
          🔀 خلط
        </button>
        <div style={{ flex: 1 }} />
        {bestTime && (
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontFamily: '"Cairo", sans-serif' }}>
            🏆 أفضل: {fmtTime(bestTime)}
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 18px' }}>

        <AnimatePresence>
          {showPreview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,16,0.88)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowPreview(false)}>
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <img src={currentImgIdx !== null ? IMAGES[currentImgIdx]?.src : ''} alt="" style={{ width: boardSize, height: boardSize, objectFit: 'cover', borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)' }} />
                <p style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 10, fontFamily: '"Cairo", sans-serif' }}>اضغط في أي مكان للإغلاق</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${grid}, 1fr)`, gap: 5,
          width: boardSize, height: boardSize, padding: 5, borderRadius: 16,
          background: '#151030', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {pieces.map((piece, idx) => {
            const isSelected = dragIdx === idx;
            const isCorrect = piece.id === idx;
            return (
              <motion.div key={`${piece.id}-${idx}`}
                layout layoutId={`pc-${piece.id}`}
                onClick={() => handleSwap(idx)}
                whileTap={{ scale: 0.95 }}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'grab', position: 'relative',
                  border: `2px solid ${isSelected ? '#00c896' : hintActive && isCorrect ? 'rgba(240,176,64,0.4)' : 'transparent'}`,
                  boxShadow: isSelected ? '0 0 14px rgba(0,200,150,0.3)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}>
                <img src={piece.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} draggable={false} />
                {hintActive && isCorrect && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,176,64,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24 }}>✓</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)', marginTop: 12, fontFamily: '"Cairo", sans-serif' }}>
          اضغط على قطعتين لتبديل أماكنهما
        </p>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowSaveDialog(false)}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 360, borderRadius: 18, background: '#151030', border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 14, fontFamily: '"Cairo", sans-serif' }}>💾 حفظ اللعبة</p>
              <label style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', fontWeight: 600, display: 'block', marginBottom: 6, fontFamily: '"Cairo", sans-serif' }}>اسم الحفظ</label>
              <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
                placeholder="مثال: لعبة الصباح"
                maxLength={30}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 18, fontWeight: 600, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)', outline: 'none', direction: 'rtl', fontFamily: '"Cairo", sans-serif', boxSizing: 'border-box' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={() => saveCurrentGame(saveName)}
                  style={{ ...btnBase, flex: 1, padding: '14px', fontSize: 18, background: 'linear-gradient(135deg, #00c896, #00a87d)', color: '#fff' }}>
                  حفظ
                </button>
                <button onClick={() => setShowSaveDialog(false)}
                  style={{ ...btnBase, flex: 1, padding: '14px', fontSize: 18, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
              style={{ width: '100%', maxWidth: 380, borderRadius: 20, background: '#151030', border: '1px solid rgba(255,255,255,0.06)', padding: 28, textAlign: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
                <span style={{ fontSize: 56, display: 'block', marginBottom: 10 }}>🎉</span>
              </motion.div>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#00c896', marginBottom: 6, fontFamily: '"Cairo", sans-serif' }}>أحسنت!</p>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontFamily: '"Cairo", sans-serif' }}>لقد أكملت الأحجية بنجاح</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3].map(i => (
                  <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
                    style={{ fontSize: 32, opacity: i <= stars ? 1 : 0.15 }}>⭐</motion.span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#f0b040', lineHeight: '28px', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(time)}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: '4px 0 0' }}>الوقت</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6', lineHeight: '28px', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{toArabicNum(moves)}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: '4px 0 0' }}>خطوة</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#00c896', lineHeight: '28px', margin: 0 }}>{grid}×{grid}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: '4px 0 0' }}>الشبكة</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => startGame(currentImgIdx ?? 0, levelRef.current)}
                  style={{ ...btnBase, flex: 1, padding: '14px', fontSize: 18, background: 'linear-gradient(135deg, #00c896, #00a87d)', color: '#fff', boxShadow: '0 2px 12px rgba(0,200,150,0.2)' }}>
                  🔄 مرة أخرى
                </button>
                <button onClick={resetGame}
                  style={{ ...btnBase, flex: 1, padding: '14px', fontSize: 18, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  🖼 صورة جديدة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
