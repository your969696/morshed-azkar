import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n.jsx';

const PRAYERS = [
  { key: 'Fajr', nameEn: 'Fajr', icon: '🌅', time: '4:30 ص' },
  { key: 'Dhuhr', nameEn: 'Dhuhr', icon: '☀️', time: '12:15 م' },
  { key: 'Asr', nameEn: 'Asr', icon: '🌤️', time: '3:45 م' },
  { key: 'Maghrib', nameEn: 'Maghrib', icon: '🌇', time: '6:30 م' },
  { key: 'Isha', nameEn: 'Isha', icon: '🌙', time: '8:00 م' },
];

const SUNRISE = { key: 'Sunrise', nameEn: 'Sunrise', icon: '🌄', time: '5:45 ص' };

function getDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PrayerTracker() {
  const { t, lang } = useTranslation();
  const [prayerData, setPrayerData] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const PRAYER_NAMES = t.prayer.names;

  useEffect(() => {
    const saved = localStorage.getItem('prayerTracker');
    if (saved) {
      try {
        setPrayerData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const _saveData = useCallback((newData) => {
    setPrayerData(newData);
    localStorage.setItem('prayerTracker', JSON.stringify(newData));
  }, []);

  const togglePrayer = useCallback((prayerKey) => {
    const today = getDateKey(new Date());
    setPrayerData((prev) => {
      const todayData = prev[today] || {};
      const updated = {
        ...prev,
        [today]: {
          ...todayData,
          [prayerKey]: !todayData[prayerKey],
        },
      };
      localStorage.setItem('prayerTracker', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const todayKey = getDateKey(new Date());
  const todayData = prayerData[todayKey] || {};

  const prayedCount = PRAYERS.filter((p) => todayData[p.key]).length;
  const weeklyCount = (() => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const dayData = prayerData[key] || {};
      PRAYERS.forEach((p) => {
        if (dayData[p.key]) count++;
      });
    }
    return count;
  })();

  const monthlyCount = (() => {
    let count = 0;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth(), i);
      const key = getDateKey(d);
      const dayData = prayerData[key] || {};
      PRAYERS.forEach((p) => {
        if (dayData[p.key]) count++;
      });
    }
    return count;
  })();

  const streak = (() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const dayData = prayerData[key] || {};
      const allPrayed = PRAYERS.every((p) => dayData[p.key]);
      if (allPrayed) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  })();

  const weekPercentage = Math.round((weeklyCount / 35) * 100);
  const monthPercentage = Math.round((monthlyCount / (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() * 5)) * 100);

  const calendarDays = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const dayData = prayerData[key] || {};
      const prayed = PRAYERS.filter((p) => dayData[p.key]).length;
      const dayName = lang === 'ar' ? t.prayerTracker[sunDayKey(d.getDay())] : t.prayerTracker[sunDayKey(d.getDay())];
      days.push({
        date: d,
        key,
        dayNum: d.getDate(),
        dayName,
        prayed,
        isToday: i === 0,
      });
    }
    return days;
  })();

  const _weeklyMax = 35;
  const circumference = 2 * Math.PI * 45;
  const weeklyOffset = circumference - (weekPercentage / 100) * circumference;

  return (
    <div className="page-wrap pb-24">
      <style>{`
        .prayer-card {
          background: var(--bg-card);
          border-radius: 16px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .prayer-card.prayed {
          border-color: var(--accent-green);
          box-shadow: 0 0 20px rgba(0, 200, 150, 0.2);
        }
        .prayer-card.not-prayed {
          border-color: var(--border-color);
        }
        .stat-card {
          background: linear-gradient(135deg, rgba(45, 27, 105, 0.8), rgba(15, 10, 26, 0.9));
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .calendar-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-purple);
          transition: background 0.3s;
        }
        .calendar-dot.filled {
          background: var(--accent-green);
        }
        .calendar-dot.partial {
          background: #f59e0b;
        }
        .progress-ring-circle {
          transition: stroke-dashoffset 0.5s ease;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
      `}</style>

      <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #1e1545 70%, #0f0a1a 100%)' }}>
          <svg viewBox="0 0 400 80" className="absolute top-0 w-full" preserveAspectRatio="none">
            <ellipse cx="80" cy="25" rx="50" ry="18" fill="white" opacity="0.85" />
            <ellipse cx="60" cy="25" rx="30" ry="14" fill="white" opacity="0.85" />
            <ellipse cx="100" cy="25" rx="25" ry="11" fill="white" opacity="0.85" />
            <ellipse cx="250" cy="20" rx="45" ry="16" fill="white" opacity="0.85" />
            <ellipse cx="235" cy="20" rx="28" ry="12" fill="white" opacity="0.85" />
          </svg>
          <svg viewBox="0 0 400 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,60 L0,50 L20,50 L25,35 L30,50 L45,50 L50,25 L55,50 L70,50 L75,40 L80,50 L120,50 L130,20 L140,50 L180,50 L185,42 L190,50 L220,50 L225,30 L230,50 L260,50 L270,22 L280,50 L310,50 L315,38 L320,50 L350,50 L360,15 L370,50 L400,50 L400,60 Z" fill="#0f0a1a" opacity="0.6" />
          </svg>
        </div>
        <div className="relative z-10 px-6 pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
            <h1 className="text-white text-4xl font-bold" style={{ fontFamily: 'var(--font-amiri)' }}>{t.prayerTracker.titlePage}</h1>
            <p className="text-white/70 text-sm mt-2">{t.prayerTracker.prayedCount.replace('{count}', prayedCount)}</p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <h2 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-amiri)' }}>{t.prayerTracker.today}</h2>
          <div className="space-y-3">
            {PRAYERS.map((prayer, i) => {
              const isPrayed = todayData[prayer.key] || false;
              return (
                <motion.button
                  key={prayer.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => togglePrayer(prayer.key)}
                  className={`prayer-card w-full p-4 flex items-center justify-between ${isPrayed ? 'prayed' : 'not-prayed'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prayer.icon}</span>
                    <div className="text-right">
                      <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-amiri)' }}>{PRAYER_NAMES[i]}</h3>
                      <p className="text-white/50 text-xs">{prayer.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/70 text-sm">{prayer.time}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPrayed ? 'bg-[#00c896]' : 'bg-[#3d2580]'}`}>
                      {isPrayed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-white/50" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="prayer-card not-prayed w-full p-4 flex items-center justify-between opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{SUNRISE.icon}</span>
                <div className="text-right">
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-amiri)' }}>{PRAYER_NAMES[1]}</h3>
                  <p className="text-white/50 text-xs">{SUNRISE.nameEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">{SUNRISE.time}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#3d2580]/50">
                  <div className="w-3 h-3 rounded-full border-2 border-white/30 border-dashed" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <h2 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-amiri)' }}>{t.prayerTracker.stats}</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="stat-card p-4">
              <p className="text-white/60 text-xs mb-1">{t.prayerTracker.thisWeek}</p>
              <p className="text-[#00c896] text-2xl font-bold">{weeklyCount}<span className="text-white/50 text-sm">/35</span></p>
              <p className="text-white/50 text-[10px]">{t.prayerTracker.prayers}</p>
            </div>
            <div className="stat-card p-4">
              <p className="text-white/60 text-xs mb-1">{t.prayerTracker.thisMonth}</p>
              <p className="text-[#8b5cf6] text-2xl font-bold">{monthlyCount}</p>
              <p className="text-white/50 text-[10px]">{t.prayerTracker.prayers}</p>
            </div>
            <div className="stat-card p-4">
              <p className="text-white/60 text-xs mb-1">{t.prayerTracker.dayStreak}</p>
              <p className="text-[#f59e0b] text-2xl font-bold">{streak}</p>
              <p className="text-white/50 text-[10px]">{t.prayerTracker.dayStreakUnit}</p>
            </div>
            <div className="stat-card p-4 flex items-center justify-center">
              <div className="relative">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3d2580" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#00c896"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={weeklyOffset}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{weekPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
          <h2 className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-amiri)' }}>{t.prayerTracker.calendar}</h2>
          <div className="stat-card p-4">
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => (
                <motion.div
                  key={day.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  className={`flex flex-col items-center p-2 rounded-xl ${day.isToday ? 'bg-[#8b5cf6]/30 border border-[#8b5cf6]/50' : ''}`}
                >
                  <span className="text-white/50 text-[10px] mb-1">{day.dayName}</span>
                  <span className={`text-sm font-bold mb-2 ${day.isToday ? 'text-[#8b5cf6]' : 'text-white/80'}`}>{day.dayNum}</span>
                  <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: '32px' }}>
                    {PRAYERS.map((p) => {
                      const dayData = prayerData[day.key] || {};
                      const isPrayed = dayData[p.key] || false;
                      return (
                        <div
                          key={p.key}
                          className={`calendar-dot ${isPrayed ? 'filled' : ''}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-white/40 text-[9px] mt-1">{day.prayed}/5</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
          <div className="stat-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">{t.prayerTracker.monthlyProgress}</p>
                <p className="text-white text-2xl font-bold mt-1">{monthPercentage}%</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-8 rounded-full"
                    style={{
                      background: i <= Math.ceil(monthPercentage / 20) ? '#00c896' : '#3d2580',
                      opacity: i <= Math.ceil(monthPercentage / 20) ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl bg-[#151030] border border-[#3d2580] text-[#7a6f96] font-bold text-sm hover:bg-[#1a1040] transition-all"
          >
            {t.prayerTracker.resetDay}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f0a1a]/80 flex items-center justify-center z-50 px-6"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151030] rounded-2xl p-6 border border-[#3d2580] w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-amiri)' }}>{t.prayerTracker.resetTitle}</h3>
              <p className="text-white/60 text-sm mb-6">{t.prayerTracker.resetConfirm}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPrayerData((prev) => {
                      const updated = { ...prev };
                      delete updated[todayKey];
                      localStorage.setItem('prayerTracker', JSON.stringify(updated));
                      return updated;
                    });
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#ef4444]/20 text-[#ef4444] font-bold text-sm border border-[#ef4444]/30"
                >
                  {t.prayerTracker.yesReset}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-[#3d2580] text-white font-bold text-sm"
                >
                  {t.prayerTracker.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function sunDayKey(idx) {
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return keys[idx];
}
