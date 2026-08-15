import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';
import { getPrayerTimesSync, parseTime, formatTime12h } from '../utils/prayer-times';

const qiyamCss = `
.qy-overlay{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:100vh;z-index:220;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);backdrop-filter:blur(12px)}
.qy-card{width:100%;max-width:360px;background:linear-gradient(160deg,#0a0520,#1a0a3a,#0d1b2a);border:1px solid rgba(139,92,246,.3);border-radius:28px;padding:36px 28px;text-align:center;position:relative;overflow:hidden;animation:qyIn .5s ease}
@keyframes qyIn{from{opacity:0;transform:scale(.85) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes qyGlow{0%,100%{box-shadow:0 0 30px rgba(139,92,246,.2)}50%{box-shadow:0 0 60px rgba(139,92,246,.4)}}
.qy-card{animation:qyIn .5s ease,qyGlow 3s ease infinite}
.qy-moon{font-size:64px;margin-bottom:16px;animation:qyFloat 3s ease-in-out infinite}
@keyframes qyFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.qy-title{font-size:22px;font-weight:800;color:#a78bfa;margin-bottom:8px}
.qy-sub{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px;line-height:1.7}
.qy-time{font-size:15px;font-weight:700;color:#f0b040;margin-bottom:6px;padding:8px 16px;background:rgba(240,176,64,.08);border:1px solid rgba(240,176,64,.2);border-radius:12px;display:inline-block}
.qy-hadith{font-family:'Amiri Quran',serif;font-size:1.05rem;line-height:2;color:rgba(255,255,255,.8);margin:16px 0;padding:12px;background:rgba(255,255,255,.03);border-radius:12px;border:1px solid rgba(255,255,255,.06)}
.qy-actions{display:flex;gap:10px;justify-content:center;margin-top:20px}
.qy-btn{padding:12px 24px;border-radius:14px;border:none;font-family:'Cairo',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px}
.qy-btn-speak{background:rgba(139,92,246,.15);color:#a78bfa;border:1px solid rgba(139,92,246,.3)}
.qy-btn-speak:hover{background:rgba(139,92,246,.25)}
.qy-btn-speak.speaking{background:rgba(239,68,68,.15);color:#ef4444;border-color:rgba(239,68,68,.3)}
.qy-btn-close{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08)}
.qy-btn-close:hover{background:rgba(255,255,255,.1);color:#fff}
`;

const QIYAM_HADITH = {
  text: 'أفضل الصلاة بعد المفروضة صلاة الليل',
  source: 'صحيح مسلم 1163',
};

function getLastThirdOfNight() {
  try {
    const times = getPrayerTimesSync();
    const isha = parseTime(times.Isha);
    const fajr = parseTime(times.Fajr);
    if (!isha || !fajr) return null;

    let nightStart = isha.totalMinutes;
    let nightEnd = fajr.totalMinutes;
    if (nightEnd <= nightStart) nightEnd += 24 * 60;

    const nightDuration = nightEnd - nightStart;
    const thirdDuration = nightDuration / 3;
    const lastThirdStart = nightEnd - thirdDuration;

    return {
      start: lastThirdStart,
      end: nightEnd,
      startFormatted: formatTime12h(`${Math.floor(lastThirdStart / 60) % 24}:${String(lastThirdStart % 60).padStart(2, '0')}`),
      endFormatted: times.Fajr,
    };
  } catch {
    return null;
  }
}

export default function QiyamNotification() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shown, setShown] = useState(false);

  const shouldShow = useCallback(() => {
    if (localStorage.getItem('qiyamEnabled') === 'false') return false;
    if (localStorage.getItem('sleepMode') === 'true') return false;
    if (shown) return false;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const lastThird = getLastThirdOfNight();
    if (!lastThird) return false;

    if (nowMin >= lastThird.start && nowMin <= lastThird.end) {
      return true;
    }
    return false;
  }, [shown]);

  useEffect(() => {
    const check = () => {
      if (shouldShow()) {
        setVisible(true);
        setShown(true);
        const autoSpeak = localStorage.getItem('qiyamAutoSpeak') !== 'false';
        if (autoSpeak) {
          setSpeaking(true);
          speakArabic(`${QIYAM_HADITH.text}. ${QIYAM_HADITH.source}. وقت قيام الليل`, () => setSpeaking(false));
        }
      }
    };

    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [shouldShow]);

  useEffect(() => {
    const resetShown = () => {
      const now = new Date();
      if (now.getHours() === 10 && now.getMinutes() === 0) {
        setShown(false);
      }
    };
    const iv = setInterval(resetShown, 60000);
    return () => clearInterval(iv);
  }, []);

  const handleClose = () => {
    stopSpeaking();
    setSpeaking(false);
    setVisible(false);
  };

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakArabic(`${QIYAM_HADITH.text}. ${QIYAM_HADITH.source}`, () => setSpeaking(false));
    }
  };

  return (
    <>
      <style>{qiyamCss}</style>
      <AnimatePresence>
        {visible && (
          <motion.div
            className="qy-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="qy-card"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="qy-moon">🌙</div>
              <div className="qy-title">{t.qiyam?.title || 'وقت قيام الليل'}</div>
              <div className="qy-sub">{t.qiyam?.subtitle || 'اللهم اجعلنا ممن يست.UseFont بليلك ويقوم لك'}</div>

              <div className="qy-time">
                🕐 {t.qiyam?.lastThird || 'آخر ثلث الليل'} — {getLastThirdOfNight()?.startFormatted || ''}
              </div>

              <div className="qy-hadith">
                «{QIYAM_HADITH.text}»
                <div style={{ fontSize: 11, color: '#f0b040', marginTop: 8 }}>📖 {QIYAM_HADITH.source}</div>
              </div>

              <div className="qy-actions">
                <button className={`qy-btn qy-btn-speak ${speaking ? 'speaking' : ''}`} onClick={toggleSpeak}>
                  {speaking ? '⏹️' : '🔊'} {speaking ? (t.qiyam?.stop || 'إيقاف') : (t.qiyam?.listen || 'استمع')}
                </button>
                <button className="qy-btn qy-btn-close" onClick={handleClose}>
                  {t.qiyam?.close || '✕ إغلاق'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
