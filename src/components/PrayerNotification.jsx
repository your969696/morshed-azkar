import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakArabic, stopSpeaking, playAzan, stopAzan, stopAllAudio, playMesaharati, stopMesaharati, playTakbeer, playRamadanTone, playRamadanCannon, stopRamadanCannon } from '../utils/sound';
import { isRamadan, getPrayerTimesSync } from '../utils/prayer-times';
import { useTranslation } from '../i18n.jsx';
import { useNavigate } from 'react-router-dom';
import { namesOfAllah as allNamesOfAllah } from '../data/names-of-allah';

const getDeletedIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const namesOfAllah = allNamesOfAllah.filter(n => !getDeletedIds('deletedNamesIds').includes(n.id));
import { getSurahAudioUrl } from '../utils/audio';
import { RAMADAN_NOTIFICATIONS } from '../data/ramadan-notifications';

const TIMEOUT_MS = 120000;

export default function PrayerNotification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(null);
  const [namesIdx, setNamesIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef(null);
  const namesTimerRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (namesTimerRef.current) clearTimeout(namesTimerRef.current);
  };

  const scheduleDismiss = (ms = TIMEOUT_MS) => {
    clearTimers();
    timerRef.current = setTimeout(() => {
      stopSpeaking();
      stopAzan();
      stopMesaharati();
      setNotif(null);
      setNamesIdx(0);
      setIsSpeaking(false);
    }, ms);
  };

  useEffect(() => {
    const handleAzan = (e) => {
      const { name, voice, dua } = e.detail;
      stopSpeaking();
      clearTimers();
      if (quranAudioRef.current) { quranAudioRef.current.pause(); quranAudioRef.current.onended = null; quranAudioRef.current.onerror = null; quranAudioRef.current = null; }
      stopAzan();

      if (name === 'المغرب') {
        if (isRamadan()) {
          const iftarNotif = RAMADAN_NOTIFICATIONS.find(n => n.id === 'iftar');
          setNotif({ type: 'azan', icon: '🕌', title: 'وقت الإفطار', prayer: iftarNotif.dua, source: iftarNotif.source, bgImage: iftarNotif.bgImage });
        } else {
          setNotif({ type: 'azan', icon: '🕌', title: t.prayerNotif.azanTitle, prayer: name });
        }
        playAzan(() => {
          if (dua !== false) {
            const duaAudio = new Audio('after-adhan.mp3');
            duaAudio.preload = 'auto';
            duaAudio.volume = 1;
            duaAudio.onended = () => { scheduleDismiss(60000); };
            duaAudio.onerror = () => { scheduleDismiss(60000); };
            duaAudio.play().catch(() => { scheduleDismiss(60000); });
          } else {
            scheduleDismiss(60000);
          }
        }, voice);
      } else {
        setNotif({ type: 'azan', icon: '🕌', title: t.prayerNotif.azanTitle, prayer: name });
        playAzan(() => {
          if (dua !== false) {
            const duaAudio = new Audio('after-adhan.mp3');
            duaAudio.preload = 'auto';
            duaAudio.volume = 1;
            duaAudio.onended = () => { scheduleDismiss(30000); };
            duaAudio.onerror = () => { scheduleDismiss(30000); };
            duaAudio.play().catch(() => { scheduleDismiss(30000); });
          } else {
            scheduleDismiss(30000);
          }
        }, voice);
      }
    };

    const handleRamadanImsak = () => {
      stopSpeaking();
      clearTimers();
      const imsakNotif = RAMADAN_NOTIFICATIONS.find(n => n.id === 'imsak');
      setNotif({ type: 'ramadan-imsak', icon: '🕋', title: imsakNotif.title, prayer: imsakNotif.text, source: imsakNotif.source, bgImage: imsakNotif.bgImage });
      playRamadanTone();
      scheduleDismiss(60000);
    };

    const handleRamadanSuhoor = () => {
      stopSpeaking();
      clearTimers();
      const suhoorNotif = RAMADAN_NOTIFICATIONS.find(n => n.id === 'suhoor');
      setNotif({ type: 'ramadan-suhoor', icon: '🌅', title: suhoorNotif.title, prayer: suhoorNotif.text, source: suhoorNotif.source });
      playRamadanTone();
      scheduleDismiss(60000);
    };

    const handleRamadanIftarSunan = () => {
      stopSpeaking();
      clearTimers();
      const sunanNotif = RAMADAN_NOTIFICATIONS.find(n => n.id === 'iftarSunan');
      setNotif({ type: 'ramadan-sunan', icon: '🌤️', title: sunanNotif.title, prayer: sunanNotif.text, source: sunanNotif.source });
      playRamadanTone();
      scheduleDismiss(60000);
    };

    const handleRamadanQiyam = () => {
      stopSpeaking();
      clearTimers();
      const qiyamNotif = RAMADAN_NOTIFICATIONS.find(n => n.id === 'qiyam');
      setNotif({ type: 'ramadan-qiyam', icon: '🌙', title: qiyamNotif.title, prayer: qiyamNotif.text, source: qiyamNotif.source });
      speakArabic(qiyamNotif.hadith, () => {
        scheduleDismiss(30000);
      });
    };

    const handleRamadanCannon = () => {
      stopSpeaking();
      clearTimers();
      playRamadanCannon(() => {
        handleAzan({ detail: { name: 'المغرب' } });
      });
    };

    const handleNames = () => {
      stopSpeaking();
      setNamesIdx(0);
      window.__namesPlaybackActive = true;
      setNotif({ type: 'names', icon: '✨', title: 'هو الله' });
    };

    const handleMesaharati = () => {
      stopSpeaking();
      setNotif({ type: 'mesaharati', icon: '🥁', title: t.prayerNotif.suhoorTime, prayer: t.prayerNotif.suhoorRemaining, desc: t.prayerNotif.suhoorDesc });
      playMesaharati();
      scheduleDismiss();
    };

    const handleQuranBeforeMaghrib = () => {
      stopSpeaking();
      setNotif({ type: 'quran', icon: '📖', title: t.prayerNotif.quranTitle, prayer: t.prayerNotif.quranDesc });
      scheduleDismiss();
    };

    const handleQuranBeforePrayer = (e) => {
      stopSpeaking();
      clearTimers();
      if (quranAudioRef.current) { quranAudioRef.current.pause(); quranAudioRef.current.onended = null; quranAudioRef.current.onerror = null; quranAudioRef.current = null; }
      const { key, name, duration, surah, mode } = e.detail;
      const randomSurahs = [2, 36, 32, 55, 56, 67, 18, 19, 44, 38, 43];
      const surahNames = { 1:'الفاتحة',2:'البقرة',3:'آل عمران',4:'النساء',5:'المائدة',6:'الأنعام',7:'الأعراف',8:'الأنفال',9:'التوبة',10:'يونس',11:'هود',12:'يوسف',13:'الرعد',14:'إبراهيم',15:'الحجر',16:'النحل',17:'الإسراء',18:'الكهف',19:'مريم',20:'طه',21:'الأنبياء',22:'الحج',23:'المؤمنون',24:'النور',25:'الفرقان',26:'الشعراء',27:'النمل',28:'القصص',29:'العنكبوت',30:'الروم',31:'لقمان',32:'السجدة',33:'الأحزاب',34:'سبأ',35:'فاطر',36:'يس',37:'الصافات',38:'ص',39:'الزمر',40:'غافر',41:'فصلت',42:'الشورى',43:'الزخرف',44:'الدخان',45:'الجاثية',46:'الأحقاف',47:'محمد',48:'الفتح',49:'الحجرات',50:'ق',51:'الذاريات',52:'الطور',53:'النجم',54:'القمر',55:'الرحمن',56:'الواقعة',57:'الحديد',58:'المجادلة',59:'الحشر',60:'الممتحنة',61:'الصف',62:'الجمعة',63:'المنافقون',64:'التغابن',65:'الطلاق',66:'التحريم',67:'الملك',68:'القلم',69:'الحاقة',70:'المعارج',71:'نوح',72:'الجن',73:'المزمل',74:'المدثر',75:'القيامة',76:'الإنسان',77:'المرسلات',78:'النبأ',79:'النازعات',80:'عبس',81:'التكوير',82:'الانفطار',83:'المطففين',84:'الانشقاق',85:'البروج',86:'الطارق',87:'الأعلى',88:'الغاشية',89:'الفجر',90:'البلد',91:'الشمس',92:'الليل',93:'الضحى',94:'الشرح',95:'التين',96:'العلق',97:'القدر',98:'البينة',99:'الزلزلة',100:'العاديات',101:'القارعة',102:'التكاثر',103:'العصر',104:'الهمزة',105:'الفيل',106:'قريش',107:'الماعون',108:'الكوثر',109:'الكافرون',110:'النصر',111:'المسد',112:'الإخلاص',113:'الفلق',114:'الناس' };

      const playSurah = (sid, onFinished) => {
        const url = getSurahAudioUrl('refaat', sid);
        const audio = new Audio(url);
        audio.volume = 1;
        quranAudioRef.current = audio;
        setNotif({ type: 'quran-before-prayer', icon: '📖', title: `قرآن قبل صلاة ${name}`, prayer: surahNames[sid] || `سورة ${sid}` });
        audio.onended = () => {
          quranAudioRef.current = null;
          if (onFinished) onFinished();
        };
        audio.onerror = () => {
          quranAudioRef.current = null;
          if (onFinished) onFinished();
        };
        audio.play().catch(() => {});
      };

      const startAdhanAfterQuran = () => {
        const voice = (() => { try { return JSON.parse(localStorage.getItem('perPrayerVoice')||'{}')[key]||'makkah'; } catch { return 'makkah'; } })();
        const duaEnabled = (() => { try { const d = JSON.parse(localStorage.getItem('perPrayerDua')||'{}'); return d[key] !== false; } catch { return true; } })();
        const adhanEnabled = (() => { try { const d = JSON.parse(localStorage.getItem('perPrayerAdhan')||'{}'); return d[key] !== false; } catch { return true; } })();

        if (adhanEnabled) {
          setNotif({ type: 'azan', icon: '🕌', title: t.prayerNotif.azanTitle, prayer: name });
          playAzan(() => {
            if (duaEnabled) {
              const duaAudio = new Audio('after-adhan.mp3');
              duaAudio.preload = 'auto';
              duaAudio.volume = 1;
              duaAudio.onended = () => { scheduleDismiss(30000); };
              duaAudio.onerror = () => { scheduleDismiss(30000); };
              duaAudio.play().catch(() => { scheduleDismiss(30000); });
            } else {
              scheduleDismiss(30000);
            }
          }, voice);
        } else {
          scheduleDismiss(30000);
        }
      };

      if (mode === 'surah' && surah) {
        const now2 = new Date();
        const nowSec2 = now2.getHours() * 3600 + now2.getMinutes() * 60 + now2.getSeconds();
        let prayerSec2 = nowSec2 + (duration || 15) * 60;
        try {
          const pt2 = getPrayerTimesSync();
          const raw2 = pt2[key] || '';
          const cleaned2 = raw2.replace(/\s*\(.*?\)\s*/g, '').trim();
          const match2 = cleaned2.match(/(\d{1,2}):(\d{2})/);
          if (match2) prayerSec2 = parseInt(match2[1], 10) * 3600 + parseInt(match2[2], 10) * 60;
        } catch {}
        const stopSec = prayerSec2 - 60;
        const endTs = Date.now() + Math.max(stopSec - nowSec2, 10) * 1000;
        playSurah(surah, () => {
          if (Date.now() >= endTs) {
            if (quranAudioRef.current) { quranAudioRef.current.pause(); quranAudioRef.current = null; }
            setNotif(null);
          }
        });
      } else {
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        let prayerSec = nowSec + (duration || 15) * 60;
        try {
          const pt = getPrayerTimesSync();
          const raw = pt[key] || '';
          const cleaned = raw.replace(/\s*\(.*?\)\s*/g, '').trim();
          const match = cleaned.match(/(\d{1,2}):(\d{2})/);
          if (match) prayerSec = parseInt(match[1], 10) * 3600 + parseInt(match[2], 10) * 60;
        } catch {}
        const secsUntilPrayer = Math.max(prayerSec - nowSec - 60, 10);
        const endTime = Date.now() + secsUntilPrayer * 1000;
        const playRandom = (sid) => {
          const url = getSurahAudioUrl('refaat', sid);
          const audio = new Audio(url);
          audio.volume = 1;
          quranAudioRef.current = audio;
          setNotif({ type: 'quran-before-prayer', icon: '📖', title: `قرآن قبل صلاة ${name}`, prayer: surahNames[sid] || `سورة ${sid}` });
          audio.onended = () => {
            quranAudioRef.current = null;
            if (Date.now() < endTime) {
              const nextSurah = randomSurahs[Math.floor(Math.random() * randomSurahs.length)];
              setTimeout(() => playRandom(nextSurah), 300);
            } else {
              setNotif(null);
            }
          };
          audio.onerror = () => {
            quranAudioRef.current = null;
            if (Date.now() < endTime) {
              const nextSurah2 = randomSurahs[Math.floor(Math.random() * randomSurahs.length)];
              setTimeout(() => playRandom(nextSurah2), 1000);
            } else {
              setNotif(null);
            }
          };
          audio.play().catch(() => {});
        };
        playRandom(randomSurahs[Math.floor(Math.random() * randomSurahs.length)]);
      }
    };

    const handleTakbeer = () => {
      stopSpeaking();
      const isEidDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'numeric' }).formatToParts(new Date()).find(p => p.type === 'month')?.value === '10';
      setNotif({ type: 'takbeer', icon: '🎉', title: isEidDay ? t.prayerNotif.eidMubarak : t.prayerNotif.takbeer, prayer: t.prayerNotif.takbeerText });
      playTakbeer();
      scheduleDismiss();
    };

    const handleMorningAzkar = () => {
      stopSpeaking();
      clearTimers();
      setNotif({ type: 'morning-azkar', icon: '🌅', title: t.prayerNotif?.morningAzkarTitle || 'أذكار الصباح', prayer: t.prayerNotif?.morningAzkarDesc || 'حان وقت أذكار الصباح' });
      scheduleDismiss();
    };

    const handleEveningAzkar = () => {
      stopSpeaking();
      clearTimers();
      setNotif({ type: 'evening-azkar', icon: '🌇', title: t.prayerNotif?.eveningAzkarTitle || 'أذكار المساء', prayer: t.prayerNotif?.eveningAzkarDesc || 'حان وقت أذكار المساء' });
      scheduleDismiss();
    };

    const handleQiyam = (e) => {
      stopSpeaking();
      clearTimers();
      const dua = 'اللهم إني أعوذ برضاك من سخطك، وبمعافاتك من عقوبتك، وأعوذ بك منك لا أحصي ثناء عليك أنت كما أثنيت على نفسك';
      setNotif({ type: 'qiyam', icon: '🌙', title: 'قيام الليل', prayer: 'حان وقت قيام الليل' });
      speakArabic(dua, () => {
        scheduleDismiss(30000);
      });
    };

    const handleQuranAutoPlay = (e) => {
      clearTimers();
      stopAllAudio();
      if (quranAudioRef.current) { quranAudioRef.current.pause(); quranAudioRef.current = null; }
      const { surah, duration } = e.detail;
      let surahId = surah;
      if (surah === 'random') {
        const randomSurahs = [2, 36, 32, 55, 56, 67, 18, 19, 44, 38, 43];
        surahId = randomSurahs[Math.floor(Math.random() * randomSurahs.length)];
      } else if (surah === 'kahf') { surahId = 18; }
        else if (surah === 'yasin') { surahId = 36; }
        else if (surah === 'rahman') { surahId = 55; }
        else if (surah === 'waqia') { surahId = 56; }
        else if (surah === 'mulk') { surahId = 67; }

      const endTime = Date.now() + (duration || 30) * 60 * 1000;
      const surahNames = { 18:'الكهف', 19:'مريم', 32:'السجدة', 36:'يس', 38:'ص', 43:'الزخرف', 44:'الدخان', 55:'الرحمن', 56:'الواقعة', 67:'الملك' };
      setNotif({ type: 'quran-auto', icon: '📖', title: 'القرآن الكريم', prayer: surahNames[surahId] || `سورة ${surahId}` });

      const playSurah = (sid) => {
        const url = getSurahAudioUrl('refaat', sid);
        const audio = new Audio(url);
        audio.volume = 1;
        quranAudioRef.current = audio;
        audio.onended = () => {
          quranAudioRef.current = null;
          if (Date.now() < endTime) {
            const nextSurahs = [36, 32, 55, 56, 67, 18, 19, 44, 38, 43];
            const nextSurah = nextSurahs[Math.floor(Math.random() * nextSurahs.length)];
            setNotif(n => n ? { ...n, prayer: surahNames[nextSurah] || `سورة ${nextSurah}` } : null);
            setTimeout(() => playSurah(nextSurah), 300);
          } else {
            setNotif(null);
          }
        };
        audio.onerror = () => {
          quranAudioRef.current = null;
          if (Date.now() < endTime) {
            const nextSurahs = [36, 32, 55, 56, 67, 18, 19, 44, 38, 43];
            setTimeout(() => playSurah(nextSurahs[Math.floor(Math.random() * nextSurahs.length)]), 1000);
          }
        };
        audio.play().catch(() => {});
      };

      playSurah(surahId);
      scheduleDismiss(duration ? duration * 60 * 1000 : 1800000);
    };

    window.addEventListener('prayerTimeArrived', handleAzan);
    window.addEventListener('namesOfAllahTime', handleNames);
    window.addEventListener('mesaharatiTime', handleMesaharati);
    window.addEventListener('quranBeforeMaghrib', handleQuranBeforeMaghrib);
    window.addEventListener('quranBeforePrayer', handleQuranBeforePrayer);
    window.addEventListener('quranAutoPlay', handleQuranAutoPlay);
    window.addEventListener('takbeerTime', handleTakbeer);

    window.addEventListener('morningAzkarTime', handleMorningAzkar);
    window.addEventListener('eveningAzkarTime', handleEveningAzkar);
    window.addEventListener('qiyamTime', handleQiyam);
    window.addEventListener('ramadanImsakTime', handleRamadanImsak);
    window.addEventListener('ramadanSuhoorTime', handleRamadanSuhoor);
    window.addEventListener('ramadanIftarSunanTime', handleRamadanIftarSunan);
    window.addEventListener('ramadanQiyamTime', handleRamadanQiyam);
    window.addEventListener('ramadanCannonTime', handleRamadanCannon);

    return () => {
      window.removeEventListener('prayerTimeArrived', handleAzan);
      window.removeEventListener('namesOfAllahTime', handleNames);
      window.removeEventListener('mesaharatiTime', handleMesaharati);
      window.removeEventListener('quranBeforeMaghrib', handleQuranBeforeMaghrib);
      window.removeEventListener('quranBeforePrayer', handleQuranBeforePrayer);
      window.removeEventListener('quranAutoPlay', handleQuranAutoPlay);
      window.removeEventListener('takbeerTime', handleTakbeer);

      window.removeEventListener('morningAzkarTime', handleMorningAzkar);
      window.removeEventListener('eveningAzkarTime', handleEveningAzkar);
      window.removeEventListener('qiyamTime', handleQiyam);
      window.removeEventListener('ramadanImsakTime', handleRamadanImsak);
      window.removeEventListener('ramadanSuhoorTime', handleRamadanSuhoor);
      window.removeEventListener('ramadanIftarSunanTime', handleRamadanIftarSunan);
      window.removeEventListener('ramadanQiyamTime', handleRamadanQiyam);
      window.removeEventListener('ramadanCannonTime', handleRamadanCannon);
      clearTimers();
    };
  }, [t]);

  useEffect(() => {
    if (notif?.type !== 'names') return;
    const speakName = () => {
      if (namesIdx >= namesOfAllah.length) {
        stopSpeaking();
        window.__namesPlaybackActive = false;
        setNotif(null);
        setNamesIdx(0);
        return;
      }
      const name = namesOfAllah[namesIdx];
      setIsSpeaking(true);
      const audio = new Audio(`names-voices/${name.id}.mp3`);
      audio.onended = () => {
        setIsSpeaking(false);
        namesTimerRef.current = setTimeout(() => {
          setNamesIdx(prev => prev + 1);
        }, 2000);
      };
      audio.play().catch(() => {
        setIsSpeaking(false);
        namesTimerRef.current = setTimeout(() => {
          setNamesIdx(prev => prev + 1);
        }, 2000);
      });
    };
    speakName();
    return () => {
      if (namesTimerRef.current) clearTimeout(namesTimerRef.current);
    };
  }, [namesIdx, notif?.type]);

  const quranSurahs = [36, 32, 55, 56, 67];
  const quranAudioRef = useRef(null);
  useEffect(() => {
    if (notif?.type !== 'quran') return;
    const surah = quranSurahs[Math.floor(Math.random() * quranSurahs.length)];
    const url = getSurahAudioUrl('mishary', surah);
    const audio = new Audio(url);
    quranAudioRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      if (quranAudioRef.current) {
        quranAudioRef.current.pause();
        quranAudioRef.current = null;
      }
    };
  }, [notif?.type]);

  const handleClose = () => {
    stopSpeaking();
    stopAzan();
    stopRamadanCannon();
    clearTimers();
    if (namesTimerRef.current) clearTimeout(namesTimerRef.current);
    if (quranAudioRef.current) { quranAudioRef.current.pause(); quranAudioRef.current.onended = null; quranAudioRef.current.onerror = null; quranAudioRef.current = null; }
    window.__namesPlaybackActive = false;
    setNotif(null);
    setNamesIdx(0);
    setIsSpeaking(false);
  };

  useEffect(() => {
    const onStopAll = () => handleClose();
    window.electronAPI?.onStopAllAudio?.(onStopAll);
    return () => { window.removeEventListener?.('stop-all-audio', onStopAll); };
  }, []);

  const handleNamesPause = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      if (namesTimerRef.current) clearTimeout(namesTimerRef.current);
    } else {
      setNamesIdx(prev => prev);
    }
  };

  if (!notif) return null;

  const currentName = notif.type === 'names' ? namesOfAllah[namesIdx] : null;

  const hasBgImage = notif?.bgImage;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: hasBgImage ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.65)', backdropFilter: hasBgImage ? 'none' : 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className={`text-center relative overflow-hidden ${notif.type === 'names' || notif.type === 'iftar' || notif.type === 'azan' && hasBgImage ? '' : 'bg-bg-card rounded-3xl border border-border'}`}
          style={notif.type === 'names' ? {
            width: '92%', maxWidth: 380, padding: '28px 22px',
            borderRadius: 20,
            background: 'linear-gradient(145deg, #1c1040 0%, #2d1b69 100%)',
            boxShadow: '0 0 30px rgba(0,200,150,0.06), 0 8px 32px rgba(0,0,0,0.4)'
          } : hasBgImage ? {
            width: '92%', maxWidth: 420, borderRadius: 20,
            position: 'relative', overflow: 'hidden',
          } : { width: '92%', maxWidth: 380, padding: '32px 24px' }}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {hasBgImage && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${notif.bgImage})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              zIndex: 0,
            }} />
          )}

          {hasBgImage && (
            <div style={{
              position: 'relative', zIndex: 1,
              padding: '32px 24px',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(2px)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{notif.icon}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0b040', marginBottom: 12 }}>{notif.title}</div>
              <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: '1.4rem', color: '#fff', lineHeight: 1.8, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{notif.prayer}</div>
              {notif.source && <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 16 }}>{notif.source}</div>}
              <button className="flex-1 py-3 rounded-xl bg-accent-green text-white text-sm font-bold" style={{ width: '100%' }} onClick={handleClose}>{t.common.close}</button>
            </div>
          )}

          {!hasBgImage && notif.type === 'names' && currentName ? (
            <>
              <div className="mb-2" style={{ fontFamily: "'Amiri Quran', serif", fontSize: '1.3rem', color: '#f0b040', letterSpacing: '2px', textShadow: '0 0 12px rgba(240,176,64,0.25)' }}>هُوَ اللَّهُ</div>
              <div className="mb-3" style={{ fontFamily: "'Amiri Quran', serif", fontSize: '2.5rem', color: 'var(--text-primary)', lineHeight: 1.4, textShadow: '0 0 20px rgba(0,200,150,0.15)' }}>{currentName.name_ar}</div>
              <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, transparent, #f0b040, transparent)', marginBottom: '14px', opacity: 0.6 }} />
              <div style={{ fontFamily: "'Amiri Quran', serif", fontSize: '1.1rem', color: '#c9b8e8', marginBottom: '6px' }}>{currentName.meaning_ar}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: '0.85rem', color: '#a99bc4', marginBottom: '14px' }}>{currentName.meaning_en}</div>
              <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, #00c896, transparent)', marginBottom: '10px', borderRadius: '2px' }} />
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: '0.75rem', color: '#7a6a94', lineHeight: 1.6, padding: '0 8px', marginBottom: '12px' }}>{currentName.description}</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontSize: '0.8rem', color: '#00c896', fontWeight: 700 }}>{namesIdx + 1} / {namesOfAllah.length}</div>
            </>
          ) : !hasBgImage ? (
            <>
              <div className="text-6xl mb-3">{notif.icon}</div>
              <div className="text-lg font-bold text-accent-green mb-1.5">{notif.title}</div>
              {notif.prayer && <div className="text-2xl font-bold text-text-primary mb-1.5">{notif.prayer}</div>}
            </>
          ) : null}

          {!hasBgImage && notif.desc && (
            <div className="text-sm text-text-secondary leading-relaxed mb-4 text-right max-h-[200px] overflow-y-auto px-1" style={{ direction: 'rtl' }}>
              {notif.desc}
            </div>
          )}

          {!hasBgImage && (
          <div className="flex gap-2.5 mt-1">
            {(notif.type === 'morning-azkar' || notif.type === 'evening-azkar') ? (
              <>
                <button className="flex-1 py-3 rounded-xl bg-accent-green text-white text-sm font-bold" onClick={() => {
                  stopSpeaking();
                  clearTimers();
                  setNotif(null);
                  navigate(notif.type === 'morning-azkar' ? '/morning' : '/evening');
                }}>{t.common?.open || 'فتح'}</button>
                <button className="flex-1 py-3 rounded-xl border border-border bg-transparent text-text-muted text-sm font-bold" onClick={handleClose}>{t.common.close}</button>
              </>
            ) : notif.type === 'names' ? (
              <>
                <button className="flex-1 py-3 rounded-xl border border-border bg-transparent text-text-muted text-sm font-bold" onClick={handleNamesPause}>
                  {isSpeaking ? `⏸️ ${t.common.pause}` : `▶️ ${t.common.resume}`}
                </button>
                <button className="flex-1 py-3 rounded-xl bg-accent-green text-white text-sm font-bold" onClick={handleClose}>{t.common.close}</button>
              </>
            ) : (
              <button className="flex-1 py-3 rounded-xl bg-accent-green text-white text-sm font-bold" onClick={handleClose}>{t.common.close}</button>
            )}
          </div>
          )}
          {!hasBgImage && notif.type !== 'names' && notif.type !== 'morning-azkar' && notif.type !== 'evening-azkar' && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-accent-green" style={{ width: '100%', animation: 'npProgress 120s linear forwards' }} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
