import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCities,
  setLocation,
  getPrayerTimes,
  setLocationByCoords,
  lookupPostalCode,
} from '../utils/prayer-times';

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
  { code: 'sn', label: 'Senegal', labelAr: 'السنغال', flag: '🇸🇳', placeholder: 'Code postal' },
  { code: 'ml', label: 'Mali', labelAr: 'مالي', flag: '🇲🇱', placeholder: 'Code postal' },
  { code: 'ne', label: 'Niger', labelAr: 'النيجر', flag: '🇳🇪', placeholder: 'Code postal' },
  { code: 'td', label: 'Chad', labelAr: 'تشاد', flag: '🇹🇩', placeholder: 'Code postal' },
  { code: 'cm', label: 'Cameroon', labelAr: 'الكاميرون', flag: '🇨🇲', placeholder: 'Code postal' },
  { code: 'cg', label: 'Congo', labelAr: 'الكونغو', flag: '🇨🇬', placeholder: 'Code postal' },
  { code: 'cd', label: 'DR Congo', labelAr: 'الكونغو الديمقراطية', flag: '🇨🇩', placeholder: 'Code postal' },
  { code: 'ci', label: 'Ivory Coast', labelAr: 'ساحل العاج', flag: '🇨🇮', placeholder: 'Code postal' },
  { code: 'bf', label: 'Burkina Faso', labelAr: 'بوركينا فاسو', flag: '🇧🇫', placeholder: 'Code postal' },
  { code: 'gn', label: 'Guinea', labelAr: 'غينيا', flag: '🇬🇳', placeholder: 'Code postal' },
  { code: 'rw', label: 'Rwanda', labelAr: 'رواندا', flag: '🇷🇼', placeholder: 'Postal Code' },
  { code: 'bi', label: 'Burundi', labelAr: 'بوروندي', flag: '🇧🇮', placeholder: 'Postal Code' },
  { code: 'mz', label: 'Mozambique', labelAr: 'موزمبيق', flag: '🇲🇿', placeholder: 'Postal Code' },
  { code: 'mg', label: 'Madagascar', labelAr: 'مدغشقر', flag: '🇲🇬', placeholder: 'Code postal' },
  { code: 'ZA', label: 'South Africa', labelAr: 'جنوب أفريقيا', flag: '🇿🇦', placeholder: 'Postal Code (2000)' },
  { code: 'gb', label: 'United Kingdom', labelAr: 'بريطانيا', flag: '🇬🇧', placeholder: 'Postcode (SW1A 1AA)' },
  { code: 'de', label: 'Germany', labelAr: 'ألمانيا', flag: '🇩🇪', placeholder: 'PLZ (10115)' },
  { code: 'fr', label: 'France', labelAr: 'فرنسا', flag: '🇫🇷', placeholder: 'Code postal (75001)' },
  { code: 'it', label: 'Italy', labelAr: 'إيطاليا', flag: '🇮🇹', placeholder: 'CAP (00100)' },
  { code: 'es', label: 'Spain', labelAr: 'إسبانيا', flag: '🇪🇸', placeholder: 'Código postal (28001)' },
  { code: 'pt', label: 'Portugal', labelAr: 'البرتغال', flag: '🇵🇹', placeholder: 'Código postal (1000-001)' },
  { code: 'nl', label: 'Netherlands', labelAr: 'هولندا', flag: '🇳🇱', placeholder: 'Postcode (1012 AB)' },
  { code: 'be', label: 'Belgium', labelAr: 'بلجيكا', flag: '🇧🇪', placeholder: 'Code postal (1000)' },
  { code: 'ch', label: 'Switzerland', labelAr: 'سويسرا', flag: '🇨🇭', placeholder: 'PLZ (8001)' },
  { code: 'at', label: 'Austria', labelAr: 'النمسا', flag: '🇦🇹', placeholder: 'PLZ (1010)' },
  { code: 'se', label: 'Sweden', labelAr: 'السويد', flag: '🇸🇪', placeholder: 'Postnummer (10000)' },
  { code: 'no', label: 'Norway', labelAr: 'النرويج', flag: '🇳🇴', placeholder: 'Postnummer (0101)' },
  { code: 'dk', label: 'Denmark', labelAr: 'الدنمارك', flag: '🇩🇰', placeholder: 'Postnummer (1000)' },
  { code: 'fi', label: 'Finland', labelAr: 'فنلندا', flag: '🇫🇮', placeholder: 'Postinumero (00100)' },
  { code: 'pl', label: 'Poland', labelAr: 'بولندا', flag: '🇵🇱', placeholder: 'Kod pocztowy (00-001)' },
  { code: 'cz', label: 'Czech Republic', labelAr: 'التشيك', flag: '🇨🇿', placeholder: 'PSČ (100 00)' },
  { code: 'ro', label: 'Romania', labelAr: 'رومانيا', flag: '🇷🇴', placeholder: 'Cod poștal (010001)' },
  { code: 'hu', label: 'Hungary', labelAr: 'هنغاريا', flag: '🇭🇺', placeholder: 'Irányítószám (1011)' },
  { code: 'gr', label: 'Greece', labelAr: 'اليونان', flag: '🇬🇷', placeholder: 'Ταχ. κώδικας (100 00)' },
  { code: 'ua', label: 'Ukraine', labelAr: 'أوكرانيا', flag: '🇺🇦', placeholder: 'Поштовий індекс (01001)' },
  { code: 'by', label: 'Belarus', labelAr: 'بيلاروسيا', flag: '🇧🇾', placeholder: 'Паштовы індэкс (220000)' },
  { code: 'kz', label: 'Kazakhstan', labelAr: 'كازاخستان', flag: '🇰🇿', placeholder: 'Индекс (010000)' },
  { code: 'uz', label: 'Uzbekistan', labelAr: 'أوزبكستان', flag: '🇺🇿', placeholder: 'Индекс (100000)' },
  { code: 'tm', label: 'Turkmenistan', labelAr: 'تركمانستان', flag: '🇹🇲', placeholder: 'Индекс (744000)' },
  { code: 'kg', label: 'Kyrgyzstan', labelAr: 'قيرغيزستان', flag: '🇰🇬', placeholder: 'Индекс (720000)' },
  { code: 'tj', label: 'Tajikistan', labelAr: 'طاجيكستان', flag: '🇹🇯', placeholder: 'Индекс (734000)' },
  { code: 'cn', label: 'China', labelAr: 'الصين', flag: '🇨🇳', placeholder: '邮政编码 (100000)' },
  { code: 'jp', label: 'Japan', labelAr: 'اليابان', flag: '🇯🇵', placeholder: '郵便番号 (100-0001)' },
  { code: 'kr', label: 'South Korea', labelAr: 'كوريا الجنوبية', flag: '🇰🇷', placeholder: '우편번호 (03171)' },
  { code: 'in', label: 'India', labelAr: 'الهند', flag: '🇮🇳', placeholder: 'PIN Code (110001)' },
  { code: 'ph', label: 'Philippines', labelAr: 'الفلبين', flag: '🇵🇭', placeholder: 'ZIP Code (1000)' },
  { code: 'th', label: 'Thailand', labelAr: 'تايلاند', flag: '🇹🇭', placeholder: 'รหัสไปรษณีย์ (10100)' },
  { code: 'vn', label: 'Vietnam', labelAr: 'فيتنام', flag: '🇻🇳', placeholder: 'Mã bưu điện (100000)' },
  { code: 'mm', label: 'Myanmar', labelAr: 'ميانمار', flag: '🇲🇲', placeholder: 'Postal Code' },
  { code: 'lk', label: 'Sri Lanka', labelAr: 'سريلانكا', flag: '🇱🇰', placeholder: 'Postal Code (00100)' },
  { code: 'np', label: 'Nepal', labelAr: 'نيبال', flag: '🇳🇵', placeholder: 'Postal Code (44600)' },
  { code: 'au', label: 'Australia', labelAr: 'أستراليا', flag: '🇦🇺', placeholder: 'Postcode (2000)' },
  { code: 'nz', label: 'New Zealand', labelAr: 'نيوزيلندا', flag: '🇳🇿', placeholder: 'Postcode (6011)' },
  { code: 'ca', label: 'Canada', labelAr: 'كندا', flag: '🇨🇦', placeholder: 'Postal Code (K1A 0B1)' },
  { code: 'mx', label: 'Mexico', labelAr: 'المكسيك', flag: '🇲🇽', placeholder: 'Código postal (06600)' },
  { code: 'br', label: 'Brazil', labelAr: 'البرازيل', flag: '🇧🇷', placeholder: 'CEP (01000-000)' },
  { code: 'ar', label: 'Argentina', labelAr: 'الأرجنتين', flag: '🇦🇷', placeholder: 'Código postal (C1000)' },
  { code: 'co', label: 'Colombia', labelAr: 'كولومبيا', flag: '🇨🇴', placeholder: 'Código postal (110111)' },
  { code: 'cl', label: 'Chile', labelAr: 'تشيلي', flag: '🇨🇱', placeholder: 'Código postal (8320000)' },
  { code: 'pe', label: 'Peru', labelAr: 'بيرو', flag: '🇵🇪', placeholder: 'Código postal (LIMA 1)' },
  { code: 've', label: 'Venezuela', labelAr: 'فنزويلا', flag: '🇻🇪', placeholder: 'Código postal (1010)' },
  { code: 'ec', label: 'Ecuador', labelAr: 'الإكوادور', flag: '🇪🇨', placeholder: 'Código postal (EC1701)' },
  { code: 'bo', label: 'Bolivia', labelAr: 'بوليفيا', flag: '🇧🇴', placeholder: 'Código postal' },
  { code: 'py', label: 'Paraguay', labelAr: 'باراغواي', flag: '🇵🇾', placeholder: 'Código postal' },
  { code: 'uy', label: 'Uruguay', labelAr: 'أوروغواي', flag: '🇺🇾', placeholder: 'Código postal (11000)' },
  { code: 'cr', label: 'Costa Rica', labelAr: 'كوستاريكا', flag: '🇨🇷', placeholder: 'Código postal (10101)' },
  { code: 'pa', label: 'Panama', labelAr: 'بنما', flag: '🇵🇦', placeholder: 'Código postal' },
  { code: 'cu', label: 'Cuba', labelAr: 'كوبا', flag: '🇨🇺', placeholder: 'Código postal (10100)' },
  { code: 'jm', label: 'Jamaica', labelAr: 'جامايكا', flag: '🇯🇲', placeholder: 'Postal Code' },
  { code: 'ht', label: 'Haiti', labelAr: 'هايتي', flag: '🇭🇹', placeholder: 'Code postal (HT6110)' },
  { code: 'do', label: 'Dominican Republic', labelAr: 'الدومينيكان', flag: '🇩🇴', placeholder: 'Código postal (10101)' },
  { code: 'gt', label: 'Guatemala', labelAr: 'غواتيمالا', flag: '🇬🇹', placeholder: 'Código postal (01001)' },
  { code: 'hn', label: 'Honduras', labelAr: 'هندوراس', flag: '🇭🇳', placeholder: 'Código postal' },
  { code: 'sv', label: 'El Salvador', labelAr: 'السلفادور', flag: '🇸🇻', placeholder: 'Código postal' },
  { code: 'ni', label: 'Nicaragua', labelAr: 'نيكاراغوا', flag: '🇳🇮', placeholder: 'Código postal' },
  { code: 'is', label: 'Iceland', labelAr: 'أيسلندا', flag: '🇮🇸', placeholder: 'Póstnúmer (101)' },
  { code: 'ie', label: 'Ireland', labelAr: 'أيرلندا', flag: '🇮🇪', placeholder: 'Eircode (D02 AF30)' },
  { code: 'lu', label: 'Luxembourg', labelAr: 'لوكسمبورغ', flag: '🇱🇺', placeholder: 'Code postal (L-1001)' },
  { code: 'cy', label: 'Cyprus', labelAr: 'قبرص', flag: '🇨🇾', placeholder: 'Postal Code (1010)' },
  { code: 'mt', label: 'Malta', labelAr: 'مالطا', flag: '🇲🇹', placeholder: 'Postal Code (ABC 1234)' },
  { code: 'ad', label: 'Andorra', labelAr: 'أندورا', flag: '🇦🇩', placeholder: 'Código postal (AD100)' },
  { code: 'mc', label: 'Monaco', labelAr: 'موناكو', flag: '🇲🇨', placeholder: 'Code postal (98000)' },
  { code: 'sm', label: 'San Marino', labelAr: 'سان مارينو', flag: '🇸🇲', placeholder: 'Codice postale (47890)' },
  { code: 'li', label: 'Liechtenstein', labelAr: 'ليختنشتاين', flag: '🇱🇮', placeholder: 'PLZ (9490)' },
];

