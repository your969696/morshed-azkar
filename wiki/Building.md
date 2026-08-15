# الإرسال | Building

## نظرة عامة

يحتوي المشروع على أوامر بناء متعددة لإنشاء نسخ مختلفة من التطبيق.

---

## أوامر البناء

| الأمر | الوصف |
|-------|-------|
| `npm run build` | بناء التطبيق للإنتاج |
| `npm run electron:build` | بناء + إنشاء ملف التثبيت |
| `npm run electron:build:dir` | بناء بدون ملف تثبيت |

---

## بناء تطبيق Windows

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npm run electron:build
```

سيتم إنشاء الملف في مجلد `release/`

---

## بناء تطبيق macOS

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --mac
```

---

## بناء تطبيق Linux

```bash
# بناء التطبيق
npm run build

# إنشاء ملف التثبيت
npx electron-builder --linux
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
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## حل مشاكل البناء

### المشكلة: خطأ في Electron Builder

```bash
# حذف مجلد node_modules
rm -rf node_modules

# إعادة التثبيت
npm install

# إعادة البناء
npm run electron:build
```

### المشكلة: خطأ في Vite

```bash
# حذف مجلد dist
rm -rf dist

# إعادة البناء
npm run build
```

---

**الصفحة السابقة:** [الترجمة](Translation)
**الصفحة التالية:** [المساهمة](Contributing)
