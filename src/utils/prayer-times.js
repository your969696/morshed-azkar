import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const ALADHAN_METHOD_MAP = {
  1: 4,   // Umm Al Qura → Aladhan 4
  2: 1,   // Muslim World League → Aladhan 1
  3: 3,   // Egyptian → Aladhan 3
  4: 3,   // Al-Azhar → Aladhan 3
  7: 2,   // ISNA (North America) → Aladhan 2
  9: 9,   // Turkey (Diyanet) → Aladhan 9
  12: 12, // Qatar → Aladhan 12
};

const ALADHAN_COUNTRY_METHOD = {
  us: 2, gb: 1, ca: 2, eg: 3, sa: 4, ae: 5, qa: 12,
  tr: 9, pk: 8, in: 8, my: 1, id: 1, fr: 15, de: 1,
  kw: 11, bh: 11, om: 11, ye: 11, jo: 1, ps: 1,
};

export const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
export const PRAYER_KEYS_ONLY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PRAYER_NAMES_AR = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const PRAYER_EMOJIS = {
  Fajr: '🌅',
  Sunrise: '☀️',
  Dhuhr: '🌤️',
  Asr: '🌇',
  Maghrib: '🌅',
  Isha: '🌙',
};

const COUNTRY_METHODS = {
  us: 'NorthAmerica',
  gb: 'MuslimWorldLeague',
  ca: 'MuslimWorldLeague',
  eg: 'Egyptian',
  sy: 'Egyptian',
  iq: 'Egyptian',
  lb: 'Egyptian',
  ly: 'Egyptian',
  sd: 'Egyptian',
  so: 'Egyptian',
  dj: 'Egyptian',
  sa: 'UmmAlQura',
  ae: 'Dubai',
  qa: 'Gulf',
  kw: 'Gulf',
  bh: 'Gulf',
  om: 'Gulf',
  ye: 'Gulf',
  jo: 'MuslimWorldLeague',
  ps: 'MuslimWorldLeague',
  tr: 'Turkey',
  my: 'MuslimWorldLeague',
  id: 'MuslimWorldLeague',
  pk: 'Karachi',
  in: 'Karachi',
  bd: 'Karachi',
  af: 'Karachi',
  fr: 'MuslimWorldLeague',
  de: 'MuslimWorldLeague',
  be: 'MuslimWorldLeague',
  nl: 'MuslimWorldLeague',
  au: 'MuslimWorldLeague',
  nz: 'MuslimWorldLeague',
};

function getCalcMethod(methodName) {
  const methods = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
    Egyptian: CalculationMethod.Egyptian,
    Karachi: CalculationMethod.Karachi,
    UmmAlQura: CalculationMethod.UmmAlQura,
    Dubai: CalculationMethod.Dubai,
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
    NorthAmerica: CalculationMethod.NorthAmerica,
    Kuwait: CalculationMethod.Kuwait,
    Qatar: CalculationMethod.Qatar,
    Singapore: CalculationMethod.Singapore,
    Other: CalculationMethod.Other,
    Diyanet: CalculationMethod.Turkey,
  };
  const method = methods[methodName] || CalculationMethod.MuslimWorldLeague;
  return method();
}

// Map numeric method IDs from Settings to adhan library methods
function getCalcMethodFromId(id) {
  const map = {
    1: CalculationMethod.UmmAlQura,
    2: CalculationMethod.MuslimWorldLeague,
    3: CalculationMethod.Egyptian,
    4: CalculationMethod.Egyptian,
    5: CalculationMethod.UmmAlQura,
    7: CalculationMethod.NorthAmerica,
    8: CalculationMethod.MuslimWorldLeague,
    9: CalculationMethod.Turkey,
    10: CalculationMethod.Karachi,
    11: CalculationMethod.Kuwait,
    12: CalculationMethod.Qatar,
    14: CalculationMethod.Singapore,
    15: CalculationMethod.MuslimWorldLeague,
  };
  const method = map[id] || CalculationMethod.MuslimWorldLeague;
  return method();
}

function getMethodNameForCountry(countryCode) {
  if (!countryCode) return 'MuslimWorldLeague';
  return COUNTRY_METHODS[countryCode.toLowerCase()] || 'MuslimWorldLeague';
}

