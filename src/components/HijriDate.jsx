import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function getHijriDate() {
  const today = new Date();
  const options = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' };
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA', options);
    return formatter.format(today);
  } catch {
    return '';
  }
}

function getGregorianDate() {
  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('ar-EG', options).format(today);
}

function getArabicDayName() {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[new Date().getDay()];
}

const MosqueIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f0b040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C9 2 7 4 7 6v2H5c-1 0-2 1-2 2v2h20v-2c0-1-1-2-2-2h-2V6c0-2-2-4-5-4z"/>
    <rect x="3" y="12" width="18" height="10" rx="1"/>
    <path d="M12 2v-0"/>
    <path d="M12 8V6"/>
    <path d="M9 12h6"/>
    <path d="M8 16h8"/>
    <circle cx="12" cy="5" r="1" fill="#f0b040"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function HijriDate() {
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [dayName, setDayName] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      setHijriDate(getHijriDate());
      setGregorianDate(getGregorianDate());
      setDayName(getArabicDayName());
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card rounded-2xl p-5 mb-6 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <MosqueIcon />
        <div className="flex items-center gap-2">
          <ClockIcon />
          <div className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-amiri)' }}>{currentTime}</div>
        </div>
      </div>
      <h2 className="text-white font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-amiri)' }}>{dayName}</h2>
      <div className="flex items-center justify-center gap-2 mb-1">
        <CalendarIcon />
        <span className="text-white font-bold text-base">{hijriDate}</span>
      </div>
      <div className="text-white/60 text-sm mt-1">{gregorianDate}</div>
    </motion.div>
  );
}
