import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';
import { hourlyHadiths as allHourlyHadiths } from '../data/hourly-hadiths';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const hourlyHadiths = allHourlyHadiths.filter(h => !getDeletedIds('deletedHadithsIds').includes(h.id));

const INTERVAL_MAP = {
  15: 15 * 60 * 1000,
  30: 30 * 60 * 1000,
  60: 60 * 60 * 1000,
  90: 90 * 60 * 1000,
  120: 120 * 60 * 1000,
};

const notifCss = `
.hn-overlay{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:100vh;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px)}
.hn-card{width:100%;max-width:380px;background:linear-gradient(145deg,var(--bg-card),#1a1030);border:2px solid rgba(255,255,255,0.08);border-radius:24px;padding:28px 24px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
.hn-close{position:absolute;top:12px;left:12px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:var(--text-muted);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
.hn-close:hover{background:rgba(255,255,255,0.15);color:var(--text-primary)}
.hn-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(240,176,64,0.1);border:1px solid rgba(240,176,64,0.2);border-radius:20px;padding:5px 14px;margin-bottom:16px}
.hn-badge span{font-size:11px;color:#f0b040;font-weight:700}
.hn-category{font-size:13px;color:var(--accent-green);font-weight:700;margin-bottom:12px}
.hn-text{font-family:'Amiri Quran',serif;font-size:1.15rem;line-height:2;color:var(--text-primary);text-align:center;margin-bottom:16px}
.hn-source{font-size:11px;color:var(--text-muted);text-align:center;margin-bottom:20px}
.hn-source strong{color:#f0b040}
.hn-actions{display:flex;gap:10px;justify-content:center}
.hn-btn{padding:10px 20px;border-radius:14px;border:none;font-family:'Cairo',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}
.hn-btn-speak{background:rgba(0,200,150,0.15);color:#00c896;border:1px solid rgba(0,200,150,0.3)}
.hn-btn-speak:hover{background:rgba(0,200,150,0.25)}
.hn-btn-speak.speaking{background:rgba(239,68,68,0.15);color:#ef4444;border-color:rgba(239,68,68,0.3)}
.hn-btn-detail{background:rgba(139,92,246,0.15);color:#8b5cf6;border:1px solid rgba(139,92,246,0.3)}
.hn-btn-detail:hover{background:rgba(139,92,246,0.25)}
.hn-timer{position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--text-muted);white-space:nowrap}
`;

export default function HadithNotification() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [lastIndex, setLastIndex] = useState(-1);
  const navigate = useNavigate();

  const pickRandom = useCallback(() => {
    if (localStorage.getItem('sleepMode') === 'true') return;
    if (window.__namesPlaybackActive) return;
    let idx;
    do { idx = Math.floor(Math.random() * hourlyHadiths.length); } while (idx === lastIndex && hourlyHadiths.length > 1);
    setLastIndex(idx);
    setCurrent(hourlyHadiths[idx]);
    setVisible(true);
  }, [lastIndex]);

  useEffect(() => {
    if (localStorage.getItem('hadithNotificationsEnabled') === null) {
      localStorage.setItem('hadithNotificationsEnabled', 'true');
    }
    const enabled = localStorage.getItem('hadithNotificationsEnabled') !== 'false';
    if (!enabled) return;
    const intervalMin = parseInt(localStorage.getItem('hadithInterval') || '30');
    const ms = INTERVAL_MAP[intervalMin] || INTERVAL_MAP[30];

    if (window.electronAPI?.isElectron) {
      window.electronAPI.setReminderInterval('hadith', ms, true);
      window.electronAPI.onHadithReminder(() => { pickRandom(); });
      const onWake = () => { window.electronAPI.setReminderInterval('hadith', ms, true); };
      window.electronAPI.onSystemWake?.(onWake);
      return () => { window.electronAPI.stopReminders('hadith'); window.electronAPI.removeAllListeners('hadith-reminder'); window.electronAPI.removeAllListeners?.('system-wake'); };
    }

    const timer = setInterval(() => pickRandom(), ms);
    return () => clearInterval(timer);
  }, [pickRandom]);

  useEffect(() => {
    if (visible) {
      if (localStorage.getItem('hadithAutoSpeak') === null) {
        localStorage.setItem('hadithAutoSpeak', 'true');
      }
      const autoSpeak = localStorage.getItem('hadithAutoSpeak') !== 'false';
      if (autoSpeak && current?.text) {
        setSpeaking(true);
        speakArabic(current.text, () => {
          setSpeaking(false);
          setVisible(false);
        });
      }
    }
  }, [visible, current]);

  const handleClose = () => {
    stopSpeaking();
    setSpeaking(false);
    setVisible(false);
  };

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else if (current?.text) {
      setSpeaking(true);
      speakArabic(current.text);
    }
  };

  const goToDetails = () => {
    stopSpeaking();
    navigate('/daily');
    handleClose();
  };

  return (
    <>
      <style>{notifCss}</style>
      <AnimatePresence>
        {visible && current && (
          <motion.div
            className="hn-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="hn-card"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="hn-close" onClick={handleClose}>✕</button>

              <div className="hn-badge">
                <span>📿</span>
                <span>{t.hadithNotif.badge}</span>
              </div>

              <div className="hn-category">
                {current.emoji} {current.category}
              </div>

              <div className="hn-text">
                «{current.text}»
              </div>

              {current.isnad && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', marginTop: 6, textAlign: 'center' }}>{current.isnad}</div>}
              {current.narrator && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2, textAlign: 'center' }}>{t.hadithNotif?.narrator || 'الراوي: '}<span style={{ color: '#8b5cf6' }}>{current.narrator}</span></div>}

              <div className="hn-source">
                📖 <strong>{current.source}</strong>
                {current.grade && <span style={{ marginRight: 8, color: current.grade === 'صحيح' ? '#00c896' : '#f0b040' }}>[{current.grade === 'صحيح' ? t.hadithNotif.gradeSahih : t.hadithNotif.gradeHasan}]</span>}
              </div>
              {current.reference && <div style={{ fontSize: 9, color: 'rgba(240,176,64,.4)', marginTop: 2, textAlign: 'center' }}>📋 {current.reference}</div>}

              <div className="hn-actions">
                <button className={`hn-btn hn-btn-speak ${speaking ? 'speaking' : ''}`} onClick={toggleSpeak}>
                  {speaking ? '⏹️' : '🔊'} {speaking ? t.home.speakingBtn : t.home.listenBtn}
                </button>
                <button className="hn-btn hn-btn-detail" onClick={goToDetails}>
                  📖 {t.hadithNotif.details}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
