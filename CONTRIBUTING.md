<div dir="rtl">

# المساهمة في المشروع | Contributing

شكراً لاهتمامك بالمساهمة في مرشد أذكار!
Thank you for your interest in contributing to the Murshid Azkar!

---

## جدول المحتويات | Table of Contents

- [كيف تساهم](#كيف-تساهم)
- [بناء نسخ أخرى](#بناء-نسخ-أخرى)
- [أسلوب الكود](#أسلوب-الكود)
- [الإبلاغ عن أخطاء](#الإبلاغ-عن-أخطاء)
- [طلب مميزات](#طلب-مميزات)

---

## كيف تساهم | How to Contribute

### 1. Fork المشروع

اذهب إلى صفحة المشروع على GitHub واضغط زر **Fork**.

Go to the project page on GitHub and click the **Fork** button.

### 2. أنشئ Branch جديد

```bash
git checkout -b feature/اسم-الميزة
```

### 3. اكتب الكود

- اكتب كود نظيف وواضح
- أضف تعليقات بالعربي على الدوال المهمة
- تأكد من أن الكود يعمل بدون أخطاء
- اتبع أسلوب الكود الموجود في المشروع

### 4. اختبر التغييرات

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npm run electron:build

# فحص الأخطاء
npm run lint
```

### 5. اكتب Commit واضح

```bash
git commit -m "إضافة: وصف مختصر للتغيير"
```

**أمثلة على Commits:**
```bash
git commit -m "إضافة: صفحة جديدة للبحث في الحديث"
git commit -m "إصلاح: خطأ في تشغيل الأذان"
git commit -m "تحسين: سرعة تحميل أوقات الصلاة"
git commit -m "ترجمة: إضافة اللغة الإسبانية"
```

### 6. ادفع التغييرات

```bash
git push origin feature/اسم-الميزة
```

### 7. افتح Pull Request

اذهب إلى صفحة المشروع على GitHub واضغط **New Pull Request**.

---

## بناء نسخ أخرى | Building Other Platforms

<div dir="ltr">

> **مهم:** هذا المشروع مصمم لأجهزة سطح المكتب فقط (ويندوز).
> المجتمع مسؤول عن بناء نسخ أندرويد وآيفون وتلفزيونات سامسونج.

> **Important:** This project is desktop-only (Windows).
> The community is responsible for building Android, iPhone, and Samsung TV versions.

</div>

### للتحويل لأندرويد | For Android

| الأداة | المميزات |
|--------|----------|
| **Flutter** | أفضل خيار، تحويل سريع، أداء ممتاز |
| **React Native** | إذا كنت تفضل JavaScript |
| **Electron to APK** | تحويل مباشر لكن الحجم كبير |

**خطوات التحويل بـ Flutter:**
1. نسخ ملفات البيانات من `src/data/`
2. تحويل ملفات الأدوات من `src/utils/`
3. إعادة بناء الواجهة بـ Flutter widgets
4. نسخ ملفات الصوتيات إلى `assets/sounds/`

### للتحويل لآيفون | For iPhone

| الأداة | المميزات |
|--------|----------|
| **Flutter** | يعمل على iOS و Android معاً |
| **SwiftUI** | تطبيق أصلي لأجهزة Apple |
| **React Native** | يعمل على iOS و Android معاً |

**خطوات التحويل بـ SwiftUI:**
1. تحويل ملفات البيانات إلى Swift structs
2. إعادة بناء الواجهة بـ SwiftUI views
3. استخدام AVFoundation للصوتيات
4. استخدام Core Data للحفظ المحلي

### لتلفزيونات سامسونج | For Samsung TV

| الأداة | المميزات |
|--------|----------|
| **Tizen Studio** | التطوير الرسمي لسامسونج |
| **React** | يمكن استخدام React مع Tizen |

**متطلبات التطوير:**
1. تثبيت Tizen Studio
2. إنشاء مشروع Tizen Web App
3. تحويل الواجهة للتنقل بالجهاز控制
4. تحسين الألوان للشاشات الكبيرة
5. اختبار على محاكي Tizen

### للتحويل لأندرويد TV | For Android TV

| الأداة | المميزات |
|--------|----------|
| **Flutter** | يعمل على Android TV |
| **Android TV Framework** | التطوير الرسمي لـ Google |

---

## أسلوب الكود | Code Style

### JavaScript/React
- استخدم `camelCase` للمتغيرات والدوال
- استخدم `PascalCase` للفئات والمكونات
- استخدم `SCREAMING_SNAKE_CASE` للثوابت
- أضف تعليقات عربية للشرح
- لا تضف تعليقات غير ضرورية

### Flutter/Dart
- استخدم `camelCase` للمتغيرات والدوال
- استخدم `PascalCase` للفئات
- استخدم `snake_case` لاسم الملفات
- أضف تعليقات عربية للشرح

### التنسيق
- استخدم 2 مسافات للمسافة
- استخدم `Prettier` للتنسيق التلقائي
- لا تتجاوز 100 حرف في السطر

---

## الإبلاغ عن أخطاء | Report Bugs

افتح issue جديدة على GitHub وحدد:

### نموذج الإبلاغ
```
**وصف المشكلة:**
وصف واضح للمشكلة

**خطوات إعادة الإنتاج:**
1. افتح التطبيق
2. اذهب إلى...
3. اضغط على...

**النتيجة المتوقعة:**
ما الذي تتوقعه أن يحدث

**النتيجة الفعلية:**
ما الذي يحدث فعلياً

**البيئة:**
- نظام التشغيل: Windows 10/11
- إصدار Node.js: 18.x
- إصدار npm: 9.x
```

---

## طلب مميزات | Request Features

افتح issue جديدة بعنوان `[Feature]` مع:

### نموذج الطلب
```
**اسم الميزة:**
وصف مختصر للميزة

**لماذا هذه الميزة مفيدة:**
شرح كيف تستفيد من هذه الميزة

**كيف يمكن تنفيذها:**
أفكار للتنفيذ إن وُجدت

**أمثلة على الاستخدام:**
كيف سيستخدمها المستخدم
```

---

## الأسئلة الشائعة | FAQ

### س: كيف أبدأ في المساهمة؟
ج: ابدأ بقراءة ملف README.md ثم اختر issue مفتوحة وابدأ العمل عليها.

### س: هل يمكنني العمل على أكثر من issue؟
ج: نعم، لكن أكمل واحداً قبل أن تبدأ آخر.

### س: كيف أختبر التغييرات؟
ج: استخدم `npm run dev` للتشغيل المحلي ثم `npm run build` للبناء.

### س: ما هي التقنيات المطلوبة؟
ج: Node.js 18+, npm 9+, Python 3.x (لـ TTS فقط).

---

## التواصل | Contact

- **المشكلات:** [GitHub Issues](https://github.com/yourusername/murshid-azkar/issues)
- **المناقشات:** [GitHub Discussions](https://github.com/yourusername/murshid-azkar/discussions)

---

<div dir="rtl">

**اللهم تقبل منا ومنكم صالح الأعمال**

**May Allah accept from us and you good deeds**

</div>

