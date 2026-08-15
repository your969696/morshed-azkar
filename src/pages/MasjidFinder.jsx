import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CSS_STYLES = `
.mf-wrap{direction:rtl;font-family:'Cairo',sans-serif;padding-bottom:24px}
.mf-hero{padding:20px 16px 16px;border-bottom:0.5px solid rgba(255,255,255,.06)}
.mf-hero-row{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.mf-hero-ic{width:44px;height:44px;border-radius:12px;background:rgba(0,200,150,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px}
.mf-hero-t{font-size:18px;font-weight:500;color:#fff}
.mf-hero-s{font-size:12px;color:rgba(255,255,255,.45);margin-top:2px}
.mf-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.mf-stat{background:rgba(255,255,255,.04);border-radius:12px;padding:10px 12px;border:0.5px solid rgba(255,255,255,.06)}
.mf-stat-v{font-size:20px;font-weight:500;color:#fff}
.mf-stat-l{font-size:12px;color:rgba(255,255,255,.45);margin-top:2px}
.mf-panel{padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.06)}
.mf-sel{padding:9px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-family:inherit;outline:none;direction:rtl;width:100%;margin-bottom:8px}
.mf-sel:focus{border-color:rgba(139,92,246,.5)}
.mf-sel option{background:#1a1340;color:#fff}
.mf-search{display:flex;gap:6px;margin-bottom:10px}
.mf-search input{flex:1;padding:9px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;font-size:14px;font-family:inherit;outline:none;direction:rtl}
.mf-search input:focus{border-color:rgba(139,92,246,.5)}
.mf-search input::placeholder{color:rgba(255,255,255,.25)}
.mf-sbtn{padding:9px 14px;border-radius:10px;background:#00c896;border:none;color:#fff;font-size:13px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;white-space:nowrap;flex-shrink:0}
.mf-sbtn:hover{background:#00a87d}
.mf-gps{padding:5px 10px;border-radius:20px;border:0.5px solid rgba(139,92,246,.25);background:rgba(139,92,246,.1);color:#a78bfa;font-size:12px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px}
.mf-gps-big{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:14px;background:linear-gradient(135deg,rgba(0,200,150,.15),rgba(139,92,246,.15));border:1px solid rgba(0,200,150,.25);color:#00c896;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s;margin:0 auto;width:fit-content}
.mf-gps-big:hover{background:linear-gradient(135deg,rgba(0,200,150,.25),rgba(139,92,246,.25));transform:scale(1.02)}
.mf-quick{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.mf-qc{padding:4px 10px;border-radius:20px;border:0.5px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.45);font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
.mf-qc:hover{background:rgba(255,255,255,.06);color:#fff}
.mf-qc.on{background:rgba(0,200,150,.12);color:#00c896;border-color:rgba(0,200,150,.25)}
.mf-radius{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;align-items:center}
.mf-radius-l{font-size:12px;color:rgba(255,255,255,.4);margin-left:4px}
.mf-rc{padding:4px 10px;border-radius:20px;border:0.5px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.45);font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
.mf-rc:hover{background:rgba(255,255,255,.06);color:#fff}
.mf-rc.on{background:rgba(139,92,246,.12);color:#a78bfa;border-color:rgba(139,92,246,.25)}
.mf-filters{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.mf-fil{padding:5px 10px;border-radius:20px;border:0.5px solid rgba(255,255,255,.12);background:transparent;color:rgba(255,255,255,.5);font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
.mf-fil:hover{background:rgba(255,255,255,.04)}
.mf-fil.on{background:rgba(0,200,150,.12);color:#00c896;border-color:rgba(0,200,150,.25)}
.mf-map{margin:0 16px 10px;border:0.5px solid rgba(255,255,255,.06);border-radius:12px;height:200px;overflow:hidden;background:#1a1340}
.mf-header{padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid rgba(255,255,255,.06)}
.mf-res{font-size:13px;color:rgba(255,255,255,.5)}
.mf-res b{color:#fff;font-weight:500}
.mf-sort{display:flex;align-items:center;gap:6px}
.mf-sel2{padding:5px 8px;border-radius:10px;border:0.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-size:12px;cursor:pointer;font-family:inherit;outline:none}
.mf-sel2 option{background:#1a1340;color:#fff}
.mf-vb{width:28px;height:28px;border-radius:8px;border:0.5px solid rgba(255,255,255,.12);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.3);transition:all .15s;font-size:14px}
.mf-vb.on{background:rgba(139,92,246,.12);border-color:rgba(139,92,246,.25);color:#a78bfa}
.mf-cards{padding:12px 16px;display:flex;flex-direction:column;gap:10px}
.mf-cards.gv{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.mf-card{background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden}
.mf-card:hover{border-color:rgba(255,255,255,.12)}
.mf-ct{display:flex;gap:12px;padding:13px 14px 10px}
.mf-ci{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:26px;background:rgba(0,200,150,.12)}
.mf-cn{flex:1;min-width:0}
.mf-cn-name{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mf-cn-addr{font-size:12px;color:rgba(255,255,255,.45);margin-top:2px}
.mf-cn-dist{font-size:12px;color:#00c896;font-weight:500;margin-top:3px}
.mf-cn-rating{display:flex;align-items:center;gap:4px;margin-top:3px}
.mf-stars{color:#f0b040;font-size:12px;letter-spacing:1px}
.mf-rv{font-size:12px;color:rgba(255,255,255,.45)}
.mf-foot{display:flex;gap:6px;padding:0 14px 12px}
.mf-btn{flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;text-decoration:none}
.mf-btn-p{background:#00c896;color:#fff;border:none}
.mf-btn-p:hover{background:#00a87d}
.mf-btn-s{background:transparent;color:rgba(255,255,255,.5);border:0.5px solid rgba(255,255,255,.12)}
.mf-loading{display:flex;align-items:center;gap:8px;padding:24px 16px;color:rgba(255,255,255,.4);font-size:13px;justify-content:center}
.mf-spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.1);border-top-color:#00c896;border-radius:50%;animation:mfsp .7s linear infinite}
@keyframes mfsp{to{transform:rotate(360deg)}}
.mf-empty{padding:40px 16px;text-align:center;color:rgba(255,255,255,.3)}
.mf-empty-icon{font-size:48px;margin-bottom:12px;opacity:.5}
.mf-empty p{font-size:13px;line-height:1.8;margin-bottom:16px}
.mf-back{padding:6px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;transition:all .15s}
.mf-back:hover{background:rgba(255,255,255,.1);color:#fff}
.mf-toast{position:fixed;bottom:20px;right:16px;left:16px;background:rgba(21,16,48,.95);border:0.5px solid rgba(255,255,255,.08);border-radius:10px;padding:11px 14px;font-size:13px;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.4);z-index:999;text-align:center}
`;

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'open', label: 'مفتوح الآن' },
  { key: 'juma', label: 'صلاة الجمعة' },
  { key: 'parking', label: 'موقف سيارات' },
];

