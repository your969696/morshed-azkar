# المكونات | Components

## نظرة عامة

يحتوي المشروع على 29 مكون React قابل لإعادة الاستخدام.

---

## قائمة المكونات

### مكونات الصلاة

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `PrayerCountdown` | `src/components/PrayerCountdown.jsx` | العداد التنازلي للصلاة مع فتح نافذة منفصلة |
| `PrayerNotification` | `src/components/PrayerNotification.jsx` | إشعارات الصلاة والأذان والقرآن التلقائي |
| `PrayerTimesBar` | `src/components/PrayerTimesBar.jsx` | شريط أوقات الصلاة في الصفحة الرئيسية |
| `PrayerCard` | `src/components/PrayerCard.jsx` | كارت عرض وقت الصلاة |
| `PrayerCalendar` | `src/components/PrayerCalendar.jsx` | تقويم الصلاة مع تسجيل الصلوات |

### مكونات القرآن

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `QuranPlayer` | `src/components/QuranPlayer.jsx` | مشغل القرآن (12 سورة + راديو + تصوير) |
| `RadioPlayer` | `src/components/RadioPlayer.jsx` | مشغل الراديو القرآني |

### مكونات الأذكار

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `AzkarCard` | `src/components/AzkarCard.jsx` | كارت عرض الذكر مع عداد التكرار |
| `AzkarSection` | `src/components/AzkarSection.jsx` | قسم مجموعة الأذكار |
| `AzkarAudioPlayer` | `src/components/AzkarAudioPlayer.jsx` | مشغّل صوت الأذكار |

### مكونات الصوتيات

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `AdhanPlayer` | `src/components/AdhanPlayer.jsx` | مشغّل الأذان |
| `AudioPlayer` | `src/components/AudioPlayer.jsx` | مشغّل صوت عام |

### مكونات التاريخ

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `HijriDate` | `src/components/HijriDate.jsx` | عرض التاريخ الهجري |
| `IslamicHolidays` | `src/components/IslamicHolidays.jsx` | الأعياد والمناسبات الإسلامية |

### مكونات التنقل

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `Navbar` | `src/components/Navbar.jsx` | شريط التنقل السفلي |
| `HomeIcons` | `src/components/HomeIcons.jsx` | أيقونات الصفحة الرئيسية |

### مكونات الإعدادات

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `LocationSetup` | `src/components/LocationSetup.jsx` | إعداد الموقع الجغرافي |
| `WeatherCard` | `src/components/WeatherCard.jsx` | كارت عرض الطقس |
| `FastingBar` | `src/components/FastingBar.jsx` | شريط الصيام (السحور والإفطار) |

### مكونات الإشعارات

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `DhikrNotification` | `src/components/DhikrNotification.jsx` | إشعار الذكر التلقائي |
| `HadithNotification` | `src/components/HadithNotification.jsx` | إشعار الحديث اليومي |
| `QiyamNotification` | `src/components/QiyamNotification.jsx` | إشعار قيام الليل |
| `AlKahfReminder` | `src/components/AlKahfReminder.jsx` | تذكير سورة الكهف يوم الجمعة |
| `HourlyOverlay` | `src/components/HourlyOverlay.jsx` | طبقة الأذكار كل ساعة |

### مكونات أخرى

| المكون | الملف | الوظيفة |
|--------|-------|---------|
| `SalawatWaAdiaa` | `src/components/SalawatWaAdiaa.jsx` | الصلاة على النبي والأدعية |
| `ErrorBoundary` | `src/components/ErrorBoundary.jsx` | معالج الأخطاء |
| `ContactForm` | `src/components/ContactForm.jsx` | نموذج التواصل |

---

## كيفية استخدام المكونات

### مثال: استخدام AzkarCard

```jsx
import AzkarCard from './components/AzkarCard';

function MyPage() {
  return (
    <AzkarCard
      text="أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ"
      repeat={1}
      source="رواه أبو داود"
    />
  );
}
```

### مثال: استخدام PrayerTimesBar

```jsx
import PrayerTimesBar from './components/PrayerTimesBar';

function HomePage() {
  return (
    <div>
      <PrayerTimesBar />
    </div>
  );
}
```

---

## هيكل المكون النمويجي

```jsx
import React from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="...">
      {/* محتوى المكون */}
    </div>
  );
};

export default MyComponent;
```

---

## إضافة مكون جديد

1. أنشئ ملف جديد في `src/components/`
2. اكتب كود المكون
3. صدّر المكون باستخدام `export default`
4. استخدمه في الصفحة المطلوبة

---

**الصفحة السابقة:** [هيكل المشروع](Project-Structure)
**الصفحة التالية:** [الصفحات](Pages)
