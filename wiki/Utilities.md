# الأدوات المساعدة | Utilities

## نظرة عامة

يحتوي المشروع على 7 ملفات أدوات مساعدة تخدم ميزات التطبيق.

---

## قائمة الأدوات

| الملف | الوظيفة |
|-------|---------|
| `prayer-times.js` | حساب أوقات الصلاة |
| `sound.js` | إدارة الصوتيات |
| `audio.js` | إدارة الصوتيات (نسخة محسّنة) |
| `quran.js` | بيانات القرآن |
| `quran-audio.js` | روابط الصوتيات القرآنية |
| `zakat.js` | حساب الزكاة |
| `persist.js` | حفظ واسترجاع البيانات |

---

## prayer-times.js

يحتوي على دوال حساب أوقات الصلاة باستخدام API Aladhan ومكتبة adhan.

### الدوال الرئيسية

```javascript
// حساب أوقات الصلاة
export const getPrayerTimes = async (date, latitude, longitude, method) => {
  // ...
};

// الحصول على وقت الصلاة الحالي
export const getCurrentPrayer = (prayerTimes) => {
  // ...
};

// حساب العداد التنازلي
export const getCountdown = (nextPrayer) => {
  // ...
};
```

---

## sound.js

يحتوي على دوال إدارة الصوتيات (الأذان، TTS، أصوات التنبيه).

### الدوال الرئيسية

```javascript
// تشغيل الأذان
export const playAdhan = (adhanType) => {
  // ...
};

// تشغيل صوت التنبيه
export const playNotificationSound = () => {
  // ...
};

// تشغيل TTS
export const playTTS = (text) => {
  // ...
};

// إيقاف جميع الصوتيات
export const stopAllAudio = () => {
  // ...
};
```

---

## audio.js

نسخة محسّنة من sound.js لإدارة الصوتيات.

### الدوال الرئيسية

```javascript
// تشغيل القرآن
export const playQuran = (surahNumber) => {
  // ...
};

// تشغيل الراديو
export const playRadio = (stationUrl) => {
  // ...
};

// التحكم في مستوى الصوت
export const setVolume = (volume) => {
  // ...
};
```

---

## quran.js

يحتوي على بيانات القرآن (الآيات والسور).

### الدوال الرئيسية

```javascript
// الحصول على معلومات السورة
export const getSurahInfo = (surahNumber) => {
  // ...
};

// الحصول على آيات السورة
export const getSurahAyahs = (surahNumber) => {
  // ...
};

// البحث في القرآن
export const searchQuran = (query) => {
  // ...
};
```

---

## quran-audio.js

يحتوي على روابط الصوتيات القرآنية.

### الدوال الرئيسية

```javascript
// الحصول على رابط صوت السورة
export const getSurahAudioUrl = (surahNumber, reciter) => {
  // ...
};

// الحصول على رابط الراديو
export const getRadioUrl = (station) => {
  // ...
};
```

---

## zakat.js

يحتوي على دوال حساب الزكاة.

### الدوال الرئيسية

```javascript
// حساب زكاة المال
export const calculateZakat = (amount) => {
  // ...
};

// حساب زكاة الفطر
export const calculateFitrZakat = (numberOfPeople) => {
  // ...
};

// حساب نصاب الذهب
export const getGoldNisab = () => {
  // ...
};
```

---

## persist.js

يحتوي على دوال حفظ واسترجاع البيانات من localStorage.

### الدوال الرئيسية

```javascript
// حفظ بيانات
export const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// استرجاع بيانات
export const getData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// حذف بيانات
export const removeData = (key) => {
  localStorage.removeItem(key);
};
```

---

## كيفية استخدام الأدوات

```javascript
import { getPrayerTimes } from './utils/prayer-times';
import { playAdhan } from './utils/sound';
import { saveData, getData } from './utils/persist';

// حساب أوقات الصلاة
const prayerTimes = await getPrayerTimes(date, lat, lng, method);

// تشغيل الأذان
playAdhan('adhan1');

// حفظ بيانات
saveData('userLocation', { lat: 30.0444, lng: 31.2357 });

// استرجاع بيانات
const location = getData('userLocation');
```

---

**الصفحة السابقة:** [ملفات البيانات](Data-Files)
**الصفحة التالية:** [الترجمة](Translation)