const CITIES_EGYPT = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الجيزة', lat: 30.0131, lng: 31.2089 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
  { name: 'المنصورة', lat: 31.0409, lng: 31.3785 },
  { name: 'طنطا', lat: 30.7865, lng: 31.0004 },
  { name: 'أسيوط', lat: 27.1809, lng: 31.1837 },
  { name: 'الزقازيق', lat: 30.5877, lng: 31.5020 },
  { name: 'إسنا', lat: 25.2867, lng: 32.5530 },
  { name: 'الأقصر', lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان', lat: 24.0889, lng: 32.8998 },
  { name: 'شرم الشيخ', lat: 27.9158, lng: 34.3300 },
  { name: 'دهب', lat: 28.5091, lng: 34.5136 },
  { name: 'الغردقة', lat: 27.2579, lng: 33.8116 },
  { name: 'مرسى مطروح', lat: 31.3543, lng: 27.2453 },
  { name: 'بني سويف', lat: 29.0729, lng: 31.0982 },
  { name: 'الفيوم', lat: 29.3100, lng: 30.8418 },
  { name: 'دمياط', lat: 31.4175, lng: 31.8144 },
  { name: 'كفر الشيخ', lat: 31.1084, lng: 30.9434 },
  { name: 'المنيا', lat: 28.1099, lng: 30.7503 },
  { name: 'سوهاج', lat: 26.5560, lng: 31.6949 },
  { name: 'قنا', lat: 26.1551, lng: 32.7160 },
  { name: 'البحر الأحمر', lat: 27.2579, lng: 33.8116 },
  { name: 'الوادي الجديد', lat: 25.5000, lng: 30.5000 },
  { name: 'مطروح', lat: 31.3543, lng: 27.2453 },
];

