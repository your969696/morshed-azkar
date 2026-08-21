import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n.jsx';
import Navbar from './components/Navbar';
import HourlyOverlay from './components/HourlyOverlay';
import PrayerCountdown from './components/PrayerCountdown';
import PrayerNotification from './components/PrayerNotification';
import QiyamNotification from './components/QiyamNotification';
import AlKahfReminder from './components/AlKahfReminder';
import ErrorBoundary from './components/ErrorBoundary';
import LocationSetup from './components/LocationSetup';
import './utils/sound';
import { startMidnightRefresh } from './utils/prayer-times';

const Home = lazy(() => import('./pages/Home'));
const MorningAzkar = lazy(() => import('./pages/MorningAzkar'));
const EveningAzkar = lazy(() => import('./pages/EveningAzkar'));
const Duas = lazy(() => import('./pages/Duas'));
const PrayerGuide = lazy(() => import('./pages/PrayerGuide'));
const PrayerGuideDetail = lazy(() => import('./pages/PrayerGuideDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Settings = lazy(() => import('./pages/Settings'));
const Daily = lazy(() => import('./pages/Daily'));
const Quran = lazy(() => import('./pages/Quran'));
const Sources = lazy(() => import('./pages/Sources'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Prophets = lazy(() => import('./pages/Prophets'));
const Tasbih = lazy(() => import('./pages/Tasbih'));
const Qibla = lazy(() => import('./pages/Qibla'));
const HajjUmrah = lazy(() => import('./pages/HajjUmrah'));
const NamesOfAllah = lazy(() => import('./pages/NamesOfAllah'));
const ZakatCalculator = lazy(() => import('./pages/ZakatCalculator'));
const HadithSearch = lazy(() => import('./pages/HadithSearch'));
const PrayerTracker = lazy(() => import('./pages/PrayerTracker'));
const Ramadan = lazy(() => import('./pages/Ramadan'));
const Sahaba = lazy(() => import('./pages/Sahaba'));
const BehaviorInJoy = lazy(() => import('./pages/BehaviorInJoy'));
const BehaviorInGrief = lazy(() => import('./pages/BehaviorInGrief'));
const IslamicCalendar = lazy(() => import('./pages/IslamicCalendar'));
const MasjidFinder = lazy(() => import('./pages/MasjidFinder'));
const MasnoonDuas = lazy(() => import('./pages/MasnoonDuas'));
const DateConverter = lazy(() => import('./pages/DateConverter'));
const IslamicDays = lazy(() => import('./pages/IslamicDays'));
const QuranRadio = lazy(() => import('./pages/QuranRadio'));
const HijriAge = lazy(() => import('./pages/HijriAge'));
const VoiceRecordings = lazy(() => import('./pages/VoiceRecordings'));
const Reminders = lazy(() => import('./pages/Reminders'));
const AdhanTest = lazy(() => import('./pages/AdhanTest'));
const SalahGuide = lazy(() => import('./pages/SalahGuide'));
const OnboardingPreview = lazy(() => import('./pages/OnboardingPreview'));
const DidntFindAnswer = lazy(() => import('./pages/DidntFindAnswer'));
const WuduGuide = lazy(() => import('./pages/WuduGuide'));
const PuzzlePage = lazy(() => import('./pages/PuzzlePage'));
const IslamicTV = lazy(() => import('./pages/IslamicTV'));
const NewMuslimGuide = lazy(() => import('./pages/NewMuslimGuide'));
const HalalFinder = lazy(() => import('./pages/HalalFinder'));
const HalalProductChecker = lazy(() => import('./pages/HalalProductChecker'));
const KindredReminders = lazy(() => import('./pages/KindredReminders'));
const MyLibrary = lazy(() => import('./pages/MyLibrary'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--accent-green)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 }}>جاري التحميل...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--accent-purple)', opacity: 0.15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C9 2 7 4 7 6v2H5c-1 0-2 1-2 2v2h20v-2c0-1-1-2-2-2h-2V6c0-2-2-4-5-4z"/>
            <rect x="3" y="12" width="18" height="10" rx="1"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 64, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 16 }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>الصفحة غير موجودة</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s' }}>
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}

function persistToElectron(key, value) {
  try { window.electronAPI?.settingsSet?.(key, value); } catch {}
}