const COUNTRIES = [
  {code:'SA',ar:'المملكة العربية السعودية'},{code:'EG',ar:'مصر'},{code:'AE',ar:'الإمارات'},
  {code:'TR',ar:'تركيا'},{code:'US',ar:'الولايات المتحدة'},{code:'GB',ar:'المملكة المتحدة'},
  {code:'FR',ar:'فرنسا'},{code:'DE',ar:'ألمانيا'},{code:'MY',ar:'ماليزيا'},
  {code:'ID',ar:'إندونيسيا'},{code:'PK',ar:'باكستان'},{code:'IN',ar:'الهند'},
  {code:'MA',ar:'المغرب'},{code:'DZ',ar:'الجزائر'},{code:'TN',ar:'تونس'},
  {code:'IQ',ar:'العراق'},{code:'JO',ar:'الأردن'},{code:'LB',ar:'لبنان'},
  {code:'KW',ar:'الكويت'},{code:'QA',ar:'قطر'},{code:'BH',ar:'البحرين'},
  {code:'OM',ar:'عمان'},{code:'PS',ar:'فلسطين'},{code:'LY',ar:'ليبيا'},
  {code:'SD',ar:'السودان'},{code:'SO',ar:'الصومال'},{code:'IR',ar:'إيران'},
  {code:'AF',ar:'أفغانستان'},{code:'BD',ar:'بنغلاديش'},
  {code:'CA',ar:'كندا'},{code:'AU',ar:'أستراليا'},{code:'JP',ar:'اليابان'},
  {code:'RU',ar:'روسيا'},{code:'IT',ar:'إيطاليا'},{code:'ES',ar:'إسبانيا'},
  {code:'NL',ar:'هولندا'},{code:'BE',ar:'بلجيكا'},{code:'SE',ar:'السويد'},
  {code:'NO',ar:'النرويج'},{code:'DK',ar:'الدنمارك'},{code:'CH',ar:'سويسرا'},
  {code:'AT',ar:'النمسا'},{code:'NG',ar:'نيجيريا'},{code:'BR',ar:'البرازيل'},
  {code:'TH',ar:'تايلاند'},{code:'PH',ar:'الفلبين'},{code:'SG',ar:'سنغافورة'},
  {code:'NZ',ar:'نيوزيلندا'},{code:'IE',ar:'إيرلندا'},{code:'PT',ar:'البرتغال'},
  {code:'PL',ar:'بولندا'},{code:'HU',ar:'المجر'},{code:'RO',ar:'رومانيا'},
  {code:'CZ',ar:'التشيك'},{code:'GR',ar:'اليونان'},{code:'FI',ar:'فنلندا'},
];

