# هيكل المشروع | Project Structure

## نظرة عامة

يحتوي المشروع على بنية منظمة تشمل ملفات Electron للتطبيق، وملفات React للواجهة، وملفات البيانات والصوتيات.

---

## البنية العامة

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

## شرح المجلدات

### electron/
مجلد يحتوي على ملفات Electron التي تتحكم في التطبيق كتطبيق سطح مكتب.

| الملف | الوظيفة |
|-------|---------|
| `main.cjs` | الملف الرئيسي الذي يشغّل التطبيق |
| `preload.cjs` | يربط بين React و Electron |
| `preload-countdown.cjs` | يتحكم في نافذة العداد التنازلي |
| `preload-widget.cjs` | يتحكم في الودجت |
| `preload-azkar-widget.cjs` | يتحكم في ودجت الأذكار |
| `edge-tts-gen.py` | سكربت توليد الصوت باستخدام Edge TTS |

### src/
مجلد يحتوي على كود React الرئيسي للتطبيق.

#### src/components/
يحتوي على المكونات القابلة لإعادة الاستخدام (29 ملف).

#### src/pages/
يحتوي على صفحات التطبيق (44 صفحة).

#### src/utils/
يحتوي على الدوال والأدوات المساعدة (7 ملفات).

#### src/data/
يحتوي على ملفات البيانات (35 ملف).

### public/
مجلد الملفات العامة التي يتم تقديمها مباشرة.

| المجلد | المحتوى |
|--------|---------|
| `fonts/` | الخطوط العربية (Cairo, Amiri Quran) |
| `names-voices/` | أصوات أسماء الله (99 ملف MP3) |
| `azkar-voices/` | أصوات الأذكار |
| `data/quran/` | بيانات القرآن (114 سورة) |
| `data/hadith/` | بيانات الأحاديث |

### scripts/
مجلد يحتوي على سكربتات البناء والأتمتة.

### tools/
مجلد يحتوي على أدوات التطوير والتحسين.

---

## شرح الملفات الرئيسية

### package.json
يحتوي على إعدادات المشروع والتبعيات.

```json
{
  "name": "morshed-azkar",
  "version": "1.0.0",
  "license": "AGPL-3.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "electron .",
    "electron:build": "vite build && electron-builder --win"
  }
}
```

### vite.config.js
يحتوي على إعدادات Vite للبناء.

### index.html
الصفحة الرئيسية التي يتم تحميل التطبيق فيها.

---

## تدفق البيانات

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Electron  │◄──►│    React    │◄──►│   Firebase  │
│   (main.cjs)│    │  (src/)    │    │  (Database) │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│   File      │    │   Local     │
│   System    │    │   Storage   │
└─────────────┘    └─────────────┘
```

---

## ملاحظات تقنية

1. **Electron:** يستخدم CommonJS (`.cjs`) لتوافق أفضل
2. **React:** يستخدم JSX لكتابة المكونات
3. **Vite:** أداة بناء سريعة للتطوير
4. **Tailwind CSS:** إطار عمل CSS للتنسيق

---

**الصفحة السابقة:** [التثبيت](Installation)
**الصفحة التالية:** [المكونات](Components)
