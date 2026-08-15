# الأمان | Security

## نظرة عامة

نأخذ الأمان على محمل الجد. إذا وجدت ثغرة أمنية، يرجى الإبلاغ عنها بشكل مسؤول.

---

## سياسة الأمان

### الإبلاغ عن الثغرات

1. **لا تنشر الثغرة علناً** - يرجى إرسال تقرير خاص
2. **أرسل تقريراً مفصلاً** - وصف الثغرة وكيفية استغلالها
3. **انتظر الرد** - سنقوم بمراجعة التقرير والرد عليك

### كيف تبلغ عن ثغرة

1. افتح issue جديد على GitHub
2. اختر نوع **Security**
3. اكتب وصفاً مفصلاً للثغرة
4. أضف خطوات إعادة الإنتاج

### أين تبلغ

- **GitHub:** [Security Advisories](https://github.com/your969696/morshed-azkar/security/advisories/new)
- **Email:** [your969696@users.noreply.github.com](mailto:your969696@users.noreply.github.com)

---

## ممارسات الأمان

### تطوير الكود

- **تنقيح المدخلات** - تحقق من جميع مدخلات المستخدم
- **استخدام HTTPS** - استخدم HTTPS لجميع الاتصالات
- **تشفير البيانات** - شفر البيانات الحساسة
- **تحديث التبعيات** - حدث التبعيات بانتظام

### نشر التطبيق

- **توقيع التطبيق** - وقّع التطبيق بشهادة رقمية
- **فحص الأخطاء** - فحص الأخطاء قبل النشر
- **مراقبة الأداء** - راقب أداء التطبيق

---

## الإعدادات الأمنية

### Content Security Policy (CSP)

يحتوي التطبيق على CSP لمنع الهجمات:

```javascript
// electron/main.cjs
const CSP = `
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: file:;
  media-src 'self' file: *.mp3 *.m4a;
  connect-src 'self' https://api.aladhan.com;
`;
```

### التخزين المحلي

- **localStorage** - للبيانات غير الحساسة
- **SessionStorage** - للبيانات المؤقتة

---

## الإصدارات الأمنية

### الإصدار 1.0.0

- ✅ تطبيق CSP
- ✅ تشفير البيانات
- ✅ حماية XSS
- ✅ حماية CSRF

---

## المساهمة في الأمان

إذا كنت ترغب في المساهمة في تحسين الأمان:

1. راجع [الIssues المفتوحة](https://github.com/your969696/morshed-azkar/issues?q=label%3Asecurity)
2. ساهم في تحسين الكود
3. أبلغ عن الثغرات

---

## مراجع

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [React Security](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks)

---

**الصفحة السابقة:** [الخطة المستقبلية](Roadmap)
**الصفحة التالية:** [الشكر والتقدير](Acknowledgments)
