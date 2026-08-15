<div dir="rtl">

# مرشد أذكار | Morshed Azkar

<div align="center">

![Electron](https://img.shields.io/badge/Electron-43.1.1-blue?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.1.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.2-06B6D4?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-AGPL--3.0-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen)
![Issues](https://img.shields.io/badge/Issues-Welcome-yellow)

**تطبيق إسلامي شامل لسطح المكتب يحتوي على أذكار الصباح والمساء، أوقات الصلاة مع عداد تنازلي، القرآن الكريم، أدعية مسنونة، أسماء الله الحسنى، وإرشاد الحلال والحرام.**

A comprehensive Islamic desktop application featuring morning and evening azkar, prayer times with countdown, Quran, duas, names of Allah, and Halal guide.

[![Download](https://img.shields.io/badge/تحميل-التطبيق-blue)](https://github.com/your969696/morshed-azkar/releases)
[![Documentation](https://img.shields.io/badge/توثيق-مفصل-green)](https://github.com/your969696/morshed-azkar#readme)
[![Contributing](https://img.shields.io/badge/مساهمة-محمّل-orange)](https://github.com/your969696/morshed-azkar/blob/main/CONTRIBUTING.md)
[![Roadmap](https://img.shields.io/badge/خطة-المستقبل-blueviolet)](https://github.com/your969696/morshed-azkar/blob/main/ROADMAP.md)
[![Changelog](https://img.shields.io/badge/سجل-التغييرات-yellow)](https://github.com/your969696/morshed-azkar/blob/main/CHANGELOG.md)
[![Code of Conduct](https://img.shields.io/badge/قواعد-السلوك-ff69b4)](https://github.com/your969696/morshed-azkar/blob/main/CODE_OF_CONDUCT.md)

</div>

---

## مقدمة | Introduction

تطبيق **مرشد أذكار** هو تطبيق إسلامي شامل مبني لتلكيفيات سطح المكتب. يهدف التطبيق إلى تسهيل حياة المسلم اليومية من خلال توفير الأذكار والأدعية وأوقات الصلاة في مكان واحد مع واجهة سهلة الاستخدام وتصميم جذاب.

**Morshed Azkar** is a comprehensive Islamic application built for desktop platforms. It aims to make a Muslim's daily life easier by providing azkar, duas, and prayer times in one place with an easy-to-use interface and attractive design.

---

## مميزات التطبيق | Features

### الأذكار والأدعية | Azkar & Duas
- أذكار الصباح والمساء مع التكرار الصوتي
- أذكار بعد الصلاة وأذكار النوم والاستيقاظ
- أدعية مسنونة من السنة النبوية
- أذكار رمضان الخاصة
- إشعارات تلقائية بأوقات الأذكار

### أوقات الصلاة | Prayer Times
- عداد تنازلي دقيق لوقت الصلاة التالي
- أوقات الصلوات الخمس من API Aladhan
- إشعارات الأذان مع ملفات صوتية حقيقية
- تحديد الموقع الجغرافي لأوقات دقيقة
- دعم المذهب الشافعي والحنفي

### القرآن الكريم | Quran
- قراءة القرآن بخطوط عربية جميلة
- استماع إلى 12 سورة بصوت مرتل
- مشغل راديو قرآني مباشر
- تذكير بقراءة سورة الكهف يوم الجمعة

### أسماء الله الحسنى | Names of Allah
- الـ 99 اسم مع المعنى بالعربي والإنجليزي
- أصوات لهجات كل اسم
- تصميم جذاب مع إمكانية التنقل

### مميزات أخرى | Other Features
- مسبحة إلكترونية مع عداد
- حاسبة الزكاة
- اتجاه القبلة
- التقويم الإسلامي ومحول التاريخ
- مسابقة إسلامية تفاعلية
- البحث في الأحاديث
- قصص الأنبياء والصحابة
- إرشاد المسلم الجديد
- إرشاد الحلال والحرام
- الترجمة (عربي / إنجليزي / إسباني)

---

## الأنظمة المدعومة | Supported Platforms

### حالياً | Currently
| النظام | الحالة |
|--------|--------|
| Windows 10+ | **مدعوم بالكامل** ✅ |
| macOS | قريباً إن شاء الله |
| Linux | قريباً إن شاء الله |

### مستقبلاً | Future Plans
| النظام | المسؤول |
|--------|---------|
| Android | **المجتمع المطور** 👥 |
| iOS (iPhone/iPad) | **المجتمع المطور** 👥 |
| Samsung TV (Tizen) | **المجتمع المطور** 👥 |
| Android TV | **المجتمع المطور** 👥 |

> **ملاحظة مهمة:** المشروع مفتوح المصدر والمجتمع مسؤول عن بناء النسخ للأنظمة الأخرى.
> **Important:** This is an open-source project and the community is responsible for building versions for other platforms.

---

## هيكل المشروع | Project Structure

```
morshed-azkar/
│
├── electron/                    # ملفات Electron (الخادم المحلي)
│   ├── main.cjs                 # ملف التشغيل الرئيسي للتطبيق
│   ├── preload.cjs              # بيانات الاتصال بين React و Electron
│   ├── preload-countdown.cjs    # بيانات الاتصال لنافذة العداد
│   ├── preload-widget.cjs       # بيانات الاتصال للودجت
│   ├── preload-azkar-widget.cjs # بيانات الاتصال لودجت الأذكار
│   └── edge-tts-gen.py          # سكربت توليد الصوت (TTS)
│
├── src/                         # كود React (واجهة التطبيق)
│   ├── components/              # المكونات (29 ملف)
│   ├── pages/                   # الصفحات (44 صفحة)
│   ├── utils/                   # الدوال والأدوات (7 ملفات)
│   ├── data/                    # ملفات البيانات (35 ملف)
│   ├── assets/                  # ملفات الأصول
│   ├── App.jsx                  # التطبيق الرئيسي (التوجيه)
│   ├── main.jsx                 # نقطة البداية
│   ├── i18n.jsx                 # نظام الترجمة
│   ├── i18n-data.js             # بيانات الترجمة
│   └── firebase.js              # Firebase
│
├── public/                      # الملفات العامة
│   ├── *.mp3 / *.m4a           # ملفات الصوتيات
│   ├── fonts/                   # الخطوط العربية
│   ├── names-voices/           # أصوات أسماء الله (99 ملف)
│   ├── azkar-voices/           # أصوات الأذكار
│   └── *.html                  # ملفات HTML
│
├── scripts/                     # سكربتات البناء
├── tools/                       # أدوات التطوير
├── dist/                        # ملفات البناء النهائية
├── release/                     # ملفات التثبيت (.exe)
│
├── package.json                 # إعدادات المشروع
├── vite.config.js               # إعدادات Vite
├── tailwind.config.js           # إعدادات Tailwind
├── postcss.config.js            # إعدادات PostCSS
└── index.html                   # الصفحة الرئيسية
```

---

## المكونات | Components (29)

| المكون | الوظيفة |
|--------|---------|
| `PrayerCountdown` | العداد التنازلي للصلاة مع فتح نافذة منفصلة |
| `PrayerNotification` | إشعارات الصلاة والأذان والقرآن التلقائي |
| `PrayerTimesBar` | شريط أوقات الصلاة في الصفحة الرئيسية |
| `PrayerCard` | كارت عرض وقت الصلاة |
| `PrayerCalendar` | تقويم الصلاة مع تسجيل الصلوات |
| `QuranPlayer` | مشغل القرآن (12 سورة + راديو + تصوير) |
| `RadioPlayer` | مشغل الراديو القرآني |
| `AzkarCard` | كارت عرض الذكر مع عداد التكرار |
| `AzkarSection` | قسم مجموعة الأذكار |
| `AzkarAudioPlayer` | مشغّل صوت الأذكار |
| `AdhanPlayer` | مشغّل الأذان |
| `AudioPlayer` | مشغّل صوت عام |
| `HijriDate` | عرض التاريخ الهجري |
| `Navbar` | شريط التنقل السفلي |
| `LocationSetup` | إعداد الموقع الجغرافي |
| `WeatherCard` | كارت عرض الطقس |
| `FastingBar` | شريط الصيام (السحور والإفطار) |
| `HomeIcons` | أيقونات الصفحة الرئيسية |
| `DhikrNotification` | إشعار الذكر التلقائي |
| `HadithNotification` | إشعار الحديث اليومي |
| `QiyamNotification` | إشعار قيام الليل |
| `AlKahfReminder` | تذكير سورة الكهف يوم الجمعة |
| `HourlyOverlay` | طبقة الأذكار كل ساعة |
| `IslamicHolidays` | الأعياد والمناسبات الإسلامية |
| `SalawatWaAdiaa` | الصلاة على النبي والأدعية |
| `ErrorBoundary` | معالج الأخطاء |
| `ContactForm` | نموذج التواصل |

---

## الصفحات | Pages (44)

### الصفحات الأساسية | Core Pages
| الصفحة | الوظيفة |
|--------|---------|
| `Home` | الصفحة الرئيسية مع شبكة الأقسام |
| `Settings` | الإعدادات (الأذان، العداد، الموقع، المذهب) |
| `Favorites` | الأذكار المفضلة |
| `Daily` | المحتوى اليومي |

### الأذكار والأدعية | Azkar & Duas
| الصفحة | الوظيفة |
|--------|---------|
| `MorningAzkar` | أذكار الصباح (12 ذكر) |
| `EveningAzkar` | أذكار المساء (10 أذكار) |
| `Duas` | الأدعية المسنونة |
| `MasnoonDuas` | الأدعية من السنة |

### القرآن والقرآن | Quran
| الصفحة | الوظيفة |
|--------|---------|
| `Quran` | القرآن الكريم مع تفاصيل السور |
| `QuranRadio` | الراديو القرآني المباشر |

### أوقات الصلاة | Prayer
| الصفحة | الوظيفة |
|--------|---------|
| `Prayers` | أوقات الصلاة |
| `PrayerGuide` | دليل الصلاة التفصيلي |
| `PrayerGuideDetail` | تفاصيل كل صلاة |
| `PrayerTracker` | متابع الصلاة اليومي |
| `AdhanTest` | اختبار الأذان |

### الأسماء والذكر | Names & Dhikr
| الصفحة | الوظيفة |
|--------|---------|
| `NamesOfAllah` | أسماء الله الحسنى (99 اسم) |
| `Tasbih` | المسبحة الإلكترونية |

### الإرشاد | Guides
| الصفحة | الوظيفة |
|--------|---------|
| `SalahGuide` | إرشاد الصلاة |
| `WuduGuide` | إرشاد الوضوء |
| `HajjUmrah` | إرشاد الحج والعمرة |
| `NewMuslimGuide` | إرشاد المسلم الجديد |

### الحلال والحرام | Halal
| الصفحة | الوظيفة |
|--------|---------|
| `HalalFinder` | البحث عن المنتجات الحلال |
| `HalalProductChecker` | فحص مكونات المنتجات |

### التاريخ والتقويم | Calendar
| الصفحة | الوظيفة |
|--------|---------|
| `IslamicCalendar` | التقويم الإسلامي |
| `IslamicDays` | الأيام الإسلامية |
| `DateConverter` | محول التاريخ (هجري/ميلادي) |
| `HijriAge` | حساب العمر الهجري |

### البحث والمعرفة | Search & Knowledge
| الصفحة | الوظيفة |
|--------|---------|
| `HadithSearch` | البحث في الأحاديث |
| `Sahaba` | كبار الصحابة |
| `Prophets` | قصص الأنبياء |
| `Sources` | مصادر ومراجع التطبيق |

### مميزات إضافية | Extra Features
| الصفحة | الوظيفة |
|--------|---------|
| `Qibla` | اتجاه القبلة |
| `MasjidFinder` | البحث عن المساجد |
| `ZakatCalculator` | حاسبة الزكاة |
| `Quiz` | مسابقة إسلامية |
| `PuzzlePage` | لعبة التخمين |
| `Reminders` | التذكيرات |
| `KindredReminders` | تذكيرات الأقارب |
| `IslamicTV` | التلفزيون الإسلامي |
| `VoiceRecordings` | التسجيلات الصوتية |
| `BehaviorInJoy` | السلوك عند الفرح |
| `BehaviorInGrief` | السلوك عند الحزن |
| `DidntFindAnswer` | ما وجدت جواباً |
| `OnboardingPreview` | معاينة التعريف |

---

## ملفات الأدوات | Utils (7)

| الملف | الوظيفة |
|-------|---------|
| `prayer-times.js` | حساب أوقات الصلاة (API Aladhan + مكتبة adhan) |
| `sound.js` | إدارة الصوتيات (الأذان، TTS، أصوات التنبيه) |
| `audio.js` | إدارة الصوتيات (الراديو، السور) |
| `quran.js` | بيانات القرآن (الآيات والسور) |
| `quran-audio.js` | روابط الصوتيات القرآنية |
| `zakat.js` | حساب الزكاة |
| `persist.js` | حفظ واسترجاع البيانات |

---

## ملفات البيانات | Data Files (35)

| الملف | المحتوى |
|-------|---------|
| `morning-azkar.js` | أذكار الصباح |
| `evening-azkar.js` | أذكار المساء |
| `daily-azkar.js` | أذكار اليوم |
| `prayer-azkar.js` | أذكار بعد الصلاة |
| `ramadan-azkar.js` | أذكار رمضان |
| `dua.js` | الأدعية |
| `masnoon-duas.js` | الأدعية المسنونة |
| `names-of-allah.js` | أسماء الله الحسنى (99) |
| `prophets-stories.js` | قصص الأنبياء |
| `sahaba.js` | كبار الصحابة |
| `islamic-days.js` | الأيام الإسلامية |
| `islamic-history.js` | التاريخ الإسلامي |
| `islamic-occasions.js` | المناسبات الإسلامية |
| `prayer-guide.js` | دليل الصلاة |
| `ramadan-notifications.js` | إشعارات رمضان |
| `quiz-questions.js` | أسئلة المسابقة |
| `surah-details.js` | تفاصيل السور |
| `ruqyah-azkar.js` | أذكار الرقية |
| `salawat-azkar.js` | أذكار الصلاة على النبي |
| `sleep-azkar.js` | أذكار النوم والاستيقاظ |
| `istighfar-azkar.js` | أذكار الاستغفار |
| `hourly-azkar.js` | أذكار كل ساعة |
| `hourly-hadiths.js` | أحاديث كل ساعة |
| `daily-hadiths.js` | أحاديث يومية |
| `daily-wisdoms.js` | حكم يومية |
| `best-deeds.js` | أفضل الأعمال |
| `behavior-hadiths.js` | أحاديث السلوك |
| `adhan-azkar.js` | أذكار الأذان |
| `after-prayer-azkar.js` | أذكار بعد الصلاة |

---

## ملفات الصوتيات | Audio Files

### الأذان | Adhan
| الملف | الوصف | الحجم |
|-------|-------|-------|
| `adhan1.mp3` | أذان 1 (متنوع) | ~3.7 MB |
| `adhan2.mp3` | أذان 2 (متنوع) | ~7.7 MB |
| `after-adhan.mp3` | دعاء ما بعد الأذان | ~256 KB |

### صوتيات أخرى | Other Audio
| الملف | الوصف |
|-------|-------|
| `takbeer-eid.mp3` | تكبيرات العيد |
| `ramadan-cannon.mp3` | مدفع الإفطار |
| `morning-azkar-voice.mp3` | صوت أذكار الصباح |
| `evening-azkar-voice.mp3` | صوت أذكار المساء |
| `azkar-chime.mp3` | نغمة التنبيه |
| `صلاة_على_النبي.m4a` | صلاة على النبي ﷺ |

### أصوات أسماء الله | Names of Allah Voices
- 99 ملف MP3 في مجلد `public/names-voices/`
- كل ملف باسم الصوت `ar-001.mp3` إلى `ar-099.mp3`

---

## التثبيت والتشغيل | Installation & Run

### المتطلبات | Requirements
- Node.js >= 18
- npm >= 9
- Python 3.x (لـ TTS فقط)
- Windows 10+ (للتشغيل على الويندوز)

### خطوات التثبيت | Steps

```bash
# 1. استنساخ المشروع
git clone https://github.com/your969696/morshed-azkar.git
cd morshed-azkar

# 2. تثبيت التبعيات
npm install

# 3. تشغيل وضع التطوير
npm run dev

# 4. بناء التطبيق
npm run build

# 5. إنشاء ملف التثبيت
npx electron-builder --win

# 6. تشغيل التطبيق مباشرة
npm run electron:dev
```

### أوامر سريعة | Quick Commands
```bash
npm run dev              # تشغيل التطوير
npm run build            # بناء التطبيق
npm run electron:dev     # تشغيل Electron
npm run electron:build   # بناء + ملف التثبيت
npm run lint             # فحص الأخطاء
```

---

## للمطورين | For Developers

### المساهمة في تحويل التطبيق | Contributing to Port

**الهدف:** تحويل التطبيق ليعمل على أندرويد و iOS وتلفزيونات سامسونج.

**التقنيات المقترحة:**
- **Flutter** - أفضل خيار للتحويل السريع
- **React Native** - إذا كنت تفضل JavaScript
- **SwiftUI** - لنسخة iOS أصلية

### كيف تبدأ | How to Start

1. **Fork** المشروع
2. أنشئ **Branch** جديد باسم الميزة
3. اقرأ ملف `CONTRIBUTING.md` للتفاصيل
4. اكتب الكود واختبره
5. أرسل **Pull Request**

### هيكل البيانات للتحويل | Data Structure for Porting

ملفات البيانات في `src/data/` بتنسيق JavaScript سهل التحويل:
```javascript
// مثال: morning-azkar.js
export const morningAzkar = [
  {
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ...',
    repeat: 1,
    source: 'رواه أبو داود',
  },
  // ...
];
```

### تحويل الصوتيات | Audio Porting

ملفات الصوتيات في `public/` بتنسيق MP3/M4A يمكن نسخها مباشرة:
```
public/adhan1.mp3          → assets/sounds/adhan1.mp3
public/adhan2.mp3          → assets/sounds/adhan2.mp3
public/names-voices/*.mp3  → assets/sounds/names-voices/*.mp3
```

---

## التقنيات المستخدمة | Tech Stack

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Electron | 43.1.1 | تطبيقات سطح المكتب |
| React | 19.2.7 | واجهة المستخدم |
| Vite | 8.1.0 | أداة البناء |
| Tailwind CSS | 4.3.2 | التنسيق |
| Framer Motion | 12.42.0 | الحركات والتأثيرات |
| Howler.js | 2.2.4 | إدارة الصوتيات |
| React Router | 7.18.1 | التوجيه |
| adhan | 4.4.4 | حساب أوقات الصلاة |
| Firebase | 12.17.1 | قاعدة البيانات |
| Edge TTS | - | توليد الصوت (Python) |
| electron-builder | 26.15.3 | إنشاء ملف التثبيت |

---

## ملاحظات تقنية | Technical Notes

- **الخط الرئيسي:** Cairo Variable (عربي)
- **خط القرآن:** Amiri Quran (قرآني)
- **الصوت:** Edge TTS `ar-SA-HamedNeural` (صوت رجل عربي)
- **اللغات:** العربية، الإنجليزية، الإسبانية
- **المذهب:** Sunni (الشافعي/المالكي/الحنبلي)
- **API أوقات الصلاة:** Aladhan مع مزامنة محلية
- **حفظ البيانات:** localStorage + Firebase

---

## المساهمة | Contributing

نرحب بجميع المساهمات! للاطلاع على التفاصيل، يُرجى قراءة ملف [CONTRIBUTING.md](CONTRIBUTING.md).

We welcome all contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### طريقة المساهمة | How to Contribute

```bash
# 1. Fork المشروع
# 2. أنشئ Branch جديد
git checkout -b feature/اسم-الميزة

# 3. اكتب الكود
# 4. اعمل Commit
git commit -m "إضافة: وصف التغيير"

# 5. ادفع التغييرات
git push origin feature/اسم-الميزة

# 6. افتح Pull Request
```

---

## الرخصة | License

هذا المشروع مرخص تحت رخصة **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### ماذا تعني هذه الرخصة؟ | What does this license mean?

- يمكنك استخدام ونسخ وتوزيع البرنامج
- يمكنك تعديله وتحسينه
- يجب أن تكون جميع التعديلات مفتوحة المصدر
- يجب أن تحمل نفس الرخصة (AGPL-3.0)
- يجب أن توفر المصدر لكل التغييرات

For more details, see the [LICENSE](LICENSE) file or visit https://www.gnu.org/licenses/agpl-3.0.html

---

## الدعم والمساعدة | Support

- **المشكلات:** [GitHub Issues](https://github.com/your969696/morshed-azkar/issues)
- **التواصل:** [GitHub Discussions](https://github.com/your969696/morshed-azkar/discussions)
- **الخطة المستقبلية:** [ROADMAP.md](ROADMAP.md)
- **سجل التغييرات:** [CHANGELOG.md](CHANGELOG.md)
- **قواعد السلوك:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## الشكر والتقدير | Acknowledgments

- [Electron](https://www.electronjs.org/) - تطبيقات سطح المكتب
- [React](https://react.dev/) - واجهات المستخدم
- [Vite](https://vitejs.dev/) - أداة البناء
- [Tailwind CSS](https://tailwindcss.com/) - إطار العمل
- [Aladhan API](https://aladhan.com/prayer-times-api) - أوقات الصلاة
- [Edge TTS](https://github.com/rany2/edge-tts) - توليد الصوت

---

<div align="center">

**اللهم تقبل منا ومنكم صالح الأعمال**

**May Allah accept from us and you good deeds**

</div>