function getTodayKey() {
  const d = new Date();
  const loc = getLocationSettings();
  const locKey = loc ? `${loc.lat || 0}-${loc.lng || 0}` : 'default';
  const methodKey = localStorage.getItem('prayerCalcMethod') || 'default';
  const offsetKey = localStorage.getItem('prayerTimeOffsets') || '{}';
  const offsetHash = btoa(offsetKey).slice(0, 16);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${locKey}-${methodKey}-${offsetHash}`;
}

function getCached() {
  try {
    const raw = localStorage.getItem('prayerTimesCache');
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (cache.key === getTodayKey() && cache.times) return cache.times;
    // Key mismatch = new day or location change → clear old cache
    localStorage.removeItem('prayerTimesCache');
  } catch {}
  return null;
}

function setCache(times) {
  try {
    localStorage.setItem('prayerTimesCache', JSON.stringify({ key: getTodayKey(), times }));
  } catch {}
}

// Auto-clear cache on app start if date changed
(function autoClearCache() {
  try {
    const raw = localStorage.getItem('prayerTimesCache');
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache.key !== getTodayKey()) {
        localStorage.removeItem('prayerTimesCache');
      }
    }
  } catch {}
})();

// ═══ Prayer Time Offsets (الوقت المضاف) ═══
export function getPrayerTimeOffsets() {
  try {
    const raw = localStorage.getItem('prayerTimeOffsets');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
}

export function setPrayerTimeOffsets(offsets) {
  localStorage.setItem('prayerTimeOffsets', JSON.stringify(offsets));
  localStorage.removeItem('prayerTimesCache');
  window.dispatchEvent(new Event('prayerLocationChanged'));
}

export function applyOffset(timeStr, minutes) {
  if (!timeStr || !minutes) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  let totalMin = h * 60 + m + minutes;
  if (totalMin < 0) totalMin += 24 * 60;
  if (totalMin >= 24 * 60) totalMin -= 24 * 60;
  const nh = Math.floor(totalMin / 60) % 24;
  const nm = totalMin % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

// ═══ Midnight Auto-Refresh ═══
let midnightTimer = null;
export function startMidnightRefresh() {
  if (midnightTimer) return;
  const check = () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      localStorage.removeItem('prayerTimesCache');
      window.dispatchEvent(new Event('prayerLocationChanged'));
    }
  };
  midnightTimer = setInterval(check, 60000);
}

export function stopMidnightRefresh() {
  if (midnightTimer) { clearInterval(midnightTimer); midnightTimer = null; }
}

function getLocationSettings() {
  try {
    const raw = localStorage.getItem('prayerLocation');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function getLocation() {
  const settings = getLocationSettings();
  if (settings) {
    const methodName = settings.methodName || getMethodNameForCountry(settings.countryCode);
    if (settings.lat && settings.lng) return { lat: settings.lat, lng: settings.lng, city: settings.city, methodName };
    if (settings.city) {
      const found = CITIES_EGYPT.find(c => c.name === settings.city);
      if (found) return { lat: found.lat, lng: found.lng, city: found.name, methodName: 'Egyptian' };
    }
  }
  try {
    const loc = localStorage.getItem('userLocation');
    if (loc) {
      const p = JSON.parse(loc);
      if (p.lat && p.lng) return { lat: p.lat, lng: p.lng, methodName: 'MuslimWorldLeague' };
    }
  } catch {}
  return { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', methodName: 'NorthAmerica' };
}

function getAladhanMethodId() {
  const manualMethodId = localStorage.getItem('prayerCalcMethod');
  if (manualMethodId) return ALADHAN_METHOD_MAP[parseInt(manualMethodId)] || 2;
  const loc = getLocationSettings();
  if (loc?.countryCode) return ALADHAN_COUNTRY_METHOD[loc.countryCode.toLowerCase()] || 2;
  return 2;
}

function cleanTime(str) {
  if (!str) return '00:00';
  return str.replace(/\s*\([^)]*\)/, '').trim();
}

async function fetchFromAladhanApi(lat, lng) {
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  const method = getAladhanMethodId();
  const school = getSchool();
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    if (json.code !== 200 || !json.data?.timings) throw new Error('Invalid response');
    const t = json.data.timings;
    return {
      Fajr: cleanTime(t.Fajr),
      Sunrise: cleanTime(t.Sunrise),
      Dhuhr: cleanTime(t.Dhuhr),
      Asr: cleanTime(t.Asr),
      Maghrib: cleanTime(t.Maghrib || t.Sunset),
      Isha: cleanTime(t.Isha),
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function calculatePrayerTimesFallback(lat, lng, methodName) {
  const manualMethodId = localStorage.getItem('prayerCalcMethod');
  let params;
  if (manualMethodId) {
    params = getCalcMethodFromId(parseInt(manualMethodId));
  } else {
    params = getCalcMethod(methodName);
  }
  const coordinates = new Coordinates(lat, lng);
  const date = new Date();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  function fmt(d) {
    if (!d) return '00:00';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  return {
    Fajr: fmt(prayerTimes.fajr),
    Sunrise: fmt(prayerTimes.sunrise),
    Dhuhr: fmt(prayerTimes.dhuhr),
    Asr: fmt(prayerTimes.asr),
    Maghrib: fmt(prayerTimes.maghrib),
    Isha: fmt(prayerTimes.isha),
  };
}

async function calculatePrayerTimesAsync(lat, lng) {
  try {
    return await fetchFromAladhanApi(lat, lng);
  } catch {
    return calculatePrayerTimesFallback(lat, lng, getLocation().methodName);
  }
}

function calculatePrayerTimesSync(lat, lng, methodName) {
  return calculatePrayerTimesFallback(lat, lng, methodName);
}

function applyOffsets(raw) {
  const offsets = getPrayerTimeOffsets();
  return {
    Fajr: applyOffset(raw.Fajr, offsets.Fajr || 0),
    Sunrise: applyOffset(raw.Sunrise, offsets.Sunrise || 0),
    Dhuhr: applyOffset(raw.Dhuhr, offsets.Dhuhr || 0),
    Asr: applyOffset(raw.Asr, offsets.Asr || 0),
    Maghrib: applyOffset(raw.Maghrib, offsets.Maghrib || 0),
    Isha: applyOffset(raw.Isha, offsets.Isha || 0),
    hijri: null,
  };
}

function mergeWithSolarTimes(times) {
  return { ...times };
}

export async function getPrayerTimes() {
  const cached = getCached();
  if (cached) return cached;

  const { lat, lng } = getLocation();
  const raw = await calculatePrayerTimesAsync(lat, lng);
  const merged = mergeWithSolarTimes(raw);
  const times = applyOffsets(merged);

  setCache(times);
  return times;
}

export function getPrayerTimesSync() {
  const cached = getCached();
  if (cached) return cached;
  const { lat, lng, methodName } = getLocation();
  const raw = calculatePrayerTimesSync(lat, lng, methodName);
  const merged = mergeWithSolarTimes(raw);
  const times = applyOffsets(merged);
  setCache(times);
  return times;
}

export function getSunriseMaghribFromCity() {
  const { lat, lng, methodName } = getLocation();
  return calculatePrayerTimesSync(lat, lng, methodName);
}

export function getPrayerTimesRawSync() {
  const { lat, lng, methodName } = getLocation();
  return calculatePrayerTimesSync(lat, lng, methodName);
}

export function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hours: h, minutes: m, totalMinutes: h * 60 + m };
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '--:--';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? 'م' : 'ص';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function calcFastingInfo(sunriseStr, maghribStr) {
  if (!sunriseStr || !maghribStr) return null;
  const s = parseTime(sunriseStr);
  const m = parseTime(maghribStr);
  if (!s || !m) return null;
  let diff = m.totalMinutes - s.totalMinutes;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return { totalMinutes: diff, hours, mins, label: `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}` };
}

export function getNextPrayerInfo() {
  const times = getPrayerTimesSync();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  for (const key of PRAYER_KEYS_ONLY) {
    const parsed = parseTime(times[key]);
    if (parsed && parsed.totalMinutes > nowMin) {
      const diff = parsed.totalMinutes - nowMin;
      const secs = diff * 60 - now.getSeconds();
      return {
        key,
        name: PRAYER_NAMES_AR[key],
        emoji: PRAYER_EMOJIS[key],
        time: times[key],
        minutesLeft: diff,
        secondsLeft: secs,
      };
    }
  }

  const fajr = parseTime(times.Fajr);
  if (fajr) {
    const diff = (24 * 60 - nowMin) + fajr.totalMinutes;
    return {
      key: 'Fajr',
      name: PRAYER_NAMES_AR.Fajr,
      emoji: PRAYER_EMOJIS.Fajr,
      time: times.Fajr,
      minutesLeft: diff,
      secondsLeft: diff * 60 - now.getSeconds(),
    };
  }

  return null;
}

export function isInProhibitionTime() {
  const times = getPrayerTimesSync();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const fajr = parseTime(times.Fajr);
  const sunrise = parseTime(times.Sunrise);
  const dhuhr = parseTime(times.Dhuhr);
  const asr = parseTime(times.Asr);
  const maghrib = parseTime(times.Maghrib);

  if (!fajr || !sunrise || !dhuhr || !asr || !maghrib) return false;

  // 1) After Fajr until Sunrise
  if (nowMin >= fajr.totalMinutes && nowMin < sunrise.totalMinutes) return true;
  // 2) At Sunrise (Sunrise to Sunrise + 15 min)
  if (nowMin >= sunrise.totalMinutes && nowMin < sunrise.totalMinutes + 15) return true;
  // 3) Before Dhuhr / Zwail (Dhuhr - 10 to Dhuhr)
  if (nowMin >= dhuhr.totalMinutes - 10 && nowMin < dhuhr.totalMinutes) return true;
  // 4) After Asr until Sunset (Maghrib)
  if (nowMin >= asr.totalMinutes && nowMin < maghrib.totalMinutes) return true;
  // 5) At Sunset (Maghrib - 15 to Maghrib)
  if (nowMin >= maghrib.totalMinutes - 15 && nowMin < maghrib.totalMinutes) return true;

  return false;
}

export function isWuduTime(minutesLeft) {
  return minutesLeft !== null && minutesLeft <= 5 && minutesLeft > 0;
}

function formatTimeFromMin(totalMin) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getProhibitionTimes() {
  const times = getPrayerTimesSync();
  const fajr = parseTime(times.Fajr);
  const sunrise = parseTime(times.Sunrise);
  const dhuhr = parseTime(times.Dhuhr);
  const asr = parseTime(times.Asr);
  const maghrib = parseTime(times.Maghrib);
  if (!fajr || !sunrise || !dhuhr || !asr || !maghrib) return [];

  return [
    {
      id: 'after-fajr',
      label: 'بعد الفجر إلى الشروق',
      start: formatTimeFromMin(fajr.totalMinutes),
      end: formatTimeFromMin(sunrise.totalMinutes),
      startMin: fajr.totalMinutes,
      endMin: sunrise.totalMinutes,
    },
    {
      id: 'at-sunrise',
      label: 'وقت الشروق',
      start: formatTimeFromMin(sunrise.totalMinutes),
      end: formatTimeFromMin(sunrise.totalMinutes + 15),
      startMin: sunrise.totalMinutes,
      endMin: sunrise.totalMinutes + 15,
    },
    {
      id: 'before-dhuhr',
      label: 'قبل الظهر (الزوال)',
      start: formatTimeFromMin(dhuhr.totalMinutes - 10),
      end: formatTimeFromMin(dhuhr.totalMinutes),
      startMin: dhuhr.totalMinutes - 10,
      endMin: dhuhr.totalMinutes,
    },
    {
      id: 'after-asr',
      label: 'بعد العصر إلى الغروب',
      start: formatTimeFromMin(asr.totalMinutes),
      end: formatTimeFromMin(maghrib.totalMinutes),
      startMin: asr.totalMinutes,
      endMin: maghrib.totalMinutes,
    },
    {
      id: 'at-sunset',
      label: 'وقت اصفرار الغروب',
      start: formatTimeFromMin(maghrib.totalMinutes - 15),
      end: formatTimeFromMin(maghrib.totalMinutes),
      startMin: maghrib.totalMinutes - 15,
      endMin: maghrib.totalMinutes,
    },
  ];
}

export function getCurrentProhibitionPeriod() {
  const times = getPrayerTimesSync();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const fajr = parseTime(times.Fajr);
  const sunrise = parseTime(times.Sunrise);
  const dhuhr = parseTime(times.Dhuhr);
  const asr = parseTime(times.Asr);
  const maghrib = parseTime(times.Maghrib);

  if (!fajr || !sunrise || !dhuhr || !asr || !maghrib) return null;

  if (nowMin >= fajr.totalMinutes && nowMin < sunrise.totalMinutes) {
    return { id: 'after-fajr', label: 'بعد الفجر إلى الشروق', endMin: sunrise.totalMinutes };
  }
  if (nowMin >= sunrise.totalMinutes && nowMin < sunrise.totalMinutes + 15) {
    return { id: 'at-sunrise', label: 'وقت الشروق', endMin: sunrise.totalMinutes + 15 };
  }
  if (nowMin >= dhuhr.totalMinutes - 10 && nowMin < dhuhr.totalMinutes) {
    return { id: 'before-dhuhr', label: 'قبل الظهر (الزوال)', endMin: dhuhr.totalMinutes };
  }
  if (nowMin >= asr.totalMinutes && nowMin < maghrib.totalMinutes) {
    return { id: 'after-asr', label: 'بعد العصر إلى الغروب', endMin: maghrib.totalMinutes };
  }
  if (nowMin >= maghrib.totalMinutes - 15 && nowMin < maghrib.totalMinutes) {
    return { id: 'at-sunset', label: 'وقت اصفرار الغروب', endMin: maghrib.totalMinutes };
  }

  return null;
}

export function getCities() {
  return CITIES_EGYPT;
}

export function setLocation(city, lat, lng, countryCode) {
  const methodName = getMethodNameForCountry(countryCode);
  localStorage.setItem('prayerLocation', JSON.stringify({ city, lat, lng, countryCode, methodName }));
  localStorage.removeItem('prayerTimesCache');
  window.dispatchEvent(new Event('prayerLocationChanged'));
}

export function setLocationByCoords(lat, lng, countryCode) {
  const methodName = getMethodNameForCountry(countryCode);
  localStorage.setItem('prayerLocation', JSON.stringify({ lat, lng, countryCode, methodName }));
  localStorage.removeItem('prayerTimesCache');
  window.dispatchEvent(new Event('prayerLocationChanged'));
}

export function getCurrentLocationName() {
  const settings = getLocationSettings();
  if (settings?.city) return settings.city;
  return null;
}

export function setManualPrayerTimes(times) {
  localStorage.setItem('manualPrayerTimes', JSON.stringify(times));
  localStorage.removeItem('prayerTimesCache');
  window.dispatchEvent(new Event('prayerLocationChanged'));
}

export function getManualPrayerTimes() {
  try {
    const raw = localStorage.getItem('manualPrayerTimes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function clearManualPrayerTimes() {
  localStorage.removeItem('manualPrayerTimes');
  localStorage.removeItem('prayerTimesCache');
  window.dispatchEvent(new Event('prayerLocationChanged'));
}

export function getHijriInfo() {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric', numberingSystem: 'latn'
    });
    const parts = formatter.formatToParts(new Date());
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448');
    return { day, month, year };
  } catch {
    return { day: 1, month: 1, year: 1448 };
  }
}

export function getHijriMonth() { return getHijriInfo().month; }
export function getHijriDay() { return getHijriInfo().day; }
export function isRamadan() { return getHijriMonth() === 9; }
export function isEid() {
  const { month, day } = getHijriInfo();
  return month === 10 && day <= 3;
}
export function isLastDayOfRamadan() {
  return getHijriMonth() === 9 && getHijriDay() >= 29;
}
export function getDaysUntilRamadan() {
  const { month, day } = getHijriInfo();
  if (month === 9) return 0;
  if (month < 9) return (9 - month) * 30 - day;
  return (12 - month + 9) * 30 - day;
}

// ─── MONTHLY CALENDAR ──────────────────────────────────────────
const MONTHLY_CALENDAR_CACHE_KEY = 'prayerMonthlyCalendar';
const MONTHLY_CALENDAR_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Islamic Jurisprudence Schools (Fiqh)
const ALADHAN_SCHOOL_MAP = {
  shafi: 0,
  maliki: 0,
  hanbali: 0,
  hanafi: 1,
};

export function getSchool() {
  return parseInt(localStorage.getItem('fiqhSchool') || '0'); // default: Shafi/Maliki/Hanbali
}

export function setSchool(schoolCode) {
  localStorage.setItem('fiqhSchool', schoolCode.toString());
}

export async function fetchMonthlyCalendar(lat, lng, year, month) {
  const method = getAladhanMethodId();
  const school = getSchool();
  const monthStr = String(month).padStart(2, '0');
  const url = `https://api.aladhan.com/v1/calendar/${year}/${monthStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== 200) return null;
    if (json.data) {
      json.data.forEach(day => {
        if (day.timings) {
          Object.keys(day.timings).forEach(k => {
            if (typeof day.timings[k] === 'string') {
              day.timings[k] = cleanTime(day.timings[k]);
            }
          });
        }
      });
    }
    return json.data;
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

