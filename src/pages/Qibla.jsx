// src/pages/Qibla.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════ Constants ═══════════════ */
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const DIRECTIONS = [
  { deg: 0, short: 'شمال' },
  { deg: 45, short: 'شمال شرق' },
  { deg: 90, short: 'شرق' },
  { deg: 135, short: 'جنوب شرق' },
  { deg: 180, short: 'جنوب' },
  { deg: 225, short: 'جنوب غرب' },
  { deg: 270, short: 'غرب' },
  { deg: 315, short: 'شمال غرب' },
];

/* ═══════════════ Math ═══════════════ */
function calcQibla(lat, lng) {
  const toRad = d => (d * Math.PI) / 180;
  const dLng = toRad(KAABA_LNG - lng);
  const y = Math.sin(dLng);
  const x = Math.cos(toRad(lat)) * Math.tan(toRad(KAABA_LAT)) - Math.sin(toRad(lat)) * Math.cos(dLng);
  let q = Math.atan2(y, x) * (180 / Math.PI);
  return q < 0 ? q + 360 : q;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function formatDist(km) {
  if (km >= 1000) return `${(km / 1000).toFixed(1)} ألف كم`;
  return `${toArabicNum(Math.round(km))} كم`;
}

function getDirName(angle) {
  const norm = ((angle % 360) + 360) % 360;
  const idx = Math.round(norm / 45) % 8;
  return DIRECTIONS[idx].short;
}

/* ═══════════════ Sun Position ═══════════════ */
function calcSunPosition(lat, lng, date = new Date()) {
  const toRad = d => (d * Math.PI) / 180;
  const toDeg = r => (r * 180) / Math.PI;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const hour = date.getHours() + date.getMinutes() / 60;
  const declination = 23.45 * Math.sin(toRad(360 * (284 + dayOfYear) / 365));
  const solarNoon = 12 - lng / 15;
  const hourAngle = (hour - solarNoon) * 15;
  const latRad = toRad(lat);
  const decRad = toRad(declination);
  const haRad = toRad(hourAngle);
  const altitude = toDeg(Math.asin(Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)));
  const azimuth = toDeg(Math.atan2(-Math.sin(haRad), Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(haRad)));
  const normalizedAzimuth = ((azimuth + 180) % 360 + 360) % 360;
  return { altitude: Math.round(altitude * 10) / 10, azimuth: Math.round(normalizedAzimuth), isUp: altitude > 0 };
}

