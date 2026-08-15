import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const RADIO_API = 'https://mp3quran.net/api/v3/radios?language=ar';
const FM_MARKS = [88,90,92,94,96,98,100,102,104,106,108];

const FALLBACK_STATIONS = [
  { id: 1, name: 'إذاعة القرآن العامة', url: 'https://qurango.net/radio/mix' },
  { id: 2, name: 'إذاعة الشيخ عبدالرحمن السديس', url: 'https://qurango.net/radio/abdulrahman_alsudaes' },
  { id: 3, name: 'إذاعة الشيخ ماهر المعيقلي', url: 'https://qurango.net/radio/maher' },
  { id: 4, name: 'إذاعة الشيخ مشاري العفاسي', url: 'https://qurango.net/radio/mishary_alafasi' },
  { id: 5, name: 'إذاعة الشيخ عبدالباسط عبدالصمد', url: 'https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad' },
  { id: 6, name: 'إذاعة الشيخ سعد الغامدي', url: 'https://qurango.net/radio/saad_alghamdi' },
  { id: 7, name: 'إذاعة الشيخ أحمد العجمي', url: 'https://qurango.net/radio/ahmad_alajmy' },
  { id: 8, name: 'إذاعة الشيخ ياسر الدوسري', url: 'https://qurango.net/radio/yasser_aldosari' },
  { id: 9, name: 'إذاعة الشيخ محمود خليل الحصري', url: 'https://qurango.net/radio/mahmoud_khalil_alhussary' },
  { id: 10, name: 'إذاعة الشيخ محمد صديق المنشاوي', url: 'https://qurango.net/radio/mohammed_siddiq_alminshawi' },
];