function checkLocReady() {
  if (localStorage.getItem('locationSetupDone') === 'true') return true;
  try { const loc = JSON.parse(localStorage.getItem('prayerLocation')); if (loc && loc.lat && loc.lng) return true; } catch {}
  if (localStorage.getItem('tasbih_total')) {
    localStorage.setItem('locationSetupDone', 'true');
    localStorage.setItem('app_lang', 'ar');
    localStorage.setItem('prayerLocation', JSON.stringify({ city: 'Los Angeles', country: 'United States', country_code: 'us', lat: 34.0522, lng: -118.2437 }));
    persistToElectron('locationSetupDone', 'true');
    persistToElectron('app_lang', 'ar');
    persistToElectron('prayerLocation', JSON.stringify({ city: 'Los Angeles', country: 'United States', country_code: 'us', lat: 34.0522, lng: -118.2437 }));
    return true;
  }
  return false;
}

export default function App() {
  const [locReady, setLocReady] = useState(checkLocReady);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.settingsGetAll) { setBooted(true); return; }
    api.settingsGetAll().then((data) => {
      if (data && typeof data === 'object') {
        const keys = ['locationSetupDone', 'prayerLocation', 'app_lang', 'tasbih_total', 'app_theme'];
        keys.forEach(k => { if (data[k] !== undefined && data[k] !== null) localStorage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k])); });
      }
      setLocReady(checkLocReady());
      setBooted(true);
    }).catch(() => { setBooted(true); });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.classList.toggle('light', saved === 'light');
  }, []);

  useEffect(() => {
    startMidnightRefresh();
  }, []);

  if (!booted) {
    return (
      <div style={{ height: '100vh', background: '#0a0015', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #00c896', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <HashRouter>
        <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ErrorBoundary>
          {!locReady && <LocationSetup onDone={() => setLocReady(true)} />}
          </ErrorBoundary>
          <div data-scroll-container style={{ flex: 1, overflow: 'auto' }}>
          <ErrorBoundary>
          <PrayerCountdown />
          </ErrorBoundary>
          <ScrollToTop />
          <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/morning" element={<MorningAzkar />} />
              <Route path="/evening" element={<EveningAzkar />} />
              <Route path="/duas" element={<Duas />} />
              <Route path="/prayer" element={<PrayerGuide />} />
              <Route path="/prayer-guide" element={<PrayerGuideDetail />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/prophets" element={<Prophets />} />
              <Route path="/tasbih" element={<Tasbih />} />
              <Route path="/qibla" element={<Qibla />} />
              <Route path="/hajj" element={<HajjUmrah />} />
              <Route path="/names" element={<NamesOfAllah />} />
              <Route path="/zakat" element={<ZakatCalculator />} />
              <Route path="/hadith" element={<HadithSearch />} />
              <Route path="/prayer-tracker" element={<PrayerTracker />} />
              <Route path="/ramadan" element={<Ramadan />} />
              <Route path="/sahaba" element={<Sahaba />} />
              <Route path="/behavior-joy" element={<BehaviorInJoy />} />
              <Route path="/behavior-grief" element={<BehaviorInGrief />} />
              <Route path="/calendar" element={<IslamicCalendar />} />
              <Route path="/mosques" element={<MasjidFinder />} />
              <Route path="/masnoon-duas" element={<MasnoonDuas />} />
              <Route path="/date-converter" element={<DateConverter />} />
              <Route path="/islamic-days" element={<IslamicDays />} />
              <Route path="/radio" element={<QuranRadio />} />
              <Route path="/hijri-age" element={<HijriAge />} />
              <Route path="/voice-recordings" element={<VoiceRecordings />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/adhan-test" element={<AdhanTest />} />
              <Route path="/salah-guide" element={<SalahGuide />} />
              <Route path="/onboarding-preview" element={<OnboardingPreview />} />
            <Route path="/didnt-find-answer" element={<DidntFindAnswer />} />
              <Route path="/wudu" element={<WuduGuide />} />
              <Route path="/puzzle" element={<PuzzlePage />} />
              <Route path="/islamic-tv" element={<IslamicTV />} />
              <Route path="/new-muslim" element={<NewMuslimGuide />} />
              <Route path="/halal" element={<HalalFinder />} />
              <Route path="/halal-products" element={<HalalProductChecker />} />
              <Route path="/kindred" element={<KindredReminders />} />
              <Route path="/my-library" element={<MyLibrary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
          </div>
          <ErrorBoundary>
          <Navbar />
          </ErrorBoundary>
          <ErrorBoundary>
          <HourlyOverlay />
          </ErrorBoundary>
          <ErrorBoundary>
          <PrayerNotification />
          </ErrorBoundary>
          <ErrorBoundary>
          <QiyamNotification />
          </ErrorBoundary>
          <ErrorBoundary>
          <AlKahfReminder />
          </ErrorBoundary>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
}