/* ═══════════════ SVG Compass ═══════════════ */
function CompassSVG({ size = 200, heading, qiblaAngle, sunAzimuth, sunAltitude }) {
  const cx = size / 2, cy = size / 2;
  const r = (size / 2) - 8;
  const qiblaRel = qiblaAngle !== null ? qiblaAngle - heading : 0;
  const isAligned = qiblaAngle !== null && Math.abs(((qiblaRel % 360) + 360) % 360) < 5;
  const isNear = qiblaAngle !== null && Math.abs(((qiblaRel % 360) + 360) % 360) < 15;
  const sunRel = sunAzimuth != null && sunAltitude > 0 ? sunAzimuth - heading : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.03)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </radialGradient>
        <linearGradient id="qg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="qgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2185b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.25" />
        </linearGradient>
        <filter id="qGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
          <stop offset="100%" stopColor="rgba(236,72,153,0.1)" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0b040" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f0b040" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="url(#cg)" stroke="url(#ringGrad)" strokeWidth={2} />

      {Array.from({ length: 72 }, (_, i) => {
        const deg = i * 5;
        const isMajor = deg % 30 === 0;
        const isCardinal = deg % 90 === 0;
        const rad = (deg - 90) * (Math.PI / 180);
        const r1 = r - (isMajor ? 14 : 8);
        const r2 = r - 2;
        return (
          <g key={deg}>
            <line x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)} x2={cx + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)}
              stroke={isCardinal ? 'rgba(255,255,255,0.35)' : isMajor ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
              strokeWidth={isCardinal ? 2 : isMajor ? 1.2 : 0.6} strokeLinecap="round" />
            {isMajor && deg % 90 !== 0 && (
              <text x={cx + (r - 22) * Math.cos(rad)} y={cy + (r - 22) * Math.sin(rad) + 3} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="8" fontWeight="600">{deg}</text>
            )}
          </g>
        );
      })}

      {[
        { deg: 0, ar: 'شمال' },
        { deg: 90, ar: 'شرق' },
        { deg: 180, ar: 'جنوب' },
        { deg: 270, ar: 'غرب' },
      ].map(d => {
        const rad = (d.deg - 90) * (Math.PI / 180);
        const dist = r - 32;
        return (
          <text key={d.deg} x={cx + dist * Math.cos(rad)} y={cy + dist * Math.sin(rad) + 3} textAnchor="middle"
            fill={d.deg === 0 ? '#ef4444' : 'rgba(255,255,255,0.3)'} fontSize="9" fontWeight="800">{d.ar}</text>
        );
      })}

      <circle cx={cx} cy={cy} r={r * 0.75} fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth={0.5} />

      {sunRel !== null && (
        <g transform={`rotate(${sunRel} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy - r * 0.55} r={16} fill="url(#sunGlow)" />
          <circle cx={cx} cy={cy - r * 0.55} r={8} fill="rgba(240,176,64,0.15)" stroke="#f0b040" strokeWidth={1} />
          <text x={cx} y={cy - r * 0.55 + 4} textAnchor="middle" fontSize="11" fill="#f0b040">☀</text>
        </g>
      )}

      {qiblaAngle !== null && (
        <g transform={`rotate(${qiblaRel} ${cx} ${cy})`}>
          <line x1={cx} y1={cy - r * 0.65} x2={cx} y2={cy - r * 0.15} stroke="url(#qgGlow)" strokeWidth={8} strokeLinecap="round" filter="url(#qGlow)" />
          <line x1={cx} y1={cy - r * 0.6} x2={cx} y2={cy - r * 0.12} stroke="url(#qg)" strokeWidth={2.5} strokeLinecap="round" />
          <polygon points={`${cx},${cy - r * 0.65} ${cx - 6},${cy - r * 0.52} ${cx + 6},${cy - r * 0.52}`} fill="url(#qg)" filter={isAligned ? 'url(#qGlow)' : undefined} />
          <circle cx={cx} cy={cy - r * 0.68} r={10} fill="rgba(0,0,0,0.5)" stroke="url(#qg)" strokeWidth={1.5} />
          <text x={cx} y={cy - r * 0.68 + 4} textAnchor="middle" fontSize="11" fill="#fff">🕋</text>
        </g>
      )}

      <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.2)" />

      {isNear && (
        <motion.circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke={isAligned ? '#00c896' : '#ec4899'} strokeWidth={1.5}
          initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.05, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }} />
      )}
    </svg>
  );
}

/* ═══════════════ Main Component ═══════════════ */
export default function Qibla() {
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [distance, setDistance] = useState(null);
  const [heading, setHeading] = useState(0);
  const [status, setStatus] = useState('locating');
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [smoothHeading, setSmoothHeading] = useState(0);
  const headingRef = useRef([]);
  const rafRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const searchTimeoutRef = useRef(null);
  const [sunPos, setSunPos] = useState(null);
  const [locationFound, setLocationFound] = useState(false);

  /* ── Geolocation ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع');
      setStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setQiblaAngle(calcQibla(latitude, longitude));
        setDistance(Math.round(haversine(latitude, longitude, KAABA_LAT, KAABA_LNG)));
        setCoords({ lat: latitude.toFixed(4), lng: longitude.toFixed(4) });
        setAccuracy(acc ? Math.round(acc) : null);
        setStatus('ready');
        setLocationFound(true);
        setSunPos(calcSunPosition(latitude, longitude));
      },
      () => {
        setStatus('need_search');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ── Update sun position ── */
  useEffect(() => {
    if (!coords) return;
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    setSunPos(calcSunPosition(lat, lng));
    const interval = setInterval(() => setSunPos(calcSunPosition(lat, lng)), 60000);
    return () => clearInterval(interval);
  }, [coords]);

  /* ── Compass orientation ── */
  useEffect(() => {
    const handleOrientation = (event) => {
      let alpha = event.webkitCompassHeading ?? event.alpha;
      if (alpha === null || alpha === undefined) return;
      headingRef.current.push(alpha);
      if (headingRef.current.length > 5) headingRef.current.shift();
    };
    const tick = () => {
      if (headingRef.current.length > 0) {
        const avg = headingRef.current.reduce((a, b) => a + b, 0) / headingRef.current.length;
        setSmoothHeading(avg);
        setHeading(avg);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    const initOrientation = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
            rafRef.current = requestAnimationFrame(tick);
          }
        } catch {}
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    initOrientation();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Search location (Nominatim) ── */
  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=ar`, {
        headers: { 'User-Agent': 'AzkarApp/1.0' }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchLocation(val), 400);
  };

  const selectLocation = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setQiblaAngle(calcQibla(lat, lng));
    setDistance(Math.round(haversine(lat, lng, KAABA_LAT, KAABA_LNG)));
    setCoords({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
    setAccuracy(null);
    setStatus('ready');
    setError(null);
    setLocationFound(true);
    setSunPos(calcSunPosition(lat, lng));
    setSearchQuery(item.display_name.split(',')[0]);
    setSearchResults([]);
  };

  /* ── Derived ── */
  const hasLocation = status === 'ready' && qiblaAngle !== null;
  const isAligned = qiblaAngle !== null && Math.abs(((qiblaAngle - smoothHeading) % 360 + 360) % 360) < 5;
  const isNear = qiblaAngle !== null && Math.abs(((qiblaAngle - smoothHeading) % 360 + 360) % 360) < 15;
  const dirName = qiblaAngle !== null ? getDirName(qiblaAngle) : '';

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="absolute inset-0" style={{ background: '#0c0818' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.04) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.025) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23fff' stroke-width='.3'/%3E%3C/svg%3E")`, backgroundSize: '60px' }} />
      <style>{`.qbs::-webkit-scrollbar{display:none}.qbs{scrollbar-width:none}`}</style>

      {/* ════════ HEADER ════════ */}
      <header className="relative flex-shrink-0 z-10" style={{ height: 60 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, #1c1040 0%, #0c0818 100%)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="absolute" style={{ top: -15, right: -10, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06), transparent 70%)', pointerEvents: 'none' }} />
        </div>
        <div className="relative h-full flex items-center justify-between px-4">
          <div className="flex items-center" style={{ gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(236,72,153,0.14), rgba(139,92,246,0.08))', border: '1px solid rgba(236,72,153,0.12)', fontSize: 16, flexShrink: 0, boxShadow: '0 2px 8px rgba(236,72,153,0.06)' }}>🧭</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: '18px', margin: 0, fontFamily: '"Cairo", sans-serif' }}>اتجاه القبلة</h1>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', margin: '2px 0 0', fontFamily: '"Cairo", sans-serif' }}>
                {hasLocation ? `${formatDist(distance)} إلى الكعبة` : status === 'locating' ? 'جاري تحديد الموقع...' : 'ابحث عن موقعك'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {accuracy !== null && (
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 5, fontWeight: 600, background: accuracy < 50 ? 'rgba(0,200,150,0.06)' : 'rgba(240,176,64,0.06)', color: accuracy < 50 ? '#00c896' : '#f0b040', border: `1px solid ${accuracy < 50 ? 'rgba(0,200,150,0.1)' : 'rgba(240,176,64,0.1)'}` }}>
                دقة ±{toArabicNum(accuracy)}م
              </span>
            )}
            <button onClick={() => setShowGuide(!showGuide)} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: showGuide ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.03)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={showGuide ? '#ec4899' : 'rgba(255,255,255,0.2)'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ════════ SEARCH BAR (always visible) ════════ */}
      <div className="relative z-10 flex-shrink-0" style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="text" placeholder="ابحث عن مدينة، بلد، أو ZIP code..." value={searchQuery} onChange={e => handleSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.04)', outline: 'none', fontFamily: '"Cairo", sans-serif', direction: 'rtl' }} />
            {searching && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 12 }}>⏳</motion.div></div>}
          </div>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 6, background: '#151030', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, maxHeight: 140, overflowY: 'auto' }}>
            {searchResults.map((item, i) => (
              <button key={i} onClick={() => selectLocation(item)} style={{ width: '100%', textAlign: 'right', padding: '10px 12px', border: 'none', cursor: 'pointer', background: 'transparent', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'transparent', fontFamily: '"Cairo", sans-serif' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {item.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ════════ CONTENT ════════ */}
      <div className="qbs relative z-10 flex-1 flex flex-col items-center" style={{ minHeight: 0, overflowY: 'auto', padding: '8px 12px' }}>

        {/* calibration guide */}
        <AnimatePresence>
          {showGuide && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', width: '100%', marginBottom: 8 }}>
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(236,72,153,0.04), rgba(139,92,246,0.02))', border: '1px solid rgba(236,72,153,0.08)' }}>
                <p style={{ fontSize: 11, color: '#ec4899', fontWeight: 700, marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>💡 نصائح للحصول على دقة أعلى</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['أبعد الهاتف عن المعدن والمغناطيس', 'حرّك الهاتف بشكل دائري (٨) لمعايرة البوصلة', 'أمسك الهاتف بشكل أفقي ومستوٍ', 'افتح GPS للحصول على موقع أدق', 'يمكنك البحث عن أي مدينة يدوياً'].map((tip, i) => (
                    <p key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: '"Cairo", sans-serif', paddingRight: 10, position: 'relative' }}>
                      <span style={{ position: 'absolute', right: 0, color: 'rgba(236,72,153,0.4)' }}>•</span>{tip}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── No location state ── */}
        {!hasLocation && (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🧭</div>
            <p style={{ fontSize: 14, color: '#ec4899', fontWeight: 700, marginBottom: 6, fontFamily: '"Cairo", sans-serif' }}>حدد موقعك</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: '"Cairo", sans-serif', lineHeight: 1.8 }}>
              ابحث عن مدينتك في شريط البحث أعلاه<br/>أو فعّل خدمات الموقع من إعدادات الجهاز
            </p>
          </div>
        )}

        {/* ── Compass + Info (when location is set) ── */}
        {hasLocation && (
          <>
            {/* ── Compass ── */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
              <motion.div animate={{ rotate: -smoothHeading }} transition={{ duration: 0.15, ease: 'linear' }}>
                <CompassSVG size={200} heading={smoothHeading} qiblaAngle={qiblaAngle} sunAzimuth={sunPos?.azimuth} sunAltitude={sunPos?.altitude} />
              </motion.div>
            </div>

            {/* ── Status badge ── */}
            <AnimatePresence>
              {isAligned && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  style={{ padding: '4px 14px', borderRadius: 10, marginBottom: 6, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12 }}>✅</span>
                  <span style={{ fontSize: 11, color: '#00c896', fontWeight: 700, fontFamily: '"Cairo", sans-serif' }}>في اتجاه القبلة</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Info cards row 1 ── */}
            <div style={{ width: '100%', display: 'flex', gap: 6, marginBottom: 6 }}>
              {[
                { label: 'القبلة', value: `${Math.round(qiblaAngle)}°`, sub: dirName, color: '#ec4899' },
                { label: 'المسافة', value: formatDist(distance), sub: 'إلى الكعبة', color: '#8b5cf6' },
                { label: 'اتجاهك', value: `${Math.round(smoothHeading)}°`, sub: getDirName(smoothHeading), color: '#f0b040' },
              ].map((card, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 10, padding: '8px 6px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#151030', border: '1px solid rgba(255,255,255,0.035)' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${card.color}30, transparent)` }} />
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', fontWeight: 600, marginBottom: 3, fontFamily: '"Cairo", sans-serif' }}>{card.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: card.color, lineHeight: '18px', fontVariantNumeric: 'tabular-nums' }}>{card.value}</p>
                  <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)', marginTop: 2, fontFamily: '"Cairo", sans-serif' }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Info cards row 2 ── */}
            <div style={{ width: '100%', display: 'flex', gap: 6, marginBottom: 6 }}>
              {[
                { label: 'الشمس', value: sunPos ? (sunPos.isUp ? `${sunPos.azimuth}°` : 'غابت') : '---', sub: sunPos ? (sunPos.isUp ? `ارتفاع ${sunPos.altitude}°` : 'السماء مظلمة') : '', color: '#f0b040' },
                { label: 'الفرق', value: `${Math.round(Math.abs(((qiblaAngle - smoothHeading) % 360 + 360) % 360))}°`, sub: isAligned ? 'متطابق' : isNear ? 'قريب' : 'ابعد', color: isAligned ? '#00c896' : isNear ? '#f0b040' : '#ec4899' },
                { label: 'الإحداثيات', value: coords?.lat || '---', sub: coords?.lng || '', color: '#8b5cf6' },
              ].map((card, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 10, padding: '8px 6px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#151030', border: '1px solid rgba(255,255,255,0.035)' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 1.5, background: `linear-gradient(90deg, transparent, ${card.color}30, transparent)` }} />
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', fontWeight: 600, marginBottom: 3, fontFamily: '"Cairo", sans-serif' }}>{card.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: card.color, lineHeight: '16px', fontVariantNumeric: 'tabular-nums' }}>{card.value}</p>
                  <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)', marginTop: 2, fontFamily: '"Cairo", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Direction indicator bar ── */}
            <div style={{ width: '100%', marginBottom: 6 }}>
              <div style={{ height: 24, borderRadius: 8, position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.025)' }}>
                {Array.from({ length: 37 }, (_, i) => (
                  <div key={i} style={{ position: 'absolute', top: i % 3 === 0 ? 0 : 5, bottom: i % 3 === 0 ? 0 : 5, left: `${(i / 36) * 100}%`, width: 1, background: i % 9 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)' }} />
                ))}
                {sunPos?.isUp && <div style={{ position: 'absolute', top: 2, bottom: 2, width: 3, borderRadius: 2, left: `${((sunPos.azimuth % 360) / 360) * 100}%`, background: '#f0b040', boxShadow: '0 0 4px rgba(240,176,64,0.4)' }} />}
                <div style={{ position: 'absolute', top: 1, bottom: 1, width: 3, borderRadius: 2, left: `${((qiblaAngle % 360) / 360) * 100}%`, background: isAligned ? '#00c896' : '#ec4899', boxShadow: `0 0 6px ${isAligned ? 'rgba(0,200,150,0.3)' : 'rgba(236,72,153,0.3)'}` }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, left: `${((smoothHeading % 360) / 360) * 100}%`, background: '#8b5cf6', opacity: 0.6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)' }}>٠°</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)' }}>١٨٠°</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.1)' }}>٣٦٠°</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                {[{ c: '#ec4899', l: 'القبلة' }, { c: '#8b5cf6', l: 'اتجاهك' }, { c: '#f0b040', l: 'الشمس' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 10, height: 4, borderRadius: 2, background: item.c }} />
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Qibla Tips ── */}
            <div style={{ width: '100%', borderRadius: 10, padding: '10px 12px', background: 'rgba(236,72,153,0.03)', border: '1px solid rgba(236,72,153,0.06)', marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: '#ec4899', fontWeight: 700, marginBottom: 5, fontFamily: '"Cairo", sans-serif' }}>🕌 معرفة القبلة</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  `اتجاه القبلة من موقعك: ${Math.round(qiblaAngle)}° ${dirName}`,
                  `المسافة إلى الكعبة: ${formatDist(distance)}`,
                  sunPos?.isUp && `اتجاه الشمس: ${sunPos.azimuth}° (ارتفاع ${sunPos.altitude}°)`,
                  isAligned ? '✅ أنت في اتجاه القبلة' : isNear ? '⚠️ أنت قريب من اتجاه القبلة' : '❌ ابتعد قليلاً للوصول لاتجاه القبلة',
                ].filter(Boolean).map((tip, i) => (
                  <p key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: '"Cairo", sans-serif', paddingRight: 10, position: 'relative' }}>
                    <span style={{ position: 'absolute', right: 0, color: 'rgba(236,72,153,0.4)' }}>•</span>{tip}
                  </p>
                ))}
              </div>
            </div>

            {/* ── Ayah ── */}
            <div style={{ width: '100%', borderRadius: 10, padding: '10px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.008)', border: '1px solid rgba(255,255,255,0.02)' }}>
              <p style={{ fontSize: 13, lineHeight: 2, direction: 'rtl', color: 'rgba(255,255,255,0.2)', fontFamily: '"Amiri Quran", "Amiri", serif' }}>
                ﴿ وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا ﴾
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
