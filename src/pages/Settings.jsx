import { useState, useEffect, useRef, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '../i18n.jsx';
import { getCities, setLocation, getCurrentLocationName, getPrayerTimes, setManualPrayerTimes, getManualPrayerTimes, clearManualPrayerTimes, PRAYER_KEYS, PRAYER_NAMES_AR, getPrayerTimesSync, lookupPostalCode, getPrayerTimeOffsets, setPrayerTimeOffsets, applyOffset, getPrayerTimesRawSync, formatTime12h, getSchool, setSchool } from '../utils/prayer-times';
import { namesOfAllah } from '../data/names-of-allah';
import { hourlyAzkar } from '../data/hourly-azkar';
import { hourlyHadiths } from '../data/hourly-hadiths';
import { behaviorInJoy, behaviorInGrief } from '../data/behavior-hadiths';
import { bestDeeds } from '../data/best-deeds';
import { playAzan, stopAzan, playRamadanCannon, speakArabic } from '../utils/sound';
import { getRamadanIqamaSettings, setRamadanIqamaSettings, getTodaySurah, getQuranAudioUrl, playQuranAudio, stopQuranAudio } from '../utils/quran-audio';
import ContactForm from '../components/ContactForm';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const toggleDeletedId = (key, id) => {
  const list = getDeletedIds(key);
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
  localStorage.setItem(key, JSON.stringify(next));
  return next;
};

const cities = getCities();

const Toggle = ({ enabled, onToggle }) => (
  <button onClick={onToggle} className={`toggle ${enabled ? 'on' : 'off'}`} style={{ cursor: 'pointer', width: 46, height: 26, borderRadius: 13, border: 'none', position: 'relative', transition: 'background .3s', flexShrink: 0, background: enabled ? '#00c896' : 'rgba(255,255,255,.08)', boxShadow: enabled ? '0 0 10px rgba(0,200,150,.3)' : 'none' }}>
    <div style={{ position: 'absolute', top: 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left .3s', boxShadow: '0 2px 6px rgba(0,0,0,.3)', left: enabled ? 23 : 3 }} />
  </button>
);

const Pill = ({ children, active, color, onClick }) => {
  const colors = {
    green: { color: '#00c896', background: 'rgba(0,200,150,.12)', borderColor: 'rgba(0,200,150,.3)' },
    purple: { color: '#a78bfa', background: 'rgba(139,92,246,.12)', borderColor: 'rgba(139,92,246,.3)' },
    gold: { color: '#f0b040', background: 'rgba(240,176,64,.12)', borderColor: 'rgba(240,176,64,.3)' },
    pink: { color: '#f472b6', background: 'rgba(244,114,182,.12)', borderColor: 'rgba(244,114,182,.3)' },
    blue: { color: '#60a5fa', background: 'rgba(96,165,250,.12)', borderColor: 'rgba(96,165,250,.3)' },
  };
  return (
    <button onClick={onClick} className="pill" style={{
      padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)',
      background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)',
      fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
      fontFamily: 'inherit',
      ...(active ? colors[color] : {}),
    }}>{children}</button>
  );
};

export default function Settings() {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState(null);

  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [hapticEnabled, setHapticEnabled] = useState(() => localStorage.getItem('hapticEnabled') !== 'false');
  const [vibrationStrength, setVibrationStrength] = useState(() => localStorage.getItem('vibrationStrength') || 'medium');
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    if (localStorage.getItem('adhanEnabled') === null) { localStorage.setItem('adhanEnabled', 'true'); return true; }
    return localStorage.getItem('adhanEnabled') !== 'false';
  });
  const [adhanType, setAdhanType] = useState(() => localStorage.getItem('adhanType') || 'makkah');
  const [adhanVolume, setAdhanVolume] = useState(() => parseInt(localStorage.getItem('adhanVolume') || '80'));
  const [hourlyEnabled, setHourlyEnabled] = useState(() => {
    if (localStorage.getItem('hourlyOverlayEnabled') === null) { localStorage.setItem('hourlyOverlayEnabled', 'true'); return true; }
    return localStorage.getItem('hourlyOverlayEnabled') !== 'false';
  });
  const [hourlyInterval, setHourlyInterval] = useState(() => parseInt(localStorage.getItem('hourlyOverlayInterval') || '30'));
  const [hourlyAutoSpeak, setHourlyAutoSpeak] = useState(() => {
    if (localStorage.getItem('hourlyOverlayAutoSpeak') === null) { localStorage.setItem('hourlyOverlayAutoSpeak', 'true'); return true; }
    return localStorage.getItem('hourlyOverlayAutoSpeak') !== 'false';
  });
  const [dndEnabled, setDndEnabled] = useState(() => localStorage.getItem('dndEnabled') !== 'false');
  const [floatingAzkarEnabled, setFloatingAzkarEnabled] = useState(() => {
    if (localStorage.getItem('floatingAzkarEnabled') === null) { localStorage.setItem('floatingAzkarEnabled', 'true'); return true; }
    return localStorage.getItem('floatingAzkarEnabled') !== 'false';
  });
  const [floatingAzkarInterval, setFloatingAzkarInterval] = useState(() => parseInt(localStorage.getItem('floatingAzkarInterval') || '60'));
  const [azkarWidgetEnabled, setAzkarWidgetEnabled] = useState(() => {
    return localStorage.getItem('azkarWidgetEnabled') !== 'false';
  });
  const [namesAudioEnabled, setNamesAudioEnabled] = useState(() => localStorage.getItem('namesAudioEnabled') === 'true');
  const [namesAudioMode, setNamesAudioMode] = useState(() => localStorage.getItem('namesAudioMode') || 'all');
  const [namesAudioDuration, setNamesAudioDuration] = useState(() => parseInt(localStorage.getItem('namesAudioDuration') || '10'));
  const [namesAudioTimeStart, setNamesAudioTimeStart] = useState(() => localStorage.getItem('namesAudioTimeStart') || '06:00');
  const [namesAudioTimeEnd, setNamesAudioTimeEnd] = useState(() => localStorage.getItem('namesAudioTimeEnd') || '22:00');
  const [subtitleEnabled, setSubtitleEnabled] = useState(() => localStorage.getItem('subtitleEnabled') !== 'false');
  const [subtitleFontSize, setSubtitleFontSize] = useState(() => localStorage.getItem('subtitleFontSize') || 'medium');
  const [subtitlePosition, setSubtitlePosition] = useState(() => localStorage.getItem('subtitlePosition') || 'bottom');
  const [subtitleBgColor, setSubtitleBgColor] = useState(() => localStorage.getItem('subtitleBgColor') || 'dark');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(() => localStorage.getItem('quietHoursEnabled') === 'true');
  const [quietHoursStart, setQuietHoursStart] = useState(() => localStorage.getItem('quietHoursStart') || '21:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(() => localStorage.getItem('quietHoursEnd') || '04:00');
  const [qiyamEnabled, setQiyamEnabled] = useState(() => localStorage.getItem('qiyamEnabled') === 'true');
  const [qiyamTime, setQiyamTime] = useState(() => localStorage.getItem('qiyamTime') || '02:00');
  const [notificationsPaused, setNotificationsPaused] = useState(() => localStorage.getItem('notificationsPaused') === 'true');
  const [selectedCity, setSelectedCity] = useState(() => getCurrentLocationName() || 'القاهرة');
  const [manualTimes, setManualTimes] = useState(() => {
    const saved = getManualPrayerTimes();
    if (saved) return saved;
    const current = getPrayerTimesSync();
    return { Fajr: current.Fajr || '', Sunrise: current.Sunrise || '', Dhuhr: current.Dhuhr || '', Asr: current.Asr || '', Maghrib: current.Maghrib || '', Isha: current.Isha || '' };
  });
  const [offsets, setOffsets] = useState(() => getPrayerTimeOffsets());
  const [fiqhSchool, setFiqhSchool] = useState(() => getSchool());

  const [quranBeforeMaghrib, setQuranBeforeMaghrib] = useState(() => localStorage.getItem('quranBeforeMaghrib') !== 'false');
  const [quranBeforeMaghribMin, setQuranBeforeMaghribMin] = useState(() => parseInt(localStorage.getItem('quranBeforeMaghribMin') || '15'));
  const [quranAutoTimes, setQuranAutoTimes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quranAutoTimes') || '[]'); } catch { return []; }
  });
  const [quranFridayKahf, setQuranFridayKahf] = useState(() => localStorage.getItem('quranFridayKahf') !== 'false');
  const [quranFridayKahfTime, setQuranFridayKahfTime] = useState(() => localStorage.getItem('quranFridayKahfTime') || '10:00');

  const [ramadanStartDate, setRamadanStartDate] = useState(() => localStorage.getItem('ramadanStartDate') || '');
  const [ramadanEndDate, setRamadanEndDate] = useState(() => localStorage.getItem('ramadanEndDate') || '');
  const [ramadanEidDays, setRamadanEidDays] = useState(() => localStorage.getItem('ramadanEidDays') || '');
  const [ramadanSoundType, setRamadanSoundType] = useState(() => localStorage.getItem('ramadanSoundType') || 'tone');
  const [ramadanNotifs, setRamadanNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ramadanNotifications') || '{}'); } catch { return {}; }
  });
  const [ramadanDeedsEnabled, setRamadanDeedsEnabled] = useState(() => localStorage.getItem('ramadanDeedsEnabled') === 'true');
  const [cannonEnabled, setCannonEnabled] = useState(() => localStorage.getItem('cannonEnabled') === 'true');
  const [ramadanDeedsTypes, setRamadanDeedsTypes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ramadanDeedsTypes') || '["charity","kinship","istighfar","quran"]'); } catch { return ['charity','kinship','istighfar','quran']; }
  });
  const [ramadanIqama, setRamadanIqama] = useState(() => getRamadanIqamaSettings());
  const [quranTestPlaying, setQuranTestPlaying] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [autoStart, setAutoStart] = useState(false);

  const [deletedNames, setDeletedNames] = useState(() => getDeletedIds('deletedNamesIds'));
  const [deletedAzkar, setDeletedAzkar] = useState(() => getDeletedIds('deletedAzkarIds'));
  const [deletedHadiths, setDeletedHadiths] = useState(() => getDeletedIds('deletedHadithsIds'));
  const [deletedBehavior, setDeletedBehavior] = useState(() => getDeletedIds('deletedBehaviorIds'));
  const [deletedDeeds, setDeletedDeeds] = useState(() => getDeletedIds('deletedDeedsIds'));
  const [customAzkar, setCustomAzkar] = useState(() => getDeletedIds('customAzkarList'));
  const [newDhikrText, setNewDhikrText] = useState('');
  const [newDhikrCategory, setNewDhikrCategory] = useState('ذكر');
  const [newDhikrAudio, setNewDhikrAudio] = useState(null);
  const [newDhikrAudioName, setNewDhikrAudioName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [newDhikrTimeStart, setNewDhikrTimeStart] = useState('06:00');
  const [newDhikrTimeEnd, setNewDhikrTimeEnd] = useState('22:00');
  const [newDhikrInterval, setNewDhikrInterval] = useState(30);

  useEffect(() => { localStorage.setItem('fontSize', fontSize); document.documentElement.style.setProperty('--azkar-font-size', { small: '1rem', medium: '1.3rem', large: '1.6rem', xlarge: '2rem' }[fontSize] || '1.3rem'); }, [fontSize]);
  useEffect(() => { localStorage.setItem('soundEnabled', soundEnabled.toString()); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('hapticEnabled', hapticEnabled.toString()); }, [hapticEnabled]);
  useEffect(() => { localStorage.setItem('vibrationStrength', vibrationStrength); }, [vibrationStrength]);
  useEffect(() => { localStorage.setItem('app_theme', theme); document.documentElement.classList.toggle('light', theme === 'light'); }, [theme]);
  useEffect(() => { localStorage.setItem('adhanEnabled', adhanEnabled.toString()); }, [adhanEnabled]);
  useEffect(() => { localStorage.setItem('adhanType', adhanType); }, [adhanType]);
  useEffect(() => { localStorage.setItem('adhanVolume', adhanVolume.toString()); }, [adhanVolume]);
  useEffect(() => { localStorage.setItem('hourlyOverlayEnabled', hourlyEnabled.toString()); }, [hourlyEnabled]);
  useEffect(() => { localStorage.setItem('hourlyOverlayInterval', hourlyInterval.toString()); }, [hourlyInterval]);
  useEffect(() => { localStorage.setItem('hourlyOverlayAutoSpeak', hourlyAutoSpeak.toString()); }, [hourlyAutoSpeak]);
  useEffect(() => { localStorage.setItem('dndEnabled', dndEnabled.toString()); }, [dndEnabled]);
  useEffect(() => {
    localStorage.setItem('floatingAzkarEnabled', floatingAzkarEnabled.toString());
    window.electronAPI?.settingsSet?.('floatingAzkarEnabled', floatingAzkarEnabled.toString());
    window.dispatchEvent(new Event('floatingAzkarSettingsChanged'));
  }, [floatingAzkarEnabled]);
  useEffect(() => {
    localStorage.setItem('floatingAzkarInterval', floatingAzkarInterval.toString());
    window.electronAPI?.settingsSet?.('floatingAzkarInterval', floatingAzkarInterval.toString());
    window.dispatchEvent(new Event('floatingAzkarSettingsChanged'));
  }, [floatingAzkarInterval]);
  useEffect(() => {
    localStorage.setItem('azkarWidgetEnabled', azkarWidgetEnabled.toString());
    window.electronAPI?.toggleAzkarWidget?.(azkarWidgetEnabled);
  }, [azkarWidgetEnabled]);
  useEffect(() => { localStorage.setItem('namesAudioEnabled', namesAudioEnabled.toString()); }, [namesAudioEnabled]);
  useEffect(() => { localStorage.setItem('namesAudioMode', namesAudioMode); }, [namesAudioMode]);
  useEffect(() => { localStorage.setItem('namesAudioDuration', namesAudioDuration.toString()); }, [namesAudioDuration]);
  useEffect(() => { localStorage.setItem('namesAudioTimeStart', namesAudioTimeStart); }, [namesAudioTimeStart]);
  useEffect(() => { localStorage.setItem('namesAudioTimeEnd', namesAudioTimeEnd); }, [namesAudioTimeEnd]);
  useEffect(() => { localStorage.setItem('subtitleEnabled', subtitleEnabled.toString()); }, [subtitleEnabled]);
  useEffect(() => { localStorage.setItem('subtitleFontSize', subtitleFontSize); }, [subtitleFontSize]);
  useEffect(() => { localStorage.setItem('subtitlePosition', subtitlePosition); }, [subtitlePosition]);
  useEffect(() => { localStorage.setItem('subtitleBgColor', subtitleBgColor); }, [subtitleBgColor]);
  useEffect(() => { localStorage.setItem('quietHoursEnabled', quietHoursEnabled.toString()); }, [quietHoursEnabled]);

  useEffect(() => { localStorage.setItem('quranBeforeMaghrib', quranBeforeMaghrib.toString()); }, [quranBeforeMaghrib]);
  useEffect(() => { localStorage.setItem('quranBeforeMaghribMin', quranBeforeMaghribMin.toString()); }, [quranBeforeMaghribMin]);
  useEffect(() => { localStorage.setItem('quranAutoTimes', JSON.stringify(quranAutoTimes)); }, [quranAutoTimes]);
  useEffect(() => { localStorage.setItem('quranFridayKahf', quranFridayKahf.toString()); }, [quranFridayKahf]);
  useEffect(() => { localStorage.setItem('quranFridayKahfTime', quranFridayKahfTime); }, [quranFridayKahfTime]);
  useEffect(() => { localStorage.setItem('quietHoursStart', quietHoursStart); }, [quietHoursStart]);
  useEffect(() => { localStorage.setItem('quietHoursEnd', quietHoursEnd); }, [quietHoursEnd]);
  useEffect(() => { localStorage.setItem('qiyamEnabled', qiyamEnabled.toString()); }, [qiyamEnabled]);
  useEffect(() => { localStorage.setItem('qiyamTime', qiyamTime); }, [qiyamTime]);
  useEffect(() => { localStorage.setItem('fiqhSchool', fiqhSchool.toString()); setSchool(fiqhSchool); }, [fiqhSchool]);
  useEffect(() => {
    window.electronAPI?.getAutoStart?.().then(v => setAutoStart(!!v)).catch(() => {});
  }, []);
  useEffect(() => { localStorage.setItem('notificationsPaused', notificationsPaused.toString()); window.dispatchEvent(new CustomEvent('notificationsPausedChanged', { detail: { paused: notificationsPaused } })); }, [notificationsPaused]);

  useEffect(() => { localStorage.setItem('ramadanStartDate', ramadanStartDate); }, [ramadanStartDate]);
  useEffect(() => { localStorage.setItem('ramadanEndDate', ramadanEndDate); }, [ramadanEndDate]);
  useEffect(() => { localStorage.setItem('ramadanEidDays', ramadanEidDays); }, [ramadanEidDays]);
  useEffect(() => { localStorage.setItem('ramadanSoundType', ramadanSoundType); }, [ramadanSoundType]);
  useEffect(() => { localStorage.setItem('ramadanNotifications', JSON.stringify(ramadanNotifs)); }, [ramadanNotifs]);
  useEffect(() => { localStorage.setItem('ramadanDeedsEnabled', ramadanDeedsEnabled.toString()); }, [ramadanDeedsEnabled]);
  useEffect(() => { localStorage.setItem('cannonEnabled', cannonEnabled.toString()); }, [cannonEnabled]);
  useEffect(() => { localStorage.setItem('ramadanDeedsTypes', JSON.stringify(ramadanDeedsTypes)); }, [ramadanDeedsTypes]);
  useEffect(() => { setRamadanIqamaSettings(ramadanIqama); }, [ramadanIqama]);

  const INTERVAL_MAP = { 15: 900000, 30: 1800000, 60: 3600000, 90: 5400000, 120: 7200000 };
  useEffect(() => {
    if (window.electronAPI?.isElectron) {
      const ms = INTERVAL_MAP[hourlyInterval] || INTERVAL_MAP[60];
      window.electronAPI.setReminderInterval('hourly', ms, hourlyEnabled);
    }
  }, [hourlyEnabled, hourlyInterval]);

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);
  const isOpen = (id) => openSection === id;

  const fontLabels = { small: t.settings.fontSmall, medium: t.settings.fontMedium, large: t.settings.fontLarge, xlarge: t.settings.fontXlarge || 'كبير جداً' };

  const handleReset = () => {
    if (confirm(t.settings.confirmReset)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        *{box-sizing:border-box}
        .settings-page{background:#0c0818;min-height:100vh;padding-bottom:80px}
        .hero{padding:28px 20px 32px;position:relative;overflow:hidden;background:linear-gradient(165deg,#1c1040 0%,#2d1b69 50%,#0c0818 100%)}
        .hero::before{content:'';position:absolute;top:-60px;left:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(139,92,246,.2),transparent 70%);pointer-events:none}
        .hero::after{content:'';position:absolute;bottom:-30px;right:-30px;width:150px;height:150px;background:radial-gradient(circle,rgba(0,200,150,.1),transparent 70%);pointer-events:none}
        .hero-top{display:flex;align-items:center;gap:14px;position:relative;z-index:1}
        .hero-icon{width:52px;height:52px;border-radius:16px;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .hero-title{font-size:22px;font-weight:700;color:#fff}
        .hero-sub{font-size:12px;color:rgba(255,255,255,.4);margin-top:2px}
        .hero-stats{display:flex;gap:10px;margin-top:20px;position:relative;z-index:1}
        .hero-stat{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px;text-align:center}
        .hs-val{font-size:16px;font-weight:700;color:#00c896}
        .hs-label{font-size:10px;color:rgba(255,255,255,.4);margin-top:2px}
        .content{padding:16px}
        .group{margin-bottom:10px}
        .group-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:1px;margin:0 4px 8px;display:flex;align-items:center;gap:6px}
        .group-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06)}
        .scard{background:#151030;border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;margin-bottom:8px}
        .scard-header{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;transition:background .2s;user-select:none}
        .scard-header:hover{background:rgba(255,255,255,.03)}
        .scard-header.open{background:rgba(139,92,246,.04)}
        .s-icon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
        .s-info{flex:1;min-width:0}
        .s-title{font-size:14px;font-weight:700;color:#fff}
        .s-sub{font-size:11px;color:rgba(255,255,255,.38);margin-top:1px}
        .s-arrow{font-size:12px;color:rgba(255,255,255,.25);transition:transform .25s;flex-shrink:0}
        .s-arrow.open{transform:rotate(180deg)}
        .s-badge{padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;flex-shrink:0}
        .panel{display:none;border-top:1px solid rgba(255,255,255,.05)}
        .panel.open{display:block}
        .panel-inner{padding:14px 16px;display:flex;flex-direction:column;gap:10px}
        .row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0}
        .row-info{flex:1}
        .row-label{font-size:13px;font-weight:600;color:rgba(255,255,255,.85)}
        .row-desc{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px}
        .divider{height:1px;background:rgba(255,255,255,.05);margin:2px 0}
        .pill-group{display:flex;gap:5px;flex-wrap:wrap}
        .theme-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .theme-btn{padding:12px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);cursor:pointer;text-align:center;transition:all .2s;font-size:11px;font-weight:700}
        .theme-btn.on{border-color:#8b5cf6;box-shadow:0 0 12px rgba(139,92,246,.2)}
        .theme-dark{background:linear-gradient(135deg,#1a1340,#2d1b69);color:#fff}
        .theme-light{background:linear-gradient(135deg,#f5f0e8,#ede8f5);color:#1a1340}
        .font-preview{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:12px;text-align:center;color:rgba(255,255,255,.8);margin-top:4px;font-family:'Traditional Arabic',serif;font-size:18px;line-height:1.8}
        .city-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
        .city-btn{padding:8px 4px;border-radius:9px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);font-size:11px;font-weight:700;cursor:pointer;text-align:center;transition:all .2s;font-family:inherit}
        .city-btn.on{background:rgba(0,200,150,.12);border-color:rgba(0,200,150,.3);color:#00c896}
        .slider-row{display:flex;align-items:center;gap:10px}
        .slider{flex:1;-webkit-appearance:none;height:4px;border-radius:4px;background:rgba(255,255,255,.1);outline:none;cursor:pointer}
        .slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#00c896;box-shadow:0 0 8px rgba(0,200,150,.4);cursor:pointer}
        .slider-val{font-size:12px;font-weight:700;color:#00c896;min-width:36px;text-align:center}
        .danger-btn{width:100%;padding:13px;border-radius:14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#f87171;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
        .danger-btn:hover{background:rgba(239,68,68,.14)}
        .test-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        .test-btn{padding:10px 8px;border-radius:10px;border:1px solid;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:all .2s}
        .test-btn:hover{filter:brightness(1.15)}
        .version-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .ver-label{font-size:12px;color:rgba(255,255,255,.4)}
        .ver-val{font-size:12px;font-weight:700;color:#00c896}
        .prayer-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .prayer-cell{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:10px}
        .prayer-cell-label{font-size:10px;color:rgba(255,255,255,.35);margin-bottom:5px;font-weight:600}
        .prayer-cell input[type="time"]{background:transparent;border:none;color:#fff;font-size:14px;font-weight:700;outline:none;width:100%;direction:ltr}
        .loc-input{width:100%;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:13px;outline:none;font-family:inherit;direction:rtl}
        .loc-input:focus{border-color:rgba(139,92,246,.4)}
        .loc-input::placeholder{color:rgba(255,255,255,.3)}
      `}</style>

      <div className="settings-page">
        <div className="hero">
          <div className="hero-top">
            <div className="hero-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div>
              <div className="hero-title">{t.settings.title}</div>
              <div className="hero-sub">{t.settings.subtitle}</div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hs-val">14</div><div className="hs-label">{t.settings.sectionsCount || 'قسم'}</div></div>
            <div className="hero-stat"><div className="hs-val">{[soundEnabled, hapticEnabled, adhanEnabled, hourlyEnabled, namesAudioEnabled, subtitleEnabled].filter(Boolean).length + 2}</div><div className="hs-label">{t.settings.activeCountLabel || 'مفعّل'}</div></div>
            <div className="hero-stat"><div className="hs-val">2.0</div><div className="hs-label">{t.settings.version}</div></div>
          </div>
        </div>

        <div className="content">

          {/* ═══ المظهر والشخصية ═══ */}
          <div className="group">
            <div className="group-label">🎨 {t.settings.groupAppearance || 'المظهر والشخصية'}</div>

            {/* Theme */}
            <div className="scard">
              <div className={`scard-header ${isOpen('theme') ? 'open' : ''}`} onClick={() => toggle('theme')}>
                <div className="s-icon" style={{background:'rgba(139,92,246,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.theme}</div><div className="s-sub">{t.settings.dark} / {t.settings.light}</div></div>
                <div className="s-badge" style={{background:'rgba(139,92,246,.12)',color:'#a78bfa',border:'1px solid rgba(139,92,246,.2)'}}>{theme === 'dark' ? '🌙 ' + t.settings.dark : '☀️ ' + t.settings.light}</div>
                <div className={`s-arrow ${isOpen('theme') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('theme') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="theme-row">
                    <button className={`theme-btn theme-dark ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme('dark')}>🌙 {t.settings.dark}</button>
                    <button className={`theme-btn theme-light ${theme === 'light' ? 'on' : ''}`} onClick={() => setTheme('light')}>☀️ {t.settings.light}</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="scard">
              <div className={`scard-header ${isOpen('lang') ? 'open' : ''}`} onClick={() => toggle('lang')}>
                <div className="s-icon" style={{background:'rgba(59,130,246,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.language}</div><div className="s-sub">{t.settings.languageDesc}</div></div>
                <div className={`s-arrow ${isOpen('lang') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('lang') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div className="scard">
              <div className={`scard-header ${isOpen('font') ? 'open' : ''}`} onClick={() => toggle('font')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.fontSize}</div><div className="s-sub">{fontLabels[fontSize]}</div></div>
                <div className="s-badge" style={{background:'rgba(240,176,64,.12)',color:'#f0b040',border:'1px solid rgba(240,176,64,.2)'}}>{fontLabels[fontSize]}</div>
                <div className={`s-arrow ${isOpen('font') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('font') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="pill-group">
                    {['small','medium','large','xlarge'].map(s => (
                      <Pill key={s} active={fontSize === s} color="gold" onClick={() => setFontSize(s)}>{fontLabels[s]}</Pill>
                    ))}
                  </div>
                  <div className="font-preview" style={{fontSize: {small:14,medium:18,large:22,xlarge:26}[fontSize]}}>{t.settings.fontPreview}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ الصوت والإشعارات ═══ */}
          <div className="group">
            <div className="group-label">🔔 {t.settings.groupSound || 'الصوت والإشعارات'}</div>

            {/* Sound & Vibration */}
            <div className="scard">
              <div className={`scard-header ${isOpen('sound') ? 'open' : ''}`} onClick={() => toggle('sound')}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.soundVibration}</div><div className="s-sub">{t.settings.soundOn} + {t.settings.vibration}</div></div>
                <div className="s-badge" style={{background:'rgba(0,200,150,.12)',color:'#00c896',border:'1px solid rgba(0,200,150,.2)'}}>{soundEnabled || hapticEnabled ? 'مفعّل' : 'معطّل'}</div>
                <div className={`s-arrow ${isOpen('sound') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('sound') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.soundOn}</div><div className="row-desc">{t.settings.soundDesc}</div></div>
                    <Toggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.vibration}</div><div className="row-desc">{t.settings.vibrationDesc}</div></div>
                    <Toggle enabled={hapticEnabled} onToggle={() => setHapticEnabled(!hapticEnabled)} />
                  </div>
                  {hapticEnabled && (
                    <>
                      <div className="divider"/>
                      <div className="row">
                        <div className="row-info"><div className="row-label">{t.settings.vibrationStrength}</div></div>
                        <div className="pill-group">
                          {[{v:'light',l:t.settings.vibrationLight||'خفيف'},{v:'medium',l:t.settings.vibrationMedium||'متوسط'},{v:'strong',l:t.settings.vibrationStrong||'قوي'}].map(o => (
                            <Pill key={o.v} active={vibrationStrength === o.v} color="green" onClick={() => setVibrationStrength(o.v)}>{o.l}</Pill>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Adhan */}
            <div className="scard">
              <div className={`scard-header ${isOpen('adhan') ? 'open' : ''}`} onClick={() => toggle('adhan')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="2" strokeLinecap="round"><path d="M12 2C9 2 7 4 7 6v2H5c-1 0-2 1-2 2v2h20v-2c0-1-1-2-2-2h-2V6c0-2-2-4-5-4z"/><rect x="3" y="12" width="18" height="10" rx="1"/><path d="M10 22v-2a2 2 0 0 1 4 0v2"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.adhan}</div><div className="s-sub">{t.settings.adhanDesc}</div></div>
                <Toggle enabled={adhanEnabled} onToggle={(e) => { e.stopPropagation(); setAdhanEnabled(!adhanEnabled); }} />
                <div className={`s-arrow ${isOpen('adhan') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('adhan') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row-label" style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:8}}>{t.settings.adhanType || 'نوع الأذان'}</div>
                  <div className="pill-group">
                    {[{v:'makkah',l:t.settings.adhanMakkah||'المكي'},{v:'madinah',l:t.settings.adhanMadinah||'المدني'},{v:'egyptian',l:t.settings.adhanEgyptian||'مصري'},{v:'abdelbaset',l:t.settings.adhanAbdelbaset||'عبد الباسط'}].map(o => (
                      <Pill key={o.v} active={adhanType === o.v} color="gold" onClick={() => setAdhanType(o.v)}>{o.l}</Pill>
                    ))}
                  </div>
                  <div className="divider" style={{margin:'10px 0'}}/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.adhanVolume || 'حجم صوت الأذان'}</div></div>
                    <div className="slider-row" style={{width:140}}>
                      <input type="range" className="slider" min="0" max="100" value={adhanVolume} onChange={e => setAdhanVolume(parseInt(e.target.value))} />
                      <div className="slider-val">{adhanVolume}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Reminders */}
            <div className="scard">
              <div className={`scard-header ${isOpen('hourly') ? 'open' : ''}`} onClick={() => toggle('hourly')}>
                <div className="s-icon" style={{background:'rgba(236,72,153,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.hourlyReminders}</div><div className="s-sub">{t.settings.hourlyDesc}</div></div>
                <Toggle enabled={hourlyEnabled} onToggle={(e) => { e.stopPropagation(); setHourlyEnabled(!hourlyEnabled); }} />
                <div className={`s-arrow ${isOpen('hourly') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('hourly') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row-label" style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:8}}>{t.settings.timePeriod}</div>
                  <div className="pill-group">
                    {[{v:15,l:'15 دقيقة'},{v:30,l:'30 دقيقة'},{v:60,l:'ساعة'},{v:90,l:'ساعة ونصف'},{v:120,l:'ساعتان'}].map(o => (
                      <Pill key={o.v} active={hourlyInterval === o.v} color="pink" onClick={() => setHourlyInterval(o.v)}>{o.l}</Pill>
                    ))}
                  </div>
                  <div className="divider" style={{margin:'10px 0'}}/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.autoSound}</div><div className="row-desc">{t.settings.autoSoundDesc}</div></div>
                    <Toggle enabled={hourlyAutoSpeak} onToggle={() => setHourlyAutoSpeak(!hourlyAutoSpeak)} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.dndMode || 'عدم الإزعاج ليلاً'}</div><div className="row-desc">{t.settings.dndDesc || 'إيقاف التذكير من 11م حتى 6ص'}</div></div>
                    <Toggle enabled={dndEnabled} onToggle={() => setDndEnabled(!dndEnabled)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="scard">
              <div className={`scard-header ${isOpen('quiet') ? 'open' : ''}`} onClick={() => toggle('quiet')}>
                <div className="s-icon" style={{background:'rgba(99,102,241,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <div className="s-info"><div className="s-title">ساعات الصمت</div><div className="s-sub">إيقاف التنبيهات بعد العشاء حتى الفجر</div></div>
                <div className="s-badge" style={{background:'rgba(99,102,241,.12)',color:'#818cf8',border:'1px solid rgba(99,102,241,.2)'}}>{quietHoursEnabled ? 'مفعّل' : 'معطّل'}</div>
                <Toggle enabled={quietHoursEnabled} onToggle={(e) => { e.stopPropagation(); setQuietHoursEnabled(!quietHoursEnabled); }} />
                <div className={`s-arrow ${isOpen('quiet') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('quiet') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',lineHeight:1.6,marginBottom:8}}>
                    يتم إيقاف تنبيهات الصلاة والأذكار في الفترة المحددة. تنبيه قيام الليل يعمل بشكل مستقل.
                  </div>
                  <div className="row">
                    <div className="row-info"><div className="row-label">وقت البداية</div><div className="row-desc">بعد هذا الوقت تتوقف التنبيهات</div></div>
                    <input type="time" value={quietHoursStart} onChange={e => setQuietHoursStart(e.target.value)}
                      style={{width:100,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:13,fontWeight:700,outline:'none',direction:'ltr',colorScheme:'dark'}} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">وقت النهاية</div><div className="row-desc">بعده تعود التنبيهات</div></div>
                    <input type="time" value={quietHoursEnd} onChange={e => setQuietHoursEnd(e.target.value)}
                      style={{width:100,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:13,fontWeight:700,outline:'none',direction:'ltr',colorScheme:'dark'}} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">🌙 تنبيه قيام الليل</div><div className="row-desc">تنبيه في وقت مخصص لصلاةقيام الليل</div></div>
                    <Toggle enabled={qiyamEnabled} onToggle={() => setQiyamEnabled(!qiyamEnabled)} />
                  </div>
                  {qiyamEnabled && (
                    <>
                      <div className="divider"/>
                      <div className="row">
                        <div className="row-info"><div className="row-label">وقت التنبيه</div><div className="row-desc">الوقت المخصص لتنبيه قيام الليل</div></div>
                        <input type="time" value={qiyamTime} onChange={e => setQiyamTime(e.target.value)}
                          style={{width:100,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:13,fontWeight:700,outline:'none',direction:'ltr',colorScheme:'dark'}} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dhikr Widget */}
            <div className="scard">
              <div className={`scard-header ${isOpen('floatingAzkar') ? 'open' : ''}`} onClick={() => toggle('floatingAzkar')}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <span style={{fontSize:20}}>📿</span>
                </div>
                <div className="s-info"><div className="s-title">مربع التذكيرات</div><div className="s-sub">مربع صغير على الشاشة يعرض ذكر عشوائي — يهرب من الموس</div></div>
                <Toggle enabled={floatingAzkarEnabled} onToggle={(e) => { e.stopPropagation(); setFloatingAzkarEnabled(!floatingAzkarEnabled); }} />
                <div className={`s-arrow ${isOpen('floatingAzkar') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('floatingAzkar') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row-label" style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:8}}>الفترة الزمنية بين كل ذكر</div>
                  <div className="pill-group">
                    {[{v:15,l:'15 دقيقة'},{v:30,l:'30 دقيقة'},{v:60,l:'ساعة'},{v:90,l:'ساعة ونص'},{v:120,l:'ساعتين'}].map(o => (
                      <Pill key={o.v} active={floatingAzkarInterval === o.v} color="green" onClick={() => setFloatingAzkarInterval(o.v)}>{o.l}</Pill>
                    ))}
                  </div>
                  <div className="divider" style={{margin:'10px 0'}}/>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('testDhikrReminder'))} style={{
                    width:'100%',padding:'10px 0',borderRadius:12,border:'1px solid rgba(0,200,150,.2)',
                    background:'rgba(0,200,150,.08)',color:'#00c896',fontSize:13,fontWeight:700,
                    cursor:'pointer',fontFamily:'inherit',transition:'all .2s',
                  }}>▶️ معاينة الآن</button>
                </div>
              </div>
            </div>

            {/* Azkar Desktop Widget */}
            <div className="scard">
              <div className="scard-header" onClick={() => {}}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <span style={{fontSize:20}}>🕌</span>
                </div>
                <div className="s-info"><div className="s-title">مربع الشاشة</div><div className="s-sub">مربع دائم على الشاشة يعرض ذكر عشوائي — يظهر عند تصغير التطبيق</div></div>
                <Toggle enabled={azkarWidgetEnabled} onToggle={(e) => { e.stopPropagation(); setAzkarWidgetEnabled(!azkarWidgetEnabled); }} />
              </div>
            </div>

            {/* Pause Notifications */}
            <div className="scard">
              <div className={`scard-header ${isOpen('pause') ? 'open' : ''}`} onClick={() => toggle('pause')}>
                <div className="s-icon" style={{background: notificationsPaused ? 'rgba(239,68,68,.12)' : 'rgba(0,200,150,.12)'}}>
                  {notificationsPaused ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  )}
                </div>
                <div className="s-info">
                  <div className="s-title">{notificationsPaused ? 'إيقاف التنبيهات' : 'تنبيهات نشطة'}</div>
                  <div className="s-sub">{notificationsPaused ? 'جميع التنبيهات متوقفة مؤقتاً' : 'جميع التنبيهات تعمل بشكل طبيعي'}</div>
                </div>
                <div className="s-badge" style={{background: notificationsPaused ? 'rgba(239,68,68,.12)' : 'rgba(0,200,150,.12)', color: notificationsPaused ? '#f87171' : '#00c896', border: `1px solid ${notificationsPaused ? 'rgba(239,68,68,.2)' : 'rgba(0,200,150,.2)'}`}}>
                  {notificationsPaused ? '⏸️ متوقف' : '▶️ نشط'}
                </div>
                <Toggle enabled={!notificationsPaused} onToggle={(e) => { e.stopPropagation(); setNotificationsPaused(!notificationsPaused); }} />
                <div className={`s-arrow ${isOpen('pause') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('pause') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',lineHeight:1.6}}>
                    عند الإيقاف، لن تظهر تنبيهات الأذان والأذكار والعد التنازلي. يمكنك التحكم بسرعة من الصفحة الرئيسية.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ الموقع وأوقات الصلاة ═══ */}
          <div className="group">
            <div className="group-label">📍 {t.settings.groupLocation || 'الموقع وأوقات الصلاة'}</div>

            {/* Location */}
            <div className="scard">
              <div className={`scard-header ${isOpen('location') ? 'open' : ''}`} onClick={() => toggle('location')}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.city}</div><div className="s-sub">{selectedCity}</div></div>
                <div className="s-badge" style={{background:'rgba(0,200,150,.12)',color:'#00c896',border:'1px solid rgba(0,200,150,.2)'}}>{t.settings.currentLocation || 'الموقع الحالي'}</div>
                <div className={`s-arrow ${isOpen('location') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('location') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    <button onClick={() => { localStorage.removeItem('locationSetupDone'); window.location.reload(); }}
                      style={{flex:1,padding:10,borderRadius:10,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.2)',color:'#a78bfa',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      {t.settings.changeLocation}
                    </button>
                    <button onClick={async () => { localStorage.removeItem('prayerTimesCache'); await getPrayerTimes(); window.location.reload(); }}
                      style={{flex:1,padding:10,borderRadius:10,background:'rgba(0,200,150,.1)',border:'1px solid rgba(0,200,150,.2)',color:'#00c896',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      🔄 تحديث المواقيت
                    </button>
                  </div>
                  <div className="city-grid">
                    {cities.map(c => (
                      <button key={c.name} onClick={async () => { setSelectedCity(c.name); setLocation(c.name, c.lat, c.lng, 'eg'); await getPrayerTimes(); }}
                        className={`city-btn ${selectedCity === c.name ? 'on' : ''}`}>{c.name}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prayer Method */}
            <div className="scard">
              <div className={`scard-header ${isOpen('method') ? 'open' : ''}`} onClick={() => toggle('method')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="2" strokeLinecap="round"><path d="M12 2C9 2 7 4 7 6v2H5c-1 0-2 1-2 2v2h20v-2c0-1-1-2-2-2h-2V6c0-2-2-4-5-4z"/><rect x="3" y="12" width="18" height="10" rx="1"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.prayerMethod}</div><div className="s-sub">{t.settings.prayerMethodDesc}</div></div>
                <div className={`s-arrow ${isOpen('method') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('method') ? 'open' : ''}`}>
                <div className="panel-inner">
                  {[
                    {v:1,l:'أم القرى (مكة المكرمة)',lEn:'Umm al-Qura'},
                    {v:2,l:'رابطة العالم الإسلامي',lEn:'Muslim World League'},
                    {v:3,l:'الهيئة المصرية العامة للمساحة',lEn:'Egyptian General Authority'},
                    {v:4,l:'جامعة الأزهر',lEn:'Al-Azhar'},
                    {v:7,l:'الجمعية الإسلامية لأمريكا الشمالية',lEn:'ISNA'},
                    {v:9,l:'ديوان العدل التركي',lEn:'Diyanet'},
                    {v:12,l:'الهيئة العليا للشؤون الإسلامية في قطر',lEn:'Qatar'},
                  ].map(m => {
                    const active = parseInt(localStorage.getItem('prayerCalcMethod') || '3') === m.v;
                    return (
                      <button key={m.v} onClick={() => { localStorage.setItem('prayerCalcMethod', m.v); localStorage.removeItem('prayerTimesCache'); window.location.reload(); }}
                        style={{padding:'10px 12px',borderRadius:10,border: active ? '1px solid rgba(0,200,150,.25)' : '1px solid rgba(255,255,255,.07)',
                          background: active ? 'rgba(0,200,150,.1)' : 'rgba(255,255,255,.04)',
                          color: active ? '#00c896' : 'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',textAlign:'right',width:'100%'}}>
                        {active ? '✓ ' : ''}{m.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fiqh School (المذهب الفقهي) */}
            <div className="scard">
              <div className={`scard-header ${isOpen('fiqh') ? 'open' : ''}`} onClick={() => toggle('fiqh')}>
                <div className="s-icon" style={{background:'rgba(139,92,246,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.fiqhSchool}</div><div className="s-sub">{t.settings.fiqhSchoolDesc}</div></div>
                <div className={`s-arrow ${isOpen('fiqh') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('fiqh') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {[{code:0,label:t.settings.fiqhShafi},{code:1,label:t.settings.fiqhHanafi}].map(s => {
                      const active = fiqhSchool === s.code;
                      return (
                        <button key={s.code} onClick={() => setFiqhSchool(s.code)}
                          style={{padding:'10px 14px',borderRadius:8,border: active ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,.1)',
                          background: active ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.04)',
                          color: active ? '#8b5cf6' : 'rgba(255,255,255,.7)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',textAlign:'right',width:'100%'}}>
                          {active ? '✓ ' : ''}{s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Prayer Time Offsets (الوقت المضاف) */}
            <div className="scard">
              <div className={`scard-header ${isOpen('offset') ? 'open' : ''}`} onClick={() => toggle('offset')}>
                <div className="s-icon" style={{background:'rgba(251,191,36,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.prayerTimeOffset}</div><div className="s-sub">{t.settings.prayerTimeOffsetDesc}</div></div>
                <div className={`s-arrow ${isOpen('offset') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('offset') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'8px 12px',alignItems:'center'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600}}></div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,textAlign:'center'}}>{t.settings.originalTime}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,textAlign:'center'}}>{t.settings.adjustedTime}</div>
                    {PRAYER_KEYS.map(key => {
                      const currentTimes = getPrayerTimesRawSync();
                      const base = currentTimes[key] || '00:00';
                      const adjusted = applyOffset(base, offsets[key] || 0);
                      return (
                        <Fragment key={key}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontSize:13,color:'rgba(255,255,255,.7)',fontWeight:600,minWidth:50}}>{PRAYER_NAMES_AR[key]}</span>
                            <button onClick={(e) => { e.stopPropagation(); setOffsets(prev => ({...prev, [key]: Math.max(-30, (prev[key]||0) - 1)})); }}
                              style={{width:28,height:28,borderRadius:6,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',color:'#fbbf24',fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>-</button>
                            <span style={{minWidth:36,textAlign:'center',fontSize:14,fontWeight:700,color: offsets[key] > 0 ? '#34d399' : offsets[key] < 0 ? '#f87171' : '#fbbf24'}}>
                              {offsets[key] > 0 ? '+' : ''}{offsets[key] || 0}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); setOffsets(prev => ({...prev, [key]: Math.min(60, (prev[key]||0) + 1)})); }}
                              style={{width:28,height:28,borderRadius:6,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',color:'#fbbf24',fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                            <span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>{t.settings.minutes}</span>
                          </div>
                          <div style={{fontSize:12,color:'rgba(255,255,255,.4)',textAlign:'center',fontVariantNumeric:'tabular-nums'}}>{formatTime12h(base)}</div>
                          <div style={{fontSize:12,color:'#fbbf24',fontWeight:600,textAlign:'center',fontVariantNumeric:'tabular-nums'}}>{formatTime12h(adjusted)}</div>
                        </Fragment>
                      );
                    })}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    <button onClick={() => { setPrayerTimeOffsets(offsets); }}
                      style={{flex:1,padding:10,borderRadius:10,background:'#00c896',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      {t.settings.prayerOffsetSave}
                    </button>
                    <button onClick={() => { const reset = {Fajr:0,Sunrise:0,Dhuhr:0,Asr:0,Maghrib:0,Isha:0}; setOffsets(reset); setPrayerTimeOffsets(reset); }}
                      style={{flex:1,padding:10,borderRadius:10,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      {t.settings.prayerOffsetReset}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Prayer Times */}
            <div className="scard">
              <div className={`scard-header ${isOpen('manual') ? 'open' : ''}`} onClick={() => toggle('manual')}>
                <div className="s-icon" style={{background:'rgba(96,165,250,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.manualPrayerTimes}</div><div className="s-sub">{t.settings.manualPrayerTimesDesc}</div></div>
                <div className={`s-arrow ${isOpen('manual') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('manual') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="prayer-grid">
                    {PRAYER_KEYS.map(key => (
                      <div key={key} className="prayer-cell">
                        <div className="prayer-cell-label">{PRAYER_NAMES_AR[key]}</div>
                        <input type="time" value={manualTimes[key] || ''}
                          onChange={(e) => setManualTimes(prev => ({...prev, [key]: e.target.value}))}
                          style={{colorScheme:'dark'}} />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setManualPrayerTimes(manualTimes)}
                    style={{width:'100%',padding:11,borderRadius:10,background:'#00c896',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    💾 {t.settings.saveTimes}
                  </button>
                  <button onClick={() => { clearManualPrayerTimes(); const c = getPrayerTimesSync(); setManualTimes({Fajr:c.Fajr||'',Sunrise:c.Sunrise||'',Dhuhr:c.Dhuhr||'',Asr:c.Asr||'',Maghrib:c.Maghrib||'',Isha:c.Isha||''}); }}
                    style={{width:'100%',padding:10,borderRadius:10,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    {t.settings.clearEdits}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ القرآن قبل المغرب ═══ */}
          <div className="group">
            <div className="group-label">📖 القرآن قبل المغرب</div>
            <div className="scard">
              <div className="scard-header" onClick={() => {}}>
                <div className="s-icon" style={{background: quranBeforeMaghrib ? 'rgba(0,200,150,.12)' : 'rgba(255,255,255,.06)'}}>
                  <span style={{fontSize:20}}>📖</span>
                </div>
                <div className="s-info">
                  <div className="s-title">تشغيل القرآن قبل المغرب</div>
                  <div className="s-sub">يشتغل تلقائياً قبل وقت المغرب ويقفل مع ظهور العداد</div>
                </div>
                <Toggle enabled={quranBeforeMaghrib} onToggle={(e) => { e.stopPropagation(); setQuranBeforeMaghrib(!quranBeforeMaghrib); }} />
              </div>
              {quranBeforeMaghrib && (
                <div style={{padding:'8px 16px 14px',borderTop:'1px solid var(--border-card)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:12,color:'var(--text-muted)',whiteSpace:'nowrap'}}>يبدأ قبل المغرب:</span>
                    <select value={quranBeforeMaghribMin} onChange={(e) => setQuranBeforeMaghribMin(parseInt(e.target.value))}
                      style={{flex:1,padding:'6px 10px',borderRadius:8,border:'1px solid var(--border-card)',background:'var(--bg-primary)',color:'#fff',fontSize:13}}>
                      <option value={5}>5 دقائق</option>
                      <option value={10}>10 دقائق</option>
                      <option value={15}>15 دقيقة</option>
                      <option value={20}>20 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                    </select>
                  </div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:6}}>القرآن يشتغل تلقائياً قبل المغرب ويقفل مع ظهور العداد (60 ثانية قبل الصلاة).</div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ أوقات القرآن المتعددة ═══ */}
          <div className="group">
            <div className="group-label">🕐 أوقات القرآن اليومية</div>
            <div className="scard">
              <div className="scard-header" onClick={() => {}}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <span style={{fontSize:20}}>📖</span>
                </div>
                <div className="s-info">
                  <div className="s-title">أوقات تشغيل القرآن</div>
                  <div className="s-sub">حدد أوقات في اليوم يشتغل فيها القرآن تلقائياً</div>
                </div>
              </div>
              <div style={{padding:'8px 16px 14px',borderTop:'1px solid var(--border-card)'}}>
                {quranAutoTimes.map((t, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <input type="time" value={t.time} onChange={(e) => {
                      const n = [...quranAutoTimes]; n[i] = { ...n[i], time: e.target.value }; setQuranAutoTimes(n);
                    }} style={{flex:1,padding:'6px 10px',borderRadius:8,border:'1px solid var(--border-card)',background:'var(--bg-primary)',color:'#fff',fontSize:13,colorScheme:'dark'}} />
                    <select value={t.duration} onChange={(e) => {
                      const n = [...quranAutoTimes]; n[i] = { ...n[i], duration: parseInt(e.target.value) }; setQuranAutoTimes(n);
                    }} style={{padding:'6px 10px',borderRadius:8,border:'1px solid var(--border-card)',background:'var(--bg-primary)',color:'#fff',fontSize:13}}>
                      <option value={15}>15 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={60}>ساعة</option>
                      <option value={120}>ساعتين</option>
                    </select>
                    <select value={t.surah || 'random'} onChange={(e) => {
                      const n = [...quranAutoTimes]; n[i] = { ...n[i], surah: e.target.value }; setQuranAutoTimes(n);
                    }} style={{padding:'6px 10px',borderRadius:8,border:'1px solid var(--border-card)',background:'var(--bg-primary)',color:'#fff',fontSize:13}}>
                      <option value="random">سورة عشوائية</option>
                      <option value="kahf">سورة الكهف</option>
                      <option value="yasin">سورة يس</option>
                      <option value="rahman">سورة الرحمن</option>
                      <option value="waqia">سورة الواقعة</option>
                      <option value="mulk">سورة الملك</option>
                    </select>
                    <button onClick={() => {
                      const n = quranAutoTimes.filter((_, j) => j !== i); setQuranAutoTimes(n);
                    }} style={{padding:'6px 10px',borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#ef4444',fontSize:12,cursor:'pointer'}}>✕</button>
                  </div>
                ))}
                <button onClick={() => setQuranAutoTimes([...quranAutoTimes, { time: '05:00', duration: 30, surah: 'random' }])}
                  style={{width:'100%',padding:8,borderRadius:8,background:'rgba(0,200,150,.1)',border:'1px solid rgba(0,200,150,.2)',color:'#00c896',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                  + إضافة وقت
                </button>
                <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:6}}>القرآن يشتغل في الأوقات المحددة ويقفل مع ظهور العداد. السور القصيرة تكمل في السورة التالية.</div>
              </div>
            </div>

            {/* سورة الكهف يوم الجمعة */}
            <div className="scard">
              <div className="scard-header" onClick={() => {}}>
                <div className="s-icon" style={{background: quranFridayKahf ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.06)'}}>
                  <span style={{fontSize:20}}>🕌</span>
                </div>
                <div className="s-info">
                  <div className="s-title">سورة الكهف يوم الجمعة</div>
                  <div className="s-sub">تشغيل سورة الكهف تلقائياً يوم الجمعة</div>
                </div>
                <Toggle enabled={quranFridayKahf} onToggle={(e) => { e.stopPropagation(); setQuranFridayKahf(!quranFridayKahf); }} />
              </div>
              {quranFridayKahf && (
                <div style={{padding:'8px 16px 14px',borderTop:'1px solid var(--border-card)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:12,color:'var(--text-muted)',whiteSpace:'nowrap'}}>يبدأ من:</span>
                    <input type="time" value={quranFridayKahfTime} onChange={(e) => setQuranFridayKahfTime(e.target.value)}
                      style={{flex:1,padding:'6px 10px',borderRadius:8,border:'1px solid var(--border-card)',background:'var(--bg-primary)',color:'#fff',fontSize:13,colorScheme:'dark'}} />
                  </div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:6}}>يشتغل من الوقت المحدد لحد المغرب. السورة تكمل حتى نهايتها.</div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ التخصيص المتقدم ═══ */}
          <div className="group">
            <div className="group-label">⚡ {t.settings.groupAdvanced || 'التخصيص المتقدم'}</div>

            {/* Names of Allah Audio */}
            <div className="scard">
              <div className={`scard-header ${isOpen('names') ? 'open' : ''}`} onClick={() => toggle('names')}>
                <div className="s-icon" style={{background:'rgba(244,114,182,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="20" r="2"/><circle cx="6" cy="8" r="1.5"/><circle cx="18" cy="8" r="1.5"/><circle cx="6" cy="16" r="1.5"/><circle cx="18" cy="16" r="1.5"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.namesOfAllah?.audioSettings || 'أسماء الله الحسنى'}</div><div className="s-sub">{t.namesOfAllah?.audioSettingsDesc || 'تشغيل الأسماء تلقائياً'}</div></div>
                <Toggle enabled={namesAudioEnabled} onToggle={(e) => { e.stopPropagation(); setNamesAudioEnabled(!namesAudioEnabled); }} />
                <div className={`s-arrow ${isOpen('names') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('names') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row"><div className="row-info"><div className="row-label">{t.namesOfAllah?.audioNames || 'الأسماء المختارة'}</div></div></div>
                  <div className="pill-group" style={{marginTop:4}}>
                    <Pill active={namesAudioMode === 'all'} color="pink" onClick={() => setNamesAudioMode('all')}>{t.namesOfAllah?.audioAll || 'الكل (100)'}</Pill>
                    <Pill active={namesAudioMode === 'custom'} color="pink" onClick={() => setNamesAudioMode('custom')}>{t.namesOfAllah?.audioCustom || 'مخصص'}</Pill>
                  </div>
                  <div className="divider" style={{margin:'10px 0'}}/>
                  <div className="row"><div className="row-info"><div className="row-label">{t.namesOfAllah?.audioDuration || 'مدة كل اسم'}</div></div></div>
                  <div className="pill-group" style={{marginTop:4}}>
                    {[5,10,15,30].map(d => (
                      <Pill key={d} active={namesAudioDuration === d} color="pink" onClick={() => setNamesAudioDuration(d)}>{d} ث</Pill>
                    ))}
                  </div>
                  <div className="divider" style={{margin:'10px 0'}}/>
                  <div className="row"><div className="row-info"><div className="row-label">{t.namesOfAllah?.audioTimeRange || 'نطاق الوقت'}</div></div></div>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
                    <input type="time" value={namesAudioTimeStart} onChange={e => setNamesAudioTimeStart(e.target.value)}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                    <span style={{color:'rgba(255,255,255,.3)',fontSize:12}}>→</span>
                    <input type="time" value={namesAudioTimeEnd} onChange={e => setNamesAudioTimeEnd(e.target.value)}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitles */}
            <div className="scard">
              <div className={`scard-header ${isOpen('subtitles') ? 'open' : ''}`} onClick={() => toggle('subtitles')}>
                <div className="s-icon" style={{background:'rgba(20,184,166,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4m2 0h4M7 11h2m2 0h6"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.subtitles || 'الترجمة النصية'}</div><div className="s-sub">{t.settings.subtitlesDesc || 'عرض النص أثناء التشغيل الصوتي'}</div></div>
                <Toggle enabled={subtitleEnabled} onToggle={(e) => { e.stopPropagation(); setSubtitleEnabled(!subtitleEnabled); }} />
                <div className={`s-arrow ${isOpen('subtitles') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('subtitles') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.subtitleFontSize || 'حجم الخط'}</div></div>
                    <div className="pill-group">
                      {[{v:'small',l:'صغير'},{v:'medium',l:'متوسط'},{v:'large',l:'كبير'}].map(o => (
                        <Pill key={o.v} active={subtitleFontSize === o.v} color="green" onClick={() => setSubtitleFontSize(o.v)}>{o.l}</Pill>
                      ))}
                    </div>
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.subtitlePosition || 'موضع النص'}</div></div>
                    <div className="pill-group">
                      {[{v:'bottom',l:t.settings.subtitlePositionBottom||'أسفل'},{v:'top',l:t.settings.subtitlePositionTop||'أعلى'},{v:'center',l:t.settings.subtitlePositionCenter||'وسط'}].map(o => (
                        <Pill key={o.v} active={subtitlePosition === o.v} color="green" onClick={() => setSubtitlePosition(o.v)}>{o.l}</Pill>
                      ))}
                    </div>
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.subtitleBgColor || 'لون الخلفية'}</div></div>
                    <div className="pill-group">
                      {[{v:'dark',l:'⬛',bg:'#000',bc:'#444'},{v:'purple',l:'🟣',bg:'rgba(30,0,60,.8)',bc:'#8b5cf6'},{v:'green',l:'🟢',bg:'rgba(0,40,20,.8)',bc:'#00c896'}].map(o => (
                        <Pill key={o.v} active={subtitleBgColor === o.v} color="green" onClick={() => setSubtitleBgColor(o.v)}>
                          <span style={{display:'inline-block',width:16,height:16,borderRadius:4,background:o.bg,border:`1px solid ${o.bc}`}}/>
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ إدارة المحتوى ═══ */}
          <div className="group">
            <div className="group-label">🗑️ إدارة المحتوى</div>

            {/* Names of Allah */}
            <div className="scard">
              <div className={`scard-header ${isOpen('contentNames') ? 'open' : ''}`} onClick={() => toggle('contentNames')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <span style={{fontSize:20}}>📿</span>
                </div>
                <div className="s-info"><div className="s-title">أسماء الله الحسنى</div><div className="s-sub">{100 - deletedNames.length} من 100 اسم مفعّل</div></div>
                <div className="s-badge" style={{background:'rgba(240,176,64,.12)',color:'#f0b040',border:'1px solid rgba(240,176,64,.2)'}}>{deletedNames.length > 0 ? `${deletedNames.length} محذوف` : 'الكل'}</div>
                <div className={`s-arrow ${isOpen('contentNames') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('contentNames') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اضغط 🎧 للاستماع أو 🗑️ للحذف</div>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    <button onClick={() => { setDeletedNames([]); localStorage.setItem('deletedNamesIds', '[]'); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(0,200,150,.1)',border:'1px solid rgba(0,200,150,.2)',color:'#00c896',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>✅ تحديد الكل</button>
                    <button onClick={() => { const all = namesOfAllah.map(n => n.id); setDeletedNames(all); localStorage.setItem('deletedNamesIds', JSON.stringify(all)); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>❌ إزالة الكل</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:400,overflowY:'auto'}}>
                    {namesOfAllah.map(name => {
                      const deleted = deletedNames.includes(name.id);
                      return (
                        <div key={name.id} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,
                          border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(240,176,64,.15)'}`,
                          background: deleted ? 'rgba(239,68,68,.06)' : 'rgba(240,176,64,.04)',
                          opacity: deleted ? 0.5 : 1,transition:'all .2s'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:deleted?'rgba(239,68,68,.6)':'#f0b040',fontFamily:"'Amiri Quran',serif",
                              textDecoration:deleted?'line-through':'none'}}>{name.name_ar}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:1}}>{name.name_en} • {name.meaning_ar}</div>
                          </div>
                          {!deleted && (
                            <button onClick={(e) => { e.stopPropagation(); const a = new Audio(`names-voices/${name.id}.mp3`); a.play().catch(()=>{}); }}
                              style={{padding:'4px 8px',borderRadius:6,border:'1px solid rgba(240,176,64,.2)',background:'rgba(240,176,64,.1)',color:'#f0b040',fontSize:11,cursor:'pointer',flexShrink:0}}>🎧</button>
                          )}
                          <button onClick={() => { const next = toggleDeletedId('deletedNamesIds', name.id); setDeletedNames(next); }}
                            style={{padding:'4px 8px',borderRadius:6,border:`1px solid ${deleted?'rgba(240,176,64,.2)':'rgba(239,68,68,.2)'}`,background:deleted?'rgba(240,176,64,.1)':'rgba(239,68,68,.08)',color:deleted?'#f0b040':'#f87171',fontSize:11,cursor:'pointer',flexShrink:0}}>
                            {deleted ? '↩️' : '🗑️'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Azkar */}
            <div className="scard">
              <div className={`scard-header ${isOpen('contentAzkar') ? 'open' : ''}`} onClick={() => toggle('contentAzkar')}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <span style={{fontSize:20}}>🕌</span>
                </div>
                <div className="s-info"><div className="s-title">أذكار الساعات</div><div className="s-sub">{hourlyAzkar.length - deletedAzkar.length} من {hourlyAzkar.length} ذكر مفعّل</div></div>
                <div className="s-badge" style={{background:'rgba(0,200,150,.12)',color:'#00c896',border:'1px solid rgba(0,200,150,.2)'}}>{deletedAzkar.length > 0 ? `${deletedAzkar.length} محذوف` : 'الكل'}</div>
                <div className={`s-arrow ${isOpen('contentAzkar') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('contentAzkar') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اضغط 🎧 للاستماع أو 🗑️ للحذف</div>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    <button onClick={() => { setDeletedAzkar([]); localStorage.setItem('deletedAzkarIds', '[]'); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(0,200,150,.1)',border:'1px solid rgba(0,200,150,.2)',color:'#00c896',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>✅ تحديد الكل</button>
                    <button onClick={() => { const all = hourlyAzkar.map(a => a.id); setDeletedAzkar(all); localStorage.setItem('deletedAzkarIds', JSON.stringify(all)); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>❌ إزالة الكل</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:400,overflowY:'auto'}}>
                    {hourlyAzkar.map(azkar => {
                      const deleted = deletedAzkar.includes(azkar.id);
                      return (
                        <div key={azkar.id} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,
                          border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(0,200,150,.15)'}`,
                          background: deleted ? 'rgba(239,68,68,.06)' : 'rgba(0,200,150,.04)',
                          opacity: deleted ? 0.5 : 1,transition:'all .2s'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:deleted?'rgba(239,68,68,.6)':'#00c896',textDecoration:deleted?'line-through':'none'}}>
                              📿 ذكر {azkar.id}
                            </div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:2}}>
                              {azkar.category} • {azkar.audio ? '🎵 صوت' : '🗣️ نص'}
                            </div>
                          </div>
                          {!deleted && azkar.audio && (
                            <button onClick={(e) => { e.stopPropagation(); const a = new Audio(azkar.audio); a.play().catch(()=>{}); }}
                              style={{padding:'4px 8px',borderRadius:6,border:'1px solid rgba(0,200,150,.2)',background:'rgba(0,200,150,.1)',color:'#00c896',fontSize:11,cursor:'pointer',flexShrink:0}}>🎧</button>
                          )}
                          <button onClick={() => { const next = toggleDeletedId('deletedAzkarIds', azkar.id); setDeletedAzkar(next); }}
                            style={{padding:'4px 8px',borderRadius:6,border:`1px solid ${deleted?'rgba(0,200,150,.2)':'rgba(239,68,68,.2)'}`,background:deleted?'rgba(0,200,150,.1)':'rgba(239,68,68,.08)',color:deleted?'#00c896':'#f87171',fontSize:11,cursor:'pointer',flexShrink:0}}>
                            {deleted ? '↩️' : '🗑️'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Custom Dhikr */}
            <div className="scard">
              <div className={`scard-header ${isOpen('addDhikr') ? 'open' : ''}`} onClick={() => toggle('addDhikr')}>
                <div className="s-icon" style={{background:'rgba(0,200,150,.12)'}}>
                  <span style={{fontSize:20}}>➕</span>
                </div>
                <div className="s-info"><div className="s-title">إضافة ذكر مخصص</div><div className="s-sub">أضف ذكراً بنص أو صوت مسجل</div></div>
                <div className="s-badge" style={{background:'rgba(0,200,150,.12)',color:'#00c896',border:'1px solid rgba(0,200,150,.2)'}}>{customAzkar.length} مضاف</div>
                <div className={`s-arrow ${isOpen('addDhikr') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('addDhikr') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اكتب نص الذكر واختيارياً أضف ملف صوتي MP3</div>

                  {/* Text Input */}
                  <textarea value={newDhikrText} onChange={e => setNewDhikrText(e.target.value)}
                    placeholder="اكتب نص الذكر هنا..."
                    rows={3}
                    style={{width:'100%',padding:10,borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:13,fontFamily:'inherit',resize:'vertical',outline:'none',direction:'rtl',lineHeight:1.8}} />

                  {/* Category */}
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:6,marginTop:4}}>التصنيف</div>
                  <div className="pill-group">
                    {['ذكر','دعاء','تسبيح','استغفار','صلاة على النبي'].map(cat => (
                      <Pill key={cat} active={newDhikrCategory === cat} color="green" onClick={() => setNewDhikrCategory(cat)}>{cat}</Pill>
                    ))}
                  </div>

                  {/* Audio Upload + Record */}
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <label style={{flex:1,display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:10,border:'1px dashed rgba(0,200,150,.3)',background:'rgba(0,200,150,.05)',cursor:'pointer',transition:'all .2s'}}>
                      <span style={{fontSize:18}}>🎵</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#00c896',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{newDhikrAudioName || 'رفع MP3'}</div>
                      </div>
                      <input type="file" accept="audio/mp3,audio/mpeg,audio/*" style={{display:'none'}}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setNewDhikrAudioName(file.name);
                          const reader = new FileReader();
                          reader.onload = (ev) => setNewDhikrAudio(ev.target.result);
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                    <button onClick={async () => {
                      if (isRecording && mediaRecorder) {
                        mediaRecorder.stop();
                        setIsRecording(false);
                        return;
                      }
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const recorder = new MediaRecorder(stream);
                        audioChunksRef.current = [];
                        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                        recorder.onstop = () => {
                          const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewDhikrAudio(ev.target.result);
                            setNewDhikrAudioName('🎙️ تسجيل صوتي');
                          };
                          reader.readAsDataURL(blob);
                          stream.getTracks().forEach(t => t.stop());
                        };
                        recorder.start();
                        setMediaRecorder(recorder);
                        setIsRecording(true);
                      } catch (err) {
                        alert('مسموح بالوصول للميكروفون');
                      }
                    }} style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${isRecording ? 'rgba(239,68,68,.4)' : 'rgba(0,200,150,.3)'}`,background:isRecording ? 'rgba(239,68,68,.12)' : 'rgba(0,200,150,.05)',color:isRecording ? '#f87171' : '#00c896',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
                      {isRecording ? '⏹️ إيقاف' : '🎙️ تسجيل'}
                    </button>
                  </div>

                  {/* Time Range */}
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:6,marginTop:10}}>نطاق الوقت</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="time" value={newDhikrTimeStart} onChange={e => setNewDhikrTimeStart(e.target.value)}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                    <span style={{color:'rgba(255,255,255,.3)',fontSize:12,fontWeight:700}}>إلى</span>
                    <input type="time" value={newDhikrTimeEnd} onChange={e => setNewDhikrTimeEnd(e.target.value)}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                  </div>

                  {/* Interval */}
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:6,marginTop:10}}>التكرار كل</div>
                  <div className="pill-group">
                    {[{v:15,l:'15 دقيقة'},{v:30,l:'30 دقيقة'},{v:60,l:'ساعة'},{v:90,l:'ساعة ونصف'},{v:120,l:'ساعتان'}].map(o => (
                      <Pill key={o.v} active={newDhikrInterval === o.v} color="green" onClick={() => setNewDhikrInterval(o.v)}>{o.l}</Pill>
                    ))}
                  </div>

                  {/* Add Button */}
                  <button onClick={() => {
                    if (!newDhikrText.trim()) return;
                    const newDhikr = {
                      id: 'custom_' + Date.now(),
                      text: newDhikrText.trim(),
                      audio: newDhikrAudio,
                      category: newDhikrCategory,
                      timeStart: newDhikrTimeStart,
                      timeEnd: newDhikrTimeEnd,
                      interval: newDhikrInterval,
                      custom: true
                    };
                    const next = [...customAzkar, newDhikr];
                    setCustomAzkar(next);
                    localStorage.setItem('customAzkarList', JSON.stringify(next));
                    setNewDhikrText('');
                    setNewDhikrAudio(null);
                    setNewDhikrAudioName('');
                    setNewDhikrTimeStart('06:00');
                    setNewDhikrTimeEnd('22:00');
                    setNewDhikrInterval(30);
                    window.dispatchEvent(new Event('customAzkarChanged'));
                  }} style={{
                    width:'100%',padding:12,borderRadius:12,background:newDhikrText.trim() ? '#00c896' : 'rgba(255,255,255,.05)',
                    border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:newDhikrText.trim() ? 'pointer' : 'not-allowed',
                    fontFamily:'inherit',marginTop:10,opacity:newDhikrText.trim() ? 1 : 0.5
                  }}>➕ إضافة الذكر</button>

                  {/* Custom Azkar List */}
                  {customAzkar.length > 0 && (
                    <>
                      <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'12px 0'}}/>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>الأذكار المخصصة المضافة ({customAzkar.length})</div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:250,overflowY:'auto'}}>
                        {customAzkar.map(dhikr => (
                          <div key={dhikr.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,border:'1px solid rgba(0,200,150,.15)',background:'rgba(0,200,150,.05)'}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:'#00c896',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{dhikr.text.substring(0, 50)}{dhikr.text.length > 50 ? '...' : ''}</div>
                              <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:2,display:'flex',gap:6,flexWrap:'wrap'}}>
                                <span>{dhikr.category}</span>
                                <span>•</span>
                                <span>{dhikr.timeStart || '06:00'} - {dhikr.timeEnd || '22:00'}</span>
                                <span>•</span>
                                <span>كل {dhikr.interval || 30} د</span>
                                {dhikr.audio && <><span>•</span><span>🎵</span></>}
                              </div>
                            </div>
                            <button onClick={() => {
                              const next = customAzkar.filter(d => d.id !== dhikr.id);
                              setCustomAzkar(next);
                              localStorage.setItem('customAzkarList', JSON.stringify(next));
                              window.dispatchEvent(new Event('customAzkarChanged'));
                            }} style={{padding:'4px 8px',borderRadius:6,border:'1px solid rgba(239,68,68,.2)',background:'rgba(239,68,68,.08)',color:'#f87171',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>🗑️</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { setCustomAzkar([]); localStorage.setItem('customAzkarList', '[]'); window.dispatchEvent(new Event('customAzkarChanged')); }}
                        style={{width:'100%',padding:8,borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginTop:8}}>🗑️ حذف الكل</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Hourly Hadiths */}
            <div className="scard">
              <div className={`scard-header ${isOpen('contentHadiths') ? 'open' : ''}`} onClick={() => toggle('contentHadiths')}>
                <div className="s-icon" style={{background:'rgba(139,92,246,.12)'}}>
                  <span style={{fontSize:20}}>📖</span>
                </div>
                <div className="s-info"><div className="s-title">أحاديث الساعات</div><div className="s-sub">{hourlyHadiths.length - deletedHadiths.length} من {hourlyHadiths.length} حديث مفعّل</div></div>
                <div className="s-badge" style={{background:'rgba(139,92,246,.12)',color:'#a78bfa',border:'1px solid rgba(139,92,246,.2)'}}>{deletedHadiths.length > 0 ? `${deletedHadiths.length} محذوف` : 'الكل'}</div>
                <div className={`s-arrow ${isOpen('contentHadiths') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('contentHadiths') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اضغط 🎧 للاستماع أو 🗑️ للحذف</div>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    <button onClick={() => { setDeletedHadiths([]); localStorage.setItem('deletedHadithsIds', '[]'); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.2)',color:'#a78bfa',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>✅ تحديد الكل</button>
                    <button onClick={() => { const all = hourlyHadiths.map(h => h.id); setDeletedHadiths(all); localStorage.setItem('deletedHadithsIds', JSON.stringify(all)); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>❌ إزالة الكل</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:400,overflowY:'auto'}}>
                    {hourlyHadiths.map(hadith => {
                      const deleted = deletedHadiths.includes(hadith.id);
                      return (
                        <div key={hadith.id} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:8,
                          border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(139,92,246,.15)'}`,
                          background: deleted ? 'rgba(239,68,68,.06)' : 'rgba(139,92,246,.04)',
                          opacity: deleted ? 0.5 : 1,transition:'all .2s'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:deleted?'rgba(239,68,68,.6)':'#a78bfa',textDecoration:deleted?'line-through':'none'}}>
                              {hadith.emoji} {hadith.text.substring(0, 55)}...
                            </div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:2}}>{hadith.source} • {hadith.category}</div>
                          </div>
                          {!deleted && (
                            <button onClick={(e) => { e.stopPropagation(); speakArabic(hadith.text, ()=>{}); }}
                              style={{padding:'4px 8px',borderRadius:6,border:'1px solid rgba(139,92,246,.2)',background:'rgba(139,92,246,.1)',color:'#a78bfa',fontSize:11,cursor:'pointer',flexShrink:0}}>🎧</button>
                          )}
                          <button onClick={() => { const next = toggleDeletedId('deletedHadithsIds', hadith.id); setDeletedHadiths(next); }}
                            style={{padding:'4px 8px',borderRadius:6,border:`1px solid ${deleted?'rgba(139,92,246,.2)':'rgba(239,68,68,.2)'}`,background:deleted?'rgba(139,92,246,.1)':'rgba(239,68,68,.08)',color:deleted?'#a78bfa':'#f87171',fontSize:11,cursor:'pointer',flexShrink:0}}>
                            {deleted ? '↩️' : '🗑️'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Behavior */}
            <div className="scard">
              <div className={`scard-header ${isOpen('contentBehavior') ? 'open' : ''}`} onClick={() => toggle('contentBehavior')}>
                <div className="s-icon" style={{background:'rgba(34,211,238,.12)'}}>
                  <span style={{fontSize:20}}>🕌</span>
                </div>
                <div className="s-info"><div className="s-title">سلوك المسلم</div><div className="s-sub">{behaviorInJoy.length + behaviorInGrief.length - deletedBehavior.length} من {behaviorInJoy.length + behaviorInGrief.length} حديث مفعّل</div></div>
                <div className="s-badge" style={{background:'rgba(34,211,238,.12)',color:'#22d3ee',border:'1px solid rgba(34,211,238,.2)'}}>{deletedBehavior.length > 0 ? `${deletedBehavior.length} محذوف` : 'الكل'}</div>
                <div className={`s-arrow ${isOpen('contentBehavior') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('contentBehavior') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اضغط على حديث لإزالته أو إعادته</div>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    <button onClick={() => { setDeletedBehavior([]); localStorage.setItem('deletedBehaviorIds', '[]'); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(34,211,238,.1)',border:'1px solid rgba(34,211,238,.2)',color:'#22d3ee',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>✅ تحديد الكل</button>
                    <button onClick={() => { const all = [...behaviorInJoy, ...behaviorInGrief].map(b => b.id); setDeletedBehavior(all); localStorage.setItem('deletedBehaviorIds', JSON.stringify(all)); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>❌ إزالة الكل</button>
                  </div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:700,marginBottom:6}}>في الفرح ({behaviorInJoy.length})</div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:200,overflowY:'auto',marginBottom:10}}>
                    {behaviorInJoy.map(b => {
                      const deleted = deletedBehavior.includes(b.id);
                      return (
                        <button key={b.id} onClick={() => {
                          const next = toggleDeletedId('deletedBehaviorIds', b.id);
                          setDeletedBehavior(next);
                        }} style={{
                          padding:'8px 10px',borderRadius:8,textAlign:'right',border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(34,211,238,.2)'}`,
                          background: deleted ? 'rgba(239,68,68,.08)' : 'rgba(34,211,238,.08)',
                          color: deleted ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.7)',
                          fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                          opacity: deleted ? 0.5 : 1,textDecoration: deleted ? 'line-through' : 'none',
                          transition:'all .2s',lineHeight:1.6
                        }}>{b.title}</button>
                      );
                    })}
                  </div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:700,marginBottom:6}}>في الحزن ({behaviorInGrief.length})</div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:200,overflowY:'auto'}}>
                    {behaviorInGrief.map(b => {
                      const deleted = deletedBehavior.includes(b.id);
                      return (
                        <button key={b.id} onClick={() => {
                          const next = toggleDeletedId('deletedBehaviorIds', b.id);
                          setDeletedBehavior(next);
                        }} style={{
                          padding:'8px 10px',borderRadius:8,textAlign:'right',border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(34,211,238,.2)'}`,
                          background: deleted ? 'rgba(239,68,68,.08)' : 'rgba(34,211,238,.08)',
                          color: deleted ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.7)',
                          fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                          opacity: deleted ? 0.5 : 1,textDecoration: deleted ? 'line-through' : 'none',
                          transition:'all .2s',lineHeight:1.6
                        }}>{b.title}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Best Deeds */}
            <div className="scard">
              <div className={`scard-header ${isOpen('contentDeeds') ? 'open' : ''}`} onClick={() => toggle('contentDeeds')}>
                <div className="s-icon" style={{background:'rgba(251,191,36,.12)'}}>
                  <span style={{fontSize:20}}>⭐</span>
                </div>
                <div className="s-info"><div className="s-title">أفضل الأعمال</div><div className="s-sub">{bestDeeds.length - deletedDeeds.length} من {bestDeeds.length} عمل مفعّل</div></div>
                <div className="s-badge" style={{background:'rgba(251,191,36,.12)',color:'#fbbf24',border:'1px solid rgba(251,191,36,.2)'}}>{deletedDeeds.length > 0 ? `${deletedDeeds.length} محذوف` : 'الكل'}</div>
                <div className={`s-arrow ${isOpen('contentDeeds') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('contentDeeds') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:8}}>اضغط على عمل لإزالته أو إعادته</div>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    <button onClick={() => { setDeletedDeeds([]); localStorage.setItem('deletedDeedsIds', '[]'); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',color:'#fbbf24',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>✅ تحديد الكل</button>
                    <button onClick={() => { const all = bestDeeds.map(d => d.id); setDeletedDeeds(all); localStorage.setItem('deletedDeedsIds', JSON.stringify(all)); }}
                      style={{flex:1,padding:8,borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>❌ إزالة الكل</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:300,overflowY:'auto'}}>
                    {bestDeeds.map(deed => {
                      const deleted = deletedDeeds.includes(deed.id);
                      return (
                        <button key={deed.id} onClick={() => {
                          const next = toggleDeletedId('deletedDeedsIds', deed.id);
                          setDeletedDeeds(next);
                        }} style={{
                          padding:'8px 10px',borderRadius:8,textAlign:'right',border:`1px solid ${deleted ? 'rgba(239,68,68,.2)' : 'rgba(251,191,36,.2)'}`,
                          background: deleted ? 'rgba(239,68,68,.08)' : 'rgba(251,191,36,.08)',
                          color: deleted ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.7)',
                          fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                          opacity: deleted ? 0.5 : 1,textDecoration: deleted ? 'line-through' : 'none',
                          transition:'all .2s',lineHeight:1.6
                        }}>{deed.emoji} {deed.title}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ رمضان ═══ */}
          <div className="group">
            <div className="group-label">🌙 {t.settings.groupRamadan || 'رمضان'}</div>
            <div className="scard">
              <div className={`scard-header ${isOpen('ramadan') ? 'open' : ''}`} onClick={() => toggle('ramadan')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.ramadanTitle || 'رمضان'}</div><div className="s-sub">{t.settings.ramadanAutoDesc || 'تلقائي حسب الشهر الهجري'}</div></div>
                <div className="s-badge" style={{background:'rgba(240,176,64,.12)',color:'#f0b040',border:'1px solid rgba(240,176,64,.2)'}}>تلقائي 🌙</div>
                <div className={`s-arrow ${isOpen('ramadan') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('ramadan') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',lineHeight:1.6,marginBottom:8}}>
                    التنبيهات تعمل تلقائياً حسب الشهر الهجري. إذا كان التقويم لديك مختلف، يمكنك تعديل التواريخ يدوياً أدناه.
                  </div>

                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.ramadanStartDate || 'بداية رمضان'}</div><div className="row-desc">تلقائي: 1 رمضان الهجري</div></div>
                    <input type="date" value={ramadanStartDate} onChange={e => setRamadanStartDate(e.target.value)}
                      style={{width:130,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.ramadanEndDate || 'نهاية رمضان'}</div><div className="row-desc">تلقائي: 30 رمضان الهجري</div></div>
                    <input type="date" value={ramadanEndDate} onChange={e => setRamadanEndDate(e.target.value)}
                      style={{width:130,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:12,outline:'none',direction:'ltr',fontWeight:700,colorScheme:'dark'}} />
                  </div>
                  <div className="divider"/>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.ramadanEidDays || 'أيام العيد'}</div><div className="row-desc">تلقائي: 1-3 شوال</div></div>
                    <input type="text" value={ramadanEidDays} onChange={e => setRamadanEidDays(e.target.value)}
                      placeholder="2026-03-30,2026-03-31"
                      style={{width:130,padding:8,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',fontSize:11,outline:'none',direction:'ltr',fontWeight:700}} />
                  </div>

                  <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'12px 0'}}/>

                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:700,marginBottom:8}}>{t.settings.ramadanNotifications || 'التنبيهات'}</div>

                  {[
                    {id:'suhoor',icon:'🌅',title:'تنبيه السحور',offset:45},
                    {id:'imsak',icon:'🕋',title:'تنبيه الإمساك',offset:10},
                    {id:'iftarSunan',icon:'🌤️',title:'سنن الإفطار',offset:15},
                    {id:'iftar',icon:'🌇',title:'تنبيه الإفطار',offset:0},
                    {id:'qiyam',icon:'🌙',title:'قيام الليل',offset:60},
                  ].map(n => {
                    const enabled = ramadanNotifs[n.id]?.enabled !== false;
                    const offset = ramadanNotifs[n.id]?.offset ?? n.offset;
                    return (
                      <div key={n.id}>
                        <div className="row">
                          <div className="row-info">
                            <div className="row-label">{n.icon} {n.title}</div>
                            {n.offset > 0 && <div className="row-desc">{t.settings.ramadanBefore || 'قبل'} {n.id === 'iftar' ? (t.settings.ramadanMaghrib || 'المغرب') : (t.settings.ramadanFajr || 'الفجر')} {n.offset} {t.settings.ramadanMin || 'دقيقة'}</div>}
                            {n.offset === 0 && <div className="row-desc">{t.settings.ramadanAtAdhan || 'عند الأذان مباشرة'}</div>}
                          </div>
                          <Toggle enabled={enabled} onToggle={() => setRamadanNotifs(prev => ({...prev, [n.id]: { ...prev[n.id], enabled: !enabled, offset }}))} />
                        </div>
                        {enabled && n.offset > 0 && (
                          <div className="row" style={{paddingTop:0}}>
                            <div className="slider-row" style={{width:'100%'}}>
                              <input type="range" className="slider" min="5" max="90" value={offset}
                                onChange={e => setRamadanNotifs(prev => ({...prev, [n.id]: { ...prev[n.id], enabled, offset: parseInt(e.target.value) }}))} />
                              <div className="slider-val">{offset} {t.settings.ramadanMin || 'دقيقة'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'12px 0'}}/>

                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:700,marginBottom:8}}>{t.settings.ramadanSound || 'صوت التنبيه'}</div>
                  <div className="pill-group">
                    {[{v:'adhan',l:t.settings.ramadanAdhanSound || 'أذان مختصر'},{v:'tone',l:t.settings.ramadanToneSound || 'نغمة هادئة'},{v:'none',l:t.settings.ramadanNoSound || 'بدون صوت'}].map(o => (
                      <Pill key={o.v} active={ramadanSoundType === o.v} color="gold" onClick={() => setRamadanSoundType(o.v)}>{o.l}</Pill>
                    ))}
                  </div>

                  <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'12px 0'}}/>

                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:700,marginBottom:8}}>{t.settings.ramadanDeeds || 'الأعمال اليومية'}</div>
                  <div className="row">
                    <div className="row-info"><div className="row-label">{t.settings.ramadanDeedsDesc || 'تذكيرات يومية بالأعمال المحبوبة'}</div></div>
                    <Toggle enabled={ramadanDeedsEnabled} onToggle={() => setRamadanDeedsEnabled(!ramadanDeedsEnabled)} />
                  </div>
                  {ramadanDeedsEnabled && (
                    <div className="pill-group" style={{marginTop:6}}>
                      {[{id:'charity',l:'💰 صدقة'},{id:'kinship',l:'🤍 صلة رحم'},{id:'istighfar',l:'🌿 استغفار'},{id:'quran',l:'📖 قرآن'}].map(d => (
                        <Pill key={d.id} active={ramadanDeedsTypes.includes(d.id)} color="gold" onClick={() => {
                          setRamadanDeedsTypes(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]);
                        }}>{d.l}</Pill>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ تلاوة قبل المغرب ═══ */}
            <div className="scard">
              <div className={`scard-header ${isOpen('quranIqama') ? 'open' : ''}`} onClick={() => toggle('quranIqama')}>
                <div className="s-icon" style={{background:'rgba(240,176,64,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <div className="s-info"><div className="s-title">📖 تلاوة قبل المغرب</div><div className="s-sub">الشيخ محمد رفعت — الجمعة: الكهف، باقي الأيام: عشوائي</div></div>
                <Toggle enabled={ramadanIqama.enabled} onToggle={(e) => { e.stopPropagation(); setRamadanIqama(prev => ({...prev, enabled: !prev.enabled})); }} />
                <div className={`s-arrow ${isOpen('quranIqama') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('quranIqama') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div style={{fontSize:11,color:'rgba(255,255,255,.4)',lineHeight:1.6,marginBottom:8}}>
                    تلاوة الشيخ محمد رفعت قبل المغرب كل يوم. يوم الجمعة: سورة الكهف، باقي الأيام: سورة عشوائية.
                  </div>

                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:700,marginBottom:6}}>اختبار الصوت</div>
                  <div className="test-grid">
                    <button className="test-btn" style={{background:'linear-gradient(135deg,#1a1200,#2a1e00)',border:'1px solid rgba(255,215,0,.3)',color:'#ffd700',boxShadow:'0 2px 12px rgba(255,200,0,.15)'}} onClick={() => {
                      stopQuranAudio();
                      const surah = getTodaySurah();
                      playQuranAudio(surah.url, { volume: ramadanIqama.volume / 100 });
                    }}>📖 سورة اليوم ({getTodaySurah().name})</button>
                    <button className="test-btn" style={{background:'linear-gradient(135deg,#001433,#002855)',border:'1px solid rgba(96,165,250,.3)',color:'#60a5fa',boxShadow:'0 2px 12px rgba(96,165,250,.15)'}} onClick={() => {
                      stopQuranAudio();
                      const surah = getQuranAudioUrl(true);
                      playQuranAudio(surah.url, { volume: ramadanIqama.volume / 100 });
                    }}>📖 الكهف — محمد رفعت</button>
                    <button className="test-btn" style={{background:'linear-gradient(135deg,#1a0005,#300010)',border:'1px solid rgba(255,77,109,.3)',color:'#ff4d6d',boxShadow:'0 2px 12px rgba(255,77,109,.15)'}} onClick={() => { stopQuranAudio(); }}>⏹️ إيقاف الصوت</button>
                  </div>

                  <div className="divider"/>

                  <div className="row">
                    <div className="row-info"><div className="row-label">وقت التشغيل قبل المغرب</div></div>
                    <div className="pill-group">
                      {[5, 10, 15, 30].map(m => (
                        <Pill key={m} active={ramadanIqama.minutesBefore === m} color="gold" onClick={() => setRamadanIqama(prev => ({...prev, minutesBefore: m}))}>{m} دقيقة</Pill>
                      ))}
                    </div>
                  </div>

                  <div className="divider"/>

                  <div className="row">
                    <div className="row-info"><div className="row-label">التشغيل التلقائي</div><div className="row-desc">تشغيل التلاوة تلقائياً قبل المغرب</div></div>
                    <Toggle enabled={ramadanIqama.autoPlay} onToggle={() => setRamadanIqama(prev => ({...prev, autoPlay: !prev.autoPlay}))} />
                  </div>

                  <div className="divider"/>

                  <div className="row">
                    <div className="row-info"><div className="row-label">الصوت</div></div>
                    <div className="slider-row" style={{width:140}}>
                      <input type="range" className="slider" min="0" max="100" value={ramadanIqama.volume}
                        onChange={e => setRamadanIqama(prev => ({...prev, volume: parseInt(e.target.value)}))} />
                      <div className="slider-val">{ramadanIqama.volume}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ الاختبار والتشخيص ═══ */}
          <div className="group">
            <div className="group-label">🧪 {t.settings.groupTest || 'الاختبار والتشخيص'}</div>
            <div className="scard">
              <div className={`scard-header ${isOpen('test') ? 'open' : ''}`} onClick={() => toggle('test')}>
                <div className="s-icon" style={{background:'rgba(245,158,11,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m-10 0v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5m-10 0H5"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.testNotifications}</div><div className="s-sub">{t.settings.testNotificationsDesc}</div></div>
                <div className={`s-arrow ${isOpen('test') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('test') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="test-grid">
                    <button className="test-btn" style={{background:'rgba(240,176,64,.08)',borderColor:'rgba(240,176,64,.2)',color:'#f0b040'}} onClick={() => window.dispatchEvent(new CustomEvent('namesOfAllahTime'))}>📿 {t.settings.testNames?.replace('اختبار ','') || 'الأسماء'}</button>
                    <button className="test-btn" style={{background:'rgba(0,200,150,.08)',borderColor:'rgba(0,200,150,.2)',color:'#00c896'}} onClick={() => window.dispatchEvent(new CustomEvent('prayerTimeArrived', {detail:{name:'المغرب'}}))}>🕌 {t.settings.testAzan?.replace('اختبار ','') || 'الأذان'}</button>

                    <button className="test-btn" style={{background:'rgba(236,72,153,.08)',borderColor:'rgba(236,72,153,.2)',color:'#f472b6'}} onClick={() => window.dispatchEvent(new CustomEvent('takbeerTime'))}>🎉 {t.settings.testTakbeer?.replace('اختبار ','') || 'التكبير'}</button>
                    <button className="test-btn" style={{background:'rgba(0,150,200,.08)',borderColor:'rgba(0,150,200,.2)',color:'#0096c8'}} onClick={() => window.dispatchEvent(new CustomEvent('hourlyDhikrTest'))}>📿 ذكر</button>
                    <button className="test-btn" style={{background:'rgba(20,184,166,.08)',borderColor:'rgba(20,184,166,.2)',color:'#2dd4bf'}} onClick={() => window.dispatchEvent(new CustomEvent('quranBeforeMaghrib'))}>📖 {t.settings.testQuran?.replace('اختبار ','') || 'القرآن'}</button>
                    <button className="test-btn" style={{background:'rgba(16,185,129,.08)',borderColor:'rgba(16,185,129,.2)',color:'#10b981'}} onClick={() => window.dispatchEvent(new CustomEvent('quranAutoPlay', {detail:{surah:'random',duration:5}}))}>📖 تشغيل تلقائي</button>
                    <button className="test-btn" style={{background:'rgba(249,115,22,.08)',borderColor:'rgba(249,115,22,.2)',color:'#fb923c'}} onClick={() => window.dispatchEvent(new CustomEvent('mesaharatiTime'))}>🥁 {t.settings.testMesaharati?.replace('اختبار ','') || 'السحور'}</button>
                    <button className="test-btn" style={{background:'rgba(99,102,241,.08)',borderColor:'rgba(99,102,241,.2)',color:'#818cf8'}} onClick={() => window.dispatchEvent(new CustomEvent('qiyamTime', {detail:{time:'02:00'}}))}>🌙 قيام الليل</button>
                    <button className="test-btn" style={{background:'rgba(239,68,68,.08)',borderColor:'rgba(239,68,68,.2)',color:'#ef4444'}} onClick={() => {
                      playRamadanCannon(() => {
                        window.dispatchEvent(new CustomEvent('prayerTimeArrived', { detail: { name: 'المغرب' } }));
                      });
                    }}>💥 المدفع</button>
                  </div>
                  <div style={{marginTop:10}}>
                    <button className="test-btn" style={{width:'100%',background:'rgba(139,92,246,.08)',borderColor:'rgba(139,92,246,.2)',color:'#a78bfa',justifyContent:'center'}} onClick={() => {
                      stopAzan();
                      playAzan(() => {
                        const duaAudio = new Audio('after-adhan.mp3');
                        duaAudio.preload = 'auto';
                        duaAudio.volume = 1;
                        duaAudio.play().catch(() => {});
                      });
                    }}>🕌 استماع الأذان + الدعاء بعد الأذان</button>
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:700,margin:'12px 0 6px'}}>تنبيهات رمضان</div>
                  <div className="test-grid">
                    <button className="test-btn" style={{background:'rgba(240,176,64,.08)',borderColor:'rgba(240,176,64,.2)',color:'#f0b040'}} onClick={() => window.dispatchEvent(new CustomEvent('ramadanSuhoorTime'))}>🌅 السحور</button>
                    <button className="test-btn" style={{background:'rgba(139,92,246,.08)',borderColor:'rgba(139,92,246,.2)',color:'#a78bfa'}} onClick={() => window.dispatchEvent(new CustomEvent('ramadanImsakTime'))}>🕋 الإمساك</button>
                    <button className="test-btn" style={{background:'rgba(249,115,22,.08)',borderColor:'rgba(249,115,22,.2)',color:'#fb923c'}} onClick={() => window.dispatchEvent(new CustomEvent('ramadanIftarSunanTime'))}>🌤️ سنن الإفطار</button>
                    <button className="test-btn" style={{background:'rgba(236,72,153,.08)',borderColor:'rgba(236,72,153,.2)',color:'#f472b6'}} onClick={() => window.dispatchEvent(new CustomEvent('ramadanQiyamTime'))}>🌙 قيام رمضان</button>
                    <button className="test-btn" style={{background:'rgba(239,68,68,.08)',borderColor:'rgba(239,68,68,.2)',color:'#ef4444'}} onClick={() => {
                      playRamadanCannon(() => {
                        window.dispatchEvent(new CustomEvent('prayerTimeArrived', { detail: { name: 'المغرب' } }));
                      });
                    }}>💥 مدفأة رمضان</button>
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:700,margin:'12px 0 6px'}}>تلاوة قبل المغرب</div>
                  <div className="test-grid">
                    <button className="test-btn" style={{background:'rgba(240,176,64,.08)',borderColor:'rgba(240,176,64,.2)',color:'#f0b040'}} onClick={() => {
                      const url = 'https://server14.mp3quran.net/refat/018.mp3';
                      stopQuranAudio(); playQuranAudio(url, { volume: 0.8 });
                    }}>📖 الكهف — محمد رفعت</button>
                    <button className="test-btn" style={{background:'rgba(59,130,246,.08)',borderColor:'rgba(59,130,246,.2)',color:'#60a5fa'}} onClick={() => {
                      const url = 'https://server14.mp3quran.net/refat/055.mp3';
                      stopQuranAudio(); playQuranAudio(url, { volume: 0.8 });
                    }}>📖 الرحمن — محمد رفعت</button>
                    <button className="test-btn" style={{background:'rgba(239,68,68,.08)',borderColor:'rgba(239,68,68,.2)',color:'#ef4444'}} onClick={() => { stopQuranAudio(); }}>⏹️ إيقاف الصوت</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ المدفع ═══ */}
          <div className="group">
            <div className="group-label">💥 المدفع</div>
            <div className="scard">
              <div className={`scard-header ${isOpen('cannon') ? 'open' : ''}`} onClick={() => toggle('cannon')}>
                <div className="s-icon" style={{background:'rgba(239,68,68,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
                </div>
                <div className="s-info"><div className="s-title">تشغيل المدفع قبل المغرب</div><div className="s-sub">كل اثنين وخميس + رمضان</div></div>
                <Toggle enabled={cannonEnabled} onToggle={(e) => { e.stopPropagation(); setCannonEnabled(!cannonEnabled); }} />
                <div className={`s-arrow ${isOpen('cannon') ? 'open' : ''}`} style={{marginRight:0}}>▼</div>
              </div>
              <div className={`panel ${isOpen('cannon') ? 'open' : ''}`}>
                <div className="panel-inner">
                  <div className="row">
                    <div className="row-info">
                      <div className="row-label">التشغيل التلقائي</div>
                      <div className="row-sub">يشتغل 5 ثانية قبل المغرب في:</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                    <div style={{padding:'6px 12px',borderRadius:8,background:cannonEnabled?'rgba(239,68,68,.12)':'rgba(255,255,255,.04)',border:'1px solid '+(cannonEnabled?'rgba(239,68,68,.3)':'rgba(255,255,255,.08)'),color:cannonEnabled?'#ef4444':'rgba(255,255,255,.4)',fontSize:11,fontWeight:700}}>🌙 كل أيام رمضان</div>
                    <div style={{padding:'6px 12px',borderRadius:8,background:cannonEnabled?'rgba(239,68,68,.12)':'rgba(255,255,255,.04)',border:'1px solid '+(cannonEnabled?'rgba(239,68,68,.3)':'rgba(255,255,255,.08)'),color:cannonEnabled?'#ef4444':'rgba(255,255,255,.4)',fontSize:11,fontWeight:700}}>📅 كل اثنين وخميس</div>
                  </div>
                  <div className="divider" style={{margin:'12px 0'}}/>
                  <button className="test-btn" style={{width:'100%',justifyContent:'center',background:'rgba(239,68,68,.08)',borderColor:'rgba(239,68,68,.2)',color:'#ef4444'}} onClick={() => {
                    playRamadanCannon(() => {
                      window.dispatchEvent(new CustomEvent('prayerTimeArrived', { detail: { name: 'المغرب' } }));
                    });
                  }}>💥 اختبار المدفع الآن</button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ حول التطبيق ═══ */}
          <div className="group">
            <div className="group-label">ℹ️ {t.settings.groupAbout || 'حول التطبيق'}</div>
            <div className="scard">
              <div className={`scard-header ${isOpen('about') ? 'open' : ''}`} onClick={() => toggle('about')}>
                <div className="s-icon" style={{background:'rgba(139,92,246,.12)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="s-info"><div className="s-title">{t.settings.about}</div><div className="s-sub">{t.settings.aboutDesc}</div></div>
                <div className={`s-arrow ${isOpen('about') ? 'open' : ''}`}>▼</div>
              </div>
              <div className={`panel ${isOpen('about') ? 'open' : ''}`}>
                <div className="panel-inner">
                  {/* Bismillah */}
                  <div style={{textAlign:'center',padding:'8px 0 4px',fontFamily:'"Amiri Quran",serif',fontSize:22,color:'#a78bfa',lineHeight:1.6}}>
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </div>

                  {/* Intro */}
                  <div style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.8,margin:'8px 0 12px'}}>
                    الحمد لله الذي بنعمته تتم الصالحات، والصلاة والسلام على أشرف الأنبياء والمرسلين، نبينا محمد وعلى آله وصحبه أجمعين، أما بعد:
                    <br/><br/>
                    فهذا تطبيق إلكتروني شامل ومتكامل في خدمة الكتاب والسنة، يجمع ما يحتاجه المسلم في مكان واحد — سهل الاستخدام، جميل التصميم، غني بالمحتوى. أنشأته لأكون أقرب إليك في يومك، في لحظاتك الصالحة، وفي كل خطوة تقتربك من الله عز وجل.
                  </div>

                  {/* Version info */}
                  <div style={{display:'flex',gap:8,marginBottom:14}}>
                    <div className="version-card" style={{flex:1,margin:0}}><span className="ver-label">{t.settings.version}</span><span className="ver-val">2.0.0</span></div>
                    <div className="version-card" style={{flex:1,margin:0}}><span className="ver-label">آخر تحديث</span><span className="ver-val">يوليو 2026</span></div>
                  </div>

                  {/* Divider */}
                  <div style={{height:1,background:'rgba(139,92,246,.15)',margin:'4px 0 16px'}}/>

                  {/* Features title */}
                  <div style={{textAlign:'center',fontSize:15,fontWeight:800,color:'#a78bfa',marginBottom:12}}>══════ الميزات الرئيسية ══════</div>

                  {/* Feature cards */}
                  {[
                    {icon:'🕌',title:'الأذكار',sub:'صوتية مع تعليق صوتي',bg:'rgba(0,200,150,.06)',border:'rgba(0,200,150,.15)',color:'#00c896'},
                    {icon:'📿',title:'أسماء الله الحسنى',sub:'100 اسم مع شرح مبسّط',bg:'rgba(240,176,64,.06)',border:'rgba(240,176,64,.15)',color:'#f0b040'},
                    {icon:'⏰',title:'مواقيت الصلاة',sub:'حسب الموقع مع العد التنازلي',bg:'rgba(96,165,250,.06)',border:'rgba(96,165,250,.15)',color:'#60a5fa'},
                    {icon:'📖',title:'القرآن الكريم',sub:'114 سورة بقراءات متعددة',bg:'rgba(139,92,246,.06)',border:'rgba(139,92,246,.15)',color:'#a78bfa'},
                    {icon:'🔔',title:'التذكيرات',sub:'أذان + أذكار + تسبيح',bg:'rgba(236,72,153,.06)',border:'rgba(236,72,153,.15)',color:'#f472b6'},
                    {icon:'🧮',title:'التسبيح',sub:'عداد رقمي أنيق',bg:'rgba(20,184,166,.06)',border:'rgba(20,184,166,.15)',color:'#2dd4bf'},
                    {icon:'🧭',title:'اتجاه القبلة',sub:'تحديد دقيق حسب الموقع',bg:'rgba(251,191,36,.06)',border:'rgba(251,191,36,.15)',color:'#fbbf24'},
                    {icon:'💰',title:'زكاة المال',sub:'حاسبة ذكية',bg:'rgba(249,115,22,.06)',border:'rgba(249,115,22,.15)',color:'#fb923c'},
                    {icon:'📅',title:'التقويم الهجري',sub:'مع المناسبات الإسلامية',bg:'rgba(34,211,238,.06)',border:'rgba(34,211,238,.15)',color:'#22d3ee'},
                    {icon:'👥',title:'صحابة الرسول ﷺ',sub:'سير ووفاة الصحابة',bg:'rgba(168,85,247,.06)',border:'rgba(168,85,247,.15)',color:'#a855f7'},
                    {icon:'❓',title:'اختبر نفسك',sub:'مسابقة إسلامية تفاعلية',bg:'rgba(244,63,94,.06)',border:'rgba(244,63,94,.15)',color:'#f43f5e'},
                    {icon:'🕋',title:'الحج والعمرة',sub:'دليل شامل للحج والعمرة',bg:'rgba(16,185,129,.06)',border:'rgba(16,185,129,.15)',color:'#10b981'},
                    {icon:'📻',title:'الإذاعة الإسلامية',sub:'بث مباشر من الحرمين',bg:'rgba(245,158,11,.06)',border:'rgba(245,158,11,.15)',color:'#f59e0b'},
                    {icon:'🕌',title:'فضل المساجد',sub:'أدعية وأحاديث',bg:'rgba(59,130,246,.06)',border:'rgba(59,130,246,.15)',color:'#3b82f6'},
                    {icon:'🌙',title:'رمضان',sub:'عد تنازلي + ختم القرآن',bg:'rgba(234,179,8,.06)',border:'rgba(234,179,8,.15)',color:'#eab308'},
                    {icon:'🚿',title:'الوضوء',sub:'دليل مفصّل بالصور',bg:'rgba(6,182,212,.06)',border:'rgba(6,182,212,.15)',color:'#06b6d4'},
                    {icon:'🎤',title:'التسجيلات',sub:'تسجيل وحفظ الأذكار',bg:'rgba(239,68,68,.06)',border:'rgba(239,68,68,.15)',color:'#ef4444'},
                  ].map((f,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,background:f.bg,border:`1px solid ${f.border}`,marginBottom:6}}>
                      <span style={{fontSize:22}}>{f.icon}</span>
                      <div><div style={{fontSize:13,fontWeight:700,color:f.color}}>{f.title}</div><div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:1}}>{f.sub}</div></div>
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{height:1,background:'rgba(139,92,246,.15)',margin:'12px 0'}}/>

                  {/* Best features title */}
                  <div style={{textAlign:'center',fontSize:15,fontWeight:800,color:'#f0b040',marginBottom:12}}>══════ أفضل ما في التطبيق ══════</div>

                  {/* Best features list */}
                  {[
                    'صوت الأذكار — تسجيلات أصلية بجودة عالية مع تعليق صوتي مبسّط',
                    'أسماء الله الحسنى — 100 اسم بترتيب الترمذي مع شرح مبسّط وصوتي',
                    'مواقيت الصلاة — حسب الموقع مع العد التنازلي والأذان التلقائي',
                    'القرآن الكريم — 114 سورة بقراءات متعددة مع تشغيل مباشر',
                    'التسبيح الرقمي — عداد أنيق مع اهتزاز وصوتي',
                    'اتجاه القبلة — تحديد دقيق حسب GPS مع مؤشر بصري',
                    'التقويم الهجري — مع ذكر المناسبات والأحاديث اليومية',
                    'الحج والعمرة — دليل شامل مع خطوات مفصّلة',
                    'الإذاعة الإسلامية — بث مباشر من الحرمين والمسجد الأقصى',
                    'الوضع الليلي — تصميم مريح للعين في الليل',
                    'ترجمة ثلاثية لغات — العربية والإنجليزية والإسبانية',
                    'تصميم عصري — سهل الاستخدام وجميل المظهر',
                    'تسجيلات الأذكار — يمكنك تسجيل وحفظ أذكارك المفضلة',
                    'تذكيرات ذكية — أذكار الصباح والمساء تلقائياً',
                    'شامل ومجاني — كل شيء تحتاجه في مكان واحد',
                  ].map((item,i) => (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'7px 0',borderBottom:i<14?'1px solid rgba(255,255,255,.04)':'none'}}>
                      <span style={{color:'#a78bfa',fontSize:12,marginTop:2}}>✦</span>
                      <span style={{fontSize:12,color:'rgba(255,255,255,.6)',lineHeight:1.6}}>{item}</span>
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{height:1,background:'rgba(139,92,246,.15)',margin:'16px 0 12px'}}/>

                  {/* Sources link */}
                  <Link to="/sources" style={{width:'100%',display:'block',padding:10,borderRadius:10,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.2)',color:'#a78bfa',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',textAlign:'center',textDecoration:'none'}}>
                    {t.settings.sourcesButton || '📄 المصادر والمراجع'}
                  </Link>

                  {/* Divider */}
                  <div style={{height:1,background:'rgba(139,92,246,.15)',margin:'14px 0'}}/>

                  {/* Auto-start */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#a78bfa'}}>🚀 تشغيل تلقائي مع الويندوز</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:2}}>البرنامج يفتح تلقائياً عند تشغيل الجهاز</div>
                    </div>
                    <Toggle enabled={autoStart} onToggle={() => {
                      const next = !autoStart;
                      setAutoStart(next);
                      window.electronAPI?.setAutoStart?.(next);
                    }} />
                  </div>

                  {/* Divider */}
                  <div style={{height:1,background:'rgba(139,92,246,.15)',margin:'14px 0'}}/>

                  {/* Contact Us */}
                  <button onClick={() => setShowContactForm(true)} style={{width:'100%',display:'block',padding:10,borderRadius:10,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.2)',color:'#a78bfa',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',textAlign:'center'}}>
                    ✉️ تواصل معنا — ابعت ملاحظة أو اقتراح
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Modal */}
          {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}

          {/* Danger Zone */}
          <button className="danger-btn" onClick={handleReset} style={{marginTop:12}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            {t.settings.resetAll}
          </button>

        </div>
      </div>
    </>
  );
}
