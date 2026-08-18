import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking, isSpeaking as checkSpeaking, playAzan } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';
import { hourlyHadiths as allHourlyHadiths } from '../data/hourly-hadiths';
import { hourlyAzkar as allHourlyAzkar } from '../data/hourly-azkar';
import { behaviorInJoy as allBehaviorInJoy, behaviorInGrief as allBehaviorInGrief } from '../data/behavior-hadiths';
import { bestDeeds as allBestDeeds } from '../data/best-deeds';
import { getTodayEvent, getHijriDate } from '../data/islamic-history';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };

const baseHourlyAzkar = allHourlyAzkar.filter(a => !getDeletedIds('deletedAzkarIds').includes(a.id));
const customAzkarList = getDeletedIds('customAzkarList');

const now = new Date();
const currentMinutes = now.getHours() * 60 + now.getMinutes();

const activeCustomAzkar = customAzkarList.filter(c => {
  if (!c.timeStart || !c.timeEnd) return true;
  const [sh, sm] = c.timeStart.split(':').map(Number);
  const [eh, em] = c.timeEnd.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start <= end) return currentMinutes >= start && currentMinutes <= end;
  return currentMinutes >= start || currentMinutes <= end;
});

const hourlyAzkar = [...baseHourlyAzkar, ...activeCustomAzkar.map(c => ({ id: c.id, audio: c.audio || null, text: c.text, category: c.category, custom: true }))];
const hourlyHadiths = allHourlyHadiths.filter(h => !getDeletedIds('deletedHadithsIds').includes(h.id));
const behaviorInJoy = allBehaviorInJoy.filter(b => !getDeletedIds('deletedBehaviorIds').includes(b.id));
const behaviorInGrief = allBehaviorInGrief.filter(b => !getDeletedIds('deletedBehaviorIds').includes(b.id));
const bestDeeds = allBestDeeds.filter(d => !getDeletedIds('deletedDeedsIds').includes(d.id));

const INTERVAL_MAP = { 15: 900000, 30: 1800000, 60: 3600000, 90: 5400000, 120: 7200000 };

const getRandomDeed = () => bestDeeds.length > 0 ? bestDeeds[Math.floor(Math.random() * bestDeeds.length)] : null;

const TYPES = [
  { key: 'dhikr', label: 'ذكر', emoji: '📿' },
  { key: 'hadith', label: 'حديث', emoji: '📖' },
  { key: 'history', label: 'مثل هذا اليوم', emoji: '📅' },
  { key: 'deed', label: 'أفضل الأعمال', emoji: '⭐' },
  { key: 'behavior', label: 'سلوك المسلم', emoji: '🕌' },
];

