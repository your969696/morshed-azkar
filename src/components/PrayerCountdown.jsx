import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';
import { speakArabic, stopSpeaking } from '../utils/sound';
import {
  getPrayerTimesSync,
  getNextPrayerInfo,
  isInProhibitionTime,
  isWuduTime,
  PRAYER_KEYS,
  PRAYER_NAMES_AR,
  PRAYER_EMOJIS,
  formatTime12h,
  getCurrentLocationName,
  isRamadan,
  isEid,
  isLastDayOfRamadan,
  parseTime,
} from '../utils/prayer-times';

const countdownCss = `
@keyframes cdFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cdWuduWave{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
@keyframes cdPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.3)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}

.pcd-bar{position:sticky;top:0;z-index:120;padding:8px 12px;animation:cdFadeIn .3s ease;direction:rtl}
.pcd-card{border-radius:14px;overflow:hidden;display:flex;align-items:center;gap:10px;padding:8px 12px;min-height:44px;position:relative}
.pcd-card-normal{background:linear-gradient(135deg,var(--bg-card),rgba(0,200,150,.08));border:1px solid var(--border-card)}
.pcd-card-wudu{background:linear-gradient(135deg,rgba(0,200,150,.92),rgba(16,185,129,.95));border:1px solid rgba(255,255,255,.2)}
.pcd-card-prayer{background:linear-gradient(135deg,rgba(139,92,246,.92),rgba(109,40,217,.95));border:1px solid rgba(255,255,255,.2)}
.pcd-card-prohibition{background:linear-gradient(135deg,rgba(239,68,68,.88),rgba(220,38,38,.92));border:1px solid rgba(255,255,255,.2);animation:cdPulse 2s ease infinite}
.pcd-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.pcd-icon-normal{background:rgba(0,200,150,.1)}
.pcd-icon-wudu{background:rgba(255,255,255,.2);animation:cdWuduWave 1.5s ease infinite}
.pcd-icon-prayer{background:rgba(255,255,255,.2)}
.pcd-icon-prohibition{background:rgba(255,255,255,.2)}
.pcd-body{flex:1;min-width:0;display:flex;align-items:center;gap:8px}
.pcd-label{font-size:10px;font-weight:700;color:var(--text-muted);white-space:nowrap}
.pcd-card-wudu .pcd-label,.pcd-card-prayer .pcd-label,.pcd-card-prohibition .pcd-label{color:rgba(255,255,255,.9)}
.pcd-time{font-size:16px;font-weight:800;color:var(--accent-green);letter-spacing:1px;white-space:nowrap;font-variant-numeric:tabular-nums}
.pcd-card-wudu .pcd-time,.pcd-card-prayer .pcd-time,.pcd-card-prohibition .pcd-time{color:#fff}
.pcd-name{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(0,200,150,.1);color:var(--accent-green);white-space:nowrap}
.pcd-card-wudu .pcd-name{background:rgba(255,255,255,.2);color:#fff}
.pcd-card-prayer .pcd-name{background:rgba(255,255,255,.2);color:#fff}
.pcd-chips{display:flex;gap:4px;flex-wrap:nowrap;overflow-x:auto;flex:1;min-width:0;direction:rtl}
.pcd-chip{padding:2px 6px;border-radius:5px;font-size:9px;font-weight:700;white-space:nowrap;background:rgba(255,255,255,.06);color:var(--text-muted);flex-shrink:0}
.pcd-chip-active{background:rgba(0,200,150,.15);color:var(--accent-green)}
.pcd-card-wudu .pcd-chip{background:rgba(255,255,255,.12);color:rgba(255,255,255,.8)}
.pcd-card-wudu .pcd-chip-active{background:rgba(255,255,255,.25);color:#fff}
.pcd-card-prayer .pcd-chip{background:rgba(255,255,255,.12);color:rgba(255,255,255,.8)}
.pcd-card-prayer .pcd-chip-active{background:rgba(255,255,255,.25);color:#fff}
.pcd-close{width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.7);font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.pcd-close:hover{background:rgba(255,255,255,.2)}
.pcd-card-normal .pcd-close{background:var(--bg-primary);color:var(--text-muted)}
.pcd-card-normal .pcd-close:hover{background:var(--bg-card-hover)}
.pcd-progress{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.1)}
.pcd-card-normal .pcd-progress{background:var(--border-color)}
.pcd-progress-fill{height:100%;background:rgba(255,255,255,.6);transition:width 1s linear}
.pcd-card-normal .pcd-progress-fill{background:var(--accent-green)}


`;