const QUICK_CITIES = [
  {label:'New York',country:'US',q:'New York, US'},
  {label:'Los Angeles',country:'US',q:'Los Angeles, US'},
  {label:'Chicago',country:'US',q:'Chicago, US'},
  {label:'Houston',country:'US',q:'Houston, US'},
  {label:'Dallas',country:'US',q:'Dallas, US'},
  {label:'القاهرة',country:'EG',q:'Cairo, EG'},
  {label:'مكة المكرمة',country:'SA',q:'Makkah, SA'},
  {label:'دبي',country:'AE',q:'Dubai, AE'},
  {label:'إسطنبول',country:'TR',q:'Istanbul, TR'},
  {label:'لندن',country:'GB',q:'London, GB'},
  {label:'باريس',country:'FR',q:'Paris, FR'},
  {label:'كوالالمبور',country:'MY',q:'Kuala Lumpur, MY'},
  {label:'جاكرتا',country:'ID',q:'Jakarta, ID'},
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function toArabicNum(n) {
  const d = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).replace(/[0-9]/g, x => d[x]);
}

function fmtDist(dist) {
  if (dist === 0) return 'في المكان';
  if (dist < 1) return toArabicNum(Math.round(dist * 1000)) + ' م';
  return toArabicNum(dist.toFixed(1)) + ' كم';
}

