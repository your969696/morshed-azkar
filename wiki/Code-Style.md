# أسلوب الكود | Code Style

## نظرة عامة

يتبع المشروع أسلوب كود موحد لضمان التناسق.

---

## JavaScript/JSX

### الإظهار
- استخدم **2 مسافات** للإظهار
- لا تستخدم Tab

### الأسماء
- **camelCase** للمتغيرات والدوال:
  ```javascript
  const prayerTimes = {};
  function getPrayerTimes() {}
  ```

- **PascalCase** للمكونات:
  ```jsx
  function MyComponent() {}
  const PrayerCard = () => {};
  ```

- **UPPER_CASE** للثوابت:
  ```javascript
  const API_URL = 'https://api.example.com';
  ```

### النصوص
- استخدم **Template Literals**:
  ```javascript
  const message = `مرحباً ${name}`;
  ```

- استخدم **Destructuring**:
  ```javascript
  const { name, age } = user;
  const [count, setCount] = useState(0);
  ```

### الدوال
- اكتب أسماء واضحة ومختصرة:
  ```javascript
  // ✅ جيد
  function getPrayerTimes() {}
  function formatTime() {}
  
  // ✗ سيء
  function pt() {}
  function f() {}
  ```

---

## CSS/Tailwind

### Tailwind Classes
- استخدم أسماء واضحة:
  ```jsx
  <div className="bg-white rounded-lg shadow-md p-4">
  ```

- تجنب التكرار:
  ```jsx
  // ✅ جيد
  <div className="btn btn-primary">
  
  // ✗ سيء
  <div className="bg-blue-500 text-white px-4 py-2 rounded">
  ```

---

## المكونات

### هيكل المكون

```jsx
import React from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  // Logic here
  
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
};

export default MyComponent;
```

### Props
- استخدم أسماء واضحة:
  ```jsx
  // ✅ جيد
  <PrayerCard name="Fajr" time="5:00 AM" />
  
  // ✗ سيء
  <PrayerCard n="F" t="5:00" />
  ```

---

## التعليقات

### التعليقات العربية
```javascript
// حساب أوقات الصلاة
function getPrayerTimes() {
  // ...
}
```

### التعليقات الإنجليزية
```javascript
// Calculate prayer times
function getPrayerTimes() {
  // ...
}
```

---

## الأخطاء الشائعة لتجنّبها

### ❌ عدم استخدام Keys في القوائم
```jsx
// ✗ سيء
{items.map(item => <li>{item.name}</li>)}

// ✅ جيد
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

### ❌ عدم استخدام Optional Chaining
```jsx
// ✗ سيء
const name = user && user.profile && user.profile.name;

// ✅ جيد
const name = user?.profile?.name;
```

### ❌ عدم استخدام Nullish Coalescing
```jsx
// ✗ سيء
const name = user.name || 'Unknown';

// ✅ جيد
const name = user.name ?? 'Unknown';
```

---

**الصفحة السابقة:** [المساهمة](Contributing)
**الصفحة التالية:** [الإبلاغ عن أخطاء](Reporting-Bugs)
