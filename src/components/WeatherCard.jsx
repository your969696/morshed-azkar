import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLocation } from '../utils/prayer-times';
import { useTranslation } from '../i18n.jsx';

const WMO_CODES = {
  0: { key: 'clear', icon: '☀️', night_icon: '🌙' },
  1: { key: 'mainlyClear', icon: '🌤️', night_icon: '🌙' },
  2: { key: 'partlyCloudy', icon: '⛅', night_icon: '☁️' },
  3: { key: 'overcast', icon: '☁️', night_icon: '☁️' },
  45: { key: 'fog', icon: '🌫️', night_icon: '🌫️' },
  48: { key: 'freezingFog', icon: '🌫️', night_icon: '🌫️' },
  51: { key: 'drizzleLight', icon: '🌦️', night_icon: '🌧️' },
  53: { key: 'drizzle', icon: '🌦️', night_icon: '🌧️' },
  55: { key: 'drizzleHeavy', icon: '🌧️', night_icon: '🌧️' },
  61: { key: 'rainLight', icon: '🌧️', night_icon: '🌧️' },
  63: { key: 'rain', icon: '🌧️', night_icon: '🌧️' },
  65: { key: 'rainHeavy', icon: '🌧️', night_icon: '🌧️' },
  71: { key: 'snowLight', icon: '❄️', night_icon: '❄️' },
  73: { key: 'snow', icon: '❄️', night_icon: '❄️' },
  75: { key: 'snowHeavy', icon: '❄️', night_icon: '❄️' },
  80: { key: 'showersLight', icon: '🌦️', night_icon: '🌧️' },
  81: { key: 'showers', icon: '🌧️', night_icon: '🌧️' },
  82: { key: 'showersHeavy', icon: '⛈️', night_icon: '⛈️' },
  95: { key: 'thunderstorm', icon: '⛈️', night_icon: '⛈️' },
  96: { key: 'thunderstormHail', icon: '⛈️', night_icon: '⛈️' },
};

const CACHE_KEY = 'weatherCache';
const CACHE_DURATION = 30 * 60 * 1000;

export default function WeatherCard() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Date.now() - data.ts < CACHE_DURATION) {
          setWeather(data);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { lat, lng } = getLocation();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const cur = data.current;
      const weatherData = {
        temp: Math.round(cur.temperature_2m),
        humidity: cur.relative_humidity_2m,
        windSpeed: Math.round(cur.wind_speed_10m),
        code: cur.weather_code,
        isDay: cur.is_day === 1,
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        ts: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(weatherData));
      setWeather(weatherData);
    } catch {}
    setLoading(false);
  };

  if (loading && !weather) return null;
  if (!weather) return null;

  const codeInfo = WMO_CODES[weather.code];
  const desc = codeInfo ? (t.weather[codeInfo.key] || t.weather.unknown) : t.weather.unknown;
  const icon = weather.isDay ? (codeInfo?.icon || '🌡️') : (codeInfo?.night_icon || '🌡️');

  const isDay = weather.isDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="mx-4 mb-3"
    >
      <div style={{
        background: isDay
          ? 'linear-gradient(135deg, #1a3352 0%, #0f2744 40%, #162d50 100%)'
          : 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #0d1b2a 100%)',
        border: isDay ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(99,102,241,0.15)',
        borderRadius: '20px',
        padding: '20px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '42px', lineHeight: 1 }}>{icon}</div>
            <div>
              <div style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1 }}>{weather.temp}°</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{desc}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🔺 {weather.maxTemp}°</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🔻 {weather.minTemp}°</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>💧</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{weather.humidity}%</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{t.weather.humidity}</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>🌬️</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{weather.windSpeed} km/h</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{t.weather.windSpeed}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