const overlayCss = `
@keyframes ovSlideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes ovFadeIn { from{opacity:0} to{opacity:1} }
@keyframes ovGlow { 0%,100%{opacity:.15} 50%{opacity:.35} }
@keyframes ovFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.ov-overlay{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:100vh;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);backdrop-filter:blur(12px);animation:ovFadeIn .3s ease}
.ov-card{width:100%;max-width:380px;position:relative;border-radius:28px;overflow:hidden;animation:ovSlideUp .4s ease}
.ov-card-dhikr{background:linear-gradient(145deg,#0d2818,#1a3a2a,#0d1b2a);border:1px solid rgba(0,200,150,.15)}
.ov-card-hadith{background:linear-gradient(145deg,#1a1030,#2d1b69,#1a0a30);border:1px solid rgba(139,92,246,.15)}
.ov-card-history{background:linear-gradient(145deg,#1a1a2e,#16213e,#0f3460);border:1px solid rgba(59,130,246,.15)}
.ov-card-deed{background:linear-gradient(145deg,#2d1b00,#4a2c00,#1a1000);border:1px solid rgba(240,176,64,.15)}
.ov-card-behavior{background:linear-gradient(145deg,#1a1030,#2d1b40,#1a0a30);border:1px solid rgba(139,92,246,.15)}
.ov-glow{position:absolute;top:-40%;left:-40%;width:180%;height:180%;pointer-events:none;border-radius:50%}
.ov-glow-dhikr{background:radial-gradient(circle,rgba(0,200,150,.08) 0%,transparent 50%);animation:ovGlow 3s ease infinite}
.ov-glow-hadith{background:radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 50%);animation:ovGlow 3s ease infinite}
.ov-glow-history{background:radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 50%);animation:ovGlow 3s ease infinite}
.ov-glow-deed{background:radial-gradient(circle,rgba(240,176,64,.08) 0%,transparent 50%);animation:ovGlow 3s ease infinite}
.ov-glow-behavior{background:radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 50%);animation:ovGlow 3s ease infinite}
.ov-inner{position:relative;z-index:1;padding:28px 24px}
.ov-close{position:absolute;top:12px;left:12px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);border:none;color:var(--text-muted);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:2}
.ov-close:hover{background:rgba(255,255,255,.12);color:var(--text-primary)}
.ov-type-bar{display:flex;gap:6px;justify-content:center;margin-bottom:18px;flex-wrap:wrap}
.ov-type-btn{padding:6px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:transparent;color:var(--text-muted);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Cairo',sans-serif}
.ov-type-btn.active{border-color:rgba(0,200,150,.3);background:rgba(0,200,150,.1);color:#00c896}
.ov-badge{display:inline-flex;align-items:center;gap:6px;border-radius:20px;padding:5px 14px;margin-bottom:16px}
.ov-badge-dhikr{background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2)}
.ov-badge-hadith{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2)}
.ov-badge-history{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2)}
.ov-badge-deed{background:rgba(240,176,64,.1);border:1px solid rgba(240,176,64,.2)}
.ov-badge span{font-size:11px;font-weight:700}
.ov-badge-dhikr span{color:#00c896}
.ov-badge-hadith span{color:#8b5cf6}
.ov-badge-history span{color:#3b82f6}
.ov-badge-deed span{color:#f0b040}
.ov-badge-behavior{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2)}
.ov-badge-behavior span{color:#8b5cf6}
.ov-category{font-size:12px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.ov-text{font-family:'Amiri Quran','Cairo',serif;text-align:center;margin-bottom:16px;line-height:2.2}
.ov-text-dhikr{font-size:1.5rem;color:#e0f2e9}
.ov-text-hadith{font-size:1.1rem;color:var(--text-primary)}
.ov-text-history{font-size:1.1rem;color:var(--text-primary)}
.ov-text-deed{font-size:1rem;color:var(--text-primary)}
.ov-text-behavior{font-size:1.1rem;color:var(--text-primary)}
.ov-source{font-size:11px;color:var(--text-muted);text-align:center;margin-bottom:16px;line-height:1.6}
.ov-source strong{color:#f0b040}
.ov-reward{font-size:11px;color:#00c896;text-align:center;margin-bottom:14px;padding:8px 14px;background:rgba(0,200,150,.06);border-radius:12px;border:1px solid rgba(0,200,150,.1)}
.ov-hijri{font-size:11px;color:#8b5cf6;text-align:center;margin-bottom:14px;padding:8px 14px;background:rgba(139,92,246,.06);border-radius:12px;border:1px solid rgba(139,92,246,.1)}
.ov-actions{display:flex;gap:10px;justify-content:center;margin-top:16px}
.ov-btn{padding:10px 20px;border-radius:14px;border:none;font-family:'Cairo',sans-serif;font-weight:700;font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
.ov-btn-speak{background:rgba(0,200,150,.12);color:#00c896;border:1px solid rgba(0,200,150,.25)}
.ov-btn-speak:hover{background:rgba(0,200,150,.2)}
.ov-btn-speak.speaking{background:rgba(239,68,68,.12);color:#ef4444;border-color:rgba(239,68,68,.25)}
.ov-btn-close{background:rgba(255,255,255,.06);color:var(--text-muted);border:1px solid rgba(255,255,255,.08)}
.ov-btn-close:hover{background:rgba(255,255,255,.1);color:var(--text-primary)}
.ov-timer{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--text-muted);white-space:nowrap;opacity:.6}
.ov-emoji{font-size:48px;text-align:center;margin-bottom:12px;animation:ovFloat 3s ease infinite}
.ov-description{font-size:12px;color:var(--text-secondary);text-align:center;margin-bottom:12px;line-height:1.8;padding:0 4px}
.ov-category-tag{display:inline-block;padding:4px 12px;border-radius:10px;font-size:10px;font-weight:700;margin-bottom:6px}
.ov-freq{font-size:10px;color:var(--text-muted);text-align:center;margin-bottom:10px}
`;