export function getMonthlyPrayerTimesCached(lat, lng, year, month) {
  const cacheKey = `${MONTHLY_CALENDAR_CACHE_KEY}_${lat}_${lng}_${year}_${month}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < MONTHLY_CALENDAR_EXPIRY_MS) {
        return data;
      }
    }
  } catch {}
  return null;
}

export function setMonthlyPrayerTimesCache(lat, lng, year, month, data) {
  try {
    const cacheKey = `${MONTHLY_CALENDAR_CACHE_KEY}_${lat}_${lng}_${year}_${month}`;
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export async function getMonthlyPrayerTimes(lat, lng, year, month) {
  const cached = getMonthlyPrayerTimesCached(lat, lng, year, month);
  if (cached) return cached;
  const data = await fetchMonthlyCalendar(lat, lng, year, month);
  if (data) setMonthlyPrayerTimesCache(lat, lng, year, month, data);
  return data;
}

export function getHijriInfoFromApi(dayData) {
  try {
    if (dayData?.date?.hijri) {
      const h = dayData.date.hijri;
      return {
        day: parseInt(h.day),
        month: parseInt(h.month?.number),
        monthName: h.month?.ar,
        year: parseInt(h.year),
        weekday: h.weekday?.ar,
      };
    }
  } catch {}
  return null;
}

export function getIslamicHolidays(dayData) {
  try {
    if (dayData?.holidays && Array.isArray(dayData.holidays)) {
      return dayData.holidays.map(h => ({
        name: h.holiday,
        nameEn: h.en ?? h.holiday,
      }));
    }
  } catch {}
  return [];
}

// ─── IMSAK, MIDNIGHT, TAHAJJUD ─────────────────────────────────
export function getImsakTime(prayerTimes) {
  // Imsak = 10 minutes before Fajr (traditional calculation)
  const fajr = parseTime(prayerTimes.Fajr);
  if (!fajr) return null;
  const imsakMinutes = fajr.totalMinutes - 10;
  const h = Math.floor(imsakMinutes / 60) % 24;
  const m = imsakMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getMidnightTime(prayerTimes) {
  // Midnight = halfway between Maghrib and next Fajr
  const maghrib = parseTime(prayerTimes.Maghrib);
  const fajr = parseTime(prayerTimes.Fajr);
  if (!maghrib || !fajr) return null;
  let totalMin = maghrib.totalMinutes + 24 * 60;
  const diff = fajr.totalMinutes - maghrib.totalMinutes;
  const midMinutes = maghrib.totalMinutes + (diff > 0 ? diff : diff + 24 * 60) / 2;
  const h = Math.floor(midMinutes / 60) % 24;
  const m = midMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getFirstThirdTime(prayerTimes) {
  // First third = 1/3 of night after Maghrib
  const maghrib = parseTime(prayerTimes.Maghrib);
  const fajr = parseTime(prayerTimes.Fajr);
  if (!maghrib || !fajr) return null;
  const diff = fajr.totalMinutes - maghrib.totalMinutes;
  const nightLength = diff > 0 ? diff : diff + 24 * 60;
  const firstThird = maghrib.totalMinutes + nightLength / 3;
  const h = Math.floor(firstThird / 60) % 24;
  const m = firstThird % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getLastThirdTime(prayerTimes) {
  // Last third = 2/3 of night after Maghrib
  const maghrib = parseTime(prayerTimes.Maghrib);
  const fajr = parseTime(prayerTimes.Fajr);
  if (!maghrib || !fajr) return null;
  const diff = fajr.totalMinutes - maghrib.totalMinutes;
  const nightLength = diff > 0 ? diff : diff + 24 * 60;
  const lastThird = maghrib.totalMinutes + (nightLength * 2) / 3;
  const h = Math.floor(lastThird / 60) % 24;
  const m = lastThird % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── ISLAMIC HOLIDAYS CATEGORIES ──────────────────────────────
export const ISLAMIC_HOLIDAYS = [
  { month: 1, day: 1, name: 'رأس السنة الهجرية', nameEn: 'Islamic New Year' },
  { month: 1, day: 9, name: 'يوم عاشورة', nameEn: 'Day of Ashura' },
  { month: 3, day: 12, name: 'المولد النبوي', nameEn: 'Mawlid al-Nabi' },
  { month: 7, day: 27, name: 'الإسراء والمعراج', nameEn: 'Isra and Mi\'raj' },
  { month: 8, day: 15, name: 'ليلة النصف من شعبان', nameEn: 'Shab-e-Barat' },
  { month: 9, day: 1, name: 'بداية رمضان', nameEn: 'Start of Ramadan' },
  { month: 9, day: 27, name: 'ليلة القدر', nameEn: 'Laylat al-Qadr' },
  { month: 10, day: 1, name: 'عيد الفطر', nameEn: 'Eid al-Fitr' },
  { month: 12, day: 9, name: 'يوم عرفة', nameEn: 'Day of Arafah' },
  { month: 12, day: 10, name: 'عيد الأضحى', nameEn: 'Eid al-Adha' },
];

export async function lookupPostalCode(postalCode, countryCode) {
  const code = countryCode?.trim().toLowerCase() || 'us';
  const url = `https://api.zippopotam.us/${code}/${postalCode.trim()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) throw new Error('No place');
    return {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      city: place['place name'],
      state: place.state || '',
      country: data.country || '',
      countryCode: code.toUpperCase(),
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
