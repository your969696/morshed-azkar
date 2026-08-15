import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCities,
  setLocation,
  getPrayerTimes,
  setLocationByCoords,
  lookupPostalCode,
} from '../utils/prayer-times';
import { useTranslation } from '../i18n.jsx';

const cities = getCities();

const COUNTRIES = [
  { code: 'eg', label: 'Egypt', labelAr: 'مصر', flag: '🇪🇬', placeholder: 'الرمز البريدي' },
  { code: 'sa', label: 'Saudi Arabia', labelAr: 'السعودية', flag: '🇸🇦', placeholder: 'الرمز البريدي (11564)' },
  { code: 'us', label: 'United States', labelAr: 'أمريكا', flag: '🇺🇸', placeholder: 'ZIP Code (10001)' },
  { code: 'ae', label: 'UAE', labelAr: 'الإمارات', flag: '🇦🇪', placeholder: 'PO Box (00000)' },
  { code: 'kw', label: 'Kuwait', labelAr: 'الكويت', flag: '🇰🇼', placeholder: 'الرمز البريدي' },
  { code: 'qa', label: 'Qatar', labelAr: 'قطر', flag: '🇶🇦', placeholder: 'الرمز البريدي' },
  { code: 'bh', label: 'Bahrain', labelAr: 'البحرين', flag: '🇧🇭', placeholder: 'الرمز البريدي' },
  { code: 'om', label: 'Oman', labelAr: 'عمان', flag: '🇴🇲', placeholder: 'الرمز البريدي' },
  { code: 'jo', label: 'Jordan', labelAr: 'الأردن', flag: '🇯🇴', placeholder: 'الرمز البريدي' },
  { code: 'lb', label: 'Lebanon', labelAr: 'لبنان', flag: '🇱🇧', placeholder: 'الرمز البريدي' },
  { code: 'iq', label: 'Iraq', labelAr: 'العراق', flag: '🇮🇶', placeholder: 'الرمز البريدي' },
  { code: 'sy', label: 'Syria', labelAr: 'سوريا', flag: '🇸🇾', placeholder: 'الرمز البريدي' },
  { code: 'ps', label: 'Palestine', labelAr: 'فلسطين', flag: '🇵🇸', placeholder: 'الرمز البريدي' },
  { code: 'ye', label: 'Yemen', labelAr: 'اليمن', flag: '🇾🇪', placeholder: 'الرمز البريدي' },
  { code: 'ly', label: 'Libya', labelAr: 'ليبيا', flag: '🇱🇾', placeholder: 'الرمز البريدي' },
  { code: 'sd', label: 'Sudan', labelAr: 'السودان', flag: '🇸🇩', placeholder: 'الرمز البريدي' },
  { code: 'so', label: 'Somalia', labelAr: 'الصومال', flag: '🇸🇴', placeholder: 'الرمز البريدي' },
  { code: 'dj', label: 'Djibouti', labelAr: 'جيبوتي', flag: '🇩🇯', placeholder: 'الرمز البريدي' },
  { code: 'km', label: 'Comoros', labelAr: 'جزر القمر', flag: '🇰🇲', placeholder: 'الرمز البريدي' },
  { code: 'mr', label: 'Mauritania', labelAr: 'موريتانيا', flag: '🇲🇷', placeholder: 'الرمز البريدي' },
  { code: 'tn', label: 'Tunisia', labelAr: 'تونس', flag: '🇹🇳', placeholder: 'الرمز البريدي' },
  { code: 'dz', label: 'Algeria', labelAr: 'الجزائر', flag: '🇩🇿', placeholder: 'الرمز البريدي' },
  { code: 'ma', label: 'Morocco', labelAr: 'المغرب', flag: '🇲🇦', placeholder: 'الرمز البريدي' },
  { code: 'tr', label: 'Turkey', labelAr: 'تركيا', flag: '🇹🇷', placeholder: 'Posta Kodu (34000)' },
  { code: 'ir', label: 'Iran', labelAr: 'إيران', flag: '🇮🇷', placeholder: 'کد پستی (1234567890)' },
  { code: 'af', label: 'Afghanistan', labelAr: 'أفغانستان', flag: '🇦🇫', placeholder: 'Postal Code' },
  { code: 'pk', label: 'Pakistan', labelAr: 'باكستان', flag: '🇵🇰', placeholder: 'Postal Code (54000)' },
  { code: 'bd', label: 'Bangladesh', labelAr: 'بنغلاديش', flag: '🇧🇩', placeholder: 'Postal Code (1000)' },
  { code: 'id', label: 'Indonesia', labelAr: 'إندونيسيا', flag: '🇮🇩', placeholder: 'Kode Pos (10110)' },
  { code: 'my', label: 'Malaysia', labelAr: 'ماليزيا', flag: '🇲🇾', placeholder: 'Postcode (50000)' },
  { code: 'bn', label: 'Brunei', labelAr: 'بروناي', flag: '🇧🇳', placeholder: 'Postal Code' },
  { code: 'mv', label: 'Maldives', labelAr: 'المالديف', flag: '🇲🇻', placeholder: 'Postal Code' },
  { code: 'al', label: 'Albania', labelAr: 'ألبانيا', flag: '🇦🇱', placeholder: 'Postal Code' },
  { code: 'ba', label: 'Bosnia', labelAr: 'البوسنة', flag: '🇧🇦', placeholder: 'Poštanski broj' },
  { code: 'xk', label: 'Kosovo', labelAr: 'كوسوفو', flag: '🇽🇰', placeholder: 'Postal Code' },
  { code: 'me', label: 'Montenegro', labelAr: 'الجبل الأسود', flag: '🇲🇪', placeholder: 'Poštanski broj' },
  { code: 'mk', label: 'North Macedonia', labelAr: 'مقدونيا', flag: '🇲🇰', placeholder: 'Поштенски код' },
  { code: 'rs', label: 'Serbia', labelAr: 'صربيا', flag: '🇷🇸', placeholder: 'Поштански број' },
  { code: 'ng', label: 'Nigeria', labelAr: 'نيجيريا', flag: '🇳🇬', placeholder: 'Postal Code (100001)' },
  { code: 'gh', label: 'Ghana', labelAr: 'غانا', flag: '🇬🇭', placeholder: 'Postal Code' },
  { code: 'tz', label: 'Tanzania', labelAr: 'تنزانيا', flag: '🇹🇿', placeholder: 'Postal Code' },
  { code: 'ke', label: 'Kenya', labelAr: 'كينيا', flag: '🇰🇪', placeholder: 'Postal Code (00100)' },
  { code: 'ug', label: 'Uganda', labelAr: 'أوغندا', flag: '🇺🇬', placeholder: 'Postal Code' },
  { code: 'et', label: 'Ethiopia', labelAr: 'إثيوبيا', flag: '🇪🇹', placeholder: 'Postal Code' },
  { code: 'gb', label: 'United Kingdom', labelAr: 'بريطانيا', flag: '🇬🇧', placeholder: 'Postcode (SW1A 1AA)' },
  { code: 'de', label: 'Germany', labelAr: 'ألمانيا', flag: '🇩🇪', placeholder: 'PLZ (10115)' },
  { code: 'fr', label: 'France', labelAr: 'فرنسا', flag: '🇫🇷', placeholder: 'Code postal (75001)' },
  { code: 'it', label: 'Italy', labelAr: 'إيطاليا', flag: '🇮🇹', placeholder: 'CAP (00100)' },
  { code: 'es', label: 'Spain', labelAr: 'إسبانيا', flag: '🇪🇸', placeholder: 'Código postal (28001)' },
  { code: 'au', label: 'Australia', labelAr: 'أستراليا', flag: '🇦🇺', placeholder: 'Postcode (2000)' },
  { code: 'nz', label: 'New Zealand', labelAr: 'نيوزيلندا', flag: '🇳🇿', placeholder: 'Postcode (6011)' },
  { code: 'ca', label: 'Canada', labelAr: 'كندا', flag: '🇨🇦', placeholder: 'Postal Code (K1A 0B1)' },
  { code: 'br', label: 'Brazil', labelAr: 'البرازيل', flag: '🇧🇷', placeholder: 'CEP (01000-000)' },
  { code: 'mx', label: 'Mexico', labelAr: 'المكسيك', flag: '🇲🇽', placeholder: 'Código postal (06600)' },
];

