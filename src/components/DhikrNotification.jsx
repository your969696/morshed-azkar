import { useState, useEffect, useCallback, useRef } from 'react';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { useTranslation } from '../i18n.jsx';
import { morningAzkar } from '../data/morning-azkar';
import { eveningAzkar } from '../data/evening-azkar';
import { afterPrayerAzkar } from '../data/after-prayer-azkar';
import { hourlyHadiths as allHourlyHadiths } from '../data/hourly-hadiths';
import { behaviorInJoy as allBehaviorInJoy, behaviorInGrief as allBehaviorInGrief } from '../data/behavior-hadiths';
import { bestDeeds as allBestDeeds } from '../data/best-deeds';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };

const filteredMorning = morningAzkar.filter(a => !getDeletedIds('deletedAzkarIds').includes(a.id));
const filteredEvening = eveningAzkar.filter(a => !getDeletedIds('deletedAzkarIds').includes(a.id));
const filteredAfterPrayer = afterPrayerAzkar.filter(a => !getDeletedIds('deletedAzkarIds').includes(a.id));
const filteredHadiths = allHourlyHadiths.filter(h => !getDeletedIds('deletedHadithsIds').includes(h.id));
const filteredBehaviorJoy = allBehaviorInJoy.filter(b => !getDeletedIds('deletedBehaviorIds').includes(b.id));
const filteredBehaviorGrief = allBehaviorInGrief.filter(b => !getDeletedIds('deletedBehaviorIds').includes(b.id));
const filteredDeeds = allBestDeeds.filter(d => !getDeletedIds('deletedDeedsIds').includes(d.id));

const INTERVAL_MAP = { 15: 15 * 60 * 1000, 30: 30 * 60 * 1000, 60: 60 * 60 * 1000, 90: 90 * 60 * 1000, 120: 120 * 60 * 1000 };

const SOURCES = [
  { key: 'morning', data: filteredMorning, emoji: '🌅', label: 'أذكار الصباح', getText: (item) => item.text, getCategory: (item) => item.category || 'أذكار الصباح' },
  { key: 'evening', data: filteredEvening, emoji: '🌙', label: 'أذكار المساء', getText: (item) => item.text, getCategory: (item) => item.category || 'أذكار المساء' },
  { key: 'afterPrayer', data: filteredAfterPrayer, emoji: '🕌', label: 'أذكار بعد الصلاة', getText: (item) => item.text, getCategory: (item) => 'أذكار بعد الصلاة' },
  { key: 'hadith', data: filteredHadiths, emoji: '📖', label: 'حديث شريف', getText: (item) => item.text, getCategory: (item) => item.category || 'حديث' },
  { key: 'behaviorJoy', data: filteredBehaviorJoy, emoji: '😊', label: 'سلوك المسلم في الفرح', getText: (item) => item.text, getCategory: (item) => item.category || 'سلوك المسلم' },
  { key: 'behaviorGrief', data: filteredBehaviorGrief, emoji: '🫂', label: 'سلوك المسلم في الحزن', getText: (item) => item.text, getCategory: (item) => item.category || 'سلوك المسلم' },
  { key: 'deeds', data: filteredDeeds, emoji: '⭐', label: 'أفضل الأعمال', getText: (item) => `${item.title}\n${item.description}`, getCategory: (item) => item.category || 'أفضل الأعمال' },
].filter(s => s.data.length > 0);

const POSITIONS = [
  { top: 16, right: 16 },
  { top: 16, right: 'auto', left: 16 },
  { top: 'auto', bottom: 100, right: 16 },
  { top: 'auto', bottom: 100, right: 'auto', left: 16 },
  { top: 100, right: 'auto', left: 16 },
  { top: 200, right: 16 },
  { top: 'auto', bottom: 200, left: 16 },
  { top: 16, left: '50%', transform: 'translateX(-50%)' },
  { top: 'auto', bottom: 100, left: '50%', transform: 'translateX(-50%)' },
];

