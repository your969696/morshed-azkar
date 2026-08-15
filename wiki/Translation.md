# الترجمة | Translation

## نظرة عامة

يدعم التطبيق 3 لغات: العربية، الإنجليزية، الإسبانية.

---

## هيكل الترجمة

```
src/
├── i18n.jsx                 # نظام الترجمة
└── i18n-data.js             # بيانات الترجمة
```

---

## اللغات المدعومة

| اللغة | الكود | الحالة |
|-------|-------|--------|
| العربية | `ar` | ✅ مكتمل |
| الإنجليزية | `en` | ✅ مكتمل |
| الإسبانية | `es` | ✅ مكتمل |

---

## كيفية إضافة لغة جديدة

1. أضف الكود في `src/i18n-data.js`
2. أضف الترجمات للغة الجديدة
3. حدّث نظام الترجمة في `src/i18n.jsx`

---

## مثال على الترجمة

```javascript
// src/i18n-data.js
export const translations = {
  ar: {
    home: 'الرئيسية',
    settings: 'الإعدادات',
    azkar: 'الأذكار',
    // ...
  },
  en: {
    home: 'Home',
    settings: 'Settings',
    azkar: 'Azkar',
    // ...
  },
  es: {
    home: 'Inicio',
    settings: 'Configuración',
    azkar: 'Azkar',
    // ...
  }
};
```

---

## استخدام الترجمة في المكونات

```jsx
import { useTranslation } from './i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('home')}</h1>;
}
```

---

**الصفحة السابقة:** [الأدوات المساعدة](Utilities)
**الصفحة التالية:** [الإرسال](Building)