export default function HourlyOverlay() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('dhikr');
  const [currentDhikr, setCurrentDhikr] = useState(null);
  const [currentHadith, setCurrentHadith] = useState(null);
  const [currentHistory, setCurrentHistory] = useState(null);
  const [currentDeed, setCurrentDeed] = useState(null);
  const [currentBehavior, setCurrentBehavior] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [lastDhikrIdx, setLastDhikrIdx] = useState(-1);
  const [lastHadithIdx, setLastHadithIdx] = useState(-1);
  const [lastBehaviorIdx, setLastBehaviorIdx] = useState(-1);
  const [countdown, setCountdown] = useState('');
  const nextShowRef = useRef(null);
  const dhikrAudioRef = useRef(null);

  const pickRandom = useCallback((newType) => {
    if (localStorage.getItem('sleepMode') === 'true') return;
    if (newType === 'dhikr') {
      let idx;
      do { idx = Math.floor(Math.random() * hourlyAzkar.length); } while (idx === lastDhikrIdx && hourlyAzkar.length > 1);
      setLastDhikrIdx(idx);
      setCurrentDhikr(hourlyAzkar[idx]);
    } else if (newType === 'hadith') {
      let idx;
      do { idx = Math.floor(Math.random() * hourlyHadiths.length); } while (idx === lastHadithIdx && hourlyHadiths.length > 1);
      setLastHadithIdx(idx);
      setCurrentHadith(hourlyHadiths[idx]);
    } else if (newType === 'history') {
      setCurrentHistory(getTodayEvent());
    } else if (newType === 'deed') {
      setCurrentDeed(getRandomDeed());
    } else if (newType === 'behavior') {
      const allBehavior = [...behaviorInJoy, ...behaviorInGrief];
      let idx;
      do { idx = Math.floor(Math.random() * allBehavior.length); } while (idx === lastBehaviorIdx && allBehavior.length > 1);
      setLastBehaviorIdx(idx);
      setCurrentBehavior(allBehavior[idx]);
    }
    setType(newType);
    setVisible(true);
  }, [lastDhikrIdx, lastHadithIdx, lastBehaviorIdx]);

  const showRandomRef = useRef(pickRandom);
  showRandomRef.current = pickRandom;

  useEffect(() => {
    return;
    const enabled = localStorage.getItem('hourlyOverlayEnabled') !== 'false' && localStorage.getItem('hourlyOverlayEnabled') !== null ? localStorage.getItem('hourlyOverlayEnabled') !== 'false' : true;
    if (localStorage.getItem('hourlyOverlayEnabled') === null) {
      localStorage.setItem('hourlyOverlayEnabled', 'true');
    }
    if (!enabled) return;

    const intervalMin = parseInt(localStorage.getItem('hourlyOverlayInterval') || '30');
    const ms = INTERVAL_MAP[intervalMin] || INTERVAL_MAP[30];

    if (window.electronAPI?.isElectron) {
      window.electronAPI.setReminderInterval('hourly', ms, true);
      const handler = () => {
        const allTypes = ['dhikr', 'hadith', 'history', 'deed', 'behavior'];
        const today = new Date().toDateString();
        const types = allTypes.filter(t => localStorage.getItem('hourlyOverlay_disabledType_' + t) !== today);
        if (types.length === 0) return;
        const randomType = types[Math.floor(Math.random() * types.length)];
        showRandomRef.current(randomType);
      };
      window.electronAPI.onHourlyReminder(handler);
      const onWake = () => { window.electronAPI.setReminderInterval('hourly', ms, true); };
      window.electronAPI.onSystemWake?.(onWake);
      const testHandler = () => showRandomRef.current('dhikr');
      window.addEventListener('hourlyDhikrTest', testHandler);
      return () => {
        window.electronAPI.stopReminders('hourly');
        window.electronAPI.removeAllListeners('hourly-reminder');
        window.electronAPI.removeAllListeners?.('system-wake');
        window.removeEventListener('hourlyDhikrTest', testHandler);
      };
    }

    nextShowRef.current = Date.now() + ms;
    const timer = setInterval(() => {
      const allTypes = ['dhikr', 'hadith', 'history', 'deed', 'behavior'];
      const today = new Date().toDateString();
      const types = allTypes.filter(t => localStorage.getItem('hourlyOverlay_disabledType_' + t) !== today);
      if (types.length > 0) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        showRandomRef.current(randomType);
      }
      nextShowRef.current = Date.now() + ms;
    }, ms);
    const testHandler = () => showRandomRef.current('dhikr');
    window.addEventListener('hourlyDhikrTest', testHandler);
    return () => { clearInterval(timer); window.removeEventListener('hourlyDhikrTest', testHandler); };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const remaining = Math.max(0, nextShowRef.current - Date.now());
      const min = Math.floor(remaining / 60000);
      const sec = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${min}:${sec.toString().padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (localStorage.getItem('hourlyOverlayAutoSpeak') === null) {
        localStorage.setItem('hourlyOverlayAutoSpeak', 'true');
      }
      const autoSpeak = localStorage.getItem('hourlyOverlayAutoSpeak') !== 'false';
      if (autoSpeak) {
        if (type === 'dhikr' && currentDhikr?.audio) {
          setSpeaking(true);
          if (dhikrAudioRef.current) { dhikrAudioRef.current.pause(); }
          const audio = new Audio(currentDhikr.audio);
          dhikrAudioRef.current = audio;
          audio.onended = () => { dhikrAudioRef.current = null; setSpeaking(false); setVisible(false); };
          audio.play().catch(() => { dhikrAudioRef.current = null; setSpeaking(false); setVisible(false); });
        } else if (type === 'dhikr' && currentDhikr?.text) {
          setSpeaking(true);
          speakArabic(currentDhikr.text, () => {
            setSpeaking(false);
            setVisible(false);
          });
        } else {
          let text = '';
          if (type === 'hadith' && currentHadith) text = currentHadith.text;
          if (type === 'history' && currentHistory) text = currentHistory.eventAr;
          if (type === 'deed' && currentDeed) text = currentDeed.title + '. ' + currentDeed.description;
          if (type === 'behavior' && currentBehavior) text = currentBehavior.text;
          if (text) {
            setSpeaking(true);
            speakArabic(text, () => {
              setSpeaking(false);
              setVisible(false);
            });
          }
        }
      }
    }
  }, [visible, currentDhikr, currentHadith, currentHistory, currentDeed, currentBehavior, type]);

  const handleClose = () => { 
    stopSpeaking(); 
    if (dhikrAudioRef.current) { dhikrAudioRef.current.pause(); dhikrAudioRef.current = null; }
    setSpeaking(false); 
    setVisible(false); 
  };

  const toggleSpeak = () => {
    if (speaking) { 
      stopSpeaking(); 
      if (dhikrAudioRef.current) { dhikrAudioRef.current.pause(); dhikrAudioRef.current = null; }
      setSpeaking(false); 
      return; 
    }
    if (type === 'dhikr' && currentDhikr?.audio) {
      setSpeaking(true);
      if (dhikrAudioRef.current) { dhikrAudioRef.current.pause(); }
      const audio = new Audio(currentDhikr.audio);
      dhikrAudioRef.current = audio;
      audio.onended = () => { dhikrAudioRef.current = null; setSpeaking(false); };
      audio.play().catch(() => { dhikrAudioRef.current = null; setSpeaking(false); });
    } else if (type === 'dhikr' && currentDhikr?.text) {
      setSpeaking(true);
      speakArabic(currentDhikr.text, () => { setSpeaking(false); });
    } else {
      let text = '';
      if (type === 'hadith' && currentHadith) text = currentHadith.text;
      if (type === 'history' && currentHistory) text = currentHistory.eventAr;
      if (type === 'deed' && currentDeed) text = currentDeed.title + '. ' + currentDeed.description;
      if (type === 'behavior' && currentBehavior) text = currentBehavior.title + '. ' + currentBehavior.text;
      if (text) { setSpeaking(true); speakArabic(text); }
    }
  };

  const hijri = getHijriDate();
  const current = type === 'dhikr' ? currentDhikr : type === 'hadith' ? currentHadith : type === 'history' ? currentHistory : type === 'deed' ? currentDeed : currentBehavior;

  return (
    <>
      <style>{overlayCss}</style>
      <AnimatePresence>
        {visible && current && (
          <motion.div className="ov-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose}>
            <motion.div className={`ov-card ov-card-${type}`} initial={{ scale: 0.85, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 50 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()}>
              <div className={`ov-glow ov-glow-${type}`} />
              <div className="ov-inner">
                <button className="ov-close" onClick={handleClose}>✕</button>

                <div className="ov-type-bar">
                  {TYPES.map(t => (
                    <button key={t.key} className={`ov-type-btn${type === t.key ? ' active' : ''}`} onClick={() => pickRandom(t.key)}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>

                <div className={`ov-badge ov-badge-${type}`}>
                  <span>{TYPES.find(t => t.key === type)?.emoji}</span>
                  <span>{TYPES.find(t => t.key === type)?.label}</span>
                </div>

                {type === 'dhikr' && currentDhikr && (
                  <>
                    <div className="ov-category" style={{ color: '#00c896' }}>📿 {currentDhikr.category}</div>
                    {currentDhikr.audio ? (
                      <div className="ov-text ov-text-dhikr" style={{ fontSize: '2rem' }}>🎙️ صوت مسجل</div>
                    ) : (
                      <div className="ov-text ov-text-dhikr">«{currentDhikr.text}»</div>
                    )}
                    {currentDhikr.reward && <div className="ov-reward">💎 الأجر: {currentDhikr.reward}</div>}
                    {currentDhikr.count && <div className="ov-source">🔄 التكرار: <strong>{currentDhikr.count} مرة</strong></div>}
                  </>
                )}

                {type === 'hadith' && currentHadith && (
                  <>
                    <div className="ov-category" style={{ color: '#8b5cf6' }}>{currentHadith.emoji} {currentHadith.category}</div>
                    <div className="ov-text ov-text-hadith">«{currentHadith.text}»</div>
                    {currentHadith.isnad && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.4)', fontStyle: 'italic', marginTop: 4, textAlign: 'center' }}>{currentHadith.isnad}</div>}
                    {currentHadith.narrator && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.35)', marginTop: 2, textAlign: 'center' }}>الراوي: <span style={{ color: '#8b5cf6' }}>{currentHadith.narrator}</span></div>}
                    <div className="ov-source">📖 <strong>{currentHadith.source}</strong>
                      {currentHadith.grade && <span style={{ marginRight: 8, color: currentHadith.grade === 'صحيح' ? '#00c896' : '#f0b040' }}>[{currentHadith.grade}]</span>}
                    </div>
                    {currentHadith.reference && <div style={{ fontSize: '0.7rem', color: 'rgba(240,176,64,.5)', marginTop: 2, textAlign: 'center' }}>📋 {currentHadith.reference}</div>}
                  </>
                )}

                {type === 'history' && currentHistory && (
                  <>
                    <div className="ov-emoji">{currentHistory.emoji}</div>
                    <div className="ov-category" style={{ color: '#3b82f6' }}>📅 مثل هذا اليوم</div>
                    <div className="ov-text ov-text-history">«{currentHistory.eventAr}»</div>
                    <div className="ov-hijri">🌙 التاريخ الهجري: {currentHistory.hijri}</div>
                    <div className="ov-description">{currentHistory.description}</div>
                  </>
                )}

                {type === 'deed' && currentDeed && (
                  <>
                    <div className="ov-emoji">{currentDeed.emoji}</div>
                    <div className="ov-category" style={{ color: '#f0b040' }}>⭐ أفضل الأعمال</div>
                    <div className="ov-text ov-text-deed" style={{ fontFamily: "'Cairo',sans-serif", fontSize: '1.1rem' }}>{currentDeed.title}</div>
                    <div className="ov-description">{currentDeed.description}</div>
                    <div className="ov-reward">💎 الأجر: {currentDeed.reward}</div>
                    <div className="ov-freq">⏰ التكرار: {currentDeed.frequency}</div>
                  </>
                )}

                {type === 'behavior' && currentBehavior && (
                  <>
                    <div className="ov-category" style={{ color: '#8b5cf6' }}>🕌 {currentBehavior.category}</div>
                    <div className="ov-text ov-text-behavior">«{currentBehavior.text}»</div>
                    {currentBehavior.narrator && <div className="ov-source">📖 رواه <strong>{currentBehavior.narrator}</strong></div>}
                    {currentBehavior.grade && <div className="ov-reward" style={{ color: currentBehavior.grade === 'صحيح' ? '#00c896' : '#f0b040' }}>[{currentBehavior.grade}] {currentBehavior.reference}</div>}
                  </>
                )}

                <div className="ov-actions">
                  <button className={`ov-btn ov-btn-speak${speaking ? ' speaking' : ''}`} onClick={toggleSpeak}>
                    {speaking ? '⏹️' : '🔊'} {speaking ? t.home.speakingBtn : t.home.listenBtn}
                  </button>
                  <button className="ov-btn ov-btn-close" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)', color: '#ef4444' }} onClick={() => {
                    const today = new Date().toDateString();
                    localStorage.setItem('hourlyOverlay_disabledType_' + type, today);
                    handleClose();
                  }}>🚫 لا تظهر اليوم</button>
                  <button className="ov-btn ov-btn-close" onClick={handleClose}>✕ {t.common.close}</button>
                </div>

                <div className="ov-timer">التالي خلال: {countdown}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
