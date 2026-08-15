# دليل البناء | Build Guide

## نظرة عامة

يحتوي هذا الملف على دليل بناء تطبيق مرشد أذكار لإصدارات مختلفة.

---

## المتطلبات

```bash
# التأكد من تثبيت التبعيات
npm install

# التأكد من وجود مجلد dist
mkdir -p dist
```

---

## أوامر البناء

### بناء Vite

```bash
# بناء للإنتاج
npm run build

# المخرجات: dist/
```

### بناء Electron

```bash
# بناء للإنتاج + ملف تثبيت
npm run electron:build

# المخرجات: release/
```

### بناء بدون ملف تثبيت

```bash
# بناء بدون ملف تثبيت
npm run electron:build:dir

# المخرجات: release/win-unpacked/
```

---

## إعدادات البناء

### package.json

```json
{
  "build": {
    "appId": "com.morshed.azkar",
    "productName": "مرشد أذكار",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "مرشد أذكار"
    }
  }
}
```

---

## بناء Windows

### بناء 64-bit

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npm run electron:build

# المخرجات: release/morshed-azkar-1.0.0-win-x64.exe
```

### بناء 32-bit

```bash
# تعديل package.json
# أضف: "win": { "target": "nsis", "arch": "ia32" }

# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npm run electron:build

# المخرجات: release/morshed-azkar-1.0.0-win-ia32.exe
```

---

## بناء macOS

### بناء Intel

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --mac --x64

# المخرجات: release/morshed-azkar-1.0.0.dmg
```

### بناء Apple Silicon

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --mac --arm64

# المخرجات: release/morshed-azkar-1.0.0-arm64.dmg
```

---

## بناء Linux

### بناء AppImage

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --linux AppImage

# المخرجات: release/morshed-azkar-1.0.0.AppImage
```

### بناء deb

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --linux deb

# المخرجات: release/morshed-azkar-1.0.0.deb
```

---

## حل مشاكل البناء

### المشكلة: `electron-builder` يفشل

```bash
# الحل 1: حذف مجلد release
rm -rf release

# الحل 2: إعادة التثبيت
npm install

# الحل 3: تحديث electron-builder
npm install electron-builder@latest
```

### المشكلة: خطأ في Vite

```bash
# الحل 1: حذف مجلد dist
rm -rf dist

# الحل 2: إعادة البناء
npm run build
```

### المشكلة: خطأ في الصوتيات

```bash
# الحل 1: التأكد من وجود ملفات الصوتيات
ls -la public/*.mp3

# الحل 2: التأكد من حجم الملفات
du -sh public/*.mp3
```

---

## التحقق من البناء

### التحقق من الملفات

```bash
# التحقق من مجلد dist
ls -la dist/

# التحقق من مجلد release
ls -la release/
```

### التحقق من الحجم

```bash
# حجم مجلد dist
du -sh dist/

# حجم ملف التثبيت
du -sh release/*.exe
```

---

## نشر الإصدار

### إنشاء Tag

```bash
# إنشاء tag
git tag -a v1.0.0 -m "الإصدار الأول"

# رفع tag
git push origin v1.0.0
```

### إنشاء Release

1. اذهب إلى صفحة الإصدارات على GitHub
2. اضغط **Create a new release**
3. اختر الـ Tag
4. اكتب ملاحظات الإصدار
5. ارفع ملف التثبيت

---

## أوامر البناء السريعة

| الأمر | الوصف | المخرجات |
|-------|-------|----------|
| `npm run build` | بناء Vite | `dist/` |
| `npm run electron:build` | بناء Electron | `release/` |
| `npm run electron:build:dir` | بناء بدون تثبيت | `release/win-unpacked/` |

---

**المرجع:** [LOCAL_SETUP.md](LOCAL_SETUP.md) | [DEPLOYMENT.md](DEPLOYMENT.md)
