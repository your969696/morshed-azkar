# استراتيجية الفروع | Branching Strategy

## نظرة عامة

يستخدم المشروع استراتيجية فروع بسيطة وفعالة.

---

## الفروع الرئيسية

| الفرع | الوصف |
|-------|-------|
| `main` | الفرع الرئيسي للإنتاج |
| `develop` | فرع التطوير |
| `feature/*` | فروع الميزات الجديدة |
| `bugfix/*` | فروع إصلاح الأخطاء |
| `hotfix/*` | فروع الإصلاح السريع |
| `release/*` | فروع الإصدار |

---

## تدفق العمل

### 1. إنشاء فرع ميزة جديدة

```bash
# الانتقال إلى main
git checkout main

# سحب أحدث التغييرات
git pull origin main

# إنشاء فرع جديد
git checkout -b feature/اسم-الميزة
```

### 2. العمل على الميزة

```bash
# كتابة الكود
# ...

# حفظ التغييرات
git add .
git commit -m "إضافة: وصف الميزة"
```

### 3. رفع الفرع

```bash
# رفع الفرع
git push origin feature/اسم-الميزة
```

### 4. فتح Pull Request

- اذهب إلى صفحة المشروع على GitHub
- اضغط **New Pull Request**
- اختر الفرع `feature/اسم-الميزة`
- اكتب وصفاً واضحاً للتغييرات

### 5. مراجعة ودمج

- يراجع المطورون التغييرات
- يطلبون تعديلات إن أمكن
- يدمجون الفرع في `main`

---

## أنواع الفروع

### feature/*
لإضافة ميزات جديدة:

```bash
git checkout -b feature/add-quran-player
git checkout -b feature/add-prayer-times
git checkout -b feature/add-azkar-page
```

### bugfix/*
لإصلاح أخطاء:

```bash
git checkout -b bugfix/fix-audio-player
git checkout -b bugfix/fix-prayer-times
```

### hotfix/*
لإصلاح أخطاء حرجة في الإنتاج:

```bash
git checkout -b hotfix/fix-crash-on-start
```

### release/*
لتحضير إصدار جديد:

```bash
git checkout -b release/v1.1.0
```

---

## القواعد

### 1. لا تدفع مباشرة إلى main
- يجب فتح Pull Request لكل تغيير
- يجب مراجعة التغييرات قبل الدمج

### 2. اكتب رسائل commit واضحة
```bash
# ✅ جيد
git commit -m "إضافة: مشغل القرآن مع 12 سورة"
git commit -m "إصلاح: خطأ في حساب أوقات الصلاة"
git commit -m "تحسين: تحسين أداء التطبيق"

# ✗ سيء
git commit -m "تحديث"
git commit -m "إصلاح"
```

### 3. احذف الفروع بعد الدمج
```bash
# حذف الفرع المحلي
git branch -d feature/اسم-الميزة

# حذف الفرع عن بعد
git push origin --delete feature/اسم-الميزة
```

---

## حل المشاكل

### تعارض في الدمج

```bash
# سحب التغييرات
git pull origin main

# حل التعارضات
# ...

# حفظ التغييرات
git add .
git commit -m "حل التعارض"
```

### إرجاع تغييرات

```bash
# إرجاع آخر commit
git reset --soft HEAD~1

# إرجاع تغييرات محددة
git checkout -- اسم-الملف
```

---

**الصفحة السابقة:** [الإصدارات](Releases)
**الصفحة التالية:** [الرخصة](License)
