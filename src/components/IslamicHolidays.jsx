import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ISLAMIC_HOLIDAYS, getHijriInfo } from '../utils/prayer-times';
import './IslamicHolidays.css';

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export default function IslamicHolidays() {
  const [currentHijri, setCurrentHijri] = useState(null);
  const [nextHoliday, setNextHoliday] = useState(null);
  const [allHolidays, setAllHolidays] = useState([]);

  useEffect(() => {
    loadHijriInfo();
  }, []);

  const loadHijriInfo = () => {
    const hijri = getHijriInfo();
    setCurrentHijri(hijri);

    const currentMonth = hijri.month;
    const currentDay = hijri.day;

    const upcoming = ISLAMIC_HOLIDAYS.filter(h => {
      if (h.month > currentMonth) return true;
      if (h.month === currentMonth && h.day > currentDay) return true;
      return false;
    }).sort((a, b) => a.month - b.month || a.day - b.day);

    if (upcoming.length > 0) {
      setNextHoliday(upcoming[0]);
    } else {
      setNextHoliday(ISLAMIC_HOLIDAYS[0]);
    }

    setAllHolidays(ISLAMIC_HOLIDAYS);
  };

  const calculateDaysUntil = (holiday) => {
    if (!currentHijri) return 0;
    const currentMonth = currentHijri.month;
    const currentDay = currentHijri.day;

    if (holiday.month > currentMonth || (holiday.month === currentMonth && holiday.day > currentDay)) {
      return (holiday.month - currentMonth) * 30 + (holiday.day - currentDay);
    }
    return (12 - currentMonth + holiday.month) * 30 + (holiday.day - currentDay);
  };

  const getHolidayEmoji = (name) => {
    if (name.includes('عيد الفطر') || name.includes('عيد الأضحى')) return '🎉';
    if (name.includes('ليلة القدر')) return '🌙';
    if (name.includes('المولد النبوي')) return '🕌';
    if (name.includes('رمضان')) return '📿';
    if (name.includes('الإسراء')) return '✈️';
    if (name.includes('عاشورة')) return '📖';
    if (name.includes('عرفة')) return '🕋';
    return '📅';
  };

  return (
    <div className="islamic-holidays">
      <h3 className="holidays-title">🕌 الأعياد والمناسبات الإسلامية</h3>

      {nextHoliday && (
        <motion.div
          className="next-holiday-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="next-holiday-label">المناسبة القادمة</div>
          <div className="next-holiday-name">
            {getHolidayEmoji(nextHoliday.name)} {nextHoliday.name}
          </div>
          <div className="next-holiday-days">
            متبقي <strong>{calculateDaysUntil(nextHoliday)}</strong> يوم
          </div>
        </motion.div>
      )}

      <div className="holidays-list">
        {allHolidays.map((holiday, index) => (
          <motion.div
            key={index}
            className={`holiday-card ${nextHoliday?.name === holiday.name ? 'next' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="holiday-emoji">{getHolidayEmoji(holiday.name)}</div>
            <div className="holiday-info">
              <div className="holiday-name">{holiday.name}</div>
              <div className="holiday-date">
                {holiday.day} {HIJRI_MONTHS[holiday.month - 1]}
              </div>
            </div>
            <div className="holiday-days">
              {calculateDaysUntil(holiday) === 0 ? (
                <span className="today-badge">اليوم</span>
              ) : (
                <span className="days-badge">{calculateDaysUntil(holiday)} يوم</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