export default function QuranRadio() {
  const { t } = useTranslation();
  const h = t.radioPage || {};
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [tunerVal, setTunerVal] = useState(88);
  const audioRef = useRef(null);
  const vizBarsRef = useRef([]);
  const vizIntervalRef = useRef(null);

  useEffect(() => {
    fetch(RADIO_API)
      .then(r => r.json())
      .then(data => {
        const list = (data.radios || []).map((r, i) => ({
          id: r.id,
          name: r.name,
          url: (r.url || '').replace('backup.qurango.net', 'qurango.net'),
          freq: +(88 + (i * 0.7)).toFixed(1),
          signal: Math.min(7, Math.floor(Math.random() * 3) + 5),
        }));
        if (list.length > 0) {
          setStations(list);
          setTunerVal(list[0].freq);
        } else {
          setStations(FALLBACK_STATIONS.map((s, i) => ({ ...s, freq: +(88 + i * 0.7).toFixed(1), signal: 6 })));
        }
        setLoading(false);
      })
      .catch(() => {
        setStations(FALLBACK_STATIONS.map((s, i) => ({ ...s, freq: +(88 + i * 0.7).toFixed(1), signal: 6 })));
        setLoading(false);
      });
  }, []);

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

  const playStation = useCallback((idx) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (currentIdx === idx && playing) {
      setPlaying(false);
      stopViz();
      return;
    }
    const st = stations[idx];
    if (!st || !st.url) { stopViz(); return; }

    const audio = new Audio();
    audio.type = 'audio/mpeg';
    audio.src = st.url;
    audio.volume = volume / 100;

    audio.oncanplay = () => {
      audio.play().catch(e => console.warn('Play error:', e.message));
    };
    audio.onplay = () => { startViz(); setPlaying(true); };
    audio.onerror = (e) => { console.warn('Audio error:', audio.error?.message); setPlaying(false); stopViz(); };

    audio.load();
    audioRef.current = audio;
    setCurrentIdx(idx);
    setPlaying(true);
    setTunerVal(st.freq);
  }, [currentIdx, playing, stations, volume, startViz, stopViz]);

  const stopStation = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    stopViz();
  }, [stopViz]);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopStation();
    } else {
      playStation(currentIdx >= 0 ? currentIdx : 0);
    }
  }, [playing, currentIdx, playStation, stopStation]);

  const nextStation = useCallback(() => {
    const next = (currentIdx + 1) % stations.length;
    playStation(next);
  }, [currentIdx, stations.length, playStation]);

  const prevStation = useCallback(() => {
    const prev = (currentIdx - 1 + stations.length) % stations.length;
    playStation(prev);
  }, [currentIdx, stations.length, playStation]);

  const handleVolume = useCallback((e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  const handleTuner = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setTunerVal(val);
    const nearest = stations.reduce((a, b) => Math.abs(b.freq - val) < Math.abs(a.freq - val) ? b : a);
    const nearIdx = stations.indexOf(nearest);
    if (Math.abs(nearest.freq - val) < 0.5 && nearIdx !== currentIdx) {
      playStation(nearIdx);
    }
  }, [stations, currentIdx, playStation]);

  const tunerPct = ((tunerVal - 88) / (108 - 88)) * 100;

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current);
    };
  }, []);

  const filtered = search ? stations.filter(s => s.name.includes(search)) : stations;
  const st = currentIdx >= 0 ? stations[currentIdx] : null;
  const sigLevel = st ? st.signal : 5;

  return (
    <div className="page-wrap pb-24 px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📻</span>
          <h1 className="text-2xl font-bold text-text-primary">{h.title || 'إذاعة القرآن الكريم'}</h1>
        </div>
        <p className="text-text-secondary text-sm">{h.subtitle || 'استمع إلى القرآن من أفضل القراء'}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
          borderRadius: '20px', padding: '24px', maxWidth: '380px',
          margin: '0 auto 16px', color: '#fff',
        }}
      >
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(0,200,150,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="inline-flex items-center gap-1.5 mb-2.5" style={{
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: '#f87171',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'livepulse 1.5s infinite' }} />
          ON AIR
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.4)', borderRadius: '14px', padding: '16px',
          marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#00c896', letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>
                {st ? st.freq.toFixed(1) : '88.0'}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>MHz FM</div>
            </div>
            <div>
              <div className="flex gap-1.5 mb-2">
                <button style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid #00c896', background: 'rgba(0,200,150,0.15)',
                  color: '#00c896', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                }}>FM</button>
                <button style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                  color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                }}>AM</button>
              </div>
              <div className="flex items-end gap-0.5 h-5">
                {[6,9,12,15,18,14,10].map((sh, i) => (
                  <div key={i} style={{
                    width: '4px', borderRadius: '2px', height: sh + 'px',
                    background: i < sigLevel ? '#00c896' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
            {st ? st.name : '— اختر محطة —'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            {st ? 'بث مباشر • القرآن الكريم' : 'اضغط على محطة للتشغيل'}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="flex justify-between" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', padding: '0 2px' }}>
            {FM_MARKS.map(m => <span key={m}>{m}</span>)}
          </div>
          <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', margin: '14px 0 8px', cursor: 'pointer' }}>
            <div style={{ height: '100%', width: tunerPct + '%', background: 'linear-gradient(90deg, #00c896, #3b82f6)', borderRadius: '6px', transition: 'width 0.1s' }} />
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)',
              width: '18px', height: '18px', background: '#fff', borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)', cursor: 'grab',
              left: tunerPct + '%', transition: 'left 0.1s',
            }} />
            <input
              type="range" min="88" max="108" step="0.1" value={tunerVal}
              onChange={handleTuner}
              style={{ width: '100%', height: '6px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', margin: 0 }}
            />
          </div>
        </div>

        <div className="flex items-end justify-center" style={{ gap: '3px', height: '48px', marginBottom: '20px', padding: '0 8px' }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} ref={el => vizBarsRef.current[i] = el}
              style={{
                width: '6px', borderRadius: '3px 3px 0 0', minHeight: '3px',
                background: 'linear-gradient(to top, #00c896, #3b82f6)',
                transition: 'height 0.1s ease',
              }} />
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <button onClick={prevStation} title="المحطة السابقة"
            style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={() => { if (st) setTunerVal(Math.max(88, tunerVal - 0.1)); }} title="تردد أقل"
            style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button onClick={togglePlay}
            style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: playing ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00c896, #059669)',
              border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: playing ? '0 4px 20px rgba(239,68,68,0.35)' : '0 4px 20px rgba(0,200,150,0.35)',
              transition: 'all 0.2s',
            }}>
            {playing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={() => { if (st) setTunerVal(Math.min(108, tunerVal + 0.1)); }} title="تردد أعلى"
            style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          <button onClick={nextStation} title="المحطة التالية"
            style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6v12z"/></svg>
          </button>
        </div>

        <div className="flex items-center" style={{ gap: '10px', marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ width: '20px', textAlign: 'center' }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', position: 'relative', cursor: 'pointer' }}>
            <div style={{ height: '100%', width: volume + '%', background: '#00c896', borderRadius: '4px', transition: 'width 0.1s' }} />
            <input type="range" min="0" max="100" value={volume} onChange={handleVolume}
              style={{ width: '100%', height: '4px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', margin: 0 }} />
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ width: '20px', textAlign: 'center' }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>

        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px', fontWeight: 600 }}>
          {h.stations || 'المحطات المفضلة'}
        </div>
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {filtered.map((s, i) => {
            const isActive = currentIdx === i;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                onClick={() => playStation(i)}
                className="flex items-center cursor-pointer"
                style={{
                  gap: '10px', padding: '10px 12px',
                  background: isActive ? 'rgba(0,200,150,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(0,200,150,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px', transition: 'all 0.2s',
                }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: '#00c896',
                  background: 'rgba(0,200,150,0.1)', padding: '3px 8px', borderRadius: '6px',
                  minWidth: '52px', textAlign: 'center',
                }}>
                  {s.freq.toFixed(1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{s.name}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>بث مباشر</div>
                </div>
                {isActive && playing && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#ef4444', flexShrink: 0,
                    animation: 'livepulse 1.5s infinite',
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#00c896] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-xs">{h.loading || 'جاري التحميل...'}</p>
        </div>
      )}

      <style>{`
        @keyframes livepulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
