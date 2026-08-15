# التثبيت والتشغيل | Installation

## جدول المحتويات

- [المتطلبات](#المتطلبات)
- [التثبيت](#التثبيت)
- [التشغيل](#التشغيل)
- [البناء](#البناء)
- [solve problems](#حل-المشاكل)

---

## المتطلبات

### البرامج المطلوبة

| البرنامج | الإصدار | الرابط |
|----------|---------|--------|
| Node.js | >= 18 | https://nodejs.org |
| npm | >= 9 | يتضمنه Node.js |
| Python | >= 3.x | https://python.org (لـ TTS فقط) |
| Git | >= 2.x | https://git-scm.com |

### نظام التشغيل

- **مدعوم بالكامل:** Windows 10+
- **قيد التطوير:** macOS, Linux

---

## التثبيت

### 1. تثبيت Git

إذا لم يكن Git مثبتاً:

```bash
# Windows (winget)
winget install Git.Git

# أو حمّل من الموقع الرسمي
# https://git-scm.com/download/win
```

### 2. تثبيت Node.js

```bash
# Windows (winget)
winget install OpenJS.NodeJS.LTS

# أو حمّل من الموقع الرسمي
# https://nodejs.org
```

### 3. تثبيت Python (اختياري - لـ TTS فقط)

```bash
# Windows (winget)
winget install Python.Python.3.12

# أو حمّل من الموقع الرسمي
# https://python.org
```

### 4. استنساخ المشروع

```bash
# نسخ الرابط
git clone https://github.com/your969696/morshed-azkar.git

# الدخول للمجلد
cd morshed-azkar

# تثبيت التبعيات
npm install
```

---

## التشغيل

### وضع التطوير

```bash
# تشغيل التطبيق في وضع التطوير
npm run dev
```

سيتم فتح التطبيق في المتصفح على `http://localhost:5173`

### تشغيل Electron

```bash
# تشغيل التطبيق كتطبيق سطح مكتب
npm run electron:dev
```

### بناء التطبيق

```bash
# بناء التطبيق للإنتاج
npm run build
```

### إنشاء ملف التثبيت

```bash
# إنشاء ملف تثبيت Windows
npm run electron:build
```

سيتم إنشاء الملف في مجلد `release/`

---

## أوامر سريعة

| الأمر | الوصف |
|-------|-------|
| `npm run dev` | تشغيل وضع التطوير |
| `npm run build` | بناء التطبيق |
| `npm run electron:dev` | تشغيل كتطبيق سطح مكتب |
| `npm run electron:build` | إنشاء ملف التثبيت |
| `npm run lint` | فحص الأخطاء |
| `npm run preview` | معاينة البناء |

---

## حل المشاكل

### المشكلة: npm install يفشل

**الحل:**
```bash
# حذف مجلد node_modules
rm -rf node_modules

# حذف package-lock.json
rm package-lock.json

# إعادة التثبيت
npm install
```

### المشكلة: التطبيق لا يعمل

**الحل:**
```bash
# التأكد من تثبيت جميع التبعيات
npm install

# تشغيل وضع التطوير
npm run dev
```

### المشكلة: خطأ في Python

**الحل:**
```bash
# التأكد من تثبيت Python
python --version

# تثبيت edge-tts
pip install edge-tts
```

### المشكلة: خطأ في Electron

**الحل:**
```bash
# حذف مجلد node_modules
rm -rf node_modules

# إعادة التثبيت
npm install

# تشغيل التطبيق
npm run electron:dev
```

---

## ملاحظات مهمة

1. **الصوتيات:** بعض ملفات الصوتيات كبيرة الحجم، قد يستغرق التحميل وقتاً
2. **Python:** مطلوب فقط لتوليد الصوت (TTS)， ليس مطلوباً لتشغيل التطبيق
3. **الإنترنت:** مطلوب اتصال بالإنترنت للحصول على أوقات الصلاة

---

**الصفحة التالية:** [هيكل المشروع](Project-Structure)