function formatCountdown(seconds, t) {
  if (seconds <= 0) return t?.prayerCountdown?.timeUp || 'حان الوقت!';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function PrayerCountdown() {
  const { t } = useTranslation();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const countdownWindowShownRef = useRef(false);
  const [countdownOverlay, setCountdownOverlay] = useState(null);
  const [wuduShown, setWuduShown] = useState(false);
  const [khushuShown, setKhushuShown] = useState(false);
  const khushuRef = useRef(false);
  const [namesShown, setNamesShown] = useState(false);
  const namesRef = useRef(false);
  const [isProhibition, setIsProhibition] = useState(false);
  const [allPrayers, setAllPrayers] = useState({});
  const [adhanPlayed, setAdhanPlayed] = useState(false);
  const adhanPlayedSetRef = useRef(new Set());
  const [mesaharatiShown, setMesaharatiShown] = useState(false);
  const mesaharatiRef = useRef(false);
  const [quranShown, setQuranShown] = useState(false);
  const quranRef = useRef(false);
  const [takbeerShown, setTakbeerShown] = useState(false);
  const takbeerRef = useRef(false);
  const [morningAzkarShown, setMorningAzkarShown] = useState(false);
  const morningAzkarRef = useRef(false);
  const [eveningAzkarShown, setEveningAzkarShown] = useState(false);
  const eveningAzkarRef = useRef(false);
  const [notificationsPaused, setNotificationsPaused] = useState(() => localStorage.getItem('notificationsPaused') === 'true');
  const qiyamRef = useRef(false);
  const [qiyamShown, setQiyamShown] = useState(false);
  const [suhoorShown, setSuhoorShown] = useState(false);
  const suhoorRef = useRef(false);
  const [imsakShown, setImsakShown] = useState(false);
  const imsakRef = useRef(false);
  const [iftarSunanShown, setIftarSunanShown] = useState(false);
  const iftarSunanRef = useRef(false);
  const [cannonShown, setCannonShown] = useState(false);
  const cannonRef = useRef(false);
  const wuduShownRef = useRef(false);
  const quranAutoPlayedRef = useRef(new Set());
  const fridayKahfRef = useRef(false);
  const perPrayerQuranRef = useRef(new Set());



  useEffect(() => {
    const handler = (e) => setNotificationsPaused(e.detail.paused);
    window.addEventListener('notificationsPausedChanged', handler);
    return () => window.removeEventListener('notificationsPausedChanged', handler);
  }, []);

  const isQuietHours = useCallback(() => {
    const enabled = localStorage.getItem('quietHoursEnabled') === 'true';
    if (!enabled) return false;
    const start = localStorage.getItem('quietHoursStart') || '21:00';
    const end = localStorage.getItem('quietHoursEnd') || '04:00';
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (startMin <= endMin) {
      return nowMin >= startMin && nowMin <= endMin;
    } else {
      return nowMin >= startMin || nowMin <= endMin;
    }
  }, []);

  const update = useCallback(() => {
    try {
      const countdownEnabled = localStorage.getItem('prayerCountdownEnabled');
      if (countdownEnabled === 'false') {
        setShowCountdown(false);
        return;
      }

      const times = getPrayerTimesSync();
      setAllPrayers(times);
      setIsProhibition(isInProhibitionTime());

      let next = getNextPrayerInfo();

      if (!next) return;

      setNextPrayer(next);
      setCountdown(formatCountdown(next.secondsLeft, t));

      // ═══ PHASE 1: العداد حسب مدة كل صلاة ═══
      let perPrayerCd = 1;
      try { perPrayerCd = JSON.parse(localStorage.getItem('perPrayerCountdown') || '{}')[next.key] || 1; } catch { perPrayerCd = 1; }
      const countdownSec = perPrayerCd * 60;
      const shouldShowCountdown = next.secondsLeft <= countdownSec && next.secondsLeft > 0;
      setShowCountdown(shouldShowCountdown);

      // افتح نافذة العداد مرة واحدة عند بداية العد
      if (next.secondsLeft <= countdownSec && next.secondsLeft > 0 && !countdownWindowShownRef.current) {
        countdownWindowShownRef.current = true;
        const prayerTimeStr = next.time || allPrayers[next.key] || '--:--';
        const cleanT = prayerTimeStr.replace(/\s*\(.*?\)\s*/g, '').trim();
        const m2 = cleanT.match(/(\d{1,2}):(\d{2})/);
        const targetSec = m2 ? (parseInt(m2[1], 10) * 3600 + parseInt(m2[2], 10) * 60) : 0;
        window.electronAPI?.showCountdownWindow?.({
          prayerName: next.key,
          prayerNameAr: next.name,
          prayerTime: prayerTimeStr,
          targetSec: targetSec,
          playBeep: true,
        });
      }

      // ═══ PHASE 2: الأذان + كارت التنبيه (عند 0) ═══
      const now = new Date();
      const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const inQuiet = isQuietHours();
      const paused = localStorage.getItem('notificationsPaused') === 'true';
      const allowNotif = !inQuiet && !paused;
      const adhanPrayers = PRAYER_KEYS.filter(k => k !== 'Sunrise');
      const todayKey = new Date().toDateString();
      const adhanPlayedToday = localStorage.getItem('adhanPlayedToday');
      if (adhanPlayedToday !== todayKey) {
        localStorage.removeItem('adhanPlayedToday');
        adhanPlayedSetRef.current.clear();
      }
      for (const key of adhanPrayers) {
        const parts = (times[key] || '').split(':').map(Number);
        const prayerSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
        const diff = nowSec - prayerSec;

        if (diff >= 0 && diff <= 600 && !adhanPlayedSetRef.current.has(key)) {
          const prayedKey = `adhan_${key}_${todayKey}`;
          if (localStorage.getItem(prayedKey)) { adhanPlayedSetRef.current.add(key); continue; }

          adhanPlayedSetRef.current.add(key);
          setAdhanPlayed(true);
          localStorage.setItem('adhanPlayedToday', todayKey);
          localStorage.setItem(prayedKey, '1');

          const enabled = localStorage.getItem('adhanEnabled');
          let perPrayerEnabled = true;
          try { perPrayerEnabled = JSON.parse(localStorage.getItem('perPrayerAdhan') || '{}')[key] !== false; } catch { perPrayerEnabled = true; }
          if (enabled !== 'false' && perPrayerEnabled && allowNotif) {
            // أغلق نافذة العداد أولاً
            countdownWindowShownRef.current = false;
            window.electronAPI?.hideCountdownWindow?.();

            // شغّل الأذان
            try {
              const perVoice = JSON.parse(localStorage.getItem('perPrayerVoice') || '{}');
              const perDua = JSON.parse(localStorage.getItem('perPrayerDua') || '{}');
              window.dispatchEvent(new CustomEvent('prayerTimeArrived', { detail: { key, name: PRAYER_NAMES_AR[key], voice: perVoice[key] || 'makkah', dua: perDua[key] !== false } }));
            } catch {
              window.dispatchEvent(new CustomEvent('prayerTimeArrived', { detail: { key, name: PRAYER_NAMES_AR[key] } }));
            }
            if (window.electronAPI?.showMainWindow) {
              window.electronAPI.showMainWindow();
            }
          }
        }
      }

      if (next.secondsLeft > countdownSec) {
        setAdhanPlayed(false);
      }

      if (next.secondsLeft <= 0 && !khushuRef.current) {
        khushuRef.current = true;
        setKhushuShown(true);
      }
      if (next.secondsLeft > 120) {
        khushuRef.current = false;
        setKhushuShown(false);
      }

      if (next.secondsLeft <= countdownSec && next.secondsLeft > 0 && !wuduShownRef.current) {
        wuduShownRef.current = true;
        setWuduShown(true);
      }
      if (next.secondsLeft > 120) {
        wuduShownRef.current = false;
        setWuduShown(false);
      }

      // ═══ قراءة قرآن قبل كل صلاة ═══
      try {
        const perQuran = JSON.parse(localStorage.getItem('perPrayerQuran') || '{}');
        const perQuranDur = JSON.parse(localStorage.getItem('perPrayerQuranDuration') || '{}');
        const quranFiredKey = 'quranBeforePrayer_' + todayKey;
        const quranFired = JSON.parse(localStorage.getItem(quranFiredKey) || '[]');
        for (const pk of PRAYER_KEYS.filter(k => k !== 'Sunrise')) {
          if (perQuran[pk] && times[pk] && !quranFired.includes(pk)) {
            const parts = (times[pk] || '').split(':').map(Number);
            if (parts.length === 2) {
              const prayerSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
              const quranMins = perQuranDur[pk] || 15;
              const quranStart = prayerSec - quranMins * 60;
              if (nowSec >= quranStart && nowSec < prayerSec) {
                quranFired.push(pk);
                localStorage.setItem(quranFiredKey, JSON.stringify(quranFired));
                if (allowNotif) {
                  window.dispatchEvent(new CustomEvent('quranBeforePrayer', { detail: { key: pk, name: PRAYER_NAMES_AR[pk], duration: quranMins } }));
                }
              }
            }
          }
        }
      } catch {}

      const asrParts = (times.Asr || '').split(':').map(Number);
      const maghribParts = (times.Maghrib || '').split(':').map(Number);
      if (asrParts.length === 2 && maghribParts.length === 2) {
        const asrSec = (asrParts[0] || 0) * 3600 + (asrParts[1] || 0) * 60;
        const maghribSec = (maghribParts[0] || 0) * 3600 + (maghribParts[1] || 0) * 60;
        if (nowSec >= asrSec + 300 && nowSec <= maghribSec - 300 && !namesRef.current) {
          namesRef.current = true;
          setNamesShown(true);
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('namesOfAllahTime'));
          }
        }
      }

      const ramadanStartDate = localStorage.getItem('ramadanStartDate');
      const ramadanEndDate = localStorage.getItem('ramadanEndDate');
      const today = new Date().toISOString().split('T')[0];

      // تلقائي: استخدم الشهر الهجري. يدوي: لو التاريخ مختلف عدّله من الإعدادات
      const isInRamadanPeriod = (ramadanStartDate && ramadanEndDate && today >= ramadanStartDate && today <= ramadanEndDate) || isRamadan();

      if (isInRamadanPeriod) {
        const fajrParts = (times.Fajr || '').split(':').map(Number);
        if (fajrParts.length === 2) {
          const fajrSec = (fajrParts[0] || 0) * 3600 + (fajrParts[1] || 0) * 60;
          const diffFajr = fajrSec - nowSec;
          if (diffFajr >= 1680 && diffFajr <= 1800 && !mesaharatiRef.current) {
            mesaharatiRef.current = true;
            setMesaharatiShown(true);
            window.dispatchEvent(new CustomEvent('mesaharatiTime'));
          }
          if (diffFajr > 1800) { mesaharatiRef.current = false; setMesaharatiShown(false); }

          // Suhoor: 45 min before Fajr (2700 sec)
          if (diffFajr >= 2700 && diffFajr <= 2820 && !suhoorRef.current) {
            suhoorRef.current = true;
            setSuhoorShown(true);
            if (allowNotif) {
              window.dispatchEvent(new CustomEvent('ramadanSuhoorTime'));
            }
          }
          if (diffFajr > 2820) { suhoorRef.current = false; setSuhoorShown(false); }

          // Imsak: 10 min before Fajr (600 sec)
          if (diffFajr >= 600 && diffFajr <= 720 && !imsakRef.current) {
            imsakRef.current = true;
            setImsakShown(true);
            if (allowNotif) {
              window.dispatchEvent(new CustomEvent('ramadanImsakTime'));
            }
          }
          if (diffFajr > 720) { imsakRef.current = false; setImsakShown(false); }

          // Qiyam: 1 hour before Fajr (3600 sec)
          if (diffFajr >= 3600 && diffFajr <= 3720 && !qiyamRef.current) {
            qiyamRef.current = true;
            setQiyamShown(true);
            if (allowNotif) {
              window.dispatchEvent(new CustomEvent('ramadanQiyamTime'));
            }
          }
          if (diffFajr > 3720) { qiyamRef.current = false; setQiyamShown(false); }
        }

        if (maghribParts.length === 2) {
          const maghribSec = (maghribParts[0] || 0) * 3600 + (maghribParts[1] || 0) * 60;
          const diffMaghrib = maghribSec - nowSec;
          const quranEnabled = localStorage.getItem('quranBeforeMaghrib') !== 'false';
          const quranMin = parseInt(localStorage.getItem('quranBeforeMaghribMin') || '15');
          const quranStartSec = quranMin * 60;
          if (quranEnabled && diffMaghrib >= 0 && diffMaghrib <= quranStartSec && diffMaghrib > 60 && !quranRef.current) {
            quranRef.current = true;
            setQuranShown(true);
            window.dispatchEvent(new CustomEvent('quranBeforeMaghrib'));
          }
          if (diffMaghrib > quranStartSec || diffMaghrib <= 60) { quranRef.current = false; setQuranShown(false); }

          // Iftar Sunan: 15 min before Maghrib (900 sec)
          if (diffMaghrib >= 900 && diffMaghrib <= 1020 && !iftarSunanRef.current) {
            iftarSunanRef.current = true;
            setIftarSunanShown(true);
            if (allowNotif) {
              window.dispatchEvent(new CustomEvent('ramadanIftarSunanTime'));
            }
          }
          if (diffMaghrib > 1020) { iftarSunanRef.current = false; setIftarSunanShown(false); }

          // Cannon: 5-9 sec before Maghrib ( Ramadan only)
          if (diffMaghrib >= 5 && diffMaghrib <= 9 && !cannonRef.current) {
            cannonRef.current = true;
            setCannonShown(true);
            if (allowNotif) {
              window.dispatchEvent(new CustomEvent('ramadanCannonTime'));
            }
          }
          if (diffMaghrib > 10) { cannonRef.current = false; setCannonShown(false); }
        }
      }

      // ═══════════════════════════════════════════════════
      // Monday/Thursday cannon (outside Ramadan)
      // ═══════════════════════════════════════════════════
      const cannonEnabled = localStorage.getItem('cannonEnabled') === 'true';
      const dayOfWeek = new Date().getDay();
      const isMonOrThu = dayOfWeek === 1 || dayOfWeek === 4;
      if (cannonEnabled && isMonOrThu && !isInRamadanPeriod && maghribParts.length === 2) {
        const mSec = (maghribParts[0] || 0) * 3600 + (maghribParts[1] || 0) * 60;
        const dMaghrib = mSec - nowSec;
        if (dMaghrib >= 5 && dMaghrib <= 9 && !cannonRef.current) {
          cannonRef.current = true;
          setCannonShown(true);
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('ramadanCannonTime'));
          }
        }
        if (dMaghrib > 10) { cannonRef.current = false; setCannonShown(false); }
      }

      // ═══ أوقات القرآن المتعددة ═══
      const quranAutoTimesStr = localStorage.getItem('quranAutoTimes');
      let quranAutoTimes = [];
      try { quranAutoTimes = JSON.parse(quranAutoTimesStr || '[]'); } catch {}
      const todayDateKey = new Date().toDateString();
      for (const qt of quranAutoTimes) {
        if (!qt.time) continue;
        const [qh, qm] = qt.time.split(':').map(Number);
        const quranStartSec = qh * 3600 + qm * 60;
        const quranEndSec = quranStartSec + (qt.duration || 30) * 60;
        const autoKey = `quran_${qt.time}_${todayDateKey}`;
        if (nowSec >= quranStartSec && nowSec < quranEndSec && !quranAutoPlayedRef.current.has(autoKey)) {
          quranAutoPlayedRef.current.add(autoKey);
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('quranAutoPlay', { detail: { surah: qt.surah || 'random', duration: qt.duration || 30 } }));
          }
        }
        if (nowSec >= quranEndSec) { quranAutoPlayedRef.current.delete(autoKey); }
      }

      // ═══ سورة الكهف يوم الجمعة ═══
      const fridayKahfEnabled = localStorage.getItem('quranFridayKahf') !== 'false';
      const fridayKahfTime = localStorage.getItem('quranFridayKahfTime') || '10:00';
      if (fridayKahfEnabled && dayOfWeek === 5) {
        const [fh, fm] = fridayKahfTime.split(':').map(Number);
        const kahfStartSec = fh * 3600 + fm * 60;
        const maghribSecKahf = maghribParts.length === 2 ? (maghribParts[0] || 0) * 3600 + (maghribParts[1] || 0) * 60 : 0;
        const kahfKey = `kahf_${todayDateKey}`;
        if (nowSec >= kahfStartSec && nowSec < maghribSecKahf && maghribSecKahf > 60 && !fridayKahfRef.current) {
          fridayKahfRef.current = true;
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('quranAutoPlay', { detail: { surah: 'kahf', duration: 999 } }));
          }
        }
        if (nowSec >= maghribSecKahf || nowSec < kahfStartSec) { fridayKahfRef.current = false; }
      }

      // Morning azkar: Fajr → Sunrise (fires once when entering the window)
      const fajrPartsAz = (times.Fajr || '').split(':').map(Number);
      const sunrisePartsAz = (times.Sunrise || '').split(':').map(Number);
      if (fajrPartsAz.length === 2 && sunrisePartsAz.length === 2) {
        const fajrSecAz = (fajrPartsAz[0] || 0) * 3600 + (fajrPartsAz[1] || 0) * 60;
        const sunriseSecAz = (sunrisePartsAz[0] || 0) * 3600 + (sunrisePartsAz[1] || 0) * 60;
        const inMorningWindow = nowSec >= fajrSecAz && nowSec <= sunriseSecAz;
        if (inMorningWindow && !morningAzkarRef.current) {
          morningAzkarRef.current = true;
          setMorningAzkarShown(true);
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('morningAzkarTime'));
          }
        }
        if (!inMorningWindow && nowSec > sunriseSecAz) {
          morningAzkarRef.current = false;
          setMorningAzkarShown(false);
        }
      }

      // Evening azkar: Asr → Maghrib (fires once when entering the window)
      if (asrParts.length === 2 && maghribParts.length === 2) {
        const asrSecAz = (asrParts[0] || 0) * 3600 + (asrParts[1] || 0) * 60;
        const maghribSecAz = (maghribParts[0] || 0) * 3600 + (maghribParts[1] || 0) * 60;
        const inEveningWindow = nowSec >= asrSecAz && nowSec <= maghribSecAz;
        if (inEveningWindow && !eveningAzkarRef.current) {
          eveningAzkarRef.current = true;
          setEveningAzkarShown(true);
          if (allowNotif) {
            window.dispatchEvent(new CustomEvent('eveningAzkarTime'));
          }
        }
        if (!inEveningWindow && nowSec > maghribSecAz) {
          eveningAzkarRef.current = false;
          setEveningAzkarShown(false);
        }
      }

      // Qiyam al-Layl notification
      const qiyamEnabled = localStorage.getItem('qiyamEnabled') === 'true';
      if (qiyamEnabled) {
        const qiyamTime = localStorage.getItem('qiyamTime') || '02:00';
        const [qh, qm] = qiyamTime.split(':').map(Number);
        const qiyamSec = qh * 3600 + qm * 60;
        const diff = nowSec - qiyamSec;
        if (diff >= 0 && diff <= 120 && !qiyamRef.current) {
          qiyamRef.current = true;
          setQiyamShown(true);
          if (!paused) {
            window.dispatchEvent(new CustomEvent('qiyamTime', { detail: { time: qiyamTime } }));
          }
        }
        if (diff > 120) { qiyamRef.current = false; setQiyamShown(false); }
      }

      if (isLastDayOfRamadan() || isEid()) {
        const fajrParts = (times.Fajr || '').split(':').map(Number);
        const dhuhrParts = (times.Dhuhr || '').split(':').map(Number);
        const maghribParts2 = (times.Maghrib || '').split(':').map(Number);
        const prayerSecs = [
          fajrParts.length === 2 ? (fajrParts[0] * 3600 + fajrParts[1] * 60) : null,
          dhuhrParts.length === 2 ? (dhuhrParts[0] * 3600 + dhuhrParts[1] * 60) : null,
          maghribParts2.length === 2 ? (maghribParts2[0] * 3600 + maghribParts2[1] * 60) : null,
        ].filter(Boolean);
        for (const pSec of prayerSecs) {
          const diff = nowSec - pSec;
          if (diff >= 0 && diff <= 120 && !takbeerRef.current) {
            takbeerRef.current = true;
            setTakbeerShown(true);
            window.dispatchEvent(new CustomEvent('takbeerTime'));
            break;
          }
        }
        if (prayerSecs.every(p => nowSec - p > 120)) { takbeerRef.current = false; setTakbeerShown(false); }
      }
    } catch {}
  }, []);

  useEffect(() => {
    update();
    const timer = setInterval(update, 1000);
    const onVisibility = () => { if (document.visibilityState === 'visible') update(); };
    document.addEventListener('visibilitychange', onVisibility);
    const onWake = () => { update(); };
    window.electronAPI?.onSystemWake?.(onWake);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.electronAPI?.removeAllListeners?.('system-wake');
    };
  }, [update]);

  useEffect(() => {
    const iv = setInterval(() => {
      setWuduShown(false);
      setKhushuShown(false);
      setMesaharatiShown(false);
      setQuranShown(false);
      setTakbeerShown(false);
      setMorningAzkarShown(false);
      setEveningAzkarShown(false);
      setSuhoorShown(false);
      setImsakShown(false);
      setIftarSunanShown(false);
      setCannonShown(false);
      khushuRef.current = false;
      mesaharatiRef.current = false;
      quranRef.current = false;
      takbeerRef.current = false;
      suhoorRef.current = false;
      imsakRef.current = false;
      iftarSunanRef.current = false;
      cannonRef.current = false;
      update();
    }, 60000);
    return () => clearInterval(iv);
  }, [update]);

  const lastSentPrayersRef = useRef('');

  useEffect(() => {
    const handler = () => {
      if (allPrayers && Object.keys(allPrayers).length > 0) {
        const serialized = JSON.stringify(allPrayers);
        if (serialized !== lastSentPrayersRef.current) {
          lastSentPrayersRef.current = serialized;
          window.electronAPI?.sendPrayerData?.(allPrayers);
        }
      }
    };
    window.electronAPI?.onRequestPrayerData?.(handler);
    return () => window.electronAPI?.removeAllListeners?.('request-prayer-data');
  }, [allPrayers]);

  if (dismissed || !nextPrayer) return null;

  const wuduActive = isWuduTime(nextPrayer.minutesLeft);
  const prayerTime = nextPrayer.secondsLeft <= 0;
  const prohibit = isProhibition;

  const cardClass = prohibit ? 'pcd-card-prohibition' : wuduActive ? 'pcd-card-wudu' : prayerTime ? 'pcd-card-prayer' : 'pcd-card-normal';
  const iconClass = prohibit ? 'pcd-icon-prohibition' : wuduActive ? 'pcd-icon-wudu' : prayerTime ? 'pcd-icon-prayer' : 'pcd-icon-normal';

  const progress = nextPrayer ? Math.max(0, Math.min(100, ((30 - (nextPrayer.minutesLeft || 0)) / 30) * 100)) : 0;

  const city = getCurrentLocationName();

  return (
    <>
      <style>{countdownCss}</style>
      <div className="pcd-bar">
        <div className={`pcd-card ${cardClass}`}>
          <div className={`pcd-icon ${iconClass}`}>
            {prohibit ? '⛔' : wuduActive ? '🫧' : nextPrayer.emoji || '🕌'}
          </div>
          <div className="pcd-body">
            {prohibit ? (
              <>
                <span className="pcd-label">{t?.prayerCountdown?.prohibitionTime || 'وقت النهي'}</span>
                <div className="pcd-chips">
                  {PRAYER_KEYS.filter(k => k !== 'Sunrise').map(k => (
                    <span key={k} className={`pcd-chip ${k === nextPrayer.key ? 'pcd-chip-active' : ''}`}>
                      {PRAYER_EMOJIS[k]} {PRAYER_NAMES_AR[k]} {formatTime12h(allPrayers[k])}
                    </span>
                  ))}
                  {city && <span className="pcd-chip">📍 {city}</span>}
                </div>
              </>
            ) : (
              <>
                <span className="pcd-label">{prayerTime ? '🕐' : wuduActive ? '🫧' : '⏰'}</span>
                <span className="pcd-time">{countdown}</span>
                <span className="pcd-name">{nextPrayer.emoji} {nextPrayer.name}</span>
                <div className="pcd-chips">
                  {PRAYER_KEYS.filter(k => k !== 'Sunrise').map(k => (
                    <span key={k} className={`pcd-chip ${k === nextPrayer.key ? 'pcd-chip-active' : ''}`}>
                      {PRAYER_NAMES_AR[k]} {formatTime12h(allPrayers[k])}
                    </span>
                  ))}
                  {city && <span className="pcd-chip">📍 {city}</span>}
                </div>
              </>
            )}
          </div>
          <button className="pcd-close" onClick={() => { setDismissed(true); stopSpeaking(); }}>✕</button>
          <div className="pcd-progress">
            <div className="pcd-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

    </>
  );
}