const LANGUAGES = [
  { code: 'ar', label: 'العربية', native: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', native: 'Español', dir: 'ltr' },
];

export default function LocationSetup({ onDone }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(-1);
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ar');
  const [cityMode, setCityMode] = useState('city');
  const [postalCode, setPostalCode] = useState('');
  const [postalCountry, setPostalCountry] = useState('sa');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    const done = localStorage.getItem('locationSetupDone');
    if (done === 'true') { setVisible(false); return; }
    try { const loc = JSON.parse(localStorage.getItem('prayerLocation')); if (loc && loc.lat && loc.lng) {
      localStorage.setItem('locationSetupDone', 'true');
      localStorage.setItem('app_lang', 'ar');
      persistSettings(localStorage.getItem('prayerLocation'));
      setVisible(false); if (onDone) onDone(); return;
    }} catch {}
    if (localStorage.getItem('tasbih_total')) {
      localStorage.setItem('locationSetupDone', 'true');
      localStorage.setItem('app_lang', 'ar');
      localStorage.setItem('prayerLocation', JSON.stringify({ city: 'Los Angeles', country: 'United States', country_code: 'us', lat: 34.0522, lng: -118.2437 }));
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      persistSettings(localStorage.getItem('prayerLocation'));
      if (onDone) onDone();
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (!visible) return null;

  const handleLangChange = (code) => {
    setLang(code);
    localStorage.setItem('app_lang', code);
    localStorage.setItem('langSetupDone', 'true');
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) { setError(t.locationSetup.geoNotSupported); return; }
    setDetecting(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let cc = '';
          try {
            const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${pos.coords.latitude},${pos.coords.longitude}&count=1&language=en`);
            const j = await r.json();
            cc = j.results?.[0]?.country_code?.toLowerCase() || '';
          } catch {}
          setLocationByCoords(pos.coords.latitude, pos.coords.longitude, cc);
          await getPrayerTimes();
          localStorage.setItem('locationSetupDone', 'true');
          await persistSettings(localStorage.getItem('prayerLocation'));
          setLoading(false); setVisible(false); setDetecting(false);
          if (onDone) onDone();
        } catch {
          setError('فشل تحديد الموقع، حاول مرة أخرى');
          setDetecting(false);
        }
      },
      () => { setDetecting(false); setError(t.locationSetup.geoFailed); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const persistSettings = async (loc) => {
    const api = window.electronAPI;
    if (!api?.settingsSet) return;
    await api.settingsSet('locationSetupDone', 'true');
    if (loc) await api.settingsSet('prayerLocation', typeof loc === 'string' ? loc : JSON.stringify(loc));
  };

  const handleSubmit = async (selected) => {
    setLoading(true); setError('');
    try {
      if (cityMode === 'city' && selected) {
        const city = cities.find(c => c.name === selected);
        if (city) {
          setLocation(city.name, city.lat, city.lng);
        } else {
          setError('اختر مدينة'); setLoading(false); return;
        }
      } else if (cityMode === 'postal' && postalCode) {
        const result = await lookupPostalCode(postalCode, postalCountry);
        const locName = `${result.city}, ${result.country}`;
        setLocation(locName, result.lat, result.lng, result.countryCode);
      } else {
        setError('الرجاء اختيار المدينة أو إدخال الرمز البريدي');
        setLoading(false); return;
      }
      await getPrayerTimes().catch(() => {});
      localStorage.setItem('locationSetupDone', 'true');
      await persistSettings(localStorage.getItem('prayerLocation'));
      setLoading(false); setVisible(false);
      if (onDone) onDone();
    } catch {
      setError('حدث خطأ، حاول مرة أخرى');
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((c) => c.name.includes(citySearch));
  const filteredCountries = COUNTRIES.filter(
    (c) => c.label.toLowerCase().includes(countrySearch.toLowerCase()) || c.labelAr.includes(countrySearch)
  );
  const selectedCountryObj = COUNTRIES.find((c) => c.code === postalCountry);

  return (
    <div className="ls-root">
      <div className="ls-card">
        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.div key="features" className="ls-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
              <div className="ls-header" style={{ marginBottom: 8 }}>
                <h2 className="ls-title" style={{ fontSize: '1.6rem' }}>🕌 الأذكار الإسلامية</h2>
                <p className="ls-desc" style={{ fontSize: '0.9rem' }}>تطبيقك الشامل للأذكار والعبادات</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginBottom: 8 }}>
                {[
                  { emoji: '📖', title: 'أذكار الصباح والمساء', desc: 'أذكار مصوّرة مع النطق والشرح' },
                  { emoji: '📿', title: 'أوقات الصلاة', desc: 'مواقيت دقيقة مع تنبيهات الأذان' },
                  { emoji: ' Quran', title: 'القرآن الكريم', desc: 'قراءة واستماع بأصوات متعددة' },
                  { emoji: '🕌', title: 'كيف تصلي', desc: 'دليل مفصّل لصلاة الظهر والجمعه' },
                  { emoji: '🧭', title: 'اتجاه القبلة', desc: 'تحديد دقيق لاتجاه القبلة' },
                  { emoji: '📿', title: 'التسبيح', desc: 'سبحة رقمية مع العدّاد' },
                  { emoji: '💡', title: 'اختبر نفسك', desc: 'اختبارات إسلامية متنوعة' },
                  { emoji: '📅', title: 'التقويم الهجري', desc: 'تحويل التواريخ وحساب العمر الهجري' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{f.emoji}</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="ls-btn-primary" onClick={() => setStep(0)}>
                ابدأ الإعداد
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </motion.div>
          )}

          {step === 0 && (
            <motion.div key="lang" className="ls-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="ls-header">
                <button className="ls-back" onClick={() => setStep(-1)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div className="ls-step-dots"><div className="ls-dot active" /><div className="ls-dot" /><div className="ls-dot" /></div>
                <h2 className="ls-title">اختر لغتك</h2>
                <p className="ls-desc">Select your language</p>
              </div>
              <div className="ls-lang-grid">
                {LANGUAGES.map((l) => (
                  <button key={l.code} className={`ls-lang-btn ${lang === l.code ? 'active' : ''}`} onClick={() => handleLangChange(l.code)}>
                    <span className="ls-lang-native">{l.native}</span>
                    <span className="ls-lang-sub">{l.code === 'ar' ? 'Arabic' : l.code === 'en' ? 'English' : 'Spanish'}</span>
                  </button>
                ))}
              </div>
              <button className="ls-btn-primary" onClick={() => setStep(1)}>
                التالي
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="loc" className="ls-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="ls-header">
                <button className="ls-back" onClick={() => setStep(0)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div className="ls-step-dots"><div className="ls-dot done" /><div className="ls-dot done" /><div className="ls-dot active" /></div>
                <h2 className="ls-title">موقعك</h2>
                <p className="ls-desc">لحساب مواقيت الصلاة بدقة</p>
              </div>

              <div className="ls-mode-toggle">
                <button className={`ls-mode-btn ${cityMode === 'city' ? 'active' : ''}`} onClick={() => setCityMode('city')}>المدينة</button>
                <button className={`ls-mode-btn ${cityMode === 'postal' ? 'active' : ''}`} onClick={() => setCityMode('postal')}>الرمز البريدي</button>
              </div>

              <AnimatePresence mode="wait">
                {cityMode === 'city' ? (
                  <motion.div key="city" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ls-city-section">
                    <div className="ls-search-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ls-search-icon"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                      <input type="text" className="ls-search-input" placeholder="ابحث عن مدينتك..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)} />
                    </div>
                    <div className="ls-city-grid">
                      {filteredCities.map((city) => (
                        <button key={city.name} className={`ls-city-chip ${selectedCity === city.name ? 'active' : ''}`} onClick={() => setSelectedCity(city.name)}>
                          {city.name}
                        </button>
                      ))}
                      {filteredCities.length === 0 && <div className="ls-no-results">لا توجد نتائج</div>}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="postal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ls-postal-section">
                    <div className="ls-country-select">
                      <button className="ls-country-trigger" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}>
                        <span>{selectedCountryObj?.flag}</span>
                        <span>{selectedCountryObj?.labelAr}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                      {countryDropdownOpen && (
                        <div className="ls-country-dropdown">
                          <input type="text" className="ls-country-search" placeholder="بحث..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus />
                          <div className="ls-country-list">
                            {filteredCountries.map((c) => (
                              <button key={c.code} className={`ls-country-option ${postalCountry === c.code ? 'active' : ''}`}
                                onClick={() => { setPostalCountry(c.code); setCountryDropdownOpen(false); setCountrySearch(''); }}
                              >{c.flag} {c.labelAr}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input type="text" className="ls-postal-input" placeholder={selectedCountryObj?.placeholder || 'الرمز البريدي'} value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(selectedCity)} dir="ltr" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="ls-gps-btn" onClick={handleDetectGPS} disabled={detecting}>
                {detecting ? 'جاري التحديد...' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
                    تحديد موقعي تلقائياً
                  </>
                )}
              </button>

              {error && <p className="ls-error">{error}</p>}

              <button className="ls-btn-primary" onClick={() => handleSubmit(selectedCity)} disabled={loading || (cityMode === 'city' && !selectedCity)}>
                {loading ? 'جاري...' : 'تأكيد'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .ls-root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-primary, #0a0a0f); z-index: 9999; font-family: 'Cairo', sans-serif; }
        .ls-card { width: 100%; max-width: 400px; max-height: 90vh; background: var(--bg-secondary, #111118); border: 1px solid var(--border-color, rgba(255,255,255,0.06)); border-radius: 20px; padding: 24px; overflow-y: auto; }
        .ls-step { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .ls-header { text-align: center; width: 100%; }
        .ls-step-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
        .ls-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.3s; }
        .ls-dot.active { background: var(--accent-gold, #d4a853); box-shadow: 0 0 12px rgba(212,168,83,0.3); }
        .ls-dot.done { background: var(--accent-green, #4ade80); }
        .ls-title { font-family: 'Amiri Quran', serif; font-size: 1.4rem; font-weight: 700; color: var(--text-primary, #f0ece4); margin-bottom: 4px; }
        .ls-desc { font-size: 0.8rem; color: var(--text-muted, #7a7570); }
        .ls-back { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--text-muted, #7a7570); cursor: pointer; position: absolute; top: 20px; left: 20px; }
        .ls-lang-grid { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .ls-lang-btn { background: var(--bg-tertiary, rgba(255,255,255,0.04)); border: 1.5px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px 18px; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; transition: all 0.3s; color: var(--text-primary, #f0ece4); font-family: 'Cairo', sans-serif; }
        .ls-lang-btn:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); }
        .ls-lang-btn.active { border-color: var(--accent-gold, #d4a853); background: rgba(212,168,83,0.08); }
        .ls-lang-native { font-size: 1.1rem; font-weight: 600; }
        .ls-lang-sub { font-size: 0.75rem; color: var(--text-muted, #7a7570); }
        .ls-mode-toggle { display: flex; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 4px; width: 100%; }
        .ls-mode-btn { flex: 1; padding: 10px; border: none; border-radius: 10px; background: transparent; color: var(--text-muted, #7a7570); font-family: 'Cairo', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .ls-mode-btn.active { background: rgba(212,168,83,0.12); color: var(--accent-gold, #d4a853); }
        .ls-city-section, .ls-postal-section { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .ls-search-wrap { position: relative; }
        .ls-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.2); }
        .ls-search-input { width: 100%; padding: 12px 12px 12px 38px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.06); border-radius: 10px; color: var(--text-primary, #f0ece4); font-family: 'Cairo', sans-serif; font-size: 0.85rem; outline: none; box-sizing: border-box; }
        .ls-search-input:focus { border-color: var(--accent-gold, #d4a853); }
        .ls-city-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 220px; overflow-y: auto; }
        .ls-city-chip { padding: 10px 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: var(--text-muted, #7a7570); font-family: 'Cairo', sans-serif; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
        .ls-city-chip:hover { border-color: rgba(255,255,255,0.12); color: var(--text-primary, #f0ece4); }
        .ls-city-chip.active { border-color: var(--accent-gold, #d4a853); color: var(--accent-gold, #d4a853); background: rgba(212,168,83,0.08); }
        .ls-no-results { grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.2); font-size: 0.8rem; padding: 12px; }
        .ls-country-select { position: relative; }
        .ls-country-trigger { width: 100%; display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.06); border-radius: 10px; color: var(--text-primary, #f0ece4); font-family: 'Cairo', sans-serif; font-size: 0.85rem; cursor: pointer; }
        .ls-country-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #1a1a22; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; z-index: 100; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .ls-country-search { width: 100%; padding: 10px 12px; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-primary, #f0ece4); font-family: 'Cairo', sans-serif; font-size: 0.8rem; outline: none; box-sizing: border-box; }
        .ls-country-list { max-height: 180px; overflow-y: auto; }
        .ls-country-option { width: 100%; padding: 10px 12px; background: transparent; border: none; color: var(--text-muted, #7a7570); font-family: 'Cairo', sans-serif; font-size: 0.8rem; cursor: pointer; text-align: start; }
        .ls-country-option:hover { background: rgba(255,255,255,0.04); color: var(--text-primary, #f0ece4); }
        .ls-country-option.active { color: var(--accent-gold, #d4a853); background: rgba(212,168,83,0.08); }
        .ls-postal-input { width: 100%; padding: 12px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.06); border-radius: 10px; color: var(--text-primary, #f0ece4); font-family: 'Cairo', sans-serif; font-size: 0.85rem; outline: none; box-sizing: border-box; }
        .ls-postal-input:focus { border-color: var(--accent-gold, #d4a853); }
        .ls-gps-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; background: transparent; border: 1px dashed rgba(91,164,164,0.3); border-radius: 10px; color: var(--teal, #5ba4a4); font-family: 'Cairo', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.3s; }
        .ls-gps-btn:hover:not(:disabled) { background: rgba(91,164,164,0.08); }
        .ls-gps-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ls-error { padding: 8px 12px; background: rgba(220,60,60,0.08); border: 1px solid rgba(220,60,60,0.2); border-radius: 8px; color: #e07070; font-size: 0.78rem; text-align: center; width: 100%; }
        .ls-btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: linear-gradient(135deg, var(--accent-gold, #d4a853), #c49840); border: none; border-radius: 14px; color: #0a0a0f; font-family: 'Cairo', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .ls-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,168,83,0.3); }
        .ls-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
