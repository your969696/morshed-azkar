import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { speakArabic, stopSpeaking } from '../utils/sound';

const PRAYERS = [
  { key: 'Fajr', name: 'صلاة الفجر', icon: '🌅', rakat: '2 ركعات فرض + 2 ركعة سنة', time: 'من طلوع الفجر حتى شروق الشمس', notes: 'يُستحب صلاة ركعتي الفجر قبل أداء الفرض' },
  { key: 'Sunrise', name: 'الشروق', icon: '☀️', rakat: 'لا صلاة بعد الفجر حتى تطلع الشمس', time: 'من شروق الشمس حتى 15 دقيقة', notes: 'يُنهى عن الصلاة في هذا الوقت' },
  { key: 'Dhuhr', name: 'صلاة الظهر', icon: '🌤️', rakat: '4 ركعات فرض + 2 ركعة سنة قبل + 4 ركعة سنة بعدها', time: 'من زوال الشمس حتى وقت العصر', notes: 'أطول وقت للصلاة' },
  { key: 'Asr', name: 'صلاة العصر', icon: '⛅', rakat: '4 ركعات فرض + 2 ركعة سنة', time: 'من اصفرار الشمس حتى غروبها', notes: 'لا تُؤخر الصلاة عن وقتها' },
  { key: 'Maghrib', name: 'صلاة المغرب', icon: '🌇', rakat: '3 ركعات فرض + 3 ركعات سنة', time: 'من غروب الشمس حتى انتهاء الشفق', notes: 'يُستحب التأخير عن الأكل' },
  { key: 'Isha', name: 'صلاة العشاء', icon: '🌙', rakat: '4 ركعات فرض + 3 ركعات وتر', time: 'من انتهاء الشفق حتى منتصف الليل', notes: 'صلاة الوتر سنة مؤكدة' },
];