const widgetCss = `
@keyframes dwIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes dwGlow{0%,100%{box-shadow:0 0 16px rgba(0,200,150,.12)}50%{box-shadow:0 0 28px rgba(0,200,150,.25)}}
@keyframes dwPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.dw-widget{
  position:fixed;z-index:8500;width:200px;
  background:linear-gradient(145deg,#0d2818,#1a3a2a,#0d1b2a);
  border:1px solid rgba(0,200,150,.2);border-radius:10px;
  padding:4px 8px 4px;overflow:hidden;cursor:pointer;
  animation:dwIn .35s ease,dwGlow 3s ease infinite;
  transition:box-shadow .3s;font-family:'Cairo',sans-serif;
  user-select:none;
}
.dw-widget:hover{box-shadow:0 0 32px rgba(0,200,150,.3)}
.dw-header{display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-bottom:0}
.dw-badge{display:none}
.dw-category{display:none}
.dw-close{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.06);border:none;color:rgba(255,255,255,.4);font-size:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.dw-close:hover{background:rgba(255,255,255,.12);color:#fff}
.dw-minimize{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.06);border:none;color:rgba(255,255,255,.4);font-size:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.dw-minimize:hover{background:rgba(255,255,255,.12);color:#fff}
.dw-mini{position:fixed;z-index:8500;width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,#0d2818,#1a3a2a);border:1px solid rgba(0,200,150,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;animation:dwIn .3s ease;transition:box-shadow .3s,transform .2s;box-shadow:0 4px 20px rgba(0,200,150,.2)}
.dw-mini:hover{box-shadow:0 4px 28px rgba(0,200,150,.4);transform:scale(1.1)}
.dw-text{
  font-family:'Amiri Quran',serif;font-size:12px;line-height:1.6;
  color:#e0f2e9;text-align:center;margin:0;
  text-shadow:0 0 8px rgba(200,150,.06);
  max-height:40px;overflow:hidden;
}
.dw-text::-webkit-scrollbar{width:3px}
.dw-text::-webkit-scrollbar-thumb{background:rgba(0,200,150,.25);border-radius:3px}
.dw-source{display:none}
.dw-actions{display:flex;gap:3px;justify-content:center;margin-top:0}
.dw-btn{padding:2px 6px;border-radius:6px;border:none;font-family:'Cairo',sans-serif;font-weight:700;font-size:8px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:2px}
.dw-btn-speak{background:rgba(0,200,150,.1);color:#00c896;border:1px solid rgba(0,200,150,.2)}
.dw-btn-speak:hover{background:rgba(0,200,150,.2)}
.dw-btn-speak.speaking{background:rgba(239,68,68,.1);color:#ef4444;border-color:rgba(239,68,68,.2)}
.dw-progress{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.03)}
.dw-progress-bar{height:100%;background:linear-gradient(90deg,rgba(0,200,150,.5),rgba(0,200,150,.15));transition:width 1s linear}
.dw-drag-hint{display:none}
`;

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPosStyle(idx) {
  const p = POSITIONS[idx % POSITIONS.length];
  const style = {};
  Object.entries(p).forEach(([k, v]) => { style[k] = v; });
  return style;
}