const LANGUAGES = [
  { code: 'ar', label: 'العربية', native: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', native: 'Español', dir: 'ltr' },
];

function GeometricPattern() {
  return (
    <div className="onb-pattern-wrap">
      <svg className="onb-pattern-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-geo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <polygon points="50,5 61,30 90,30 68,48 76,75 50,60 24,75 32,48 10,30 39,30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <polygon points="50,18 65,25 72,40 72,58 65,73 50,80 35,73 28,58 28,40 35,25" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
            <line x1="0" y1="0" x2="50" y2="5" stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            <line x1="100" y1="0" x2="50" y2="5" stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            <line x1="0" y1="100" x2="24" y2="75" stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            <line x1="100" y1="100" x2="76" y2="75" stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#islamic-geo)" />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: Math.random() * 8 + 12,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.05,
  }));
  return (
    <div className="onb-particles">
      {particles.map((p) => (
        <motion.div key={p.id} className="onb-particle" style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacity }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function CrescentIcon({ size = 64 }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        <linearGradient id="crescent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a853" />
          <stop offset="100%" stopColor="#f0d78c" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M55 10 C30 10, 10 30, 10 55 C10 80, 30 100, 55 100 C35 90, 25 70, 25 50 C25 30, 35 15, 55 10 Z" fill="url(#crescent-grad)" filter="url(#glow)" />
      <circle cx="72" cy="25" r="2.5" fill="#f0d78c" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="40" r="1.5" fill="#f0d78c" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="68" cy="50" r="1" fill="#f0d78c" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </motion.svg>
  );
}

function LocationPinIcon({ size = 56 }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      initial={{ opacity: 0, scale: 0.5, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <defs>
        <linearGradient id="pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ba4a4" />
          <stop offset="100%" stopColor="#8ec8c8" />
        </linearGradient>
        <filter id="pin-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M50 10 C30 10, 15 27, 15 45 C15 70, 50 92, 50 92 C50 92, 85 70, 85 45 C85 27, 70 10, 50 10 Z" fill="none" stroke="url(#pin-grad)" strokeWidth="3" filter="url(#pin-glow)" />
      <circle cx="50" cy="43" r="12" fill="none" stroke="url(#pin-grad)" strokeWidth="2" />
      <circle cx="50" cy="43" r="4" fill="#5ba4a4" opacity="0.8" />
    </motion.svg>
  );
}

function AnimatedDivider() {
  return (
    <motion.div className="onb-divider" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="onb-divider-line" />
      <div className="onb-divider-diamond" />
      <div className="onb-divider-line" />
    </motion.div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <motion.div className="onb-step onb-welcome" key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5 }}>
      <div className="onb-welcome-content">
        <motion.div className="onb-welcome-crescent" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <CrescentIcon size={64} />
        </motion.div>
        <motion.h1 className="onb-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>بِسْمِ ٱللَّهِ</motion.h1>
        <AnimatedDivider />
        <motion.p className="onb-subtitle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>مواقيت الصلاة</motion.p>
        <motion.p className="onb-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}>رفيقك اليومي لمواقيت الصلاة والذكر والرقية</motion.p>
        <motion.button className="onb-btn-primary onb-btn-start" onClick={onNext} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5 }} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
          <span>ابدأ</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </motion.button>
        <motion.p className="onb-version" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2 }}>الإعداد السريع</motion.p>
      </div>
    </motion.div>
  );
}

