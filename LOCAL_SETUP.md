# الإعداد المحلي | Local Setup

## نظرة عامة

دليل خطوة بخطوة لإعداد بيئة التطوير المحلية لمشروع مرشد أذكار.

---

## الخطوة 1: تثبيت البرامج الأساسية

### تثبيت Node.js

```bash
# Windows (winget)
winget install OpenJS.NodeJS.LTS

# التحقق من التثبيت
node --version  # يجب أن يظهر v18.x أو أعلى
npm --version   # يجب أن يظهر 9.x أو أعلى
```

### تثبيت Git

```bash
# Windows (winget)
winget install Git.Git

# التحقق من التثبيت
git --version  # يجب أن يظهر 2.x أو أعلى
```

### تثبيت Python (اختياري - لـ TTS فقط)

```bash
# Windows (winget)
winget install Python.Python.3.12

# التحقق من التثبيت
python --version  # يجب أن يظهر 3.x
pip --version     # يجب أن يظهر pip 2x
```

---

## الخطوة 2: استنساخ المشروع

```bash
# استنساخ المشروع
git clone https://github.com/your969696/morshed-azkar.git

# الدخول للمجلد
cd morshed-azkar

# عرض الملفات
ls -la
```

---

## الخطوة 3: تثبيت التبعيات

```bash
# تثبيت التبعيات
npm install

# التحقق من التثبيت
npm list --depth=0
```

### حل مشاكل التثبيت

```bash
# إذا فشل التثبيت
rm -rf node_modules
rm package-lock.json
npm install

# إذا ظهرت أخطاء Python
pip install edge-tts
```

---

## الخطوة 4: إعداد ملف البيئة

```bash
# نسخ ملف الإعدادات
cp .env.example .env

# تعديل الملف
nano .env  # أو استخدم محرر النصوص
```

### محتويات .env

```bash
# Firebase (اختياري)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Aladhan API
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1

# Application
VITE_APP_NAME=مرشد أذكار
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

---

## الخطوة 5: تشغيل التطبيق

### وضع التطوير

```bash
# تشغيل Vite dev server
npm run dev

# سيفتح التطبيق على
# http://localhost:5173
```

### وضع Electron

```bash
# تشغيل كتطبيق سطح مكتب
npm run electron:dev
```

---

## الخطوة 6: اختبار التطبيق

### فحص الأخطاء

```bash
# فحص ESLint
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint -- --fix
```

### بناء التطبيق

```bash
# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

---

## الأوامر السريعة

| الأمر | الوصف |
|-------|-------|
| `npm run dev` | تشغيل وضع التطوير |
| `npm run build` | بناء التطبيق |
| `npm run preview` | معاينة البناء |
| `npm run lint` | فحص الأخطاء |
| `npm run lint -- --fix` | إصلاح الأخطاء |
| `npm run electron:dev` | تشغيل Electron |
| `npm run electron:build` | بناء ملف التثبيت |

---

## هيكل المشروع после التثبيت

```
morshed-azkar/
├── node_modules/          # التبعيات (يتم تجاهله)
├── src/                   # كود التطبيق
├── public/                # الملفات العامة
├── electron/              # ملفات Electron
├── dist/                  # ملفات البناء (يتم تجاهله)
├── release/               # ملفات التثبيت (يتم تجاهله)
├── .env                   # إعدادات البيئة (يتم تجاهله)
├── package.json           # إعدادات المشروع
├── vite.config.js         # إعدادات Vite
└── tailwind.config.js     # إعدادات Tailwind
```

---

## حل المشاكل الشائعة

### المشكلة: `npm install` يفشل

```bash
# الحل 1: حذف node_modules
rm -rf node_modules
npm install

# الحل 2: استخدام cache
npm cache clean --force
npm install

# الحل 3: استخدام yarn
npm install -g yarn
yarn install
```

### المشكلة: `npm run dev` لا يعمل

```bash
# التأكد من تثبيت التبعيات
npm install

# التأكد من صحة package.json
cat package.json

# محاولة تشغيل مباشر
npx vite
```

### المشكلة: خطأ في Python

```bash
# التأكد من تثبيت Python
python --version

# تثبيت edge-tts
pip install edge-tts

# التأكد من المسار
where python
```

### المشكلة: التطبيق بطيء

```bash
# إغلاق التطبيقات الأخرى
# إعادة تشغيل التطبيق
# التأكد من تحديث Node.js
```

---

## نصائح للتطوير

1. **استخدم Git** لإدارة التغييرات
2. **اكتب تعليقات** بالعربي على الكود المهم
3. **اختبر التغييرات** قبل الحفظ
4. **اتبع أسلوب الكود** الموجود في المشروع
5. **اقرأ التوثيق** قبل إضافة ميزات جديدة

---

## الموارد الإضافية

- [التوثيق الرسمي لـ React](https://react.dev/)
- [التوثيق الرسمي لـ Electron](https://www.electronjs.org/docs)
- [التوثيق الرسمي لـ Vite](https://vitejs.dev/)
- [التوثيق الرسمي لـ Tailwind](https://tailwindcss.com/docs)

---

**المرجع:** [ENVIRONMENT.md](ENVIRONMENT.md) | [BUILD_GUIDE.md](BUILD_GUIDE.md)
