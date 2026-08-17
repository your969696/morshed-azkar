# تحديث GitHub Token

## المشكلة

GitHub Token الحالي لا يحتوي على scope `workflow` المطلوب لرفع ملفات CI/CD.

## الحل

### الخطوة 1: إنشاء Token جديد

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **Generate new token**
3. اختر **Generate new token (classic)**
4. اكتب وصفاً: `morshed-azkar-workflows`
5. اختر مدة الصلاحية: **90 days** أو **No expiration**
6. حدد الصلاحيات التالية:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `gist` (Create gists)
   - ✅ `read:org` (Read organization membership)
7. اضغط **Generate token**
8. انسخ الـ Token

### الخطوة 2: تحديث Token في gh CLI

```powershell
# تسجيل الخروج
& "$env:TEMP\gh\bin\gh.exe" auth logout

# تسجيل الدخول بال Token الجديد
& "$env:TEMP\gh\bin\gh.exe" auth login --with-token
```

### الخطوة 3: تحديث Git credentials

```powershell
# حذف الـ credentials القديمة
git config --global --unset credential.helper

# إعداد الـ credentials الجديد
git config --global credential.helper store
```

### الخطوة 4: إعادة محاولة الـ Push

```powershell
cd "C:\Users\Hatem\Documents\azkar-app"
git push origin main
```

---

## بديل: رفع يدوي من GitHub

إذا لم ترغب في تحديث Token، يمكنك رفع الملفات يدوياً:

1. اذهب إلى: https://github.com/your969696/morshed-azkar
2. اضغط على زر **Add file** → **Upload files**
3. اسحب الملفات التالية:
   - `.github/workflows/build.yml`
   - `.github/workflows/test.yml`
   - `.github/workflows/release.yml`
4. اضغط **Commit changes**