function LanguageStep({ lang, onLangChange, onNext, onBack }) {
  return (
    <motion.div className="onb-step onb-lang-step" key="language" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div className="onb-step-header">
        <motion.button className="onb-back-btn" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.9 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </motion.button>
        <div className="onb-step-indicator">
          <div className="onb-step-dot active" />
          <div className="onb-step-line" />
          <div className="onb-step-dot" />
        </div>
      </div>
      <div className="onb-step-content">
        <motion.div className="onb-step-icon-wrap" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="onb-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
        </motion.div>
        <motion.h2 className="onb-step-title" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>اختر لغتك</motion.h2>
        <motion.p className="onb-step-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>Select your preferred language</motion.p>
        <div className="onb-lang-grid">
          {LANGUAGES.map((l, i) => (
            <motion.button key={l.code} className={`onb-lang-card ${lang === l.code ? 'active' : ''}`} onClick={() => onLangChange(l.code)}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }} whileTap={{ scale: 0.96 }}
            >
              <span className="onb-lang-native">{l.native}</span>
              <span className="onb-lang-sub">{l.code === 'ar' ? 'Arabic' : l.code === 'en' ? 'English' : 'Spanish'}</span>
              {lang === l.code && (
                <motion.div className="onb-lang-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      <motion.div className="onb-step-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <button className="onb-btn-primary" onClick={onNext}>
          <span>التالي</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </motion.div>
    </motion.div>
  );
}

function LocationStep({ cityMode, setCityMode, postalCode, setPostalCode, postalCountry, setPostalCountry, countrySearch, setCountrySearch, loading, detecting, error, selectedCity, setSelectedCity, citySearch, setCitySearch, onDetectGPS, onSubmit, onBack }) {
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const filteredCities = cities.filter((c) =>
    c.name.includes(citySearch)
  );

  const filteredCountries = COUNTRIES.filter(
    (c) => c.label.toLowerCase().includes(countrySearch.toLowerCase()) || c.labelAr.includes(countrySearch)
  );
  const selectedCountryObj = COUNTRIES.find((c) => c.code === postalCountry);

  return (
    <motion.div className="onb-step onb-location-step" key="location" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div className="onb-step-header">
        <motion.button className="onb-back-btn" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.9 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </motion.button>
        <div className="onb-step-indicator">
          <div className="onb-step-dot completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div className="onb-step-line filled" />
          <div className="onb-step-dot active" />
        </div>
      </div>
      <div className="onb-step-content onb-location-content">
        <motion.div className="onb-step-icon-wrap" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="onb-icon-circle teal"><LocationPinIcon size={36} /></div>
        </motion.div>
        <motion.h2 className="onb-step-title" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>موقعك</motion.h2>
        <motion.p className="onb-step-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>لحساب مواقيت الصلاة بدقة</motion.p>

        <motion.div className="onb-mode-toggle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <button className={`onb-mode-btn ${cityMode === 'city' ? 'active' : ''}`} onClick={() => setCityMode('city')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            <span>المدينة</span>
          </button>
          <button className={`onb-mode-btn ${cityMode === 'postal' ? 'active' : ''}`} onClick={() => setCityMode('postal')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 5 10-5" /></svg>
            <span>الرمز البريدي</span>
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {cityMode === 'city' ? (
            <motion.div key="city-mode" className="onb-city-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              <div className="onb-search-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="onb-search-icon"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input type="text" className="onb-search-input" placeholder="ابحث عن مدينتك..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)} />
              </div>
              <div className="onb-city-grid">
                {filteredCities.map((city, i) => (
                  <motion.button key={city.name} className={`onb-city-chip ${selectedCity === city.name ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city.name)}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: Math.min(0.5 + i * 0.03, 1) }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  >{city.name}</motion.button>
                ))}
                {filteredCities.length === 0 && <div className="onb-no-results">لا توجد نتائج</div>}
              </div>
            </motion.div>
          ) : (
            <motion.div key="postal-mode" className="onb-postal-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              <div className="onb-country-select">
                <button className="onb-country-trigger" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}>
                  <span className="onb-country-flag">{selectedCountryObj?.flag}</span>
                  <span className="onb-country-name">{selectedCountryObj?.labelAr}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <AnimatePresence>
                  {countryDropdownOpen && (
                    <motion.div className="onb-country-dropdown" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2 }}>
                      <input type="text" className="onb-country-search" placeholder="بحث..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus />
                      <div className="onb-country-list">
                        {filteredCountries.map((c) => (
                          <button key={c.code} className={`onb-country-option ${postalCountry === c.code ? 'active' : ''}`}
                            onClick={() => { setPostalCountry(c.code); setCountryDropdownOpen(false); setCountrySearch(''); }}
                          ><span>{c.flag}</span><span>{c.labelAr}</span></button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="onb-postal-input-wrap">
                <input type="text" className="onb-postal-input" placeholder={selectedCountryObj?.placeholder || 'الرمز البريدي'} value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit(selectedCity)} dir="ltr" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button className="onb-gps-btn" onClick={onDetectGPS} disabled={detecting}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        >
          {detecting ? <div className="onb-spinner" /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
          )}
          <span>{detecting ? 'جاري التحديد...' : 'تحديد موقعي تلقائياً'}</span>
        </motion.button>

        {error && <motion.p className="onb-error" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>}
      </div>

      <motion.div className="onb-step-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        <button className="onb-btn-primary" onClick={() => onSubmit(selectedCity)} disabled={loading || (cityMode === 'city' && !selectedCity)}>
          {loading ? <div className="onb-spinner light" /> : (
            <>
              <span>تأكيد</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function OnboardingPreview() {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);
  const [lang, setLang] = useState('ar');
  const [cityMode, setCityMode] = useState('city');
  const [postalCode, setPostalCode] = useState('');
  const [postalCountry, setPostalCountry] = useState('sa');
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLangChange = (code) => {
    setLang(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) { setError('الموقع غير مدعوم'); return; }
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
          setLoading(false); setDetecting(false);
          alert('تم تحديد الموقع بنجاح! (معاينة فقط)');
        } catch {
          setError('فشل تحديد الموقع، حاول مرة أخرى');
          setDetecting(false);
        }
      },
      () => { setDetecting(false); setError('فشل تحديد الموقع، تأكد من تفعيل GPS'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
      await getPrayerTimes();
      setLoading(false);
      alert('تم تحديد الموقع بنجاح! (معاينة فقط)');
    } catch {
      setError('حدث خطأ، حاول مرة أخرى');
      setLoading(false);
    }
  };

  return (
    <div className="onb-root">
      <div className="onb-bg-gradient" />
      <GeometricPattern />
      <FloatingParticles />
      <div className="onb-bg-orb onb-bg-orb-1" />
      <div className="onb-bg-orb onb-bg-orb-2" />

      <div className="onb-container">
        <motion.button
          className="onb-back-settings-btn"
          onClick={() => navigate('/settings')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span>رجوع للإعدادات</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {step === -1 && <WelcomeStep key="welcome" onNext={() => setStep(0)} />}
          {step === 0 && <LanguageStep key="lang" lang={lang} onLangChange={handleLangChange} onNext={() => setStep(1)} onBack={() => setStep(-1)} />}
          {step === 1 && (
            <LocationStep key="loc" lang={lang} cityMode={cityMode} setCityMode={setCityMode} postalCode={postalCode} setPostalCode={setPostalCode} postalCountry={postalCountry} setPostalCountry={setPostalCountry}
              countrySearch={countrySearch} setCountrySearch={setCountrySearch} loading={loading} detecting={detecting} error={error}
              selectedCity={selectedCity} setSelectedCity={setSelectedCity} citySearch={citySearch} setCitySearch={setCitySearch}
              onDetectGPS={handleDetectGPS} onSubmit={handleSubmit} onBack={() => setStep(0)} />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        :root {
          --gold: #d4a853;
          --gold-light: #f0d78c;
          --gold-dim: rgba(212,168,83,0.15);
          --teal: #5ba4a4;
          --teal-light: #8ec8c8;
          --teal-dim: rgba(91,164,164,0.12);
          --bg-deep: #07070c;
          --bg-card: rgba(255,255,255,0.04);
          --bg-card-hover: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.06);
          --border-active: rgba(212,168,83,0.4);
          --text: #f0ece4;
          --text-muted: #7a7570;
          --text-dim: #4a4744;
          --radius: 16px;
          --radius-sm: 10px;
          --radius-xs: 6px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .onb-root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-deep); overflow: hidden; font-family: 'Cairo', sans-serif; -webkit-font-smoothing: antialiased; }
        .onb-bg-gradient { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(91,164,164,0.04) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 60%, rgba(212,168,83,0.03) 0%, transparent 50%); }
        .onb-pattern-wrap { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .onb-pattern-svg { width: 100%; height: 100%; color: var(--gold); opacity: 0.4; }
        .onb-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .onb-particle { position: absolute; border-radius: 50%; background: var(--gold); }
        .onb-bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .onb-bg-orb-1 { width: 400px; height: 400px; top: -100px; right: -100px; background: rgba(212,168,83,0.06); animation: orbFloat 20s ease-in-out infinite; }
        .onb-bg-orb-2 { width: 300px; height: 300px; bottom: -80px; left: -80px; background: rgba(91,164,164,0.05); animation: orbFloat 25s ease-in-out infinite reverse; }
        @keyframes orbFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.05); } 66% { transform: translate(-20px, 15px) scale(0.95); } }
        .onb-container { position: relative; z-index: 10; width: 100%; max-width: 440px; height: 100vh; display: flex; flex-direction: column; }
        .onb-step { flex: 1; display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; padding: 16px 24px; scrollbar-width: none; }
        .onb-step::-webkit-scrollbar { display: none; }
        .onb-welcome { align-items: center; justify-content: center; text-align: center; }
        .onb-welcome-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .onb-welcome-crescent { margin-bottom: 4px; filter: drop-shadow(0 0 30px rgba(212,168,83,0.3)); }
        .onb-title { font-family: 'Amiri Quran', serif; font-size: 2.2rem; font-weight: 700; color: var(--gold); letter-spacing: 0.02em; line-height: 1.3; text-shadow: 0 0 40px rgba(212,168,83,0.2); }
        .onb-subtitle { font-size: 1.1rem; font-weight: 600; color: var(--text); letter-spacing: 0.04em; }
        .onb-desc { font-size: 0.82rem; color: var(--text-muted); max-width: 280px; line-height: 1.6; }
        .onb-divider { display: flex; align-items: center; gap: 12px; width: 120px; margin: 4px 0; }
        .onb-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .onb-divider-diamond { width: 6px; height: 6px; background: var(--gold); transform: rotate(45deg); opacity: 0.6; }
        .onb-btn-start { margin-top: 8px; padding: 14px 40px !important; font-size: 1rem !important; }
        .onb-step-header { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; margin-bottom: 12px; min-height: 36px; }
        .onb-back-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .onb-back-btn:hover { color: var(--text); background: var(--bg-card-hover); border-color: rgba(255,255,255,0.1); }
        .onb-step-indicator { display: flex; align-items: center; }
        .onb-step-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; transition: all 0.4s; }
        .onb-step-dot.active { border-color: var(--gold); background: var(--gold-dim); }
        .onb-step-dot.completed { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); }
        .onb-step-line { width: 48px; height: 2px; background: var(--border); transition: background 0.4s; }
        .onb-step-line.filled { background: linear-gradient(90deg, var(--teal), var(--gold)); }
        .onb-step-content { flex: 1; display: flex; flex-direction: column; align-items: center; }
        .onb-step-icon-wrap { margin-bottom: 8px; }
        .onb-icon-circle { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--border-active); background: var(--gold-dim); display: flex; align-items: center; justify-content: center; }
        .onb-icon-circle.teal { border-color: rgba(91,164,164,0.3); background: var(--teal-dim); }
        .onb-step-title { font-family: 'Amiri Quran', serif; font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .onb-step-desc { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; }
        .onb-lang-grid { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; }
        .onb-lang-card { position: relative; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 14px 20px; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; }
        .onb-lang-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(212,168,83,0.08), transparent); opacity: 0; transition: opacity 0.3s; }
        .onb-lang-card:hover::before { opacity: 1; }
        .onb-lang-card:hover { border-color: rgba(255,255,255,0.1); background: var(--bg-card-hover); }
        .onb-lang-card.active { border-color: var(--gold); background: rgba(212,168,83,0.06); }
        .onb-lang-card.active::before { opacity: 1; }
        .onb-lang-native { font-size: 1.15rem; font-weight: 600; color: var(--text); }
        .onb-lang-sub { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }
        .onb-lang-check { position: absolute; top: 12px; left: 12px; width: 24px; height: 24px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .onb-mode-toggle { display: flex; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; width: 100%; max-width: 320px; margin-bottom: 20px; }
        .onb-mode-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); font-family: 'Cairo', sans-serif; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .onb-mode-btn.active { background: var(--gold-dim); color: var(--gold); box-shadow: 0 0 20px rgba(212,168,83,0.08); }
        .onb-mode-btn:hover:not(.active) { color: var(--text); background: rgba(255,255,255,0.03); }
        .onb-city-section, .onb-postal-section { width: 100%; max-width: 320px; }
        .onb-postal-section { display: flex; flex-direction: column; gap: 12px; }
        .onb-search-wrap { position: relative; margin-bottom: 16px; }
        .onb-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .onb-search-input { width: 100%; padding: 14px 14px 14px 40px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-family: 'Cairo', sans-serif; font-size: 0.9rem; outline: none; transition: all 0.3s; }
        .onb-search-input::placeholder { color: var(--text-dim); }
        .onb-search-input:focus { border-color: var(--gold); background: rgba(212,168,83,0.03); box-shadow: 0 0 0 3px rgba(212,168,83,0.08); }
        .onb-city-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        .onb-city-grid::-webkit-scrollbar { width: 4px; }
        .onb-city-grid::-webkit-scrollbar-track { background: transparent; }
        .onb-city-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .onb-city-chip { padding: 12px 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xs); color: var(--text-muted); font-family: 'Cairo', sans-serif; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.25s; text-align: center; }
        .onb-city-chip:hover { border-color: rgba(255,255,255,0.12); color: var(--text); background: var(--bg-card-hover); }
        .onb-city-chip.active { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); font-weight: 600; }
        .onb-no-results { grid-column: 1 / -1; text-align: center; color: var(--text-dim); font-size: 0.85rem; padding: 16px; }
        .onb-country-select { position: relative; }
        .onb-country-trigger { width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-family: 'Cairo', sans-serif; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
        .onb-country-trigger:hover { border-color: rgba(255,255,255,0.1); }
        .onb-country-flag { font-size: 1.3rem; }
        .onb-country-name { flex: 1; text-align: start; }
        .onb-country-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #1a1a22; border: 1px solid var(--border); border-radius: var(--radius-sm); z-index: 100; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
        .onb-country-search { width: 100%; padding: 12px 14px; background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text); font-family: 'Cairo', sans-serif; font-size: 0.85rem; outline: none; }
        .onb-country-search::placeholder { color: var(--text-dim); }
        .onb-country-list { max-height: 200px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        .onb-country-option { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: transparent; border: none; color: var(--text-muted); font-family: 'Cairo', sans-serif; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; text-align: start; }
        .onb-country-option:hover { background: rgba(255,255,255,0.04); color: var(--text); }
        .onb-country-option.active { color: var(--gold); background: var(--gold-dim); }
        .onb-postal-input { width: 100%; padding: 14px 16px; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-family: 'Cairo', sans-serif; font-size: 0.9rem; text-align: start; letter-spacing: 0.08em; outline: none; transition: all 0.3s; }
        .onb-postal-input::placeholder { color: var(--text-dim); }
        .onb-postal-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212,168,83,0.08); }
        .onb-gps-btn { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding: 12px 20px; background: transparent; border: 1px dashed rgba(91,164,164,0.3); border-radius: var(--radius-sm); color: var(--teal); font-family: 'Cairo', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.3s; }
        .onb-gps-btn:hover:not(:disabled) { border-color: var(--teal); background: var(--teal-dim); }
        .onb-gps-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .onb-error { margin-top: 12px; padding: 10px 16px; background: rgba(220,60,60,0.08); border: 1px solid rgba(220,60,60,0.2); border-radius: var(--radius-xs); color: #e07070; font-size: 0.82rem; text-align: center; width: 100%; max-width: 320px; }
        .onb-step-footer { padding: 8px 0 16px; display: flex; justify-content: center; }
        .onb-btn-primary { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 320px; padding: 15px 32px; background: linear-gradient(135deg, var(--gold), #c49840); border: none; border-radius: var(--radius); color: #0a0a0f; font-family: 'Cairo', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 20px rgba(212,168,83,0.25); }
        .onb-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(212,168,83,0.35), 0 0 0 3px rgba(212,168,83,0.1); }
        .onb-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .onb-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .onb-spinner { width: 20px; height: 20px; border: 2.5px solid var(--border); border-top-color: var(--teal); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .onb-spinner.light { border-color: rgba(10,10,15,0.2); border-top-color: #0a0a0f; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .onb-version { font-size: 0.72rem; color: var(--text-dim); letter-spacing: 0.1em; }
        .onb-back-settings-btn { display: flex; align-items: center; gap: 8px; margin: 12px auto 0; padding: 10px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-family: 'Cairo', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.3s; z-index: 20; position: relative; }
        .onb-back-settings-btn:hover { color: var(--text); background: var(--bg-card-hover); border-color: rgba(255,255,255,0.1); }
        @media (max-height: 700px) { .onb-title { font-size: 1.8rem; } .onb-step { padding: 12px 16px; } .onb-city-grid { max-height: 180px; } .onb-welcome-crescent svg { width: 48px; height: 48px; } }
        @media (max-width: 380px) { .onb-container { padding: 0 8px; } .onb-title { font-size: 2rem; } .onb-lang-grid { gap: 10px; } }
      `}</style>
    </div>
  );
}
