# ملفات البيانات | Data Files

## نظرة عامة

يحتوي المشروع على 35 ملف بيانات تخدم ميزات التطبيق المختلفة.

---

## قائمة الملفات

### الأذكار

| الملف | المحتوى |
|-------|---------|
| `morning-azkar.js` | أذكار الصباح |
| `evening-azkar.js` | أذكار المساء |
| `daily-azkar.js` | أذكار اليوم |
| `prayer-azkar.js` | أذكار بعد الصلاة |
| `ramadan-azkar.js` | أذكار رمضان |
| `ruqyah-azkar.js` | أذكار الرقية |
| `salawat-azkar.js` | أذكار الصلاة على النبي |
| `sleep-azkar.js` | أذكار النوم والاستيقاظ |
| `istighfar-azkar.js` | أذكار الاستغفار |
| `hourly-azkar.js` | أذكار كل ساعة |
| `adhan-azkar.js` | أذكار الأذان |
| `after-prayer-azkar.js` | أذكار بعد الصلاة |

### الأدعية

| الملف | المحتوى |
|-------|---------|
| `dua.js` | الأدعية |
| `masnoon-duas.js` | الأدعية المسنونة |

### أسماء الله

| الملف | المحتوى |
|-------|---------|
| `names-of-allah.js` | أسماء الله الحسنى (99 اسم) |

### الأنبياء والصحابة

| الملف | المحتوى |
|-------|---------|
| `prophets-stories.js` | قصص الأنبياء |
| `sahaba.js` | كبار الصحابة |

### الأيام والمناسبات

| الملف | المحتوى |
|-------|---------|
| `islamic-days.js` | الأيام الإسلامية |
| `islamic-history.js` | التاريخ الإسلامي |
| `islamic-occasions.js` | المناسبات الإسلامية |

### الأحاديث والحكم

| الملف | المحتوى |
|-------|---------|
| `daily-hadiths.js` | أحاديث يومية |
| `hourly-hadiths.js` | أحاديث كل ساعة |
| `daily-wisdoms.js` | حكم يومية |
| `behavior-hadiths.js` | أحاديث السلوك |
| `best-deeds.js` | أفضل الأعمال |

### الصلاة

| الملف | المحتوى |
|-------|---------|
| `prayer-guide.js` | دليل الصلاة |

### المسابقات

| الملف | المحتوى |
|-------|---------|
| `quiz-questions.js` | أسئلة المسابقة |

### القرآن

| الملف | المحتوى |
|-------|---------|
| `surah-details.js` | تفاصيل السور |

### رمضان

| الملف | المحتوى |
|-------|---------|
| `ramadan-notifications.js` | إشعارات رمضان |

---

## هيكل البيانات

### مثال: أذكار الصباح

```javascript
// src/data/morning-azkar.js
export const morningAzkar = [
  {
    id: 1,
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    repeat: 1,
    source: 'رواه أبو داود',
    category: 'أذكار الصباح',
  },
  // ...
];
```

### مثال: أسماء الله الحسنى

```javascript
// src/data/names-of-allah.js
export const namesOfAllah = [
  {
    id: 1,
    name: 'الرَّحْمَنُ',
    meaning: 'الرحمة الواسعة',
    meaningEn: 'The Most Merciful',
    description: 'الذي وسعت رحمة كل شيء',
  },
  // ...
];
```

---

## كيفية استخدام البيانات

```javascript
import { morningAzkar } from './data/morning-azkar';
import { namesOfAllah } from './data/names-of-allah';

function MyComponent() {
  return (
    <div>
      {morningAzkar.map((azkar) => (
        <p key={azkar.id}>{azkar.text}</p>
      ))}
    </div>
  );
}
```

---

## إضافة بيانات جديدة

1. أنشئ ملف جديد في `src/data/`
2. صدّر البيانات باستخدام `export`
3. استخدمها في المكون المطلوب

---

**الصفحة السابقة:** [الصفحات](Pages)
**الصفحة التالية:** [الأدوات المساعدة](Utilities)
