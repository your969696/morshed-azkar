# النشر | Deployment

## نظرة عامة

يحتوي هذا الملف على دليل نشر تطبيق مرشد أذكار.

---

## خطوات النشر

### 1. التحقق من الجودة

```bash
# فحص ESLint
npm run lint

# بناء التطبيق
npm run build

# اختبار التطبيق
npm run preview
```

### 2. تحديث الإصدار

#### تعديل package.json

```json
{
  "version": "1.0.1"
}
```

#### تعديل CHANGELOG.md

```markdown
## الإصدار 1.0.1 (التاريخ)

### التحسينات
- تحسين الأداء
- إصلاح الأخطاء

### إصلاحات
- إصلاح خطأ في [المشكلة]
```

### 3. حفظ التغييرات

```bash
# إضافة التغييرات
git add .

# حفظ التغييرات
git commit -m "تحديث: الإصدار 1.0.1"

# رفع التغييرات
git push origin main
```

---

## نشر على GitHub

### إنشاء Release

1. اذهب إلى صفحة الإصدارات على GitHub:
   [https://github.com/your969696/morshed-azkar/releases](https://github.com/your969696/morshed-azkar/releases)

2. اضغط **Create a new release**

3. اختر الـ Tag:
   - اضغط **Choose a tag**
   - اكتب اسم الـ Tag: `v1.0.1`
   - اضغط **Create new tag**

4. اكتب ملاحظات الإصدار:
   - **Title:** `الإصدار 1.0.1`
   - **Description:** وصف التغييرات

5. ارفع ملف التثبيت:
   - اضغط **Attach binaries**
   - اختر ملف `.exe`

6. اضغط **Publish release**

---

## نشر على مواقع أخرى

### Microsoft Store

1. أنشئ حساب مطور على [Microsoft Store](https://partner.microsoft.com/)
2. أرسل التطبيق للمراجعة
3. انتظر الموافقة
4. انشر التطبيق

### حسابك الشخصي

1. أنشئ صفحة ويب
2. ارفع ملف التثبيت
3. شارك الرابط

---

## النشر التلقائي (CI/CD)

### GitHub Actions

#### ملف .github/workflows/build.yml

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Build Electron
      run: npm run electron:build
      
    - name: Upload Release
      uses: softprops/action-gh-release@v1
      with:
        files: release/*.exe
```

---

## معايير النشر

### قبل النشر

- [ ] تم فحص ESLint بنجاح
- [ ] تم بناء التطبيق بنجاح
- [ ] تم اختبار التطبيق يدوياً
- [ ] تم تحديث CHANGELOG.md
- [ ] تم تحديث الإصدار في package.json
- [ ] تم حفظ التغييرات في Git

### أثناء النشر

- [ ] تم إنشاء Tag
- [ ] تم إنشاء Release
- [ ] تم رفع ملف التثبيت
- [ ] تم كتابة ملاحظات الإصدار

### بعد النشر

- [ ] تم اختبار التحميل
- [ ] تم اختبار التثبيت
- [ ] تم اختبار التطبيق
- [ ] تم الإعلان عن الإصدار

---

## حل المشاكل

### المشكلة: فشل البناء

```bash
# الحل: مراجعة سجل الأخطاء
npm run build 2>&1 | tee build.log
```

### المشكلة: فشل الرفع

```bash
# الحل: التحقق من الصلاحيات
git remote -v
git push origin main
```

### المشكلة: ملف التثبيت كبير جداً

```bash
# الحل: تقليل الحجم
npm run build -- --minify
```

---

## ملاحظات مهمة

1. **اختبر التطبيق** قبل النشر
2. **اكتب ملاحظات واضحة** للإصدار
3. **ahrif ملف التثبيت** قبل الرفع
4. **تابع مشكلات المستخدمين** بعد النشر

---

**المرجع:** [BUILD_GUIDE.md](BUILD_GUIDE.md) | [RELEASING.md](Releases.md)