function timeToMinutes(timeStr) { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; }
function to12Hour(timeStr) { const [h, m] = timeStr.split(':').map(Number); const p = h >= 12 ? 'م' : 'ص'; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${h12}:${String(m).padStart(2, '0')} ${p}`; }
function formatCountdown(mins) { if (mins <= 0) return 'الآن'; const h = Math.floor(mins / 60); const m = Math.floor(mins % 60); return h > 0 ? `${h} ساعة ${m} دقيقة` : `${m} دقيقة`; }

export default function PrayerGuide() {
  const [times, setTimes] = useState(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState(0);

  const fetchTimes = useCallback(async (lat, lng) => {
    try {
      setLoading(true);
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=2`);
      const json = await res.json();
      if (json.code === 200) setTimes(json.data.timings);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => fetchTimes(p.coords.latitude, p.coords.longitude), () => fetchTimes(30.0444, 31.2357));
    } else fetchTimes(30.0444, 31.2357);
  }, [fetchTimes]);

  useEffect(() => { const i = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(i); }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  let activeIdx = 0;
  if (times) {
    const ends = [times.Sunrise, times.Dhuhr, times.Asr, times.Maghrib, times.Isha, times.Fajr];
    for (let i = 0; i < 6; i++) {
      const s = timeToMinutes(times[PRAYERS[i].key]);
      const e = timeToMinutes(ends[i]);
      if (nowMin >= s && nowMin < e) { activeIdx = i; break; }
    }
  }
  const active = PRAYERS[activeIdx];
  const activeTime = times ? times[active.key] : '--:--';
  const activeEndMin = times ? timeToMinutes([times.Sunrise, times.Dhuhr, times.Asr, times.Maghrib, times.Isha, times.Fajr][activeIdx]) : 0;
  const countdown = activeEndMin - nowMin;

  const handleSpeak = (text) => {
    speakArabic(text);
  };

  return (
    <div className="page-wrap pb-24">
      <div className="relative overflow-hidden" style={{ minHeight: '480px' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1c1040 0%, #2d1b69 40%, #1e1545 70%, #0f0a1a 100%)' }}>
          <svg viewBox="0 0 400 100" className="absolute top-0 w-full" preserveAspectRatio="none">
            <ellipse cx="80" cy="30" rx="50" ry="20" fill="white" opacity="0.9" />
            <ellipse cx="60" cy="30" rx="30" ry="15" fill="white" opacity="0.9" />
            <ellipse cx="100" cy="30" rx="25" ry="12" fill="white" opacity="0.9" />
            <ellipse cx="200" cy="25" rx="45" ry="18" fill="white" opacity="0.9" />
            <ellipse cx="180" cy="25" rx="28" ry="14" fill="white" opacity="0.9" />
            <ellipse cx="220" cy="25" rx="22" ry="11" fill="white" opacity="0.9" />
            <ellipse cx="340" cy="35" rx="35" ry="14" fill="white" opacity="0.9" />
            <ellipse cx="325" cy="35" rx="22" ry="10" fill="white" opacity="0.9" />
            <ellipse cx="355" cy="35" rx="18" ry="9" fill="white" opacity="0.9" />
          </svg>

          <svg viewBox="0 0 400 150" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <rect x="0" y="60" width="400" height="90" fill="#0d0020" />
            <rect x="0" y="80" width="400" height="70" fill="#0f0a1a" opacity="0.5" />
            <path d="M0 130 Q100 100 200 130 Q300 160 400 130 L400 150 L0 150 Z" fill="#0d0020" />
            <rect x="10" y="70" width="12" height="90" fill="#0d0020" />
            <rect x="28" y="55" width="8" height="105" fill="#0d0020" />
            <rect x="42" y="65" width="14" height="95" fill="#0d0020" />
            <rect x="62" y="50" width="6" height="110" fill="#0d0020" />
            <rect x="75" y="60" width="16" height="100" fill="#0d0020" />
            <rect x="100" y="45" width="5" height="115" fill="#0d0020" />
            <rect x="112" y="55" width="20" height="105" fill="#0d0020" />
            <rect x="140" y="40" width="4" height="120" fill="#0d0020" />
            <rect x="150" y="55" width="10" height="105" fill="#0d0020" />
            <rect x="168" y="35" width="18" height="125" fill="#0d0020" />
            <rect x="195" y="50" width="6" height="110" fill="#0d0020" />
            <rect x="208" y="60" width="12" height="100" fill="#0d0020" />
            <rect x="228" y="45" width="8" height="115" fill="#0d0020" />
            <rect x="242" y="55" width="22" height="105" fill="#0d0020" />
            <rect x="272" y="40" width="6" height="120" fill="#0d0020" />
            <rect x="285" y="55" width="14" height="105" fill="#0d0020" />
            <rect x="306" y="50" width="10" height="110" fill="#0d0020" />
            <rect x="322" y="60" width="16" height="100" fill="#0d0020" />
            <rect x="345" y="45" width="8" height="115" fill="#0d0020" />
            <rect x="360" y="55" width="12" height="105" fill="#0d0020" />
            <rect x="378" y="50" width="22" height="110" fill="#0d0020" />
            <circle cx="185" cy="55" r="12" fill="#0d0020" />
            <path d="M183 43 L185 35 L187 43" fill="#0d0020" />
            <path d="M0 130 Q50 110 100 125 Q150 140 200 120 Q250 100 300 125 Q350 145 400 130 L400 150 L0 150 Z" fill="#0d0020" opacity="0.7" />
            <ellipse cx="100" cy="140" rx="60" ry="8" fill="#0d0020" opacity="0.3" />
            <ellipse cx="250" cy="142" rx="50" ry="6" fill="#0d0020" opacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 px-6 pt-8 pb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
            <h1 className="text-white text-5xl font-bold" style={{ fontFamily: 'var(--font-amiri)' }}>الصلاة</h1>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-8">
            <p className="text-white/90 text-xl font-bold" style={{ fontFamily: 'var(--font-naskh)' }}>
              حان الآن {active.name}
            </p>
            <p className="text-white/60 text-sm mt-2">{formatCountdown(countdown)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center gap-5 mb-4">
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-[#2d1b69] text-lg font-bold">{times ? to12Hour(activeTime).split(' ')[0] : '--:--'}</div>
                <div className="text-[#2d1b69]/60 text-[10px]">{times ? to12Hour(activeTime).split(' ')[1] : ''}</div>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-[#2d1b69] text-lg font-bold">{formatCountdown(countdown).split(' ')[0]}</div>
                <div className="text-[#2d1b69]/60 text-[10px]">{formatCountdown(countdown).split(' ')[1] || 'الآن'}</div>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <div className="text-3xl">{active.icon}</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-2 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border-2 border-[#4a2d7a] shadow-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #2d1b69 0%, #0f0a1a 100%)' }}>

          <div className="p-4">
            {PRAYERS.map((prayer, i) => {
              const isActive = selectedPrayer === i;
              const isNow = activeIdx === i;
              return (
                <motion.button key={prayer.key} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPrayer(i)}
                  className={`w-full text-right p-4 rounded-2xl mb-3 transition-all border-2 ${isActive ? 'bg-[#4a2d7a] border-[#8b5cf6] shadow-lg shadow-purple-500/20' : isNow ? 'bg-[#3d2580]/50 border-[#00c896]/30' : 'bg-[#0f0a1a]/50 border-transparent hover:border-[#4a2d7a]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{prayer.icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-sm">{prayer.name}</h3>
                        {isNow && <span className="text-[#00c896] text-[10px] font-bold">🟢 الحالية</span>}
                      </div>
                    </div>
                    <span className="text-white/80 text-sm font-bold" style={{ fontFamily: 'var(--font-amiri)' }}>{times ? to12Hour(times[prayer.key]) : '--:--'}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="px-4 pb-4">
            <div className="bg-[#0f0a1a]/70 rounded-2xl p-4 border border-[#4a2d7a]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📋</span>
                <h3 className="text-[#f59e0b] font-bold text-sm">تفاصيل {PRAYERS[selectedPrayer].name}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#00c896] text-xs mt-0.5">●</span>
                  <div>
                    <p className="text-[#9580b0] text-[10px]">الركعات</p>
                    <p className="text-white text-xs font-bold">{PRAYERS[selectedPrayer].rakat}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#f59e0b] text-xs mt-0.5">●</span>
                  <div>
                    <p className="text-[#9580b0] text-[10px]">الوقت</p>
                    <p className="text-white text-xs font-bold">{PRAYERS[selectedPrayer].time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#8b5cf6] text-xs mt-0.5">●</span>
                  <div>
                    <p className="text-[#9580b0] text-[10px]">ملاحظات</p>
                    <p className="text-white text-xs font-bold">{PRAYERS[selectedPrayer].notes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button onClick={() => handleSpeak('صلوات الخمس: الفجر والظهر والعصر والمغرب والعشاء')} className="w-full py-3 rounded-xl bg-[#00c896] text-white font-bold text-sm hover:bg-[#059669] transition-all flex items-center justify-center gap-2">
              <span>🔊</span>
              <span>استمع لأوقات الصلاة</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 mt-6">
        <Link to="/prayer-guide" className="block rounded-2xl p-4 border-2 border-[#4a2d7a] hover:border-[#8b5cf6] transition-all" style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #0f0a1a 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-2xl">💧</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">شرح الوضوء والصلاة</h3>
              <p className="text-[#9580b0] text-xs">خطوات مفصّلة مع أحاديث</p>
            </div>
            <span className="text-[#00c896] text-lg">←</span>
          </div>
        </Link>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-[#0f0a1a]/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#00c896] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#c4b5d4] text-sm">جاري تحميل أوقات الصلاة...</p>
          </div>
        </div>
      )}
    </div>
  );
}
