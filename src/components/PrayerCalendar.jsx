import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMonthlyPrayerTimes, getHijriInfoFromApi, getIslamicHolidays, getImsakTime, getMidnightTime, getLastThirdTime, getLocation } from '../utils/prayer-times';
import './PrayerCalendar.css';

const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export default function PrayerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysData, setDaysData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showHijri, setShowHijri] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadCalendar();
  }, [year, month]);

  const loadCalendar = async () => {
    setLoading(true);
    const loc = getLocation();
    if (!loc?.lat) {
      setLoading(false);
      return;
    }

    const data = await getMonthlyPrayerTimes(loc.lat, loc.lng, year, month);
    if (data) {
      const map = {};
      data.forEach((d) => {
        const dayNum = parseInt(d.date.gregorian.day);
        map[dayNum] = d;
      });
      setDaysData(map);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = () => new Date(year, month - 1, 1).getDay();

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const getHijriForDay = (day) => {
    const data = daysData[day];
    if (!data) return null;
    const hijri = data.date?.hijri;
    return hijri ? { day: hijri.day, month: hijri.month?.number, year: hijri.year, monthName: hijri.month?.ar } : null;
  };

  const getHolidaysForDay = (day) => {
    const data = daysData[day];
    return data?.holidays || [];
  };

  const formatPrayerTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'م' : 'ص';
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;
  };

  const renderDay = (day) => {
    const hijri = getHijriForDay(day);
    const holidays = getHolidaysForDay(day);
    const data = daysData[day];
    const today = isToday(day);

    return (
      <motion.div
        key={day}
        className={`prayer-calendar-day ${today ? 'today' : ''} ${holidays.length > 0 ? 'holiday' : ''}`}
        whileHover={{ scale: 1.05 }}
        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
      >
        <div className="day-gregorian">{day}</div>
        {showHijri && hijri && (
          <div className="day-hijri">{hijri.day}</div>
        )}
        {holidays.length > 0 && (
          <div className="day-holiday">🎉</div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="prayer-calendar">
      <div className="prayer-calendar-header">
        <button onClick={prevMonth} className="nav-btn">◀</button>
        <div className="month-title">
          <span className="gregorian-month">
            {currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <button onClick={nextMonth} className="nav-btn">▶</button>
      </div>

      <div className="calendar-toggle">
        <button
          onClick={() => setShowHijri(!showHijri)}
          className={`toggle-btn ${showHijri ? 'active' : ''}`}
        >
          {showHijri ? '📜 هجري' : '📅 ميلادي'}
        </button>
      </div>

      {loading ? (
        <div className="loading">جاري تحميل التقويم...</div>
      ) : (
        <>
          <div className="prayer-calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="prayer-calendar-grid">
            {Array(getFirstDayOfMonth()).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="prayer-calendar-day empty" />
            ))}
            {Array(getDaysInMonth()).fill(null).map((_, i) => renderDay(i + 1))}
          </div>

          <AnimatePresence>
            {selectedDay && daysData[selectedDay] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="day-details"
              >
                <div className="day-details-header">
                  <span className="day-number">{selectedDay}</span>
                  <span className="day-hijri-full">
                    {getHijriForDay(selectedDay)?.day} {HIJRI_MONTHS[(getHijriForDay(selectedDay)?.month || 1) - 1]}
                  </span>
                </div>

                <div className="prayer-times-grid">
                  <div className="prayer-row">
                    <span className="prayer-name">الفجر</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Fajr)}</span>
                  </div>
                  <div className="prayer-row">
                    <span className="prayer-name">الشروق</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Sunrise)}</span>
                  </div>
                  <div className="prayer-row">
                    <span className="prayer-name">الظهر</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Dhuhr)}</span>
                  </div>
                  <div className="prayer-row">
                    <span className="prayer-name">العصر</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Asr)}</span>
                  </div>
                  <div className="prayer-row">
                    <span className="prayer-name">المغرب</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Maghrib)}</span>
                  </div>
                  <div className="prayer-row">
                    <span className="prayer-name">العشاء</span>
                    <span className="prayer-time">{formatPrayerTime(daysData[selectedDay].timings.Isha)}</span>
                  </div>

                  <div className="prayer-divider"></div>

                  <div className="prayer-row extra">
                    <span className="prayer-name">⏰ الإمساك (السحور)</span>
                    <span className="prayer-time">{formatPrayerTime(getImsakTime(daysData[selectedDay].timings))}</span>
                  </div>
                  <div className="prayer-row extra">
                    <span className="prayer-name">🌙 منتصف الليل</span>
                    <span className="prayer-time">{formatPrayerTime(getMidnightTime(daysData[selectedDay].timings))}</span>
                  </div>
                  <div className="prayer-row extra">
                    <span className="prayer-name">🌙 الثلث الأخير</span>
                    <span className="prayer-time">{formatPrayerTime(getLastThirdTime(daysData[selectedDay].timings))}</span>
                  </div>
                </div>

                {getHolidaysForDay(selectedDay).length > 0 && (
                  <div className="holidays-section">
                    <div className="holidays-title">🎉 أعياد إسلامية</div>
                    {getHolidaysForDay(selectedDay).map((h, i) => (
                      <div key={i} className="holiday-item">
                        <span>{h.holiday}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