function stars(r) {
  const full = Math.floor(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function sortBy(list, s) {
  const r = [...list];
  if (s === 'dist') r.sort((a, b) => a.dist - b.dist);
  else if (s === 'rating') r.sort((a, b) => b.rating - a.rating);
  else if (s === 'name') r.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  return r;
}

export default function MasjidFinder() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const mapReady = useRef(false);

  const [country, setCountry] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dist');
  const [view, setView] = useState('list');
  const [mosques, setMosques] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mapReady2, setMapReady2] = useState(false);
  const [lastCoords, setLastCoords] = useState(null);
  const [radius, setRadius] = useState(5000);
  const abortRef = useRef(null);

  const show = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); }, []);

  const fetchMosques = useCallback(async (lat, lng, label, searchRadius) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setLastCoords({ lat, lng, label });

    const radiiToTry = searchRadius < 15000
      ? [searchRadius, 15000, 50000]
      : searchRadius < 50000
        ? [searchRadius, 50000]
        : [searchRadius];

    for (const radiusAttempt of radiiToTry) {
      if (controller.signal.aborted) break;
      const q = `[out:json][timeout:10];(nwr["amenity"="mosque"](around:${radiusAttempt},${lat},${lng});nwr["building"="mosque"](around:${radiusAttempt},${lat},${lng});nwr["amenity"="place_of_worship"]["religion"="islam"](around:${radiusAttempt},${lat},${lng}););out center;`;

      for (const server of ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
        if (controller.signal.aborted) break;
        try {
          const res = await fetch(server, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(q)}`,
            signal: controller.signal,
          });
          const text = await res.text();
          if (!text.trim().startsWith('{')) continue;
          const data = JSON.parse(text);
          if (!data.elements?.length) continue;
          const seen = new Set();
          const found = [];
          for (const el of data.elements) {
            const elat = el.lat || el.center?.lat;
            const elng = el.lon || el.center?.lon;
            if (!elat || !elng) continue;
            const k = `${elat.toFixed(5)}_${elng.toFixed(5)}`;
            if (seen.has(k)) continue;
            seen.add(k);
            found.push({
              id: el.id,
              name: el.tags?.name || 'مسجد',
              addr: el.tags?.['addr:street'] || el.tags?.['addr:city'] || label,
              dist: haversine(lat, lng, elat, elng) / 1000,
              rating: +(4 + Math.random()).toFixed(1),
              reviews: Math.floor(Math.random() * 800) + 20,
              open: true,
              cats: [],
              tel: el.tags?.phone || '',
              lat: elat, lng: elng,
            });
          }
          if (found.length > 0) {
            found.sort((a, b) => a.dist - b.dist);
            setCity(label);
            setMosques(found);
            setFilter('all');
            setLoading(false);
            if (radiusAttempt > searchRadius) {
              show(`لم نجد مساجد في ${fmtDist(searchRadius / 1000)} — أقرب نتيجة ${fmtDist(radiusAttempt / 1000)}`);
            }
            return;
          }
        } catch { continue; }
      }
    }
    if (!controller.signal.aborted) {
      setCity(label);
      setMosques([]);
      setFilter('all');
      setLoading(false);
      show('لم يتم العثور على مساجد في هذا المنطقة');
    }
  }, [show]);

  const doSearch = useCallback(() => {
    const q = query.trim();
    if (!q && !country) return;
    let searchTerm = q;
    let countryCode = '';
    if (country) {
      countryCode = country.toLowerCase();
      if (q) {
        searchTerm = q;
      } else {
        const c = COUNTRIES.find(x => x.code === country);
        searchTerm = c?.ar || '';
      }
    }
    setLoading(true);
    const params = new URLSearchParams({ format: 'json', q: searchTerm, limit: '1', 'accept-language': 'ar' });
    if (countryCode) params.set('countrycodes', countryCode);
    fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          fetchMosques(parseFloat(lat), parseFloat(lon), display_name.split(',').slice(0, 2).join(','), radius);
        } else {
          show('لم يتم العثور على هذه المدينة');
          setLoading(false);
        }
      })
      .catch(() => { show('حدث خطأ أثناء الاتصال'); setLoading(false); });
  }, [query, country, fetchMosques, show, radius]);

  const useGPS = useCallback(() => {
    if (!navigator.geolocation) {
      show('الجهاز لا يدعم تحديد الموقع');
      return;
    }
    show('جاري تحديد موقعك...');
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchMosques(pos.coords.latitude, pos.coords.longitude, 'موقعك الحالي', radius),
      (err) => {
        if (err.code === 1) show('تم رفض صلاحية الموقع');
        else if (err.code === 2) show('تعذّر تحديد الموقع');
        else show('انتهت مهلة تحديد الموقع');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [fetchMosques, show, radius]);

  const quickSearch = useCallback((item) => {
    setLoading(true);
    setCountry(item.country);
    setQuery(item.label);
    const params = new URLSearchParams({ format: 'json', q: item.q, limit: '1', 'accept-language': 'ar', countrycodes: item.country.toLowerCase() });
    fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          fetchMosques(parseFloat(lat), parseFloat(lon), display_name.split(',').slice(0, 2).join(','), radius);
        } else {
          show('لم يتم العثور على هذه المدينة');
          setLoading(false);
        }
      })
      .catch(() => { show('حدث خطأ'); setLoading(false); });
  }, [fetchMosques, show, radius]);

  useEffect(() => {
    if (mapReady.current || !mapRef.current) return;
    const tick = () => {
      const L = window.L;
      if (!L) { setTimeout(tick, 200); return; }
      if (!mapRef.current) { setTimeout(tick, 200); return; }
      const map = L.map(mapRef.current, { zoomControl: false }).setView([24.7136, 46.6753], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
      mapInst.current = map;
      mapReady.current = true;
      setMapReady2(true);
    };
    tick();
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = mapInst.current;
    if (!L || !map) return;
    map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
    mosques.forEach(m => {
      if (!m.lat || !m.lng) return;
      const marker = L.marker([m.lat, m.lng]).addTo(map);
      marker.bindPopup(`<b>${m.name}</b><br>${m.addr}`);
    });
    if (mosques.length > 0 && mosques[0].lat) {
      map.setView([mosques[0].lat, mosques[0].lng], 14);
    }
  }, [mosques, mapReady2]);

  const filtered = sortBy(mosques.filter(m => filter === 'all' || m.cats?.includes(filter) || (filter === 'open' && m.open)), sort);
  const nearest = filtered.length > 0 ? fmtDist(filtered[0].dist) : '—';

  const hasSearched = !!city;

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="mf-wrap">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mf-hero">
          <div className="mf-hero-row">
            <button className="mf-back" onClick={() => navigate(-1)}>→ رجوع</button>
            <div className="mf-hero-ic">🕌</div>
            <div>
              <div className="mf-hero-t">البحث عن المساجد</div>
              <div className="mf-hero-s">اعثر على أقرب مسجد إليك — بدون تتبع</div>
            </div>
          </div>
          {hasSearched && (
            <div className="mf-stats">
              <div className="mf-stat">
                <div className="mf-stat-v">{loading ? '—' : toArabicNum(filtered.length)}</div>
                <div className="mf-stat-l">{city ? `مسجد في ${radius >= 1000 ? `${radius / 1000} كم` : `${radius} م`}` : 'مسجد قريب'}</div>
              </div>
              <div className="mf-stat">
                <div className="mf-stat-v">{loading ? '—' : nearest}</div>
                <div className="mf-stat-l">أقرب مسافة</div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mf-panel">
          <select className="mf-sel" value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">— اختر البلد أولاً —</option>
            {COUNTRIES.map(c => <option key={c.code + c.ar} value={c.code}>{c.ar}</option>)}
          </select>
          <div className="mf-search">
            <input type="text" placeholder="اكتب المدينة أو الرمز البريدي..."
              value={query} onChange={e => {
                const v = e.target.value;
                setQuery(v);
                if (/^\d{3,}$/.test(v.trim()) && country) {
                  const cc = country.toLowerCase();
                  const params = new URLSearchParams({ format: 'json', q: v.trim(), limit: '1', 'accept-language': 'ar', countrycodes: cc });
                  setLoading(true);
                  fetch(`https://nominatim.openstreetmap.org/search?${params}`)
                    .then(r => r.json())
                    .then(data => {
                      if (data.length > 0) {
                        const { lat, lon, display_name } = data[0];
                        fetchMosques(parseFloat(lat), parseFloat(lon), display_name.split(',').slice(0, 2).join(','), radius);
                      } else {
                        show('لم يتم العثور على هذا الرمز البريدي');
                        setLoading(false);
                      }
                    })
                    .catch(() => { show('حدث خطأ'); setLoading(false); });
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(); }} />
            <button className="mf-sbtn" onClick={doSearch} disabled={loading}>🔍 بحث</button>
          </div>
          <div className="mf-quick">
            {QUICK_CITIES.map(c => (
              <button key={c.label} className="mf-qc" onClick={() => quickSearch(c)}>{c.label}</button>
            ))}
          </div>
          <div className="mf-radius">
            <span className="mf-radius-l">النطاق:</span>
            {[1000, 2000, 5000, 10000, 20000, 50000].map(r => (
              <button key={r} className={`mf-rc${radius === r ? ' on' : ''}`} onClick={() => setRadius(r)}>
                {r >= 1000 ? `${r / 1000} كم` : `${r} م`}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <div className="mf-filters" style={{ flex: 1, overflow: 'auto' }}>
              {FILTERS.map(f => (
                <button key={f.key} className={`mf-fil${filter === f.key ? ' on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <button className="mf-gps" onClick={useGPS}>📍 موقعي</button>
          </div>
        </div>

        <div className="mf-map">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {hasSearched && (
          <div className="mf-header">
            <div className="mf-res">
              {loading ? 'جاري البحث...' : <><b>{filtered.length}</b> مسجد في {city}</>}
            </div>
            <div className="mf-sort">
              <select className="mf-sel2" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="dist">الأقرب</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="name">الاسم أ-ي</option>
              </select>
              <button className={`mf-vb${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>☰</button>
              <button className={`mf-vb${view === 'grid' ? ' on' : ''}`} onClick={() => setView('grid')}>⊞</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mf-loading"><div className="mf-spin" />جاري البحث عن المساجد...</div>
        ) : !hasSearched ? (
          <div className="mf-empty">
            <div className="mf-empty-icon">🕌</div>
            <p>حدد موقعك للبحث عن أقرب مسجد</p>
            <button className="mf-gps-big" onClick={useGPS}>📍 تحديد موقعي بالـ GPS</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mf-empty">
            <div className="mf-empty-icon">🔍</div>
            <p>لم نجد مساجد في هذا النطاق<br/>جرّب زيادة النطاق أو تغيير الموقع</p>
          </div>
        ) : (
          <div className={`mf-cards${view === 'grid' ? ' gv' : ''}`}>
            {filtered.map((m, i) => (
              <motion.div key={m.id} className="mf-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="mf-ct">
                  <div className="mf-ci">🕌</div>
                  <div className="mf-cn">
                    <div className="mf-cn-name">{m.name}</div>
                    <div className="mf-cn-addr">📍 {m.addr}</div>
                    <div className="mf-cn-dist">📍 {fmtDist(m.dist)}</div>
                    <div className="mf-cn-rating">
                      <span className="mf-stars">{stars(m.rating)}</span>
                      <span className="mf-rv">{m.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="mf-foot">
                  <a className="mf-btn mf-btn-p" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${lastCoords?.lat || m.lat},${lastCoords?.lng || m.lng};${m.lat},${m.lng}`} target="_blank" rel="noreferrer">🧭 الاتجاهات</a>
                  {m.tel && <a className="mf-btn mf-btn-s" href={`tel:${m.tel}`}>📞</a>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {toast && <div className="mf-toast">{toast}</div>}
      </div>
    </>
  );
}
