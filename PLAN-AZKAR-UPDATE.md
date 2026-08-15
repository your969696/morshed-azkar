# خطة تحديث الأذكار — Azkar App

## التاريخ: أغسطس 2026

---

## 1. المحتوى الحالي

| الملف | العدد الحالي | الحالة |
|---|---|---|
| hourly-hadiths.js | 150 حديث | ✅ تم التحديث |
| morning-azkar.js | أذكار الصباح | ⚠️ محتاج مراجعة |
| evening-azkar.js | أذكار المساء | ⚠️ محتاج مراجعة |
| after-prayer-azkar.js | أذكار بعد الصلاة | ⚠️ محتاج مراجعة |
| behavior-hadiths.js | 20 حديث | ⚠️ محتاج زيادة |
| best-deeds.js | 20 عمل | ⚠️ محتاج زيادة |
| names-of-allah.js | 99 اسم | ✅ مكتمل |
| azkar-widget.html | 147 عنصر | ✅ تم التحديث |

---

## 2. التعديلات اللي اتعملت اليوم

### 2.1 تصغير مربع الشاشة (azkar-widget.html)
- ارتفاع BrowserWindow: `340px` → `180px`
- الخط: `18px` → `14px`
- padding: `16px` → `8px`
- source/hint: `display:none`

### 2.2 الكارت العائم (DhikrNotification.jsx)
- عرض: `260px` → `200px`
- padding: `16px` → `4px`
- max-height النص: `300px` → `40px`
- source/hint: `display:none`
- أزرار صغيرة: `16px`

### 2.3 زر التصغير (Minimize)
- زر `─` جديد بجانب زر الإغلاق
- لما تضغط يصغر لأيقونة 40px فيها الإيموجي
- الضغط على الأيقونة يرجع الكارت كامل

### 2.4 الـ Default Interval
- من `30` دقيقة → `60` دقيقة

### 2.5 محتوى جديد
- 150 حديث صحيح (بدون تكرار) في hourly-hadiths.js
- 80 ذكر/حديث جديد في azkar-widget.html
- إجمالي المحتوى: 147 عنصر في مربع الشاشة

---

## 3. المطلوب في التحديث الجاي

### 3.1 أذكار الصباح (morning-azkar.js)
- [ ] مراجعة الأذكار الحالية
- [ ] إضافة أذكار ناقصة من السنة الصحيحة
- [ ] التأكد من صحة الأسانيد

### 3.2 أذكار المساء (evening-azkar.js)
- [ ] مراجعة الأذكار الحالية
- [ ] إضافة أذكار ناقصة

### 3.3 أذكار بعد الصلاة (after-prayer-azkar.js)
- [ ] مراجعة وتوسيع القائمة

### 3.4 سلوك المسلم (behavior-hadiths.js)
- [ ] زيادة من 20 إلى 50 حديث على الأقل
- [ ] إضافة فئات: السفر، الطعام، النكاح، تربية الأبناء

### 3.5 أفضل الأعمال (best-deeds.js)
- [ ] زيادة من 20 إلى 40 عمل على الأقل
- [ ] إضافة فئات جديدة

### 3.6 محتوى mabna al-shasha (azkar-widget.html)
- [ ] مراجعة الأذكار المضافة حديثاً
- [ ] إضافة أدعية متنوعة
- [ ] إضافة أذكار مخصصة لل睡 trước النوم

---

## 4. ملاحظات تقنية

- `isDev = false` في main.cjs — لازم يفضل كده للـ production
- `webSecurity = false` — مطلوب لـ audio/CSP
- Firebase لسه placeholder — محتاج credentials حقيقية
- Adhan library مش متاح في main.cjs (ESM only)
- Edge TTS متوفر:System level via Python script

---

## 5. أوامر مهمة

```bash
# Build للإنتاج
npm run build

# Build installer
npm run electron:build

# Build directory فقط (بدون installer)
npm run electron:build:dir
```

---

## 6. نسخ الـ Installer

```powershell
# نسخ للديسك توب
Copy-Item "release\تطبيق الأذكار الإسلامية Setup 1.0.0.exe" "$env:USERPROFILE\Desktop\" -Force
```