export default function DhikrNotification() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [current, setCurrent] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [posIdx, setPosIdx] = useState(0);
  const [progress, setProgress] = useState(100);
  const lastSourceRef = useRef(-1);
  const lastIdxRef = useRef(-1);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const speakRepeatRef = useRef(null);

  const pickRandom = useCallback(() => {
    if (localStorage.getItem('sleepMode') === 'true') return;
    if (localStorage.getItem('dhikrNotificationsEnabled') === 'false') return;

    let srcIdx;
    do { srcIdx = Math.floor(Math.random() * SOURCES.length); } while (srcIdx === lastSourceRef.current && SOURCES.length > 1);
    lastSourceRef.current = srcIdx;
    const src = SOURCES[srcIdx];

    let itemIdx;
    do { itemIdx = Math.floor(Math.random() * src.data.length); } while (itemIdx === lastIdxRef.current && src.data.length > 1);
    lastIdxRef.current = itemIdx;

    setCurrent({ ...src.data[itemIdx], _getText: src.getText, _getCategory: src.getCategory, _emoji: src.emoji, _label: src.label });
    setCurrentSource(src);
    setVisible(true);
    setProgress(100);
  }, []);

  useEffect(() => {
    const onTest = () => pickRandom();
    window.addEventListener('testDhikrReminder', onTest);
    return () => window.removeEventListener('testDhikrReminder', onTest);
  }, [pickRandom]);

  useEffect(() => {
    const onChanged = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const enabled = localStorage.getItem('dhikrNotificationsEnabled') !== 'false';
      if (!enabled || SOURCES.length === 0) return;
      const intervalMin = parseInt(localStorage.getItem('dhikrInterval') || '60');
      const ms = INTERVAL_MAP[intervalMin] || INTERVAL_MAP[60];
      timerRef.current = setInterval(() => pickRandom(), ms);
    };
    window.addEventListener('floatingAzkarSettingsChanged', onChanged);
    return () => window.removeEventListener('floatingAzkarSettingsChanged', onChanged);
  }, [pickRandom]);

  useEffect(() => {
    if (localStorage.getItem('dhikrNotificationsEnabled') === null) {
      localStorage.setItem('dhikrNotificationsEnabled', 'true');
    }
    const enabled = localStorage.getItem('dhikrNotificationsEnabled') !== 'false';
    if (!enabled || SOURCES.length === 0) return;
    const intervalMin = parseInt(localStorage.getItem('dhikrInterval') || '60');
    const ms = INTERVAL_MAP[intervalMin] || INTERVAL_MAP[30];

    if (window.electronAPI?.isElectron) {
      window.electronAPI.setReminderInterval('dhikr', ms, true);
      window.electronAPI.onDhikrReminder?.(() => { pickRandom(); });
      const onWake = () => { window.electronAPI.setReminderInterval('dhikr', ms, true); };
      window.electronAPI.onSystemWake?.(onWake);
      return () => { window.electronAPI.stopReminders?.('dhikr'); window.electronAPI.removeAllListeners?.('dhikr-reminder'); window.electronAPI.removeAllListeners?.('system-wake'); };
    }

    timerRef.current = setInterval(() => pickRandom(), ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pickRandom]);

  useEffect(() => {
    if (visible) {
      setProgress(100);
      const duration = 20000;
      const step = 100;
      let elapsed = 0;
      progressRef.current = setInterval(() => {
        elapsed += step;
        setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      }, step);
      const autoHide = setTimeout(() => {
        stopSpeaking();
        setSpeaking(false);
        setVisible(false);
      }, duration);
      return () => { clearInterval(progressRef.current); clearTimeout(autoHide); };
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [visible, current]);

  useEffect(() => {
    if (visible && current) {
      // Auto-speak disabled to avoid conflict with adhan/quran audio
    }
    return () => { if (speakRepeatRef.current) clearTimeout(speakRepeatRef.current); };
  }, [visible, current]);

  const handleClose = (e) => {
    e.stopPropagation();
    stopSpeaking();
    setSpeaking(false);
    setVisible(false);
    setMinimized(false);
    if (speakRepeatRef.current) clearTimeout(speakRepeatRef.current);
  };

  const handleMinimize = (e) => {
    e.stopPropagation();
    setMinimized(true);
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setMinimized(false);
  };

  const handleWidgetClick = () => {
    setPosIdx(prev => prev + 1);
  };

  const toggleSpeak = (e) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      if (speakRepeatRef.current) clearTimeout(speakRepeatRef.current);
    } else if (current?.text) {
      setSpeaking(true);
      speakArabic(current.text, () => setSpeaking(false));
    }
  };

  if (!visible || !current) return null;

  const displayText = current._getText(current);
  const displayCategory = current._getCategory(current);
  const sourceLabel = current.source || current._label;

  if (minimized) {
    return (
      <>
        <style>{widgetCss}</style>
        <div
          className="dw-mini"
          style={getPosStyle(posIdx)}
          onClick={handleExpand}
          title="اضغط لعرض الذكر"
        >
          {current._emoji}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{widgetCss}</style>
      <div
        className="dw-widget"
        style={getPosStyle(posIdx)}
        onClick={handleWidgetClick}
      >
        <div className="dw-header">
          <button className="dw-minimize" onClick={handleMinimize} title="تصغير">─</button>
          <button className="dw-close" onClick={handleClose} title="إغلاق">✕</button>
        </div>

        <div className="dw-text">
          {displayText}
        </div>

        <div className="dw-source">{sourceLabel}</div>

        <div className="dw-actions">
          <button className={`dw-btn dw-btn-speak ${speaking ? 'speaking' : ''}`} onClick={toggleSpeak}>
            {speaking ? '⏹️' : '🔊'}
          </button>
        </div>

        <div className="dw-progress">
          <div className="dw-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}
